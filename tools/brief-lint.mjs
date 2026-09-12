// Checks item briefs against the Project Brief they belong to.
//
// **One rule today, and it is the one with teeth.** An item names the
// `deliverable` it works towards, and `/build` stops when the last item naming
// a deliverable is built — that pause is the whole reason the field exists. A
// misspelled name breaks it silently and in the worst direction: the item looks
// aimed at something, and the deliverable it was supposed to complete never
// completes, because the last item was never counted. Nothing else in the
// framework would notice, so this does.
//
// **Quiet where there is nothing to check.** A blank brief, or a project whose
// brief names no deliverables yet, is not a fault — it is work not started. A
// tool that reports those as problems is a tool people stop running, so a
// project with no deliverables answered gets **one** line saying how many
// briefs went unchecked, not one line per brief.
//
// Usage:
//   node tools/brief-lint.mjs                 # every project in the repository
//   node tools/brief-lint.mjs <projectRoot…>  # just these
//
// Exit code 1 on an error. Warnings are printed and do not fail the run.

import { promises as fs } from "node:fs";
import path from "node:path";

const repo = path.resolve(
  path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")),
  "..",
);

const SKIP = new Set(["node_modules", "target", ".git", "dist", "claude-only", "_forms", ".github"]);

/** Reads a document with its line endings normalised.
 *
 *  **A CRLF checkout made this tool pass everything.** Half the rules here end
 *  a pattern with `$`, and in JavaScript `$` does not match before a carriage
 *  return and `.` does not cross one — so on a Windows checkout every bullet
 *  stopped matching, every front-matter comment stayed glued to its value, and
 *  the run came back green having read nothing. A check that cannot fail is
 *  worse than no check, so line endings are dealt with once, here, rather than
 *  in each pattern. */
async function read(file) {
  return (await fs.readFile(file, "utf8")).replace(/\r\n/g, "\n");
}

/** Front matter of a Markdown brief, as flat scalars.
 *
 *  The same deliberately small reader the site build uses: these files carry
 *  two or three plain fields and a YAML parser would be a dependency bought to
 *  read `status: filled`. Trailing `# …` comments are stripped, because the
 *  blank forms ship guidance in them. */
function frontMatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const fields = {};
  for (const line of text.slice(3, end).split("\n")) {
    const at = line.indexOf(":");
    if (at === -1) continue;
    const key = line.slice(0, at).trim();
    const value = line
      .slice(at + 1)
      .replace(/\s+#.*$/, "")
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) fields[key] = value;
  }
  return fields;
}

/** The deliverable names a Project Brief lists.
 *
 *  The form asks for `- Deliverable: MVP — done when: …`, but people write
 *  `- MVP — …` and `- MVP` too, and all three mean the same thing. So: take
 *  each bullet under the heading, drop a leading `Deliverable:` label, and keep
 *  what comes before the first dash or colon. Guidance lines (`>`) are not
 *  answers and never count as one. */
function deliverablesIn(brief) {
  const section = brief.match(/^###\s+deliverables\b[^\n]*\n([\s\S]*?)(?=^###\s|^##\s|^---\s*$)/m);
  if (!section) return [];
  const names = [];
  for (const line of section[1].split("\n")) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (!bullet || line.trimStart().startsWith(">")) continue;
    const name = bullet[1]
      .replace(/^\**Deliverable\**\s*:\s*/i, "")
      .split(/\s+[—–-]\s+|:/)[0]
      .replace(/\*\*/g, "")
      .trim();
    if (name && !/^e\.g\./i.test(name)) names.push(name);
  }
  return names;
}

/** Every folder holding a Project_brief.md. */
async function projectRoots(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  if (entries.some((e) => e.isFile() && e.name === "Project_brief.md")) out.push(dir);
  for (const e of entries) {
    if (!e.isDirectory() || SKIP.has(e.name)) continue;
    await projectRoots(path.join(dir, e.name), out);
  }
  return out;
}

/** The item briefs of a project: one per page, endpoint or model. */
async function itemBriefs(root) {
  const items = [];
  for (const solution of await fs.readdir(root, { withFileTypes: true })) {
    if (!solution.isDirectory() || SKIP.has(solution.name)) continue;
    const dir = path.join(root, solution.name);
    for (const file of await fs.readdir(dir)) {
      if (file === "application-spec.json") continue; // the solution, not an item
      const full = path.join(dir, file);
      if (file.endsWith(".md")) {
        const fields = frontMatter(await read(full));
        if (fields?.form === "page-brief") items.push({ file: full, fields });
      } else if (file.endsWith(".json")) {
        let parsed;
        try {
          parsed = JSON.parse(await read(full));
        } catch (e) {
          items.push({ file: full, broken: String(e.message) });
          continue;
        }
        if (parsed.form === "endpoint-brief" || parsed.form === "database-model") {
          items.push({ file: full, fields: parsed });
        }
      }
    }
  }
  return items;
}

async function lint(root) {
  const rel = (p) => path.relative(repo, p).split(path.sep).join("/") || ".";
  const errors = [];
  const warnings = [];
  const notes = [];

  const briefPath = path.join(root, "Project_brief.md");
  const brief = await read(briefPath);
  const items = await itemBriefs(root);

  // The blank starting copy claims nothing about anything, so it cannot be
  // wrong — and reporting it on every run would teach people to skim the output.
  if ((frontMatter(brief)?.status ?? "blank") === "blank") {
    return { rel: rel(root), items: items.length, named: [], errors, warnings, notes, blank: true };
  }

  const named = deliverablesIn(brief);

  // A brief nobody has filled in yet claims nothing, so it cannot be wrong.
  const live = items.filter((i) => i.broken || (i.fields.status ?? "blank") !== "blank");

  if (named.length === 0) {
    notes.push(
      `no deliverables answered in ${rel(briefPath)} — ${live.length} item brief(s) unchecked`,
    );
    return { rel: rel(root), items: items.length, named, errors, warnings, notes };
  }

  for (const item of live) {
    const at = rel(item.file);
    if (item.broken) {
      errors.push(`${at}  is not valid JSON: ${item.broken}`);
      continue;
    }
    const claimed = (item.fields.deliverable ?? "").trim();
    if (claimed === "") {
      warnings.push(
        `${at}  names no deliverable (status: ${item.fields.status}) — one of: ${named.join(", ")}`,
      );
      continue;
    }
    if (named.includes(claimed)) continue;

    // **The near-miss is worth its own sentence.** "mvp" and "MVP" differ only
    // by a shift key, and the fix is obvious once said out loud — whereas a
    // name nobody recognises usually means the brief has moved on and the item
    // has not.
    const near = named.find((n) => n.toLowerCase() === claimed.toLowerCase());
    errors.push(
      near
        ? `${at}  deliverable "${claimed}" is spelled "${near}" in ${rel(briefPath)} — they have to match exactly`
        : `${at}  deliverable "${claimed}" is not in ${rel(briefPath)} (it lists: ${named.join(", ")})`,
    );
  }

  return { rel: rel(root), items: items.length, named, errors, warnings, notes };
}

const named = process.argv.slice(2);
const roots = named.length > 0 ? named.map((p) => path.resolve(p)) : await projectRoots(repo);

if (roots.length === 0) {
  console.log("no folder with a Project_brief.md found — nothing to check");
  process.exit(0);
}

let failed = false;
for (const root of roots.sort()) {
  const { rel, items, named: deliverables, errors, warnings, notes, blank } = await lint(root);
  if (blank) {
    console.log("\n" + rel + " — not filled in yet, nothing to check");
    continue;
  }
  console.log(
    `\n${rel} — ${items} item brief(s), ${deliverables.length} deliverable(s)` +
      (deliverables.length ? `: ${deliverables.join(" → ")}` : ""),
  );
  for (const n of notes) console.log(`  note   ${n}`);
  for (const w of warnings) console.log(`  warn   ${w}`);
  for (const e of errors) console.log(`  ERROR  ${e}`);
  if (errors.length === 0 && warnings.length === 0 && notes.length === 0) console.log("  clean");
  else if (errors.length > 0) console.log(`  ${errors.length} error(s), ${warnings.length} warning(s)`);
  if (errors.length > 0) failed = true;
}

process.exit(failed ? 1 : 0);
