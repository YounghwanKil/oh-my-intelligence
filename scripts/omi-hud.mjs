#!/usr/bin/env node
/**
 * OMI HUD — Statusline Wrapper
 *
 * Installed to `~/.claude/hud/omi-hud.mjs` and referenced from
 * `~/.claude/settings.json`'s `statusLine` field. Finds the real
 * OMI statusline.mjs inside the Claude Code plugin directory or npm
 * global install at runtime, then delegates to it.
 *
 * Kept in sync with OMC's omc-hud.mjs pattern so both plugins can
 * coexist via the same mechanism.
 */
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

function findStatuslineScript() {
  const home = homedir();
  const candidates = [];

  const pluginsRoot = join(home, '.claude', 'plugins');
  if (existsSync(pluginsRoot)) {
    for (const entry of readdirSync(pluginsRoot)) {
      if (entry.toLowerCase().includes('oh-my-intelligence')) {
        candidates.push(join(pluginsRoot, entry, 'scripts', 'statusline.mjs'));
      }
    }
    const marketplacesRoot = join(pluginsRoot, 'marketplaces');
    if (existsSync(marketplacesRoot)) {
      for (const entry of readdirSync(marketplacesRoot)) {
        const p = join(marketplacesRoot, entry, 'oh-my-intelligence', 'scripts', 'statusline.mjs');
        if (existsSync(p)) candidates.push(p);
      }
    }
  }

  try {
    const npmGlobalRoot = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (npmGlobalRoot) {
      candidates.push(join(npmGlobalRoot, 'oh-my-intelligence', 'scripts', 'statusline.mjs'));
    }
  } catch { /* ignore */ }

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const scriptPath = findStatuslineScript();
  if (!scriptPath) {
    process.stdout.write('[OMI] (statusline script not found)');
    return;
  }
  try {
    await import(pathToFileURL(scriptPath).href);
  } catch (err) {
    if (process.env.OMI_DEBUG) {
      process.stderr.write('[OMI HUD] error: ' + (err && err.message ? err.message : err) + '\n');
    }
    process.stdout.write('[OMI]');
  }
}

main();
