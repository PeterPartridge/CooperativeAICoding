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
        "claude-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
        "code/src/cart.js": "export function addItem() {}\n",
      },
      eol,
    );
    const { code, out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
    assert.equal(code, 0, out);
    assert.match(out, /clean/);
  });

  test(`code-map-lint catches a file that has moved (${name})`, async () => {
    const root = await project(
      {
        "claude-only/Code_map.md": codeMap("| `addItem` | src/gone.js | Adds one item to the basket | nothing |"),
        "code/src/cart.js": "export function addItem() {}\n",
      },
      eol,
    );
    const { code, out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
    assert.equal(code, 1);
    assert.match(out, /file not found: src\/gone\.js/);
  });

  test(`code-map-lint catches a method that no longer exists (${name})`, async () => {
    const root = await project(
      {
        "claude-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
        "code/src/cart.js": "export function removeItem() {}\n",
      },
      eol,
    );
    const { code, out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
    assert.equal(code, 1);
    assert.match(out, /"addItem" is not in/);
  });
}

test("code-map-lint catches a summary that has grown past one line", async () => {
  const sprawl = "Adds one item to the basket, and " + "then does something else that matters ".repeat(6);
  const root = await project({
    "claude-only/Code_map.md": codeMap(`| \`addItem\` | src/cart.js | ${sprawl} | nothing |`),
    "code/src/cart.js": "export function addItem() {}\n",
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
  assert.equal(code, 1);
  assert.match(out, /first sentence is \d+ chars/);
});

// The other direction. Every test above reads a row and asks whether the code
// is real; these ask whether real code has a row. That gap is why a map
// describing a quarter of its codebase reported `clean`.

const TAURI_CMD = "#[tauri::command]\npub async fn list_orders() -> Vec<String> { vec![] }\n";

test("code-map-lint reports a command that no row mentions", async () => {
  const root = await project({
    "claude-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
    "code/src-tauri/src/commands/orders.rs": TAURI_CMD,
  });
  const { out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
  assert.match(out, /1 surface\(s\) have no row/);
  assert.match(out, /1 Tauri command\(s\), e\.g\. list_orders/);
});

test("code-map-lint counts a command named anywhere in the map as covered", async () => {
  const root = await project({
    "claude-only/Code_map.md": codeMap(
      "| `list_orders` | src-tauri/src/commands/orders.rs | Lists the orders | nothing |",
    ),
    "code/src-tauri/src/commands/orders.rs": TAURI_CMD,
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /clean/);
});

test("code-map-lint reports a table that no row mentions", async () => {
  const root = await project({
    "claude-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
    "code/src-tauri/src/db/order.rs": 'conn.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER)", ())',
  });
  const { out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
  assert.match(out, /1 database table\(s\), e\.g\. orders/);
});

// The guarantee that lets this rule ship to projects that are not this one: a
// codebase with none of these surfaces is neither helped nor punished by the
// rule existing. Without this, adding a surface would quietly start failing
// every Go and Python project that installed the framework.
test("code-map-lint leaves a project with no such surfaces alone", async () => {
  const root = await project({
    "claude-only/Code_map.md": codeMap("| `addItem` | src/cart.js | Adds one item to the basket | nothing |"),
    "code/src/cart.js": "export function addItem() {}\n",
  });
  const { code, out } = run("code-map-lint.mjs", [path.join(root, "claude-only/Code_map.md")]);
  assert.equal(code, 0, out);
  assert.match(out, /clean/);
  assert.doesNotMatch(out, /surface/);
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
  const { root, git, base } = await committed({ "app/CoperativeAI/src/cart.rs": "fn total() {}\n" });
  await fs.writeFile(path.join(root, "app/CoperativeAI/src/cart.rs"), "fn total() { let _ = 1; }\n");
  git("add", "-A");
  git("commit", "-q", "-m", "change");
  const { code, out } = run("round-record-lint.mjs", [root, "--since", base]);
  assert.equal(code, 1);
  assert.match(out, /changed and no ROUND-RECORD\.md did/);
});

test("round-record-lint passes when the record changed with the code", async () => {
  const { root, git, base } = await committed({ "app/CoperativeAI/src/cart.rs": "fn total() {}\n" });
  await fs.writeFile(path.join(root, "app/CoperativeAI/src/cart.rs"), "fn total() { let _ = 1; }\n");
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
