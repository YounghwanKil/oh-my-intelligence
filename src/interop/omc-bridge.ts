import * as fs from 'node:fs';
import * as path from 'node:path';

function resolveOmcStateDir(projectRoot?: string): string {
  return path.join(projectRoot ?? process.cwd(), '.omc', 'state');
}

export function isOmcStateAvailable(projectRoot?: string): boolean {
  const stateDir = resolveOmcStateDir(projectRoot);
  try {
    fs.accessSync(stateDir, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export function readOmcPromptState(projectRoot?: string): object | null {
  const filePath = path.join(resolveOmcStateDir(projectRoot), 'current-prompt.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as object;
  } catch {
    return null;
  }
}

export function readOmcSessionState(projectRoot?: string): object | null {
  const sessionsDir = path.join(resolveOmcStateDir(projectRoot), 'sessions');
  try {
    const entries = fs.readdirSync(sessionsDir);
    const sessions: Record<string, object> = {};
    for (const entry of entries) {
      const filePath = path.join(sessionsDir, entry);
      if (entry.endsWith('.json')) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          sessions[entry.replace('.json', '')] = JSON.parse(raw) as object;
        } catch {
          // skip unreadable session files
        }
      }
    }
    return Object.keys(sessions).length > 0 ? sessions : null;
  } catch {
    return null;
  }
}

export function readOmcTeamState(projectRoot?: string): object | null {
  const teamDir = path.join(resolveOmcStateDir(projectRoot), 'team');
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
