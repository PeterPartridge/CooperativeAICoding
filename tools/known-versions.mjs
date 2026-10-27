// Writes bin/known-versions.json: a fingerprint of every committed version of
// every file a project receives.
//
// **Why it exists.** `coperativeai update` replaces a framework file only when
// it can tell nobody edited it. Projects made from now on carry their own
// record of what was installed; projects made before the record existed carry
// nothing, so without this every changed procedure in them would be kept as
// "yours", with a `.update` beside it to sort out by hand. A file matching a
// version the framework once shipped was not edited, and can be replaced.
//
// **Run it when you publish**, so the list covers every version up to then.
// It only needs past versions: the current one is compared directly.
//
//   node tools/known-versions.mjs           # write bin/known-versions.json
//   node tools/known-versions.mjs --print   # print it instead

import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { files, fingerprint } from "../bin/layout.mjs";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (args, input) =>
  execFileSync("git", args, { cwd: repo, input, maxBuffer: 256 * 1024 * 1024 });

const known = {};
for (const { from, to } of await files(repo)) {
  // Every blob this path has ever held, from the raw log — one git call per
  // file, then one batch read for all of them.
  const raw = git(["log", "--format=", "--raw", "--no-abbrev", "--", from]).toString();
  const blobs = [...new Set([...raw.matchAll(/^:\d+ \d+ [0-9a-f]+ ([0-9a-f]+) /gm)].map((m) => m[1]))].filter(
    (b) => !/^0+$/.test(b),
  );
  if (blobs.length === 0) continue;
  const out = git(["cat-file", "--batch"], blobs.join("\n") + "\n");
  const prints = new Set();
  let at = 0;
  while (at < out.length) {
    const nl = out.indexOf(10, at);
    const [, , size] = out.subarray(at, nl).toString().split(" ");
    const start = nl + 1;
    prints.add(fingerprint(out.subarray(start, start + Number(size))));
    at = start + Number(size) + 1;
  }
  known[to] = [...prints].sort();
}

const text = JSON.stringify(Object.fromEntries(Object.entries(known).sort()), null, 1) + "\n";
if (process.argv.includes("--print")) process.stdout.write(text);
else {
  await fs.writeFile(path.join(repo, "bin/known-versions.json"), text);
  console.log(`bin/known-versions.json: ${Object.keys(known).length} files`);
}
