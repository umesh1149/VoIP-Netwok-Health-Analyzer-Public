import React, { useState } from 'react';
import { PowerShellConfig } from '../types/diagnostic';
import { generatePowerShellScript } from '../services/powershellGenerator';
import { Terminal, Copy, Download, Check, Settings2, ShieldCheck, Play } from 'lucide-react';

interface PowerShellScriptTabProps {
  pbxwareServer: string;
}

export const PowerShellScriptTab: React.FC<PowerShellScriptTabProps> = ({ pbxwareServer }) => {
  const [config, setConfig] = useState<PowerShellConfig>({
    pbxwareIp: pbxwareServer,
    sipPort: 5060,
    rtpRangeStart: 10000,
    rtpRangeEnd: 20000,
    checkAudioService: true,
    checkMtu: true,
    runTracert: true,
    tracertNoResolve: true,
    pingCount: 30,
  });

  const [copied, setCopied] = useState(false);
  const scriptContent = generatePowerShellScript(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPs1 = () => {
    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `pbxware-diagnostic.ps1`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
              WINDOWS OS POWERSHELL SCRIPT
            </span>
            <span className="text-xs text-slate-400">scripts/pbxware-diagnostic.ps1</span>
          </div>
          <h2 className="text-lg font-bold text-white">Standalone Endpoint PowerShell Diagnostic Tool</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Run on remote Windows desktop workstations to audit Windows Audio Service (<code className="text-blue-300">AudioSrv</code>), WMI sound hardware, MSS MTU fragmentation, and execute <code className="text-blue-300">Test-NetConnection</code> to PBXware ports.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'Copied Script!' : 'Copy PS1 Script'}</span>
          </button>
          <button
            onClick={handleDownloadPs1}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/40 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download pbxware-diagnostic.ps1</span>
          </button>
        </div>
      </div>

      {/* Script Builder Parameters */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-blue-400" />
          PowerShell Script Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Target PBXware Host
            </label>
            <input
              type="text"
              value={config.pbxwareIp}
              onChange={(e) => setConfig({ ...config, pbxwareIp: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              SIP Port
            </label>
            <input
              type="number"
              value={config.sipPort}
              onChange={(e) => setConfig({ ...config, sipPort: Number(e.target.value) })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              RTP Range Start
            </label>
            <input
              type="number"
              value={config.rtpRangeStart}
              onChange={(e) => setConfig({ ...config, rtpRangeStart: Number(e.target.value) })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              RTP Range End
            </label>
            <input
              type="number"
              value={config.rtpRangeEnd}
              onChange={(e) => setConfig({ ...config, rtpRangeEnd: Number(e.target.value) })}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/5 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.checkAudioService}
              onChange={(e) => setConfig({ ...config, checkAudioService: e.target.checked })}
              className="accent-blue-500 rounded cursor-pointer"
            />
            <span>Check Windows Audio Service (<code className="text-slate-400">AudioSrv</code>)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.checkMtu}
              onChange={(e) => setConfig({ ...config, checkMtu: e.target.checked })}
              className="accent-blue-500 rounded cursor-pointer"
            />
            <span>Perform MTU / MSS Packet Fragmentation Test</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.runTracert}
              onChange={(e) => setConfig({ ...config, runTracert: e.target.checked })}
              className="accent-blue-500 rounded cursor-pointer"
            />
            <span>Run TraceRoute Path Analysis</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-lg">
            <input
              type="checkbox"
              checked={config.tracertNoResolve}
              onChange={(e) => setConfig({ ...config, tracertNoResolve: e.target.checked })}
              className="accent-blue-500 rounded cursor-pointer"
            />
            <span className="text-blue-300 font-medium">Use <code className="font-bold">tracert -d</code> (No DNS resolution)</span>
          </label>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            <span className="text-emerald-400 font-medium">Continuous Ping Packets:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={config.pingCount}
              onChange={(e) => setConfig({ ...config, pingCount: Number(e.target.value) || 30 })}
              className="w-14 bg-black/60 border border-white/10 rounded px-2 py-0.5 text-xs text-emerald-300 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setConfig({ ...config, pingCount: 30 })}
              className="px-1.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] text-emerald-300 rounded font-semibold transition-colors"
            >
              Set 30
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            PowerShell Script Preview (<code className="text-slate-300">pbxware-diagnostic.ps1</code>)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Windows PowerShell 5.1 / 7.x Compatible</span>
        </div>

        <pre className="p-4 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-emerald-300/90 overflow-x-auto whitespace-pre leading-relaxed max-h-[500px]">
          {scriptContent}
        </pre>
      </div>
    </div>
  );
};
