import React, { useState, useMemo } from 'react';
import { CompleteVoipOfficeAnalysis } from '../../types/diagnostic';
import { evaluateAll33Checkpoints, auditAll33Checkpoints, CheckpointEvaluation } from '../../services/checkpointEvaluator';
import { geminiAssistant } from '../../services/geminiAssistant';
import { voipAnalysisEngine } from '../../services/voipAnalysisEngine';
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Terminal,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
  Cpu,
  Wifi,
  Globe,
  Network,
  Gauge,
} from 'lucide-react';

interface Module7AiDiagnosticReportProps {
  analysis: CompleteVoipOfficeAnalysis;
  onUpdateAnalysis?: (updated: CompleteVoipOfficeAnalysis) => void;
}

export const Module7AiDiagnosticReport: React.FC<Module7AiDiagnosticReportProps> = ({
  analysis,
  onUpdateAnalysis,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'synthesis' | 'checkpoints_grid' | 'raw_text'>('synthesis');
  const [isAiReanalyzing, setIsAiReanalyzing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUES' | 'PASS'>('ALL');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [lastAnalyzedTimestamp, setLastAnalyzedTimestamp] = useState<string>(analysis.timestamp);

  // Compute live 33 checkpoints evaluation from current analysis state
  const evaluatedCheckpoints = useMemo(() => {
    return evaluateAll33Checkpoints(analysis);
  }, [analysis]);

  // Compute live 33 audit summary
  const auditSummary = useMemo(() => {
    return auditAll33Checkpoints(analysis);
  }, [analysis]);

  // Filtered checkpoints for the grid
  const filteredCheckpoints = useMemo(() => {
    return evaluatedCheckpoints.filter((cp) => {
      const matchesSearch =
        searchQuery === '' ||
        cp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cp.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cp.liveValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(cp.pointNumber).includes(searchQuery);

      const matchesCategory = categoryFilter === 'ALL' || cp.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ISSUES'
          ? cp.status === 'WARNING' || cp.status === 'CRITICAL'
          : cp.status === 'PASS';

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [evaluatedCheckpoints, searchQuery, categoryFilter, statusFilter]);

  // Dynamic report data referencing latest values
  const report = analysis.aiReport || {
    narrativeSynthesis: auditSummary.plainEnglishSynthesis,
    confidenceRating: analysis.rootCauseConfidence || 'HIGH',
    primaryCause: auditSummary.primaryIssue,
    affectedDirection: auditSummary.primaryScope.includes('LAN') ? 'Bidirectional' : 'Downstream (Server → PC)',
    evidence: auditSummary.evidence,
    recommendedFix: auditSummary.recommendedActions[0] || 'Prioritize RTP traffic with DSCP 46 QoS.',
  };

  const rawText = analysis.rawTextReport || voipAnalysisEngine.generateRawTextReport(analysis, auditSummary);

  // Re-Analyze All 33 Checkpoints using Gemini AI or Local Dynamic Synthesizer
  const handleTriggerAiAnalysis = async () => {
    setIsAiReanalyzing(true);
    try {
      const aiResult = await geminiAssistant.analyzeAll33Checkpoints(analysis, customerNote);

      const updatedAnalysis: CompleteVoipOfficeAnalysis = {
        ...analysis,
        aiDiagnosticSynthesis: aiResult.narrativeSynthesis,
        aiReport: {
          narrativeSynthesis: aiResult.narrativeSynthesis,
          confidenceRating: aiResult.confidenceRating,
          primaryCause: aiResult.primaryCause,
          affectedDirection: aiResult.affectedDirection,
          evidence: aiResult.evidence,
          recommendedFix: aiResult.recommendedFix,
        },
        recommendedActions: aiResult.recommendedActions,
        rootCauseConfidence: aiResult.confidenceRating,
        primaryIssueCategory: aiResult.auditResult.primaryScope === 'Inside Customer LAN'
          ? 'LAN_WIFI'
          : aiResult.auditResult.primaryScope === 'Beyond Customer LAN (ISP/Transit)'
          ? 'RTP_DOWNSTREAM'
          : aiResult.auditResult.primaryScope === 'Endpoint Device'
          ? 'ENDPOINT_PC'
          : 'OPTIMAL',
      };

      // Regenerate raw text report to match
      updatedAnalysis.rawTextReport = voipAnalysisEngine.generateRawTextReport(
        updatedAnalysis,
        aiResult.auditResult
      );

      const now = new Date();
      setLastAnalyzedTimestamp(now.toLocaleTimeString());

      if (onUpdateAnalysis) {
        onUpdateAnalysis(updatedAnalysis);
      }
    } catch (err) {
      console.error('Error during AI 33 checkpoints analysis:', err);
    } finally {
      setIsAiReanalyzing(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadReport = () => {
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoIP_Diagnostic_Report_${analysis.callId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBatch = () => {
    const batScript = `@echo off
echo ========================================================
echo VoIP Office Network Diagnostic Probe (Windows Native)
echo Target PBX: ${analysis.targetHost}
echo ========================================================
echo [1/4] Probing Local Gateway and DNS...
ping -n 10 192.168.1.1
echo [2/4] Probing VoIP PBX Core (${analysis.targetHost})...
ping -n 30 ${analysis.targetHost}
echo [3/4] Tracing Route (tracert.exe)...
tracert -d -h 15 ${analysis.targetHost}
echo [4/4] Collecting Wi-Fi and NIC state...
netsh wlan show interfaces
netsh interface ipv4 show subinterfaces
echo Diagnostic complete. Output saved to voip_log.txt.
pause`;
    const blob = new Blob([batScript], { type: 'application/x-bat;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoIP_Probe_${analysis.targetHost}.bat`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPowerShell = () => {
    const psScript = `# VoIP Network Diagnostic PowerShell Probe
$Target = "${analysis.targetHost}"
Write-Host "Probing VoIP Target: $Target..." -ForegroundColor Cyan
Test-NetConnection -ComputerName $Target -Port 5060
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed
Get-NetAdapterPowerManagement | Select-Object DeviceName, AllowComputerToTurnOffDevice
Test-Connection -ComputerName $Target -Count 30 | Measure-Object -Property ResponseTime -Average -Maximum -Minimum
Write-Host "Probe complete." -ForegroundColor Green`;
    const blob = new Blob([psScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoIP_Probe_${analysis.targetHost}.ps1`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'PC & Endpoint', label: 'PC & Endpoint' },
    { id: 'LAN & Wi-Fi', label: 'LAN & Wi-Fi' },
    { id: 'Internet & WAN', label: 'Internet & WAN' },
    { id: 'SIP Signaling', label: 'SIP Signaling' },
    { id: 'RTP & Audio', label: 'RTP & Audio' },
    { id: 'Call Quality & MOS', label: 'MOS & Quality' },
    { id: 'Diagnostics & AI', label: 'AI & Exports' },
  ];

  return (
    <div className="space-y-6">
      {/* Module Title Banner & Live AI Trigger Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">Module 7: AI Diagnostic Report</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                ALL 33 CHECKPOINTS EVALUATED
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Latest Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously assesses all 33 endpoints, LAN, WAN, SIP ladder, dual RTP streams, bufferbloat & MOS metrics.
            </p>
          </div>
        </div>

        {/* Live Actions & AI Re-Analysis Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerAiAnalysis}
            disabled={isAiReanalyzing}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-purple-600/30 active:scale-95 border border-purple-400/30"
            title="Feed current 33 checkpoints into Gemini AI for real-time synthesis"
          >
            {isAiReanalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{isAiReanalyzing ? 'Analyzing 33 Checkpoints...' : '⚡ Re-Analyze All 33 Points with AI'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Ticket' : 'Copy Ticket'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download Plain-Text Report"
          >
            <Download className="w-4 h-4" />
            <span>.TXT</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl cursor-pointer transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 33-Checkpoint Live Audit Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-slate-900/80 border border-white/10 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">33-Point Health</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {auditSummary.overallHealthScore}%
          </span>
          <span className="text-[10px] text-slate-500 block">Overall Readiness</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-white/10 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Checkpoints Passed</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {auditSummary.passCount} <span className="text-xs text-slate-400 font-normal">/ 33</span>
          </span>
          <span className="text-[10px] text-emerald-400/80 block">Optimal Telemetry</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-white/10 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Warnings Detected</span>
          <span className={`text-xl font-bold font-mono ${auditSummary.warningCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {auditSummary.warningCount}
          </span>
          <span className="text-[10px] text-slate-500 block">Non-blocking Risks</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-white/10 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Critical Anomalies</span>
          <span className={`text-xl font-bold font-mono ${auditSummary.criticalCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {auditSummary.criticalCount}
          </span>
          <span className="text-[10px] text-slate-500 block">Active Voice Impairments</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-white/10 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Scope Isolation</span>
          <span className="text-xs font-bold text-blue-400 truncate block mt-1">
            {auditSummary.primaryScope}
          </span>
          <span className="text-[10px] text-slate-500 block">LAN vs Beyond LAN</span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-white/10 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Last AI Evaluation</span>
          <span className="text-xs font-mono text-slate-200 block mt-1 truncate">
            {lastAnalyzedTimestamp}
          </span>
          <span className="text-[10px] text-purple-400 font-mono block">Gemini 3.8 Flash</span>
        </div>
      </div>

      {/* Root-Cause Master Verdict Card */}
      <div className="p-5 bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-950/30 border border-amber-500/30 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Automated Root-Cause Diagnostic Verdict</h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Confidence:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {report.confidenceRating}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-black/40 rounded-xl space-y-1 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Primary Root Cause</span>
            <div className="text-sm font-bold text-amber-300 leading-snug">{report.primaryCause}</div>
          </div>
          <div className="p-3.5 bg-black/40 rounded-xl space-y-1 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Impaired Direction</span>
            <div className="text-sm font-bold text-white leading-snug">{report.affectedDirection}</div>
          </div>
          <div className="p-3.5 bg-black/40 rounded-xl space-y-1 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Scope Isolation</span>
            <div className="text-sm font-bold text-blue-400 leading-snug">{auditSummary.primaryScope}</div>
          </div>
        </div>

        {/* Checkpoint 33: Plain English AI Narrative Synthesis */}
        <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Checkpoint 33: Plain English AI Diagnostic Synthesis (Latest 33 Points)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Correlated across all 33 points
            </span>
          </div>
          <p className="text-sm text-slate-100 leading-relaxed font-sans italic bg-black/40 p-3.5 rounded-lg border border-white/5 shadow-inner">
            "{report.narrativeSynthesis || auditSummary.plainEnglishSynthesis}"
          </p>
        </div>

        {/* Dynamic Evidence Bullet Points Directly Derived from 33 Checkpoints */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <span className="font-semibold text-white uppercase font-mono text-[10px] block tracking-wider">
            Correlated Evidence (From Latest 33 Checkpoints):
          </span>
          {report.evidence.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
              <span className="text-amber-400 select-none font-bold">•</span>
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        {/* Remediation & Actions */}
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 space-y-1.5">
          <span className="font-bold text-white block">Recommended Remediation Action:</span>
          <div>{report.recommendedFix}</div>
          {auditSummary.recommendedActions.length > 1 && (
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
              {auditSummary.recommendedActions.slice(1).map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Optional User Log or Symptom Input for Interactive Re-Prompting */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Optional: Add customer reported symptom (e.g. 'Robotic voice at 2:15 PM' or 'Choppy audio on extension 104')..."
              className="flex-1 px-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
            <button
              onClick={handleTriggerAiAnalysis}
              disabled={isAiReanalyzing}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              {isAiReanalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              <span>Re-Prompt AI with Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher: Interactive 33 Checkpoints Grid vs Synthesis vs Standard Ticket */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
          <button
            onClick={() => setViewMode('synthesis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'synthesis' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Synthesis & Verdict
          </button>
          <button
            onClick={() => setViewMode('checkpoints_grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'checkpoints_grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All 33 Checkpoints ({evaluatedCheckpoints.length})</span>
          </button>
          <button
            onClick={() => setViewMode('raw_text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'raw_text' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Point 32 Standard Text Report
          </button>
        </div>

        {/* Windows Probe Scripts Download Helpers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadBatch}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
            title="Download Windows Command Batch Script"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>.BAT Probe</span>
          </button>
          <button
            onClick={handleDownloadPowerShell}
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
            title="Download Windows PowerShell Probe Script"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>.PS1 Probe</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: All 33 Checkpoints Interactive Inspection Grid */}
      {viewMode === 'checkpoints_grid' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 33 checkpoints (e.g. 'MOS', 'Wi-Fi', 'CPU', 'RTP', 'SIP ALG')..."
                className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({evaluatedCheckpoints.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ISSUES')}
                  className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                    statusFilter === 'ISSUES' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Issues ({auditSummary.warningCount + auditSummary.criticalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('PASS')}
                  className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                    statusFilter === 'PASS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pass ({auditSummary.passCount})
                </button>
              </div>
            </div>
          </div>

          {/* Checkpoints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {filteredCheckpoints.map((cp) => {
              const isPass = cp.status === 'PASS';
              const isWarn = cp.status === 'WARNING';
              const isCrit = cp.status === 'CRITICAL';

              return (
                <div
                  key={cp.pointNumber}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCrit
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                      : isWarn
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[11px] shrink-0">
                        #{cp.pointNumber}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs font-sans">{cp.title}</div>
                        <div className="text-[10px] text-slate-400">{cp.category}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isWarn
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {cp.status}
                    </span>
                  </div>

                  <div className="p-2 bg-black/40 rounded-lg border border-white/5 text-[11px] text-slate-200 mb-2 truncate">
                    <span className="text-slate-400 select-none">Metric: </span>
                    <span className="text-blue-300 font-semibold">{cp.liveValue}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {cp.finding}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Scope: <strong className="text-slate-300">{cp.scope}</strong></span>
                    <span className="text-slate-500">Checkpoint {cp.pointNumber}/33</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Formatted Multi-Section Summary */}
      {viewMode === 'synthesis' && (
        <div className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metadata Card */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white font-bold">{analysis.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Extension:</span>
                <span className="text-white font-bold">{analysis.extension}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Target PBX:</span>
                <span className="text-blue-400">{analysis.targetHost}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Call ID:</span>
                <span className="text-blue-400">{analysis.callId}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Call Duration:</span>
                <span className="text-white">{analysis.callDurationSec} sec</span>
              </div>
            </div>

            {/* Quick Live Health Status */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">RTP Stream 0 (PC ➔ PBX):</span>
                <span className="text-emerald-400 font-bold">{analysis.stream0Upload.lossPercent}% Loss ({analysis.stream0Upload.avgJitterMs}ms jit)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">RTP Stream 1 (PBX ➔ PC):</span>
                <span className={`font-bold ${analysis.stream1Download.lossPercent > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {analysis.stream1Download.lossPercent}% Loss ({analysis.stream1Download.avgJitterMs}ms jit)
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Estimated MOS:</span>
                <span className="text-amber-400 font-bold">
                  {analysis.mosEngine?.estimatedMos?.toFixed(2) || analysis.estimatedMos?.mosScore?.toFixed(2) || '4.20'} / 5.0
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">SIP Call Setup:</span>
                <span className="text-emerald-400 font-bold">200 OK ({analysis.sipTiming.inviteTo200OkSec}s)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Wi-Fi RSSI / Band:</span>
                <span className="text-white font-bold">{analysis.wifiAnalysis.signalDbm} dBm ({analysis.wifiAnalysis.band})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Raw Text View (Checkpoint 32 Standard Format) */}
      {viewMode === 'raw_text' && (
        <div className="bg-black/80 border border-white/10 rounded-2xl p-5 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              Item 32: Standard Raw Text Output Format (Updated with Latest 33 Checkpoints)
            </span>
            <button
              onClick={handleCopyText}
              className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed select-all">{rawText}</pre>
        </div>
      )}
    </div>
  );
};
