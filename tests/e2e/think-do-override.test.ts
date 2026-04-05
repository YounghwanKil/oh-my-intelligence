import { describe, it, expect } from 'vitest';
import { classifyTask } from '../../src/router/classifier.js';
import type { Provider, Lane } from '../../src/types/index.js';

const providers: Provider[] = ['claude', 'codex'];

/**
 * Detects /think, /do, /route command prefixes and returns
 * the override lane and stripped input.
 */
function detectOverride(input: string): {
  override: boolean;
  lane: Lane | null;
  command: string | null;
  strippedInput: string;
} {
  const trimmed = input.trim();

  if (trimmed.startsWith('/think')) {
    return {
      override: true,
      lane: 'think',
      command: '/think',
      strippedInput: trimmed.slice('/think'.length).trim(),
    };
  }

  if (trimmed.startsWith('/do')) {
    return {
      override: true,
      lane: 'do',
      command: '/do',
      strippedInput: trimmed.slice('/do'.length).trim(),
    };
  }

  if (trimmed.startsWith('/route')) {
    return {
      override: false,
      lane: null,
      command: '/route',
      strippedInput: trimmed.slice('/route'.length).trim(),
    };
  }

  return {
    override: false,
    lane: null,
    command: null,
    strippedInput: trimmed,
  };
}

describe('/think override', () => {
  it('input starting with "/think" classifies as Think with override=true', () => {
    const input = '/think plan the API architecture';
    const detected = detectOverride(input);

    expect(detected.override).toBe(true);
    expect(detected.lane).toBe('think');
    expect(detected.command).toBe('/think');
    expect(detected.strippedInput).toBe('plan the API architecture');
  });

  it('/think overrides even for Do-like tasks', () => {
    const input = '/think implement the feature';
    const detected = detectOverride(input);

    expect(detected.override).toBe(true);
    expect(detected.lane).toBe('think');

    // The auto-classifier would say Do, but override forces Think
    const autoResult = classifyTask(detected.strippedInput, providers);
    expect(autoResult.lane).toBe('do');
    // Override takes precedence
    expect(detected.lane).toBe('think');
  });
});

describe('/do override', () => {
  it('input starting with "/do" classifies as Do with override=true', () => {
    const input = '/do implement the auth middleware';
    const detected = detectOverride(input);

    expect(detected.override).toBe(true);
    expect(detected.lane).toBe('do');
    expect(detected.command).toBe('/do');
    expect(detected.strippedInput).toBe('implement the auth middleware');
  });

  it('/do overrides even for Think-like tasks', () => {
    const input = '/do review the security audit';
    const detected = detectOverride(input);

    expect(detected.override).toBe(true);
    expect(detected.lane).toBe('do');

    // The auto-classifier would say Think, but override forces Do
    const autoResult = classifyTask(detected.strippedInput, providers);
    expect(autoResult.lane).toBe('think');
    // Override takes precedence
    expect(detected.lane).toBe('do');
  });
});

describe('/route command', () => {
  it('input starting with "/route" is detected as route command', () => {
    const input = '/route';
    const detected = detectOverride(input);

    expect(detected.command).toBe('/route');
    expect(detected.override).toBe(false);
    expect(detected.lane).toBeNull();
  });
});

describe('Normal input without override', () => {
  it('uses auto-classification when no command prefix is present', () => {
    const input = 'implement the feature';
    const detected = detectOverride(input);

    expect(detected.override).toBe(false);
    expect(detected.lane).toBeNull();
    expect(detected.command).toBeNull();
    expect(detected.strippedInput).toBe('implement the feature');

    // Falls through to auto-classifier
    const result = classifyTask(detected.strippedInput, providers);
    expect(result.lane).toBe('do');
  });

  it('auto-classifies Think tasks without override', () => {
    const input = 'debug why the login fails';
    const detected = detectOverride(input);

    expect(detected.override).toBe(false);

    const result = classifyTask(detected.strippedInput, providers);
    expect(result.lane).toBe('think');
  });
});
