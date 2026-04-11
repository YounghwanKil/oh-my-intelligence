#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const VERSION = '1.0.3';

const OMC_NPM_PACKAGE = 'oh-my-claude-sisyphus';
const OMX_NPM_PACKAGE = 'oh-my-codex';

// ---------------------------------------------------------------------------
// ANSI colors
// ---------------------------------------------------------------------------

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgCyan: '\x1b[46m',
  bgBlue: '\x1b[44m',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findProjectRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, '.git')) ||
      fs.existsSync(path.join(dir, '.omi')) ||
      fs.existsSync(path.join(dir, '.omc'))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function readTextSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return undefined;
    const value = fs.readFileSync(filePath, 'utf-8').trim();
    return value || undefined;
  } catch {
    return undefined;
  }
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

function icon(ok) {
  if (ok === true) return c.green + '\u2713' + c.reset;
  if (ok === false) return c.red + '\u2717' + c.reset;
  return c.dim + '-' + c.reset; // neutral
}

function label(text, color) {
  return (color || '') + text + c.reset;
}

function writeJson(filePath, data) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function writeWarningsState(omiBase, warnings, errors) {
  const warningsFile = path.join(omiBase, 'state', 'providers', 'version-warning.json');
  if (warnings.length > 0 || errors.length > 0) {
    writeJson(warningsFile, { warnings, errors, _schemaVersion: '1.0' });
    return;
  }

  try {
    fs.unlinkSync(warningsFile);
  } catch (error) {
    if (error && error.code !== 'ENOENT') throw error;
  }
}

// ---------------------------------------------------------------------------
// Dependency installer
// ---------------------------------------------------------------------------

function commandExists(cmd) {
  const checker = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(checker, [cmd], { stdio: 'ignore' });
  return result.status === 0;
}

function runStep(cmd, args, opts) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  return result.status === 0;
}

function installPlugin(npmPackage, displayName) {
  console.log('  ' + c.dim + '$ npm i -g ' + npmPackage + c.reset);
  const ok = runStep('npm', ['i', '-g', npmPackage]);
  if (!ok) {
    console.log('  ' + icon(false) + ' Failed to install ' + displayName + '.');
    console.log('  ' + c.dim + 'Retry manually: sudo npm i -g ' + npmPackage + c.reset);
  }
  return ok;
}

function runPluginSetup(binName, displayName, cwd) {
  if (!commandExists(binName)) {
    console.log('  ' + icon(false) + ' `' + binName + '` not on PATH after install. Check npm global prefix.');
    return false;
  }
  console.log('  ' + c.dim + '$ ' + binName + ' setup' + c.reset);
  const ok = runStep(binName, ['setup'], { cwd });
  if (!ok) {
    console.log('  ' + icon(false) + ' ' + displayName + ' setup exited non-zero.');
  }
  return ok;
}

function hudInstallerPath() {
  return path.resolve(__dirname, '..', 'scripts', 'hud-installer.mjs');
}

function runHudInstaller(mode, projectRoot) {
  const installer = hudInstallerPath();
  if (!fs.existsSync(installer)) {
    return { ok: false, note: 'installer script missing at ' + installer };
  }
  const args = [installer, '--project-root', projectRoot];
  if (mode === 'disable') args.push('--disable');
  const result = spawnSync('node', args, { encoding: 'utf-8' });
  if (result.status !== 0) {
    return { ok: false, note: (result.stderr || '').trim() || 'installer exited non-zero' };
  }
  try {
    return { ok: true, result: JSON.parse((result.stdout || '').trim()) };
  } catch {
    return { ok: true, result: {} };
  }
}

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

function detectOmc(root) {
  const omcDir = path.join(root, '.omc');
  if (!fs.existsSync(omcDir)) return { installed: false };

  const localVersion = readTextSafe(path.join(omcDir, 'version'));
  if (localVersion) {
    return { installed: true, version: localVersion, path: omcDir };
  }

  const candidates = [
    path.join(root, 'node_modules', 'oh-my-claude-sisyphus', 'package.json'),
    path.join(root, '.claude', 'plugins', 'marketplaces', 'omc', 'package.json'),
  ];

  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    candidates.push(path.join(home, '.claude', 'plugins', 'marketplaces', 'omc', 'package.json'));
  }

  let version;
  for (const p of candidates) {
    const pkg = readJsonSafe(p);
    if (pkg && pkg.version) { version = pkg.version; break; }
  }

  return { installed: true, version: version, path: omcDir };
}

function detectOmx(root) {
  const omxDir = path.join(root, '.omx');
  if (!fs.existsSync(omxDir)) return { installed: false };

  const localVersion = readTextSafe(path.join(omxDir, 'version'));
  if (localVersion) {
    return { installed: true, version: localVersion, path: omxDir };
  }

  const candidates = [
    path.join(root, 'node_modules', 'oh-my-codex', 'package.json'),
    path.join(root, '.codex', 'package.json'),
  ];

  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    candidates.push(path.join(home, '.codex', 'package.json'));
  }

  let version;
  for (const p of candidates) {
    const pkg = readJsonSafe(p);
    if (pkg && pkg.version) { version = pkg.version; break; }
  }

  return { installed: true, version: version, path: omxDir };
}

function detectGemini(root) {
  const geminiDir = path.join(root, '.gemini');
  const hasEnv = !!process.env.GEMINI_API_KEY;
  return { installed: fs.existsSync(geminiDir) || hasEnv };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdVersion() {
  console.log(c.bold + c.cyan + 'omi' + c.reset + ' v' + VERSION);
}

function cmdHelp() {
  console.log([
    '',
    '  ' + c.bold + c.cyan + 'OMI' + c.reset + ' — Oh My Intelligence ' + c.dim + 'v' + VERSION + c.reset,
    '  ' + c.dim + 'Claude thinks. Codex does. OMI routes.' + c.reset,
    '',
    '  ' + c.bold + 'Usage:' + c.reset,
    '    ' + c.cyan + 'omi' + c.reset + ' <command>',
    '',
    '  ' + c.bold + 'Commands:' + c.reset,
    '    ' + c.green + 'setup' + c.reset + '     Detect providers and initialize .omi/ directory',
    '              ' + c.dim + '--install-deps  auto-install OMC and OMX if missing' + c.reset,
    '    ' + c.green + 'doctor' + c.reset + '    Check all dependencies and report status',
    '    ' + c.green + 'route' + c.reset + '     Show current routing status',
    '    ' + c.green + 'hud' + c.reset + '       Enable OMI status line (add `disable` to restore)',
    '    ' + c.green + 'version' + c.reset + '   Show OMI version',
    '    ' + c.green + 'help' + c.reset + '      Show this help message',
    '',
    '  ' + c.bold + 'In Claude Code:' + c.reset,
    '    ' + c.magenta + '/think' + c.reset + ' <task>    Force Think Lane (Claude)',
    '    ' + c.blue + '/do' + c.reset + ' <task>       Force Do Lane (Codex or Claude fallback)',
    '    ' + c.yellow + '/route' + c.reset + '           Show routing status',
    '',
  ].join('\n'));
}

function cmdSetup(opts) {
  const installDeps = !!(opts && opts.installDeps);
  const root = findProjectRoot();
  const MIN_OMC_VERSION = '4.10.0';
  const MIN_OMX_VERSION = '0.11.0';
  console.log('\n  ' + c.bold + c.cyan + 'OMI Setup' + c.reset);
  console.log('  ' + c.dim + '─────────' + c.reset + '\n');

  // Detect providers
  let omc = detectOmc(root);
  let omx = detectOmx(root);

  console.log('  ' + c.bold + 'Provider detection:' + c.reset);
  console.log('  OMC ' + c.dim + '(oh-my-claudecode)' + c.reset + ': ' + (omc.installed ? icon(true) + ' installed' + (omc.version ? c.dim + ' v' + omc.version + c.reset : '') : icon(false) + ' not found'));
  console.log('  OMX ' + c.dim + '(oh-my-codex)' + c.reset + ':      ' + (omx.installed ? icon(true) + ' installed' + (omx.version ? c.dim + ' v' + omx.version + c.reset : '') : c.dim + '- not found (optional)' + c.reset));

  if (installDeps && (!omc.installed || !omx.installed)) {
    console.log('\n  ' + c.bold + 'Installing missing plugins:' + c.reset);
    if (!omc.installed) {
      console.log('  OMC ' + c.dim + '(' + OMC_NPM_PACKAGE + ')' + c.reset);
      if (installPlugin(OMC_NPM_PACKAGE, 'OMC')) {
        runPluginSetup('omc', 'OMC', root);
      }
    }
    if (!omx.installed) {
      console.log('  OMX ' + c.dim + '(' + OMX_NPM_PACKAGE + ')' + c.reset);
      if (installPlugin(OMX_NPM_PACKAGE, 'OMX')) {
        runPluginSetup('omx', 'OMX', root);
      }
    }
    omc = detectOmc(root);
    omx = detectOmx(root);
    console.log('');
  }

  if (!omc.installed) {
    console.log('\n  WARNING: OMC is required for OMI to function.');
    if (installDeps) {
      console.log('  Auto-install failed. Try: sudo npm i -g ' + OMC_NPM_PACKAGE + ' && omc setup');
    } else {
      console.log('  Install it with: npm i -g ' + OMC_NPM_PACKAGE + ' && omc setup');
      console.log('  Or re-run:       ' + c.cyan + 'omi setup --install-deps' + c.reset);
    }
  } else if (!omx.installed && !installDeps) {
    console.log('\n  ' + c.dim + 'Tip: run `omi setup --install-deps` to auto-install OMX for full Think/Do routing.' + c.reset);
  }

  // Initialize .omi/ directory
  const omiBase = path.join(root, '.omi');
  const dirs = [
    omiBase,
    path.join(omiBase, 'state'),
    path.join(omiBase, 'state', 'router'),
    path.join(omiBase, 'state', 'providers'),
    path.join(omiBase, 'state', 'sessions'),
    path.join(omiBase, 'plans'),
    path.join(omiBase, 'logs'),
  ];

  let created = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      created++;
    }
  }

  console.log('\nState directory:');
  if (created > 0) {
    console.log('  ' + icon(true) + ' Created .omi/ with ' + created + ' directories');
  } else {
    console.log('  ' + icon(true) + ' .omi/ already initialized');
  }

  // Write provider state
  const providers = [];
  if (omc.installed) {
    providers.push({ name: 'claude', status: 'available', version: omc.version || 'unknown' });
  } else {
    providers.push({ name: 'claude', status: 'unavailable' });
  }
  if (omx.installed) {
    providers.push({ name: 'codex', status: 'available', version: omx.version || 'unknown' });
  } else {
    providers.push({ name: 'codex', status: 'unavailable' });
  }

  const providersFile = path.join(omiBase, 'state', 'providers', 'detected.json');
  writeJson(providersFile, { providers, _schemaVersion: '1.0' });

  const warnings = [];
  const errors = [];
  if (!omc.installed) {
    errors.push('OMC (oh-my-claudecode) not detected. OMI requires OMC to function.');
  } else if (omc.version && compareVersions(omc.version, MIN_OMC_VERSION) < 0) {
    warnings.push(`OMC version ${omc.version} is below minimum ${MIN_OMC_VERSION}. Some features may not work correctly.`);
  }
  if (!omx.installed) {
    warnings.push('OMX (oh-my-codex) not detected. Do Lane will use Claude fallback.');
  } else if (omx.version && compareVersions(omx.version, MIN_OMX_VERSION) < 0) {
    warnings.push(`OMX version ${omx.version} is below minimum ${MIN_OMX_VERSION}. Codex features may not work correctly.`);
  }

  writeWarningsState(omiBase, warnings, errors);

  // ── HUD auto-install ─────────────────────────────────────────────────────
  console.log('\nStatus line:');
  const hud = runHudInstaller('enable', root);
  if (hud.ok) {
    const note = hud.result && hud.result.note;
    if (note === 'already active') {
      console.log('  ' + icon(true) + ' OMI HUD already active in ~/.claude/settings.json');
    } else if (note === 'new') {
      console.log('  ' + icon(true) + ' OMI HUD installed to ~/.claude/hud/omi-hud.mjs');
      console.log('  ' + c.dim + 'Restart Claude Code to see it on the status line.' + c.reset);
    } else if (note === 'replaced previous') {
      console.log('  ' + icon(true) + ' OMI HUD installed (previous status line backed up to .omi/state/hud-backup.json)');
      console.log('  ' + c.dim + 'Restart Claude Code to see it. Use `omi hud disable` to restore.' + c.reset);
    } else {
      console.log('  ' + icon(true) + ' OMI HUD wired. ' + (note || ''));
    }
  } else {
    console.log('  ' + icon(false) + ' HUD install failed: ' + (hud.note || 'unknown'));
  }

  console.log('\n' + icon(true) + ' OMI setup complete.\n');

  if (omx.installed) {
    console.log('Mode: Claude + Codex (full Think/Do routing)');
  } else {
    console.log('Mode: Claude-only (Codex fallback active for Do tasks)');
  }
}

function cmdHud(sub) {
  const root = findProjectRoot();
  if (sub === 'disable' || sub === 'off') {
    const result = runHudInstaller('disable', root);
    if (result.ok) {
      console.log(icon(true) + ' OMI HUD disabled. ' + c.dim + (result.result && result.result.note || '') + c.reset);
    } else {
      console.log(icon(false) + ' Failed to disable: ' + result.note);
    }
    return;
  }
  // Default: enable
  const result = runHudInstaller('enable', root);
  if (result.ok) {
    const note = result.result && result.result.note;
    if (note === 'already active') {
      console.log(icon(true) + ' OMI HUD already active');
    } else {
      console.log(icon(true) + ' OMI HUD enabled. Restart Claude Code to see it.');
      if (note === 'replaced previous') {
        console.log('  ' + c.dim + 'Previous status line saved to .omi/state/hud-backup.json' + c.reset);
      }
    }
  } else {
    console.log(icon(false) + ' Failed to enable: ' + result.note);
  }
}

function cmdDoctor() {
  const root = findProjectRoot();
  const MIN_OMC_VERSION = '4.10.0';
  const MIN_OMX_VERSION = '0.11.0';

  console.log('\n  ' + c.bold + c.cyan + 'OMI Doctor' + c.reset);
  console.log('  ' + c.dim + '──────────' + c.reset + '\n');

  // Check OMC
  const omc = detectOmc(root);
  process.stdout.write('  OMC (oh-my-claudecode): ');
  if (!omc.installed) {
    console.log(icon(false) + ' NOT INSTALLED (required)');
  } else if (omc.version && compareVersions(omc.version, MIN_OMC_VERSION) < 0) {
    console.log(icon(false) + ' v' + omc.version + ' (minimum: v' + MIN_OMC_VERSION + ')');
  } else {
    console.log(icon(true) + ' ' + (omc.version ? 'v' + omc.version : 'installed'));
  }

  // Check OMX
  const omx = detectOmx(root);
  process.stdout.write('  OMX (oh-my-codex):      ');
  if (!omx.installed) {
    console.log('- not installed (optional)');
  } else if (omx.version && compareVersions(omx.version, MIN_OMX_VERSION) < 0) {
    console.log(icon(false) + ' v' + omx.version + ' (minimum: v' + MIN_OMX_VERSION + ')');
  } else {
    console.log(icon(true) + ' ' + (omx.version ? 'v' + omx.version : 'installed'));
  }

  // Check Gemini
  const gemini = detectGemini(root);
  process.stdout.write('  Gemini:                 ');
  if (gemini.installed) {
    console.log(icon(true) + ' detected');
  } else {
    console.log('- not configured (optional)');
  }

  // Check .omi/ state
  const omiDir = path.join(root, '.omi');
  console.log('');
  process.stdout.write('  .omi/ state directory:  ');
  if (fs.existsSync(omiDir)) {
    console.log(icon(true) + ' exists');
  } else {
    console.log(icon(false) + ' missing (run: omi setup)');
  }

  // Check Node.js version
  const nodeVersion = process.versions.node;
  const nodeMajor = parseInt(nodeVersion.split('.')[0], 10);
  process.stdout.write('  Node.js:                ');
  if (nodeMajor >= 20) {
    console.log(icon(true) + ' v' + nodeVersion);
  } else {
    console.log(icon(false) + ' v' + nodeVersion + ' (minimum: v20)');
  }

  const omcVersionOk = !omc.version || compareVersions(omc.version, MIN_OMC_VERSION) >= 0;
  const omxVersionOk = !omx.version || compareVersions(omx.version, MIN_OMX_VERSION) >= 0;
  const nodeHealthy = nodeMajor >= 20;

  // Summary
  console.log('');
  if (!nodeHealthy) {
    console.log(c.bold + '  RESULT: ' + c.reset + icon(false) + ' Environment needs attention before reliable routing');
  } else if (!omc.installed) {
    console.log(c.bold + '  RESULT: ' + c.reset + icon(false) + ' OMC is required. Install with: ' + c.cyan + 'claude plugin install oh-my-claudecode' + c.reset);
  } else if (!omcVersionOk) {
    console.log(c.bold + '  RESULT: ' + c.reset + icon(false) + ' Environment needs attention before reliable routing');
  } else if (omx.installed && !omxVersionOk) {
    console.log(c.bold + '  RESULT: ' + c.reset + icon(false) + ' Codex support is degraded until OMX is updated');
  } else if (omx.installed) {
    console.log(c.bold + '  RESULT: ' + c.reset + icon(true) + ' Full Think/Do routing ' + c.dim + '(Claude + Codex)' + c.reset);
  } else {
    console.log(c.bold + '  RESULT: ' + c.reset + icon(true) + ' Claude-only mode ' + c.dim + '(Codex fallback active for Do tasks)' + c.reset);
  }
  console.log('');
}

function cmdRoute() {
  const root = findProjectRoot();
  const stateDir = path.join(root, '.omi', 'state');

  console.log('\n  ' + c.bold + c.cyan + 'OMI Routing Status' + c.reset);
  console.log('  ' + c.dim + '──────────────────' + c.reset + '\n');

  // Providers
  const providerData = readJsonSafe(path.join(stateDir, 'providers', 'detected.json'));
  console.log('Providers:');
  if (providerData && providerData.providers) {
    for (const p of providerData.providers) {
      const status = p.status === 'available' ? icon(true) : icon(false);
      console.log('  ' + p.name + ': ' + (p.version || '?') + ' ' + status);
    }
  } else {
    console.log('  No provider state found. Run: omi setup');
  }

  // Current routing
  const decision = readJsonSafe(path.join(stateDir, 'router', 'current-decision.json'));
  console.log('');
  console.log('Current routing:');
  if (decision) {
    const laneLabel = decision.lane === 'think' ? 'Think' : 'Do';
    let providerLabel = decision.provider || 'claude';
    providerLabel = providerLabel.charAt(0).toUpperCase() + providerLabel.slice(1);
    if (decision.fallback) providerLabel += '(fallback)';
    const override = decision.override ? ' (override)' : ' (auto)';
    console.log('  [' + laneLabel + ':' + providerLabel + ']' + override);
    if (decision.reason) console.log('  Reason: ' + decision.reason);
  } else {
    console.log('  No active routing decision.');
  }

  // Hybrid workflow
  const hybrid = readJsonSafe(path.join(stateDir, 'router', 'hybrid-state.json'));
  console.log('');
  console.log('Hybrid workflow:');
  if (hybrid && hybrid.workflow) {
    console.log('  ' + hybrid.workflow + ' phase ' + (hybrid.phaseIndex + 1) + '/' + hybrid.totalPhases + ' (' + hybrid.currentPhase + ')');
  } else {
    console.log('  None active.');
  }

  // Classification table
  console.log('');
  console.log('Classification table:');
  console.log('  Think (Claude): planning, review, debug, test design, security, UI/UX, ML design');
  console.log('  Do (Codex):     implement, test write, git ops, docs, ML pipeline, quick fix');
  console.log('  Hybrid:         autopilot, ralph, ultrawork, team, ultraqa');

  // Version warnings
  const warnings = readJsonSafe(path.join(stateDir, 'providers', 'version-warning.json'));
  const warningList = warnings?.warnings ?? (warnings?.warning ? [warnings.warning] : []);
  if (warningList.length > 0) {
    console.log('');
    console.log('Warnings:');
    for (const w of warningList) {
      console.log('  - ' + w);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const command = process.argv[2];
const rest = process.argv.slice(3);

switch (command) {
  case 'setup':
    cmdSetup({ installDeps: rest.includes('--install-deps') || rest.includes('--auto') });
    break;
  case 'doctor':
    cmdDoctor();
    break;
  case 'route':
    cmdRoute();
    break;
  case 'hud':
    cmdHud(rest[0]);
    break;
  case 'version':
  case '--version':
  case '-v':
    cmdVersion();
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    cmdHelp();
    break;
  default:
    console.error('Unknown command: ' + command);
    console.error('Run "omi help" for usage.');
    process.exit(1);
}
