// Checks the specs the AI writes in ai-only/ against the briefs they came from.
//
// **Why this exists.** People no longer have to read the AI's specs line by
// line — that was the promise the Lean AI layer changed — so something else has
// to. The failure the read-back used to catch is invented scope: a sentence in
// the spec nobody asked for, which the next build then honours. Here every fact
// carries a source, and a source is checkable: the question it names exists,
// and somebody actually answered it. A line with no source, or with a source
// that says nothing, is the invented line.
//
// **What it refuses to guess.** It checks that a source exists and is not
// empty — not that the line says what the source says. That stays a person's
// job when they choose to look, and a passing run should not be read as more.
//
// **Unknowns are not faults.** An `UNKNOWN:` line is the AI doing exactly what
// it was asked — stopping rather than guessing — so it is reported, not failed.
// `--ready <spec>` is the other question, "may this be built now?", and there an
// open unknown is a no. /build runs that before it plans.
//
// Usage:
//   node tools/spec-lint.mjs                   # every project in the repository
//   node tools/spec-lint.mjs <projectRoot…>    # just these
//   node tools/spec-lint.mjs --ready <spec.md> # …and fail if any UNKNOWN is open
//
// Exit code 1 on an error. Notes are printed and do not fail the run.

import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["node_modules", "target", ".git", "dist", "ai-only", "_forms", ".github"]);

/** Reads a document with its line endings normalised — a CRLF checkout once
 *  made a sibling check pass everything it read, because `$` does not match
 *  before a carriage return. */
async function read(file) {
  return (await fs.readFile(file, "utf8")).replace(/\r\n/g, "\n");
}

/** A framework file a project received from `init`, falling back to this
 *  repository's `template/` copy. */
function frameworkFile(root, rel) {
  for (const p of [path.join(root, rel), path.join(repo, "template", rel)]) if (existsSync(p)) return p;
  return null;
}

/** **The allowed keys come from the format document, not from a list here.**
 *  Two copies of the key list would disagree within a month; reading the
 *  `## Keys` table means the document a translator reads is the rule the check
 *  enforces. */
async function allowedKeys(root) {
  const file = frameworkFile(root, "ai-only/2-ai-system.template.md");
  if (!file) return null;
  const text = await read(file);
  // Matched on the word, not the whole heading: a heading reworded to
  // "## Keys: only these" once left the check with no keys at all.
  const section = text.match(/^## Keys\b[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  const keys = new Set();
  for (const line of (section?.[1] ?? "").split("\n")) {
    if (!line.startsWith("|")) continue;
    for (const [, k] of line.matchAll(/`([A-Za-z][A-Za-z-]*)`/g)) keys.add(k);
  }
  return keys;
}

/** Front matter as flat scalars — the same small reader brief-lint uses. */
function frontMatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const fields = {};
  for (const line of text.slice(4, end).split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) fields[line.slice(0, at).trim()] = line.slice(at + 1).replace(/\s+#.*$/, "").trim();
  }
  return { fields, bodyStart: text.slice(0, text.indexOf("\n", end + 1) + 1).split("\n").length - 1 };
}

/** Is there an answer here — rather than a question, guidance or an example? */
function hasContent(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (typeof v !== "object") return true;
  if (Array.isArray(v)) return v.length > 0;
  if ("answer" in v) return hasContent(v.answer);
  if ("entries" in v) return hasContent(v.entries);
  return Object.entries(v).some(
    ([k, x]) => !["question", "guidance", "example", "exampleEntry", "note"].includes(k) && hasContent(x),
  );
}

/** The answer under `### id —` in a Markdown brief, without its guidance. */
function markdownAnswer(text, id) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => new RegExp(`^###\\s+${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(l));
  if (start === -1) return null;
  const out = [];
  for (const l of lines.slice(start + 1)) {
    if (/^#{1,3}\s|^---\s*$/.test(l)) break;
    if (l.trim() !== "" && !l.trimStart().startsWith(">")) out.push(l);
  }
  return out.join("\n");
}

/** Resolves one source. Returns null when it is good, or what is wrong. */
async function checkSource(src, ctx) {
  const preset = src.match(/^(preset|baseline):(.+)$/);
  if (preset) {
    const file = frameworkFile(ctx.root, "_forms/boilerplates.json");
    if (!file) return "no _forms/boilerplates.json to look it up in";
    const all = JSON.parse(await read(file));
    const table = preset[1] === "preset" ? all.boilerplates : all.securityBaselines;
    return table?.[preset[2]] ? null : `${src} is not in _forms/boilerplates.json`;
  }

  const hash = src.lastIndexOf("#");
  const rel = hash === -1 ? ctx.from : src.slice(0, hash);
  const id = hash === -1 ? src : src.slice(hash + 1);
  const file = path.join(ctx.root, rel);
  if (!existsSync(file)) return `${rel} does not exist`;
  const text = await read(file);

  let answered;
  if (rel.endsWith(".json")) {
    let v = JSON.parse(text);
    for (const part of id.split(".")) {
      if (v === null || typeof v !== "object" || !(part in v)) return `${rel} has no "${id}"`;
      v = v[part];
    }
    answered = hasContent(v);
  } else {
    const answer = markdownAnswer(text, id);
    if (answer === null) return `${rel} has no question "${id}"`;
    answered = answer.trim() !== "";
  }
  // **An unknown may cite an empty answer — that is usually why it is unknown** —
  // and so may a deferral of one.
  // Anything else citing one is a fact with nothing behind it.
  return answered || ctx.unknown ? null : `cites ${rel}#${id}, which nobody has answered`;
}

const LINE = /^([A-Za-z][A-Za-z-]*):\s+(.+?)\s*$/;

const ITEM_SPECS = new Set(["page", "endpoint", "model"]);

/** `[a, b]` → ["a", "b"], sorted so order is not a difference. */
const listOf = (v) =>
  String(v ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .sort();

/** An item brief's deliverable and dependencies, Markdown or JSON. */
async function briefHeader(file) {
  const text = await read(file);
  if (file.endsWith(".json")) {
    const b = JSON.parse(text);
    return { deliverable: b.deliverable ?? "", dependsOn: [...(b.dependsOn?.entries ?? [])].sort() };
  }
  const f = frontMatter(text)?.fields ?? {};
  return { deliverable: f.deliverable ?? "", dependsOn: listOf(f["depends-on"]) };
}

async function lintSpec(file, root, keys) {
  const errors = [];
  const unknowns = [];
  const text = await read(file);
  const fm = frontMatter(text);
  if (!fm?.fields.spec) return null; // not a spec — the framework's own documents live here too

  const from = fm.fields.from;
  if (!from) errors.push(`:1  no "from:" — nothing to check its sources against`);
  else if (!existsSync(path.join(root, from))) errors.push(`:1  from: ${from} does not exist`);

  // **The copy /build reads instead of the brief.** An item spec carries its
  // brief's deliverable and dependencies so a build need not open the brief.
  // A copy that has drifted would build towards the wrong deliverable, or
  // before what it depends on — so it is checked like any other source.
  if (ITEM_SPECS.has(fm.fields.spec) && from && existsSync(path.join(root, from))) {
    const brief = await briefHeader(path.join(root, from));
    const list = (v) => `[${v.join(", ")}]`;
    if (!("deliverable" in fm.fields)) errors.push(`:1  no "deliverable:" — copy it from ${from}`);
    else if (fm.fields.deliverable !== brief.deliverable) {
      errors.push(`:1  deliverable "${fm.fields.deliverable}" but the brief says "${brief.deliverable}" — re-translate`);
    }
    if (!("depends-on" in fm.fields)) errors.push(`:1  no "depends-on:" — copy it from ${from}`);
    else {
      const deps = listOf(fm.fields["depends-on"]);
      if (list(deps) !== list(brief.dependsOn)) {
        errors.push(`:1  depends-on ${list(deps)} but the brief says ${list(brief.dependsOn)} — re-translate`);
      }
    }
  }

  const lines = text.split("\n");
  for (let i = fm.bodyStart; i < lines.length; i++) {
    const line = lines[i];
    const at = `:${i + 1}`;
    if (/^##\s+Round\b/.test(line)) break; // build's reports — prose, by design
    if (line.trim() === "" || line.startsWith("#") || line.startsWith(">") || line.startsWith("```")) continue;

    const m = line.match(LINE);
    if (!m) {
      errors.push(`${at}  not a "key: value [source]" line — ${line.slice(0, 60)}`);
      continue;
    }
    const [, key, rest] = m;
    if (!keys.has(key)) {
      errors.push(`${at}  "${key}" is not a key in 2-ai-system.template.md`);
      continue;
    }
    const src = rest.match(/\[([^\]]+)\]\s*$/);
    if (!src) {
      errors.push(`${at}  "${key}" has no [source] — where did it come from?`);
      continue;
    }
    if (key === "DEFERRED" && !/—\s*owner:\s*\S/.test(rest)) {
      errors.push(`${at}  DEFERRED needs "— owner: <name>" — a deferral nobody owns is an unknown`);
    }
    if (key === "UNKNOWN") unknowns.push(`${at}  ${rest.replace(/\s*\[[^\]]+\]\s*$/, "")}`);

    if (from && existsSync(path.join(root, from))) {
      for (const s of src[1].split(",").map((x) => x.trim()).filter(Boolean)) {
        const wrong = await checkSource(s, { root, from, unknown: key === "UNKNOWN" || key === "DEFERRED" });
        if (wrong) errors.push(`${at}  [${s}] — ${wrong}`);
      }
    }
  }
  return { errors, unknowns };
}

/** Every folder holding a Project_brief.md. */
async function projectRoots(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  if (entries.some((e) => e.isFile() && e.name === "Project_brief.md")) out.push(dir);
  for (const e of entries) if (e.isDirectory() && !SKIP.has(e.name)) await projectRoots(path.join(dir, e.name), out);
  return out;
}

async function specsIn(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== "procedures") await specsIn(full, out);
    else if (e.isFile() && e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

/** The project a spec belongs to: the nearest folder above it with a brief. */
function rootOf(file) {
  for (let d = path.dirname(file); d !== path.dirname(d); d = path.dirname(d)) {
    if (existsSync(path.join(d, "Project_brief.md"))) return d;
  }
  return null;
}

const args = process.argv.slice(2);
const readyAt = args.indexOf("--ready");
let targets; // [{ root, files }]
if (readyAt !== -1) {
  const spec = path.resolve(args[readyAt + 1] ?? "");
  const root = rootOf(spec);
  if (!existsSync(spec) || !root) {
    console.log(`--ready needs a spec inside a project — got ${args[readyAt + 1] ?? "nothing"}`);
    process.exit(1);
  }
  targets = [{ root, files: [spec] }];
} else {
  const roots = args.length > 0 ? args.map((p) => path.resolve(p)) : await projectRoots(repo);
  targets = await Promise.all(roots.map(async (root) => ({ root, files: await specsIn(path.join(root, "ai-only")) })));
}

let failed = false;
let checked = 0;
for (const { root, files } of targets) {
  const keys = await allowedKeys(root);
  if (!keys || keys.size === 0) {
    console.log(`\n${path.relative(repo, root) || "."} — no key table in ai-only/2-ai-system.template.md`);
    failed = true;
    continue;
  }
  for (const file of files.sort()) {
    const result = await lintSpec(file, root, keys);
    if (!result) continue;
    checked++;
    const rel = path.relative(process.cwd(), file).split(path.sep).join("/");
    const { errors, unknowns } = result;
    console.log(`\n${rel}`);
    for (const e of errors) console.log(`  ERROR  ${rel}${e}`);
    for (const u of unknowns) console.log(`  open   ${rel}${u}`);
    if (errors.length === 0 && unknowns.length === 0) console.log("  every line sourced");
    if (errors.length > 0) failed = true;
    if (readyAt !== -1 && unknowns.length > 0) {
      console.log(`  not ready: ${unknowns.length} unknown(s) open — a person answers them, or marks them DEFERRED with an owner`);
      failed = true;
    }
  }
}
if (checked === 0) console.log("no specs in ai-only/ yet — nothing to check");
process.exit(failed ? 1 : 0);
