import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Lane } from '../types/index.js';
import { OMI_DEFAULTS } from '../config/defaults.js';

export interface SkillEntry {
  name: string;
  source: 'omc' | 'omx' | 'omi';
  lane: Lane | 'hybrid';
  path: string;
}

function scanSkillsDir(skillsDir: string): string[] {
  try {
    const entries = fs.readdirSync(skillsDir);
    return entries.filter((e) => {
      const fullPath = path.join(skillsDir, e);
      try {
        return fs.statSync(fullPath).isDirectory() || e.endsWith('.md') || e.endsWith('.ts') || e.endsWith('.js');
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

function classifySkillLane(name: string): Lane | 'hybrid' {
  const hybridWorkflows = OMI_DEFAULTS.hybridWorkflows as readonly string[];
  if (hybridWorkflows.includes(name)) {
    return 'hybrid';
  }

  const thinkSkills = OMI_DEFAULTS.thinkSkills as readonly string[];
  if (thinkSkills.includes(name)) {
    return 'think';
  }

  const doSkills = OMI_DEFAULTS.doSkills as readonly string[];
  if (doSkills.includes(name)) {
    return 'do';
  }

  // Unknown skill: classify by source default
  return 'think';
}

function normalizeSkillName(entry: string): string {
  return entry.replace(/\.(md|ts|js)$/, '');
}

export function buildSkillRegistry(
  omcPath?: string,
  omxPath?: string,
): Map<string, SkillEntry> {
  const registry = new Map<string, SkillEntry>();

  // Scan OMC skills
  if (omcPath) {
    const omcSkillsDir = path.join(omcPath, 'skills');
    const omcSkills = scanSkillsDir(omcSkillsDir);
    for (const entry of omcSkills) {
      const name = normalizeSkillName(entry);
      const lane = classifySkillLane(name);
      registry.set(name, {
        name,
        source: 'omc',
        lane,
        path: path.join(omcSkillsDir, entry),
      });
    }
  }

  // Scan OMX skills — OMX entries override OMC only for 'do' lane skills
  if (omxPath) {
    const omxSkillsDir = path.join(omxPath, 'skills');
    const omxSkills = scanSkillsDir(omxSkillsDir);
    for (const entry of omxSkills) {
      const name = normalizeSkillName(entry);
      const lane = classifySkillLane(name);
      const existing = registry.get(name);

      if (existing) {
        // Overlapping skill: mark as hybrid if both sources have it
        if (existing.source !== 'omx') {
          registry.set(name, {
            name,
            source: 'omi', // both have it, OMI owns the merged entry
            lane: 'hybrid',
            path: path.join(omxSkillsDir, entry),
          });
        }
      } else {
        // OMX-origin defaults to Do lane unless classified otherwise
        registry.set(name, {
          name,
          source: 'omx',
          lane: lane === 'think' ? 'do' : lane, // OMX default is Do
          path: path.join(omxSkillsDir, entry),
        });
      }
    }
  }

  return registry;
}
