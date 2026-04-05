import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { RoutingDecision, ProviderInfo, TaskClassification } from '../types/index.js';
import { classifyTask } from '../router/classifier.js';
import { detectProviders } from '../router/provider-registry.js';
import { getRoutingData, formatRoutingDisplay } from '../hud/routing-indicator.js';

export interface OmiTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

function readJsonSafe<T>(filePath: string): T | null {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function resolveOmiStateDir(projectRoot?: string): string {
  return join(projectRoot ?? process.cwd(), '.omi', 'state');
}

export function getOmiTools(projectRoot?: string): OmiTool[] {
  const stateDir = resolveOmiStateDir(projectRoot);

  return [
    {
      name: 'omi_route_status',
      description: 'Returns current OMI routing state including lane, provider, and hybrid phase',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      handler: async () => {
        const data = getRoutingData(projectRoot);
        const display = formatRoutingDisplay(data);
        return {
          ...data,
          display,
        };
      },
    },

    {
      name: 'omi_classify_task',
      description: 'Classifies a task description into Think (planning/review) or Do (implementation/execution)',
      inputSchema: {
        type: 'object',
        properties: {
          task: {
            type: 'string',
            description: 'The task description to classify',
          },
        },
        required: ['task'],
        additionalProperties: false,
      },
      handler: async (args: Record<string, unknown>) => {
        const task = args['task'] as string;
        if (!task || typeof task !== 'string') {
          return { error: 'Missing required parameter: task' };
        }
        const providers = detectProviders();
        const available = providers
          .filter((p) => p.status === 'available')
          .map((p) => p.name);
        const classification: TaskClassification = classifyTask(task, available);
        return classification;
      },
    },

    {
      name: 'omi_list_providers',
      description: 'Lists available providers (Claude, Codex, Gemini) and their current status',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      handler: async () => {
        // Try state file first (written by session-start hook)
        const stateFile = join(stateDir, 'providers', 'detected.json');
        const saved = readJsonSafe<{ providers: ProviderInfo[] }>(stateFile);
        if (saved?.providers) {
          return { providers: saved.providers, source: 'state' };
        }

        // Fall back to live detection
        const providers = detectProviders();
        return { providers, source: 'live' };
      },
    },

    {
      name: 'omi_get_phase',
      description: 'Returns current hybrid workflow phase if a workflow (autopilot, ralph) is active',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      handler: async () => {
        const hybridFile = join(stateDir, 'router', 'hybrid-state.json');
        const hybrid = readJsonSafe<{
          workflow: string;
          currentPhase: string;
          phaseIndex: number;
          totalPhases: number;
        }>(hybridFile);

        if (!hybrid) {
          return { active: false, workflow: null, phase: null };
        }

        return {
          active: true,
          workflow: hybrid.workflow,
          phase: hybrid.currentPhase,
          phaseIndex: hybrid.phaseIndex,
          totalPhases: hybrid.totalPhases,
        };
      },
    },
  ];
}
