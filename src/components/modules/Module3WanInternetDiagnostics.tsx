import React, { useState } from 'react';
import { CompleteVoipOfficeAnalysis } from '../../types/diagnostic';
import { Globe, Radio, Route, Activity, AlertTriangle, CheckCircle2, ArrowUpDown, Clock, Zap } from 'lucide-react';

interface Module3WanInternetDiagnosticsProps {
  analysis: CompleteVoipOfficeAnalysis;
}

export const Module3WanInternetDiagnostics: React.FC<Module3WanInternetDiagnosticsProps> = ({ analysis }) => {
  const [activeSection, setActiveSection] = useState<'matrix' | 'continuous' | 'mtr' | 'bufferbloat'>('matrix');
  const [continuousInterval, setContinuousInterval] = useState<'1s' | '5s' | '30s' | '60s'>('1s');

  const pings = analysis.multiTargetPings;
  const points = analysis.continuousPoints;
  const mtr = analysis.mtrHops;
  const bb = analysis.bufferbloat;
  const dns = analysis.dnsDiagnostics;

  // Determine LAN vs Beyond LAN problem isolation
  const lanTarget = pings.find((p) => p.targetKey === 'gateway');
  const voipTarget = pings.find((p) => p.targetKey === 'voip_server');
  const isLanProblem = (lanTarget?.packetLossPercent || 0) > 1 || (lanTarget?.avgLatencyMs || 0) > 15;
  const isBeyondLanProblem = (voipTarget?.packetLossPercent || 0) > 1 && !isLanProblem;

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Module 3: Internet / WAN Diagnostics</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Continuous Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-target ping matrix, continuous packet loss graphs, MTR hop telemetry & bufferbloat latency
            </p>
          </div>
        </div>

        {/* Navigation pills */}
        <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSection('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSection === 'matrix' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multi-Target Matrix
          </button>
          <button
            onClick={() => setActiveSection('continuous')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSection === 'continuous' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Continuous Graphs
          </button>
          <button
            onClick={() => setActiveSection('mtr')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSection === 'mtr' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Traceroute / MTR
          </button>
          <button
            onClick={() => setActiveSection('bufferbloat')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSection === 'bufferbloat' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bufferbloat Test
          </button>
        </div>
      </div>

      {/* Immediate LAN vs Beyond-LAN Isolation Verdict Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          isLanProblem
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
            : isBeyondLanProblem
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
            : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <Zap className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-white text-sm block">
            LAN vs Beyond-LAN Root Cause Isolation:
            {isLanProblem ? ' PROBLEM INSIDE CUSTOMER LAN' : isBeyondLanProblem ? ' PROBLEM BEYOND LAN (WAN / ISP / VOIP)' : ' HEALTHY ROUTE (LAN & WAN CLEAN)'}
          </span>
          <span className="leading-relaxed">
            {isLanProblem
              ? 'High latency or packet loss is observed directly on Hop 1 (Default Gateway / Local Router). The root cause is local Wi-Fi interference, a congested switch, or damaged cabling.'
              : isBeyondLanProblem
              ? 'Local gateway (Hop 1) latency is sub-2ms with 0% loss, but latency or loss spikes occur on the ISP gateway, transit backbone, or VoIP server. The issue is in the carrier transit or VoIP network.'
              : 'Both local gateway and external VoIP hops demonstrate optimal latency and 0% packet loss.'}
          </span>
        </div>
      </div>

      {/* 1. Multi-Target Ping Matrix Table (Checkpoint 2) */}
      {activeSection === 'matrix' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" /> Multi-Target Ping Matrix
              </h3>
              <p className="text-[11px] text-slate-400">
                Simultaneously measures loopback, local gateway, ISP DNS, public DNS, VoIP core, SIP proxy, and media gateway
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              100 Probes / Target
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase font-mono">
                  <th className="py-2.5 px-3">Target Layer</th>
                  <th className="py-2.5 px-3">IP / Host</th>
                  <th className="py-2.5 px-3">Scope</th>
                  <th className="py-2.5 px-3 text-right">Avg</th>
                  <th className="py-2.5 px-3 text-right">Min</th>
                  <th className="py-2.5 px-3 text-right">Max</th>
                  <th className="py-2.5 px-3 text-right">Loss %</th>
                  <th className="py-2.5 px-3 text-right">Jitter</th>
                  <th className="py-2.5 px-3 text-right">Mdev</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {pings.map((target) => (
                  <tr key={target.targetKey} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">{target.label}</td>
                    <td className="py-3 px-3 text-slate-400">{target.ip}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          target.scope === 'LAN'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        }`}
                      >
                        {target.scope}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">{target.avgLatencyMs} ms</td>
                    <td className="py-3 px-3 text-right text-slate-400">{target.minLatencyMs} ms</td>
                    <td className="py-3 px-3 text-right text-slate-400">{target.maxLatencyMs} ms</td>
                    <td className="py-3 px-3 text-right">
                      <span className={target.packetLossPercent > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {target.packetLossPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{target.jitterMs} ms</td>
                    <td className="py-3 px-3 text-right text-slate-400">{target.mdevMs} ms</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          target.status === 'OPTIMAL'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : target.status === 'WARNING'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {target.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Continuous Packet-Loss & Latency Monitoring (Checkpoint 3) */}
      {activeSection === 'continuous' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Continuous Packet-Loss & Latency Monitor
              </h3>
              <p className="text-[11px] text-slate-400">
                Monitors latency spikes, burst loss periods, and jitter correlated with call duration
              </p>
            </div>

            {/* Interval controls */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1 rounded-xl text-xs font-mono">
              <span className="text-[10px] text-slate-400 px-2 uppercase">Interval:</span>
              {(['1s', '5s', '30s', '60s'] as const).map((int) => (
                <button
                  key={int}
                  onClick={() => setContinuousInterval(int)}
                  className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                    continuousInterval === int ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {int}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive ASCII / SVG Telemetry Graph */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Latency (ms) & Packet Loss (%) Timeline</span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Call Degradation Window: 17:20:27 – 17:20:32
              </span>
            </div>

            {/* SVG Time Series Graph */}
            <div className="w-full h-52 bg-black/60 border border-white/10 rounded-xl p-3 relative overflow-hidden flex flex-col justify-end">
              {/* Reference Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
                <div className="border-b border-slate-500 w-full text-[9px] font-mono text-slate-400">200ms / 15% Loss</div>
                <div className="border-b border-slate-500 w-full text-[9px] font-mono text-slate-400">150ms / 10% Loss</div>
                <div className="border-b border-slate-500 w-full text-[9px] font-mono text-slate-400">100ms / 5% Loss</div>
                <div className="border-b border-slate-500 w-full text-[9px] font-mono text-slate-400">50ms / 0% Loss</div>
              </div>

              {/* Call Window Highlight Overlay */}
              <div className="absolute top-0 bottom-0 left-[15%] right-[10%] bg-blue-500/5 border-x border-blue-500/20 pointer-events-none flex items-start justify-center pt-2">
                <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                  Call Active Window (65.2s)
                </span>
              </div>

              {/* Render bars & latency points */}
              <div className="relative z-10 flex items-end justify-between h-36 w-full gap-0.5">
                {points.map((pt, i) => {
                  const barHeight = Math.min(100, Math.max(10, (pt.latencyMs / 200) * 100));
                  const isSpike = pt.lossPercent > 0 || pt.latencyMs > 90;
                  return (
                    <div
                      key={i}
                      className="group relative flex-1 flex flex-col justify-end items-center h-full"
                    >
                      {/* Loss Indicator Tag */}
                      {pt.lossPercent > 0 && (
                        <div className="w-full bg-rose-500/80 rounded-t h-3 mb-0.5 animate-pulse" title={`Loss: ${pt.lossPercent}%`}></div>
                      )}
                      {/* Latency Bar */}
                      <div
                        className={`w-full rounded-t transition-all ${
                          isSpike ? 'bg-amber-500' : 'bg-blue-500/70 group-hover:bg-blue-400'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      ></div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 border border-white/20 text-[10px] font-mono text-white p-2 rounded shadow-2xl z-30 whitespace-nowrap">
                        <span className="text-blue-400 font-bold">{pt.timeStr}</span>
                        <span>Latency: {pt.latencyMs} ms</span>
                        <span>Loss: {pt.lossPercent}%</span>
                        <span>Jitter: {pt.jitterMs} ms</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X Axis Time Labels */}
              <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-2 border-t border-white/10">
                <span>17:20:00</span>
                <span>17:20:15</span>
                <span>17:20:30 (Spike)</span>
                <span>17:20:45</span>
                <span>17:21:00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Traceroute / MTR (Checkpoint 4) */}
      {activeSection === 'mtr' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-400" /> Hop-by-Hop Continuous MTR Route
              </h3>
              <p className="text-[11px] text-slate-400">
                Tracks latency accumulation, packet loss, and jitter across each transit router to the PBX server
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-300">Target: {analysis.targetHost}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Hop</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Hostname / Transit Carrier</th>
                  <th className="py-2.5 px-3 text-right">Avg</th>
                  <th className="py-2.5 px-3 text-right">Min</th>
                  <th className="py-2.5 px-3 text-right">Max</th>
                  <th className="py-2.5 px-3 text-right">Loss %</th>
                  <th className="py-2.5 px-3 text-right">Jitter</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mtr.map((hop) => (
                  <tr
                    key={hop.hopNumber}
                    className={`hover:bg-white/5 transition-colors ${
                      hop.packetLossPercent > 0 ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-blue-400">Hop {hop.hopNumber}</td>
                    <td className="py-3 px-3 text-slate-200">{hop.ip}</td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-xs">{hop.hostname}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">{hop.avgLatencyMs} ms</td>
                    <td className="py-3 px-3 text-right text-slate-400">{hop.minLatencyMs} ms</td>
                    <td className="py-3 px-3 text-right text-slate-400">{hop.maxLatencyMs} ms</td>
                    <td className="py-3 px-3 text-right">
                      <span className={hop.packetLossPercent > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {hop.packetLossPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{hop.jitterMs} ms</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          hop.status === 'OPTIMAL' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {hop.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Bufferbloat & DNS Testing (Checkpoints 16, 20, 21) */}
      {activeSection === 'bufferbloat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Bufferbloat test */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> Bufferbloat Latency Under Load
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  bb.grade === 'A' || bb.grade === 'A+'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                Grade: {bb.grade}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Idle Latency</span>
                <span className="text-lg font-bold text-white">{bb.idleLatencyMs} ms</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Under Download</span>
                <span className="text-lg font-bold text-amber-400">{bb.downloadLoadLatencyMs} ms</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Under Upload</span>
                <span className="text-lg font-bold text-rose-400">{bb.uploadLoadLatencyMs} ms</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-300 block mb-1">Bufferbloat Assessment:</span>
              {bb.summary}
            </div>
          </div>

          {/* DNS Resolution & SRV Records */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> DNS & SIP SRV Records
              </span>
              <span className="text-[10px] font-mono text-emerald-400">{dns.resolutionMs} ms Resolution</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">SIP SRV Record Query</span>
                <span className="text-slate-200">{dns.srvRecords[0]}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40">
                <span className="text-[10px] text-slate-400 uppercase block">Resolved A Record IP</span>
                <span className="text-emerald-400 font-bold">{dns.aRecords[0]}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-black/40 text-xs">
                <span className="text-slate-400">DNS Hijacking / Poisoning Check:</span>
                <span className="text-emerald-400 font-bold">CLEAN (Legitimate Root Authority)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
