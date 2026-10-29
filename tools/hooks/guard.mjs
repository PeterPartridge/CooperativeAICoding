// The Claude Code hook that enforces what a model cannot be trusted to keep.
//
// **Why a hook.** Every guardrail file in this framework ends by admitting
// "nothing here makes you follow them": a procedure is a document an agent is
// pointed at. A hook is different. Claude Code runs it before and after every
// write, and a refusal from it is a refusal, whatever the model meant to do.
// So the rules whose breaking cannot be undone by editing a file afterwards
// live here:
//
// - **Only a person signs.** No sign-off in a brief, no "happy" on QA's
//   review, no row in QA's sign-off sheet is ever written by the AI.
// - **No secret values.** A write that adds a private key or a known token
//   format is refused. A committed secret is a rotated secret.
// - **Specs stay clean as they are written.** After a spec in ai-only/ is
//   written, spec-lint runs on it and what it finds goes straight back.
//
// **It fails open.** Input it cannot read lets the action through: a guard
// that locks an agent up over its own bug gets switched off, and then it
// guards nothing.
//
//   node tools/hooks/guard.mjs pre|post   (reads the hook's JSON on stdin)

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const phase = process.argv[2];

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}
const file = input?.tool_input?.file_path;
if (typeof file !== "string") process.exit(0);
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join("/");

const refuse = (why) => {
  process.stderr.write(`${why}\n`);
  process.exit(2);
};

const read = (p) => {
  try {
    return readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  } catch {
    return null;
  }
};

/** The file as it is now, and as it would be after this write. */
function beforeAndAfter() {
  const before = read(file);
  const t = input.tool_input;
  if (input.tool_name === "Write") return { before: before ?? "", after: String(t.content ?? "") };
  if (input.tool_name === "Edit" && before !== null && typeof t.old_string === "string") {
    const next = String(t.new_string ?? "");
    const after = t.replace_all ? before.split(t.old_string).join(next) : before.replace(t.old_string, () => next);
    return { before, after };
  }
  return null;
}

/** Flat front matter, or a JSON document's top-level fields. */
function fields(text, isJson) {
  if (isJson) {
    try {
      return JSON.parse(text) ?? {};
    } catch {
      return {};
    }
  }
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  for (const line of (m?.[1] ?? "").split("\n")) {
    const at = line.indexOf(":");
    if (at > 0) out[line.slice(0, at).trim()] = line.slice(at + 1).replace(/\s+#.*$/, "").trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const SIGNOFFS = ["product-signoff", "build-signoff", "buildSignoff"];

/** Formats no placeholder ever has. Only what this write adds is refused, so
 *  a file that already held one (a fixture, a scanner's own tests) can still
 *  be edited. */
const SECRETS = [
  ["a private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ["an AWS access key", /\bAKIA[0-9A-Z]{16}\b/g],
  ["a GitHub token", /\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/g],
  ["a Slack token", /\bxox[abprs]-[A-Za-z0-9-]{10,}/g],
  ["an Anthropic API key", /\bsk-ant-[A-Za-z0-9_-]{20,}/g],
  ["an OpenAI API key", /\bsk-(?:proj-)?[A-Za-z0-9]{32,}\b/g],
  ["a Stripe live key", /\b[sr]k_live_[A-Za-z0-9]{20,}\b/g],
  ["a Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/g],
];

function pre() {
  const change = beforeAndAfter();
  if (!change) return;
  const { before, after } = change;

  if (rel === "qa/signoff.md") {
    refuse("Blocked: qa/signoff.md is QA's. Signing a deliverable off is a person saying so — the AI never writes here.");
  }

  const isJson = rel.endsWith(".json");
  const was = fields(before, isJson);
  const will = fields(after, isJson);
  for (const f of SIGNOFFS) {
    if (String(will[f] ?? "") !== String(was[f] ?? "")) {
      refuse(`Blocked: only a person signs. "${f}" in ${rel} is theirs to write. Draft everything else, then ask them to sign.`);
    }
  }
  if ((will.form ?? was.form) === "qa-review" && String(will.status ?? "") !== String(was.status ?? "")) {
    refuse(`Blocked: the status of ${rel} is QA's verdict. Only QA changes it.`);
  }

  for (const [what, pattern] of SECRETS) {
    const had = new Set(before.match(pattern) ?? []);
    if ((after.match(pattern) ?? []).some((m) => !had.has(m))) {
      refuse(`Blocked: this write adds what looks like ${what} to ${rel}. Secret values are never written into code, config or docs — reference the setting by name.`);
    }
  }
}

function post() {
  if (!/^ai-only\/.+\.md$/.test(rel) || !/^---\nspec:/.test(read(file) ?? "")) return;
  const lint = path.join(here, "..", "spec-lint.mjs");
  if (!existsSync(lint)) return;
  const r = spawnSync(process.execPath, [lint, root], { cwd: root, encoding: "utf8" });
  const found = (r.stdout ?? "").split("\n").filter((l) => l.includes("ERROR") && l.includes(rel));
  if (found.length > 0) {
    refuse(`spec-lint found problems in the spec you just wrote — fix them:\n${found.map((l) => l.trim()).join("\n")}`);
  }
}

if (phase === "pre") pre();
else if (phase === "post") post();
process.exit(0);
