// Think/Do classification
export type Lane = 'think' | 'do';
export type Provider = 'claude' | 'codex' | 'gemini';
export type ProviderStatus = 'available' | 'unavailable' | 'degraded';

export interface RoutingDecision {
  lane: Lane;
  provider: Provider;
  confidence: number; // 0-1
  reason: string;
  override: boolean; // true if user forced via /think or /do
  fallback: boolean; // true if using Claude as Do fallback
  _schemaVersion: string;
}

export interface ProviderInfo {
  name: Provider;
  status: ProviderStatus;
  version?: string;
  minVersion?: string;
  _schemaVersion: string;
}

export interface TaskClassification {
  input: string;
  lane: Lane;
  taskType: string;
  confidence: number;
  reason: string;
}

export interface FallbackPromptSpec {
  stripToolReferences: string[];
  injectToolMappings: Record<string, string>;
  systemPromptAdditions: string;
  postureMapping: Record<string, string>;
}

export interface PhaseMapping {
  omiPhase: string;
  omcPhase: string;
  omxPhase: string;
  lane: Lane;
}

export interface OmiState {
  activeProviders: ProviderInfo[];
  currentRouting: RoutingDecision | null;
  hybridPhase: string | null;
  _schemaVersion: string;
}
