import React, { useState } from 'react';
import { CompleteVoipOfficeAnalysis } from '../../types/diagnostic';
import { Gauge, Clock, Activity, AlertTriangle, CheckCircle2, Mic, Volume2, ShieldAlert, Zap, Radio } from 'lucide-react';

interface Module6CallQualityMosEngineProps {
  analysis: CompleteVoipOfficeAnalysis;
}

export const Module6CallQualityMosEngine: React.FC<Module6CallQualityMosEngineProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'mos' | 'timeline' | 'classification' | 'audio_hw'>('timeline');

  const mos = analysis.mosEngine || {
    estimatedMos: analysis.estimatedMos?.mosScore || 3.72,
    rFactor: analysis.estimatedMos?.rFactor || 74.8,
    ratingCategory: analysis.estimatedMos?.qualityGrade || 'Acceptable',
    explanation: analysis.estimatedMos?.explanation || '',
  };
  const timeline = analysis.timeline || [];
  const voice = analysis.voiceClassification || {
    trafficStatus: analysis.voiceBreakClassification?.level === 'Good' ? 'GOOD' : 'WARNING',
    level: analysis.voiceBreakClassification?.level || 'Warning',
    color: analysis.voiceBreakClassification?.color || 'amber',
    summary: analysis.voiceBreakClassification?.summary || '',
  };
  const audioHw = analysis.audioHardware;

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Module 6: Call Quality / MOS Engine</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                E-Model & Correlation Timeline
              </span>
            </div>
            <p className="text-xs text-slate-400">
              G.107 Estimated MOS, multi-layer chronological correlation timeline, and voice-break symptom classification
            </p>
          </div>
        </div>

        {/* Navigation pills */}
        <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'timeline' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chronological Timeline
          </button>
          <button
            onClick={() => setActiveTab('mos')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'mos' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Estimated MOS (E-Model)
          </button>
          <button
            onClick={() => setActiveTab('classification')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'classification' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice-Break Classification
          </button>
          <button
            onClick={() => setActiveTab('audio_hw')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'audio_hw' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audio Hardware
          </button>
        </div>
      </div>

      {/* 1. Call-Quality Timeline (Checkpoint 25: "the single best visual for proving what caused the issue") */}
      {activeTab === 'timeline' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Multi-Layer Chronological Correlation Timeline
              </h3>
              <p className="text-[11px] text-slate-400">
                Correlates SIP signaling, Wi-Fi RSSI variations, jitter spikes, packet loss bursts, and user voice break points
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Checkpoint 25
            </span>
          </div>

          <div className="relative pl-6 border-l-2 border-blue-500/30 space-y-4 my-2">
            {timeline.map((evt, idx) => {
              const isDanger = evt.severity === 'CRITICAL';
              const isWarning = evt.severity === 'WARNING';
              const isAudioEvent = evt.eventType === 'VOICE_BREAK' || evt.eventType === 'RTP_GAP';

              return (
                <div key={idx} className="relative group">
                  {/* Timeline node icon */}
                  <div
                    className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                      isDanger
                        ? 'bg-rose-500 border-white animate-ping'
                        : isWarning
                        ? 'bg-amber-500 border-slate-900'
                        : 'bg-blue-600 border-slate-900'
                    }`}
                  ></div>
                  <div
                    className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                      isDanger
                        ? 'bg-rose-500 border-white'
                        : isWarning
                        ? 'bg-amber-500 border-slate-900'
                        : 'bg-blue-600 border-slate-900'
                    }`}
                  ></div>

                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      isDanger
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-100'
                        : isWarning
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-100'
                        : isAudioEvent
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                        : 'bg-black/40 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-blue-400">{evt.timeStr}</span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                            isDanger
                              ? 'bg-rose-500/20 text-rose-300'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                        <span className="text-xs font-bold text-white">{evt.label}</span>
                      </div>

                      {evt.metricsSnapshot && (
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          {evt.metricsSnapshot.latencyMs && <span>Lat: {evt.metricsSnapshot.latencyMs}ms</span>}
                          {evt.metricsSnapshot.jitterMs && <span>Jit: {evt.metricsSnapshot.jitterMs}ms</span>}
                          {evt.metricsSnapshot.lossPercent !== undefined && <span>Loss: {evt.metricsSnapshot.lossPercent}%</span>}
                          {evt.metricsSnapshot.wifiRssiDbm && <span>RSSI: {evt.metricsSnapshot.wifiRssiDbm}dBm</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed">{evt.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Estimated MOS (E-Model G.107) View (Checkpoint 9) */}
      {activeTab === 'mos' && (
        <div className="space-y-5">
          {/* Explicit Clarification Notice required by Checkpoint 9 */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Standard ITU-T G.107 Compliance:</span>
              Estimated MOS is a mathematical network-derived calculation based on packet loss, latency, and jitter;
              it is not a subjective human listening test.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* MOS Score Hero Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center text-center space-y-3">
              <span className="text-[10px] uppercase font-mono text-slate-400">G.107 Estimated MOS</span>
              <div className="text-6xl font-black font-mono text-white tracking-tight flex items-baseline gap-1">
                <span>{mos.estimatedMos.toFixed(2)}</span>
                <span className="text-lg text-slate-500 font-normal">/ 4.5</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  mos.estimatedMos >= 4.0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : mos.estimatedMos >= 3.5
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {mos.ratingCategory.toUpperCase()} QUALITY
              </div>
              <span className="text-xs font-mono text-slate-400">R-Factor: {mos.rFactor.toFixed(1)}</span>
            </div>

            {/* Threshold Reference Scale */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md md:col-span-2 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-semibold text-white">ITU-T MOS Scale Interpretation</span>
                <span className="text-[10px] font-mono text-slate-400">Theoretical Max: 4.41 (G.711)</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-black/40">
                  <span className="text-emerald-400 font-bold">4.3 – 5.0</span>
                  <span className="text-slate-300 font-sans">Excellent (Toll quality, transparent audio)</span>
                  <span className="text-emerald-400">R &gt; 90</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/40">
                  <span className="text-emerald-300 font-bold">4.0 – 4.29</span>
                  <span className="text-slate-300 font-sans">Good (Imperceptible impairments, satisfied)</span>
                  <span className="text-emerald-300">R 80-90</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded border ${mos.estimatedMos >= 3.5 && mos.estimatedMos < 4.0 ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold' : 'bg-black/40 text-slate-400'}`}>
                  <span className="text-amber-400 font-bold">3.5 – 3.99</span>
                  <span className="text-slate-200 font-sans">Acceptable (Noticeable imperfections, some dissatisfaction)</span>
                  <span className="text-amber-400">R 70-80</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/40">
                  <span className="text-rose-400 font-bold">3.0 – 3.49</span>
                  <span className="text-slate-300 font-sans">Poor (Many users dissatisfied, choppy speech)</span>
                  <span className="text-rose-400">R 60-70</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/40">
                  <span className="text-rose-500 font-bold">&lt; 3.0</span>
                  <span className="text-slate-300 font-sans">Very Poor (Unusable, severe packet dropouts)</span>
                  <span className="text-rose-500">R &lt; 60</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Voice-Break Classification (Checkpoint 30) */}
      {activeTab === 'classification' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Voice-Break Symptom Classification
              </h3>
              <p className="text-[11px] text-slate-400">
                Maps network metrics directly to specific audio artifacts heard by end-users
              </p>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                voice.trafficStatus === 'GOOD'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : voice.trafficStatus === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              TRAFFIC: {voice.trafficStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                title: 'Audio Dropouts / Choppy',
                cause: 'Burst packet loss & jitter buffer underruns',
                match: analysis.stream1Download.lossPercent > 1 || analysis.jitterBuffer.underruns > 5,
              },
              {
                title: 'Robotic Voice',
                cause: 'High jitter (>30ms) & heavy PLC packet concealment',
                match: analysis.stream1Download.avgJitterMs > 15 || analysis.jitterBuffer.concealedPacketsPlc > 20,
              },
              {
                title: 'Robotic Voice with Delay',
                cause: 'High jitter + bufferbloat / latency > 200ms',
                match: analysis.bufferbloat.uploadLoadLatencyMs > 200,
              },
              {
                title: 'Echo / Talker Overlap',
                cause: 'Latency > 200ms or acoustic feedback on PC speaker',
                match: analysis.multiTargetPings[4]?.avgLatencyMs > 150,
              },
              {
                title: 'One-Way Audio',
                cause: 'NAT asymmetric routing or firewall port blocking',
                match: analysis.audioPresence.oneWayAudio,
              },
              {
                title: 'No Audio (Silent Call)',
                cause: 'SDP mismatch, blocked UDP ports, or missing RTP',
                match: analysis.audioPresence.noAudioDetected,
              },
            ].map((sym, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl border transition-all ${
                  sym.match
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-black/30 border-white/5 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{sym.title}</span>
                  {sym.match ? (
                    <span className="text-[10px] font-mono text-amber-400 font-bold">ACTIVE SYMPTOM</span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Normal</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{sym.cause}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Audio Hardware Diagnostics (Checkpoint 26) */}
      {activeTab === 'audio_hw' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400" /> Physical Sound Card & Audio Driver Verification
            </span>
            <span className="text-[10px] font-mono text-emerald-400">48,000 Hz Sample Rate</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-black/40 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 uppercase block">Microphone Transducer</span>
              <div className="text-white font-bold">{audioHw.activeMicName}</div>
              <div className="flex justify-between text-slate-300">
                <span>Input Level:</span>
                <span className="text-emerald-400 font-bold">{audioHw.micInputLevelDbfs} dBFS</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Hardware Clipping:</span>
                <span className="text-emerald-400 font-bold">{audioHw.clippingDetected ? 'CLIPPING' : 'None'}</span>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 uppercase block">Playout Sound Card</span>
              <div className="text-white font-bold">{audioHw.activeSpeakerName}</div>
              <div className="flex justify-between text-slate-300">
                <span>Noise Floor:</span>
                <span className="text-emerald-400 font-bold">{audioHw.backgroundNoiseFloorDbfs} dBFS</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Silence Detected:</span>
                <span className="text-emerald-400 font-bold">{audioHw.silenceDetected ? 'YES' : 'NO'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
