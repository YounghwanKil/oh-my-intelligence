import type { Lane, PhaseMapping } from '../types/index.js';

const AUTOPILOT_PHASES: PhaseMapping[] = [
  { omiPhase: 'interview', omcPhase: 'initializing', omxPhase: 'team-plan', lane: 'think' },
  { omiPhase: 'planning', omcPhase: 'planning', omxPhase: 'team-prd', lane: 'think' },
  { omiPhase: 'implementation', omcPhase: 'executing', omxPhase: 'team-exec', lane: 'do' },
  { omiPhase: 'verification', omcPhase: 'executing', omxPhase: 'team-verify', lane: 'think' },
  { omiPhase: 'fixing', omcPhase: 'fixing', omxPhase: 'team-fix', lane: 'do' },
  { omiPhase: 'review', omcPhase: 'completed', omxPhase: 'complete', lane: 'think' },
];

const RALPH_PHASES: PhaseMapping[] = [
  { omiPhase: 'assess', omcPhase: 'initializing', omxPhase: 'team-plan', lane: 'think' },
  { omiPhase: 'execute', omcPhase: 'executing', omxPhase: 'team-exec', lane: 'do' },
  { omiPhase: 'verify', omcPhase: 'fixing', omxPhase: 'team-verify', lane: 'think' },
  { omiPhase: 'decide', omcPhase: 'fixing', omxPhase: 'team-fix', lane: 'think' },
];

type Workflow = 'autopilot' | 'ralph';

const WORKFLOW_MAP: Record<Workflow, PhaseMapping[]> = {
  autopilot: AUTOPILOT_PHASES,
  ralph: RALPH_PHASES,
};

function resolveWorkflow(workflow: string): PhaseMapping[] | undefined {
  return WORKFLOW_MAP[workflow as Workflow];
}

export function getPhaseMapping(
  workflow: 'autopilot' | 'ralph',
  phase: string,
): PhaseMapping | undefined {
  const phases = WORKFLOW_MAP[workflow];
  return phases.find((p) => p.omiPhase === phase);
}

export function getLaneForPhase(workflow: string, phase: string): Lane {
  const phases = resolveWorkflow(workflow);
  if (!phases) {
    return 'think'; // Safe default for unknown workflows
  }

  const mapping = phases.find((p) => p.omiPhase === phase);
  if (!mapping) {
    return 'think'; // Safe default for unknown phases
  }

  return mapping.lane;
}

export function getNextPhase(
  workflow: string,
  currentPhase: string,
): string | null {
  const phases = resolveWorkflow(workflow);
  if (!phases) {
    return null;
  }

  const currentIndex = phases.findIndex((p) => p.omiPhase === currentPhase);
  if (currentIndex === -1 || currentIndex >= phases.length - 1) {
    return null;
  }

  return phases[currentIndex + 1].omiPhase;
}
