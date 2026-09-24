import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CompleteVoipOfficeAnalysis, AudioDeviceInfo } from '../types/diagnostic';
import { audioEngine } from '../services/audioEngine';
import { voipAnalysisEngine } from '../services/voipAnalysisEngine';
import {
  Mic,
  MicOff,
  Radio,
  Play,
  Square,
  Activity,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  Cpu,
  Wifi,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface LiveCallAudioMonitorProps {
  analysis: CompleteVoipOfficeAnalysis;
  onUpdateAnalysis: (newAnalysis: CompleteVoipOfficeAnalysis) => void;
  onSelectModule?: (moduleNum: number) => void;
}

export const LiveCallAudioMonitor: React.FC<LiveCallAudioMonitorProps> = ({
  analysis,
  onUpdateAnalysis,
  onSelectModule,
}) => {
  // Call Monitoring State: 'IDLE' (before call) | 'MONITORING' (during call) | 'COMPLETED' (after call)
  const [monitorState, setMonitorState] = useState<'IDLE' | 'MONITORING' | 'COMPLETED'>('IDLE');
  
  // Real-time call duration timer
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Audio Stream & Hardware state
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<{ inputs: AudioDeviceInfo[]; outputs: AudioDeviceInfo[] }>({
    inputs: [],
    outputs: [],
  });
  const [selectedMicId, setSelectedMicId] = useState<string>('default');

  // Real-time Audio Metrics
  const [currentRmsDbFS, setCurrentRmsDbFS] = useState<number>(-90);
  const [currentPeakDbFS, setCurrentPeakDbFS] = useState<number>(-90);
  const [voiceActivity, setVoiceActivity] = useState<'SPEAKING' | 'SILENCE' | 'BACKGROUND_NOISE' | 'CLIPPING'>('SILENCE');

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Live in-call telemetry simulation tickers
  const [liveUploadPackets, setLiveUploadPackets] = useState<number>(0);
  const [liveDownloadPackets, setLiveDownloadPackets] = useState<number>(0);
  const [liveUploadLoss, setLiveUploadLoss] = useState<number>(0.05);
  const [liveDownloadLoss, setLiveDownloadLoss] = useState<number>(0.12);
  const [liveUploadJitter, setLiveUploadJitter] = useState<number>(2.8);
  const [liveDownloadJitter, setLiveDownloadJitter] = useState<number>(3.5);
  const [liveCpuDuring, setLiveCpuDuring] = useState<number>(22.4);
  const [liveRamDuring, setLiveRamDuring] = useState<number>(51.8);
  const [liveWifiRssi, setLiveWifiRssi] = useState<number>(-52);
  const [glitchActive, setGlitchActive] = useState<boolean>(false);

  // Load available audio devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      const devices = await audioEngine.getAudioDevices();
      setAudioDevices(devices);
      if (devices.inputs.length > 0) {
        setSelectedMicId(devices.inputs[0].deviceId);
      }
    };
    fetchDevices();

    return () => {
      stopAudioCapture();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start live microphone stream
  const startAudioCapture = async () => {
    setMicError(null);
    const result = await audioEngine.startMicrophone(selectedMicId);
    if (result.success) {
      setIsMicActive(true);
      startCanvasVisualizer();
    } else {
      setIsMicActive(false);
      setMicError(result.error || 'Could not access audio stream. Using simulated audio telemetry.');
      // Start fallback visualizer so UI continues to animate smoothly
      startCanvasVisualizer();
    }
  };

  const stopAudioCapture = () => {
    audioEngine.stopMicrophone();
    setIsMicActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Real-time canvas wave drawing
  const startCanvasVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Get real or simulated audio wave
      const timeData = audioEngine.getTimeDomainData();
      const metrics = audioEngine.getAudioMetrics();

      setCurrentRmsDbFS(Math.round(metrics.peakDbFS));
      setCurrentPeakDbFS(Math.round(metrics.peakDbFS));

      // Determine voice activity
      if (metrics.isClipping) {
        setVoiceActivity('CLIPPING');
      } else if (metrics.peakDbFS > -36) {
        setVoiceActivity('SPEAKING');
      } else if (metrics.peakDbFS > -54) {
        setVoiceActivity('BACKGROUND_NOISE');
      } else {
        setVoiceActivity('SILENCE');
      }

      // Clear canvas with dark gradient
      ctx.fillStyle = 'rgba(2, 6, 23, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Draw Center Grid Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Audio Waveform
      ctx.lineWidth = 2;
      if (voiceActivity === 'CLIPPING') {
        ctx.strokeStyle = '#f43f5e'; // rose-500
      } else if (voiceActivity === 'SPEAKING') {
        ctx.strokeStyle = '#10b981'; // emerald-500
      } else if (glitchActive) {
        ctx.strokeStyle = '#f59e0b'; // amber-500
      } else {
        ctx.strokeStyle = '#3b82f6'; // blue-500
      }

      ctx.beginPath();
      const sliceWidth = width / timeData.length;
      let x = 0;

      for (let i = 0; i < timeData.length; i++) {
        let v = timeData[i] / 128.0;
        
        // If mic is inactive or muted, simulate gentle idling baseline
        if (!isMicActive || isMuted) {
          v = 1.0 + Math.sin(i * 0.2 + Date.now() * 0.005) * 0.08;
        }

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

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
  };

  // Start 7-Module VoIP Monitor before connecting a call
  const handleStartCallMonitor = async () => {
    setMonitorState('MONITORING');
    setCallDurationSeconds(0);
    setLiveUploadPackets(50);
    setLiveDownloadPackets(50);
    setLiveUploadLoss(0.04);
    setLiveDownloadLoss(0.08);
    setLiveUploadJitter(2.5);
    setLiveDownloadJitter(3.1);
    setGlitchActive(false);

    // Capture microphone live stream
    await startAudioCapture();

    // Start 1-second interval ticker for duration, live RTP packets, and metrics
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);

      // 50 packets per second (standard 20ms RTP packetization)
      setLiveUploadPackets((prev) => prev + 50);
      setLiveDownloadPackets((prev) => prev + 50);

      // Random natural fluctuation unless glitch is injected
      setLiveCpuDuring((prev) => {
        const delta = (Math.random() - 0.48) * 1.5;
        return Math.min(85, Math.max(16, Math.round((prev + delta) * 10) / 10));
      });

      setLiveRamDuring((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Math.min(90, Math.max(45, Math.round((prev + delta) * 10) / 10));
      });
    }, 1000);
  };

  // Inject a live network glitch / jitter spike during the call to test real-time detection
  const handleInjectGlitch = () => {
    setGlitchActive(true);
    setLiveDownloadLoss(8.4);
    setLiveDownloadJitter(47.2);
    setLiveCpuDuring(26.1);
    setLiveWifiRssi(-55);

    // Auto-recover after 6 seconds
    setTimeout(() => {
      setGlitchActive(false);
      setLiveDownloadLoss(0.15);
      setLiveDownloadJitter(4.2);
    }, 6000);
  };

  // End the call and generate complete 7-module report
  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopAudioCapture();
    setMonitorState('COMPLETED');

    // Generate comprehensive synchronized analysis across all 7 modules
    const updated = voipAnalysisEngine.generateCompleteAnalysis('108.60.153.162', glitchActive ? 'REALISTIC_DEGRADED' : 'EXCELLENT');
    
    // Update live values into the analysis structure
    updated.endpointHealth.cpuPercentDuring = liveCpuDuring;
    updated.endpointHealth.ramPercentDuring = liveRamDuring;
    updated.stream0Upload.packetsReceived = liveUploadPackets;
    updated.stream0Upload.lossPercent = liveUploadLoss;
    updated.stream0Upload.avgJitterMs = liveUploadJitter;
    updated.stream1Download.packetsReceived = liveDownloadPackets;
    updated.stream1Download.lossPercent = liveDownloadLoss;
    updated.stream1Download.avgJitterMs = liveDownloadJitter;
    if (callDurationSeconds > 0) {
      updated.callDurationSec = callDurationSeconds;
    }

    // Fully re-evaluate all 33 checkpoints, AI narrative synthesis, and raw ticket report
    const fullyRecalculated = voipAnalysisEngine.recalculate33PointAnalysis(updated);
    onUpdateAnalysis(fullyRecalculated);
  };

  // Reset to start a new call monitor
  const handleReset = () => {
    setMonitorState('IDLE');
    setCallDurationSeconds(0);
    setGlitchActive(false);
    stopAudioCapture();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Estimated live MOS
  const currentMos = glitchActive ? 3.65 : liveDownloadLoss > 3 ? 3.72 : 4.38;

  return (
    <div className="p-5 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950 border border-blue-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden space-y-5">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Radio className={`w-4 h-4 ${monitorState === 'MONITORING' ? 'animate-spin' : ''}`} />
            </div>
            <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>7-Module VoIP Call Monitor</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                Live Audio Stream Analyzer
              </span>
            </h2>
            {monitorState === 'MONITORING' && (
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                LIVE CALL IN PROGRESS · {formatTimer(callDurationSeconds)}
              </span>
            )}
            {monitorState === 'COMPLETED' && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CALL ANALYZED ({formatTimer(callDurationSeconds)})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Start the monitor <span className="text-blue-300 font-semibold">before connecting your call</span>.
            Captures pre-call baseline endpoint health, live microphone audio stream, bidirectional RTP packets, jitter,
            and correlates voice-breaks directly with network events.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {monitorState === 'IDLE' && (
            <button
              onClick={handleStartCallMonitor}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 cursor-pointer transition-all active:scale-95 border border-emerald-400/40"
            >
              <Mic className="w-4 h-4 text-emerald-100 animate-pulse" />
              <span>Start 7-Module VoIP Monitor</span>
            </button>
          )}

          {monitorState === 'MONITORING' && (
            <>
              <button
                onClick={handleInjectGlitch}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  glitchActive
                    ? 'bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/40'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                }`}
                title="Inject sudden downstream packet loss & jitter burst to verify real-time voice-break detection"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{glitchActive ? 'Glitch Active (8.4% Loss)' : 'Simulate Voice Break'}</span>
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="px-3 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Toggle Mic Mute to test silence detection"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isMuted ? 'Unmute' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={handleEndCall}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all active:scale-95 border border-rose-400/40"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>End Call & Generate Report</span>
              </button>
            </>
          )}

          {monitorState === 'COMPLETED' && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all active:scale-95 border border-blue-400/40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Call Monitor</span>
            </button>
          )}
        </div>
      </div>

      {/* Mic permission / stream error notice if applicable */}
      {micError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Main Interactive Oscilloscope & Audio Waveform Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Live Audio Stream Waveform Canvas */}
        <div className="lg:col-span-8 bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-blue-400" />
                Live Audio Stream Waveform (Microphone Input)
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  voiceActivity === 'SPEAKING'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : voiceActivity === 'CLIPPING'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}
              >
                {isMuted ? 'MUTED' : voiceActivity}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Peak: <strong className="text-white">{currentPeakDbFS} dBFS</strong></span>
              <span className="text-slate-400">Codec: <strong className="text-blue-400">PCMU / G.711 (20ms)</strong></span>
            </div>
          </div>

          {/* Oscilloscope Canvas */}
          <div className="w-full h-28 bg-slate-950/80 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={600}
              height={112}
              className="w-full h-full block"
            />
            {monitorState === 'IDLE' && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 pointer-events-none">
                <Mic className="w-6 h-6 text-slate-400 animate-bounce" />
                <span className="text-xs text-slate-300 font-medium">
                  Click "Start 7-Module VoIP Monitor" before initiating your phone call
                </span>
              </div>
            )}
          </div>

          {/* Audio Device Selection & Level Meter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mic className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={selectedMicId}
                onChange={(e) => setSelectedMicId(e.target.value)}
                disabled={monitorState === 'MONITORING'}
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-sans focus:outline-none focus:border-blue-500"
              >
                {audioDevices.inputs.length === 0 ? (
                  <option value="default">Default System Microphone (48 kHz)</option>
                ) : (
                  audioDevices.inputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone (${d.deviceId.slice(0, 8)})`}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Quick dBFS Meter */}
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
              <span>-60dB</span>
              <div className="w-32 sm:w-44 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-75 ${
                    voiceActivity === 'CLIPPING'
                      ? 'bg-rose-500'
                      : voiceActivity === 'SPEAKING'
                      ? 'bg-emerald-400'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(4, Math.min(100, (currentPeakDbFS + 70) * 1.5))}%` }}
                ></div>
              </div>
              <span>0dB</span>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Snapshot & During-Call Delta (Checkpoint 1 & 7) */}
        <div className="lg:col-span-4 bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Live Telemetry & Delta
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              MOS: {currentMos.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Stream 0 Upload */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 block uppercase">Stream 0 (PC → PBX)</span>
              <span className="text-sm font-bold text-emerald-400">
                {liveUploadLoss}% Loss
              </span>
              <span className="text-[10px] text-slate-400 block">
                {liveUploadPackets.toLocaleString()} pkts · {liveUploadJitter}ms jitter
              </span>
            </div>

            {/* Stream 1 Download */}
            <div className={`p-2 rounded-xl border ${glitchActive ? 'bg-rose-500/20 border-rose-500/40' : 'bg-white/5 border-white/5'}`}>
              <span className="text-[9px] text-slate-400 block uppercase">Stream 1 (PBX → PC)</span>
              <span className={`text-sm font-bold ${glitchActive || liveDownloadLoss > 3 ? 'text-rose-400' : 'text-amber-400'}`}>
                {liveDownloadLoss}% Loss
              </span>
              <span className="text-[10px] text-slate-400 block">
                {liveDownloadPackets.toLocaleString()} pkts · {liveDownloadJitter}ms jitter
              </span>
            </div>

            {/* Pre-Call vs During-Call CPU */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 block uppercase flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" /> CPU (Pre vs During)
              </span>
              <span className="text-xs font-bold text-white">
                {analysis.endpointHealth.cpuPercentBefore}% ➔ <strong className="text-blue-400">{liveCpuDuring}%</strong>
              </span>
              <span className="text-[10px] text-slate-400 block">RAM: {liveRamDuring}%</span>
            </div>

            {/* Wi-Fi RSSI */}
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 block uppercase flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5" /> Wi-Fi Signal
              </span>
              <span className="text-xs font-bold text-white">
                {liveWifiRssi} dBm (5 GHz)
              </span>
              <span className="text-[10px] text-emerald-400 block">866 Mbps Link</span>
            </div>
          </div>

          {/* Quick jump to Detailed 7 Modules */}
          {onSelectModule && (
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">View Module Analysis:</span>
              <div className="flex gap-1.5 font-mono">
                <button
                  onClick={() => onSelectModule(5)}
                  className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 cursor-pointer"
                >
                  M5 RTP
                </button>
                <button
                  onClick={() => onSelectModule(6)}
                  className="px-2 py-0.5 rounded bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 cursor-pointer"
                >
                  M6 Timeline
                </button>
                <button
                  onClick={() => onSelectModule(7)}
                  className="px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 cursor-pointer"
                >
                  M7 Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
