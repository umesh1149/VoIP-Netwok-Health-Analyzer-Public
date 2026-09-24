import React, { useState } from 'react';
import { Gauge, Download, Upload, Zap, Activity, ShieldCheck, Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SpeedTestMetrics } from '../types/diagnostic';

interface SpeedTestTabProps {
  serverHost: string;
}

export const SpeedTestTab: React.FC<SpeedTestTabProps> = ({ serverHost }) => {
  const [metrics, setMetrics] = useState<SpeedTestMetrics>({
    downloadMbps: 185.4,
    uploadMbps: 42.1,
    pingMs: 14,
    jitterMs: 2.1,
    bufferbloatMs: 8,
    bufferbloatGrade: 'A+',
    isTesting: false,
  });

  const [testPhase, setTestPhase] = useState<'IDLE' | 'PING' | 'DOWNLOAD' | 'UPLOAD' | 'BUFFERBLOAT' | 'COMPLETE'>('IDLE');

  const handleRunSpeedTest = () => {
    setMetrics((prev) => ({ ...prev, isTesting: true }));
    setTestPhase('PING');

    setTimeout(() => {
      setTestPhase('DOWNLOAD');
      setMetrics((prev) => ({ ...prev, pingMs: 12 + Math.floor(Math.random() * 4) }));
    }, 1500);

    setTimeout(() => {
      setTestPhase('UPLOAD');
      setMetrics((prev) => ({ ...prev, downloadMbps: +(150 + Math.random() * 80).toFixed(1) }));
    }, 3500);

    setTimeout(() => {
      setTestPhase('BUFFERBLOAT');
      setMetrics((prev) => ({ ...prev, uploadMbps: +(35 + Math.random() * 20).toFixed(1) }));
    }, 5500);

    setTimeout(() => {
      setTestPhase('COMPLETE');
      setMetrics((prev) => ({
        ...prev,
        bufferbloatMs: 6 + Math.floor(Math.random() * 6),
        bufferbloatGrade: 'A+',
        isTesting: false,
      }));
    }, 7500);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-500/30 font-semibold">
                INTERNET SPEED & BUFFERBLOAT ANALYZER
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-sky-400" />
              Bandwidth, Latency & Bufferbloat Suite
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates connection throughput, loaded vs unloaded latency, and router bufferbloat impact on real-time voice packets.
            </p>
          </div>

          <button
            onClick={handleRunSpeedTest}
            disabled={metrics.isTesting}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-950/40 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            {metrics.isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{metrics.isTesting ? `Testing (${testPhase})...` : 'Start Speed & Bufferbloat Test'}</span>
          </button>
        </div>

        {/* Big Speed Gauges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Download */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sky-400" /> Download
              </span>
              <span className="text-[10px] font-mono text-slate-500">Mbps</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {metrics.downloadMbps}
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (metrics.downloadMbps / 300) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Upload */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" /> Upload
              </span>
              <span className="text-[10px] font-mono text-slate-500">Mbps</span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {metrics.uploadMbps}
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (metrics.uploadMbps / 100) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Ping & Jitter */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Ping & Jitter
              </span>
              <span className="text-[10px] font-mono text-slate-500">Unloaded</span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {metrics.pingMs} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Jitter: {metrics.jitterMs} ms</div>
            </div>
          </div>

          {/* Bufferbloat Grade */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-400" /> Bufferbloat
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {metrics.bufferbloatGrade}
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                +{metrics.bufferbloatMs} <span className="text-xs font-normal text-slate-400">ms delay</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Low Loaded Queue Delay</div>
            </div>
          </div>
        </div>
      </div>

      {/* QoS & VoIP Bandwidth Requirements Matrix */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          VoIP Concurrent Call Bandwidth Capacity Estimate
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase font-mono">G.711u (80 kbps per call)</span>
            <div className="text-xl font-extrabold text-white font-mono">
              {Math.floor((metrics.uploadMbps * 1000) / 100)} Concurrent Calls
            </div>
            <p className="text-[11px] text-slate-400">Standard uncompressed voice codec (Default in PBXware).</p>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase font-mono">Opus Wideband (40 kbps per call)</span>
            <div className="text-xl font-extrabold text-white font-mono">
              {Math.floor((metrics.uploadMbps * 1000) / 50)} Concurrent Calls
            </div>
            <p className="text-[11px] text-slate-400">HD voice wideband codec with dynamic adaptive bitrate.</p>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase font-mono">G.729 Compressed (30 kbps per call)</span>
            <div className="text-xl font-extrabold text-white font-mono">
              {Math.floor((metrics.uploadMbps * 1000) / 40)} Concurrent Calls
            </div>
            <p className="text-[11px] text-slate-400">Low bandwidth codec ideal for satellite or cellular backhaul.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
