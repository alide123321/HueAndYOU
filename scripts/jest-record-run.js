#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function sh(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return (r.stdout || "").trim() || null;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

const RESULTS_DIR = path.join(process.cwd(), "test-results");
ensureDir(RESULTS_DIR);

const isoFolder = new Date().toISOString().replace(/[:.]/g, "-");
const outJson = path.join(RESULTS_DIR, "jest-results.json");

// pass-through args: npm run test:record -- <regular jest args>
const extraArgs = process.argv.slice(2);

const jestArgs = [
  "--config",
  "jest.config.js",
  "--json",
  `--outputFile=${outJson}`,
  ...extraArgs,
];

const r = spawnSync("npx", ["jest", ...jestArgs], { stdio: "inherit" });

const meta = {
  timestamp: new Date().toISOString(),
  exitCode: r.status ?? 1,
  command: `npx jest ${jestArgs.join(" ")}`,
  git: {
    branch: sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
    commit: sh("git", ["rev-parse", "HEAD"]),
    dirty: !!sh("git", ["status", "--porcelain"]),
  },
  user: {
    osUser: process.env.USER || process.env.USERNAME || null,
    gitUser: sh("git", ["config", "user.name"]),
  },
};

fs.writeFileSync(
  path.join(RESULTS_DIR, "run-metadata.json"),
  JSON.stringify(meta, null, 2),
  "utf8"
);

// snapshot into history/<timestamp>/
const snapDir = path.join(RESULTS_DIR, "history", isoFolder);
ensureDir(snapDir);

for (const f of ["jest-results.json", "run-metadata.json", "junit.xml", "report.html"]) {
  const src = path.join(RESULTS_DIR, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(snapDir, f));
}

process.exit(meta.exitCode);