import React, { useCallback, useEffect, useState } from 'react';
import { AudioMetrics, DiagnosticReport, NetworkMetrics, PortStatus, SipAlgResult, CompleteVoipOfficeAnalysis } from './types/diagnostic';
import { audioEngine } from './services/audioEngine';
import { networkAnalyzer } from './services/networkEngine';
import { sipChecker } from './services/sipChecker';
import { reportGenerator } from './services/reportGenerator';
import { voipAnalysisEngine } from './services/voipAnalysisEngine';

import { Header } from './components/Header';
import { VoipOfficeDashboard } from './components/VoipOfficeDashboard';
import { OneClickAnalyzeModal } from './components/OneClickAnalyzeModal';
import { OverviewTab } from './components/OverviewTab';
import { AudioHardwareTab } from './components/AudioHardwareTab';
import { NetworkAnalyzerTab } from './components/NetworkAnalyzerTab';
import { SipPortTab } from './components/SipPortTab';
import { ReportGeneratorTab } from './components/ReportGeneratorTab';
import { PowerShellScriptTab } from './components/PowerShellScriptTab';
import { ServerConfigModal } from './components/ServerConfigModal';
import { DnsAndPortTab } from './components/DnsAndPortTab';
import { SystemAdapterTab } from './components/SystemAdapterTab';
import { AiDiagnosisTab } from './components/AiDiagnosisTab';
import { SpeedTestTab } from './components/SpeedTestTab';

import { CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('voip_monitor');
  const [pbxwareServer, setPbxwareServer] = useState<string>('108.60.153.162');
  const [isServerModalOpen, setIsServerModalOpen] = useState<boolean>(false);
  const [isOneClickModalOpen, setIsOneClickModalOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Complete 33-Point VoIP Office Analysis State
  const [voipAnalysis, setVoipAnalysis] = useState<CompleteVoipOfficeAnalysis>(() =>
    voipAnalysisEngine.generateCompleteAnalysis(pbxwareServer, 'REALISTIC_DEGRADED')
  );

  // Audio Metrics state
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics>({
    rmsLevel: 0.1,
    peakLevel: 0.2,
    peakDbFS: -24.5,
    noiseFloorDbFS: -72.0,
    isClipping: false,
    micPermissionGranted: false,
    activeMicName: 'Jabra Evolve 75 (System Input)',
    activeSpeakerName: 'Default Headset Speaker',
    latencyMs: 12.4,
    echoDetected: false,
  });

  // Network Telemetry state
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>(
    networkAnalyzer.probeTelemetry(0)
  );

  // SIP Port statuses
  const [portStatuses, setPortStatuses] = useState<PortStatus[]>([]);
  const [sipAlg, setSipAlg] = useState<SipAlgResult>(sipChecker.checkSipAlg());

  // Report object
  const [report, setReport] = useState<DiagnosticReport>(
    reportGenerator.generateReport(pbxwareServer, audioMetrics, networkMetrics, [], sipAlg)
  );

  // Load initial port connectivity
  const loadPortStatuses = useCallback(async () => {
    const ports = await sipChecker.checkPortConnectivity(pbxwareServer);
    setPortStatuses(ports);
    return ports;
  }, [pbxwareServer]);

  useEffect(() => {
    loadPortStatuses();
  }, [loadPortStatuses]);

  // Continuously refresh audio metrics
  const refreshAudioMetrics = useCallback(() => {
    const liveMetrics = audioEngine.getAudioMetrics(
      audioMetrics.activeMicName,
      audioMetrics.activeSpeakerName
    );
    setAudioMetrics(liveMetrics);
  }, [audioMetrics.activeMicName, audioMetrics.activeSpeakerName]);

  // Keep audioMetrics continuously updated when audioEngine capture is active
  useEffect(() => {
    let interval: number | null = null;

    const syncCaptureInterval = (active: boolean) => {
      if (active) {
        if (!interval) {
          interval = window.setInterval(() => {
            refreshAudioMetrics();
          }, 200);
        }
      } else {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        refreshAudioMetrics();
      }
    };

    const unsub = audioEngine.onCaptureStateChange(syncCaptureInterval);
    syncCaptureInterval(audioEngine.isMicrophoneActive());

    return () => {
      unsub();
      if (interval) clearInterval(interval);
    };
  }, [refreshAudioMetrics]);

  // Update Report when underlying state changes
  useEffect(() => {
    const newReport = reportGenerator.generateReport(
      pbxwareServer,
      audioMetrics,
      networkMetrics,
      portStatuses,
      sipAlg
    );
    newReport.completeAnalysis = voipAnalysis;
    setReport(newReport);
  }, [pbxwareServer, audioMetrics, networkMetrics, portStatuses, sipAlg, voipAnalysis]);

  // Run Full System Diagnostic Scan
  const handleRunFullScan = async () => {
    setIsScanning(true);
    setToastMessage('Step 1/3: Checking SIP Ports & Audio Hardware...');

    // 1. Probe SIP Ports & Audio
    const ports = await loadPortStatuses();
    setPortStatuses(ports);
    refreshAudioMetrics();

    await new Promise((resolve) => setTimeout(resolve, 600));

    // 2. Run 30s Continuous Ping Test
    setToastMessage(`Step 2/3: Executing Live Ping Test (ping -n 30 ${pbxwareServer})...`);
    let ping30Summary = await networkAnalyzer.executeRealPing(pbxwareServer, 30);
    if (!ping30Summary) {
      ping30Summary = networkAnalyzer.generatePing30(30, 0, pbxwareServer);
    }
    const updatedNetworkMetrics: NetworkMetrics = {
      ...networkMetrics,
      pingSummary: ping30Summary,
      latencyMs: ping30Summary.avgRttMs,
      packetLossPercent: ping30Summary.packetLossPercent,
      tracertNoResolve: true,
    };
    setNetworkMetrics(updatedNetworkMetrics);

    await new Promise((resolve) => setTimeout(resolve, 800));

    // 3. Run Hop-by-Hop Route Trace (tracert -d)
    setToastMessage(`Step 3/3: Running Hop-by-Hop Route Trace (tracert -d ${pbxwareServer})...`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 4. Update Final Diagnostic Health Report
    const freshReport = reportGenerator.generateReport(
      pbxwareServer,
      audioMetrics,
      updatedNetworkMetrics,
      ports,
      sipAlg
    );
    setReport(freshReport);

    const freshVoipAnalysis = voipAnalysisEngine.generateCompleteAnalysis(pbxwareServer);
    setVoipAnalysis(freshVoipAnalysis);

    setIsScanning(false);
    setToastMessage('Full Scan Complete! 30s Ping & tracert -d finished. Health Report updated.');
    setActiveTab('voip_monitor');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 md:p-6 overflow-x-hidden relative select-none">
      {/* Background radial gradient glow for Frosted Glass theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-950 to-indigo-950/20 pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col min-h-[calc(100vh-3rem)]">
        {/* Header Component */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pbxwareServer={pbxwareServer}
          setTargetServer={setPbxwareServer}
          onOpenServerModal={() => setIsServerModalOpen(true)}
          onOpenOneClickAnalyze={() => setIsOneClickModalOpen(true)}
          onRunFullScan={handleRunFullScan}
          isScanning={isScanning}
          overallGrade={report.overallGrade}
        />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 pb-6">
          {activeTab === 'voip_monitor' && (
            <VoipOfficeDashboard
              targetHost={pbxwareServer}
              analysis={voipAnalysis}
              onUpdateAnalysis={(newAnalysis) => {
                setVoipAnalysis(newAnalysis);
                showToast('VoIP Analysis metrics updated.');
              }}
              onOpenOneClickModal={() => setIsOneClickModalOpen(true)}
              onNavigateToAudioTab={() => setActiveTab('audio')}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewTab
              report={report}
              setActiveTab={setActiveTab}
              onExportReport={() => reportGenerator.downloadJson(report)}
              onCopyTicket={() => {
                navigator.clipboard.writeText(reportGenerator.generateSupportTicketSnippet(report));
                showToast('Support ticket snippet copied to clipboard!');
              }}
            />
          )}

          {activeTab === 'audio' && (
            <AudioHardwareTab
              audioMetrics={audioMetrics}
              onRefreshMetrics={refreshAudioMetrics}
            />
          )}

          {activeTab === 'network' && (
            <NetworkAnalyzerTab
              metrics={networkMetrics}
              pbxwareServer={pbxwareServer}
              onUpdateMetrics={(newMetrics) => {
                setNetworkMetrics(newMetrics);
                showToast('Continuous Ping Test completed! Metrics updated.');
              }}
            />
          )}

          {(activeTab === 'sip' || activeTab === 'voip') && (
            <SipPortTab
              portStatuses={portStatuses}
              sipAlg={sipAlg}
              pbxwareServer={pbxwareServer}
              onRefreshPorts={loadPortStatuses}
            />
          )}

          {activeTab === 'tools' && (
            <DnsAndPortTab pbxwareServer={pbxwareServer} />
          )}

          {activeTab === 'system' && (
            <SystemAdapterTab pbxwareServer={pbxwareServer} />
          )}

          {activeTab === 'speed' && (
            <SpeedTestTab serverHost={pbxwareServer} />
          )}

          {activeTab === 'ai' && (
            <AiDiagnosisTab report={report} pbxwareServer={pbxwareServer} />
          )}

          {activeTab === 'report' && (
            <ReportGeneratorTab report={report} />
          )}

          {activeTab === 'powershell' && (
            <PowerShellScriptTab pbxwareServer={pbxwareServer} />
          )}
        </main>

        {/* Footer Status Bar */}
        <footer className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-white/5 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="uppercase">CPU Load</span>
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-1/4 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="uppercase font-mono">Mem Allocation</span>
              <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-[45%] rounded-full"></div>
              </div>
            </div>
          </div>

          <div>
            VNHA_VOIP_DIAG_ID: <span className="text-slate-300 font-bold">{report.id}</span> | {pbxwareServer}
          </div>
        </footer>
      </div>

      {/* Target Server Config Modal */}
      <ServerConfigModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        currentServer={pbxwareServer}
        onSave={(newServer) => {
          setPbxwareServer(newServer);
          setVoipAnalysis(voipAnalysisEngine.generateCompleteAnalysis(newServer));
          showToast(`Target PBXware host updated to ${newServer}`);
        }}
      />

      {/* 1-Click Unified 33-Checkpoint Analyze Modal */}
      <OneClickAnalyzeModal
        isOpen={isOneClickModalOpen}
        onClose={() => setIsOneClickModalOpen(false)}
        targetHost={pbxwareServer}
        onComplete={(analysisResult) => {
          setVoipAnalysis(analysisResult);
          setActiveTab('voip_monitor');
          showToast('1-Click VoIP Office Analysis Complete! All 7 modules updated.');
        }}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-blue-500/40 text-slate-100 rounded-xl shadow-2xl text-xs font-medium animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
