import * as fs from 'node:fs';
import * as path from 'node:path';

const STATE_DIR = '.omi';
const SCHEMA_VERSION = '1.0';

interface SessionState {
  sessionId: string;
  startedAt: string;
  [key: string]: unknown;
  _schemaVersion: string;
}

function resolveSessionsDir(projectRoot?: string): string {
  return path.join(projectRoot ?? process.cwd(), STATE_DIR, 'state', 'sessions');
}

function atomicWrite(filePath: string, data: object): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = filePath + '.tmp';
  const payload = { ...data, _schemaVersion: SCHEMA_VERSION };
  fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

export function initSession(sessionId: string, projectRoot?: string): void {
  const filePath = path.join(resolveSessionsDir(projectRoot), 'current.json');
  const state: SessionState = {
    sessionId,
    startedAt: new Date().toISOString(),
    _schemaVersion: SCHEMA_VERSION,
  };
  atomicWrite(filePath, state);
}

export function getSessionState(projectRoot?: string): SessionState | null {
  const filePath = path.join(resolveSessionsDir(projectRoot), 'current.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export function updateSessionState(updates: object, projectRoot?: string): void {
  const current = getSessionState(projectRoot);
  if (!current) {
    return;
  }
  const merged = { ...current, ...updates };
  const filePath = path.join(resolveSessionsDir(projectRoot), 'current.json');
  atomicWrite(filePath, merged);
}
