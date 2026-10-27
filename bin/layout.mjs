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
