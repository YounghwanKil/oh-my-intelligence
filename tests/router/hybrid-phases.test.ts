import { describe, it, expect } from 'vitest';
import { getLaneForPhase, getPhaseMapping, getNextPhase } from '../../src/router/hybrid-phases.js';

describe('Autopilot phases', () => {
  it('interview phase maps to Think lane', () => {
    expect(getLaneForPhase('autopilot', 'interview')).toBe('think');
  });

  it('planning phase maps to Think lane', () => {
    expect(getLaneForPhase('autopilot', 'planning')).toBe('think');
  });

  it('implementation phase maps to Do lane', () => {
    expect(getLaneForPhase('autopilot', 'implementation')).toBe('do');
  });

  it('verification phase maps to Think lane', () => {
    expect(getLaneForPhase('autopilot', 'verification')).toBe('think');
  });

  it('fixing phase maps to Do lane', () => {
    expect(getLaneForPhase('autopilot', 'fixing')).toBe('do');
  });

  it('review phase maps to Think lane', () => {
    expect(getLaneForPhase('autopilot', 'review')).toBe('think');
  });
});

describe('Ralph phases', () => {
  it('assess phase maps to Think lane', () => {
    expect(getLaneForPhase('ralph', 'assess')).toBe('think');
  });

  it('execute phase maps to Do lane', () => {
    expect(getLaneForPhase('ralph', 'execute')).toBe('do');
  });

  it('verify phase maps to Think lane', () => {
    expect(getLaneForPhase('ralph', 'verify')).toBe('think');
  });

  it('decide phase maps to Think lane', () => {
    expect(getLaneForPhase('ralph', 'decide')).toBe('think');
  });
});

describe('getNextPhase', () => {
  it('returns correct next phase for autopilot', () => {
    expect(getNextPhase('autopilot', 'interview')).toBe('planning');
    expect(getNextPhase('autopilot', 'planning')).toBe('implementation');
    expect(getNextPhase('autopilot', 'implementation')).toBe('verification');
    expect(getNextPhase('autopilot', 'verification')).toBe('fixing');
    expect(getNextPhase('autopilot', 'fixing')).toBe('review');
  });

  it('returns null for last phase', () => {
    expect(getNextPhase('autopilot', 'review')).toBeNull();
    expect(getNextPhase('ralph', 'decide')).toBeNull();
  });

  it('returns null for unknown phase', () => {
    expect(getNextPhase('autopilot', 'nonexistent')).toBeNull();
  });
});

describe('getLaneForPhase', () => {
  it('returns correct lane for each autopilot phase', () => {
    const expected: Record<string, string> = {
      interview: 'think',
      planning: 'think',
      implementation: 'do',
      verification: 'think',
      fixing: 'do',
      review: 'think',
    };
    for (const [phase, lane] of Object.entries(expected)) {
      expect(getLaneForPhase('autopilot', phase)).toBe(lane);
    }
  });

  it('returns correct lane for each ralph phase', () => {
    const expected: Record<string, string> = {
      assess: 'think',
      execute: 'do',
      verify: 'think',
      decide: 'think',
    };
    for (const [phase, lane] of Object.entries(expected)) {
      expect(getLaneForPhase('ralph', phase)).toBe(lane);
    }
  });
});

describe('Unknown workflow', () => {
  it('returns think (safe default) for unknown workflow', () => {
    expect(getLaneForPhase('unknown-workflow', 'some-phase')).toBe('think');
  });

  it('getNextPhase returns null for unknown workflow', () => {
    expect(getNextPhase('unknown-workflow', 'some-phase')).toBeNull();
  });

  it('returns think for unknown phase in known workflow', () => {
    expect(getLaneForPhase('autopilot', 'nonexistent-phase')).toBe('think');
  });
});

describe('getPhaseMapping', () => {
  it('returns full phase mapping for known workflow and phase', () => {
    const mapping = getPhaseMapping('autopilot', 'implementation');
    expect(mapping).toBeDefined();
    expect(mapping!.omiPhase).toBe('implementation');
    expect(mapping!.omcPhase).toBe('executing');
    expect(mapping!.omxPhase).toBe('team-exec');
    expect(mapping!.lane).toBe('do');
  });

  it('returns undefined for unknown phase', () => {
    const mapping = getPhaseMapping('autopilot', 'nonexistent');
    expect(mapping).toBeUndefined();
  });
});
