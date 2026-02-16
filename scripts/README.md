# Scripts README: Test Run Recording, Cleanup, and Sharing

## Why these scripts exist

These scripts standardize and automate evidence collection by generating a **repeatable, timestamped test run folder** per execution, including:

* machine-readable results (JSON)
* human-readable report (HTML)
* JUnit XML (useful for formal reporting/CI tooling)
* run metadata (who ran it, branch, commit, command)

All outputs are treated as **local artifacts** (gitignored) so the repo does not bloat.

---

## What gets created

After running `test:record`, you will get a folder under:

`test-results/history/<run-folder>/`

Where `<run-folder>` is:

`YYYY-MM-DD_HH-MM-SS_UTC±offset__<who>__<what>`

Examples:

* `2026-02-14_21-30-35_UTC-0500__Ian-Timchak__all-tests`
* `2026-02-14_21-31-10_UTC-0500__Ian-Timchak__ComplementaryOKLCH`
* `2026-02-14_21-31-50_UTC-0500__Ian-Timchak__paletteReturns.test.js`

Inside each run folder you should see:

* `report.html` (open this for the human-friendly report)
* `junit.xml`
* `jest-results.json`
* `run-metadata.json`
* any additional HTML assets the reporter generates (JS/CSS/attachments)

FOR BETTER TRACKING OF TEST RUNS, CONSIDER SETTING YOUR GIT USER NAME IN YOUR TERMINAL:  
   git config --global user.name "FirstName LastName"

---

## Commands

### 1) Normal tests (unchanged)

Runs tests the way the project originally did.

```bash
npm test
```

This does **not** create a historical artifact folder. It’s meant for normal dev workflow.

---

### 2) Record a test run (creates a full report artifact)

Runs Jest and saves a complete report into a unique run folder.

Run all tests:

```bash
npm run test:record
```

Run a specific folder (our “suite”):

```bash
npm run test:record -- "Tests/src/harmony/ComplementaryOKLCH"
```

Run a specific test file:

```bash
npm run test:record -- "Tests/public/colorConversion/errorHandlingFormat.test.js"
```

Run using Jest options (example):

```bash
npm run test:record -- --testPathPattern "Tests/public/colorConversion"
```

Notes:

* Use `--` to forward arguments reliably to the script/Jest.
* The run folder name includes:

  * `who`: `git config user.name` (fallback to OS username)
  * `what`: extracted from the last folder/file/pattern you target

---

### 3) Clean old reports (keep only the N most recent)

Deletes older run folders under `test-results/history/`.

Keep the most recent 30 runs (default):

```bash
npm run test:clean
```

Keep the most recent 10 runs:

```bash
npm run test:clean -- 10
```

This affects only your local machine.

---

### 4) Zip reports for sharing (creates a shareable artifact)

Creates a zip file under:

`test-results/artifacts/`

Zip all historical runs:

```bash
npm run test:zip
```

Zip only the most recent 20 runs:

```bash
npm run test:zip -- 20
```

The zip name includes:

* project name
* who created it
* time window covered (oldest-to-newest)
* number of runs
* branch + short commit hash

This is the recommended way to share test evidence with teammates/instructors without committing artifacts to git.

Dependency:

* `test:zip` requires `archiver`:

  ```bash
  npm i -D archiver
  ```

---

## Git / repo behavior

### Are these reports committed?

No. Reports should remain local build artifacts.

Recommended `.gitignore` entries:

* `test-results/`
* `coverage/`

### Do artifacts disappear when switching branches?

No. Git ignores them, so they stay on your disk across branch checkouts unless you delete them manually or run `test:clean`.

### How do I share my reports with someone else?

Since artifacts are gitignored, you share them by:

* sending the zipped artifact produced by `npm run test:zip`, or
* zipping a single run folder under `test-results/history/<run-folder>/`

---

## Troubleshooting

### “No tests found”

If `test:record` says no tests found, make sure the recording config (`jest.record.config.js`) is matching your test files and that you’re targeting the correct folder/file paths.

### HTML report opens blank

The run folder should include any extra JS/CSS assets required by the report. Share the entire run folder or use `test:zip` so the report and its assets stay together.

---

## Summary

Use:

* `npm test` for normal dev testing
* `npm run test:record` when you need evidence (HTML/JUnit/JSON + metadata)
* `npm run test:clean -- N` to keep disk usage under control
* `npm run test:zip -- N` to share artifacts easily



---

# AI USE DISCLOSURE

Portions of the test workflow tooling (including helper scripts for recording, cleaning, and exporting test artifacts) were developed with assistance from an AI tool.

The AI assistance was used exclusively for:

* Generating and refining local automation scripts
* Structuring test artifact output
* Improving developer workflow and documentation
* Drafting usage explanations and comments

The AI was **not used** to:

* Generate application source code
* Implement core project logic
* Write or modify functional requirements
* Design system architecture
* Complete graded algorithmic or domain-specific work

These scripts exist solely to support internal testing, documentation, and evidence collection processes.
