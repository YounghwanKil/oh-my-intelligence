import type { FallbackPromptSpec } from '../types/index.js';

const DEFAULT_FALLBACK: FallbackPromptSpec = {
  stripToolReferences: ['codex_run', 'codex_sandbox', 'omx_execute', 'omx_sparkshell'],
  injectToolMappings: {
    'codex_run': 'Bash',
    'codex_sandbox': 'Bash',
    'omx_execute': 'Bash',
  },
  systemPromptAdditions:
    'Focus on file mutations and direct implementation. Minimize reasoning output. Use tool-use-first approach. You are operating in Do mode — prioritize execution over analysis.',
  postureMapping: {
    'deep-worker': 'executor',
    'fast-lane': 'explore',
    'frontier-orchestrator': 'planner',
  },
};

export function getDefaultFallbackSpec(): FallbackPromptSpec {
  return { ...DEFAULT_FALLBACK };
}

export function applyFallback(
  task: string,
  spec: FallbackPromptSpec = DEFAULT_FALLBACK,
): string {
  let transformed = task;

  // Strip Codex-specific tool references
  for (const toolRef of spec.stripToolReferences) {
    const pattern = new RegExp(`\\b${escapeRegExp(toolRef)}\\b`, 'gi');
    const replacement = spec.injectToolMappings[toolRef];
    if (replacement) {
      transformed = transformed.replace(pattern, replacement);
    } else {
      transformed = transformed.replace(pattern, '');
    }
  }

  // Apply posture mappings
  for (const [codexPosture, claudePosture] of Object.entries(spec.postureMapping)) {
    const pattern = new RegExp(`\\b${escapeRegExp(codexPosture)}\\b`, 'gi');
    transformed = transformed.replace(pattern, claudePosture);
  }

  // Clean up any double spaces from removals
  transformed = transformed.replace(/  +/g, ' ').trim();

  // Prepend system prompt additions as context
  const prefix = `[Do-mode fallback] ${spec.systemPromptAdditions}\n\n`;

  return prefix + transformed;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
