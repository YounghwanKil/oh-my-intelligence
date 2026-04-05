export type {
  Lane,
  Provider,
  ProviderStatus,
  RoutingDecision,
  ProviderInfo,
  TaskClassification,
  FallbackPromptSpec,
  PhaseMapping,
  OmiState,
} from '../types/index.js';

export interface ClassificationRule {
  taskType: string;
  lane: 'think' | 'do';
  keywords: string[];
  weight: number; // higher weight = higher confidence when matched
}

export interface ProviderCapability {
  provider: 'claude' | 'codex' | 'gemini';
  supportedLanes: ('think' | 'do')[];
  priority: number; // lower = preferred
}
