/**
 * OMI Keyword Detector Hook
 *
 * ADR-001a: Order-independent — reads .omc/state/current-prompt.json as downstream consumer.
 * If OMC state is not yet available, falls back to independent keyword detection.
 * Never writes to .omc/ or .omx/.
 *
 * Detects /think, /do, /route commands and OMI-specific keywords.
 * Writes routing decisions to .omi/state/router/current-decision.json.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';

const SCHEMA_VERSION = '1.0';

// Think/Do classification patterns
const THINK_PATTERNS = [
  /\b(plan|design|architect|structure|how\s+should)\b/i,
  /\b(review|audit|check|vulnerability|security)\b/i,
  /\b(debug|trace|analyze|investigate|root\s+cause|why\s+(is|does|did))\b/i,
  /\b(test\s+strategy|test\s+design|what\s+to\s+test|coverage)\b/i,
  /\b(requirements|scope|acceptance\s+criteria)\b/i,
  /\b(experiment\s+design|architecture\s+selection|hyperparameter|model\s+comparison)\b/i,
  /\b(ui|ux|layout|wireframe|component\s+design)\b/i,
];

const DO_PATTERNS = [
  /\b(implement|build|create|refactor|write\s+code|add\s+feature)\b/i,
  /\b(write\s+test|fix\s+build|fix\s+lint|npm\s+test)\b/i,
  /\b(commit|push|merge|rebase|tag|release)\b/i,
  /\b(write\s+docs|update\s+readme|add\s+comments)\b/i,
  /\b(train|fine-tune|run\s+pipeline|preprocess\s+data)\b/i,
  /\b(fix\s+typo|rename|quick\s+fix|simple\s+change)\b/i,
];

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, '.git')) || existsSync(join(dir, '.omi')) || existsSync(join(dir, '.omc'))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

function atomicWriteJson(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = filePath + '.tmp';
  writeFileSync(tmp, JSON.stringify({ ...data, _schemaVersion: SCHEMA_VERSION }, null, 2));
  renameSync(tmp, filePath);
}

function readJsonSafe(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch { return null; }
}

function classifyInput(input) {
  const normalized = input.trim();

  // Check for explicit /think or /do override
  if (/^\/think\b/i.test(normalized)) {
    return { lane: 'think', override: true, reason: 'User forced Think via /think', confidence: 1.0 };
  }
  if (/^\/do\b/i.test(normalized)) {
    return { lane: 'do', override: true, reason: 'User forced Do via /do', confidence: 1.0 };
  }
  if (/^\/route\b/i.test(normalized)) {
    return { lane: 'think', override: false, reason: 'Route status display', confidence: 1.0, isRouteCommand: true };
  }

  // Pattern-based classification
  let thinkScore = 0;
  let doScore = 0;

  for (const pattern of THINK_PATTERNS) {
    if (pattern.test(normalized)) thinkScore++;
  }
  for (const pattern of DO_PATTERNS) {
    if (pattern.test(normalized)) doScore++;
  }

  const total = thinkScore + doScore;
  if (total === 0) {
    // Ambiguous — default to Think (safer, per ADR-002)
    return { lane: 'think', override: false, reason: 'Ambiguous input, defaulting to Think (safer)', confidence: 0.5 };
  }

  if (thinkScore > doScore) {
    return { lane: 'think', override: false, reason: `Think patterns matched (${thinkScore}/${total})`, confidence: thinkScore / total };
  }
  if (doScore > thinkScore) {
    return { lane: 'do', override: false, reason: `Do patterns matched (${doScore}/${total})`, confidence: doScore / total };
  }

  // Tie — default to Think
  return { lane: 'think', override: false, reason: 'Tie between Think/Do, defaulting to Think', confidence: 0.5 };
}

export default function keywordDetector() {
  const root = findProjectRoot();
  const input = process.env.USER_PROMPT || '';

  if (!input.trim()) return;

  // ADR-001a: Read OMC's prompt state as downstream consumer
  const omcPromptState = readJsonSafe(join(root, '.omc', 'state', 'current-prompt.json'));

  // Read provider state
  const providerState = readJsonSafe(join(root, '.omi', 'state', 'providers', 'detected.json'));
  const codexAvailable = providerState?.providers?.some(p => p.name === 'codex' && p.status === 'available') ?? false;

  // Classify the input
  const classification = classifyInput(input);

  // Determine actual provider
  let provider = 'claude';
  let fallback = false;

  if (classification.lane === 'do' && codexAvailable) {
    provider = 'codex';
  } else if (classification.lane === 'do' && !codexAvailable) {
    provider = 'claude';
    fallback = true;
  }

  // Write routing decision to .omi/state/ (never to .omc/ or .omx/)
  const decision = {
    lane: classification.lane,
    provider,
    confidence: classification.confidence,
    reason: classification.reason,
    override: classification.override,
    fallback,
    timestamp: new Date().toISOString(),
    omcContext: omcPromptState ? { detected: true } : { detected: false },
  };

  atomicWriteJson(join(root, '.omi', 'state', 'router', 'current-decision.json'), decision);

  // Output routing info for hook system
  const laneLabel = classification.lane === 'think' ? 'Think' : 'Do';
  const providerLabel = fallback ? `Claude(fallback)` : provider === 'codex' ? 'Codex' : 'Claude';
  const overrideLabel = classification.override ? ' (override)' : '';

  if (classification.isRouteCommand) {
    // /route command — output full status
    const providers = providerState?.providers || [];
    let status = '\n=== OMI Routing Status ===\n\nProviders:\n';
    for (const p of providers) {
      const icon = p.status === 'available' ? '✓' : '✗';
      status += `  ${p.name}: ${p.version || '?'} ${icon}\n`;
    }
    status += `\nCurrent: [${laneLabel}:${providerLabel}${overrideLabel}]\n`;
    console.log(status);
  } else {
    console.log(`[OMI] [${laneLabel}:${providerLabel}${overrideLabel}] ${classification.reason}`);
  }
}
