import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ProviderInfo } from '../types/index.js';
import { OMI_DEFAULTS } from './defaults.js';

interface DetectionResult {
  installed: boolean;
  version?: string;
  path?: string;
}

interface OmiConfig {
  omc: DetectionResult;
  omx: DetectionResult;
  providers: ProviderInfo[];
  defaults: typeof OMI_DEFAULTS;
}

export function detectOmc(projectRoot?: string): DetectionResult {
  const root = projectRoot ?? process.cwd();
  const omcDir = path.join(root, '.omc');

  // Check for .omc/ directory
  try {
    const stat = fs.statSync(omcDir);
    if (stat.isDirectory()) {
      const versionFile = path.join(omcDir, 'version');
      let version: string | undefined;
      try {
        version = fs.readFileSync(versionFile, 'utf-8').trim();
      } catch {
        // version file may not exist
      }
      return { installed: true, version, path: omcDir };
    }
  } catch {
    // .omc/ does not exist
  }

  // Check for oh-my-claudecode in Claude plugins
  const claudeDir = path.join(root, '.claude');
  try {
    const pluginsFile = path.join(claudeDir, 'plugins.json');
    const raw = fs.readFileSync(pluginsFile, 'utf-8');
    const plugins = JSON.parse(raw) as Array<{ name?: string; path?: string }>;
    const omcPlugin = plugins.find(
      (p) => p.name === 'oh-my-claudecode' || p.path?.includes('oh-my-claudecode'),
    );
    if (omcPlugin) {
      return { installed: true, path: omcPlugin.path };
    }
  } catch {
    // plugins.json does not exist or not parseable
  }

  return { installed: false };
}

export function detectOmx(projectRoot?: string): DetectionResult {
  const root = projectRoot ?? process.cwd();
  const omxDir = path.join(root, '.omx');

  // Check for .omx/ directory
  try {
    const stat = fs.statSync(omxDir);
    if (stat.isDirectory()) {
      const versionFile = path.join(omxDir, 'version');
      let version: string | undefined;
      try {
        version = fs.readFileSync(versionFile, 'utf-8').trim();
      } catch {
        // version file may not exist
      }
      return { installed: true, version, path: omxDir };
    }
  } catch {
    // .omx/ does not exist
  }

  // Check for oh-my-codex reference
  const claudeDir = path.join(root, '.claude');
  try {
    const pluginsFile = path.join(claudeDir, 'plugins.json');
    const raw = fs.readFileSync(pluginsFile, 'utf-8');
    const plugins = JSON.parse(raw) as Array<{ name?: string; path?: string }>;
    const omxPlugin = plugins.find(
      (p) => p.name === 'oh-my-codex' || p.path?.includes('oh-my-codex'),
    );
    if (omxPlugin) {
      return { installed: true, path: omxPlugin.path };
    }
  } catch {
    // plugins.json does not exist or not parseable
  }

  return { installed: false };
}

export function checkVersionCompatibility(detectedVersion: string, minVersion: string): boolean {
  const detectedParts = detectedVersion.split('.').map(Number);
  const minParts = minVersion.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const detected = detectedParts[i] ?? 0;
    const min = minParts[i] ?? 0;
    if (detected > min) return true;
    if (detected < min) return false;
  }
  return true; // equal versions are compatible
}

export function loadConfig(projectRoot?: string): OmiConfig {
  const omc = detectOmc(projectRoot);
  const omx = detectOmx(projectRoot);

  const providers: ProviderInfo[] = [];

  // Claude is always available as the base provider
  providers.push({
    name: 'claude',
    status: 'available',
    version: omc.version,
    minVersion: OMI_DEFAULTS.minOmcVersion,
    _schemaVersion: OMI_DEFAULTS.schemaVersion,
  });

  if (omx.installed) {
    providers.push({
      name: 'codex',
      status: 'available',
      version: omx.version,
      minVersion: OMI_DEFAULTS.minOmxVersion,
      _schemaVersion: OMI_DEFAULTS.schemaVersion,
    });
  }

  return {
    omc,
    omx,
    providers,
    defaults: OMI_DEFAULTS,
  };
}
