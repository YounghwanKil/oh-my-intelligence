#!/usr/bin/env node
/**
 * OMI Script Runner
 * Adapted from OMC's run.cjs pattern.
 * Loads and executes hook scripts with proper error handling.
 */
'use strict';

const { pathToFileURL } = require('url');
const path = require('path');

const scriptPath = process.argv[2];
if (!scriptPath) {
  process.exit(0);
}

const absPath = path.isAbsolute(scriptPath) ? scriptPath : path.resolve(scriptPath);

(async () => {
  try {
    const mod = await import(pathToFileURL(absPath).href);
    if (typeof mod.default === 'function') {
      await mod.default();
    }
  } catch (err) {
    // Hooks must not crash — log and exit cleanly
    if (process.env.OMI_DEBUG) {
      console.error(`[OMI] Hook error in ${path.basename(absPath)}:`, err.message);
    }
    process.exit(0);
  }
})();
