#!/usr/bin/env node
/**
 * -----------------------------------------------------------------------------
 * Test Artifact Zip Script
 * -----------------------------------------------------------------------------
 *
 * Purpose:
 *   Creates a compressed ZIP artifact containing recorded test runs
 *   from test-results/history/.
 *
 *   The resulting artifact is written to:
 *
 *     test-results/artifacts/
 *
 * Naming Convention:
 *   <project>__<who>__<oldest>-to-<newest>__runs-<N>__<branch>__<commit>.zip
 *
 *   Includes:
 *     - Project name
 *     - Runner identity (git user.name or OS username)
 *     - Scope window (oldest-to-newest timestamps in archive)
 *     - Number of runs included
 *
 *   Example:
 *     hue-and-you__Ian-Timchak__2026-02-14_19-10-02-to-2026-02-14_21-44-10__runs-20.zip
 *
 * Usage:
 *
 *   Zip ALL historical runs:
 *     npm run test:zip
 *
 *   Zip only the N most recent runs:
 *     npm run test:zip -- 20
 *
 * Notes:
 *   - Requires dev dependency: `archiver`, so re-run npm install if you haven't already:
 *       npm install --save-dev archiver
 *   - The zip file is NOT committed to git (artifacts directory is ignored).
 *   - Intended for sharing test evidence with teammates or instructors.
 *
 * -----------------------------------------------------------------------------
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

function sh(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.error) return null;
  return (r.stdout || "").trim() || null;
}

async function main() {
  const HISTORY_DIR = path.join(process.cwd(), "test-results", "history");
  const ARTIFACTS_DIR = path.join(process.cwd(), "test-results", "artifacts");
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  if (!fs.existsSync(HISTORY_DIR)) {
    console.error("No history directory found at test-results/history. Nothing to zip.");
    process.exit(1);
  }

  // Optional arg: N most recent runs
  const keepArg = process.argv[2];
  const LIMIT = keepArg ? Number(keepArg) : null;
  if (keepArg && !Number.isFinite(LIMIT)) {
    console.error("Usage: npm run test:zip -- [N]");
    process.exit(1);
  }

  const allRuns = fs
    .readdirSync(HISTORY_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse(); // newest first

  const selectedRuns = LIMIT ? allRuns.slice(0, LIMIT) : allRuns;
  const runsCount = selectedRuns.length;

  if (runsCount === 0) {
    console.error("No run folders found in test-results/history.");
    process.exit(1);
  }

  // WHO (prefer git name, fallback OS)
  const whoRaw =
    sh("git", ["config", "user.name"]) ||
    process.env.USERNAME ||
    process.env.USER ||
    "unknown";
  const who = slug(whoRaw);

  // SCOPE window: oldest <-> newest (based on folder naming that begins with timestamp)
  // selectedRuns is newest-first, so:
  const newest = selectedRuns[0];
  const oldest = selectedRuns[selectedRuns.length - 1];

  // Extract just the timestamp portion up to the first "__"
  // Example folder: 2026-02-14_21-44-10_UTC-0500__Ian__what
  function extractTimestampPrefix(folderName) {
    const idx = folderName.indexOf("__");
    return idx === -1 ? folderName : folderName.slice(0, idx);
  }

  const newestTs = slug(extractTimestampPrefix(newest));
  const oldestTs = slug(extractTimestampPrefix(oldest));
  const scope = `${oldestTs}-to-${newestTs}`;

  // Project + git context
  const projectName = slug(path.basename(process.cwd()));

  // FINAL ZIP NAME (meaningful)
  const zipName = `${projectName}__${who}__${scope}__runs-${runsCount}.zip`;
  const zipPath = path.join(ARTIFACTS_DIR, zipName);

  // Require archiver
  let archiver;
  try {
    archiver = (await import("archiver")).default;
  } catch {
    console.error(
      "Missing dependency: archiver\n" +
        "Install with: npm i -D archiver\n" +
        "Then rerun: npm run test:zip"
    );
    process.exit(1);
  }

  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  const done = new Promise((resolve, reject) => {
    output.on("close", resolve);
    output.on("error", reject);
    archive.on("warning", (err) => {
      if (err.code === "ENOENT") console.warn(err.message);
      else reject(err);
    });
    archive.on("error", reject);
  });

  archive.pipe(output);

  // Add runs under history/<runFolder> inside the zip
  for (const runFolder of selectedRuns) {
    const fullPath = path.join(HISTORY_DIR, runFolder);
    archive.directory(fullPath, path.join("history", runFolder));
  }

  // Include manifest (who + scope included)
  const manifest = {
    project: path.basename(process.cwd()),
    createdAt: new Date().toISOString(),
    who: whoRaw,
    branch: sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
    commit: sh("git", ["rev-parse", "HEAD"]),
    runsIncluded: selectedRuns,
    scope: { oldest: extractTimestampPrefix(oldest), newest: extractTimestampPrefix(newest) },
  };
  archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });

  await archive.finalize();
  await done;

  console.log(`Created zip artifact: ${zipPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
