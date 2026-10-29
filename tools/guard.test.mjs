// Tests for tools/hooks/guard.mjs — the Claude Code hook that enforces the
// rules a model cannot be trusted to keep on its own.
//
// **Its faults are the two worst kinds.** A guard that lets a sign-off or a
// secret through is a promise broken silently; a guard that blocks ordinary
// work gets switched off by the first person it annoys. So each rule is tested
// both ways: the write it exists to stop, and the nearby write it must allow.
//
// Fake secrets are assembled at run time, so this file never contains one.
//
//   node --test tools/guard.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.dirname(fileURLToPath(import.meta.url));
const guard = path.join(tools, "hooks/guard.mjs");

async function project(files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "guard-"));
  for (const [rel, body] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(root, rel)), { recursive: true });
    await fs.writeFile(path.join(root, rel), body);
  }
  return root;
}

function hook(root, phase, tool_name, tool_input) {
  const r = spawnSync(process.execPath, [guard, phase], {
    input: JSON.stringify({ hook_event_name: phase === "pre" ? "PreToolUse" : "PostToolUse", cwd: root, tool_name, tool_input }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    encoding: "utf8",
  });
  return { code: r.status, err: r.stderr };
}

const BRIEF = "---\nform: page-brief\npage: cart\nstatus: filled\nproduct-signoff: \"\"\nbuild-signoff: \"\"\n---\n\n### why-exists — Why?\nA basket.\n";

test("guard blocks the AI writing a sign-off", async () => {
  const root = await project({ "Shop/cart.md": BRIEF });
  const { code, err } = hook(root, "pre", "Edit", {
    file_path: path.join(root, "Shop/cart.md"),
    old_string: 'product-signoff: ""',
    new_string: "product-signoff: Sam 2026-10-30 round 1",
  });
  assert.equal(code, 2);
  assert.match(err, /only a person signs/i);
});

test("guard lets the AI edit the rest of a brief", async () => {
  const root = await project({ "Shop/cart.md": BRIEF });
  const { code, err } = hook(root, "pre", "Edit", {
    file_path: path.join(root, "Shop/cart.md"),
    old_string: "A basket.",
    new_string: "A basket.\n> drafted · /product 2026-10-30",
  });
  assert.equal(code, 0, err);
});

test("guard blocks a sign-off in a JSON brief, written whole", async () => {
  const json = JSON.stringify({ form: "endpoint-brief", status: "filled", buildSignoff: "" }, null, 2);
  const root = await project({ "Shop/api.json": json });
  const { code } = hook(root, "pre", "Write", {
    file_path: path.join(root, "Shop/api.json"),
    content: json.replace('"buildSignoff": ""', '"buildSignoff": "Alex 2026-10-31 round 1"'),
  });
  assert.equal(code, 2);
});

test("guard blocks the AI marking QA's review happy, and writing in the sign-off sheet", async () => {
  const review = "---\nform: qa-review\nitem: Shop/cart.md\nstatus: reviewing\n---\n";
  const root = await project({ "qa/Shop/cart.md": review, "qa/signoff.md": "# Sign-off\n" });
  const happy = hook(root, "pre", "Write", { file_path: path.join(root, "qa/Shop/cart.md"), content: review.replace("reviewing", "happy") });
  assert.equal(happy.code, 2);
  const sheet = hook(root, "pre", "Edit", { file_path: path.join(root, "qa/signoff.md"), old_string: "# Sign-off\n", new_string: "# Sign-off\n| MVP | 2026-11-01 | AI | all | none |\n" });
  assert.equal(sheet.code, 2);
  assert.match(sheet.err, /QA's/);
});

const AWS = "AKIA" + "ABCDEFGHIJKLMNOP";
const PRIVATE = "-----BEGIN " + "RSA PRIVATE KEY-----";

test("guard blocks a write that adds a secret value", async () => {
  const root = await project({});
  for (const secret of [AWS, PRIVATE, "ghp_" + "a".repeat(36), "sk-ant-" + "b".repeat(30)]) {
    const { code, err } = hook(root, "pre", "Write", { file_path: path.join(root, "src/config.js"), content: `const key = "${secret}";\n` });
    assert.equal(code, 2, `not blocked: ${secret.slice(0, 8)}…`);
    assert.match(err, /secret/i);
  }
});

test("guard allows code that names a setting instead", async () => {
  const root = await project({});
  const { code, err } = hook(root, "pre", "Write", { file_path: path.join(root, "src/config.js"), content: "const key = process.env.PAYMENTS_KEY;\n" });
  assert.equal(code, 0, err);
});

test("guard does not block an edit to a file that already held the pattern", async () => {
  const root = await project({ "fixtures/keys.txt": `${AWS}\nold\n` });
  const { code, err } = hook(root, "pre", "Edit", { file_path: path.join(root, "fixtures/keys.txt"), old_string: "old", new_string: "new" });
  assert.equal(code, 0, err);
});

test("guard tells the AI, after it writes a spec, what spec-lint found", async () => {
  const root = await project({
    "Project_brief.md": "---\nform: project-brief\nstatus: filled\n---\n\n### roles — Roles?\nAdmin.\n",
    "ai-only/Project_digest.md": "---\nspec: digest\nfrom: Project_brief.md\n---\nrole: Admin [roles]\nvibe: calm [roles]\n",
  });
  const { code, err } = hook(root, "post", "Write", { file_path: path.join(root, "ai-only/Project_digest.md"), content: "" });
  assert.equal(code, 2);
  assert.match(err, /"vibe" is not a key/);
});

test("guard is silent after a clean spec, and after ordinary code", async () => {
  const root = await project({
    "Project_brief.md": "---\nform: project-brief\nstatus: filled\n---\n\n### roles — Roles?\nAdmin.\n",
    "ai-only/Project_digest.md": "---\nspec: digest\nfrom: Project_brief.md\n---\nrole: Admin [roles]\n",
    "src/a.js": "x\n",
  });
  assert.equal(hook(root, "post", "Write", { file_path: path.join(root, "ai-only/Project_digest.md") }).code, 0);
  assert.equal(hook(root, "post", "Edit", { file_path: path.join(root, "src/a.js") }).code, 0);
});

test("guard lets work through when it cannot read what it was given", () => {
  const r = spawnSync(process.execPath, [guard, "pre"], { input: "not json", encoding: "utf8" });
  assert.equal(r.status, 0);
});

test("the shipped settings run the guard before and after every write", async () => {
  const settings = JSON.parse(await fs.readFile(path.join(tools, "../.claude/settings.json"), "utf8"));
  for (const [event, phase] of [["PreToolUse", "pre"], ["PostToolUse", "post"]]) {
    const group = settings.hooks?.[event]?.find((g) => /Write/.test(g.matcher) && /Edit/.test(g.matcher));
    assert.ok(group, `no ${event} hook for Write and Edit`);
    const h = group.hooks.find((x) => x.command === "node");
    assert.ok(h, `${event} does not run node`);
    assert.deepEqual(h.args, ["${CLAUDE_PROJECT_DIR}/tools/hooks/guard.mjs", phase]);
  }
});
