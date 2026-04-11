/**
 * OMI Session Start Hook
 *
 * ADR-001a: Order-independent — reads .omc/state/ as downstream consumer, never writes to .omc/
 * ADR-003: Checks OMC/OMX versions against minimums
 *
 * Runs on SessionStart event. Detects providers, initializes .omi/ state.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';

const SCHEMA_VERSION = '1.0';
const MIN_OMC_VERSION = '4.10.0';
const MIN_OMX_VERSION = '0.11.0';

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, '.git')) || existsSync(join(dir, '.omc'))) return dir;
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

function readTextSafe(filePath) {
  try {
    if (!existsSync(filePath)) return undefined;
    const value = readFileSync(filePath, 'utf-8').trim();
    return value || undefined;
  } catch { return undefined; }
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

function detectOmc(root) {
  const omcDir = join(root, '.omc');
  if (!existsSync(omcDir)) return { installed: false };

  const localVersion = readTextSafe(join(omcDir, 'version'));
  if (localVersion) {
    return { installed: true, version: localVersion, path: omcDir };
  }

  // Try to read OMC package.json from plugin
  const pluginPaths = [
    join(root, 'node_modules', 'oh-my-claude-sisyphus', 'package.json'),
    join(root, '.claude', 'plugins', 'marketplaces', 'omc', 'package.json'),
  ];

  let version = undefined;
  for (const p of pluginPaths) {
    const pkg = readJsonSafe(p);
    if (pkg?.version) { version = pkg.version; break; }
  }

  return { installed: true, version, path: omcDir };
}

function detectOmx(root) {
  const omxDir = join(root, '.omx');
  if (!existsSync(omxDir)) return { installed: false };

  const localVersion = readTextSafe(join(omxDir, 'version'));
  if (localVersion) {
    return { installed: true, version: localVersion, path: omxDir };
  }

  const pluginPaths = [
    join(root, 'node_modules', 'oh-my-codex', 'package.json'),
    join(root, '.codex', 'package.json'),
  ];

  let version = undefined;
  for (const p of pluginPaths) {
    const pkg = readJsonSafe(p);
    if (pkg?.version) { version = pkg.version; break; }
  }

  return { installed: true, version, path: omxDir };
}

import { execSync } from 'child_process';

function detectClaudeCode() {
  // Check if Claude Code CLI is available
  try {
    execSync('which claude 2>/dev/null || where claude 2>nul', { stdio: 'pipe' });
    return { installed: true };
  } catch {
    return { installed: false };
  }
}

function detectCodexCli() {
  // Check if Codex CLI is available
  try {
    execSync('which codex 2>/dev/null || where codex 2>nul', { stdio: 'pipe' });
    return { installed: true };
  } catch {
    return { installed: false };
  }
}

export default async function sessionStart() {
  const root = findProjectRoot();
  const omiState = join(root, '.omi', 'state');

  // Initialize .omi/ directory structure
  const dirs = [
    join(omiState, 'router'),
    join(omiState, 'providers'),
    join(omiState, 'sessions'),
    join(root, '.omi', 'plans'),
    join(root, '.omi', 'logs'),
  ];
  for (const d of dirs) {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  }

  // ── Auto-install OMI HUD into Claude Code settings (idempotent) ────────────
  try {
    const { ensureHudInstalled } = await import('./hud-installer.mjs');
    ensureHudInstalled({ projectRoot: root });
  } catch (err) {
    if (process.env.OMI_DEBUG) {
      process.stderr.write('[OMI] HUD install skipped: ' + (err && err.message) + '\n');
    }
  }

  // ── Auth & CLI Detection ───────────────────────────────────────────────────
  const claudeCli = detectClaudeCode();
  const codexCli = detectCodexCli();

  const errors = [];
  if (!claudeCli.installed) {
    errors.push('Claude Code CLI not found. Install: https://docs.anthropic.com/en/docs/claude-code');
  }
  if (!codexCli.installed) {
    errors.push('Codex CLI not found. Install: npm i -g @openai/codex');
  }

  // ── Provider Detection ─────────────────────────────────────────────────────
  const omc = detectOmc(root);
  const omx = detectOmx(root);

  const providers = [];
  const warnings = [];

  providers.push({
    name: 'claude',
    status: omc.installed && claudeCli.installed ? 'available' : 'unavailable',
    version: omc.version || undefined,
    minVersion: MIN_OMC_VERSION,
    cliInstalled: claudeCli.installed,
    plugin: 'oh-my-claudecode',
  });

  if (omc.installed && omc.version && compareVersions(omc.version, MIN_OMC_VERSION) < 0) {
    warnings.push(`OMC version ${omc.version} is below minimum ${MIN_OMC_VERSION}. Some features may not work correctly.`);
  } else if (!omc.installed) {
    errors.push('OMC (oh-my-claudecode) not detected. OMI requires OMC to function.');
  }

  providers.push({
    name: 'codex',
    status: omx.installed && codexCli.installed ? 'available' : 'unavailable',
    version: omx.version || undefined,
    minVersion: MIN_OMX_VERSION,
    cliInstalled: codexCli.installed,
    plugin: 'oh-my-codex',
  });

  if (omx.installed && omx.version && compareVersions(omx.version, MIN_OMX_VERSION) < 0) {
    warnings.push(`OMX version ${omx.version} is below minimum ${MIN_OMX_VERSION}. Codex features may not work correctly.`);
  } else if (!omx.installed) {
    warnings.push('OMX (oh-my-codex) not detected. Do Lane will use Claude fallback.');
  }

  // Write provider state
  atomicWriteJson(join(omiState, 'providers', 'detected.json'), { providers });

  // Write warnings/errors
  if (warnings.length > 0 || errors.length > 0) {
    atomicWriteJson(join(omiState, 'providers', 'version-warning.json'), { warnings, errors });
  } else {
    try {
      unlinkSync(join(omiState, 'providers', 'version-warning.json'));
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  // Read OMC session state if available (ADR-001a: downstream consumer)
  const omcSessionDir = join(root, '.omc', 'state', 'sessions');
  let omcSession = null;
  if (existsSync(omcSessionDir)) {
    try {
      omcSession = { detected: true, path: omcSessionDir };
    } catch { /* graceful — OMC state may not be ready yet */ }
  }

  // Write OMI session state
  atomicWriteJson(join(omiState, 'sessions', 'current.json'), {
    startedAt: new Date().toISOString(),
    claudeCodeInstalled: claudeCli.installed,
    codexCliInstalled: codexCli.installed,
    omcDetected: omc.installed,
    omxDetected: omx.installed,
    omcSession,
    codexAvailable: omx.installed && codexCli.installed,
  });

  // ── Output ─────────────────────────────────────────────────────────────────
  const lines = [];

  // Header
  lines.push('');
  lines.push('  OMI — Oh My Intelligence v1.0.0');
  lines.push('  ════════════════════════════════');

  // CLI Auth Status
  const claudeIcon = claudeCli.installed ? '✓' : '✗';
  const codexIcon = codexCli.installed ? '✓' : '✗';
  lines.push(`  Claude Code CLI:  ${claudeIcon}`);
  lines.push(`  Codex CLI:        ${codexIcon}`);

  // Plugin Status
  const omcIcon = omc.installed ? `✓ v${omc.version || '?'}` : '✗ not found';
  const omxIcon = omx.installed ? `✓ v${omx.version || '?'}` : '✗ not found';
  lines.push(`  OMC (Claude):     ${omcIcon}`);
  lines.push(`  OMX (Codex):      ${omxIcon}`);

  // Routing info
  const doProvider = (omx.installed && codexCli.installed) ? 'Codex' : 'Claude (fallback)';
  lines.push('');
  lines.push(`  Think Lane → Claude`);
  lines.push(`  Do Lane    → ${doProvider}`);

  // Errors
  if (errors.length > 0) {
    lines.push('');
    lines.push('  ⚠ ERRORS:');
    for (const e of errors) {
      lines.push(`    • ${e}`);
    }
  }

  // Warnings
  if (warnings.length > 0) {
    lines.push('');
    lines.push('  ⚠ Warnings:');
    for (const w of warnings) {
      lines.push(`    • ${w}`);
    }
  }

  // Usage hint
  lines.push('');
  lines.push('  You can now use:');
  lines.push('  - /think — force Claude (planning, review, debugging)');
  lines.push('  - /do — force Codex (implementation, quick fixes)');
  lines.push('  - /route — check current routing status');
  lines.push('  - Or just describe your task and OMI auto-routes it');
  lines.push('');

  console.log(lines.join('\n'));
}
