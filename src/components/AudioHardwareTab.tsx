import React, { useEffect, useRef, useState } from 'react';
import { AudioDeviceInfo, AudioMetrics, ToneGeneratorState } from '../types/diagnostic';
import { audioEngine } from '../services/audioEngine';
import { Mic, Volume2, Play, Square, Activity, AlertCircle, RefreshCcw, Sliders, Waves, Radio } from 'lucide-react';

interface AudioHardwareTabProps {
  audioMetrics: AudioMetrics;
  onRefreshMetrics: () => void;
}

export const AudioHardwareTab: React.FC<AudioHardwareTabProps> = ({
  audioMetrics,
  onRefreshMetrics,
}) => {
  const [inputs, setInputs] = useState<AudioDeviceInfo[]>([]);
  const [outputs, setOutputs] = useState<AudioDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [isMicActive, setIsMicActive] = useState<boolean>(() => audioEngine.isMicrophoneActive());
  const lastMetricsTimeRef = useRef<number>(0);

  // Sync with global audioEngine continuous capture state
  useEffect(() => {
    setIsMicActive(audioEngine.isMicrophoneActive());
    const unsub = audioEngine.onCaptureStateChange((active) => {
      setIsMicActive(active);
    });
    return unsub;
  }, []);

  // Canvas refs
  const fftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tone Generator state
  const [toneState, setToneState] = useState<ToneGeneratorState>({
    isPlaying: false,
    frequency: 1000,
    type: 'sine',
    balance: 'both',
    volume: 0.3,
    isSweeping: false,
  });

  // Latency Loopback result
  const [latencyResult, setLatencyResult] = useState<{ delayMs: number; echoRisk: 'LOW' | 'MEDIUM' | 'HIGH'; details: string } | null>(null);
  const [isTestingLatency, setIsTestingLatency] = useState(false);

  // Load hardware devices
  useEffect(() => {
    async function loadDevices() {
      const dev = await audioEngine.getAudioDevices();
      setInputs(dev.inputs);
      setOutputs(dev.outputs);
      if (dev.inputs.length > 0) setSelectedMic(dev.inputs[0].deviceId);
      if (dev.outputs.length > 0) setSelectedSpeaker(dev.outputs[0].deviceId);
    }
    loadDevices();
  }, []);

  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);

  // Handle Microphone activation
  const toggleMicrophone = async () => {
    setMicErrorMsg(null);
    if (isMicActive) {
      audioEngine.stopMicrophone();
      setIsMicActive(false);
    } else {
      const res = await audioEngine.startMicrophone(selectedMic);
      if (res.success) {
        setIsMicActive(true);
        // Re-enumerate hardware devices to obtain actual device labels now that permission is granted
        const dev = await audioEngine.getAudioDevices();
        setInputs(dev.inputs);
        setOutputs(dev.outputs);
        if (dev.inputs.length > 0 && !selectedMic) setSelectedMic(dev.inputs[0].deviceId);
        if (dev.outputs.length > 0 && !selectedSpeaker) setSelectedSpeaker(dev.outputs[0].deviceId);
      } else {
        setIsMicActive(false);
        setMicErrorMsg(res.error || 'Unable to access microphone stream.');
      }
    }
  };

  // Render loop for FFT and Oscilloscope
  useEffect(() => {
    let animId: number;

    const render = () => {
      // 1. Draw FFT Spectrum
      if (fftCanvasRef.current) {
        const canvas = fftCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          const fftData = audioEngine.getFFTFrequencyData();
          const barWidth = (width / fftData.length) - 2;

          for (let i = 0; i < fftData.length; i++) {
            const val = fftData[i];
            const barHeight = (val / 255) * height;

            // Gradient color based on height / clipping
            const grad = ctx.createLinearGradient(0, height, 0, 0);
            if (val > 230) {
              grad.addColorStop(0, '#f87171');
              grad.addColorStop(1, '#ef4444');
            } else {
              grad.addColorStop(0, '#3b82f6');
              grad.addColorStop(1, '#60a5fa');
            }

            ctx.fillStyle = grad;
            ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
          }
        }
      }

      // 2. Draw Time Domain Oscilloscope Waveform
      if (oscCanvasRef.current) {
        const canvas = oscCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          const waveData = audioEngine.getTimeDomainData();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath();

          const sliceWidth = width / waveData.length;
          let x = 0;

          for (let i = 0; i < waveData.length; i++) {
            const v = waveData[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.lineTo(width, height / 2);
          ctx.stroke();
        }
      }

      const now = Date.now();
      if (now - lastMetricsTimeRef.current > 120) {
        lastMetricsTimeRef.current = now;
        onRefreshMetrics();
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [onRefreshMetrics]);

  // Handle Tone Generator controls
  const handleToggleTone = () => {
    if (toneState.isPlaying) {
      audioEngine.stopTone();
      setToneState(prev => ({ ...prev, isPlaying: false, isSweeping: false }));
    } else {
      audioEngine.startTone(toneState.frequency, toneState.type, toneState.balance, toneState.volume);
      setToneState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleFreqChange = (freq: number) => {
    setToneState(prev => ({ ...prev, frequency: freq }));
    audioEngine.setToneFrequency(freq);
  };

  const handleBalanceChange = (bal: 'both' | 'left' | 'right') => {
    setToneState(prev => ({ ...prev, balance: bal }));
    audioEngine.setToneBalance(bal);
  };

  const handleStartSweep = () => {
    setToneState(prev => ({ ...prev, isPlaying: true, isSweeping: true }));
    audioEngine.startFrequencySweep(
      (freq) => setToneState(prev => ({ ...prev, frequency: freq })),
      () => setToneState(prev => ({ ...prev, isPlaying: false, isSweeping: false }))
    );
  };

  const handleRunLatencyTest = async () => {
    setIsTestingLatency(true);
    const res = await audioEngine.runLatencyLoopbackTest();
    setLatencyResult(res);
    setIsTestingLatency(false);
  };

  return (
    <div className="space-y-4">
      {/* Live Continuous Capture Banner if active */}
      {isMicActive && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/40 rounded-2xl text-xs font-mono shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>CONTINUOUS AUDIO STREAM CAPTURE ACTIVE</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  LIVE PIPED STREAM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                Real-time audio stream is actively captured and piped into FFT frequency spectrum & oscilloscope analyzers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Peak Level</span>
              <span className={`font-bold ${audioMetrics.peakDbFS > -6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {Math.round(audioMetrics.peakDbFS)} dBFS
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Noise Floor</span>
              <span className="text-slate-300 font-bold">{Math.round(audioMetrics.noiseFloorDbFS)} dBFS</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Column: Device Selectors & Live Microphone FFT / Oscilloscope */}
      <div className="lg:col-span-7 space-y-4">
        {/* Device Enumeration Panel */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-400" />
              Hardware Device Enumeration
            </h3>
            <button
              onClick={async () => {
                const dev = await audioEngine.getAudioDevices();
                setInputs(dev.inputs);
                setOutputs(dev.outputs);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Refresh connected devices"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Input Selection */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
                Microphone Input Hardware
              </label>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {inputs.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId} className="bg-slate-900 text-slate-200">
                    {mic.label} ({mic.sampleRate ? `${mic.sampleRate / 1000} kHz` : '48 kHz'})
                  </option>
                ))}
              </select>
            </div>

            {/* Output Selection */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
                Speaker / Headset Output
              </label>
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {outputs.map((spk) => (
                  <option key={spk.deviceId} value={spk.deviceId} className="bg-slate-900 text-slate-200">
                    {spk.label} (2-Channel Stereo)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-xs text-slate-400">
              Web Audio API State: <span className={isMicActive ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>{isMicActive ? 'LIVE ANALYSIS ACTIVE' : 'STOPPED'}</span>
            </span>
            <button
              onClick={toggleMicrophone}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isMicActive
                  ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isMicActive ? 'animate-pulse text-red-400' : ''}`} />
              <span>{isMicActive ? 'Stop Microphone Stream' : 'Start Live Mic Analysis'}</span>
            </button>
          </div>

          {micErrorMsg && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Microphone Access Notice</strong>
                <span>{micErrorMsg}</span>
              </div>
            </div>
          )}
        </div>

        {/* Real-Time FFT & Oscilloscope Display */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-4">
          {/* FFT Spectrum */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                FFT Frequency Spectrum (32 Bins)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">20 Hz - 20 kHz</span>
            </div>
            <div className="bg-black/40 rounded-xl p-3 border border-white/5">
              <canvas ref={fftCanvasRef} width={400} height={100} className="w-full h-24 rounded" />
            </div>
          </div>

          {/* Oscilloscope Waveform */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-sky-400" />
                Live Time-Domain Oscilloscope
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Sample Rate: 48.0 kHz</span>
            </div>
            <div className="bg-black/40 rounded-xl p-3 border border-white/5">
              <canvas ref={oscCanvasRef} width={400} height={80} className="w-full h-20 rounded" />
            </div>
          </div>

          {/* Peak Level & Clipping Warnings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Peak Gain Amplitude</div>
              <div className="text-xl font-bold font-mono text-white">{audioMetrics.peakDbFS} <span className="text-xs text-slate-400">dBFS</span></div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${audioMetrics.isClipping ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, Math.max(5, (audioMetrics.peakDbFS + 90) * 1.11))}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase">Estimated Noise Floor</div>
              <div className="text-xl font-bold font-mono text-white">{audioMetrics.noiseFloorDbFS} <span className="text-xs text-slate-400">dBFS</span></div>
              <div className="text-[10px] text-emerald-400">Optimal Range (&lt; -60 dBFS)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Speaker Diagnostics & Latency Loopback */}
      <div className="lg:col-span-5 space-y-4">
        {/* Speaker Sweep & Tone Generator */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              Speaker & Headset Diagnostics
            </h3>
            <span className="text-[10px] text-slate-500">Tone Generator</span>
          </div>

          {/* Frequency Slider */}
          <div className="space-y-2 bg-black/30 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Frequency Output:</span>
              <span className="font-mono text-blue-400 font-bold text-sm">{toneState.frequency} Hz</span>
            </div>
            <input
              type="range"
              min="20"
              max="20000"
              step="10"
              value={toneState.frequency}
              onChange={(e) => handleFreqChange(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>20 Hz (Bass)</span>
              <span>1 kHz (Voice)</span>
              <span>20 kHz (Treble)</span>
            </div>
          </div>

          {/* Channel Stereo Balance (Left / Right) */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-2">
              Stereo Balance Channel Test
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleBalanceChange('left')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  toneState.balance === 'left'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Left Channel
              </button>
              <button
                onClick={() => handleBalanceChange('both')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  toneState.balance === 'both'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Both Channels
              </button>
              <button
                onClick={() => handleBalanceChange('right')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  toneState.balance === 'right'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Right Channel
              </button>
            </div>
          </div>

          {/* Action Tone Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleToggleTone}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                toneState.isPlaying && !toneState.isSweeping
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
              }`}
            >
              {toneState.isPlaying && !toneState.isSweeping ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{toneState.isPlaying && !toneState.isSweeping ? 'Stop Constant Tone' : 'Play Test Tone'}</span>
            </button>

            <button
              onClick={handleStartSweep}
              disabled={toneState.isSweeping}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all disabled:opacity-50"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{toneState.isSweeping ? 'Sweeping 20Hz-20kHz...' : 'Auto Freq Sweep'}</span>
            </button>
          </div>
        </div>

        {/* Audio Driver Buffer Latency & Echo Loopback Test */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Hardware Latency & Echo Loopback
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Echo Cancellation Check</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Measures local sound card driver buffer delay between mic capture and headset output to prevent conversation overlap and acoustic feedback.
          </p>

          {latencyResult && (
            <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Driver Delay: <strong className="text-white font-mono">{latencyResult.delayMs} ms</strong></span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  latencyResult.echoRisk === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  Echo Risk: {latencyResult.echoRisk}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{latencyResult.details}</p>
            </div>
          )}

          <button
            onClick={handleRunLatencyTest}
            disabled={isTestingLatency}
            className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isTestingLatency ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isTestingLatency ? 'Measuring Driver Latency...' : 'Run Audio Loopback Test'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
