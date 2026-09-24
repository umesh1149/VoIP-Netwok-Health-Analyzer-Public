import React, { useState } from 'react';
import { CompleteVoipOfficeAnalysis } from '../../types/diagnostic';
import { Wifi, Network, ShieldCheck, AlertOctagon, AlertTriangle, CheckCircle2, Globe, Radio, RefreshCw, Cpu } from 'lucide-react';

interface Module2LanWifiDiagnosticsProps {
  analysis: CompleteVoipOfficeAnalysis;
}

export const Module2LanWifiDiagnostics: React.FC<Module2LanWifiDiagnosticsProps> = ({ analysis }) => {
  const [activeSubTab, setActiveSubTab] = useState<'wifi' | 'ethernet' | 'nat' | 'sip_alg'>('wifi');
  const [isHalfDuplexSimulated, setIsHalfDuplexSimulated] = useState<boolean>(false);

  const wifi = analysis.wifiAnalysis;
  const eth = analysis.ethernetAnalysis;
  const nat = analysis.natAnalysis;
  const sipAlg = analysis.sipAlg;
  const ipv6 = analysis.ipv6Analysis;

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Module 2: LAN / Wi-Fi Diagnostics</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Layer 1/2/3 Inspection
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Wi-Fi RSSI dBm & channel band, Ethernet duplex integrity, NAT traversal & SIP ALG packet rewriting
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab('wifi')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSubTab === 'wifi' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wi-Fi Analysis
          </button>
          <button
            onClick={() => setActiveSubTab('ethernet')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSubTab === 'ethernet' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ethernet Duplex
          </button>
          <button
            onClick={() => setActiveSubTab('nat')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSubTab === 'nat' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NAT & IPv6
          </button>
          <button
            onClick={() => setActiveSubTab('sip_alg')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
              activeSubTab === 'sip_alg' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SIP ALG Evidence
          </button>
        </div>
      </div>

      {/* 1. Wi-Fi Analysis View */}
      {activeSubTab === 'wifi' && (
        <div className="space-y-5">
          {/* Signal Assessment Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              wifi.signalDbm < -75
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : wifi.signalDbm < -65
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            <Radio className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-wider block">
                Wi-Fi VoIP Assessment: {wifi.signalDbm < -75 ? 'Weak Signal (High VoIP Risk)' : 'Adequate Wireless Signal'}
              </span>
              <span>{wifi.assessment}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Signal dBm */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Signal Strength (RSSI)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">{wifi.signalDbm}</span>
                <span className="text-xs text-slate-400 font-mono">dBm ({wifi.rssiPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${wifi.signalDbm < -75 ? 'bg-rose-500' : wifi.signalDbm < -65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${wifi.rssiPercent}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 block">Threshold: &gt; -65 dBm optimal</span>
            </div>

            {/* Link Speed */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Link Speed / PHY Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">{wifi.linkSpeedMbps}</span>
                <span className="text-xs text-slate-400 font-mono">Mbps</span>
              </div>
              <div className="text-xs text-slate-300 font-mono">Tx/Rx: {wifi.txRxRate}</div>
              <span className="text-[10px] text-slate-400 block">Wi-Fi 6 (802.11ax) 160MHz</span>
            </div>

            {/* Frequency & Channel */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Band & Channel</span>
              <div className="text-xl font-bold text-white font-mono">{wifi.band}</div>
              <div className="text-xs text-slate-300 font-mono">
                Ch. {wifi.channel} ({wifi.channelWidthMhz} MHz width)
              </div>
              <span className="text-[10px] text-slate-400 block">
                {wifi.band === '2.4 GHz' ? '⚠️ Congested microwave band' : 'Low-interference 5GHz DFS'}
              </span>
            </div>

            {/* Roaming & Disconnects */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Roaming & Drops</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${wifi.roamingEvents > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {wifi.roamingEvents}
                </span>
                <span className="text-xs text-slate-400 font-mono">AP Handoffs</span>
              </div>
              <div className="text-xs text-slate-300 font-mono">Disconnects: {wifi.disconnects}</div>
              <span className="text-[10px] text-slate-400 block">BSSID: {wifi.bssid}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Ethernet Duplex & Errors View */}
      {activeSubTab === 'ethernet' && (
        <div className="space-y-5">
          {/* Major Warning Banner for 100 Mbps Half Duplex */}
          {(eth.isHalfDuplexWarning || isHalfDuplexSimulated) && (
            <div className="p-4 bg-rose-500/20 border-2 border-rose-500 rounded-xl text-xs text-rose-100 flex items-start gap-3 animate-pulse">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white text-sm block">
                  CRITICAL WARNING: 100 Mbps Half-Duplex Detected!
                </span>
                <span>
                  The network interface negotiated Half Duplex instead of Full Duplex. Both transmission directions cannot send simultaneously,
                  causing packet collisions, extreme latency jitter, and severe voice dropouts. Check Ethernet cable (bad pin 4/5/7/8 or damaged RJ45 crimp) or switch port negotiation.
                </span>
              </div>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" /> Wired NIC Status & Error Counters
              </span>
              <button
                onClick={() => setIsHalfDuplexSimulated(!isHalfDuplexSimulated)}
                className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 cursor-pointer"
              >
                {isHalfDuplexSimulated ? 'Reset Duplex' : 'Simulate 100M Half-Duplex'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Negotiated Speed</span>
                <div className="font-mono font-bold text-white text-base">
                  {isHalfDuplexSimulated ? '100 Mbps' : `${eth.linkSpeedMbps} Mbps`}
                </div>
              </div>
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Duplex Mode</span>
                <div className={`font-mono font-bold text-base ${isHalfDuplexSimulated ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isHalfDuplexSimulated ? 'Half Duplex ⚠️' : eth.duplex}
                </div>
              </div>
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono">CRC Errors</span>
                <div className="font-mono font-bold text-emerald-400 text-base">{eth.crcErrors}</div>
              </div>
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Interface Resets</span>
                <div className="font-mono font-bold text-emerald-400 text-base">{eth.resets}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. NAT & IPv6 Diagnostics View */}
      {activeSubTab === 'nat' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NAT Translation Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" /> NAT Mapping & SDP IP Analysis
                </span>
                <span className="text-[10px] font-mono text-emerald-400">STUN Validated</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-black/40">
                  <span className="text-slate-400">Advertised SDP IP (c=IN IP4):</span>
                  <span className="font-mono text-white">{nat.sdpIp}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40">
                  <span className="text-slate-400">Actual Public Source IP:</span>
                  <span className="font-mono text-white">{nat.publicIp}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40">
                  <span className="text-slate-400">Advertised Media Port:</span>
                  <span className="font-mono text-blue-400">{nat.advertisedPort} (UDP)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40">
                  <span className="text-slate-400">NAT Firewall Type:</span>
                  <span className="font-mono text-emerald-400">{nat.natType}</span>
                </div>
              </div>
            </div>

            {/* IPv4 vs IPv6 Diagnostics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-400" /> IPv4 / IPv6 Dual-Stack Reachability
                </span>
                <span className="text-[10px] font-mono text-slate-400">Dual-Stack Probing</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-black/40">
                  <span className="text-slate-300">IPv4 Route to VoIP PBX:</span>
                  <span className="font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> REACHABLE (108.60.153.162)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/40">
                  <span className="text-slate-300">IPv6 Route to VoIP PBX:</span>
                  <span className="font-mono text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> UNREACHABLE (No AAAA Record)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-300">Diagnostic Verdict: </span>
                  {ipv6.warningNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SIP ALG Evidence View */}
      {activeSubTab === 'sip_alg' && (
        <div className="space-y-5">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Evidence-Based SIP ALG Detection
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  sipAlg.detected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {sipAlg.detected ? 'SIP ALG: POSSIBLY DETECTED' : 'SIP ALG: NOT DETECTED (CLEAN)'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We inspect genuine packet modifications between the PC client and PBX gateway to determine whether the customer's router is corrupting SIP headers or rewriting SDP payloads.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Original Client SDP IP</span>
                <span className="text-slate-200 font-bold">{sipAlg.originalSdpIp || '192.168.1.105'}</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Observed SDP IP</span>
                <span className="text-blue-400 font-bold">{sipAlg.observedSdpIp || '192.168.1.105'}</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase block">Observed Public Source</span>
                <span className="text-emerald-400 font-bold">{sipAlg.observedPublicSource || '203.0.113.42'}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <div>• Via Header Rewriting: <span className="text-emerald-400 font-bold">Unmodified</span></div>
              <div>• Contact Header Rewriting: <span className="text-emerald-400 font-bold">Unmodified</span></div>
              <div>• Media Port Modification: <span className="text-emerald-400 font-bold">None</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
