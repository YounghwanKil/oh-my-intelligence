/**
 * OMI Session Start Hook
 *
 * ADR-001a: Order-independent — reads .omc/state/ as downstream consumer, never writes to .omc/
 * ADR-003: Checks OMC/OMX versions against minimums
 *
 * Runs on SessionStart event. Detects providers, initializes .omi/ state.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'fs';
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

export default function sessionStart() {
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

  // Detect providers
  const omc = detectOmc(root);
  const omx = detectOmx(root);

  const providers = [];
  const warnings = [];

  if (omc.installed) {
    providers.push({
      name: 'claude',
      status: 'available',
      version: omc.version || 'unknown',
      minVersion: MIN_OMC_VERSION,
    });
    if (omc.version && compareVersions(omc.version, MIN_OMC_VERSION) < 0) {
      warnings.push(`OMC version ${omc.version} is below minimum ${MIN_OMC_VERSION}. Some features may not work correctly.`);
    }
  } else {
    providers.push({ name: 'claude', status: 'unavailable' });
    warnings.push('OMC (oh-my-claudecode) not detected. OMI requires OMC to function.');
  }

  if (omx.installed) {
    providers.push({
      name: 'codex',
      status: 'available',
      version: omx.version || 'unknown',
      minVersion: MIN_OMX_VERSION,
    });
    if (omx.version && compareVersions(omx.version, MIN_OMX_VERSION) < 0) {
      warnings.push(`OMX version ${omx.version} is below minimum ${MIN_OMX_VERSION}. Codex features may not work correctly.`);
    }
  } else {
    providers.push({ name: 'codex', status: 'unavailable' });
    // Not a warning — OMX is optional
  }

  // Write provider state
  atomicWriteJson(join(omiState, 'providers', 'detected.json'), { providers });

  // Write version warnings if any
  if (warnings.length > 0) {
    atomicWriteJson(join(omiState, 'providers', 'version-warning.json'), { warnings });
  }

  // Read OMC session state if available (ADR-001a: downstream consumer)
  const omcSessionDir = join(root, '.omc', 'state', 'sessions');
  let omcSession = null;
  if (existsSync(omcSessionDir)) {
    try {
      // Just note that OMC session exists — don't modify it
      omcSession = { detected: true, path: omcSessionDir };
    } catch { /* graceful — OMC state may not be ready yet */ }
  }

  // Write OMI session state
  atomicWriteJson(join(omiState, 'sessions', 'current.json'), {
    startedAt: new Date().toISOString(),
    omcDetected: omc.installed,
    omxDetected: omx.installed,
    omcSession,
    codexAvailable: omx.installed,
  });

  // Output for hook system
  const codexStatus = omx.installed ? '✓' : '(not installed, Claude fallback active)';
  let output = `[OMI] Providers: Claude ${omc.version || '?'} ✓ | Codex ${omx.version || '?'} ${codexStatus}`;
  if (warnings.length > 0) {
    output += `\n[OMI] Warnings: ${warnings.join('; ')}`;
  }

  console.log(output);
}
