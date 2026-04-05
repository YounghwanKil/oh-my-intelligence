import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import * as fs from 'node:fs';
import {
  isOmcStateAvailable,
  readOmcPromptState,
  readOmcSessionState,
} from '../../src/interop/omc-bridge.js';

vi.mock('node:fs');

const mockedFs = vi.mocked(fs);

describe('isOmcStateAvailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when .omc/ does not exist (order-independence)', () => {
    mockedFs.accessSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(isOmcStateAvailable('/nonexistent/project')).toBe(false);
  });

  it('returns true when .omc/state directory exists and is readable', () => {
    mockedFs.accessSync.mockImplementation(() => undefined);

    expect(isOmcStateAvailable('/project')).toBe(true);
  });
});

describe('readOmcPromptState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads prompt state when available', () => {
    const mockState = { prompt: 'test task', lane: 'think' };
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockState));

    const result = readOmcPromptState('/project');
    expect(result).toEqual(mockState);
  });

  it('returns null when prompt state file does not exist', () => {
    mockedFs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(readOmcPromptState('/project')).toBeNull();
  });

  it('returns null when prompt state file contains invalid JSON', () => {
    mockedFs.readFileSync.mockReturnValue('not valid json {{{');

    expect(readOmcPromptState('/project')).toBeNull();
  });
});

describe('readOmcSessionState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads session state when available', () => {
    const sessionData = { mode: 'autopilot', phase: 'planning' };
    mockedFs.readdirSync.mockReturnValue(['session1.json'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(sessionData));

    const result = readOmcSessionState('/project');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('session1');
    expect((result as Record<string, object>)['session1']).toEqual(sessionData);
  });

  it('returns null when sessions directory does not exist', () => {
    mockedFs.readdirSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(readOmcSessionState('/project')).toBeNull();
  });

  it('returns null when no session JSON files exist', () => {
    mockedFs.readdirSync.mockReturnValue(['readme.txt'] as unknown as fs.Dirent[]);

    expect(readOmcSessionState('/project')).toBeNull();
  });

  it('skips unreadable session files gracefully', () => {
    mockedFs.readdirSync.mockReturnValue(['good.json', 'bad.json'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync
      .mockReturnValueOnce(JSON.stringify({ valid: true }))
      .mockImplementationOnce(() => {
        throw new Error('EACCES');
      });

    const result = readOmcSessionState('/project');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('good');
    expect(result).not.toHaveProperty('bad');
  });
});
