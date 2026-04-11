import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const cliPath = path.join(projectRoot, 'bridge', 'cli.cjs');
const runCjsPath = path.join(projectRoot, 'scripts', 'run.cjs');
const sessionStartPath = path.join(projectRoot, 'scripts', 'session-start.mjs');
const keywordDetectorPath = path.join(projectRoot, 'scripts', 'keyword-detector.mjs');

function makeTempProject(): string {
  return mkdtempSync(path.join(tmpdir(), 'omi-install-smoke-'));
}

function runNode(args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): string {
  return execFileSync('node', args, {
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    encoding: 'utf-8',
  });
}

describe('install/readme smoke coverage', () => {
  it('packages .mcp.json for plugin installs', () => {
    const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')) as {
      files?: string[];
    };

    expect(pkg.files).toContain('.mcp.json');
  });

  it('prefers local .omc/.omx version files during CLI setup and doctor', () => {
    const tempRoot = makeTempProject();
    const tempHome = path.join(tempRoot, 'home');

    mkdirSync(path.join(tempRoot, '.omc'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.omx'), { recursive: true });
    mkdirSync(path.join(tempRoot, 'node_modules', 'oh-my-claude-sisyphus'), { recursive: true });
    mkdirSync(path.join(tempRoot, 'node_modules', 'oh-my-codex'), { recursive: true });
    mkdirSync(tempHome, { recursive: true });

    writeFileSync(path.join(tempRoot, '.omc', 'version'), '4.10.1\n');
    writeFileSync(path.join(tempRoot, '.omx', 'version'), '0.11.1\n');
    writeFileSync(
      path.join(tempRoot, 'node_modules', 'oh-my-claude-sisyphus', 'package.json'),
      JSON.stringify({ version: '4.9.3' }),
    );
    writeFileSync(
      path.join(tempRoot, 'node_modules', 'oh-my-codex', 'package.json'),
      JSON.stringify({ version: '0.10.0' }),
    );

    const env = { HOME: tempHome };
    const setupOutput = runNode([cliPath, 'setup'], tempRoot, env);
    const doctorOutput = runNode([cliPath, 'doctor'], tempRoot, env);

    expect(setupOutput).toContain('v4.10.1');
    expect(setupOutput).toContain('v0.11.1');
    expect(setupOutput).not.toContain('v4.9.3');
    expect(doctorOutput).toContain('v4.10.1');
    expect(doctorOutput).toContain('v0.11.1');
    expect(doctorOutput).not.toContain('minimum: v4.10.0');
  });

  it('session-start and keyword-detector agree on canonical provider names', () => {
    const tempRoot = makeTempProject();
    const fakeBin = path.join(tempRoot, 'bin');
    const tempHome = path.join(tempRoot, 'home');

    mkdirSync(path.join(tempRoot, '.omc'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.omx'), { recursive: true });
    mkdirSync(fakeBin, { recursive: true });
    mkdirSync(tempHome, { recursive: true });

    writeFileSync(path.join(tempRoot, '.omc', 'version'), '4.10.2\n');
    writeFileSync(path.join(tempRoot, '.omx', 'version'), '0.11.2\n');

    const claudeBin = path.join(fakeBin, 'claude');
    const codexBin = path.join(fakeBin, 'codex');
    writeFileSync(claudeBin, '#!/usr/bin/env bash\nexit 0\n');
    writeFileSync(codexBin, '#!/usr/bin/env bash\nexit 0\n');
    chmodSync(claudeBin, 0o755);
    chmodSync(codexBin, 0o755);

    const env = {
      HOME: tempHome,
      PATH: `${fakeBin}:${process.env.PATH ?? ''}`,
      USER_PROMPT: 'implement the auth middleware',
    };

    runNode([runCjsPath, sessionStartPath], tempRoot, env);

    const providers = JSON.parse(
      readFileSync(path.join(tempRoot, '.omi', 'state', 'providers', 'detected.json'), 'utf-8'),
    ) as {
      providers: Array<{ name: string; status: string }>;
    };

    expect(providers.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'claude', status: 'available' }),
        expect.objectContaining({ name: 'codex', status: 'available' }),
      ]),
    );

    runNode([runCjsPath, keywordDetectorPath], tempRoot, env);

    const decision = JSON.parse(
      readFileSync(path.join(tempRoot, '.omi', 'state', 'router', 'current-decision.json'), 'utf-8'),
    ) as { provider: string; lane: string; fallback: boolean };

    expect(decision.lane).toBe('do');
    expect(decision.provider).toBe('codex');
    expect(decision.fallback).toBe(false);
  });

  it('clears stale version warnings during setup when providers are now healthy', () => {
    const tempRoot = makeTempProject();
    const tempHome = path.join(tempRoot, 'home');

    mkdirSync(path.join(tempRoot, '.omc'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.omx'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.omi', 'state', 'providers'), { recursive: true });
    mkdirSync(tempHome, { recursive: true });

    writeFileSync(path.join(tempRoot, '.omc', 'version'), '4.10.2\n');
    writeFileSync(path.join(tempRoot, '.omx', 'version'), '0.11.2\n');
    writeFileSync(
      path.join(tempRoot, '.omi', 'state', 'providers', 'version-warning.json'),
      JSON.stringify({
        warnings: ['OMX (oh-my-codex) not detected. Do Lane will use Claude fallback.'],
        errors: [],
        _schemaVersion: '1.0',
      }),
    );

    const env = { HOME: tempHome };
    runNode([cliPath, 'setup'], tempRoot, env);
    const routeOutput = runNode([cliPath, 'route'], tempRoot, env);

    expect(routeOutput).not.toContain('OMX (oh-my-codex) not detected');
    expect(existsSync(path.join(tempRoot, '.omi', 'state', 'providers', 'version-warning.json'))).toBe(false);
  });

  it('clears stale version warnings during session-start when providers recover', () => {
    const tempRoot = makeTempProject();
    const fakeBin = path.join(tempRoot, 'bin');
    const tempHome = path.join(tempRoot, 'home');

    mkdirSync(path.join(tempRoot, '.omc'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.omx'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.omi', 'state', 'providers'), { recursive: true });
    mkdirSync(fakeBin, { recursive: true });
    mkdirSync(tempHome, { recursive: true });

    writeFileSync(path.join(tempRoot, '.omc', 'version'), '4.10.2\n');
    writeFileSync(path.join(tempRoot, '.omx', 'version'), '0.11.2\n');
    writeFileSync(
      path.join(tempRoot, '.omi', 'state', 'providers', 'version-warning.json'),
      JSON.stringify({
        warnings: ['OMX (oh-my-codex) not detected. Do Lane will use Claude fallback.'],
        errors: [],
        _schemaVersion: '1.0',
      }),
    );

    const claudeBin = path.join(fakeBin, 'claude');
    const codexBin = path.join(fakeBin, 'codex');
    writeFileSync(claudeBin, '#!/usr/bin/env bash\nexit 0\n');
    writeFileSync(codexBin, '#!/usr/bin/env bash\nexit 0\n');
    chmodSync(claudeBin, 0o755);
    chmodSync(codexBin, 0o755);

    const env = {
      HOME: tempHome,
      PATH: `${fakeBin}:${process.env.PATH ?? ''}`,
    };

    runNode([runCjsPath, sessionStartPath], tempRoot, env);

    expect(existsSync(path.join(tempRoot, '.omi', 'state', 'providers', 'version-warning.json'))).toBe(false);
  });

  it('does not report full routing when OMC is below the minimum version', () => {
    const tempRoot = makeTempProject();
    const tempHome = path.join(tempRoot, 'home');

    mkdirSync(path.join(tempRoot, '.omc'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.omx'), { recursive: true });
    mkdirSync(tempHome, { recursive: true });

    writeFileSync(path.join(tempRoot, '.omc', 'version'), '4.9.9\n');
    writeFileSync(path.join(tempRoot, '.omx', 'version'), '0.11.2\n');

    const output = runNode([cliPath, 'doctor'], tempRoot, { HOME: tempHome });

    expect(output).toContain('v4.9.9 (minimum: v4.10.0)');
    expect(output).toContain('Environment needs attention before reliable routing');
    expect(output).not.toContain('Full Think/Do routing');
  });
});
