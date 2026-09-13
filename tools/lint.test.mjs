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
