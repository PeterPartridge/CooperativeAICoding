#!/usr/bin/env node
// Puts the framework into a project — the whole of the "getting started" that
// used to be "clone this repository and copy a folder out of it".
//
// **Why this exists.** Every comparable tool starts with one command, and this
// one started with a clone, a copy, and a twenty-question form. The first ten
// minutes decide whether anybody reaches the part that is actually good, and
// a folder copy is a poor use of them.
//
// **It writes, it never overwrites.** A file that already exists is left
// exactly as it is and named in the report. Running this into a project that
// is already set up is therefore safe, and is how you pick up forms added
// since — with `--dry-run` first if you want to see it before it happens.
//
// No dependencies, on purpose: this is installed on somebody else's machine,
// and the thing it is asking for is trust.
//
//   npm install -g coperativeai
//   coperativeai init [folder]
//   node bin/coperativeai.mjs init ../my-project --dry-run

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { layout } from "./layout.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const framework = path.resolve(here, "..");

// What a project receives is package.json's `files`; bin/layout.mjs says how
// each entry lands.

const written = [];
const kept = [];

async function copyFile(from, to, dryRun) {
  try {
    await fs.access(to);
    kept.push(to);
    return;
  } catch {
    // not there, which is the case we write
  }
  written.push(to);
  if (dryRun) return;
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
}

async function copy(from, to, dryRun) {
  const stat = await fs.stat(from);
  if (stat.isFile()) return copyFile(from, to, dryRun);
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    await copy(path.join(from, entry.name), path.join(to, entry.name), dryRun);
  }
}

async function init(target, dryRun) {
  const root = path.resolve(target ?? ".");
  const rel = (p) => path.relative(root, p).split(path.sep).join("/");

  await fs.mkdir(root, { recursive: true });
  for (const { from, to } of await layout(framework)) {
    await copy(path.join(framework, from), path.join(root, to), dryRun);
  }

  const verb = dryRun ? "would write" : "wrote";
  console.log(`\n${verb} ${written.length} file(s) into ${root}`);
  for (const f of written.slice(0, 12)) console.log(`  ${rel(f)}`);
  if (written.length > 12) console.log(`  … and ${written.length - 12} more`);

  if (kept.length > 0) {
    // **Named, not silently skipped.** "It already ran and did nothing" and
    // "it left your answers alone" look identical in a summary count.
    console.log(`\nleft alone, already there: ${kept.length} file(s)`);
    for (const f of kept.slice(0, 6)) console.log(`  ${rel(f)}`);
    if (kept.length > 6) console.log(`  … and ${kept.length - 6} more`);
  }

  if (dryRun) {
    console.log("\nDry run — nothing was written. Drop --dry-run to do it.");
    return;
  }

  console.log(`
Next, in that folder:

  1. Answer Project_brief.md in plain English. Lines starting with ">" are
     guidance; everything else you write is your answer. Set status: filled.
     Already have a codebase? Start Claude Code and run /draft instead — it
     fills the brief in from the code, says where each answer came from, and
     asks you a handful of multiple-choice questions rather than twenty open
     ones. Its answers are marked as its own until you accept them.
  2. Start Claude Code there and run:  /translate Project_brief.md
     It writes the digest and the spec, every line citing your answer, and
     lists as UNKNOWN whatever it could not tell. Answer those.
  3. Add the first item:  /new-item page <solution> <name>
     (or endpoint, or model — a backend-only project has no pages at all.)
  4. Fill it in, /translate it, then /build it.

  node tools/check.mjs   runs every check: briefs, specs, code map, QA's
                         suite and the round record
`);
}

function usage() {
  console.log(`
CooperativeAICoding — a way of working that Product, Developers, QA and AI share.

  coperativeai init [folder] [--dry-run]

  Installed with: npm install -g coperativeai

  init        put the brief, the forms and the commands into a project
  --dry-run   say what it would write, and write nothing

Nothing is ever overwritten: files that already exist are left alone and named.
`);
}

const [command, ...rest] = process.argv.slice(2);
const dryRun = rest.includes("--dry-run");
const target = rest.find((a) => !a.startsWith("-"));

if (command === "init") {
  await init(target, dryRun);
} else if (command === undefined || command === "--help" || command === "-h" || command === "help") {
  usage();
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(1);
}
