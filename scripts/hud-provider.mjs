/**
 * OMI HUD Provider Hook
 *
 * Reads .omi/state/ and outputs routing status for the HUD display system.
 * ADR-001a: only reads from .omi/, never writes to .omc/
 */
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, '.git')) || existsSync(join(dir, '.omi')) || existsSync(join(dir, '.omc'))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

function readJsonSafe(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function formatRoutingDisplay(data) {
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

export default function hudProvider() {
  const root = findProjectRoot();
  const stateDir = join(root, '.omi', 'state');

  // Read current routing decision from .omi/state/router/
  const decision = readJsonSafe(join(stateDir, 'router', 'current-decision.json'));
  const hybrid = readJsonSafe(join(stateDir, 'router', 'hybrid-state.json'));
  const providers = readJsonSafe(join(stateDir, 'providers', 'detected.json'));

  const data = {
    lane: decision?.lane ?? 'think',
    provider: decision?.provider ?? 'claude',
    fallback: decision?.fallback ?? false,
    override: decision?.override ?? false,
    hybridWorkflow: hybrid?.workflow ?? null,
    hybridPhase: hybrid?.currentPhase ?? null,
    phaseIndex: hybrid?.phaseIndex ?? null,
    phaseTotal: hybrid?.totalPhases ?? null,
  };

  const display = formatRoutingDisplay(data);

  // Build provider status summary
  const providerList = providers?.providers ?? [];
  const providerSummary = providerList
    .map((p) => {
      const icon = p.status === 'available' ? '\u2713' : '\u2717';
      return `${p.name}:${icon}`;
    })
    .join(' ');

  // Output for HUD consumption
  const output = {
    routing: data,
    display,
    providers: providerSummary,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(output));
}
