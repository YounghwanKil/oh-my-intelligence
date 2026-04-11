/**
 * OMI Provider Detector
 *
 * Utility module for detecting installed providers (OMC, OMX).
 * Used by session-start.mjs and other hooks.
 *
 * ADR-001a: Read-only — never writes to .omc/ or .omx/
 * ADR-003: Checks version compatibility
 */
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';

const MIN_OMC_VERSION = '4.10.0';
const MIN_OMX_VERSION = '0.11.0';

/**
 * Find the project root by walking up from cwd looking for .git or .omc
 */
export function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, '.git')) || existsSync(join(dir, '.omc'))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

/**
 * Safely read and parse a JSON file. Returns null on any error.
 */
export function readJsonSafe(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function readTextSafe(filePath) {
  try {
    if (!existsSync(filePath)) return undefined;
    const value = readFileSync(filePath, 'utf-8').trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Compare two semver strings. Returns -1, 0, or 1.
 */
export function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

/**
 * Detect OMC installation. Returns { installed, version?, path? }
 */
export function detectOmc(root) {
  if (!root) root = findProjectRoot();
  const omcDir = join(root, '.omc');
  if (!existsSync(omcDir)) return { installed: false };

  const localVersion = readTextSafe(join(omcDir, 'version'));
  if (localVersion) {
    return { installed: true, version: localVersion, path: omcDir };
  }

  // Try to find OMC version from known paths
  const candidates = [
    join(root, 'node_modules', 'oh-my-claude-sisyphus', 'package.json'),
    join(root, '.claude', 'plugins', 'marketplaces', 'omc', 'package.json'),
  ];

  // Also check home directory plugin paths
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    candidates.push(join(home, '.claude', 'plugins', 'marketplaces', 'omc', 'package.json'));
  }

  let version = undefined;
  for (const p of candidates) {
    const pkg = readJsonSafe(p);
    if (pkg?.version) { version = pkg.version; break; }
  }

  return { installed: true, version, path: omcDir };
}

/**
 * Detect OMX installation. Returns { installed, version?, path? }
 */
export function detectOmx(root) {
  if (!root) root = findProjectRoot();
  const omxDir = join(root, '.omx');
  if (!existsSync(omxDir)) return { installed: false };

  const localVersion = readTextSafe(join(omxDir, 'version'));
  if (localVersion) {
    return { installed: true, version: localVersion, path: omxDir };
  }

  const candidates = [
    join(root, 'node_modules', 'oh-my-codex', 'package.json'),
    join(root, '.codex', 'package.json'),
  ];

  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    candidates.push(join(home, '.codex', 'package.json'));
  }

  let version = undefined;
  for (const p of candidates) {
    const pkg = readJsonSafe(p);
    if (pkg?.version) { version = pkg.version; break; }
  }

  return { installed: true, version, path: omxDir };
}

/**
 * Get all detected providers with version check results.
 */
export function detectAllProviders(root) {
  if (!root) root = findProjectRoot();

  const omc = detectOmc(root);
  const omx = detectOmx(root);
  const providers = [];
  const warnings = [];

  if (omc.installed) {
    const status = 'available';
    providers.push({ name: 'claude', status, version: omc.version, minVersion: MIN_OMC_VERSION });
    if (omc.version && compareVersions(omc.version, MIN_OMC_VERSION) < 0) {
      warnings.push(`OMC ${omc.version} < ${MIN_OMC_VERSION}`);
    }
  } else {
    providers.push({ name: 'claude', status: 'unavailable' });
    warnings.push('OMC not detected');
  }

  if (omx.installed) {
    providers.push({ name: 'codex', status: 'available', version: omx.version, minVersion: MIN_OMX_VERSION });
    if (omx.version && compareVersions(omx.version, MIN_OMX_VERSION) < 0) {
      warnings.push(`OMX ${omx.version} < ${MIN_OMX_VERSION}`);
    }
  } else {
    providers.push({ name: 'codex', status: 'unavailable' });
  }

  return { providers, warnings };
}
