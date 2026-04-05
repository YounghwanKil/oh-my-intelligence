import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { RoutingDecision } from '../types/index.js';

export interface HudRoutingData {
  lane: string;
  provider: string;
  fallback: boolean;
  override: boolean;
  hybridWorkflow: string | null;
  hybridPhase: string | null;
  phaseIndex: number | null;
  phaseTotal: number | null;
}

interface HybridState {
  workflow: string;
  currentPhase: string;
  phaseIndex: number;
  totalPhases: number;
}

function readJsonSafe<T>(filePath: string): T | null {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function resolveOmiStateDir(projectRoot?: string): string {
  return join(projectRoot ?? process.cwd(), '.omi', 'state');
}

/**
 * Format: [Think:Claude] or [Do:Codex] or [Do:Claude(fallback)] or [autopilot:phase3/6 Do:Codex]
 */
export function formatRoutingDisplay(data: HudRoutingData): string {
  const laneLabel = data.lane === 'think' ? 'Think' : 'Do';
  let providerLabel = data.provider.charAt(0).toUpperCase() + data.provider.slice(1);
  if (data.fallback) {
    providerLabel += '(fallback)';
  }

  const routingPart = `${laneLabel}:${providerLabel}`;

  if (data.hybridWorkflow && data.phaseIndex !== null && data.phaseTotal !== null) {
    return `[${data.hybridWorkflow}:phase${data.phaseIndex + 1}/${data.phaseTotal} ${routingPart}]`;
  }

  if (data.override) {
    return `[${routingPart} (override)]`;
  }

  return `[${routingPart}]`;
}

export function getRoutingData(projectRoot?: string): HudRoutingData {
  const stateDir = resolveOmiStateDir(projectRoot);

  // Read current routing decision
  const decision = readJsonSafe<RoutingDecision & { timestamp?: string }>(
    join(stateDir, 'router', 'current-decision.json'),
  );

  // Read hybrid workflow state
  const hybrid = readJsonSafe<HybridState>(
    join(stateDir, 'router', 'hybrid-state.json'),
  );

  if (!decision) {
    return {
      lane: 'think',
      provider: 'claude',
      fallback: false,
      override: false,
      hybridWorkflow: hybrid?.workflow ?? null,
      hybridPhase: hybrid?.currentPhase ?? null,
      phaseIndex: hybrid?.phaseIndex ?? null,
      phaseTotal: hybrid?.totalPhases ?? null,
    };
  }

  return {
    lane: decision.lane,
    provider: decision.provider,
    fallback: decision.fallback,
    override: decision.override,
    hybridWorkflow: hybrid?.workflow ?? null,
    hybridPhase: hybrid?.currentPhase ?? null,
    phaseIndex: hybrid?.phaseIndex ?? null,
    phaseTotal: hybrid?.totalPhases ?? null,
  };
}
