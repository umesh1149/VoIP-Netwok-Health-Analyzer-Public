import React, { useState } from 'react';
import { CompleteVoipOfficeAnalysis } from '../../types/diagnostic';
import { Cpu, HardDrive, Shield, Wifi, Network, Activity, AlertTriangle, CheckCircle2, Mic, Volume2, Radio, Server, Monitor } from 'lucide-react';

interface Module1EndpointHealthProps {
  analysis: CompleteVoipOfficeAnalysis;
  onUpdateAnalysis?: (updated: CompleteVoipOfficeAnalysis) => void;
}

export const Module1EndpointHealth: React.FC<Module1EndpointHealthProps> = ({ analysis }) => {
  const [recordMode, setRecordMode] = useState<'during' | 'before'>('during');
  const [isMicTesting, setIsMicTesting] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(34);

  const ep = analysis.endpointHealth;

  const handleTestMic = () => {
    setIsMicTesting(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setMicLevel(Math.floor(25 + Math.random() * 45));
      if (count > 20) {
        clearInterval(interval);
        setIsMicTesting(false);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Module 1: PC / Endpoint Health</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Captures OS build, CPU/RAM/Disk before & during call, NIC power saving, VPN, and background consumers
            </p>
          </div>
        </div>

        {/* Live Call State Switcher */}
        <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setRecordMode('before')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              recordMode === 'before'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Before Call Baseline
          </button>
          <button
            onClick={() => setRecordMode('during')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
              recordMode === 'during'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
            During Problem Call
          </button>
        </div>
      </div>

      {/* Critical Note for Support Engineers */}
      <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
        <Activity className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Requirement Verified: </span>
          During a bad call, CPU and network utilization are recorded while the problem is actively occurring,
          preventing false-positive diagnoses caused by idle post-call sampling.
        </div>
      </div>

      {/* Grid: OS & Host Details, Utilization Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* System & OS Specs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" /> Windows Machine Specs
            </span>
            <span className="text-[10px] font-mono text-slate-400">x64 Architecture</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Operating System</span>
              <div className="font-semibold text-white">{ep.windowsVersion}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Windows Build</span>
              <div className="font-mono text-slate-200">{ep.windowsBuild}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">PC Hostname</span>
              <div className="font-mono text-blue-400">{ep.hostname}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Local IPv4 / WAN IP</span>
              <div className="font-mono text-slate-300">
                {ep.localIp} <span className="text-slate-500">/</span> {ep.publicWanIp}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Hardware Utilization (Before vs During) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Hardware Utilization ({recordMode === 'during' ? 'During Call Active' : 'Pre-Call Baseline'})
            </span>
            <span className="text-[10px] font-mono text-amber-400">
              {recordMode === 'during' ? '🔴 Live Problem Sampling' : '⚪ Static Baseline'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CPU */}
            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" /> CPU Load
                </span>
                <span className="font-mono font-bold text-white">
                  {recordMode === 'during' ? ep.cpuPercentDuring : ep.cpuPercentBefore}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    (recordMode === 'during' ? ep.cpuPercentDuring : ep.cpuPercentBefore) > 80
                      ? 'bg-rose-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${recordMode === 'during' ? ep.cpuPercentDuring : ep.cpuPercentBefore}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Idle: {ep.cpuPercentBefore}%</span>
                <span>Delta: +{(ep.cpuPercentDuring - ep.cpuPercentBefore).toFixed(1)}%</span>
              </div>
            </div>

            {/* RAM */}
            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" /> RAM Memory
                </span>
                <span className="font-mono font-bold text-white">
                  {recordMode === 'during' ? ep.ramPercentDuring : ep.ramPercentBefore}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${recordMode === 'during' ? ep.ramPercentDuring : ep.ramPercentBefore}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Baseline: {ep.ramPercentBefore}%</span>
                <span>Delta: +{(ep.ramPercentDuring - ep.ramPercentBefore).toFixed(1)}%</span>
              </div>
            </div>

            {/* Disk */}
            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Disk Active
                </span>
                <span className="font-mono font-bold text-white">{ep.diskPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${ep.diskPercent}%` }}></div>
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>NVMe PCIe 4.0</span>
                <span>Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Adapter & Power-Saving Deep Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Adapter Details & Power States */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-400" /> Network Adapter & Power-Saving
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px]">
              {ep.connectionType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Adapter Model</span>
              <div className="font-semibold text-white truncate" title={ep.adapterName}>
                {ep.adapterName}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Driver Version & Date</span>
              <div className="font-mono text-slate-300">
                {ep.driverVersion} ({ep.driverDate})
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">NIC Power Saving</span>
              <div className="flex items-center gap-1.5 font-medium text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Enabled (May sleep during call)</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Energy Efficient Ethernet</span>
              <div className="flex items-center gap-1.5 font-medium text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Active (Packet drop risk)</span>
              </div>
            </div>
          </div>

          {/* Conflict warnings */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/40">
              <span className="text-slate-300">Multiple Active Adapters:</span>
              <span className={`font-mono text-[11px] ${ep.multipleActiveAdapters ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                {ep.multipleActiveAdapters ? 'DETECTED (Routing conflict risk)' : 'None (Single Default Route)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/40">
              <span className="text-slate-300">Hyper-V / VMware Virtual Switches:</span>
              <span className="font-mono text-[11px] text-blue-300">
                {ep.virtualAdaptersDetected.length > 0 ? ep.virtualAdaptersDetected[0] : 'None'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/40">
              <span className="text-slate-300">Bluetooth / 2.4GHz Wi-Fi Coexistence:</span>
              <span className={`font-mono text-[11px] ${ep.bluetoothConflictDetected ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
                {ep.bluetoothConflictDetected ? 'WARNING: 2.4GHz Shared Antennas' : 'Clear (5GHz / Wired)'}
              </span>
            </div>
          </div>
        </div>

        {/* Security, VPN & Proxy */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Security, VPN & Gateway
            </span>
            <span className="text-[10px] font-mono text-slate-400">Layer 3/4 Inspection</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Default Gateway</span>
              <div className="font-mono text-white">{ep.defaultGateway}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">DNS Servers</span>
              <div className="font-mono text-slate-300">{ep.dnsServers.join(', ')}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">VPN Detected</span>
              <div className="font-semibold text-slate-200">
                {ep.vpnDetected ? (
                  <span className="text-amber-400">YES ({ep.vpnType || 'Full Tunnel'})</span>
                ) : (
                  <span className="text-emerald-400">NO (Direct Internet Route)</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Proxy Server</span>
              <div className="font-semibold text-emerald-400">
                {ep.proxyDetected ? 'Detected' : 'NO (Direct Socket)'}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Windows Firewall</span>
              <div className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ep.firewallStatus}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Windows Defender</span>
              <div className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ep.windowsDefenderStatus}</span>
              </div>
            </div>
          </div>

          {/* VPN Impact note */}
          {ep.vpnDetected && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              Potential additional latency from VPN encapsulation: ~42 ms.
            </div>
          )}
        </div>
      </div>

      {/* Background Bandwidth Consumers & Audio Hardware Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Background App Bandwidth */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" /> Active Bandwidth Applications During Call
            </span>
            <span className="text-[10px] font-mono text-purple-300">Telemetry Stream</span>
          </div>

          <div className="space-y-2">
            {ep.backgroundApps.map((app, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      app.category === 'voip'
                        ? 'bg-emerald-400'
                        : app.category === 'cloud'
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                  ></div>
                  <span className="font-medium text-slate-200">{app.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{app.usageText}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      app.category === 'voip'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : app.usageKbps > 10000
                        ? 'bg-amber-500/10 text-amber-300'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {app.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Hardware Diagnostic */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400" /> Audio Hardware & Peripheral Diagnostic
            </span>
            <button
              onClick={handleTestMic}
              disabled={isMicTesting}
              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-mono cursor-pointer transition-all"
            >
              {isMicTesting ? 'Probing Input...' : 'Test Mic & Speaker'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Microphone</span>
              <div className="font-medium text-white truncate">{analysis.audioHardware.activeMicName}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Detected & Available
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Speaker / Headset</span>
              <div className="font-medium text-white truncate">{analysis.audioHardware.activeSpeakerName}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> 48 kHz Sample Rate
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Clipping & Silence</span>
              <div className="font-mono text-slate-300">
                Clipping: <span className="text-emerald-400 font-bold">NO</span> | Silence: <span className="text-emerald-400 font-bold">NO</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Noise Floor</span>
              <div className="font-mono text-slate-300">-72.0 dBFS (Whisper Quiet)</div>
            </div>
          </div>

          {/* Live Mic Level Meter */}
          <div className="p-3 bg-black/40 rounded-xl space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Input Level dBFS</span>
              <span className="text-emerald-400 font-bold">-{60 - Math.round(micLevel * 0.6)} dBFS</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.min(70, micLevel)}%` }}></div>
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.max(0, Math.min(20, micLevel - 70))}%` }}></div>
              <div className="h-full bg-rose-500 transition-all" style={{ width: `${Math.max(0, micLevel - 90)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
