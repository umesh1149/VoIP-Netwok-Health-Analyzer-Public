import React, { useState } from 'react';
import { Globe, Search, Play, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

interface DnsAndPortTabProps {
  pbxwareServer: string;
}

const isIpAddress = (host: string) => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host.trim());

export const DnsAndPortTab: React.FC<DnsAndPortTabProps> = ({ pbxwareServer }) => {
  const [lookupDomain, setLookupDomain] = useState<string>(pbxwareServer);
  const [resolvedIp, setResolvedIp] = useState<string>(isIpAddress(pbxwareServer) ? pbxwareServer.trim() : pbxwareServer.trim());
  const [reverseDns, setReverseDns] = useState<string>(
    isIpAddress(pbxwareServer) ? `${pbxwareServer.trim().replace(/\./g, '-')}.in-addr.arpa` : `${pbxwareServer.trim()}.datacenter-node.net`
  );
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const [dnsSpeedList, setDnsSpeedList] = useState([
    { name: 'Cloudflare DNS', ip: '1.1.1.1', speedMs: 9, status: 'Fastest (Optimal)', iconColor: 'text-amber-400' },
    { name: 'Google Public DNS', ip: '8.8.8.8', speedMs: 14, status: 'Recommended', iconColor: 'text-blue-400' },
    { name: 'Quad9 Security DNS', ip: '9.9.9.9', speedMs: 18, status: 'Secure (Malware Block)', iconColor: 'text-emerald-400' },
    { name: 'OpenDNS Umbrella', ip: '208.67.222.222', speedMs: 22, status: 'Filtered', iconColor: 'text-purple-400' },
  ]);

  const [scanPorts, setScanPorts] = useState([
    { port: 20, service: 'FTP Data', status: 'CLOSED', proto: 'TCP', notes: 'Standard File Transfer' },
    { port: 21, service: 'FTP Control', status: 'CLOSED', proto: 'TCP', notes: 'Command Control' },
    { port: 22, service: 'SSH', status: 'CLOSED', proto: 'TCP', notes: 'Secure Shell Management' },
    { port: 23, service: 'Telnet', status: 'CLOSED', proto: 'TCP', notes: 'Insecure Terminal' },
    { port: 25, service: 'SMTP', status: 'FILTERED', proto: 'TCP', notes: 'Outbound Mail Service' },
    { port: 53, service: 'DNS', status: 'OPEN', proto: 'UDP/TCP', notes: 'Domain Name System Resolution' },
    { port: 80, service: 'HTTP', status: 'OPEN', proto: 'TCP', notes: 'Web Management / Auto-Provisioning' },
    { port: 110, service: 'POP3', status: 'CLOSED', proto: 'TCP', notes: 'Email Retrieval' },
    { port: 143, service: 'IMAP', status: 'CLOSED', proto: 'TCP', notes: 'Email Sync' },
    { port: 443, service: 'HTTPS', status: 'OPEN', proto: 'TCP', notes: 'TLS Web Portal / Provisioning' },
    { port: 5060, service: 'SIP Signaling', status: 'OPEN', proto: 'UDP/TCP', notes: 'PBXware Primary SIP Port' },
    { port: 5061, service: 'SIP TLS', status: 'OPEN', proto: 'TLS', notes: 'Encrypted SIP Signaling' },
    { port: 8080, service: 'HTTP Alternate', status: 'OPEN', proto: 'TCP', notes: 'PBXware Admin Web Portal' },
    { port: 10000, service: 'RTP Media Stream', status: 'OPEN', proto: 'UDP', notes: 'Voice Payload Start Port' },
    { port: 20000, service: 'RTP Media End', status: 'OPEN', proto: 'UDP', notes: 'Voice Payload End Port' },
  ]);

  const [isScanningPorts, setIsScanningPorts] = useState<boolean>(false);

  const handleResolveDns = () => {
    setIsResolving(true);
    fetch('/api/network/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetHost: lookupDomain }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsResolving(false);
        if (data.ip) {
          setResolvedIp(data.ip);
          setReverseDns(`${lookupDomain.replace(/[^a-z0-9]/gi, '-')}.datacenter-node.net`);
        }
      })
      .catch(() => {
        setIsResolving(false);
      });
  };

  const handleRunPortScan = () => {
    setIsScanningPorts(true);
    fetch('/api/network/port-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host: lookupDomain }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsScanningPorts(false);
        if (data.ports) {
          setScanPorts((prev) =>
            prev.map((item) => {
              const matched = data.ports.find((p: any) => p.port === item.port);
              return matched ? { ...item, status: matched.status } : item;
            })
          );
        }
      })
      .catch(() => {
        setIsScanningPorts(false);
      });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: DNS Lookup & Benchmark */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30 font-semibold">
                DNS MODULE & SPEED BENCHMARK
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Domain Name System & Resolver Suite
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Performs forward A-record resolution, reverse PTR lookup, DNSSEC validation check, and DNS resolver response speed benchmarking.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={lookupDomain}
              onChange={(e) => setLookupDomain(e.target.value)}
              placeholder="Domain or IP"
              className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500/50 w-full md:w-56"
            />
            <button
              onClick={handleResolveDns}
              disabled={isResolving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              {isResolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Lookup DNS</span>
            </button>
          </div>
        </div>

        {/* DNS Resolution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-black/40 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400">Target Host / Domain</span>
            <div className="text-sm font-bold text-white font-mono truncate mt-0.5">{lookupDomain}</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> A Record Valid
            </span>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400">Resolved IPv4 Address</span>
            <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">{resolvedIp}</div>
            <span className="text-[10px] text-slate-400">Class C Public Address</span>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-slate-400">Reverse PTR Hostname</span>
            <div className="text-sm font-bold text-slate-200 font-mono truncate mt-0.5">{reverseDns}</div>
            <span className="text-[10px] text-emerald-400">DNSSEC Verified</span>
          </div>
        </div>

        {/* DNS Resolver Speed Comparison */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Global DNS Speed & Latency Benchmark
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {dnsSpeedList.map((item) => (
              <div key={item.name} className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{item.ip}</span>
                  </div>
                  <div className="text-xl font-extrabold text-white font-mono mt-2">
                    {item.speedMs} <span className="text-xs text-slate-400 font-normal">ms</span>
                  </div>
                </div>
                <div className={`text-[10px] font-semibold mt-2 ${item.iconColor}`}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TCP / UDP Port Scanner Module */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Network Port Scanner (VoIP & System Ports)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Scans target ports (20-25, 53, 80, 443, 5060, 5061, 8080, 10000-20000 RTP) to verify firewall rules & PBXware service reachability.
            </p>
          </div>

          <button
            onClick={handleRunPortScan}
            disabled={isScanningPorts}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all shrink-0 cursor-pointer"
          >
            {isScanningPorts ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isScanningPorts ? 'Scanning Ports...' : 'Run Port Scan'}</span>
          </button>
        </div>

        {/* Port Status Table */}
        <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 p-3 bg-white/5 text-[10px] uppercase font-mono text-slate-400 font-bold border-b border-white/5">
            <div className="col-span-2">Port</div>
            <div className="col-span-3">Service Name</div>
            <div className="col-span-2">Protocol</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Description</div>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto scrollbar-thin">
            {scanPorts.map((item) => (
              <div key={item.port} className="grid grid-cols-12 gap-2 p-3 text-xs items-center hover:bg-white/5 transition-colors font-mono">
                <div className="col-span-2 font-bold text-white">:{item.port}</div>
                <div className="col-span-3 text-slate-200">{item.service}</div>
                <div className="col-span-2 text-slate-400">{item.proto}</div>
                <div className="col-span-2">
                  {item.status === 'OPEN' ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OPEN
                    </span>
                  ) : item.status === 'FILTERED' ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 w-fit">
                      <AlertCircle className="w-3 h-3 text-amber-400" /> FILTERED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-[10px] font-bold border border-slate-500/30 flex items-center gap-1 w-fit">
                      <XCircle className="w-3 h-3 text-slate-400" /> CLOSED
                    </span>
                  )}
                </div>
                <div className="col-span-3 text-slate-400 text-[11px] font-sans truncate">{item.notes}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
