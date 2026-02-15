#!/usr/bin/env node
/**
 * -----------------------------------------------------------------------------
 * Test History Cleanup Script
 * -----------------------------------------------------------------------------
 *
 * Purpose:
 *   Removes older recorded test run folders from:
 *
 *     test-results/history/
 *
 *   while keeping only the most recent N runs.
 *
 *   This prevents excessive local disk usage from accumulating
 *   many historical test reports.
 *
 * Usage:
 *
 *   Keep the 30 most recent runs (default):
 *     npm run test:clean
 *
 *   Keep a specific number of recent runs:
 *     npm run test:clean -- 10
 *
 *   (Example above keeps the 10 most recent report folders.)
 *
 * Behavior:
 *   - Sorts run folders lexicographically (timestamp-based naming).
 *   - Deletes all but the newest N folders.
 *   - Does NOT affect version control (test-results/ is gitignored).
 *
 * -----------------------------------------------------------------------------
 */

import fs from "node:fs";
import path from "node:path";

const HISTORY_DIR = path.join(process.cwd(), "test-results", "history");
const keepArg = process.argv[2];
const KEEP = Number.isFinite(Number(keepArg)) ? Number(keepArg) : 30;

if (!fs.existsSync(HISTORY_DIR)) {
  console.log("No history directory found. Nothing to clean.");
  process.exit(0);
}

const entries = fs
  .readdirSync(HISTORY_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

// Your folder names start with a timestamp, so lexicographic sort works.
// Newest last if ascending; we want newest first.
entries.sort().reverse();

const toDelete = entries.slice(KEEP);

for (const dir of toDelete) {
  fs.rmSync(path.join(HISTORY_DIR, dir), { recursive: true, force: true });
}

console.log(
  `History cleanup complete. Kept ${Math.min(KEEP, entries.length)} run(s), deleted ${toDelete.length} run(s).`
);
