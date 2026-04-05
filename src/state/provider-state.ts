import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ProviderInfo } from '../types/index.js';

const STATE_DIR = '.omi';
const SCHEMA_VERSION = '1.0';

function resolveProvidersDir(projectRoot?: string): string {
  return path.join(projectRoot ?? process.cwd(), STATE_DIR, 'state', 'providers');
}

function atomicWrite(filePath: string, data: object): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = filePath + '.tmp';
  const payload = { ...data, _schemaVersion: SCHEMA_VERSION };
  fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

export function writeProviderState(providers: ProviderInfo[], projectRoot?: string): void {
  const filePath = path.join(resolveProvidersDir(projectRoot), 'detected.json');
  atomicWrite(filePath, { providers });
}

export function readProviderState(projectRoot?: string): ProviderInfo[] | null {
  const filePath = path.join(resolveProvidersDir(projectRoot), 'detected.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as { providers: ProviderInfo[] };
    return parsed.providers;
  } catch {
    return null;
  }
}

export function writeVersionWarning(warning: string, projectRoot?: string): void {
  const filePath = path.join(resolveProvidersDir(projectRoot), 'version-warning.json');
  atomicWrite(filePath, { warning, timestamp: new Date().toISOString() });
}
