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
import { createHash } from "node:crypto";
import { existsSync, readFileSync, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { layout } from "../bin/layout.mjs";

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
  "template/ai-only/procedures/product.md": 525,
  "template/ai-only/procedures/qa.md": 500,
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
  // **Every check, found the way check.mjs finds them** — by name, from this
  // repository's tools/ — rather than from a list here. round-record-lint was
  // once published and missing from the copy list, so projects got two of the
  // three checks; a check that ships but does not travel is that bug again.
  const checks = (await fs.readdir(path.join(repo, "tools"))).filter((f) => f.endsWith("-lint.mjs"));
  assert.ok(checks.length >= 4, `only ${checks.length} checks found`);
  for (const needed of [
    ...checks.map((c) => `tools/${c}`),
    "tools/check.mjs",
    "Project_brief.md",
    "_forms/page.md",
    "_forms/endpoint.json",
    "ai-only/1-translate-for-ai.md",
    // So an agent that is not Claude Code arrives to instructions addressed to
    // it, rather than to a .claude/ folder meant for somebody else.
    "AGENTS.md",
    "ai-only/procedures/build.md",
    "ai-only/procedures/translate.md",
    "ai-only/procedures/qa.md",
    "_forms/qa-review.md",
    "qa/regression.md",
    "qa/signoff.md",
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
  const out = execFileSync("node", [path.join(target, "tools/check.mjs")], { encoding: "utf8" });
  assert.match(out, /not filled in yet/);
  assert.match(out, /check\(s\) passed/);
});

// ---------------------------------------------------------------------------
// The published package.
//
// **It carries what `init` copies, and nothing else.** `files` in package.json
// used to name the whole `.claude/` folder, so a publish from a working copy
// would have shipped that machine's `settings.local.json` — its local
// permissions — to everybody. The list is now exact, and this asks npm itself
// what it would publish rather than trusting the list to stay exact.

const LAYOUT_SOURCES = (await layout(repo)).map((l) => l.from);
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

// ---------------------------------------------------------------------------
// coperativeai update: framework fixes reach projects that already ran init.
//
// **Its fault would be destroying somebody's work.** So every rule is tested
// from the side of the person who owns the file: an answered brief is never
// touched; an edited procedure is kept, with the new version beside it; only a
// framework file nobody changed since it was installed is replaced. And the
// quieter faults: a second run that changes something, a dry run that writes,
// a dropped file deleted rather than reported.

const fingerprint = (text) =>
  createHash("sha256").update(String(text).replace(/\r\n/g, "\n")).digest("hex");

function cli(...args) {
  try {
    return { code: 0, out: execFileSync("node", [path.join(repo, "bin/coperativeai.mjs"), ...args], { encoding: "utf8" }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
}

async function freshProject() {
  const target = await fs.mkdtemp(path.join(os.tmpdir(), "cai-update-"));
  cli("init", target);
  return target;
}

const inProject = (t, p) => path.join(t, p);
const readIn = (t, p) => fs.readFile(inProject(t, p), "utf8");
const manifestOf = async (t) => JSON.parse(await readIn(t, ".coperativeai.json"));

/** Makes a framework file look as if an older version had been installed. */
async function installedOld(t, p, text = "OLD VERSION\n") {
  await fs.writeFile(inProject(t, p), text);
  const m = await manifestOf(t);
  m.files[p] = fingerprint(text);
  await fs.writeFile(inProject(t, ".coperativeai.json"), JSON.stringify(m));
}

const BUILD = "ai-only/procedures/build.md";

test("init records a fingerprint of every file it wrote", async () => {
  const t = await freshProject();
  const m = await manifestOf(t);
  assert.ok(m.framework, "no framework version recorded");
  assert.equal(m.files[BUILD], fingerprint(await readIn(t, BUILD)));
  assert.ok(Object.keys(m.files).length >= 20, `only ${Object.keys(m.files).length} files recorded`);
});

test("update on a current project changes nothing", async () => {
  const t = await freshProject();
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.match(out, /0 updated/);
  assert.doesNotMatch(out, /\.update/);
});

test("update replaces a framework file nobody changed since it was installed", async () => {
  const t = await freshProject();
  await installedOld(t, BUILD);
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, BUILD), await read(`template/${BUILD}`));
  assert.match(out, /updated[\s\S]*procedures\/build\.md/);
  assert.equal((await manifestOf(t)).files[BUILD], fingerprint(await readIn(t, BUILD)));
});

test("update keeps an edited framework file and puts the new version beside it", async () => {
  const t = await freshProject();
  await installedOld(t, BUILD);
  await fs.writeFile(inProject(t, BUILD), "MY OWN EDITS\n");
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, BUILD), "MY OWN EDITS\n", "an edited file was overwritten");
  assert.equal(await readIn(t, `${BUILD}.update`), await read(`template/${BUILD}`));
  assert.match(out, /kept yours[\s\S]*procedures\/build\.md/);
});

test("update never touches a brief somebody has answered", async () => {
  const t = await freshProject();
  const answered = (await readIn(t, "Project_brief.md")).replace("status: blank", "status: filled");
  await fs.writeFile(inProject(t, "Project_brief.md"), answered);
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, "Project_brief.md"), answered);
  assert.equal(existsSync(inProject(t, "Project_brief.md.update")), false, "a people's file got a .update");
});

test("update adds framework files a project does not have yet", async () => {
  const t = await freshProject();
  await fs.rm(inProject(t, "qa/signoff.md"));
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.ok(existsSync(inProject(t, "qa/signoff.md")));
  assert.match(out, /added[\s\S]*qa\/signoff\.md/);
});

test("update handles a project from before the record existed, without losing anything", async () => {
  const t = await freshProject();
  await fs.rm(inProject(t, ".coperativeai.json"));
  await fs.writeFile(inProject(t, BUILD), "OLD VERSION\n");
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, BUILD), "OLD VERSION\n", "an unrecorded file was overwritten");
  assert.ok(existsSync(inProject(t, `${BUILD}.update`)));
  const m = await manifestOf(t);
  assert.ok(m.files["ai-only/procedures/translate.md"], "files that already match were not recorded");
  assert.equal(m.files[BUILD], undefined, "a kept file was recorded as if installed");
});

test("update --dry-run writes nothing", async () => {
  const t = await freshProject();
  await installedOld(t, BUILD);
  const before = await readIn(t, ".coperativeai.json");
  const { code, out } = cli("update", t, "--dry-run");
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, BUILD), "OLD VERSION\n");
  assert.equal(await readIn(t, ".coperativeai.json"), before);
  assert.match(out, /would update/);
});

test("update says how to bring specs in the old format up to date", async () => {
  const t = await freshProject();
  await fs.writeFile(inProject(t, "ai-only/Project_system.md"), "# AI System Spec\n\n## Project Digest\n- **Platform:** web\n");
  const { out } = cli("update", t);
  assert.match(out, /old format/);
  assert.match(out, /\/translate/);
});

test("update reports a file the framework dropped, and does not delete it", async () => {
  const t = await freshProject();
  await fs.writeFile(inProject(t, "tools/retired-lint.mjs"), "// retired\n");
  const m = await manifestOf(t);
  m.files["tools/retired-lint.mjs"] = fingerprint("// retired\n");
  await fs.writeFile(inProject(t, ".coperativeai.json"), JSON.stringify(m));
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.ok(existsSync(inProject(t, "tools/retired-lint.mjs")), "a file was deleted");
  assert.match(out, /no longer part of the framework.*retired-lint\.mjs/s);
});

// **A project from before the record still updates cleanly** when its files
// are versions the framework once shipped. bin/known-versions.json holds a
// fingerprint of every committed version of every file a project receives,
// so an old, untouched procedure is recognised rather than kept as "yours".
test("update recognises an old version the framework shipped, with no record", async () => {
  const t = await freshProject();
  await fs.rm(inProject(t, ".coperativeai.json"));
  const old = execFileSync("git", ["show", `444f2f5:template/${BUILD}`], { cwd: repo, encoding: "utf8" });
  await fs.writeFile(inProject(t, BUILD), old);
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, BUILD), await read(`template/${BUILD}`), "a shipped old version was not updated");
  assert.equal(existsSync(inProject(t, `${BUILD}.update`)), false);
});

test("bin/known-versions.json is what tools/known-versions.mjs produces", () => {
  const generated = execFileSync("node", [path.join(repo, "tools/known-versions.mjs"), "--print"], { cwd: repo, encoding: "utf8" });
  const committed = readFileSync(path.join(repo, "bin/known-versions.json"), "utf8");
  const parse = (s) => JSON.parse(s);
  // Every version committed today must be in the shipped list. Newer versions
  // need not be: projects installed from now on carry their own record.
  const want = parse(committed);
  for (const [file, prints] of Object.entries(parse(generated))) {
    if (!want[file]) continue;
    for (const p of want[file]) assert.ok(prints.includes(p), `${file}: a shipped fingerprint is not in its history`);
  }
  assert.ok(Object.keys(want).length >= 20, "the known versions list is nearly empty");
});

test("update replaces the starter AGENTS.md, whose header says it may", async () => {
  const t = await freshProject();
  await installedOld(t, "AGENTS.md", "<!-- Generated by CooperativeAICoding from template/AGENTS.template.md. -->\n# old starter\n");
  await fs.rm(inProject(t, ".coperativeai.json"));
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, "AGENTS.md"), await read("template/AGENTS.template.md"));
});

test("update leaves an AGENTS.md written from the project's own spec", async () => {
  const t = await freshProject();
  const emitted = "<!-- Generated by CooperativeAICoding from ai-only/Project_digest.md. -->\n# this project's rules\n";
  await fs.writeFile(inProject(t, "AGENTS.md"), emitted);
  const { code, out } = cli("update", t);
  assert.equal(code, 0, out);
  assert.equal(await readIn(t, "AGENTS.md"), emitted);
  assert.match(out, /\/emit-guardrails/);
});
