export interface AudioDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  sampleRate?: number;
  channels?: number;
  isDefault?: boolean;
}

export interface AudioMetrics {
  rmsLevel: number;
  peakLevel: number;
  peakDbFS: number;
  noiseFloorDbFS: number;
  isClipping: boolean;
  micPermissionGranted: boolean;
  activeMicName: string;
  activeSpeakerName: string;
  latencyMs: number;
  echoDetected: boolean;
}

export interface ToneGeneratorState {
  isPlaying: boolean;
  frequency: number;
  type: OscillatorType;
  balance: 'both' | 'left' | 'right';
  volume: number;
  isSweeping: boolean;
}

export interface PingPacket {
  seq: number;
  rttMs: number;
  ttl: number;
  status: 'SUCCESS' | 'TIMEOUT' | 'ERROR';
}

export interface PingSummary {
  packetsSent: number;
  packetsReceived: number;
  packetLossPercent: number;
  minRttMs: number;
  maxRttMs: number;
  avgRttMs: number;
  packets: PingPacket[];
}

export interface NetworkMetrics {
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  rttHistory: number[];
  jitterHistory: number[];
  ratingText: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  pingSummary: PingSummary;
  tracertNoResolve: boolean;
}

export interface CodecComparison {
  name: string;
  bitrateKbps: number;
  sampleRateKhz: number;
  suitability: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'UNSUITABLE';
  notes: string;
}

export interface NetworkHop {
  hopNumber: number;
  name: string;
  ip: string;
  rttMs: number;
  jitterMs: number;
  packetLossPercent: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  location: string;
}

export type PortStatusType = 'REACHABLE' | 'BLOCKED' | 'FILTERED' | 'CHECKING';

export interface PortStatus {
  id: string;
  name: string;
  port: number | string;
  protocol: 'UDP' | 'TCP' | 'WSS';
  description: string;
  status: PortStatusType;
  responseTimeMs: number;
  notes: string;
}

export interface SipAlgResult {
  detected: boolean;
  severity: 'HIGH' | 'MEDIUM' | 'NONE';
  headerTampered: boolean;
  sdpModified: boolean;
  details: string;
  recommendations: string[];
  originalSdpIp?: string;
  observedSdpIp?: string;
  observedPublicSource?: string;
}

export interface IssueItem {
  id: string;
  category: 'AUDIO' | 'NETWORK' | 'SIP' | 'HARDWARE';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  remedy: string;
}

// -------------------------------------------------------------
// 33-POINT VOIP OFFICE NETWORK MONITOR EXTENSIONS
// -------------------------------------------------------------

// 1. PC / Endpoint Health
export interface ProcessBandwidth {
  name: string;
  usageText: string;
  usageKbps: number;
  category: 'voip' | 'cloud' | 'system' | 'browser';
}

export interface EndpointHealth {
  windowsVersion: string;
  windowsBuild: string;
  hostname: string;
  cpuPercentBefore: number;
  cpuPercentDuring: number;
  ramPercentBefore: number;
  ramPercentDuring: number;
  diskPercent: number;
  adapterName: string;
  connectionType: 'Ethernet' | 'Wi-Fi';
  wifiSignalDbm: number;
  wifiSignalPercent: number;
  wifiLinkSpeedMbps: number;
  wifiBand: '2.4 GHz' | '5 GHz' | '6 GHz';
  wifiChannel: number;
  wifiChannelWidthMhz: number;
  driverVersion: string;
  driverDate: string;
  powerSavingNicEnabled: boolean;
  energyEfficientEthernet: boolean;
  defaultGateway: string;
  dnsServers: string[];
  localIp: string;
  publicWanIp: string;
  vpnDetected: boolean;
  vpnName?: string;
  vpnType?: 'Split Tunnel' | 'Full Tunnel';
  vpnLatencyPenaltyMs?: number;
  proxyDetected: boolean;
  multipleActiveAdapters: boolean;
  virtualAdaptersDetected: string[];
  bluetoothConflictDetected: boolean;
  firewallStatus: 'Enabled (Protected)' | 'Disabled' | 'Partial';
  windowsDefenderStatus: 'Active & Updated' | 'Disabled' | 'Third-Party Active';
  backgroundApps: ProcessBandwidth[];
}

// 2. Multi-Target Ping Matrix
export interface TargetPingResult {
  targetKey: string;
  label: string;
  ip: string;
  packetsSent: number;
  packetsReceived: number;
  packetLossPercent: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  avgLatencyMs: number;
  mdevMs: number;
  jitterMs: number;
  maxDeltaMs: number;
  scope: 'LAN' | 'BEYOND_LAN';
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

// 3. Continuous Packet-Loss & Latency Monitor
export interface ContinuousDataPoint {
  timeStr: string;
  timestamp: number;
  latencyMs: number;
  lossPercent: number;
  jitterMs: number;
  isOutage: boolean;
  isCallWindow: boolean;
}

// 4. MTR Hop
export interface MtrHopItem {
  hopNumber: number;
  ip: string;
  hostname: string;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  packetLossPercent: number;
  jitterMs: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

// 5. SIP Signaling & Call Ladder
export interface SipLadderMessage {
  id: string;
  timeStr: string;
  from: 'PC' | 'PBX' | 'Carrier';
  to: 'PC' | 'PBX' | 'Carrier';
  methodOrCode: string;
  type: 'REQUEST' | 'PROVISIONAL' | 'SUCCESS' | 'FAILURE' | 'MEDIA';
  summary: string;
  details?: string;
}

export interface SipTimingAnalysis {
  inviteToTryingMs: number;
  inviteToRingingMs: number;
  inviteTo200OkSec: number;
  okToAckMs: number;
  callDurationSec: number;
  byeTimestampStr: string;
  byeOrigin: 'PC → PBX' | 'PBX → PC' | 'Carrier';
  disconnectReason: string;
  q850Cause: number;
  q850Text: string;
}

// 7. RTP Dual-Stream Telemetry
export interface RtpStreamMetrics {
  streamId: 0 | 1;
  direction: 'PC → Server (Upload)' | 'Server → PC (Download)';
  packetsExpected: number;
  packetsReceived: number;
  packetsLost: number;
  lossPercent: number;
  outOfOrder: number;
  duplicatePackets: number;
  latePackets: number;
  minDeltaMs: number;
  maxDeltaMs: number;
  meanDeltaMs: number;
  avgJitterMs: number;
  maxJitterMs: number;
  timestampGaps: number;
  status: 'PASS' | 'WARNING' | 'CRITICAL';
}

export interface RtpSequenceItem {
  seq: number;
  status: 'OK' | 'LOST' | 'OUT_OF_ORDER' | 'DUPLICATE';
  deltaMs: number;
}

// 9. Estimated MOS
export interface EstimatedMos {
  mosScore: number;
  rFactor: number;
  qualityGrade: 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Very Poor';
  color: string;
  explanation: string;
}

// 10. Codec Analysis
export interface CodecAnalysis {
  name: string;
  payloadType: number;
  packetizationMs: number;
  clockRateHz: number;
  codecMismatch: boolean;
  unsupportedCodec: boolean;
  payloadMismatch: boolean;
  transcodingDetected: boolean;
}

// 11 & 12. Audio Presence
export interface AudioPresenceResult {
  oneWayAudio: boolean;
  oneWayDescription?: string;
  noAudioDetected: boolean;
  noAudioRootCauses?: string[];
}

// 21. Bufferbloat
export interface BufferbloatAnalysis {
  idleLatencyMs: number;
  downloadLoadLatencyMs: number;
  uploadLoadLatencyMs: number;
  increaseMs: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  detected: boolean;
  summary: string;
}

// 25. Call-Quality Event Timeline
export interface CallQualityEvent {
  timeStr: string;
  category: 'SIP' | 'RTP' | 'WIFI' | 'SYSTEM' | 'AUDIO';
  label: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  detail: string;
}

// 27. Jitter Buffer
export interface JitterBufferStats {
  bufferSizeMs: number;
  underruns: number;
  overruns: number;
  latePackets: number;
  concealedPacketsPlc: number;
  impactNote: string;
}

// 28. DTMF Analysis
export interface DtmfTestResult {
  rfc2833Supported: boolean;
  sipInfoSupported: boolean;
  inBandSupported: boolean;
  dtmfMismatchDetected: boolean;
  notes: string;
}

// 30. Voice Break Classification
export interface VoiceBreakClassification {
  level: 'Good' | 'Warning' | 'Critical';
  color: 'emerald' | 'amber' | 'rose';
  summary: string;
}

// Complete 7-Module Unified VoIP Office Diagnostic Report
export interface CompleteVoipOfficeAnalysis {
  id: string;
  timestamp: string;
  customerName: string;
  companyName: string;
  extension: string;
  callId: string;
  callDurationSec: number;
  targetHost: string;
  
  // 1. Endpoint Health
  endpointHealth: EndpointHealth;
  
  // 2. LAN & Wi-Fi
  wifiAnalysis: {
    ssid: string;
    bssid: string;
    signalDbm: number;
    rssiPercent: number;
    channel: number;
    channelWidthMhz: number;
    band: string;
    linkSpeedMbps: number;
    txRxRate: string;
    roamingEvents: number;
    disconnects: number;
    assessment: string;
  };
  ethernetAnalysis: {
    linkSpeedMbps: number;
    duplex: string;
    isHalfDuplexWarning: boolean;
    nicErrors: number;
    resets: number;
    crcErrors: number;
  };
  natAnalysis: {
    sdpIp: string;
    publicIp: string;
    advertisedPort: number;
    actualSourceIp: string;
    natType: string;
    isMismatched: boolean;
  };
  ipv6Analysis: {
    hasIpv6: boolean;
    ipv6Reachable: boolean;
    warningNote?: string;
  };
  
  // 3. Internet & WAN
  multiTargetPings: TargetPingResult[];
  continuousPoints: ContinuousDataPoint[];
  mtrHops: MtrHopItem[];
  dnsDiagnostics: {
    resolutionMs: number;
    srvRecords: string[];
    aRecords: string[];
    dnsFailure: boolean;
    dnsHijackingSuspected: boolean;
  };
  bufferbloat: BufferbloatAnalysis;
  
  // 4. SIP Signaling
  sipLadder: SipLadderMessage[];
  sipTiming: SipTimingAnalysis;
  sipRegistration: {
    status: 'REGISTERED' | 'UNAUTHORIZED' | 'FAILED' | 'EXPIRED';
    expirySec: number;
    reRegistrationIntervalSec: number;
    failuresCount: number;
    lastResponse: string;
  };
  sipAlg: SipAlgResult;
  dtmf: DtmfTestResult;
  firewallTest: {
    sipUdp5060: boolean;
    sipTcp5060: boolean;
    sipTls5061: boolean;
    rtpUdpRange: boolean;
    sipVerdict: 'PASS' | 'FAILED';
    rtpVerdict: 'PASS' | 'FAILED';
  };
  
  // 5. RTP & Audio
  stream0Upload: RtpStreamMetrics;
  stream1Download: RtpStreamMetrics;
  sequenceSamples: RtpSequenceItem[];
  codec: CodecAnalysis;
  audioPresence: AudioPresenceResult;
  jitterBuffer: JitterBufferStats;
  audioHardware: AudioMetrics;
  
  // 6. Call Quality & MOS Engine
  estimatedMos: EstimatedMos;
  mosEngine: {
    estimatedMos: number;
    rFactor: number;
    ratingCategory: string;
    explanation: string;
  };
  voiceBreakClassification: VoiceBreakClassification;
  voiceClassification: {
    trafficStatus: 'GOOD' | 'WARNING' | 'CRITICAL';
    level?: 'Good' | 'Warning' | 'Critical';
    color?: 'emerald' | 'amber' | 'rose';
    summary?: string;
  };
  callTimeline: CallQualityEvent[];
  timeline: Array<{
    timeStr: string;
    eventType: string;
    label: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    description: string;
    metricsSnapshot?: {
      latencyMs?: number;
      jitterMs?: number;
      lossPercent?: number;
      wifiRssiDbm?: number;
    };
  }>;
  
  // 7. AI Diagnostic & Final Report
  aiDiagnosticSynthesis: string;
  aiReport: {
    narrativeSynthesis: string;
    confidenceRating: 'HIGH' | 'MEDIUM' | 'LOW';
    primaryCause: string;
    affectedDirection: string;
    evidence: string[];
    recommendedFix: string;
  };
  rootCauseConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  primaryIssueCategory: 'LAN_WIFI' | 'WAN_INTERNET' | 'SIP_SIGNALING' | 'RTP_DOWNSTREAM' | 'ENDPOINT_PC' | 'FIREWALL_NAT' | 'OPTIMAL';
  recommendedActions: string[];
  rawTextReport: string;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  pbxwareServer: string;
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  overallStatusText: string;
  audioMetrics: AudioMetrics;
  networkMetrics: NetworkMetrics;
  portStatuses: PortStatus[];
  sipAlg: SipAlgResult;
  issues: IssueItem[];
  recommendations: string[];
  completeAnalysis?: CompleteVoipOfficeAnalysis;
}

export interface PowerShellConfig {
  pbxwareIp: string;
  sipPort: number;
  rtpRangeStart: number;
  rtpRangeEnd: number;
  checkAudioService: boolean;
  checkMtu: boolean;
  runTracert: boolean;
  tracertNoResolve: boolean;
  pingCount: number;
}

export interface AiDiagnosticAnalysisResponse {
  summary: string;
  rootCause: string;
  severity: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  recommendedActions: string[];
  pbXwareSettingsToVerify: string[];
}

export interface DnsProviderBenchmark {
  name: string;
  ip: string;
  responseTimeMs: number;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  reliability: string;
}

export interface SystemAdapterInfo {
  adapterName: string;
  macAddress: string;
  ipv4: string;
  ipv6: string;
  gateway: string;
  subnet: string;
  dnsServers: string[];
  speedMbps: number;
  duplex: string;
  mtu: number;
  driverVersion: string;
  connectionType: 'Ethernet' | 'Wi-Fi' | 'VPN';
  wifiSsid?: string;
  wifiSignalStrengthDbm?: number;
  wifiChannel?: number;
  wifiSecurity?: string;
}

export interface SystemResourceInfo {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  uptimeHours: number;
  healthScore: number;
  overallNetworkScore: number;
  gradeLevel: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';
}

export type OneClickProfileId = 'home' | 'office' | 'voip' | 'cloud' | 'gaming' | 'videoconf';

export interface CustomerInfo {
  customerName: string;
  companyName: string;
  extension: string;
  targetServer: string;
  dateTimestamp: string;
}

export interface HealthScoreBreakdown {
  internet: number;
  wifi: number;
  dns: number;
  ports: number;
  audio: number;
  voip: number;
  overall: number;
}

export interface SpeedTestMetrics {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  bufferbloatMs: number;
  bufferbloatGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  isTesting: boolean;
}

export interface SipTestDetails {
  registerTimeMs: number;
  optionsTimeMs: number;
  inviteTimeMs: number;
  transport: 'UDP' | 'TCP' | 'TLS';
  natType: 'Symmetric NAT' | 'Full Cone NAT' | 'Restricted Cone NAT' | 'Port Restricted Cone';
  keepAliveOk: boolean;
  privateIp: string;
  publicIp: string;
  authentication: 'MD5 Digest' | 'Mutual TLS' | 'IP Whitelist';
}

export interface RtpQualityMetrics {
  mosScore: number;
  rFactor: number;
  jitterMs: number;
  packetLossPercent: number;
  latencyMs: number;
  codec: string;
  silenceDetected: boolean;
  oneWayAudioDetected: boolean;
}

export interface OneClickProfile {
  id: OneClickProfileId;
  name: string;
  iconName: string;
  description: string;
  targetPorts: number[];
  pingCount: number;
  expectedMaxLatencyMs: number;
}
