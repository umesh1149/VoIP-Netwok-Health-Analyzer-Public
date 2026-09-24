import React, { useState, useEffect } from 'react';
import { CompleteVoipOfficeAnalysis } from '../types/diagnostic';
import { voipAnalysisEngine } from '../services/voipAnalysisEngine';
import { audioEngine } from '../services/audioEngine';
import { LiveCallAudioMonitor } from './LiveCallAudioMonitor';
import { Module1EndpointHealth } from './modules/Module1EndpointHealth';
import { Module2LanWifiDiagnostics } from './modules/Module2LanWifiDiagnostics';
import { Module3WanInternetDiagnostics } from './modules/Module3WanInternetDiagnostics';
import { Module4SipSignalingAnalyzer } from './modules/Module4SipSignalingAnalyzer';
import { Module5RtpAudioAnalyzer } from './modules/Module5RtpAudioAnalyzer';
import { Module6CallQualityMosEngine } from './modules/Module6CallQualityMosEngine';
import { Module7AiDiagnosticReport } from './modules/Module7AiDiagnosticReport';
import {
  Sparkles,
  Cpu,
  Wifi,
  Globe,
  Network,
  Radio,
  Gauge,
  FileText,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Square,
  Waves,
  ArrowRight,
  Volume2,
} from 'lucide-react';

interface VoipOfficeDashboardProps {
  targetHost?: string;
  analysis: CompleteVoipOfficeAnalysis;
  onUpdateAnalysis: (newAnalysis: CompleteVoipOfficeAnalysis) => void;
  onOpenOneClickModal: () => void;
  onNavigateToAudioTab?: () => void;
}

export const VoipOfficeDashboard: React.FC<VoipOfficeDashboardProps> = ({
  targetHost,
  analysis,
  onUpdateAnalysis,
  onOpenOneClickModal,
  onNavigateToAudioTab,
}) => {
  const [activeModule, setActiveModule] = useState<number>(5); // default to Module 5 (RTP / Audio Analyzer - most important)

  // Continuous Audio Capture Session State
  const [isCapturing, setIsCapturing] = useState<boolean>(() => audioEngine.isMicrophoneActive());
  const [captureSeconds, setCaptureSeconds] = useState<number>(0);
  const [livePeakDbFS, setLivePeakDbFS] = useState<number>(-90);
  const [liveNoiseFloorDbFS, setLiveNoiseFloorDbFS] = useState<number>(-72);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureDeviceLabel, setCaptureDeviceLabel] = useState<string>('System Microphone');

  // Sync with global audioEngine continuous capture state
  useEffect(() => {
    setIsCapturing(audioEngine.isMicrophoneActive());
    const unsub = audioEngine.onCaptureStateChange((active) => {
      setIsCapturing(active);
      if (!active) {
        setCaptureSeconds(0);
      }
    });
    return unsub;
  }, []);

  // Timer and live level meter during active recording session
  useEffect(() => {
    let timer: number | null = null;
    let meterInterval: number | null = null;

    if (isCapturing) {
      timer = window.setInterval(() => {
        setCaptureSeconds((prev) => prev + 1);
      }, 1000);

      meterInterval = window.setInterval(() => {
        const metrics = audioEngine.getAudioMetrics();
        setLivePeakDbFS(Math.round(metrics.peakDbFS));
        setLiveNoiseFloorDbFS(Math.round(metrics.noiseFloorDbFS));
      }, 120);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (meterInterval) clearInterval(meterInterval);
    };
  }, [isCapturing]);

  const handleToggleCapture = async () => {
    setCaptureError(null);
    if (isCapturing) {
      audioEngine.stopMicrophone();
      setIsCapturing(false);
      setCaptureSeconds(0);
    } else {
      const res = await audioEngine.startMicrophone();
      if (res.success) {
        setIsCapturing(true);
        setCaptureSeconds(0);
        const devs = await audioEngine.getAudioDevices();
        if (devs.inputs.length > 0) {
          setCaptureDeviceLabel(devs.inputs[0].label || 'Default Microphone');
        }
      } else {
        setCaptureError(res.error || 'Failed to access microphone hardware stream.');
      }
    }
  };

  const formatCaptureTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const modules = [
    { num: 1, title: '1. PC / Endpoint Health', icon: Cpu, badge: 'Hardware' },
    { num: 2, title: '2. LAN / Wi-Fi Diagnostics', icon: Wifi, badge: 'Layer 1/2' },
    { num: 3, title: '3. Internet / WAN Diagnostics', icon: Globe, badge: 'Multi-Target' },
    { num: 4, title: '4. SIP Signaling Analyzer', icon: Network, badge: 'Ladder' },
    { num: 5, title: '5. RTP / Audio Analyzer', icon: Radio, badge: 'Core VoIP' },
    { num: 6, title: '6. Call Quality / MOS Engine', icon: Gauge, badge: 'E-Model' },
    { num: 7, title: '7. AI Diagnostic Report', icon: FileText, badge: 'Ticket' },
  ];

  return (
    <div className="space-y-6">
      {/* Interactive Live Call Audio & 7-Module Monitor Controller */}
      <LiveCallAudioMonitor
        analysis={analysis}
        onUpdateAnalysis={onUpdateAnalysis}
        onSelectModule={setActiveModule}
      />

      {/* Top Level 33-Point Architecture Header */}
      <div className="p-6 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                VoIP Office Network Monitor
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                7 MODULES · 33 CHECKPOINTS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-bold">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                LIVE AUDIO STREAM ANALYZER
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Unified enterprise VoIP diagnostic engine isolating customer LAN vs carrier WAN, SIP signaling call ladder,
              bidirectional RTP upload/download streams, bufferbloat, and G.107 Estimated MOS.
            </p>
          </div>

          {/* Action Launcher Buttons: Start Capture & 1-Click Analyze */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Start / Stop Continuous Audio Stream Recording Session Button */}
            {isCapturing ? (
              <button
                onClick={handleToggleCapture}
                className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-rose-600/30 cursor-pointer transition-all active:scale-95 border border-rose-400/40 animate-pulse"
                title="Stop continuous audio stream recording session"
              >
                <Square className="w-4 h-4 fill-white text-white" />
                <span>Stop Capture ({formatCaptureTime(captureSeconds)})</span>
              </button>
            ) : (
              <button
                onClick={handleToggleCapture}
                className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 cursor-pointer transition-all active:scale-95 border border-emerald-400/40"
                title="Start continuous recording session of the audio stream, piped into AudioHardwareTab"
              >
                <Mic className="w-4 h-4 text-emerald-200 animate-pulse" />
                <span>Start Capture</span>
              </button>
            )}

            <button
              onClick={onOpenOneClickModal}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xl shadow-blue-600/30 cursor-pointer transition-all active:scale-95 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>1-Click Analyze (All 33 Checkpoints)</span>
            </button>
          </div>
        </div>

        {/* Live Audio Stream Piped Strip (Visible while recording session is active) */}
        {isCapturing && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/40 rounded-2xl text-xs font-mono shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="flex flex-wrap items-center gap-2 font-mono">
                <span className="font-bold text-white uppercase tracking-wider">
                  Continuous Stream Recording:
                </span>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                  {formatCaptureTime(captureSeconds)}
                </span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  ({captureDeviceLabel} · 48.0 kHz)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400 text-[10px] uppercase">Level:</span>
                <span className={`font-bold ${livePeakDbFS > -6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {livePeakDbFS} dBFS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400 text-[10px] uppercase">Noise:</span>
                <span className="font-bold text-slate-200">{liveNoiseFloorDbFS} dBFS</span>
              </div>

              {onNavigateToAudioTab && (
                <button
                  onClick={onNavigateToAudioTab}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-blue-600/30 active:scale-95"
                  title="View continuous real-time FFT Spectrum and Waveform Oscilloscope in AudioHardwareTab"
                >
                  <Waves className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
                  <span>View in AudioHardwareTab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Capture Error Banner if microphone access was rejected */}
        {captureError && (
          <div className="flex items-center gap-2.5 p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-200 font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex-1">{captureError}</div>
            <button
              onClick={() => setCaptureError(null)}
              className="text-xs text-rose-400 hover:text-rose-200 px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-white/10 text-xs font-mono">
          <div className="p-2.5 bg-black/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Estimated MOS</span>
            <span className="text-base font-bold text-amber-400">
              {analysis.mosEngine?.estimatedMos?.toFixed(2) || analysis.estimatedMos?.mosScore?.toFixed(2) || '3.72'} / 4.5
            </span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Stream 0 (Upload)</span>
            <span className="text-base font-bold text-emerald-400">
              {analysis.stream0Upload.lossPercent}% Loss · {analysis.stream0Upload.avgJitterMs}ms
            </span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Stream 1 (Download)</span>
            <span className="text-base font-bold text-amber-400">
              {analysis.stream1Download.lossPercent}% Loss · {analysis.stream1Download.avgJitterMs}ms
            </span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Wi-Fi RSSI dBm</span>
            <span className="text-base font-bold text-white">
              {analysis.wifiAnalysis.signalDbm} dBm ({analysis.wifiAnalysis.band})
            </span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">SIP Setup Timing</span>
            <span className="text-base font-bold text-emerald-400">
              {analysis.sipTiming.inviteTo200OkSec}s (200 OK)
            </span>
          </div>
          <div className="p-2.5 bg-black/40 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Bufferbloat Grade</span>
            <span className="text-base font-bold text-white">
              Grade {analysis.bufferbloat.grade} ({analysis.bufferbloat.uploadLoadLatencyMs}ms)
            </span>
          </div>
        </div>
      </div>

      {/* 7-Module Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.num;
          return (
            <button
              key={m.num}
              onClick={() => setActiveModule(m.num)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {m.badge}
                </span>
              </div>
              <div className="font-bold text-xs leading-snug">{m.title}</div>
            </button>
          );
        })}
      </div>

      {/* Render the Selected Module */}
      <div className="animate-in fade-in duration-150">
        {activeModule === 1 && <Module1EndpointHealth analysis={analysis} onUpdateAnalysis={onUpdateAnalysis} />}
        {activeModule === 2 && <Module2LanWifiDiagnostics analysis={analysis} />}
        {activeModule === 3 && <Module3WanInternetDiagnostics analysis={analysis} />}
        {activeModule === 4 && <Module4SipSignalingAnalyzer analysis={analysis} />}
        {activeModule === 5 && <Module5RtpAudioAnalyzer analysis={analysis} />}
        {activeModule === 6 && <Module6CallQualityMosEngine analysis={analysis} />}
        {activeModule === 7 && <Module7AiDiagnosticReport analysis={analysis} onUpdateAnalysis={onUpdateAnalysis} />}
      </div>
    </div>
  );
};

