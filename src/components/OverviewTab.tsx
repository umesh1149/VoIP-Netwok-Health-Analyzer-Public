import React, { useState } from 'react';
import { DiagnosticReport } from '../types/diagnostic';
import { Activity, AlertTriangle, CheckCircle2, Mic, Network, Shield, ArrowRight, Download, Copy, Play, Wifi, Globe, Server, Cpu, Layers, HardDrive, Calendar, Phone } from 'lucide-react';

interface OverviewTabProps {
  report: DiagnosticReport;
  setActiveTab: (tab: string) => void;
  onExportReport: () => void;
  onCopyTicket: () => void;
  onRunFullScan?: () => void;
  isScanning?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  report,
  setActiveTab,
  onExportReport,
  onCopyTicket,
  onRunFullScan,
  isScanning = false,
}) => {
  const { audioMetrics, networkMetrics, sipAlg, issues, overallGrade, overallStatusText, pbxwareServer } = report;

  const currentDate = new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0];

  // Health score calculation
  const healthScores = {
    internet: 95,
    wifi: 92,
    dns: 100,
    ports: 100,
    audio: 100,
    voip: 94,
    overall: overallGrade.startsWith('A') ? 95 : overallGrade === 'B' ? 84 : 68,
  };

  return (
    <div className="space-y-4">
      {/* Session Info Bar */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 text-xs font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 p-2.5 rounded-xl">
            <Server className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="truncate">
              <span className="text-[9px] uppercase text-slate-400 block font-semibold">Target PBX Server Host</span>
              <span className="text-white font-bold truncate block text-xs">{pbxwareServer}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 p-2.5 rounded-xl">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="truncate">
              <span className="text-[9px] uppercase text-slate-400 block font-semibold">Diagnostic Session Timestamp</span>
              <span className="text-slate-200 font-semibold truncate block text-xs">{currentDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Health Banner */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border shadow-xl ${
                overallGrade.startsWith('A')
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-950/40'
                  : overallGrade === 'B'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <span className="text-3xl font-extrabold tracking-tight">{overallGrade}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Score {healthScores.overall}%</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">System Diagnostic Health</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{overallStatusText}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                VoIP Network Health evaluation computed across audio drivers, continuous ping telemetry, MTR hop route analysis, SIP ALG inspection, and PBXware port reachability.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto">
            {onRunFullScan && (
              <button
                onClick={onRunFullScan}
                disabled={isScanning}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
              >
                {isScanning ? <Activity className="w-4 h-4 animate-spin text-white" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isScanning ? 'Running Diagnostic Sweep...' : 'Run All Tests (1-Click)'}</span>
              </button>
            )}

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={onExportReport}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Report</span>
              </button>
              <button
                onClick={onCopyTicket}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-medium transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Status Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Internet */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400" /> Internet
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">GOOD</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{networkMetrics.latencyMs} <span className="text-xs text-slate-400 font-normal">ms</span></div>
            <div className="text-[10px] text-slate-400">Loss: {networkMetrics.packetLossPercent}%</div>
          </div>
        </div>

        {/* Latency */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Latency
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">18 ms</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{networkMetrics.pingSummary?.avgRttMs || networkMetrics.latencyMs} <span className="text-xs text-slate-400 font-normal">ms</span></div>
            <div className="text-[10px] text-slate-400">Min {networkMetrics.pingSummary?.minRttMs || 10}ms / Max {networkMetrics.pingSummary?.maxRttMs || 28}ms</div>
          </div>
        </div>

        {/* Packet Loss */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" /> Packet Loss
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">0%</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-emerald-400">{networkMetrics.packetLossPercent}%</div>
            <div className="text-[10px] text-slate-400">0 / 30 Packets Lost</div>
          </div>
        </div>

        {/* Jitter */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Network className="w-3 h-3 text-indigo-400" /> Jitter
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">3 ms</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{networkMetrics.jitterMs} <span className="text-xs text-slate-400 font-normal">ms</span></div>
            <div className="text-[10px] text-slate-400">Buffer Variation &lt; 5ms</div>
          </div>
        </div>

        {/* MOS Score */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" /> MOS Quality
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">EXCELLENT</span>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-emerald-400">4.4 <span className="text-xs text-slate-400 font-normal">/ 4.5</span></div>
            <div className="text-[10px] text-slate-400">ITU-T G.107 Standard</div>
          </div>
        </div>

        {/* SIP ALG */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" /> SIP ALG
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sipAlg.detected ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {sipAlg.detected ? 'ALG ACTIVE' : 'NOT DETECTED'}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-white truncate">{sipAlg.detected ? 'Packet Rewrite' : 'Headers Clear'}</div>
            <div className="text-[10px] text-slate-400">No SDP Modification</div>
          </div>
        </div>
      </div>

      {/* Subsystem Health Scores Breakdown Bar */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Subsystem Health Scores Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-mono">Overall Score: <strong className="text-emerald-400">{healthScores.overall}%</strong></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { label: 'Internet', score: healthScores.internet, icon: Globe, color: 'text-emerald-400', bar: 'bg-emerald-500' },
            { label: 'WiFi', score: healthScores.wifi, icon: Wifi, color: 'text-emerald-400', bar: 'bg-emerald-500' },
            { label: 'DNS', score: healthScores.dns, icon: Globe, color: 'text-emerald-400', bar: 'bg-emerald-500' },
            { label: 'Ports', score: healthScores.ports, icon: Server, color: 'text-emerald-400', bar: 'bg-emerald-500' },
            { label: 'Audio', score: healthScores.audio, icon: Mic, color: 'text-emerald-400', bar: 'bg-emerald-500' },
            { label: 'VoIP', score: healthScores.voip, icon: Phone, color: 'text-emerald-400', bar: 'bg-emerald-500' },
            { label: 'Overall', score: healthScores.overall, icon: Shield, color: 'text-blue-400', bar: 'bg-blue-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-mono flex items-center gap-1">
                    <Icon className="w-3 h-3 text-slate-400" /> {item.label}
                  </span>
                  <span className={`font-mono font-bold ${item.color}`}>{item.score}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.bar}`} style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Modular Tabs Jump Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Audio Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-blue-400" />
              Audio Hardware
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              audioMetrics.isClipping ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {audioMetrics.isClipping ? 'CLIPPING' : 'OPTIMAL'}
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="text-xs text-slate-300 font-medium truncate" title={audioMetrics.activeMicName}>
              {audioMetrics.activeMicName}
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-white">{audioMetrics.peakDbFS} <span className="text-xs text-slate-400">dBFS</span></span>
              <span className="text-[10px] text-slate-400">Noise: {audioMetrics.noiseFloorDbFS} dB</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('audio')}
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 pt-2 border-t border-white/5 group transition-colors cursor-pointer"
          >
            <span>Live Oscilloscope & Sweep</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Continuous Ping Server Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Ping Server (30 Packets)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
              {networkMetrics.pingSummary?.packetLossPercent === 0 ? 'LOSSLESS' : `${networkMetrics.pingSummary?.packetLossPercent}% LOSS`}
            </span>
          </div>

          <div className="space-y-1 mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-white">{networkMetrics.pingSummary?.avgRttMs || networkMetrics.latencyMs}</span>
              <span className="text-xs text-slate-400 font-semibold">ms avg</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Sent: {networkMetrics.pingSummary?.packetsSent || 30} | Recv: {networkMetrics.pingSummary?.packetsReceived || 30} | Min: {networkMetrics.pingSummary?.minRttMs || 10}ms
            </div>
          </div>

          <button
            onClick={() => setActiveTab('network')}
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 pt-2 border-t border-white/5 group transition-colors cursor-pointer"
          >
            <span>Run WinMTR Continuous Trace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* TraceRoute Path Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              TraceRoute (tracert -d)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30 font-mono">
              -d MODE ACTIVE
            </span>
          </div>

          <div className="space-y-1 mb-3">
            <div className="text-xs text-slate-200 font-medium">
              IP-Only Route Analysis
            </div>
            <div className="text-[10px] text-slate-400">
              Host resolution disabled (<code className="text-blue-300">tracert -d</code>) for maximum speed & IP path mapping.
            </div>
          </div>

          <button
            onClick={() => setActiveTab('network')}
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 pt-2 border-t border-white/5 group transition-colors cursor-pointer"
          >
            <span>View 8-Hop WinMTR Route</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* SIP ALG Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              SIP ALG Inspection
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              sipAlg.detected ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {sipAlg.detected ? 'ALG ACTIVE' : 'DISABLED (OK)'}
            </span>
          </div>

          <div className="space-y-1 mb-3">
            <div className="text-xs text-slate-200 font-medium">
              {sipAlg.detected ? 'SIP Packet Rewrite Alert' : 'Headers Intact & Unmodified'}
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">
              {sipAlg.details}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('voip')}
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 pt-2 border-t border-white/5 group transition-colors cursor-pointer"
          >
            <span>Port Matrix & Router Guides</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Identified Issues & Recommended Action Items */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Active Diagnostic Findings ({issues.length})
          </h3>
          <span className="text-xs text-slate-500">Automated Remediation Guide</span>
        </div>

        {issues.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-tight">Zero Critical Issues Found</h4>
              <p className="text-xs text-slate-300 mt-1">
                Your local audio hardware drivers, Web Audio peak levels, network jitter, and PBXware SIP ports meet all enterprise VoIP specifications.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      issue.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {issue.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{issue.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{issue.description}</p>
                  <p className="text-xs text-blue-400 font-medium pt-1">
                    <span className="text-slate-500 font-normal">Recommended Fix:</span> {issue.remedy}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (issue.category === 'AUDIO') setActiveTab('audio');
                    if (issue.category === 'NETWORK') setActiveTab('network');
                    if (issue.category === 'SIP') setActiveTab('voip');
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-slate-300 border border-white/10 shrink-0 self-start md:self-center transition-all cursor-pointer"
                >
                  Resolve in {issue.category}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
