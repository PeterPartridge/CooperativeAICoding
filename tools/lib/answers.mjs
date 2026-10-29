// Reading people's answers out of briefs — now, and as they were in git.
//
// **Shared by the checks, so there is one reading of a brief.** spec-lint asks
// "did the answer this line cites change since the spec was written?";
// brief-lint asks "did roles, testing or security change since this item was
// signed?". Both are the same question about an answer at two points in time,
// and two readings of a brief would disagree about what an answer is.

import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

/** git, quietly: its output, or null when there is no repository or no answer. */
export const git = (cwd, args) => {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return null;
  }
};

/** The answer under `### id —` in a Markdown brief, without its guidance. */
export function markdownAnswer(text, id) {
  const lines = text.split("\n");
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = lines.findIndex((l) => new RegExp(`^###\\s+${escaped}\\b`).test(l));
  if (start === -1) return null;
  const out = [];
  for (const l of lines.slice(start + 1)) {
    if (/^#{1,3}\s|^---\s*$/.test(l)) break;
    if (l.trim() !== "" && !l.trimStart().startsWith(">")) out.push(l);
  }
  return out.join("\n");
}

/** An answer as plain text — a Markdown question's, or a JSON path's — so a
 *  change in spacing or line endings is not a change. */
export function answerIn(text, rel, id) {
  if (text === null || text === undefined) return null;
  text = text.replace(/\r\n/g, "\n");
  if (rel.endsWith(".json")) {
    let v;
    try {
      v = JSON.parse(text);
    } catch {
      return null;
    }
    for (const part of id.split(".")) v = v && typeof v === "object" ? v[part] : undefined;
    return v === undefined ? null : JSON.stringify(v);
  }
  const a = markdownAnswer(text, id);
  return a === null ? null : a.replace(/\s+/g, " ").trim();
}

/** A file of the project as it was at a commit, or null. */
export function fileAt(root, commit, rel) {
  const top = git(root, ["rev-parse", "--show-toplevel"])?.trim();
  if (!top || !commit) return null;
  const p = path.relative(top, path.join(root, rel)).split(path.sep).join("/");
  return git(root, ["show", `${commit}:${p}`]);
}

/** The last commit at or before the end of a day (YYYY-MM-DD), or null. */
export function commitBy(root, day) {
  return git(root, ["log", "-1", `--before=${day} 23:59:59`, "--format=%H"])?.trim() || null;
}

/** Does an answer read differently now from how it read at a commit? null
 *  when it cannot tell (no git, or no such commit). */
export async function changedSince(root, commit, rel, id) {
  if (!commit) return null;
  const now = await fs.readFile(path.join(root, rel), "utf8").catch(() => null);
  return answerIn(fileAt(root, commit, rel), rel, id) !== answerIn(now, rel, id);
}
