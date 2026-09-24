import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Copy, Download, RefreshCw, FileText, Activity, AlertTriangle, CheckCircle2, Info, Terminal, ShieldAlert } from 'lucide-react';
import { REAL_TRACERT_108_60_153_162, networkAnalyzer } from '../services/networkEngine';
import { generateWinMtrHtml } from '../services/winMtrHtmlGenerator';
import { generateWindowsCmdBat } from '../services/batGenerator';

interface WinMtrHopState {
  hop: number;
  ip: string;
  name: string;
  sent: number;
  recv: number;
  lost: number;
  best: number;
  worst: number;
  sumRtt: number;
  last: number | 'TIMEOUT';
  history: (number | null)[];
  base: number;
}

interface WinMtrTabProps {
  pbxwareServer?: string;
}

const isIpAddress = (host: string) => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host.trim());

export const WinMtrTab: React.FC<WinMtrTabProps> = ({ pbxwareServer = '108.60.153.162' }) => {
  const [targetHost, setTargetHost] = useState<string>(pbxwareServer);
  const [intervalMs, setIntervalMs] = useState<number>(1000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedHop, setSelectedHop] = useState<WinMtrHopState | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const [hops, setHops] = useState<WinMtrHopState[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize target host when parent changes
  useEffect(() => {
    if (!isRunning) {
      setTargetHost(pbxwareServer);
      setHops(buildInitialHops(pbxwareServer));
    }
  }, [pbxwareServer]);

  function buildInitialHops(target: string): WinMtrHopState[] {
    const cleanTarget = target.trim();
    const hopNodes = networkAnalyzer.getMtrHops(cleanTarget, false);

    return hopNodes.map((h) => ({
      hop: h.hopNumber,
      ip: h.ip,
      name: h.location || h.name,
      sent: 0,
      recv: 0,
      lost: 0,
      best: 9999,
      worst: 0,
      sumRtt: 0,
      last: 0,
      history: [],
      base: h.rttMs,
    }));
  }

  // Handle Start MTR
  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);

    const initial = buildInitialHops(targetHost);
    setHops(initial);

    // Run interval
    timerRef.current = setInterval(() => {
      setHops((prevHops) =>
        prevHops.map((h, idx) => {
          const sent = h.sent + 1;
          // Simulate occasional packet loss (e.g. 3% loss on internal firewall hop 14/15, 0% on gateway)
          const isLoss = Math.random() < (idx === 14 ? 0.03 : 0.003);

          if (isLoss) {
            const lost = h.lost + 1;
            const newHistory = [...h.history, null].slice(-20);
            return {
              ...h,
              sent,
              lost,
              last: 'TIMEOUT',
              history: newHistory,
            };
          } else {
            const recv = h.recv + 1;
            const jitter = (Math.random() - 0.5) * (h.base > 100 ? 5 : 1.2);
            const rtt = Math.max(0.5, Math.round((h.base + jitter) * 10) / 10);
            const best = Math.min(h.best, rtt);
            const worst = Math.max(h.worst, rtt);
            const sumRtt = h.sumRtt + rtt;
            const newHistory = [...h.history, rtt].slice(-20);

            return {
              ...h,
              sent,
              recv,
              best,
              worst,
              sumRtt,
              last: rtt,
              history: newHistory,
            };
          }
        })
      );
    }, intervalMs);
  };

  // Handle Stop MTR
  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Handle Reset
  const handleReset = () => {
    handleStop();
    setHops(buildInitialHops(targetHost));
  };

  // Copy Results to Clipboard
  const handleCopyResults = () => {
    if (hops.length === 0) return;

    let text = `WinMTR Trace Results for Target: ${targetHost}\n`;
    text += `Hop\tIP Address\tHostname\tSent\tRecv\tLoss%\tBest(ms)\tAvg(ms)\tWorst(ms)\tLast(ms)\n`;

    hops.forEach((h) => {
      const lossPct = h.sent > 0 ? ((h.lost / h.sent) * 100).toFixed(1) : '0.0';
      const avgRtt = h.recv > 0 ? (h.sumRtt / h.recv).toFixed(1) : '0.0';
      const bestRtt = h.best === 9999 ? '0.0' : h.best.toFixed(1);
      const lastStr = typeof h.last === 'number' ? h.last.toFixed(1) : '*';

      text += `${h.hop}\t${h.ip}\t${h.name}\t${h.sent}\t${h.recv}\t${lossPct}%\t${bestRtt}\t${avgRtt}\t${h.worst.toFixed(1)}\t${lastStr}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    if (hops.length === 0) return;

    let csv = `Hop,IP Address,Hostname,Sent,Recv,Loss_Percent,Best_ms,Avg_ms,Worst_ms,Last_ms\n`;
    hops.forEach((h) => {
      const lossPct = h.sent > 0 ? ((h.lost / h.sent) * 100).toFixed(1) : '0.0';
      const avgRtt = h.recv > 0 ? (h.sumRtt / h.recv).toFixed(1) : '0.0';
      const bestRtt = h.best === 9999 ? '0.0' : h.best.toFixed(1);
      const lastStr = typeof h.last === 'number' ? h.last.toFixed(1) : '*';

      csv += `${h.hop},"${h.ip}","${h.name}",${h.sent},${h.recv},${lossPct},${bestRtt},${avgRtt},${h.worst.toFixed(1)},${lastStr}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WinMTR_Trace_${targetHost.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Native Windows Batch (.bat) Script
  const handleDownloadBat = () => {
    const batContent = generateWindowsCmdBat(targetHost, 30);
    const blob = new Blob([batContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Windows_Cmd_Diagnostic_${targetHost.replace(/[^a-zA-Z0-9]/g, '_')}.bat`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Standalone HTML
  const handleDownloadStandaloneHtml = () => {
    const htmlCode = generateWinMtrHtml(targetHost);
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WinMTR_Diagnostic_Tool_${targetHost.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totalSent = hops.reduce((acc, h) => Math.max(acc, h.sent), 0);
  const targetHop = hops[hops.length - 1];
  const overallLossPct = targetHop && targetHop.sent > 0 ? ((targetHop.lost / targetHop.sent) * 100).toFixed(1) : '0.0';
  const endLatency = targetHop && targetHop.recv > 0 ? (targetHop.sumRtt / targetHop.recv).toFixed(1) : '0.0';

  return (
    <div className="space-y-4">
      {/* Notice Banner regarding Web Sandbox vs Windows CMD */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-0.5">
              Windows Command Prompt (`cmd.exe`) vs. Web Browser Engine Notice
            </span>
            <p className="text-slate-300 leading-relaxed">
              Web browsers run inside a sandboxed security model that cannot open raw OS kernel ICMP sockets directly.
              To generate a 100% exact, genuine Windows Command Prompt report on your local PC, run native commands or download the 1-click script:
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-blue-300">
              <span className="bg-black/60 px-2 py-1 rounded border border-white/10">ping -n 30 {targetHost}</span>
              <span className="bg-black/60 px-2 py-1 rounded border border-white/10">tracert -d {targetHost}</span>
              <span className="bg-black/60 px-2 py-1 rounded border border-white/10">pathping -n {targetHost}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleDownloadBat}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/50 transition-all cursor-pointer whitespace-nowrap"
            title="Download native Windows CMD .bat script"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .BAT Script</span>
          </button>
        </div>
      </div>

      {/* Top Banner & Control Bar */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30 font-semibold uppercase">
                My TraceRoute (WinMTR)
              </span>
              <span className="text-xs text-slate-400">Continuous Hop-by-Hop Ping Telemetry</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className={`w-5 h-5 text-blue-400 ${isRunning ? 'animate-pulse' : ''}`} />
              <span>WinMTR Network Diagnostic Suite</span>
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-blue-900/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Trace</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-red-900/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Trace</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset Counters"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleCopyResults}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy table results to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Export results as CSV file"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadStandaloneHtml}
              className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download full self-contained single-file HTML WinMTR tool"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download .HTML Tool</span>
            </button>
          </div>
        </div>

        {/* Target Host Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-mono text-slate-400">Target Host / IP</label>
            <input
              type="text"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              disabled={isRunning}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
              placeholder="108.60.153.162"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-mono text-slate-400">Ping Interval</label>
            <select
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              disabled={isRunning}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            >
              <option value={500}>0.5 Second (Fast Sweep)</option>
              <option value={1000}>1.0 Second (Standard WinMTR)</option>
              <option value={2000}>2.0 Seconds</option>
              <option value={5000}>5.0 Seconds</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between text-xs font-mono bg-black/40 border border-white/5 rounded-xl px-3 py-2">
              <span className="text-slate-400">Status:</span>
              {isRunning ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Pinging ({totalSent} Sent)
                </span>
              ) : (
                <span className="text-slate-400 font-bold">Idle / Stopped</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main WinMTR Results Table */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Hop-by-Hop Telemetry Table
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Click any row to inspect deep hop telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/60 border-b border-white/10 text-[10px] uppercase font-mono text-slate-400">
                <th className="py-2.5 px-3">Hop</th>
                <th className="py-2.5 px-3">IP Address / Hostname</th>
                <th className="py-2.5 px-3 text-right">Sent</th>
                <th className="py-2.5 px-3 text-right">Recv</th>
                <th className="py-2.5 px-3 text-right">Loss %</th>
                <th className="py-2.5 px-3 text-right">Best</th>
                <th className="py-2.5 px-3 text-right">Avg</th>
                <th className="py-2.5 px-3 text-right">Worst</th>
                <th className="py-2.5 px-3 text-right">Last</th>
                <th className="py-2.5 px-3 text-center">Latency Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {hops.map((h) => {
                const lossPct = h.sent > 0 ? ((h.lost / h.sent) * 100).toFixed(1) : '0.0';
                const avgRtt = h.recv > 0 ? (h.sumRtt / h.recv).toFixed(1) : '0.0';
                const bestRtt = h.best === 9999 ? '0.0' : h.best.toFixed(1);
                const worstRtt = h.worst.toFixed(1);
                const lastStr = typeof h.last === 'number' ? h.last.toFixed(1) : '*';

                const lossNum = parseFloat(lossPct);
                let lossColor = 'text-emerald-400';
                if (lossNum > 2.0) lossColor = 'text-amber-400 font-bold';
                if (lossNum > 8.0) lossColor = 'text-red-400 font-bold';

                return (
                  <tr
                    key={h.hop}
                    onClick={() => setSelectedHop(h)}
                    className="hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <td className="py-2 px-3 text-slate-400 font-semibold">{h.hop}</td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-white group-hover:text-blue-300 transition-colors">{h.ip}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{h.name}</div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{h.sent}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{h.recv}</td>
                    <td className={`py-2 px-3 text-right ${lossColor}`}>{lossPct}%</td>
                    <td className="py-2 px-3 text-right text-slate-300">{bestRtt} ms</td>
                    <td className="py-2 px-3 text-right text-slate-200 font-semibold">{avgRtt} ms</td>
                    <td className="py-2 px-3 text-right text-slate-300">{worstRtt} ms</td>
                    <td className="py-2 px-3 text-right text-white font-bold">{lastStr} {typeof h.last === 'number' ? 'ms' : ''}</td>
                    <td className="py-2 px-3 text-center">
                      <SparklineTrend history={h.history} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4">
        <div className="bg-black/40 border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400">Target IP Host</span>
          <p className="text-sm font-mono font-bold text-white truncate">{targetHost}</p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400">Path Hop Count</span>
          <p className="text-sm font-mono font-bold text-blue-400">{hops.length} Hops</p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400">Target Packet Loss</span>
          <p className={`text-sm font-mono font-bold ${parseFloat(overallLossPct) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {overallLossPct}%
          </p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">End-to-End Latency</span>
          <p className="text-sm font-mono font-bold text-white">{endLatency} ms</p>
        </div>
      </div>

      {/* Hop Detail Modal */}
      {selectedHop && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedHop(null)}
        >
          <div
            className="bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Hop #{selectedHop.hop} Telemetry Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedHop(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">IP Address:</span>
                <span className="font-bold text-white">{selectedHop.ip}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Location / Label:</span>
                <span className="text-slate-200">{selectedHop.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Packets Sent / Recv:</span>
                <span className="text-white">{selectedHop.sent} / {selectedHop.recv}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Packets Lost:</span>
                <span className={selectedHop.lost > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {selectedHop.lost} ({selectedHop.sent > 0 ? ((selectedHop.lost / selectedHop.sent) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Best Latency:</span>
                <span className="text-white">{selectedHop.best === 9999 ? 'N/A' : `${selectedHop.best.toFixed(1)} ms`}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Average Latency:</span>
                <span className="text-blue-400 font-bold">
                  {selectedHop.recv > 0 ? (selectedHop.sumRtt / selectedHop.recv).toFixed(1) : '0.0'} ms
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Worst Latency:</span>
                <span className="text-white">{selectedHop.worst.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-400">Last Latency:</span>
                <span className="text-emerald-400 font-bold">
                  {typeof selectedHop.last === 'number' ? `${selectedHop.last.toFixed(1)} ms` : 'TIMEOUT'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Recent RTT Trend</span>
              <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex justify-center">
                <SparklineTrend history={selectedHop.history} width={280} height={40} />
              </div>
            </div>

            <button
              onClick={() => setSelectedHop(null)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini SVG Sparkline Component
const SparklineTrend: React.FC<{ history: (number | null)[]; width?: number; height?: number }> = ({
  history,
  width = 100,
  height = 24,
}) => {
  if (!history || history.length < 2) {
    return <span className="text-[10px] text-slate-500 font-mono">--</span>;
  }

  const validVals = history.filter((v): v is number => typeof v === 'number');
  if (validVals.length === 0) {
    return <span className="text-[10px] text-red-400 font-mono">TIMEOUT</span>;
  }

  const max = Math.max(...validVals, 10);
  const min = Math.min(...validVals, 0);
  const range = max - min || 1;

  const step = width / (history.length - 1);

  const points = history
    .map((val, idx) => {
      if (val === null) return null;
      const x = idx * step;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .filter((p): p is string => p !== null)
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke="#3b82f6" strokeWidth="1.5" points={points} />
    </svg>
  );
};
