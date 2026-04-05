import { describe, it, expect } from 'vitest';
import { applyFallback, getDefaultFallbackSpec } from '../../src/router/fallback.js';

describe('applyFallback', () => {
  it('strips codex tool references from prompt', () => {
    const input = 'Use codex_run to execute the script and codex_sandbox for testing';
    const result = applyFallback(input);
    expect(result).not.toContain('codex_run');
    expect(result).not.toContain('codex_sandbox');
  });

  it('injects Claude tool mappings', () => {
    const input = 'Use codex_run to execute the script';
    const result = applyFallback(input);
    expect(result).toContain('Bash');
  });

  it('adds Do-mode system instructions', () => {
    const input = 'implement the feature';
    const result = applyFallback(input);
    expect(result).toContain('[Do-mode fallback]');
    expect(result).toContain('Do mode');
    expect(result).toContain('prioritize execution over analysis');
  });

  it('strips tool references that have no mapping', () => {
    const input = 'Use omx_sparkshell to run the command';
    const result = applyFallback(input);
    expect(result).not.toContain('omx_sparkshell');
  });

  it('cleans up double spaces from removals', () => {
    const input = 'Run omx_sparkshell now';
    const result = applyFallback(input);
    // After removing omx_sparkshell and cleanup, no double spaces should remain
    expect(result).not.toMatch(/  +/);
  });
});

describe('getDefaultFallbackSpec', () => {
  it('returns valid spec with all required fields', () => {
    const spec = getDefaultFallbackSpec();
    expect(spec).toHaveProperty('stripToolReferences');
    expect(spec).toHaveProperty('injectToolMappings');
    expect(spec).toHaveProperty('systemPromptAdditions');
    expect(spec).toHaveProperty('postureMapping');
    expect(Array.isArray(spec.stripToolReferences)).toBe(true);
    expect(spec.stripToolReferences.length).toBeGreaterThan(0);
    expect(typeof spec.injectToolMappings).toBe('object');
    expect(typeof spec.systemPromptAdditions).toBe('string');
    expect(typeof spec.postureMapping).toBe('object');
  });

  it('returns a copy, not the original object', () => {
    const spec1 = getDefaultFallbackSpec();
    const spec2 = getDefaultFallbackSpec();
    expect(spec1).toEqual(spec2);
    spec1.systemPromptAdditions = 'modified';
    expect(spec2.systemPromptAdditions).not.toBe('modified');
  });
});

describe('Posture mapping', () => {
  it('transforms OMX postures to OMC agents', () => {
    const input = 'Use deep-worker for implementation and frontier-orchestrator for planning';
    const result = applyFallback(input);
    expect(result).toContain('executor');
    expect(result).toContain('planner');
    expect(result).not.toContain('deep-worker');
    expect(result).not.toContain('frontier-orchestrator');
  });

  it('transforms fast-lane posture to explore agent', () => {
    const input = 'Switch to fast-lane mode';
    const result = applyFallback(input);
    expect(result).toContain('explore');
    expect(result).not.toContain('fast-lane');
  });
});
