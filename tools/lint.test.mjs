// Tests for the two checks everything else now leans on.
//
// **Written because both of them silently passed once.** `brief-lint` read a
// CRLF checkout as having no content at all and exited zero; then it read a
// brief whose deliverables were its last section as having none, and exited
// zero again. Both were found by accident — the first by a branch switch, the
// second by a throwaway fixture. A check that cannot fail is worse than no
// check, because it is trusted.
//
// So every case below is a fault that must be *caught*, plus the two shapes
// that must not be reported at all. Line endings are a parameter, not an
// assumption: every fixture runs twice, LF and CRLF.
//
//   node --test tools/
//
// No dependencies: node:test and node:assert are in the runtime.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const CRLF = String.fromCharCode(13, 10);

/** A throwaway project on disk. `eol` rewrites every file it writes, which is
 *  how the same fixture proves both line endings. */
async function project(files, eol = "\n") {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "brieflint-"));
  for (const [rel, body] of Object.entries(files)) {
    const full = path.join(root, rel);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, body.split("\n").join(eol), "utf8");
  }
  return root;
}

/** Runs a check and hands back what a person would see. */
function run(script, args) {
  try {
    return { code: 0, out: execFileSync("node", [path.join(tools, script), ...args], { encoding: "utf8" }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
}

const brief = (status, deliverables, trailing = "") =>
  `---\nform: project-brief\nproject: "Shop"\nstatus: ${status}\n---\n\n` +
  `### deliverables — What are we working towards?\n${deliverables}\n${trailing}`;

const item = (status, deliverable) =>
  `---\nform: page-brief\npage: cart\nsolution: Shop\ndeliverable: ${deliverable}\nstatus: ${status}\n---\n\n# Page Brief — cart\n`;

const THREE = "- Deliverable: MVP — done when: a customer can buy one thing.\n- Deliverable: Checkout — done when: they can pay.";

for (const [name, eol] of [["LF", "\n"], ["CRLF", CRLF]]) {
  test(`brief-lint reads the deliverables (${name})`, async () => {
    const root = await project({ "Project_brief.md": brief("filled", THREE), "Shop/cart.md": item("filled", "MVP") }, eol);
    const { code, out } = run("brief-lint.mjs", [root]);
    assert.equal(code, 0, out);
    assert.match(out, /2 deliverable\(s\): MVP → Checkout/, "the deliverables were not read");
    assert.match(out, /clean/);
  });

  test(`brief-lint catches a deliverable the brief does not list (${name})`, async () => {
    const root = await project({ "Project_brief.md": brief("filled", THREE), "Shop/cart.md": item("filled", "Payments") }, eol);
    const { code, out } = run("brief-lint.mjs", [root]);
    assert.equal(code, 1, "an unknown deliverable must fail the run");
    assert.match(out, /"Payments" is not in/);
  });

  test(`brief-lint catches a near miss and says the spelling (${name})`, async () => {
    const root = await project({ "Project_brief.md": brief("filled", THREE), "Shop/cart.md": item("filled", "mvp") }, eol);
    const { code, out } = run("brief-lint.mjs", [root]);
    assert.equal(code, 1);
    assert.match(out, /"mvp" is spelled "MVP"/);
  });
}

// **The bug this one exists for.** A deliverables section with no heading after
// it read as empty, so every item went unchecked and the run was green.
test("brief-lint reads deliverables that are the last section in the file", async () => {
  const root = await project({ "Project_brief.md": brief("filled", THREE), "Shop/cart.md": item("filled", "Nope") });
  const { code, out } = run("brief-lint.mjs", [root]);
  assert.equal(code, 1, "the check was skipped: " + out);
  assert.match(out, /"Nope" is not in/);
});

test("brief-lint says nothing about a project nobody has filled in", async () => {
  const root = await project({ "Project_brief.md": brief("blank", ""), "Shop/cart.md": item("blank", "") });
  const { code, out } = run("brief-lint.mjs", [root]);
  assert.equal(code, 0);
  assert.match(out, /not filled in yet/);
});

test("brief-lint treats a drafted brief as nobody's answers", async () => {
  const root = await project({ "Project_brief.md": brief("drafted", THREE), "Shop/cart.md": item("drafted", "MVP") });
  const { code, out } = run("brief-lint.mjs", [root]);
  assert.equal(code, 0, "a draft is a proposal, not a fault");
  assert.match(out, /drafted from the code, not yet accepted/);
});

test("brief-lint warns about a drafted item inside an accepted project", async () => {
  const root = await project({ "Project_brief.md": brief("filled", THREE), "Shop/cart.md": item("drafted", "MVP") });
  const { code, out } = run("brief-lint.mjs", [root]);
  assert.equal(code, 0);
  assert.match(out, /drafted from the code and not accepted/);
});

// ── the code map ───────────────────────────────────────────────────────────

const codeMap = (row) =>
  `# Code Map — Test\n\n## Solution — Shop\n\n**Repo:** this repo · **Local path:** \`code\`\n\n` +
  `| Method | File | What it does (one line) | Uses (files → methods) |\n|---|---|---|---|\n${row}\n`;

for (const [name, eol] of [["LF", "\n"], ["CRLF", CRLF]]) {
  test(`code-map-lint passes a row that is true (${name})`, async () => {
    const root = await project(
      {
        "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
        "code/src/cart.js": "export function addItem() {}\n",
      },
      eol,
    );
    const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
    assert.equal(code, 0, out);
    assert.match(out, /clean/);
  });

  test(`code-map-lint catches a file that has moved (${name})`, async () => {
    const root = await project(
      {
        "ai-only/Code_map.md": codeMap("| `addItem` | src/gone.js | Adds one item to the basket | nothing |"),
        "code/src/cart.js": "export function addItem() {}\n",
      },
      eol,
    );
    const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
    assert.equal(code, 1);
    assert.match(out, /file not found: src\/gone\.js/);
  });

  test(`code-map-lint catches a method that no longer exists (${name})`, async () => {
    const root = await project(
      {
        "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
        "code/src/cart.js": "export function removeItem() {}\n",
      },
      eol,
    );
    const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
    assert.equal(code, 1);
    assert.match(out, /"addItem" is not in/);
  });
}

test("code-map-lint catches a summary that has grown past one line", async () => {
  const sprawl = "Adds one item to the basket, and " + "then does something else that matters ".repeat(6);
  const root = await project({
    "ai-only/Code_map.md": codeMap(`| \`addItem\` | src/cart.js | ${sprawl} | nothing |`),
    "code/src/cart.js": "export function addItem() {}\n",
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.equal(code, 1);
  assert.match(out, /first sentence is \d+ chars/);
});

// The other direction. Every test above reads a row and asks whether the code
// is real; these ask whether real code has a row. That gap is why a map
// describing a quarter of its codebase reported `clean`.

const TAURI_CMD = "#[tauri::command]\npub async fn list_orders() -> Vec<String> { vec![] }\n";

test("code-map-lint reports a command that no row mentions", async () => {
  const root = await project({
    "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
    "code/src-tauri/src/commands/orders.rs": TAURI_CMD,
  });
  const { out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.match(out, /1 surface\(s\) have no explanation anywhere/);
  assert.match(out, /1 Tauri command\(s\), e\.g\. list_orders/);
});

test("code-map-lint counts a command named anywhere in the map as covered", async () => {
  const root = await project({
    "ai-only/Code_map.md": codeMap(
      "| `list_orders` | src-tauri/src/commands/orders.rs | Lists the orders | nothing |",
    ),
    "code/src-tauri/src/commands/orders.rs": TAURI_CMD,
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /clean/);
});

test("code-map-lint reports a table that no row mentions", async () => {
  const root = await project({
    "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
    "code/src-tauri/src/db/order.rs": 'conn.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER)", ())',
  });
  const { out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.match(out, /1 database table\(s\), e\.g\. orders/);
});

// The guarantee that lets this rule ship to projects that are not this one: a
// codebase with none of these surfaces is neither helped nor punished by the
// rule existing. Without this, adding a surface would quietly start failing
// every Go and Python project that installed the framework.
test("code-map-lint leaves a project with no such surfaces alone", async () => {
  const root = await project({
    "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /clean/);
  assert.doesNotMatch(out, /surface/);
});

// Two numbers, because they are two different debts. A surface explained in a
// doc comment is **unindexed**: the reasoning exists where whoever changes the
// code is already looking, and copying it into the map would make the map a
// third copy of prose that already lives in two places. A surface explained
// nowhere is **undocumented**, and that is the one somebody has to sit down and
// write. Measured on this repository the day this landed: 227 surfaces with no
// row, of which 160 were already explained in the code. One number blurred
// 160 transcriptions into 67 pieces of real work.

const DOCUMENTED_CMD =
  "/// Lists every order placed today, newest first.\n" +
  "///\n" +
  "/// Ordered newest-first because the only caller is the fulfilment screen,\n" +
  "/// which reads the top of the list and never pages. Sorting in SQL rather\n" +
  "/// than in the component keeps the ordering true for any future caller.\n" +
  TAURI_CMD;

test("code-map-lint counts a documented surface as unindexed, not undocumented", async () => {
  const root = await project({
    "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
    "code/src-tauri/src/commands/orders.rs": DOCUMENTED_CMD,
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /1 surface\(s\) explained in the code but not indexed/);
  assert.doesNotMatch(out, /no explanation anywhere/);
});

// A passing remark is not an explanation. Without a floor, `// TODO` would
// discharge the rule and the count would fall to zero without a word being
// written. 80 characters is well under the 236-character median of the doc
// comments already in this repository, so it admits every real one.
test("code-map-lint does not accept a one-line aside as an explanation", async () => {
  const root = await project({
    "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
    "code/src-tauri/src/commands/orders.rs": "// TODO: tidy this up\n" + TAURI_CMD,
  });
  const { out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.match(out, /1 surface\(s\) have no explanation anywhere/);
});

// Every language this can ship to, not just the one this repository is in. A
// framework that only recognised `///` would report a Python or TypeScript
// project as entirely undocumented on the day it installed.
for (const [lang, comment] of [
  ["TypeScript", "/**\n * Lists every order placed today, newest first, because the only\n * caller reads the top of the list and never pages through it.\n */\n"],
  ["Python", "# Lists every order placed today, newest first, because the only\n# caller reads the top of the list and never pages through it.\n"],
]) {
  test(`code-map-lint reads a ${lang} doc comment as an explanation`, async () => {
    const root = await project({
      "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
      "code/src/cart.js": "export function addItem() {}\n",
      "code/src-tauri/src/commands/orders.rs": comment + TAURI_CMD,
    });
    const { out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
    assert.match(out, /explained in the code but not indexed/);
    assert.doesNotMatch(out, /no explanation anywhere/);
  });
}

// A table's subject is its module, so the explanation that counts for it is the
// file's own header — not a comment above the `CREATE TABLE` line, which sits
// inside a `create_table` function several lines down.
test("code-map-lint reads a module header as a table's explanation", async () => {
  const root = await project({
    "ai-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
    "code/src-tauri/src/db/order.rs":
      "//! The orders table: one row per placed order, keyed by the id the\n" +
      "//! payment provider returns rather than one of ours, so a retry cannot\n" +
      "//! create a second order for the same payment.\n\n" +
      'pub async fn create_table(conn: &Connection) {\n  conn.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER)", ()).await;\n}\n',
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "ai-only/Code_map.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /explained in the code but not indexed/);
  assert.doesNotMatch(out, /no explanation anywhere/);
});

// ---------------------------------------------------------------------------
// round-record-lint: the check that reads what an agent wrote *after* the work.
//
// **Its faults are absences**, which is the hardest thing for a check to get
// right — an empty heading and a missing one both look like a quiet pass to a
// regex that only searches. So every case here is a record with something
// genuinely missing, plus the shapes that must not be reported.

const record = (did, could, debt) =>
  `### What I did\n${did}\n\n### What I could not do  (and what you would need to tell me)\n${could}\n\n` +
  `### Debt I left behind  (one paragraph each)\n${debt}\n`;

const FULL = record(
  "- Added the cart totals.",
  "- Could not reach the tax service; its key is not in the store yet.",
  "- Totals round in two places. One of them should go.",
);

for (const [name, eol] of [["LF", "\n"], ["CRLF", CRLF]]) {
  test(`round-record-lint passes a record that answers all three (${name})`, async () => {
    const root = await project({ "ROUND-RECORD.md": FULL }, eol);
    const { code, out } = run("round-record-lint.mjs", [path.join(root, "ROUND-RECORD.md")]);
    assert.equal(code, 0, out);
    assert.match(out, /all three answered/);
  });

  test(`round-record-lint catches a missing heading (${name})`, async () => {
    const short = "### What I did\n- Added the cart totals.\n\n### Debt I left behind\n- None worth the name.\n";
    const root = await project({ "ROUND-RECORD.md": short }, eol);
    const { code, out } = run("round-record-lint.mjs", [path.join(root, "ROUND-RECORD.md")]);
    assert.equal(code, 1);
    assert.match(out, /no "### What I could not do" heading/);
  });

  test(`round-record-lint catches a heading with nothing under it (${name})`, async () => {
    const root = await project({ "ROUND-RECORD.md": record("- Added the cart totals.", "", "- Rounding.") }, eol);
    const { code, out } = run("round-record-lint.mjs", [path.join(root, "ROUND-RECORD.md")]);
    assert.equal(code, 1);
    assert.match(out, /has nothing under it/);
  });
}

test("round-record-lint warns, but does not fail, on a shrug", async () => {
  const root = await project({ "ROUND-RECORD.md": record("- Added the cart totals.", "- Nothing.", "None") });
  const { code, out } = run("round-record-lint.mjs", [path.join(root, "ROUND-RECORD.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /warn .*says only "None"/);
});

test("round-record-lint warns about a heading the app would file under \"also said\"", async () => {
  const root = await project({ "ROUND-RECORD.md": FULL + "\n### What I think you should do next\n- Ship it.\n" });
  const { code, out } = run("round-record-lint.mjs", [path.join(root, "ROUND-RECORD.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /also said/);
});

test("round-record-lint says so, and passes, when nothing has been written yet", async () => {
  const root = await project({ "README.md": "# Shop\n" });
  const { code, out } = run("round-record-lint.mjs", [root]);
  assert.equal(code, 0, out);
  assert.match(out, /nothing written down yet/);
});

/** A repository with one commit, so --since has a base to diff against. */
async function committed(files) {
  const root = await project(files);
  const git = (...args) =>
    execFileSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  return { root, git, base: git("rev-parse", "HEAD").trim() };
}

test("round-record-lint catches solution code that changed without a record", async () => {
  const { root, git, base } = await committed({ "app/Shop/src/cart.rs": "fn total() {}\n" });
  await fs.writeFile(path.join(root, "app/Shop/src/cart.rs"), "fn total() { let _ = 1; }\n");
  git("add", "-A");
  git("commit", "-q", "-m", "change");
  const { code, out } = run("round-record-lint.mjs", [root, "--since", base]);
  assert.equal(code, 1);
  assert.match(out, /changed and no ROUND-RECORD\.md did/);
});

test("round-record-lint passes when the record changed with the code", async () => {
  const { root, git, base } = await committed({ "app/Shop/src/cart.rs": "fn total() {}\n" });
  await fs.writeFile(path.join(root, "app/Shop/src/cart.rs"), "fn total() { let _ = 1; }\n");
  await fs.writeFile(path.join(root, "ROUND-RECORD.md"), FULL);
  git("add", "-A");
  git("commit", "-q", "-m", "change");
  const { code, out } = run("round-record-lint.mjs", [root, "--since", base]);
  assert.equal(code, 0, out);
  assert.match(out, /a record changed with them/);
});

test("round-record-lint checks nothing, rather than guessing, when git cannot answer", async () => {
  const root = await project({ "README.md": "# Shop\n" });
  const { code, out } = run("round-record-lint.mjs", [root, "--since", "nosuchref"]);
  assert.equal(code, 0, out);
  assert.match(out, /git could not diff/);
});

// ---------------------------------------------------------------------------
// spec-lint: the check that does the reading people no longer have to.
//
// **Its fault is invented scope** — a line in a spec that no brief asked for.
// So every case is a line whose source is missing, wrong or empty, plus the
// shapes that must pass: a sourced line, an unknown citing an empty answer,
// and a deferral with an owner. The key list is the real one, read from
// template/ai-only/2-ai-system.template.md, so these also prove it parses.

const pageBrief =
  "---\nform: page-brief\npage: cart\nsolution: Shop\ndeliverable: MVP\nstatus: filled\n---\n\n" +
  "### why-exists — Why does this page exist?\n> guidance only\nSo a customer can see their basket.\n\n" +
  "### actions — What can someone do?\n- Someone (who: a customer) can: remove an item.\n\n" +
  "### limits — Any known limits?\n> e.g. slow with thousands of items\n";

const specFile = (lines, head = "deliverable: MVP\ndepends-on: []") =>
  `---\nspec: page\nfrom: Shop/cart.md\n${head}\n---\n${lines}\n`;

async function specProject(lines, eol = "\n", head) {
  return project(
    {
      "Project_brief.md": brief("filled", THREE),
      "Shop/cart.md": pageBrief,
      "Shop/api.json": JSON.stringify({ whatItDoes: { purpose: { question: "q", answer: "Manage baskets." }, basePath: { question: "q", answer: "" } } }),
      "ai-only/Shop/cart.md": specFile(lines, head),
    },
    eol,
  );
}

const lintSpecs = (root, ...extra) => run("spec-lint.mjs", [...extra, root]);

for (const [name, eol] of [["LF", "\n"], ["CRLF", CRLF]]) {
  test(`spec-lint passes a spec whose every line has a real source (${name})`, async () => {
    const root = await specProject(
      "objective: So a customer can see their basket. [why-exists]\n" +
        "action: customer removes an item [actions]\n" +
        "uses: the basket API [Shop/api.json#whatItDoes.purpose]\n" +
        "rule: HTTPS only [baseline:website-baseline]\n" +
        "\n## Round 1\nfree prose here is not checked",
      eol,
    );
    const { code, out } = lintSpecs(root);
    assert.equal(code, 0, out);
    assert.match(out, /every line sourced/);
  });

  test(`spec-lint catches a line with no source (${name})`, async () => {
    const root = await specProject("action: customer shares the basket by email", eol);
    const { code, out } = lintSpecs(root);
    assert.equal(code, 1);
    assert.match(out, /has no \[source\]/);
  });
}

test("spec-lint catches a source that names a question the brief does not have", async () => {
  const { code, out } = lintSpecs(await specProject("action: customer pays [checkout]"));
  assert.equal(code, 1);
  assert.match(out, /has no question "checkout"/);
});

test("spec-lint catches a fact citing an answer nobody gave", async () => {
  const { code, out } = lintSpecs(await specProject("limit: slow past a thousand items [limits]"));
  assert.equal(code, 1);
  assert.match(out, /nobody has answered/);
});

test("spec-lint reads guidance as no answer, in JSON as in Markdown", async () => {
  const { code, out } = lintSpecs(await specProject("uses: /baskets [Shop/api.json#whatItDoes.basePath]"));
  assert.equal(code, 1);
  assert.match(out, /nobody has answered/);
});

test("spec-lint catches a key the format does not have", async () => {
  const { code, out } = lintSpecs(await specProject("vibe: friendly [why-exists]"));
  assert.equal(code, 1);
  assert.match(out, /"vibe" is not a key/);
});

test("spec-lint catches prose where a line should be", async () => {
  const { code, out } = lintSpecs(await specProject("The cart lets a customer remove things."));
  assert.equal(code, 1);
  assert.match(out, /not a "key: value \[source\]" line/);
});

test("spec-lint catches a preset that does not exist", async () => {
  const { code, out } = lintSpecs(await specProject("rule: HTTPS only [baseline:nope]"));
  assert.equal(code, 1);
  assert.match(out, /baseline:nope is not in/);
});

test("spec-lint lets an unknown cite the empty answer that made it unknown", async () => {
  const { code, out } = lintSpecs(await specProject("UNKNOWN: how many items is too many? [limits]"));
  assert.equal(code, 0, out);
  assert.match(out, /open .*how many items is too many/);
});

test("spec-lint --ready refuses a spec with an open unknown", async () => {
  const root = await specProject("UNKNOWN: how many items is too many? [limits]");
  const { code, out } = run("spec-lint.mjs", ["--ready", path.join(root, "ai-only/Shop/cart.md")]);
  assert.equal(code, 1);
  assert.match(out, /not ready: 1 unknown/);
});

test("spec-lint --ready accepts a deferral a person owns", async () => {
  const root = await specProject("DEFERRED: how many items is too many? — owner: Sam [limits]");
  const { code, out } = run("spec-lint.mjs", ["--ready", path.join(root, "ai-only/Shop/cart.md")]);
  assert.equal(code, 0, out);
});

test("spec-lint catches a deferral nobody owns", async () => {
  const { code, out } = lintSpecs(await specProject("DEFERRED: how many items is too many? [limits]"));
  assert.equal(code, 1);
  assert.match(out, /needs "— owner: <name>"/);
});

test("spec-lint says so, and passes, when nothing has been translated yet", async () => {
  const root = await project({ "Project_brief.md": brief("blank", "") });
  const { code, out } = lintSpecs(root);
  assert.equal(code, 0, out);
  assert.match(out, /nothing to check/);
});

// ---------------------------------------------------------------------------
// brief-lint --status: what /build reads instead of whole briefs.
//
// A build needs one word from each brief it depends on — its status — and was
// reading the whole file for it, around 560 tokens a dependency. This prints
// the word. Its fault would be a wrong or missing status, which would let a
// build run before what it depends on exists, so that is what is tested.

for (const [name, eol] of [["LF", "\n"], ["CRLF", CRLF]]) {
  test(`brief-lint --status reads Markdown and JSON briefs (${name})`, async () => {
    const root = await project(
      {
        "Shop/cart.md": item("built", "MVP"),
        "Shop/api.json": JSON.stringify({ form: "endpoint-brief", status: "filled", deliverable: "MVP" }, null, 2),
      },
      eol,
    );
    const { code, out } = run("brief-lint.mjs", ["--status", path.join(root, "Shop/cart.md"), path.join(root, "Shop/api.json")]);
    assert.equal(code, 0, out);
    assert.match(out, /cart\.md: built/);
    assert.match(out, /api\.json: filled/);
  });
}

test("brief-lint --status fails on a brief that is not there", async () => {
  const root = await project({ "Shop/cart.md": item("built", "MVP") });
  const { code, out } = run("brief-lint.mjs", ["--status", path.join(root, "Shop/gone.md")]);
  assert.equal(code, 1);
  assert.match(out, /gone\.md: not found/);
});

// **The copy /build reads instead of the brief must not go stale.** An item
// spec carries its brief's `deliverable` and `depends-on` so a build need not
// open the brief; a copy that drifted would build towards the wrong
// deliverable, or before what it depends on. So drift fails, like a bad source.

test("spec-lint passes an item spec whose front matter matches its brief", async () => {
  const { code, out } = lintSpecs(await specProject("objective: a basket [why-exists]"));
  assert.equal(code, 0, out);
});

test("spec-lint catches a deliverable that no longer matches the brief", async () => {
  const root = await specProject("objective: a basket [why-exists]", "\n", "deliverable: Checkout\ndepends-on: []");
  const { code, out } = lintSpecs(root);
  assert.equal(code, 1);
  assert.match(out, /deliverable "Checkout" but the brief says "MVP"/);
});

test("spec-lint catches dependencies that no longer match the brief", async () => {
  const root = await specProject("objective: a basket [why-exists]", "\n", "deliverable: MVP\ndepends-on: [Shop/api.json]");
  const { code, out } = lintSpecs(root);
  assert.equal(code, 1);
  assert.match(out, /depends-on \[Shop\/api\.json\] but the brief says \[\]/);
});

test("spec-lint catches an item spec that does not carry them at all", async () => {
  const root = await specProject("objective: a basket [why-exists]", "\n", "owner: nobody");
  const { code, out } = lintSpecs(root);
  assert.equal(code, 1);
  assert.match(out, /no "deliverable:"/);
});

// ---------------------------------------------------------------------------
// brief-lint and QA: the sign-off track people own.
//
// QA's documents are people's documents, read against the Project Brief like
// every other brief. The faults that matter are the ones that make a sign-off
// mean less than it says: a regression test pointing at automation that is not
// there, two tests sharing an ID, a test of an item that does not exist, and a
// sign-off for a deliverable the brief does not list or that nobody signed.

const REG_HEAD =
  "# Regression suite\n\n| ID | Proves | Item | Kind | Steps | Expected | Automation |\n|---|---|---|---|---|---|---|\n";
const SIGN_HEAD =
  "# Sign-off\n\n| Deliverable | Date | Signed off by | Regression run | Accepted issues |\n|---|---|---|---|---|\n";

async function qaProject(files, eol = "\n") {
  return project(
    {
      "Project_brief.md": brief("filled", THREE),
      "Shop/cart.md": item("built", "MVP"),
      "qa/regression.md": REG_HEAD,
      "qa/signoff.md": SIGN_HEAD,
      ...files,
    },
    eol,
  );
}

for (const [name, eol] of [["LF", "\n"], ["CRLF", CRLF]]) {
  test(`brief-lint passes a regression suite that is true (${name})`, async () => {
    const root = await qaProject(
      {
        "qa/regression.md":
          REG_HEAD +
          "| R-001 | removing an item empties the basket | Shop/cart.md | automated | | basket shows 0 items | tests/regression/cart.test.js |\n" +
          "| R-002 | the basket looks right on a phone | Shop/cart.md | manual | 1. open on a phone | nothing overlaps | |\n",
        "tests/regression/cart.test.js": "// R-001\n",
      },
      eol,
    );
    const { code, out } = run("brief-lint.mjs", [root]);
    assert.equal(code, 0, out);
    assert.match(out, /2 regression test\(s\)/);
  });

  test(`brief-lint catches automation that is not there (${name})`, async () => {
    const root = await qaProject(
      { "qa/regression.md": REG_HEAD + "| R-001 | removing an item | Shop/cart.md | automated | | empty | tests/regression/gone.test.js |\n" },
      eol,
    );
    const { code, out } = run("brief-lint.mjs", [root]);
    assert.equal(code, 1);
    assert.match(out, /R-001.*tests\/regression\/gone\.test\.js does not exist/);
  });
}

test("brief-lint catches two regression tests with one ID", async () => {
  const row = "| R-001 | a thing | Shop/cart.md | manual | 1. do it | it works | |\n";
  const { code, out } = run("brief-lint.mjs", [await qaProject({ "qa/regression.md": REG_HEAD + row + row })]);
  assert.equal(code, 1);
  assert.match(out, /R-001 is used twice/);
});

test("brief-lint catches a regression test whose kind is neither manual nor automated", async () => {
  const row = "| R-001 | a thing | Shop/cart.md | sometimes | 1. do it | it works | |\n";
  const { code, out } = run("brief-lint.mjs", [await qaProject({ "qa/regression.md": REG_HEAD + row })]);
  assert.equal(code, 1);
  assert.match(out, /R-001 kind "sometimes"/);
});

test("brief-lint catches a regression test of an item that does not exist", async () => {
  const row = "| R-001 | a thing | Shop/gone.md | manual | 1. do it | it works | |\n";
  const { code, out } = run("brief-lint.mjs", [await qaProject({ "qa/regression.md": REG_HEAD + row })]);
  assert.equal(code, 1);
  assert.match(out, /R-001 tests Shop\/gone\.md, which does not exist/);
});

test("brief-lint notes automated tests nobody has automated yet, without failing", async () => {
  const row = "| R-001 | a thing | Shop/cart.md | automated | | it works | |\n";
  const { code, out } = run("brief-lint.mjs", [await qaProject({ "qa/regression.md": REG_HEAD + row })]);
  assert.equal(code, 0, out);
  assert.match(out, /1 automated test\(s\) not automated yet/);
});

test("brief-lint catches a sign-off for a deliverable the brief does not list", async () => {
  const row = "| Payments | 2026-11-01 | Sam | 2/2 passed | none |\n";
  const { code, out } = run("brief-lint.mjs", [await qaProject({ "qa/signoff.md": SIGN_HEAD + row })]);
  assert.equal(code, 1);
  assert.match(out, /signs off "Payments", which the Project Brief does not list/);
});

test("brief-lint catches a sign-off nobody signed", async () => {
  const row = "| MVP | 2026-11-01 |  | 2/2 passed | none |\n";
  const { code, out } = run("brief-lint.mjs", [await qaProject({ "qa/signoff.md": SIGN_HEAD + row })]);
  assert.equal(code, 1);
  assert.match(out, /MVP sign-off has no name/);
});

test("brief-lint says a built deliverable is waiting on QA, and when it is signed off", async () => {
  const waiting = run("brief-lint.mjs", [await qaProject({})]);
  assert.equal(waiting.code, 0, waiting.out);
  assert.match(waiting.out, /MVP is built — waiting on QA sign-off/);

  const row = "| MVP | 2026-11-01 | Sam | 2/2 passed | none |\n";
  const signed = run("brief-lint.mjs", [await qaProject({ "qa/signoff.md": SIGN_HEAD + row })]);
  assert.equal(signed.code, 0, signed.out);
  assert.match(signed.out, /MVP signed off 2026-11-01 by Sam/);
});

test("brief-lint catches a QA review of an item that does not exist", async () => {
  const review = "---\nform: qa-review\nitem: Shop/gone.md\nstatus: happy\n---\n";
  const { code, out } = run("brief-lint.mjs", [await qaProject({ "qa/Shop/gone.md": review })]);
  assert.equal(code, 1);
  assert.match(out, /reviews Shop\/gone\.md, which does not exist/);
});

test("brief-lint leaves a project with no qa/ folder alone", async () => {
  const root = await project({ "Project_brief.md": brief("filled", THREE), "Shop/cart.md": item("built", "MVP") });
  const { code, out } = run("brief-lint.mjs", [root]);
  assert.equal(code, 0, out);
  assert.doesNotMatch(out, /regression|sign-off/);
});

// ---------------------------------------------------------------------------
// check.mjs: one command that runs every check.
//
// It exists so that adding a check is adding a file, not editing five lists.
// Its faults would be the quiet kind: stopping at the first failure (so later
// checks never run), passing when one failed, or missing a check because it
// was not on a list. So the test gives it a check it has never heard of.

async function fakeTools(results) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "checks-"));
  await fs.copyFile(path.join(tools, "check.mjs"), path.join(dir, "check.mjs"));
  for (const [name, code] of Object.entries(results)) {
    await fs.writeFile(path.join(dir, name), `console.log("ran ${name}"); process.exit(${code});\n`);
  }
  await fs.writeFile(path.join(dir, "helper.test.mjs"), `console.log("ran a test"); process.exit(1);\n`);
  return dir;
}

const runCheck = (dir) => {
  try {
    return { code: 0, out: execFileSync("node", [path.join(dir, "check.mjs")], { encoding: "utf8" }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
};

test("check.mjs runs every *-lint.mjs beside it, including one no list names", async () => {
  const { code, out } = runCheck(await fakeTools({ "a-lint.mjs": 0, "brand-new-lint.mjs": 0 }));
  assert.equal(code, 0, out);
  assert.match(out, /ran a-lint\.mjs/);
  assert.match(out, /ran brand-new-lint\.mjs/);
  assert.doesNotMatch(out, /ran a test/, "only checks run, not tests");
});

test("check.mjs runs them all and fails if any one fails", async () => {
  const { code, out } = runCheck(await fakeTools({ "a-lint.mjs": 1, "b-lint.mjs": 0 }));
  assert.equal(code, 1);
  assert.match(out, /ran b-lint\.mjs/, "a failure stopped the later checks from running");
  assert.match(out, /a-lint\.mjs failed/);
});
