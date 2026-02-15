#!/usr/bin/env node
/**
 * -----------------------------------------------------------------------------
 * Test Inventory Snapshot Script
 * -----------------------------------------------------------------------------
 *
 * Purpose:
 *   Generates a snapshot report of existing test suites (folders) and their
 *   associated unit test cases (test() / it() calls) for documentation.
 *
 * Current Assumptions:
 *   - Unit tests live under: Tests/
 *   - Integration tests will later live in a dedicated folder (not yet present).
 *   - Suites are treated as folder paths relative to Tests/.
 *
 * Outputs:
 *   Creates a snapshot folder under:
 *     test-results/inventory/<timestamp>__<who>/
 *
 *   Inside:
 *     - test-inventory.md   (human-friendly, tabulated)
 *     - test-inventory.json (machine-friendly)
 *
 * Usage:
 *   npm run test:inventory
 *
 * Notes / Limitations:
 *   - Extracts only string-literal test titles: test("...") / it("...")
 *   - If titles are variables/template literals, they may not be captured.
 * -----------------------------------------------------------------------------
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sh(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return (r.stdout || "").trim() || null;
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

function walkFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(cur, e.name);
      if (e.isDirectory()) stack.push(full);
      else out.push(full);
    }
  }
  return out;
}

// Extract test titles from common Jest patterns: test("..."), it("...")
// Captures string literal only (single or double quotes). Ignores skipped/todo variants? (still matches).
function extractTestTitles(fileContent) {
  const titles = [];
  const re = /\b(?:test|it)\s*\(\s*(['"])(.*?)\1\s*,/g;
  let m;
  while ((m = re.exec(fileContent)) !== null) {
    titles.push(m[2]);
  }
  return titles;
}

// Suite = folder path relative to Tests/
function suiteFromFile(testsRoot, filePath) {
  const rel = path.relative(testsRoot, filePath).replaceAll("\\", "/");
  const dir = path.posix.dirname(rel);
  return dir === "." ? "(root)" : dir;
}

function mdEscape(s) {
  return String(s).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function makeMarkdownReport(data) {
  const lines = [];
  lines.push(`# Test Inventory Snapshot`);
  lines.push(``);
  lines.push(`**Generated:** ${data.generatedAt}`);
  lines.push(`**Runner:** ${data.runner}`);
  lines.push(`**Git Branch:** ${data.git.branch ?? "unknown"}`);
  lines.push(`**Git Commit:** ${data.git.commit ? data.git.commit.slice(0, 8) : "unknown"}`);
  lines.push(``);

  // Summary
  lines.push(`## Summary`);
  lines.push(`- Unit test suites: ${data.summary.unitSuites}`);
  lines.push(`- Unit test files: ${data.summary.unitTestFiles}`);
  lines.push(`- Unit test cases (extracted): ${data.summary.unitTestCasesExtracted}`);
  lines.push(``);
  lines.push(`## Unit Test Suites and Test Cases`);
  lines.push(``);
  lines.push(`| Suite (folder) | Test File | Test Cases (extracted) | Count |`);
  lines.push(`|---|---|---|---:|`);

  for (const suite of data.unit.suites) {
    for (const file of suite.files) {
      const cases = file.testCases.length
        ? file.testCases.map((t) => `- ${mdEscape(t)}`).join("<br>")
        : "_(none extracted)_";
      lines.push(
        `| ${mdEscape(suite.name)} | ${mdEscape(file.fileName)} | ${cases} | ${file.testCases.length} |`
      );
    }
  }

  lines.push(``);
  lines.push(`## Integration Tests`);
  lines.push(`_(Not yet implemented in repository. Planned dedicated folder for integration tests.)_`);
  lines.push(``);
  lines.push(`## System Tests`);
  lines.push(`_(To be defined: typically end-to-end behavior across subsystems.)_`);
  lines.push(``);
  lines.push(`## Acceptance Tests`);
  lines.push(`_(To be defined: user-facing requirements / acceptance criteria verification.)_`);
  lines.push(``);
  lines.push(`## Notes`);
  lines.push(`- This snapshot extracts Jest test titles only when written as string literals in test()/it().`);
  lines.push(`- Dynamic titles (variables, template literals) may not be captured and should be avoided if you want complete inventories.`);
  lines.push(``);

  return lines.join("\n");
}

function main() {
  const repoRoot = process.cwd();
  const testsRoot = path.join(repoRoot, "Tests");

  if (!fs.existsSync(testsRoot)) {
    console.error(`Expected Tests/ directory not found at: ${testsRoot}`);
    process.exit(1);
  }

  const runnerRaw =
    sh("git", ["config", "user.name"]) ||
    process.env.USERNAME ||
    process.env.USER ||
    "unknown";

  const outRoot = path.join(repoRoot, "test-results", "inventory");
  ensureDir(outRoot);

  const folderName = `${makeTimestampFolder()}__${slug(runnerRaw)}`;
  const outDir = path.join(outRoot, folderName);
  ensureDir(outDir);

  // Collect test files
  const allFiles = walkFiles(testsRoot);
  const testFiles = allFiles.filter((f) => f.endsWith(".test.js"));

  // Build suite structure
  const suitesMap = new Map(); // suiteName -> { name, files: [] }

  let totalCases = 0;

  for (const f of testFiles) {
    const suiteName = suiteFromFile(testsRoot, f);
    if (!suitesMap.has(suiteName)) {
      suitesMap.set(suiteName, { name: suiteName, files: [] });
    }

    const content = fs.readFileSync(f, "utf8");
    const cases = extractTestTitles(content);
    totalCases += cases.length;

    suitesMap.get(suiteName).files.push({
      filePath: path.relative(repoRoot, f).replaceAll("\\", "/"),
      fileName: path.basename(f),
      testCases: cases,
      testCaseCount: cases.length,
    });
  }

  // Sort suites + files for stable output
  const suites = Array.from(suitesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  for (const s of suites) {
    s.files.sort((a, b) => a.fileName.localeCompare(b.fileName));
  }

  const data = {
    generatedAt: new Date().toISOString(),
    runner: runnerRaw,
    git: {
      branch: sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
      commit: sh("git", ["rev-parse", "HEAD"]),
      dirty: !!sh("git", ["status", "--porcelain"]),
    },
    summary: {
      unitSuites: suites.length,
      unitTestFiles: testFiles.length,
      unitTestCasesExtracted: totalCases,
    },
    unit: {
      root: "Tests/",
      suites,
    },
    integration: {
      root: null,
      suites: [],
      note: "Planned dedicated folder for integration tests (not yet present).",
    },
    system: { note: "To be defined." },
    acceptance: { note: "To be defined." },
  };

  const md = makeMarkdownReport(data);

  fs.writeFileSync(path.join(outDir, "test-inventory.json"), JSON.stringify(data, null, 2), "utf8");
  fs.writeFileSync(path.join(outDir, "test-inventory.md"), md, "utf8");

  console.log(`Test inventory snapshot created: ${outDir}`);
  console.log(`- test-inventory.md`);
  console.log(`- test-inventory.json`);
}

main();
