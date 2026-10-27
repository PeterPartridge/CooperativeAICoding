// What a project receives from `coperativeai init`, derived from package.json.
//
// **One list, not two.** npm needs `files` to know what to publish, and init
// needs to know what to copy. They were two lists, kept in step by a test, so
// adding anything meant editing both (and three more places for a check). Now
// `files` is the list, and this reads it:
//
// - `template/<path>` lands at `<path>`: a project is the blank template's
//   contents, not a copy of this repository.
// - `template/<name>.template.md` lands at `<name>.md`. That is how the starter
//   AGENTS.md arrives, with the generated-file header that lets
//   /emit-guardrails replace it once there is a spec to generate from.
// - `.claude/…` and `tools/…` land where they are. That includes every check,
//   so a project can run them on its own briefs, specs, code map and record.
// - Anything else — the CLI, the docs, the licence — is published but not
//   copied: a project needs the framework, not its README.
// - A `*` in the last part of a path is expanded here, the way npm expands it.

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const COPIED = /^(template|\.claude|tools)\//;

export async function layout(framework) {
  const { files } = JSON.parse(await fs.readFile(path.join(framework, "package.json"), "utf8"));
  const out = [];
  for (const entry of files) {
    if (entry.startsWith("!") || !COPIED.test(entry)) continue;
    for (const from of await expand(framework, entry)) {
      const to = from
        .replace(/^template\/([^/]+)\.template\.md$/, "$1.md")
        .replace(/^template\//, "");
      out.push({ from, to });
    }
  }
  return out;
}

async function expand(framework, entry) {
  if (!entry.includes("*")) return [entry];
  const dir = path.posix.dirname(entry);
  const pattern = new RegExp(
    "^" + path.posix.basename(entry).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
  );
  const names = await fs.readdir(path.join(framework, dir));
  return names.filter((n) => pattern.test(n)).sort().map((n) => `${dir}/${n}`);
}

/** **Who owns a file, which decides what `update` may do with it.**
 *
 *  Taken from where the file comes from, so there is no second list to keep:
 *  everything under `.claude/`, `tools/`, `template/_forms/` and
 *  `template/ai-only/` is the framework's. Everything else from `template/` —
 *  the Project Brief, the starter AGENTS.md, QA's suite and sign-off — is a
 *  file people fill in, and once they have, it is theirs. */
export function ownerOf(from) {
  return /^template\//.test(from) && !/^template\/(_forms|ai-only)\//.test(from) ? "people" : "framework";
}

/** Every file a project receives, one entry per file, with its owner. */
export async function files(framework) {
  const out = [];
  const walk = async (from, to) => {
    const full = path.join(framework, from);
    if ((await fs.stat(full)).isFile()) return void out.push({ from, to, owner: ownerOf(from) });
    for (const e of (await fs.readdir(full)).sort()) await walk(`${from}/${e}`, `${to}/${e}`);
  };
  for (const { from, to } of await layout(framework)) await walk(from, to);
  return out;
}

/** A file's fingerprint, the same on every machine: line endings are
 *  normalised first, because a Windows checkout rewrites them and that is not
 *  an edit anybody made. */
export const fingerprint = (buf) =>
  createHash("sha256").update(buf.toString("utf8").replace(/\r\n/g, "\n")).digest("hex");
