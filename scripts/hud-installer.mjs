#!/usr/bin/env node
/**
 * OMI HUD Installer
 *
 * Copies the HUD wrapper to `~/.claude/hud/omi-hud.mjs` and patches
 * `~/.claude/settings.json` so Claude Code's statusLine points at it.
 * Idempotent — repeated invocations are no-ops when already installed.
 *
 * Usable as:
 *   - A library: `import { ensureHudInstalled } from "./hud-installer.mjs"`
 *   - A script:  `node scripts/hud-installer.mjs [--project-root <path>]`
 */
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  renameSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function atomicWriteJson(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = filePath + '.tmp';
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  renameSync(tmp, filePath);
}

function readJsonSafe(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function wrapperSource() {
  // Prefer the installed wrapper shipped alongside this installer.
  const candidate = resolve(__dirname, 'omi-hud.mjs');
  return existsSync(candidate) ? candidate : null;
}

/**
 * Install `omi-hud.mjs` to `~/.claude/hud/` and patch `settings.json`.
 * @param {object} opts
 * @param {string} [opts.projectRoot] — where to stash HUD backup JSON (defaults to cwd)
 * @returns {{ installed: boolean, hudPath: string, previous: object|null, note: string }}
 */
export function ensureHudInstalled(opts = {}) {
  const home = homedir();
  const hudDir = join(home, '.claude', 'hud');
  const hudPath = join(hudDir, 'omi-hud.mjs');
  const settingsPath = join(home, '.claude', 'settings.json');

  if (!existsSync(hudDir)) mkdirSync(hudDir, { recursive: true });

  const source = wrapperSource();
  if (source) {
    try {
      copyFileSync(source, hudPath);
    } catch (err) {
      return { installed: false, hudPath, previous: null, note: 'copy failed: ' + (err && err.message) };
    }
  } else if (!existsSync(hudPath)) {
    return { installed: false, hudPath, previous: null, note: 'omi-hud.mjs source not found' };
  }

  const desiredCmd = `node ${hudPath}`;
  const settings = readJsonSafe(settingsPath) || {};
  const current = settings.statusLine || null;
  const alreadyOmi = current && current.type === 'command' && current.command === desiredCmd;

  if (alreadyOmi) {
    return { installed: true, hudPath, previous: null, note: 'already active' };
  }

  let backup = null;
  if (current) {
    backup = current;
    const projectRoot = opts.projectRoot || process.cwd();
    const backupFile = join(projectRoot, '.omi', 'state', 'hud-backup.json');
    try {
      atomicWriteJson(backupFile, { statusLine: current, savedAt: new Date().toISOString() });
    } catch { /* best-effort */ }
  }

  settings.statusLine = { type: 'command', command: desiredCmd };
  try {
    atomicWriteJson(settingsPath, settings);
  } catch (err) {
    return { installed: false, hudPath, previous: backup, note: 'settings write failed: ' + (err && err.message) };
  }

  return { installed: true, hudPath, previous: backup, note: backup ? 'replaced previous' : 'new' };
}

/**
 * Restore the previously saved statusLine from the project's hud-backup.json.
 */
export function restoreHud(opts = {}) {
  const home = homedir();
  const settingsPath = join(home, '.claude', 'settings.json');
  const projectRoot = opts.projectRoot || process.cwd();
  const backupFile = join(projectRoot, '.omi', 'state', 'hud-backup.json');

  const backup = readJsonSafe(backupFile);
  const settings = readJsonSafe(settingsPath) || {};

  if (backup && backup.statusLine) {
    settings.statusLine = backup.statusLine;
  } else {
    delete settings.statusLine;
  }

  try {
    atomicWriteJson(settingsPath, settings);
    return { restored: true, note: backup ? 'restored from backup' : 'cleared statusLine' };
  } catch (err) {
    return { restored: false, note: 'settings write failed: ' + (err && err.message) };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf('--project-root');
  const projectRoot = rootIdx >= 0 ? args[rootIdx + 1] : process.cwd();
  const disable = args.includes('--disable');
  const result = disable
    ? restoreHud({ projectRoot })
    : ensureHudInstalled({ projectRoot });
  process.stdout.write(JSON.stringify(result) + '\n');
}
