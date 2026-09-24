import React from 'react';
import { Activity, Play, Server, ShieldCheck, Download, LayoutDashboard, Radio, Mic, Network, FileCode, Globe, Wifi, Cpu as CpuIcon, Gauge, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  pbxwareServer?: string;
  targetServer?: string;
  setTargetServer?: (host: string) => void;
  onOpenServerModal?: () => void;
  isScanning: boolean;
  onRunFullScan?: () => void;
  onRunScan?: () => void;
  onOpenReport?: () => void;
  onOpenPs1?: () => void;
  onOpenOneClickAnalyze?: () => void;
  overallGrade?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'overview',
  setActiveTab,
  pbxwareServer,
  targetServer,
  setTargetServer,
  onOpenServerModal,
  isScanning,
  onRunFullScan,
  onRunScan,
  onOpenReport,
  onOpenPs1,
  onOpenOneClickAnalyze,
  overallGrade,
}) => {
  const currentHost = pbxwareServer || targetServer || '108.60.153.162';
  const handleScan = onRunFullScan || onRunScan || (() => {});

  const navItems = [
    { id: 'voip_monitor', label: '7-Module VoIP Monitor', icon: Sparkles, highlight: true },
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'network', label: 'Ping & WinMTR', icon: Radio },
    { id: 'voip', label: 'SIP & VoIP', icon: Network },
    { id: 'tools', label: 'DNS & Ports', icon: Globe },
    { id: 'system', label: 'Wi-Fi & Adapter', icon: Wifi },
    { id: 'speed', label: 'Speed & Bufferbloat', icon: Gauge },
    { id: 'ai', label: 'AI Diagnosis Engine', icon: CpuIcon },
    { id: 'audio', label: 'Audio Hardware', icon: Mic },
    { id: 'report', label: 'Health Report', icon: ShieldCheck },
    { id: 'powershell', label: 'PowerShell Script', icon: FileCode },
  ];

  return (
    <header className="relative z-10 flex flex-col mb-6 shrink-0 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 md:px-6 md:py-4 gap-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm tracking-wider font-mono">
            VNHA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">VoIP Network Health Analyzer</h1>
              <span className="text-blue-400 font-mono italic text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">VNHA v2.5</span>
            </div>
            <p className="text-[11px] text-slate-400">One-Click Ping, WinMTR Path, SIP ALG, RTP Jitter & Audio Hardware Diagnostic Engine</p>
          </div>
        </div>

        {/* Live VoIP Monitor & Controls */}
        <div className="flex flex-wrap items-center gap-3 md:gap-5">
          {/* Live Audio Stream Monitor Status */}
          <div
            onClick={() => setActiveTab?.('voip_monitor')}
            className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-1.5 transition-all cursor-pointer hover:bg-blue-500/20"
            title="Switch to 7-Module VoIP Monitor & Live Audio Stream"
          >
            <Radio className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-blue-300 font-mono font-semibold">VoIP Call Monitor</span>
              <span className="text-xs text-white font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Audio Ready</span>
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="hidden sm:flex flex-col items-end px-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">System Grade</span>
            <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {overallGrade || 'READY'}
            </span>
          </div>

          <div className="hidden md:block h-8 w-px bg-white/10"></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPs1 || (() => setActiveTab?.('powershell'))}
              title="Download Standalone Windows PowerShell Diagnostic Script"
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">.PS1 Script</span>
            </button>

            <button
              onClick={onOpenReport || (() => setActiveTab?.('report'))}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Report</span>
            </button>

            <button
              onClick={onOpenOneClickAnalyze}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 via-blue-600/30 to-indigo-600/30 hover:from-amber-500/30 hover:via-blue-600/40 hover:to-indigo-600/40 border border-amber-400/40 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Execute full 7-Module 33-Checkpoint automated VoIP analysis"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span className="hidden sm:inline">1-Click Analyze</span>
            </button>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-xs font-semibold text-white transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isScanning ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-white" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Full Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      {setActiveTab && (
        <nav className="flex items-center gap-1.5 pt-3 border-t border-white/10 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};

