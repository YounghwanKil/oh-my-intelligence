import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Lane, Provider, ProviderInfo, ProviderStatus } from '../types/index.js';

const SCHEMA_VERSION = '1.0.0';

function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function checkDirectoryExists(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

export function detectProviders(): ProviderInfo[] {
  const root = findProjectRoot();
  const providers: ProviderInfo[] = [];

  // Claude is always available (OMC is the host environment)
  providers.push({
    name: 'claude',
    status: 'available',
    _schemaVersion: SCHEMA_VERSION,
  });

  // Detect Codex via .omx/ directory or oh-my-codex plugin
  const omxDir = path.join(root, '.omx');
  const omcPluginsDir = path.join(root, '.omc', 'plugins', 'oh-my-codex');
  const codexStatus: ProviderStatus =
    checkDirectoryExists(omxDir) || checkDirectoryExists(omcPluginsDir)
      ? 'available'
      : 'unavailable';

  providers.push({
    name: 'codex',
    status: codexStatus,
    _schemaVersion: SCHEMA_VERSION,
  });

  // Detect Gemini via .gemini/ directory or environment variable
  const geminiDir = path.join(root, '.gemini');
  const hasGeminiEnv = !!process.env['GEMINI_API_KEY'];
  const geminiStatus: ProviderStatus =
    checkDirectoryExists(geminiDir) || hasGeminiEnv
      ? 'available'
      : 'unavailable';

  providers.push({
    name: 'gemini',
    status: geminiStatus,
    _schemaVersion: SCHEMA_VERSION,
  });

  return providers;
}

export function isProviderAvailable(provider: Provider): boolean {
  const providers = detectProviders();
  const info = providers.find((p) => p.name === provider);
  return info?.status === 'available';
}

export function getProvider(lane: Lane): ProviderInfo {
  const providers = detectProviders();

  if (lane === 'think') {
    // Think lane always goes to Claude
    const claude = providers.find((p) => p.name === 'claude');
    return claude!;
  }

  // Do lane: prefer Codex, fall back to Claude
  const codex = providers.find((p) => p.name === 'codex');
  if (codex && codex.status === 'available') {
    return codex;
  }

  // Fallback to Claude for Do tasks
  const claude = providers.find((p) => p.name === 'claude');
  return claude!;
}
