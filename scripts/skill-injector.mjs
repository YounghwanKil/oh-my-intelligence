/**
 * OMI Skill Injector Hook
 *
 * Injects OMI-specific skill context on UserPromptSubmit.
 * Reads the current routing decision and provides Think/Do context to the session.
 *
 * ADR-001a: Only reads from .omc/, only writes to .omi/
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
  } catch { return null; }
}

export default function skillInjector() {
  const root = findProjectRoot();

  // Read current routing decision
  const decision = readJsonSafe(join(root, '.omi', 'state', 'router', 'current-decision.json'));
  if (!decision) return;

  // Read provider state
  const providerState = readJsonSafe(join(root, '.omi', 'state', 'providers', 'detected.json'));
  const codexAvailable = providerState?.providers?.some(p => p.name === 'codex' && p.status === 'available') ?? false;

  // Build context injection
  const laneLabel = decision.lane === 'think' ? 'Think' : 'Do';
  const providerLabel = decision.fallback ? 'Claude(fallback)' : decision.provider === 'codex' ? 'Codex' : 'Claude';

  let context = `[OMI:${laneLabel}:${providerLabel}]`;

  if (decision.lane === 'do' && decision.fallback) {
    context += ' Codex unavailable — using Claude with Do-optimized prompting. Focus on implementation and file mutations.';
  }

  if (decision.override) {
    context += ` (User override via /${decision.lane})`;
  }

  // Only output if we have meaningful routing info
  if (decision.lane && decision.provider) {
    console.log(context);
  }
}
