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

test("every skill a command asks for exists", async () => {
  for (const file of commandFiles) {
    const body = await read(`.claude/commands/${file}`);
    const invoked = body.matchAll(/(?:[Rr]un|[Ff]ollow|[Uu]se) the \x60([a-z][a-z0-9-]+)\x60 skill|\(the \x60([a-z][a-z0-9-]+)\x60 skill\)/g);
    for (const m of invoked) {
      const skill = m[1] ?? m[2];
      assert.ok(
        skillDirs.includes(skill),
        `/${file.replace(/\.md$/, "")} calls the "${skill}" skill, which does not exist`,
      );
    }
  }
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
  for (const needed of ["Project_brief.md", "_forms/page.md", "_forms/endpoint.json", "claude-only/1-translate-to-claude.md", "tools/brief-lint.mjs"]) {
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

test("a fresh project's own checks run in it", async () => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "cai-init-"));
  execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), "init", target], { encoding: "utf8" });
  // The blank brief is not filled in, so this is the "nothing to check" path —
  // and it must exit zero, or every new project starts with a red check.
  const out = execFileSync("node", [path.join(target, "tools/brief-lint.mjs")], { encoding: "utf8" });
  assert.match(out, /not filled in yet/);
});
