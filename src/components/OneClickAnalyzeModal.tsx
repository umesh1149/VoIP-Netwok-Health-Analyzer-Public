import React, { useState, useEffect } from 'react';
import { CompleteVoipOfficeAnalysis } from '../types/diagnostic';
import { voipAnalysisEngine } from '../services/voipAnalysisEngine';
import { Activity, CheckCircle2, Play, Sparkles, X, ShieldAlert, Cpu, Wifi, Globe, Network, Radio, Gauge, FileText } from 'lucide-react';

interface OneClickAnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetHost: string;
  onComplete: (analysis: CompleteVoipOfficeAnalysis) => void;
}

export const OneClickAnalyzeModal: React.FC<OneClickAnalyzeModalProps> = ({
  isOpen,
  onClose,
  targetHost,
  onComplete,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedScenario, setSelectedScenario] = useState<'REALISTIC_DEGRADED' | 'EXCELLENT' | 'ONE_WAY_AUDIO' | 'NO_AUDIO' | 'BUFFERBLOAT' | 'WIFI_DROP'>('REALISTIC_DEGRADED');
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState<string>('Acme Solutions Ltd');
  const [extension, setExtension] = useState<string>('104');

  const stages = [
    { num: 1, name: '1. PC / Endpoint Health', icon: Cpu, desc: 'Capturing Windows build, CPU/RAM/Disk before & during call, NIC power-saving & VPN' },
    { num: 2, name: '2. LAN / Wi-Fi Diagnostics', icon: Wifi, desc: 'Inspecting Wi-Fi RSSI dBm, 2.4/5GHz channel, Ethernet duplex, NAT & IPv6 reachability' },
    { num: 3, name: '3. Internet / WAN Diagnostics', icon: Globe, desc: 'Multi-target continuous ping (Gateway, ISP, VoIP, SIP, RTP) & Bufferbloat test' },
    { num: 4, name: '4. SIP Signaling Analyzer', icon: Network, desc: 'Tracing SIP Registration, Call Ladder sequence (PC ⇄ PBX ⇄ Carrier) & Timing' },
    { num: 5, name: '5. RTP / Audio Analyzer', icon: Radio, desc: 'Capturing dual-direction RTP (Stream 0 Upload vs Stream 1 Download), Jitter & Gaps' },
    { num: 6, name: '6. Call Quality / MOS Engine', icon: Gauge, desc: 'Calculating E-Model Estimated MOS & correlating Call-Quality Event Timeline' },
    { num: 7, name: '7. AI Diagnostic Report', icon: FileText, desc: 'Correlating root-cause telemetry into VOIP OFFICE NETWORK MONITOR master report' },
  ];

  const handleStartAnalysis = async () => {
    setIsRunning(true);
    setCurrentStage(1);
    setLiveLog(['[INIT] Initiating 1-Click Unified VoIP Call Health Analysis...']);

    // Stage 1
    await new Promise((r) => setTimeout(r, 600));
    setLiveLog((prev) => [...prev, '[STAGE 1] Querying Windows build, CPU/RAM utilization before & during call, NIC power-saving states...']);
    setCurrentStage(2);

    // Stage 2
    await new Promise((r) => setTimeout(r, 700));
    setLiveLog((prev) => [...prev, '[STAGE 2] Wi-Fi link speed verified. Checking 2.4/5GHz band, Duplex, NAT translation & IPv6 route...']);
    setCurrentStage(3);

    // Stage 3
    await new Promise((r) => setTimeout(r, 800));
    setLiveLog((prev) => [...prev, `[STAGE 3] Pinging 7 target layers (127.0.0.1, Gateway, ISP DNS, Public DNS, ${targetHost}, SIP, RTP)...`]);
    setLiveLog((prev) => [...prev, '[STAGE 3] Executing continuous packet loss time-series & bufferbloat delta test...']);
    setCurrentStage(4);

    // Stage 4
    await new Promise((r) => setTimeout(r, 700));
    setLiveLog((prev) => [...prev, '[STAGE 4] Generating SIP Call Ladder (INVITE → 100 → 180 → 200 OK → ACK). Verifying SIP ALG...']);
    setCurrentStage(5);

    // Stage 5
    await new Promise((r) => setTimeout(r, 800));
    setLiveLog((prev) => [...prev, '[STAGE 5] Capturing Stream 0 (PC → VoIP) and Stream 1 (VoIP → PC). Analyzing sequence gaps & jitter buffer...']);
    setCurrentStage(6);

    // Stage 6
    await new Promise((r) => setTimeout(r, 700));
    setLiveLog((prev) => [...prev, '[STAGE 6] Correlating Call-Quality Event Timeline against exact call minute. Calculating Estimated MOS...']);
    setCurrentStage(7);

    // Stage 7
    await new Promise((r) => setTimeout(r, 600));
    setLiveLog((prev) => [...prev, '[STAGE 7] Synthesizing AI Root-Cause Diagnostic Report and generating printable ticket...']);

    const finalAnalysis = voipAnalysisEngine.generateCompleteAnalysis(targetHost, selectedScenario, {
      customerName,
      extension,
      callDurationSec: 65.2,
    });

    await new Promise((r) => setTimeout(r, 400));
    setIsRunning(false);
    onComplete(finalAnalysis);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                1-Click VoIP Call Analysis Engine
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  7 Modules · 33 Checkpoints
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end automated diagnostic across PC health, LAN, WAN, SIP ladder, dual RTP streams, MOS & AI report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target & Customer Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400">Target PBX / VoIP Host</span>
              <div className="font-mono font-semibold text-blue-400 truncate">{targetHost}</div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400">Customer / Account</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isRunning}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400">Extension Number</label>
              <input
                type="text"
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                disabled={isRunning}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Scenario Preset Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
              Select Test Scenario / Emulation Mode:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'REALISTIC_DEGRADED', label: 'Intermittent Voice Breaks', desc: 'Downstream 3.75% RTP loss & jitter spike', color: 'border-amber-500/50' },
                { id: 'EXCELLENT', label: 'Healthy VoIP Call', desc: '0% loss, 2ms jitter, MOS 4.4', color: 'border-emerald-500/50' },
                { id: 'ONE_WAY_AUDIO', label: 'One-Way Audio', desc: 'PC transmits RTP, remote receives 0', color: 'border-rose-500/50' },
                { id: 'NO_AUDIO', label: 'No Audio (Silent Call)', desc: 'SIP connects, 0 RTP packets both sides', color: 'border-rose-500/50' },
                { id: 'BUFFERBLOAT', label: 'Bufferbloat / Network Load', desc: 'Latency spikes from 12ms to 250ms under load', color: 'border-purple-500/50' },
                { id: 'WIFI_DROP', label: 'Wi-Fi Signal Interference', desc: 'Weak -78 dBm, channel clash, 4 roaming events', color: 'border-blue-500/50' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenario(sc.id as any)}
                  disabled={isRunning}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedScenario === sc.id
                      ? `${sc.color} bg-blue-500/10 text-white ring-1 ring-blue-500/40`
                      : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-100">{sc.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{sc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 7 Modules Progress Tracker */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Analysis Execution Pipeline
            </span>
            <div className="space-y-1.5">
              {stages.map((st) => {
                const Icon = st.icon;
                const isCurrent = currentStage === st.num;
                const isPassed = currentStage > st.num;
                return (
                  <div
                    key={st.num}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : isPassed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-blue-500 text-white animate-pulse'
                            : isPassed
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{st.name}</div>
                        <div className="text-[10px] text-slate-400 leading-none">{st.desc}</div>
                      </div>
                    </div>
                    <div>
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 animate-spin" /> PROBING
                        </span>
                      )}
                      {isPassed && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          DONE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Diagnostic Terminal Feed */}
          {liveLog.length > 0 && (
            <div className="p-3 bg-black/70 border border-white/10 rounded-xl font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto space-y-1">
              {liveLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 select-none">❯</span>
                  <span className={log.includes('STAGE') ? 'text-blue-300 font-semibold' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-white/10">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Full 33-checkpoint analysis will update all dashboard modules & report.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isRunning}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartAnalysis}
              disabled={isRunning}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all active:scale-95"
            >
              {isRunning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Analyzing All 7 Modules...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start 1-Click Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
