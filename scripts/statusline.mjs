/**
 * OMI StatusLine Hook
 *
 * Reads stdin JSON from Claude Code, combines OMI routing info with
 * context/session/token metrics, and outputs formatted status text.
 *
 * Stdin format: { transcript_path, cwd, model, context_window }
 * Output: formatted text to stdout
 *
 * ADR-001a: reads .omi/ state only, never writes to .omc/ or .omx/
 */
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { spawnSync } from 'child_process';

const VERSION = '1.0.3';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function readStdin() {
  try {
    const data = readFileSync(0, 'utf-8').trim();
    if (!data) return {};
    return JSON.parse(data);
  } catch { return {}; }
}

function formatTokens(n) {
  if (n == null) return '?';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDuration(minutes) {
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${Math.floor(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

// ── ANSI Colors ──────────────────────────────────────────────────────────────

const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';

// ── Routing Display ──────────────────────────────────────────────────────────

function getRoutingDisplay(root) {
  const stateDir = join(root, '.omi', 'state');
  const decision = readJsonSafe(join(stateDir, 'router', 'current-decision.json'));
  const hybrid = readJsonSafe(join(stateDir, 'router', 'hybrid-state.json'));

  const lane = decision?.lane ?? 'think';
  const provider = decision?.provider ?? 'claude';
  const fallback = decision?.fallback ?? false;
  const override = decision?.override ?? false;

  const laneColor = lane === 'think' ? CYAN : GREEN;
  const laneLabel = lane === 'think' ? 'Think' : 'Do';
  let providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
  if (fallback) providerLabel += ':fb';

  // Hybrid workflow display
  if (hybrid?.workflow && hybrid?.phaseIndex != null && hybrid?.totalPhases != null) {
    const phase = hybrid.phaseIndex + 1;
    const total = hybrid.totalPhases;
    return `${MAGENTA}${hybrid.workflow}${RESET}:${phase}/${total} ${laneColor}${laneLabel}${RESET}:${providerLabel}`;
  }

  let result = `${laneColor}${laneLabel}${RESET}:${providerLabel}`;
  if (override) result += `${DIM}(override)${RESET}`;
  return result;
}

// ── Provider Display ─────────────────────────────────────────────────────────

function getProviderDisplay(root) {
  const providers = readJsonSafe(join(root, '.omi', 'state', 'providers', 'detected.json'));
  if (!providers?.providers) return '';

  return providers.providers
    .map((p) => {
      const icon = p.status === 'available' ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
      const name = p.name === 'claude' ? 'C' : p.name === 'codex' ? 'X' : p.name.charAt(0).toUpperCase();
      return `${name}${icon}`;
    })
    .join('');
}

// ── Context Display ──────────────────────────────────────────────────────────

function getContextDisplay(stdin) {
  const cw = stdin?.context_window;
  if (!cw) return null;

  let pct = cw.used_percentage;
  if (pct == null && cw.current_usage && cw.context_window_size) {
    const used = (cw.current_usage.input_tokens || 0)
      + (cw.current_usage.cache_creation_input_tokens || 0)
      + (cw.current_usage.cache_read_input_tokens || 0);
    pct = Math.round((used / cw.context_window_size) * 100);
  }

  if (pct == null) return null;

  pct = Math.round(pct);
  let color = GREEN;
  if (pct >= 85) color = RED;
  else if (pct >= 70) color = YELLOW;

  return `${color}ctx:${pct}%${RESET}`;
}

// ── Token Display ────────────────────────────────────────────────────────────

function getTokenDisplay(stdin) {
  const cw = stdin?.context_window;
  if (!cw?.current_usage) return null;

  const input = cw.current_usage.input_tokens;
  const cached = (cw.current_usage.cache_read_input_tokens || 0);
  if (input == null) return null;

  return `${DIM}tok:${RESET}i${formatTokens(input)}${cached > 0 ? `/c${formatTokens(cached)}` : ''}`;
}

// ── Session Display ──────────────────────────────────────────────────────────

function getSessionDisplay(root) {
  const session = readJsonSafe(join(root, '.omi', 'state', 'sessions', 'current.json'));
  if (!session?.startedAt) return null;

  const start = new Date(session.startedAt);
  const minutes = (Date.now() - start.getTime()) / 60_000;

  let color = RESET;
  if (minutes > 120) color = RED;
  else if (minutes > 60) color = YELLOW;

  return `${color}session:${formatDuration(minutes)}${RESET}`;
}

// ── Model Display ────────────────────────────────────────────────────────────

function getModelDisplay(stdin) {
  if (!stdin?.model) return null;
  const name = stdin.model.display_name || stdin.model.id || '';
  // Shorten common model names
  if (name.includes('opus')) return `${DIM}opus${RESET}`;
  if (name.includes('sonnet')) return `${DIM}sonnet${RESET}`;
  if (name.includes('haiku')) return `${DIM}haiku${RESET}`;
  return name ? `${DIM}${name}${RESET}` : null;
}

// ── OMC chaining ─────────────────────────────────────────────────────────────

function chainOmcHud(stdinRaw) {
  if (process.env.OMI_NO_CHAIN === '1') return '';
  const omcHud = join(homedir(), '.claude', 'hud', 'omc-hud.mjs');
  if (!existsSync(omcHud)) return '';
  try {
    const result = spawnSync('node', [omcHud], {
      input: stdinRaw,
      encoding: 'utf-8',
      timeout: 2500,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    if (result.status !== 0) return '';
    return (result.stdout || '').replace(/\s+$/, '');
  } catch {
    return '';
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  let stdinRaw = '';
  try { stdinRaw = readFileSync(0, 'utf-8'); } catch { stdinRaw = ''; }
  let stdin = {};
  try { stdin = stdinRaw ? JSON.parse(stdinRaw) : {}; } catch { stdin = {}; }

  const root = findProjectRoot();

  // Build status line parts
  const parts = [];

  // 1. OMI version + routing
  const routing = getRoutingDisplay(root);
  parts.push(`${BOLD}[OMI#${VERSION}]${RESET} ${routing}`);

  // 2. Providers
  const providerDisplay = getProviderDisplay(root);
  if (providerDisplay) parts.push(providerDisplay);

  // 3. Context %
  const ctx = getContextDisplay(stdin);
  if (ctx) parts.push(ctx);

  // 4. Session duration
  const session = getSessionDisplay(root);
  if (session) parts.push(session);

  // 5. Tokens
  const tokens = getTokenDisplay(stdin);
  if (tokens) parts.push(tokens);

  // 6. Model
  const model = getModelDisplay(stdin);
  if (model) parts.push(model);

  const omiLine = parts.join(` ${DIM}|${RESET} `);

  // 7. Append OMC HUD output (if OMC is installed) so both plugins coexist.
  const omcLine = chainOmcHud(stdinRaw);

  const line = omcLine ? `${omiLine} ${DIM}•${RESET} ${omcLine}` : omiLine;
  process.stdout.write(line);
}

main();
