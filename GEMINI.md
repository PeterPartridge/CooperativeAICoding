<!-- Hand-written for working on the framework itself, alongside AGENTS.md,
     which holds the rules. This file only covers what is different for Gemini. -->

## The Halt (Plan Approval)
To halt execution and get plan approval before changing files, I must use my file-editing tools to create or update an `implementation_plan.md` artifact, explicitly setting `request_feedback = true` in the API call. A plain text request in chat does not suspend my execution loop. If the user does not respond, I remain suspended and take no further action. (Note: Artifacts are stored globally in my local app data directory outside your repository, so they will never accidentally be committed to version control).

## Workflows & Commands
Because I do not automatically route slash commands (like `/build`) to `.claude/commands/`, you must instruct me in plain text. Each command file is a pointer; the procedure it names under `template/ai-only/procedures/` is what I follow.
- **Translating a brief**: Say "translate this brief [path]". I will read `.claude/commands/translate.md` and the procedure it points to.
- **Building a spec**: Say "build this spec [path]". I will read `.claude/commands/build.md`, produce an `implementation_plan.md` artifact, and wait for your approval via the artifact mechanism before writing code.
- **Drafting a brief from code**: Say "draft a brief from the codebase". I will read `.claude/commands/draft.md`.
- **Creating a pipeline**: Say "create the pipeline for [solution]". I will read `.claude/commands/pipeline.md` before proceeding.
- **Emitting guardrails**: Say "emit the guardrails". I will read `.claude/commands/emit-guardrails.md`.
- **Scaffolding a new item**: Say "scaffold a new page/endpoint/model". I will read `.claude/commands/new-item.md` to copy the correct blank form.

## Unskippable Verification
This repository is the framework, not a project built with it, so the gates are about the framework's own files:
- **One copy of each procedure**: when I change what a command does, I change the procedure in `template/ai-only/procedures/`, never the command file. `npm test` fails if a command starts carrying behaviour of its own.
- **The checks**: I run `npm run check` from the repository root before I say I am done, and `cd site && node build.mjs` if I touched `site/`, `README.md`, `HOW-TO-USE.md` or `INSTALL.md`.

## When you finish: the walkthrough is the round record
My own instructions have me write a `walkthrough.md` artifact at the end of a task, and this project asks me to append to `ROUND-RECORD.md`. **These are one ritual, not two, and satisfying the artifact does not satisfy this rule.** I write the record to `ROUND-RECORD.md` at the repository root, under the three headings the project asks for, and a walkthrough — if I produce one — says the same thing and adds nothing the record does not already have:

```markdown
### What I did
### What I could not do  (and what you would need to tell me)
### Debt I left behind  (one paragraph each, so each can become its own work item)
```

`node tools/round-record-lint.mjs` checks that all three headings are there with something under each. In this repository CI does not demand a record with every change — that rule watches solution code under `app/`, and the framework has none — so writing it is on me. It cannot check that what I wrote is **true**: a step I did not notice I skipped will not appear in any of the three sections, and no reader of the file can tell it is missing.

## What this file cannot give you
Even with these instructions, I cannot track or report token-intensity or cost per work item, because I lack introspective APIs for my own token usage. Automated invocation of these workflows still relies on you explicitly asking me to read the command files.
