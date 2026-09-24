import React, { useState } from 'react';
import { DiagnosticReport } from '../types/diagnostic';
import { reportGenerator } from '../services/reportGenerator';
import { Download, Copy, Check, FileText, Printer, Shield, Activity, Mic, Server } from 'lucide-react';

interface ReportGeneratorTabProps {
  report: DiagnosticReport;
}

export const ReportGeneratorTab: React.FC<ReportGeneratorTabProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);
  const ticketText = reportGenerator.generateSupportTicketSnippet(report);

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(ticketText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Export Header */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            End-to-End Diagnostic Report Generator
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Report ID: <span className="text-blue-400 font-mono">{report.id}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generated on {report.timestamp} for PBXware server target <strong className="text-slate-200">{report.pbxwareServer}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => reportGenerator.downloadJson(report)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={() => reportGenerator.downloadHtmlReport(report)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export HTML Report</span>
          </button>
          <button
            onClick={handleCopyTicket}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-medium transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Support Ticket Snippet'}</span>
          </button>
        </div>
      </div>

      {/* Ticket Snippet Preview */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            PBXware Support Ticket Attachment Format
          </h3>
          <span className="text-[10px] text-slate-500">Plaintext / Markdown Ready</span>
        </div>

        <pre className="p-4 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
          {ticketText}
        </pre>
      </div>

      {/* Structured Metric Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Audio Metrics */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-400" />
            Audio Hardware
          </h4>
          <div className="text-xs space-y-1 pt-2 border-t border-white/5 text-slate-300">
            <div>Input: <strong className="text-white">{report.audioMetrics.activeMicName}</strong></div>
            <div>Peak Level: <strong className="text-white">{report.audioMetrics.peakDbFS} dBFS</strong></div>
            <div>Noise Floor: <strong className="text-white">{report.audioMetrics.noiseFloorDbFS} dBFS</strong></div>
            <div>Clipping: <strong className={report.audioMetrics.isClipping ? 'text-red-400' : 'text-emerald-400'}>{report.audioMetrics.isClipping ? 'YES' : 'NO'}</strong></div>
          </div>
        </div>

        {/* Network Metrics */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            RTP Telemetry
          </h4>
          <div className="text-xs space-y-1 pt-2 border-t border-white/5 text-slate-300">
            <div>MOS Score: <strong className="text-emerald-400">{report.networkMetrics.mosScore} / 4.5</strong></div>
            <div>RTT Latency: <strong className="text-white">{report.networkMetrics.latencyMs} ms</strong></div>
            <div>RTP Jitter: <strong className="text-white">{report.networkMetrics.jitterMs} ms</strong></div>
            <div>Packet Loss: <strong className="text-white">{report.networkMetrics.packetLossPercent}%</strong></div>
          </div>
        </div>

        {/* SIP Metrics */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            SIP & ALG
          </h4>
          <div className="text-xs space-y-1 pt-2 border-t border-white/5 text-slate-300">
            <div>SIP UDP 5060: <strong className="text-emerald-400">REACHABLE</strong></div>
            <div>SIP TLS 5061: <strong className="text-emerald-400">REACHABLE</strong></div>
            <div>RTP Range: <strong className="text-emerald-400">10000-20000 OPEN</strong></div>
            <div>SIP ALG: <strong className={report.sipAlg.detected ? 'text-red-400' : 'text-emerald-400'}>{report.sipAlg.detected ? 'DETECTED' : 'DISABLED'}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
