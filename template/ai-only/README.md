# The AI workspace

This folder is where the AI does its work. People write the briefs in plain
English in the folders beside this one; the AI works here. It translates those
briefs into specs, plans each change, reports what it built and what it could
not build, and keeps track of what already exists so it does not rebuild it.

**It works with any AI model.** Nothing in here depends on one vendor's model or
tool. Claude, GPT, Gemini or a local model all read and write the same plain
Markdown files, so work one model started can be picked up by another.

**People do not write here, but they read everything.** "AI-only" means the AI
writes these files, not that they are hidden. Every spec is read back against
its brief, and a person approves every plan before any code is written.

---

## What is in it

| File | What it is | Who writes it |
|---|---|---|
| `README.md` | This page. | the framework |
| [`1-translate-for-ai.md`](1-translate-for-ai.md) | The bridge: the prompts that turn a filled-in brief into a spec and a skills list. Paste them into any model, or let a command run them. | the framework |
| [`2-ai-system.template.md`](2-ai-system.template.md) | The shape every spec comes back in, so every project's specs look the same. | the framework |
| [`3-code-map.template.md`](3-code-map.template.md) | The shape of the code map, and how it is checked. | the framework |
| [`procedures/`](procedures/README.md) | One file per thing the framework asks an AI to do — draft, translate, new-item, build, pipeline, emit-guardrails. Plain Markdown; any model can be pointed at one and follow it. Each tool holds a pointer, never a copy. | the framework |
| `Project_system.md` | The **System Spec**, the short **Project Digest**, and the **Project Skills**, translated from `Project_brief.md`. | the AI, from the brief |
| `<solution>/<item>.md` | One **item spec** per page, endpoint or model, mirroring the human folders (`ClothingAPI/Login.json` → `ClothingAPI/Login.md`). Each holds the spec, the skills, the plan, and a report for every build round. | the AI, from the item's brief |
| `Code_map.md` | The **reuse index**: one row per method the AI built, saying what it does and what it uses. | the AI, as it builds |

The specs are what the AI builds from. The code map is a supporting index. It is
one file here, not the purpose of the folder.

---

## How an AI works in here

The reading order keeps each step cheap. No step re-reads the whole project.

1. **Translate.** A filled-in brief becomes a spec here, using the bridge. The
   Project Brief becomes `Project_system.md`; each item brief becomes
   `<solution>/<item>.md`. Gaps go under **Open Questions**, never into guesses.
2. **Plan.** To build an item, read the **Project Digest** in
   `Project_system.md` (not the whole spec), then the item's spec, then the
   first sentence of each `Code_map.md` row, looking for something to reuse.
   Write the plan and wait for a person to approve it.
3. **Build and report.** After approval, make the smallest change that answers
   the spec. Append a round report to the item's spec: what was done, the tests,
   and the debt left behind. Update the code-map rows for any method created or
   changed.

## What the code map costs, and what it buys

It costs one row per method the AI creates or changes, written in the same build
that changes the method. `node tools/code-map-lint.mjs` checks that every file
and method a row names still exists.

It buys a cheap reuse check before code is written. Reading the first sentence
of each row costs less than reading the code, and a method found there is one
the AI does not rebuild. If keeping the rows up to date stops being worth what
that check saves, change the rule where it is written (step 3 of
`.claude/commands/build.md`, and the project's guardrails). Don't skip it
quietly in a build.

---

## Using it with your agent

- **Claude Code** runs the steps as slash commands (`/translate`, `/build`,
  `/new-item`, `/pipeline`, `/draft`, `/emit-guardrails`), defined in
  `.claude/commands/`.
- **Any other agent** can follow the same steps. The command files are plain
  Markdown, so tell the agent to read the one for the step you want, e.g. "read
  `.claude/commands/build.md` and build this spec". `/emit-guardrails` writes
  the project's rules into the file each tool reads, such as `AGENTS.md`,
  Cursor rules or Kiro steering.
- **A chat model with no file access** can still translate: paste a prompt from
  [`1-translate-for-ai.md`](1-translate-for-ai.md) along with the brief, and
  save what it returns at the mirrored path here.

The rules travel to every agent; the machinery does not. Plan approval, cost per
change and the sandbox are enforced by the CoperativeAI app and its commands.
With any other agent, enforcing them is up to you.
