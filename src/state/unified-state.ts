import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RoutingDecision } from '../types/index.js';

const STATE_DIR = '.omi';
const SCHEMA_VERSION = '1.0';

function resolveStateDir(projectRoot?: string): string {
  return path.join(projectRoot ?? process.cwd(), STATE_DIR);
}

export function initStateDir(projectRoot: string): void {
  const base = path.join(projectRoot, STATE_DIR);
  const dirs = [
    base,
    path.join(base, 'state'),
    path.join(base, 'state', 'router'),
    path.join(base, 'state', 'providers'),
    path.join(base, 'state', 'sessions'),
    path.join(base, 'plans'),
    path.join(base, 'logs'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function atomicWrite(filePath: string, data: object): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = filePath + '.tmp';
  const payload = { ...data, _schemaVersion: SCHEMA_VERSION };
  fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

export function writeState(key: string, data: object, projectRoot?: string): void {
  const filePath = path.join(resolveStateDir(projectRoot), 'state', `${key}.json`);
  atomicWrite(filePath, data);
}

export function readState(key: string, projectRoot?: string): object | null {
  const filePath = path.join(resolveStateDir(projectRoot), 'state', `${key}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as object;
  } catch {
    return null;
  }
}

export function writeRoutingDecision(decision: RoutingDecision, projectRoot?: string): void {
  const filePath = path.join(resolveStateDir(projectRoot), 'state', 'router', 'current-decision.json');
  atomicWrite(filePath, decision);
}

export function readRoutingDecision(projectRoot?: string): RoutingDecision | null {
  const filePath = path.join(resolveStateDir(projectRoot), 'state', 'router', 'current-decision.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as RoutingDecision;
  } catch {
    return null;
  }
}
