import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Server,
  Laptop,
  Router,
  Globe,
  Shield,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { NetworkHop } from '../types/diagnostic';

interface TracertPathVisualizerProps {
  hops: NetworkHop[];
  targetHost: string;
  isTracing?: boolean;
  activeHopIndex?: number;
  onSelectHop?: (hop: NetworkHop) => void;
}

export const TracertPathVisualizer: React.FC<TracertPathVisualizerProps> = ({
  hops,
  targetHost,
  isTracing = false,
  activeHopIndex,
  onSelectHop,
}) => {
  const [selectedHopNumber, setSelectedHopNumber] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'flow' | 'wrap'>('flow');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto select last hop (destination) or hop 1 by default if none selected
  const activeSelectedHop = useMemo(() => {
    if (selectedHopNumber !== null) {
      return hops.find((h) => h.hopNumber === selectedHopNumber) || hops[hops.length - 1];
    }
    return hops[hops.length - 1] || null;
  }, [hops, selectedHopNumber]);

  // Compute delta latency (segment latency) for each hop
  const hopsWithDeltas = useMemo(() => {
    return hops.map((hop, index) => {
      const prevHop = index > 0 ? hops[index - 1] : null;
      const prevRtt = prevHop ? prevHop.rttMs : 0;
      const deltaRtt = Math.max(0, Math.round((hop.rttMs - prevRtt) * 10) / 10);

      // Determine appropriate role icon and category
      let roleType: 'client' | 'gateway' | 'isp' | 'carrier' | 'firewall' | 'server' = 'carrier';
      let categoryLabel = 'Transit Node';

      const lowerName = (hop.location + ' ' + hop.name).toLowerCase();

      if (index === 0 || lowerName.includes('local gateway') || lowerName.includes('cpe') || lowerName.includes('loopback') || hop.ip.startsWith('192.168.') || hop.ip.startsWith('10.')) {
        roleType = index === 0 ? 'gateway' : 'gateway';
        categoryLabel = 'Local CPE Gateway';
      } else if (lowerName.includes('isp') || lowerName.includes('aggregation') || lowerName.includes('bng') || hop.ip.startsWith('100.64.')) {
        roleType = 'isp';
        categoryLabel = 'ISP Access Subnet';
      } else if (lowerName.includes('firewall') || lowerName.includes('security') || lowerName.includes('balancer') || lowerName.includes('load balancer')) {
        roleType = 'firewall';
        categoryLabel = 'Security & Load Balancer';
      } else if (index === hops.length - 1 || lowerName.includes('pbxware') || lowerName.includes('telephony') || lowerName.includes('destination') || lowerName.includes('target')) {
        roleType = 'server';
        categoryLabel = 'Destination PBXware Host';
      } else if (lowerName.includes('oceanic') || lowerName.includes('international') || lowerName.includes('backbone') || lowerName.includes('transit') || lowerName.includes('arelion') || lowerName.includes('telia') || lowerName.includes('ixp')) {
        roleType = 'carrier';
        categoryLabel = 'Tier-1 Carrier / IXP';
      }

      return {
        ...hop,
        deltaRtt,
        roleType,
        categoryLabel,
      };
    });
  }, [hops]);

  // Overall path metrics
  const pathStats = useMemo(() => {
    if (!hops.length) return { totalHops: 0, endToEndLatency: 0, maxDeltaHop: null, localRtt: 0 };
    const totalHops = hops.length;
    const endToEndLatency = hops[hops.length - 1].rttMs;
    const localRtt = hops[0]?.rttMs || 0;

    let maxDelta = 0;
    let maxDeltaHop = hopsWithDeltas[0];
    hopsWithDeltas.forEach((h) => {
      if (h.deltaRtt > maxDelta) {
        maxDelta = h.deltaRtt;
        maxDeltaHop = h;
      }
    });

    return {
      totalHops,
      endToEndLatency,
      maxDeltaHop,
      localRtt,
    };
  }, [hops, hopsWithDeltas]);

  // Auto scroll to active hop when tracing
  useEffect(() => {
    if (isTracing && activeHopIndex !== undefined && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const hopElement = container.querySelector(`[data-hop-index="${activeHopIndex}"]`) as HTMLElement;
      if (hopElement) {
        hopElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [isTracing, activeHopIndex]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getLatencyColor = (rtt: number) => {
    if (rtt < 30) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', ring: 'ring-emerald-500/30' };
    if (rtt < 80) return { text: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', ring: 'ring-cyan-500/30' };
    if (rtt < 150) return { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', ring: 'ring-blue-500/30' };
    if (rtt < 220) return { text: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', ring: 'ring-indigo-500/30' };
    return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', ring: 'ring-amber-500/30' };
  };

  const getNodeIcon = (roleType: string, isDest: boolean) => {
    if (isDest) return <Server className="w-5 h-5 text-emerald-300" />;
    switch (roleType) {
      case 'client':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'gateway':
        return <Router className="w-4 h-4 text-emerald-400" />;
      case 'isp':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'carrier':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'firewall':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'server':
        return <Server className="w-4 h-4 text-emerald-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Visual Traceroute Path & Latency Pipeline
              {isTracing && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-400 fill-current" />
                  Tracing in progress...
                </span>
              )}
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sequential hop routing topology connecting your local network to <code className="text-emerald-300 font-mono font-semibold">{targetHost}</code>.
          </p>
        </div>

        {/* View mode toggle & Flow Navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {viewMode === 'flow' && hops.length > 5 && (
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={() => setViewMode(viewMode === 'flow' ? 'wrap' : 'flow')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition-all cursor-pointer"
            title={viewMode === 'flow' ? 'Switch to Multi-row Wrapped Grid' : 'Switch to Continuous Horizontal Pipeline'}
          >
            {viewMode === 'flow' ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Wrap Grid</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Horizontal Flow</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Path Metric Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 font-bold font-mono text-sm">
            {pathStats.totalHops}
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Total Hops</div>
            <div className="text-xs font-bold text-white">{pathStats.totalHops} Network Steps</div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-bold font-mono text-xs">
            {pathStats.endToEndLatency}ms
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">End-to-End RTT</div>
            <div className="text-xs font-bold text-emerald-300 font-mono">{pathStats.endToEndLatency} ms (Hop #{pathStats.totalHops})</div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 font-bold font-mono text-xs">
            {pathStats.localRtt}ms
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Local Gateway</div>
            <div className="text-xs font-bold text-cyan-300 font-mono">{pathStats.localRtt} ms (Hop #1)</div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Major Segment Delay</div>
            <div className="text-xs font-bold text-amber-300 truncate font-mono" title={`+${pathStats.maxDeltaHop?.deltaRtt}ms at Hop #${pathStats.maxDeltaHop?.hopNumber}`}>
              +{pathStats.maxDeltaHop?.deltaRtt}ms (Hop #{pathStats.maxDeltaHop?.hopNumber})
            </div>
          </div>
        </div>
      </div>

      {/* LINE AND NODE VISUALIZATION CONTAINER */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className={`py-6 px-4 bg-black/50 border border-white/10 rounded-2xl overflow-x-auto scrollbar-thin ${
            viewMode === 'wrap' ? 'flex flex-wrap gap-y-10 gap-x-2 justify-center' : 'flex items-center space-x-0 min-w-full'
          }`}
        >
          {hopsWithDeltas.map((hop, index) => {
            const isDestination = index === hopsWithDeltas.length - 1;
            const isSelected = activeSelectedHop?.hopNumber === hop.hopNumber;
            const isCurrentActiveTracing = isTracing && activeHopIndex === index;
            const hasPassedInTrace = isTracing && activeHopIndex !== undefined && index <= activeHopIndex;
            const colorScheme = getLatencyColor(hop.rttMs);

            return (
              <React.Fragment key={hop.hopNumber}>
                {/* NODE ITEM */}
                <div
                  data-hop-index={index}
                  onClick={() => {
                    setSelectedHopNumber(hop.hopNumber);
                    if (onSelectHop) onSelectHop(hop);
                  }}
                  className={`group relative flex flex-col items-center cursor-pointer transition-all duration-200 shrink-0 ${
                    viewMode === 'flow' ? 'w-36' : 'w-32'
                  } ${isSelected ? 'scale-105 z-20' : 'hover:scale-102 z-10'}`}
                >
                  {/* Top Hop Badge */}
                  <div className="mb-2 flex items-center gap-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                        isDestination
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                          : isSelected
                          ? 'bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/30'
                          : 'bg-black/60 text-slate-300 border-white/10 group-hover:border-blue-400 group-hover:text-blue-300'
                      }`}
                    >
                      {isDestination ? `Dest (Hop #${hop.hopNumber})` : `Hop #${hop.hopNumber}`}
                    </span>
                  </div>

                  {/* Main Node Circle / Icon Box */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                      isDestination
                        ? 'bg-emerald-950/80 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : isSelected
                        ? 'bg-blue-950/90 border-2 border-blue-400 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                        : isCurrentActiveTracing
                        ? 'bg-blue-900 border-2 border-blue-300 shadow-lg shadow-blue-400/50 animate-pulse'
                        : hasPassedInTrace
                        ? 'bg-slate-800/90 border border-blue-500/40'
                        : 'bg-slate-800/80 border border-white/15 group-hover:border-white/40 group-hover:bg-slate-800'
                    }`}
                  >
                    {/* Node Role Icon */}
                    {getNodeIcon(hop.roleType, isDestination)}

                    {/* Active pulse ring for destination or active trace */}
                    {isDestination && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    )}

                    {/* Hop RTT overlay inside node */}
                    <span className={`text-[10px] font-mono font-bold mt-0.5 ${colorScheme.text}`}>
                      {hop.rttMs}ms
                    </span>
                  </div>

                  {/* Node Labels below */}
                  <div className="mt-2.5 text-center w-full px-1">
                    <div className="text-[11px] font-mono font-bold text-white truncate max-w-full" title={hop.ip}>
                      {hop.ip}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate max-w-full mt-0.5 font-sans" title={hop.location || hop.name}>
                      {hop.location || hop.categoryLabel}
                    </div>
                  </div>

                  {/* Micro Delta latency chip */}
                  {index > 0 && (
                    <div className="mt-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400">
                        +{hop.deltaRtt}ms
                      </span>
                    </div>
                  )}
                </div>

                {/* CONNECTING LINE WITH DIRECTIONAL ARROW & DELTA LATENCY BADGE */}
                {!isDestination && (
                  <div
                    className={`flex flex-col items-center justify-center relative shrink-0 ${
                      viewMode === 'flow' ? 'w-16 sm:w-20' : 'w-10 sm:w-14'
                    }`}
                  >
                    {/* Upper Delta Latency over connector line */}
                    {viewMode === 'flow' && hop.deltaRtt > 5 && (
                      <span
                        className={`text-[8px] font-mono px-1 rounded-full mb-1 border whitespace-nowrap ${
                          hop.deltaRtt > 50
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                        }`}
                        title={`Transit segment delay: +${hop.deltaRtt} ms`}
                      >
                        +{hop.deltaRtt}ms
                      </span>
                    )}

                    {/* Connecting line track */}
                    <div className="w-full flex items-center relative py-1">
                      <div
                        className={`w-full h-0.5 transition-colors ${
                          hasPassedInTrace || isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                            : 'bg-white/20'
                        }`}
                      />
                      {/* Animated traveling data packet when tracing */}
                      {isTracing && (
                        <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-300 animate-pulse" />
                      )}
                      {/* Directional arrowhead */}
                      <ArrowRight
                        className={`w-3 h-3 -ml-2 shrink-0 ${
                          hasPassedInTrace ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                    </div>

                    {/* Status dot below line */}
                    <div className="mt-1 flex items-center gap-0.5 text-[8px] font-mono text-slate-500">
                      <span>1G/10G</span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SELECTED HOP TELEMETRY INSPECTOR CARD */}
      {activeSelectedHop && (
        <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
              {getNodeIcon(activeSelectedHop.roleType, activeSelectedHop.hopNumber === hops.length)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">
                  Hop #{activeSelectedHop.hopNumber}: <code className="text-blue-300">{activeSelectedHop.ip}</code>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeSelectedHop.status}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  ({activeSelectedHop.categoryLabel})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeSelectedHop.location || activeSelectedHop.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs">
            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Cumulative RTT</span>
              <span className="font-bold text-emerald-400">{activeSelectedHop.rttMs} ms</span>
            </div>

            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Segment Added (Δ)</span>
              <span className="font-bold text-cyan-300">+{activeSelectedHop.deltaRtt} ms</span>
            </div>

            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Packet Loss</span>
              <span className="font-bold text-white">{activeSelectedHop.packetLossPercent}%</span>
            </div>

            <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">VoIP Codec Impact</span>
              <span className="font-semibold text-emerald-300 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Optimal Audio Jitter
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
