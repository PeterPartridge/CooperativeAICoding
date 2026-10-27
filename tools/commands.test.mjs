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
import { existsSync, promises as fs } from "node:fs";
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

// **A token budget for everything the AI reads to follow a procedure.** The
// Lean AI layer cut what a translate-and-build reads by roughly two fifths, and
// the way that is lost is the way it was gained: one helpful paragraph at a
// time. Each file has a ceiling, in estimated tokens (characters ÷ 4), set at
// its size when the budget landed. Lower a ceiling when a file shrinks. Never
// raise one to make room — move the *why* to procedures/README.md, which only
// people read, and keep the rule.
const TOKEN_BUDGET = {
  "template/AGENTS.template.md": 850,
  "template/ai-only/2-ai-system.template.md": 650,
  "template/ai-only/procedures/build.md": 675,
  "template/ai-only/procedures/draft.md": 750,
  "template/ai-only/procedures/emit-guardrails.md": 925,
  "template/ai-only/procedures/new-item.md": 450,
  "template/ai-only/procedures/pipeline.md": 500,
  "template/ai-only/procedures/translate.md": 600,
};

test("what the AI reads to follow a procedure stays within its token budget", async () => {
  const procedures = procedureFiles.map((f) => `template/ai-only/procedures/${f}`);
  const unbudgeted = procedures.filter((p) => !(p in TOKEN_BUDGET));
  assert.deepEqual(unbudgeted, [], "a procedure with no budget can grow without anyone noticing");

  const over = [];
  for (const [file, ceiling] of Object.entries(TOKEN_BUDGET)) {
    const tokens = Math.round((await read(file)).length / 4);
    if (tokens > ceiling) over.push(`${file}: ~${tokens} tokens, budget ${ceiling}`);
  }
  assert.deepEqual(over, [], "move the explanation to procedures/README.md rather than raising the budget");
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
    "tools/spec-lint.mjs",
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

// **The same breakage again, one layer further in.** The commands were fixed to
// point at procedures, but the procedures themselves still linked
// `../../../template/ai-only/…` and told the agent to copy
// `template/ai-only/3-code-map.template.md` — paths that exist in this
// repository and nowhere in a project. The pointer test above never reads a
// procedure, so it could not see them. This reads what a project actually
// receives, from where the project receives it.
test("every path the AI workspace names exists in a fresh project", async () => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "cai-init-"));
  execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), "init", target], { encoding: "utf8" });

  const docs = [];
  const walk = async (dir) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.endsWith(".md")) docs.push(full);
    }
  };
  await walk(path.join(target, "ai-only"));
  assert.ok(docs.length >= 8, `only ${docs.length} documents found — the walk stopped finding them`);

  const broken = [];
  for (const doc of docs) {
    const at = path.relative(target, doc).split(path.sep).join("/");
    const lines = (await fs.readFile(doc, "utf8")).replace(/\r\n/g, "\n").split("\n");
    lines.forEach((line, i) => {
      // A Markdown link must land inside the project and on something real.
      for (const [, href] of line.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        const resolved = path.resolve(path.dirname(doc), href.split("#")[0]);
        const inside = !path.relative(target, resolved).startsWith("..");
        if (!inside || !existsSync(resolved)) broken.push(`${at}:${i + 1} links ${href}`);
      }
      // A `template/<file>` path is this repository's layout. It may be named
      // only as such — "inside this repository" — never as where to look.
      for (const [, p] of line.matchAll(/`(template\/[^`\s]+)`/g)) {
        if (!/in(side)? (this|the framework's own) repository/.test(line)) broken.push(`${at}:${i + 1} names ${p} as if a project had it`);
      }
    });
  }
  assert.deepEqual(broken, [], "the AI workspace sends an agent to paths a project does not have");
});

test("a fresh project's own checks run in it", async () => {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "cai-init-"));
  execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), "init", target], { encoding: "utf8" });
  // The blank brief is not filled in, so this is the "nothing to check" path —
  // and it must exit zero, or every new project starts with a red check.
  const out = execFileSync("node", [path.join(target, "tools/brief-lint.mjs")], { encoding: "utf8" });
  assert.match(out, /not filled in yet/);
});

// ---------------------------------------------------------------------------
// The published package.
//
// **It carries what `init` copies, and nothing else.** `files` in package.json
// used to name the whole `.claude/` folder, so a publish from a working copy
// would have shipped that machine's `settings.local.json` — its local
// permissions — to everybody. The list is now exact, and this asks npm itself
// what it would publish rather than trusting the list to stay exact.

const LAYOUT_SOURCES = [...(await read("bin/coperativeai.mjs")).matchAll(/\{ from: "([^"]+)"/g)].map(
  (m) => m[1],
);
const ALSO_PUBLISHED = ["package.json", "README.md", "HOW-TO-USE.md", "INSTALL.md", "LICENSE"];

test("the published package is what init copies, plus the CLI and its docs", () => {
  const packed = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: repo,
      encoding: "utf8",
      shell: process.platform === "win32",
    }),
  )[0].files.map((f) => f.path.split(path.sep).join("/"));

  const allowed = (p) =>
    p.startsWith("bin/") ||
    ALSO_PUBLISHED.includes(p) ||
    LAYOUT_SOURCES.some((src) => p === src || p.startsWith(`${src}/`));
  assert.deepEqual(packed.filter((p) => !allowed(p)), [], "published but not needed by init");

  const missing = LAYOUT_SOURCES.filter((src) => !packed.some((p) => p === src || p.startsWith(`${src}/`)));
  assert.deepEqual(missing, [], "init copies these but the package would not contain them");
});
