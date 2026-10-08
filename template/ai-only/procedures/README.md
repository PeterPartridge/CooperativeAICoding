# The procedures

One file per thing the framework asks an AI to do. Plain Markdown, no vendor's
syntax, no tool's conventions — **any model can be pointed at one of these and
follow it.**

| When the request is | Follow |
|---|---|
| fill a brief in from an existing codebase | [`draft.md`](draft.md) |
| turn a filled-in brief into a spec | [`translate.md`](translate.md) |
| add a new page, endpoint or database model | [`new-item.md`](new-item.md) |
| build the next iteration of an approved spec | [`build.md`](build.md) |
| set up a solution's pipeline and infrastructure | [`pipeline.md`](pipeline.md) |
| write the rules out for another AI tool | [`emit-guardrails.md`](emit-guardrails.md) |

## Why they live here and not in a tool's folder

Each of these used to be the body of a Claude Code skill or slash command. The
text was never Claude-specific — it is a procedure written in English — but its
location was, so an agent that was not Claude Code arrived to find the framework's
instructions filed under `.claude/` and addressed to somebody else.

They are here once. Each tool's own format holds a pointer to the file rather
than a copy of it:

| Tool | What it has |
|---|---|
| Claude Code | `.claude/skills/<name>/SKILL.md` — the trigger description, then "read this file and follow it" |
| Any agent reading `AGENTS.md` | the table above, in `AGENTS.md` at the repo root |
| Cursor, Kiro, Copilot | the same table in their native format, written by `emit-guardrails.md` |

A pointer, never a copy, because a procedure duplicated into five tools' formats
is a procedure that is correct in one of them within a month.

## What a procedure can and cannot do

A procedure tells an AI *how* to do something. It cannot make it happen.

Claude Code invokes these as skills and slash commands, so asking for a build
runs the build procedure. With another agent, the procedure is a document you
point at — the agent has to be told to read it, and nothing checks that it did.
That is the honest difference, and it is why **a person still approves every
plan before code is written**: the approval gate is the one part that does not
depend on which model turned up.

## Changing one

Edit the procedure here. Do not edit a tool's pointer to add behaviour — a rule
that exists in `.claude/` and nowhere else is a rule only one model follows,
which is the thing this folder exists to stop.
