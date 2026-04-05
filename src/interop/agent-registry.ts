import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Lane } from '../types/index.js';

export interface AgentEntry {
  name: string;
  source: 'omc' | 'omx' | 'omi';
  lane: Lane;
  modelTier: string;
  path: string;
}

// Agents that are primarily Think-lane
const THINK_AGENTS = new Set([
  'planner', 'architect', 'code-reviewer', 'verifier', 'explorer',
  'designer', 'writer', 'document-specialist', 'security-reviewer',
]);

// Agents that are primarily Do-lane
const DO_AGENTS = new Set([
  'executor', 'builder', 'test-runner', 'deployer', 'pipeline',
]);

function classifyAgentLane(name: string): Lane {
  if (DO_AGENTS.has(name)) return 'do';
  if (THINK_AGENTS.has(name)) return 'think';
  // Default unknown agents to Think (safer)
  return 'think';
}

function inferModelTier(name: string): string {
  if (['architect', 'security-reviewer', 'planner'].includes(name)) return 'opus';
  if (['executor', 'builder', 'code-reviewer', 'designer', 'writer'].includes(name)) return 'sonnet';
  if (['explorer', 'verifier'].includes(name)) return 'haiku';
  return 'sonnet';
}

function scanAgentsDir(agentsDir: string): string[] {
  try {
    const entries = fs.readdirSync(agentsDir);
    return entries.filter((e) => e.endsWith('.md'));
  } catch {
    return [];
  }
}

export function buildAgentRegistry(
  omcPath?: string,
  omxPath?: string,
): Map<string, AgentEntry> {
  const registry = new Map<string, AgentEntry>();

  // Scan OMC agents
  if (omcPath) {
    const omcAgentsDir = path.join(omcPath, 'agents');
    const omcAgents = scanAgentsDir(omcAgentsDir);
    for (const entry of omcAgents) {
      const name = entry.replace(/\.md$/, '');
      const lane = classifyAgentLane(name);
      registry.set(name, {
        name,
        source: 'omc',
        lane,
        modelTier: inferModelTier(name),
        path: path.join(omcAgentsDir, entry),
      });
    }
  }

  // Scan OMX agents — OMX is primary for Do agents, OMC for Think agents
  if (omxPath) {
    const omxAgentsDir = path.join(omxPath, 'agents');
    const omxAgents = scanAgentsDir(omxAgentsDir);
    for (const entry of omxAgents) {
      const name = entry.replace(/\.md$/, '');
      const lane = classifyAgentLane(name);
      const existing = registry.get(name);

      if (existing) {
        // Dedup: OMX wins for Do agents, OMC wins for Think agents
        if (lane === 'do') {
          registry.set(name, {
            name,
            source: 'omx',
            lane,
            modelTier: inferModelTier(name),
            path: path.join(omxAgentsDir, entry),
          });
        }
        // Think agents: keep OMC version (already in registry)
      } else {
        registry.set(name, {
          name,
          source: 'omx',
          lane,
          modelTier: inferModelTier(name),
          path: path.join(omxAgentsDir, entry),
        });
      }
    }
  }

  return registry;
}
