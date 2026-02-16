#!/usr/bin/env node

/**
 * -----------------------------------------------------------------------------
 * Test Workflow Help Script
 * -----------------------------------------------------------------------------
 *
 * Prints a concise summary of the available test workflow commands.
 *
 * Usage:
 *   npm run test:help
 *
 * This script does not execute any tests. It only displays guidance.
 * -----------------------------------------------------------------------------
 */

console.log(`
Test Workflow Commands
======================

Standard Development Testing
----------------------------
npm test
  → Runs Jest normally (no artifact generation).

Record a Test Run (creates report artifacts)
--------------------------------------------
npm run test:record
  → Runs all tests and generates a timestamped report folder under:
    test-results/history/

npm run test:record -- <path-or-pattern>
  → Records only the specified folder, file, or Jest pattern.
  Example:
    npm run test:record -- Tests/src/harmony/ComplementaryOKLCH

Generate Test Inventory Snapshot
--------------------------------
npm run test:inventory
  → Scans current test suites and unit test cases and outputs a
    snapshot under:
    test-results/inventory/

Clean Old Recorded Runs
-----------------------
npm run test:clean
  → Keeps the 30 most recent run folders (default).

npm run test:clean -- <N>
  → Keeps only the N most recent run folders.

Create Shareable Zip Artifact
-----------------------------
npm run test:zip
  → Zips all historical test runs into:
    test-results/artifacts/

npm run test:zip -- <N>
  → Zips only the N most recent run folders.

Notes
-----
- test-results/ is gitignored (artifacts are local only).
- Use '--' to forward arguments properly to npm scripts.
- For full documentation, see scripts README.
`);
