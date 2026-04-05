import * as fs from 'node:fs';
import * as path from 'node:path';

function resolveOmxDir(projectRoot?: string): string {
  return path.join(projectRoot ?? process.cwd(), '.omx');
}

export function isOmxAvailable(projectRoot?: string): boolean {
  const omxDir = resolveOmxDir(projectRoot);
  try {
    fs.accessSync(omxDir, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export function readOmxState(projectRoot?: string): object | null {
  const stateDir = path.join(resolveOmxDir(projectRoot), 'state');
  try {
    const entries = fs.readdirSync(stateDir);
    const state: Record<string, object> = {};
    for (const entry of entries) {
      const filePath = path.join(stateDir, entry);
      if (entry.endsWith('.json')) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          state[entry.replace('.json', '')] = JSON.parse(raw) as object;
        } catch {
          // skip unreadable files
        }
      }
    }
    return Object.keys(state).length > 0 ? state : null;
  } catch {
    return null;
  }
}

export function readOmxTeamState(projectRoot?: string): object | null {
  const teamDir = path.join(resolveOmxDir(projectRoot), 'state', 'team');
  try {
    const entries = fs.readdirSync(teamDir);
    const teamState: Record<string, object> = {};
    for (const entry of entries) {
      const filePath = path.join(teamDir, entry);
      if (entry.endsWith('.json')) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          teamState[entry.replace('.json', '')] = JSON.parse(raw) as object;
        } catch {
          // skip unreadable team files
        }
      }
    }
    return Object.keys(teamState).length > 0 ? teamState : null;
  } catch {
    return null;
  }
}
