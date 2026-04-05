import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { buildSkillRegistry } from '../../src/interop/skill-registry.js';

vi.mock('node:fs');

const mockedFs = vi.mocked(fs);

describe('buildSkillRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds registry from OMC skills directory', () => {
    mockedFs.readdirSync.mockReturnValue(['plan', 'trace', 'deep-interview'] as unknown as fs.Dirent[]);
    mockedFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const registry = buildSkillRegistry('/mock/omc');
    expect(registry.size).toBe(3);
    expect(registry.has('plan')).toBe(true);
    expect(registry.has('trace')).toBe(true);
    expect(registry.has('deep-interview')).toBe(true);
  });

  it('builds registry from OMX skills directory', () => {
    mockedFs.readdirSync.mockReturnValue(['build-fix', 'tdd'] as unknown as fs.Dirent[]);
    mockedFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const registry = buildSkillRegistry(undefined, '/mock/omx');
    expect(registry.size).toBe(2);
    expect(registry.has('build-fix')).toBe(true);
    expect(registry.has('tdd')).toBe(true);
  });

  it('handles missing directories gracefully (returns empty)', () => {
    const registry = buildSkillRegistry();
    expect(registry.size).toBe(0);
  });

  it('handles filesystem errors gracefully (returns empty)', () => {
    mockedFs.readdirSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const registry = buildSkillRegistry('/nonexistent/omc');
    expect(registry.size).toBe(0);
  });

  it('OMC-origin skills default to Think lane', () => {
    // 'plan' is in thinkSkills list
    mockedFs.readdirSync.mockReturnValue(['plan'] as unknown as fs.Dirent[]);
    mockedFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const registry = buildSkillRegistry('/mock/omc');
    const skill = registry.get('plan');
    expect(skill).toBeDefined();
    expect(skill!.source).toBe('omc');
    expect(skill!.lane).toBe('think');
  });

  it('OMX-origin skills default to Do lane', () => {
    // A skill not in thinkSkills or doSkills, from OMX, defaults to Do
    mockedFs.readdirSync.mockReturnValue(['some-new-skill'] as unknown as fs.Dirent[]);
    mockedFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const registry = buildSkillRegistry(undefined, '/mock/omx');
    const skill = registry.get('some-new-skill');
    expect(skill).toBeDefined();
    expect(skill!.source).toBe('omx');
    expect(skill!.lane).toBe('do');
  });

  it('overlapping skills (autopilot, ralph) marked as hybrid', () => {
    // First call for OMC skills dir, second for OMX skills dir
    mockedFs.readdirSync
      .mockReturnValueOnce(['autopilot', 'ralph'] as unknown as fs.Dirent[])
      .mockReturnValueOnce(['autopilot', 'ralph'] as unknown as fs.Dirent[]);
    mockedFs.statSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const registry = buildSkillRegistry('/mock/omc', '/mock/omx');

    const autopilot = registry.get('autopilot');
    expect(autopilot).toBeDefined();
    expect(autopilot!.source).toBe('omi'); // merged entry
    expect(autopilot!.lane).toBe('hybrid');

    const ralph = registry.get('ralph');
    expect(ralph).toBeDefined();
    expect(ralph!.source).toBe('omi');
    expect(ralph!.lane).toBe('hybrid');
  });

  it('normalizes file extensions from skill names', () => {
    mockedFs.readdirSync.mockReturnValue(['plan.ts', 'trace.md', 'build-fix.js'] as unknown as fs.Dirent[]);
    mockedFs.statSync.mockReturnValue({ isDirectory: () => false } as fs.Stats);

    const registry = buildSkillRegistry('/mock/omc');
    expect(registry.has('plan')).toBe(true);
    expect(registry.has('trace')).toBe(true);
    expect(registry.has('build-fix')).toBe(true);
  });
});
