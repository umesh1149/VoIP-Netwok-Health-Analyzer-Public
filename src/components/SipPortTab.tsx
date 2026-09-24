import React, { useState } from 'react';
import { PortStatus, SipAlgResult } from '../types/diagnostic';
import { sipChecker } from '../services/sipChecker';
import { ShieldCheck, AlertOctagon, CheckCircle2, ChevronDown, ChevronRight, Lock, Server, Router, RefreshCw } from 'lucide-react';

interface SipPortTabProps {
  portStatuses: PortStatus[];
  sipAlg: SipAlgResult;
  pbxwareServer: string;
  onRefreshPorts: () => void;
}

export const SipPortTab: React.FC<SipPortTabProps> = ({
  portStatuses,
  sipAlg,
  pbxwareServer,
  onRefreshPorts,
}) => {
  const [expandedRouter, setExpandedRouter] = useState<string | null>('Netgear (Nighthawk / Orbi)');
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeSuccessMsg, setProbeSuccessMsg] = useState<string | null>(null);

  const routerGuides = sipChecker.getRouterGuides();

  const handleReProbe = async () => {
    setIsProbing(true);
    setProbeSuccessMsg(null);
    await onRefreshPorts();
    setIsProbing(false);
    setProbeSuccessMsg(`SIP & RTP Ports successfully re-probed for ${pbxwareServer} at ${new Date().toLocaleTimeString()}`);
    setTimeout(() => setProbeSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: SIP ALG Inspection Result */}
      <div className={`p-6 rounded-2xl border backdrop-blur-xl ${
        sipAlg.detected
          ? 'bg-red-500/10 border-red-500/30 text-slate-100'
          : 'bg-emerald-500/10 border-emerald-500/30 text-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {sipAlg.detected ? (
              <AlertOctagon className="w-8 h-8 text-red-400 shrink-0 mt-1" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sipAlg.detected ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {sipAlg.detected ? 'SIP ALG ACTIVE (ACTION REQUIRED)' : 'SIP ALG DISABLED (OPTIMAL)'}
                </span>
                <span className="text-xs text-slate-400">Target Host: {pbxwareServer}</span>
              </div>
              <h2 className="text-lg font-bold text-white">
                {sipAlg.detected ? 'SIP Application Layer Gateway Packet Corruption Detected' : 'SIP Header Packet Verification Passed'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {sipAlg.details}
              </p>
            </div>
          </div>

          <button
            onClick={handleReProbe}
            disabled={isProbing}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-950/40 shrink-0 transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isProbing ? 'animate-spin' : ''}`} />
            <span>{isProbing ? 'Probing Ports...' : 'Re-Probe SIP Ports'}</span>
          </button>
        </div>

        {probeSuccessMsg && (
          <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{probeSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* SIP & Port Connectivity Matrix */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            Required SIP & Media Port Spectrum
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Target: {pbxwareServer}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portStatuses.map((port) => (
            <div
              key={port.id}
              className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h4 className="text-sm font-bold text-white">{port.name}</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {port.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Port / Protocol: <strong className="text-blue-400 font-mono">{port.protocol} {port.port}</strong></span>
                <span className="text-slate-400">Latency: <strong className="text-slate-200 font-mono">{port.responseTimeMs} ms</strong></span>
              </div>

              <p className="text-xs text-slate-400 pt-2 border-t border-white/5">
                {port.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Router & Firewall SIP ALG Remediation Guides */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Router className="w-4 h-4 text-indigo-400" />
            Router & Firewall Guides: How to Disable SIP ALG
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step instructions for enterprise and residential gateways to resolve one-way audio, silent calls, and registration timeouts.
          </p>
        </div>

        <div className="space-y-2">
          {routerGuides.map((guide) => {
            const isExpanded = expandedRouter === guide.router;
            return (
              <div key={guide.router} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedRouter(isExpanded ? null : guide.router)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Router className="w-3.5 h-3.5 text-blue-400" />
                    {guide.router}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs space-y-2 text-slate-300 border-t border-white/5">
                    <ol className="list-decimal list-inside space-y-1.5 marker:text-blue-400">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
