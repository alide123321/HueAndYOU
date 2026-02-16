#!/usr/bin/env node
/**
 * -----------------------------------------------------------------------------
 * Test Recording Script
 * -----------------------------------------------------------------------------
 *
 * Purpose:
 *   Executes Jest using the recording configuration and generates a
 *   fully self-contained test run artifact under:
 *
 *     test-results/history/<timestamp>__<who>__<scope>/
 *
 *   Each run directory contains:
 *     - jest-results.json      (machine-readable test output)
 *     - junit.xml              (JUnit-compatible report)
 *     - report.html            (human-readable HTML report)
 *     - any associated HTML assets (JS/CSS if applicable)
 *     - run-metadata.json      (run metadata: who, branch, commit, etc.)
 *
 * Folder Naming Convention:
 *   <YYYY-MM-DD_HH-MM-SS_UTC±offset>__<RunnerName>__<Scope>
 *
 *   Where:
 *     - Timestamp is local time (human-readable)
 *     - RunnerName is git config user.name (fallback OS username)
 *     - Scope is derived from:
 *         - --testPathPattern value
 *         - A specific test file
 *         - A directory passed to the command
 *         - Defaults to "all-tests"
 *
 * Usage:
 *
 *   Run all tests and record:
 *     npm run test:record
 *
 *   Run a specific folder/suite:
 *     npm run test:record -- Tests/src/harmony/ComplementaryOKLCH
 *
 *   Run a specific test file:
 *     npm run test:record -- Tests/.../paletteReturns.test.js
 *
 *   Run using a Jest flag:
 *     npm run test:record -- --testPathPattern Tests/public/colorConversion
 *
 * Important:
 *   - This script does NOT modify the normal `npm test` command.
 *   - It uses `jest.record.config.cjs` for reporting.
 *   - Output is gitignored (test-results/ is excluded from version control).
 * 
 * 
 * FOR BETTER TRACKING OF TEST RUNS, CONSIDER SETTING YOUR GIT USER NAME:
 *    git config --global user.name "FirstName LastName"
 *
 * -----------------------------------------------------------------------------
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function sh(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return (r.stdout || "").trim() || null;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function slug(s) {
  return (
    String(s || "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .slice(0, 60) || "unknown"
  );
}

function makeTimestampFolder() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());

  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const offHH = pad2(Math.floor(abs / 60));
  const offMM = pad2(abs % 60);
  const tz = `UTC${sign}${offHH}${offMM}`;

  return `${yyyy}-${mm}-${dd}_${hh}-${mi}-${ss}_${tz}`;
}

function isProbablyPath(a) {
  if (!a) return false;
  // ignore flags like --listTests, --runInBand, etc.
  if (a.startsWith("-")) return false;

  // common path hints: contains / or \, or starts with Tests, or ends with .js
  return (
    a.includes("/") ||
    a.includes("\\") ||
    a.startsWith("Tests") ||
    a.endsWith(".js")
  );
}

function lastPathSegment(p) {
  // Normalize slashes, remove trailing slash, then take basename
  const normalized = p.replaceAll("\\", "/").replace(/\/+$/, "");
  return path.posix.basename(normalized);
}

function describeWhat(args) {
  // 1) Prefer explicit patterns
  const pEq = args.find((a) => a.startsWith("--testPathPattern="));
  if (pEq) return lastPathSegment(pEq.split("=", 2)[1]);

  const i = args.indexOf("--testPathPattern");
  if (i !== -1 && args[i + 1]) return lastPathSegment(args[i + 1]);

  // 2) If they passed a test file directly, use that filename
  const testFile = args.find((a) => a.endsWith(".test.js") || a.endsWith(".spec.js"));
  if (testFile) return path.basename(testFile);

  // 3) If they passed a folder/path like "Tests/src/harmony/ComplementaryOKLCH"
  const pathArg = args.find(isProbablyPath);
  if (pathArg) return lastPathSegment(pathArg);

  // 4) Fallback
  return args.length ? "custom-run" : "all-tests";
}

// pass-through args: npm run test:record -- <jest args>
const extraArgs = process.argv.slice(2);

// WHO
const runnerNameRaw =
  sh("git", ["config", "user.name"]) ||
  process.env.USERNAME ||
  process.env.USER ||
  "unknown";
const runnerName = slug(runnerNameRaw);

// WHAT
const what = slug(describeWhat(extraArgs));

// WHERE
const ROOT_RESULTS = path.join(process.cwd(), "test-results", "history");
ensureDir(ROOT_RESULTS);

// Timestamp (human readable)
const ts = makeTimestampFolder();

// Final folder: timestamp__who__what
const runFolderName = `${ts}__${runnerName}__${what}`;
const RUN_DIR = path.join(ROOT_RESULTS, runFolderName);
ensureDir(RUN_DIR);

// Output JSON directly into run dir
const outJson = path.join(RUN_DIR, "jest-results.json");

// IMPORTANT: use the record-only config (and make it absolute)
const jestConfigAbs = path.resolve(process.cwd(), "jest.record.config.js");

// Jest args
const jestArgs = [
  "--config",
  jestConfigAbs,
  "--json",
  `--outputFile=${outJson}`,
  ...extraArgs,
];

// Env var so reporters output into this run folder too
const env = { ...process.env, JEST_RESULTS_DIR: RUN_DIR };

// Run Jest EXACTLY like your working npm test does
const r = spawnSync(
  "node",
  ["--experimental-vm-modules", "node_modules/jest/bin/jest.js", ...jestArgs],
  { stdio: "inherit", env }
);

const meta = {
  timestamp: new Date().toISOString(),
  exitCode: r.status ?? 1,
  resultsDir: RUN_DIR,
  runFolderName,
  runner: runnerNameRaw,
  what: describeWhat(extraArgs),
  command: `node --experimental-vm-modules node_modules/jest/bin/jest.js ${jestArgs.join(" ")}`,
  git: {
    branch: sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
    commit: sh("git", ["rev-parse", "HEAD"]),
    dirty: !!sh("git", ["status", "--porcelain"]),
  },
  user: {
    osUser: process.env.USER || process.env.USERNAME || null,
    gitUser: runnerNameRaw,
  },
};

fs.writeFileSync(
  path.join(RUN_DIR, "run-metadata.json"),
  JSON.stringify(meta, null, 2),
  "utf8"
);

process.exit(meta.exitCode);
