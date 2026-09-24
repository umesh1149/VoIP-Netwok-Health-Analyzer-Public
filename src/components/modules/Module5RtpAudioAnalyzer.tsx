import React, { useState } from 'react';
import { CompleteVoipOfficeAnalysis } from '../../types/diagnostic';
import { Radio, ArrowUpRight, ArrowDownLeft, AlertTriangle, AlertOctagon, CheckCircle2, Waves, Activity, Cpu, ShieldAlert, Sparkles } from 'lucide-react';

interface Module5RtpAudioAnalyzerProps {
  analysis: CompleteVoipOfficeAnalysis;
}

export const Module5RtpAudioAnalyzer: React.FC<Module5RtpAudioAnalyzerProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'dual_stream' | 'graphs' | 'sequence' | 'codec' | 'jitter_buffer'>('dual_stream');

  const s0 = analysis.stream0Upload;
  const s1 = analysis.stream1Download;
  const seq = analysis.sequenceSamples;
  const codec = analysis.codec;
  const presence = analysis.audioPresence;
  const jb = analysis.jitterBuffer;

  // Directional comparison verdict
  const isDownloadIssue = s1.lossPercent > s0.lossPercent || s1.avgJitterMs > s0.avgJitterMs * 2;

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Module 5: RTP / Audio Analyzer</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                CORE VOIP ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bidirectional RTP Stream 0 & 1 capture, jitter buffer underruns, packet gaps, and codec verification
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('dual_stream')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'dual_stream' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual RTP Streams
          </button>
          <button
            onClick={() => setActiveTab('graphs')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'graphs' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RTP Loss & Jitter Graphs
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'sequence' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sequence Gap Tracker
          </button>
          <button
            onClick={() => setActiveTab('codec')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'codec' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Codec & Audio Presence
          </button>
          <button
            onClick={() => setActiveTab('jitter_buffer')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeTab === 'jitter_buffer' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Jitter Buffer & PLC
          </button>
        </div>
      </div>

      {/* Critical Presence Alarms (One-Way or No Audio) */}
      {presence.oneWayAudio && (
        <div className="p-4 bg-rose-500/20 border-2 border-rose-500 rounded-2xl text-xs text-rose-100 flex items-start gap-3 animate-pulse">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white text-sm block">ONE-WAY AUDIO DETECTED!</span>
            <span>{presence.oneWayDescription}</span>
          </div>
        </div>
      )}

      {presence.noAudioDetected && (
        <div className="p-4 bg-rose-500/20 border-2 border-rose-500 rounded-2xl text-xs text-rose-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white text-sm block">NO AUDIO DETECTED (0 RTP PACKETS)</span>
            <span>Call established successfully via SIP (200 OK + ACK), but zero RTP media arrived. Probable causes:</span>
            <ul className="list-disc list-inside text-rose-200/90 pl-1 space-y-0.5">
              {presence.noAudioRootCauses?.map((cause, i) => (
                <li key={i}>{cause}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Directional Network Distinction Banner (Checkpoint 31) */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          isDownloadIssue
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <Activity className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-white uppercase tracking-wider block">
            Directional Network Asymmetry Analysis (Checkpoint 31):
          </span>
          <span className="leading-relaxed">
            {isDownloadIssue
              ? `The problem is predominantly in the VoIP-to-PC (Download) direction (Download Loss: ${s1.lossPercent}% vs Upload Loss: ${s0.lossPercent}%; Download Jitter: ${s1.avgJitterMs}ms vs Upload Jitter: ${s0.avgJitterMs}ms). The customer hears choppy incoming audio, while remote callers hear the customer clearly.`
              : 'Both upload and download RTP streams are balanced within normal bounds.'}
          </span>
        </div>
      </div>

      {/* 1. Dual Stream Comparison Table (Checkpoint 7) */}
      {activeTab === 'dual_stream' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* RTP Stream 0: PC -> Server (Upload) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold font-mono text-xs">
                  S0
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-blue-400" /> RTP Stream 0: PC → Server (Upload)
                  </h3>
                  <span className="text-[10px] text-slate-400">Outbound Media Telemetry</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  s0.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {s0.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Packets Received</span>
                <span className="text-sm font-bold text-white">{s0.packetsReceived.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">of {s0.packetsExpected.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Packets Lost</span>
                <span className={`text-sm font-bold ${s0.packetsLost > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {s0.packetsLost} ({s0.lossPercent}%)
                </span>
                <span className="text-[10px] text-slate-500 block">Target &lt; 1%</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Avg Jitter</span>
                <span className="text-sm font-bold text-white">{s0.avgJitterMs} ms</span>
                <span className="text-[10px] text-slate-500 block">Max: {s0.maxJitterMs} ms</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Packet Timing Delta</span>
                <span className="text-sm font-bold text-white">{s0.meanDeltaMs} ms</span>
                <span className="text-[10px] text-slate-500 block">Min/Max: {s0.minDeltaMs}/{s0.maxDeltaMs}ms</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Out of Order / Dups</span>
                <span className="text-xs text-slate-300">{s0.outOfOrder} OO / {s0.duplicatePackets} Dup</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Timestamp Gaps</span>
                <span className="text-xs text-slate-300">{s0.timestampGaps} gap(s)</span>
              </div>
            </div>
          </div>

          {/* RTP Stream 1: Server -> PC (Download) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold font-mono text-xs">
                  S1
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ArrowDownLeft className="w-4 h-4 text-purple-400" /> RTP Stream 1: Server → PC (Download)
                  </h3>
                  <span className="text-[10px] text-slate-400">Inbound Media Telemetry</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  s1.status === 'PASS'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : s1.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {s1.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Packets Received</span>
                <span className="text-sm font-bold text-white">{s1.packetsReceived.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">of {s1.packetsExpected.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Packets Lost</span>
                <span className={`text-sm font-bold ${s1.packetsLost > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {s1.packetsLost} ({s1.lossPercent}%)
                </span>
                <span className="text-[10px] text-slate-500 block">Degraded threshold</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Avg Jitter</span>
                <span className="text-sm font-bold text-amber-400">{s1.avgJitterMs} ms</span>
                <span className="text-[10px] text-slate-500 block">Max: {s1.maxJitterMs} ms</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Packet Timing Delta</span>
                <span className="text-sm font-bold text-white">{s1.meanDeltaMs} ms</span>
                <span className="text-[10px] text-slate-500 block">Max Delta: {s1.maxDeltaMs} ms</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Out of Order / Dups</span>
                <span className="text-xs text-amber-300 font-bold">{s1.outOfOrder} OO / {s1.duplicatePackets} Dup</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Timestamp Gaps</span>
                <span className="text-xs text-rose-400 font-bold">{s1.timestampGaps} gap(s) detected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Graphical RTP Analysis (Checkpoint 8) */}
      {activeTab === 'graphs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Packet Loss Graph */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-white">Packet Loss % Over Call Duration</span>
              <span className="text-[10px] font-mono text-amber-400">Peak Loss: 12% @ 17:20:31</span>
            </div>

            {/* Visual Loss ASCII Bar Representation matching prompt */}
            <div className="p-4 bg-black/60 rounded-xl font-mono text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">12% |</span>
                <div className="w-3/4 h-2 bg-transparent flex items-center">
                  <span className="ml-[60%] text-rose-400 font-bold">█</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">8% |</span>
                <div className="w-3/4 h-2 bg-transparent flex items-center">
                  <span className="ml-[54%] text-amber-400 font-bold">█</span>
                  <span className="ml-[6%] text-rose-400 font-bold">█</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">4% |</span>
                <div className="w-3/4 h-2 bg-transparent flex items-center">
                  <span className="ml-[48%] text-amber-400 font-bold">█</span>
                  <span className="ml-[6%] text-amber-400 font-bold">█</span>
                  <span className="ml-[6%] text-rose-400 font-bold">█</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">0% |</span>
                <div className="w-3/4 border-b border-slate-600 text-[10px] text-slate-500 flex justify-between pt-1">
                  <span>0s</span>
                  <span>15s</span>
                  <span>30s (Spike)</span>
                  <span>45s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Downstream packet loss was 0% until second 27, where a 5-second burst caused 8–12% packet drops before recovering.
            </p>
          </div>

          {/* Jitter Graph */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-white">Jitter (ms) Over Call Duration</span>
              <span className="text-[10px] font-mono text-amber-400">Max Jitter: 68.2 ms</span>
            </div>

            <div className="p-4 bg-black/60 rounded-xl font-mono text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">50ms|</span>
                <div className="w-3/4 h-2 flex items-center">
                  <span className="ml-[56%] text-rose-400 font-bold">*</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">30ms|</span>
                <div className="w-3/4 h-2 flex items-center">
                  <span className="ml-[50%] text-amber-400 font-bold">*</span>
                  <span className="ml-[6%] text-rose-400 font-bold">*</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">10ms|</span>
                <div className="w-3/4 h-2 flex items-center">
                  <span className="text-emerald-400">* * * *</span>
                  <span className="ml-[30%] text-amber-400 font-bold">*</span>
                  <span className="ml-[10%] text-emerald-400">* * *</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-slate-500">0ms |</span>
                <div className="w-3/4 border-b border-slate-600 text-[10px] text-slate-500 flex justify-between pt-1">
                  <span>0s</span>
                  <span>15s</span>
                  <span>30s</span>
                  <span>45s</span>
                  <span>60s</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Arrival jitter remained under 3ms until the downstream congestion event spiked jitter to 42–68ms.
            </p>
          </div>
        </div>
      )}

      {/* 3. RTP Sequence Tracker (Demonstrating packet gap tracking from prompt) */}
      {activeTab === 'sequence' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-400" /> RTP Packet Sequence Gap Inspector
              </h3>
              <p className="text-[11px] text-slate-400">
                Track sequential 16-bit RTP sequence numbers to pinpoint exact burst drops and out-of-order deliveries
              </p>
            </div>
            <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
              2 Consecutive Packets Dropped
            </span>
          </div>

          <div className="p-3 bg-black/40 rounded-xl text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">Sequence Gap Example from Prompt:</span>
            Packets <span className="font-mono text-blue-400">10001, 10002, 10003, 10004</span> were received in order (20ms delta).
            Next received packet was <span className="font-mono text-blue-400">10007</span> with delta 60.4ms.
            Therefore: <span className="font-mono text-rose-400 font-bold">10005 LOST</span> and <span className="font-mono text-rose-400 font-bold">10006 LOST</span> (40ms speech gap).
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 font-mono text-xs">
            {seq.map((pkt) => (
              <div
                key={pkt.seq}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  pkt.status === 'OK'
                    ? 'bg-black/40 border-white/10 text-slate-200'
                    : pkt.status === 'LOST'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse font-bold'
                    : pkt.status === 'OUT_OF_ORDER'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-purple-500/20 border-purple-500 text-purple-300'
                }`}
              >
                <span className="text-[10px] text-slate-400 uppercase">{pkt.status}</span>
                <span className="text-base font-bold my-0.5">{pkt.seq}</span>
                <span className="text-[10px] text-slate-400">{pkt.deltaMs} ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Codec Analysis (Checkpoint 10) */}
      {activeTab === 'codec' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" /> Active VoIP Codec Parameters
              </span>
              <span className="text-[10px] font-mono text-emerald-400">G.711u / PCMU</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Negotiated Codec</span>
                <span className="text-white font-bold">{codec.name}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">RTP Payload Type</span>
                <span className="text-blue-400 font-bold">PT {codec.payloadType} (Standard)</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Packetization Interval</span>
                <span className="text-white font-bold">{codec.packetizationMs} ms (50 pps)</span>
              </div>
              <div className="p-2.5 rounded bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Clock Rate</span>
                <span className="text-white font-bold">{codec.clockRateHz} Hz (Narrowband)</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <div>• Codec Mismatch: <span className="text-emerald-400 font-bold">NO</span></div>
              <div>• Payload Type Mismatch: <span className="text-emerald-400 font-bold">NO</span></div>
              <div>• In-Transit Transcoding: <span className="text-emerald-400 font-bold">Direct Pass-through</span></div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" /> Supported Codec Capability Matrix
              </span>
              <span className="text-[10px] font-mono text-slate-400">PBXware Profile</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              {[
                { name: 'G.711 μ-law (PCMU)', pt: 0, clock: '8000 Hz', bw: '64 kbps', status: 'ACTIVE / OPTIMAL' },
                { name: 'G.711 A-law (PCMA)', pt: 8, clock: '8000 Hz', bw: '64 kbps', status: 'SUPPORTED' },
                { name: 'G.729 Annex A', pt: 18, clock: '8000 Hz', bw: '8 kbps', status: 'LICENSED' },
                { name: 'Opus HD Audio', pt: 111, clock: '48000 Hz', bw: '6-510 kbps', status: 'SUPPORTED' },
                { name: 'GSM 06.10', pt: 3, clock: '8000 Hz', bw: '13.2 kbps', status: 'DISABLED' },
              ].map((c) => (
                <div key={c.name} className="flex justify-between p-2 rounded bg-black/40">
                  <span className="text-slate-200">{c.name}</span>
                  <span className={c.status.includes('ACTIVE') ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Jitter Buffer Analysis (Checkpoint 27) */}
      {activeTab === 'jitter_buffer' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> Endpoint Jitter Buffer & PLC Concealment
            </span>
            <span className="text-[10px] font-mono text-slate-400">Adaptive De-jittering</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-black/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">Buffer Size Target</span>
              <span className="text-base font-bold text-white">{jb.bufferSizeMs} ms</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">Buffer Underruns</span>
              <span className="text-base font-bold text-amber-400">{jb.underruns}</span>
              <span className="text-[9px] text-slate-500">Starvation events</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">Late Packets</span>
              <span className="text-base font-bold text-amber-400">{jb.latePackets}</span>
              <span className="text-[9px] text-slate-500">Arrived post-playout</span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">PLC Concealed</span>
              <span className="text-base font-bold text-purple-400">{jb.concealedPacketsPlc}</span>
              <span className="text-[9px] text-slate-500">Synthesized audio</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-300 block mb-1">Diagnostic Impact:</span>
            {jb.impactNote}
          </div>
        </div>
      )}
    </div>
  );
};
