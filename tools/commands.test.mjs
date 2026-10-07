// Does every command still point at something that exists?
//
// **What this can and cannot prove.** A slash command is a prompt, so no test
// here proves it behaves well — that needs a real agent and real money, and
// `tools/QA.md` says how to do it by hand. What it proves is that the wiring is
// intact: the command exists, the skill it calls exists, every path it names is
// really there, and the documentation lists the same set of commands the
// repository actually ships.
//
// **Which is the failure that has actually happened.** The commands named
// `template/_forms/` by hard path, and that folder does not exist in a project
// created by `coperativeai init` — so every one of them was broken for exactly
// the people the CLI was written for, and nothing said so. This is the test for
// that class.
//
//   node --test tools/commands.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (p) => (await fs.readFile(path.join(repo, p), "utf8")).replace(/\r\n/g, "\n");
const exists = async (p) => {
  try {
    await fs.access(path.join(repo, p));
    return true;
  } catch {
    return false;
  }
};

const commandFiles = (await fs.readdir(path.join(repo, ".claude/commands"))).filter((f) => f.endsWith(".md"));
const skillDirs = (await fs.readdir(path.join(repo, ".claude/skills"), { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

test("there are commands and skills to check", () => {
  assert.ok(commandFiles.length >= 5, `found only ${commandFiles.length} commands`);
  assert.ok(skillDirs.length >= 3, `found only ${skillDirs.length} skills`);
});

for (const file of commandFiles) {
  test(`/${file.replace(/\.md$/, "")} is a usable command`, async () => {
    const body = await read(`.claude/commands/${file}`);
    assert.match(body, /^---\n[\s\S]*?\n---\n/, "no front matter");
    assert.match(body, /\ndescription: \S/, "no description — the command list would show it blank");
  });
}

for (const dir of skillDirs) {
  test(`the ${dir} skill declares itself correctly`, async () => {
    assert.ok(await exists(`.claude/skills/${dir}/SKILL.md`), "no SKILL.md");
    const body = await read(`.claude/skills/${dir}/SKILL.md`);
    const name = body.match(/\nname: (\S+)/);
    assert.ok(name, "no name in front matter");
    assert.equal(name[1], dir, "the skill's name must match its folder, or it cannot be invoked");
    assert.match(body, /\ndescription: \S/, "no description — nothing would ever trigger it");
  });
}

// Commands used to say "run the `x` skill" and this test checked that skill
// existed. They now point at a procedure instead, so that version of the test
// matched nothing and passed on an empty set — coverage in name only. It checks
// the new wiring instead, and specifically the **unrooted** `ai-only/…` form,
// which is the path a project uses and which the rooted-path test below skips
// by design.
test("every procedure a command or skill asks for exists", async () => {
  const sources = [
    ...commandFiles.map((f) => `.claude/commands/${f}`),
    ...skillDirs.map((d) => `.claude/skills/${d}/SKILL.md`),
  ];
  let checked = 0;
  for (const source of sources) {
    const body = await read(source);
    for (const [, name] of body.matchAll(/ai-only\/procedures\/([a-z-]+\.md)/g)) {
      checked++;
      assert.ok(
        await exists(`template/ai-only/procedures/${name}`),
        `${source} points at procedures/${name}, which does not exist`,
      );
    }
  }
  assert.ok(checked >= commandFiles.length, `only ${checked} pointers found — commands stopped naming procedures`);
});

// **The one that would have caught the `template/_forms/` breakage.** Only
// paths rooted at a real top-level folder are checked; `<projectRoot>/…` and
// `<forms>/…` are deliberately relative to whatever project is being worked
// on, and `.github/` is left out because it holds CI config and the files this
// framework *writes* for other agents — an output is not a broken reference.
const ROOTED = /^(template|tools|bin|site|application|example|\.claude)\//;

test("every repository path the commands and skills name is really there", async () => {
  const sources = [
    ...commandFiles.map((f) => `.claude/commands/${f}`),
    ...skillDirs.map((d) => `.claude/skills/${d}/SKILL.md`),
  ];
  const missing = [];
  for (const source of sources) {
    const body = await read(source);
    for (const [, cited] of body.matchAll(/`([^`\s]+\/[^`\s]*)`/g)) {
      const clean = cited.replace(/[.,;:)]+$/, "");
      if (!ROOTED.test(clean) || clean.includes("*") || clean.includes("<")) continue;
      if (!(await exists(clean))) missing.push(`${source} → ${clean}`);
    }
  }
  assert.deepEqual(missing, [], "paths named but not present");
});

// ---------------------------------------------------------------------------
// The procedures, and the rule that keeps them the single copy.
//
// Each procedure used to be the body of a skill or a command. The text was
// never Claude-specific; its location was. Now it lives once under
// template/ai-only/procedures/ and every tool holds a pointer. These two tests
// are what stops that arrangement decaying back into copies: one catches a
// procedure nothing can invoke, the other catches a pointer that has started
// carrying behaviour of its own.

const procedureFiles = (await fs.readdir(path.join(repo, "template/ai-only/procedures")))
  .filter((f) => f.endsWith(".md") && f !== "README.md");

test("every procedure is reachable from a command or a skill", async () => {
  const pointers = [
    ...commandFiles.map((f) => `.claude/commands/${f}`),
    ...skillDirs.map((d) => `.claude/skills/${d}/SKILL.md`),
  ];
  const allText = (await Promise.all(pointers.map(read))).join("\n");
  const orphans = procedureFiles.filter((f) => !allText.includes(`procedures/${f}`));
  assert.deepEqual(orphans, [], "procedures nothing points at — unreachable from any tool");
});

// A size ceiling, because the failure is gradual. Nobody moves a procedure back
// into a skill in one commit; a sentence of behaviour gets added here because it
// was quicker, and six months later the skill and the procedure disagree and
// only Claude Code follows the newer one. The pointers are ~0.6–1.2 KB, so 2 KB
// admits a longer description without admitting a procedure.
const POINTER_MAX = 2048;

test("a skill or command stays a pointer, not a second copy of its procedure", async () => {
  const fat = [];
  for (const source of [
    ...commandFiles.map((f) => `.claude/commands/${f}`),
    ...skillDirs.map((d) => `.claude/skills/${d}/SKILL.md`),
  ]) {
    const body = await read(source);
    if (!/procedures\/[a-z-]+\.md/.test(body)) continue;
    if (body.length > POINTER_MAX) fat.push(`${source} (${body.length} B)`);
  }
  assert.deepEqual(fat, [], `a pointer grew past ${POINTER_MAX} B — move the behaviour into the procedure`);
});

test("the documentation lists exactly the commands that ship", async () => {
  const howTo = await read("HOW-TO-USE.md");
  const shipped = commandFiles.map((f) => f.replace(/\.md$/, "")).sort();
  const documented = [...howTo.matchAll(/^\| `\/([a-z-]+)/gm)].map((m) => m[1]).sort();
  assert.deepEqual(documented, shipped, "HOW-TO-USE's command table and .claude/commands/ disagree");
});

// **The only command that is a program, so the only one testable end to end.**
test("coperativeai init puts every command and skill into a new project", async () => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "cai-init-"));
  const out = execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), "init", target], { encoding: "utf8" });
  assert.match(out, /wrote \d+ file\(s\)/);

  for (const file of commandFiles) {
    assert.ok(
      await fs.stat(path.join(target, ".claude/commands", file)).then(() => true, () => false),
      `${file} did not travel into the new project`,
    );
  }
  for (const dir of skillDirs) {
    assert.ok(
      await fs.stat(path.join(target, ".claude/skills", dir, "SKILL.md")).then(() => true, () => false),
      `the ${dir} skill did not travel`,
    );
  }
  // Every check, named one by one rather than as "tools/". round-record-lint
  // was in the published package and missing from the copy list, so projects
  // got two of the three — and the one they lost is the one that exists
  // because agents quietly skip writing the record.
  for (const needed of [
    "Project_brief.md",
    "_forms/page.md",
    "_forms/endpoint.json",
    "ai-only/1-translate-for-ai.md",
    "tools/brief-lint.mjs",
    "tools/code-map-lint.mjs",
    "tools/round-record-lint.mjs",
    // So an agent that is not Claude Code arrives to instructions addressed to
    // it, rather than to a .claude/ folder meant for somebody else.
    "AGENTS.md",
    "ai-only/procedures/build.md",
    "ai-only/procedures/translate.md",
  ]) {
    assert.ok(
      await fs.stat(path.join(target, needed)).then(() => true, () => false),
      `${needed} is missing from a fresh project`,
    );
  }

  // Run again: it must write nothing and say what it left alone, because
  // people re-run it to pick up forms added since.
  const second = execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), "init", target], { encoding: "utf8" });
  assert.match(second, /wrote 0 file\(s\)/, "a second init overwrote something");
  assert.match(second, /left alone, already there/);
});

// **The same breakage as `template/_forms/`, one layer out.** The starter
// AGENTS.md names paths by hard string, and it is the first and possibly only
// file a non-Claude agent reads. A path that is right in this repository and
// absent from a project would send that agent looking in the wrong place with
// nothing to tell it so.
test("every path the starter AGENTS.md names exists in a fresh project", async () => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "cai-init-"));
  execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), "init", target], { encoding: "utf8" });
  const agents = await fs.readFile(path.join(target, "AGENTS.md"), "utf8");

  const cited = new Set();
  for (const line of agents.split("\n")) {
    // A line that says so is describing an output, not somewhere to look today.
    // The document has to admit that for the reader's sake, and the check reads
    // the same admission rather than carrying its own list of exceptions.
    if (/does not exist yet/i.test(line)) continue;
    for (const [, p] of line.matchAll(/`([^`\s|]+\/[^`\s|]*)`/g)) {
      const clean = p.replace(/[.,;:)]+$/, "");
      // `<solution>/<item>.md` and the like are per-project by design.
      if (clean.includes("<") || clean.includes("*") || clean.endsWith("/")) continue;
      cited.add(clean);
    }
  }
  assert.ok(cited.size >= 6, `only ${cited.size} paths found — the regex stopped matching`);

  const missing = [];
  for (const p of cited) {
    if (!(await fs.stat(path.join(target, p)).then(() => true, () => false))) missing.push(p);
  }
  assert.deepEqual(missing, [], "AGENTS.md names paths a fresh project does not have");
});

test("a fresh project's own checks run in it", async () => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "cai-init-"));
  execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), "init", target], { encoding: "utf8" });
  // The blank brief is not filled in, so this is the "nothing to check" path —
  // and it must exit zero, or every new project starts with a red check.
  const out = execFileSync("node", [path.join(target, "tools/brief-lint.mjs")], { encoding: "utf8" });
  assert.match(out, /not filled in yet/);
});
