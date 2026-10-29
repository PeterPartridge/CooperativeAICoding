# Install

The framework is the forms and the nine commands, and it installs from npm.
You need Node 20 or later and [Claude Code](https://claude.com/claude-code):

```bash
npm install -g coperativeai
cd my-project
coperativeai init
claude
```

It runs wherever Claude Code runs — Windows, macOS, Linux alike. Nothing in
it is platform-specific. `coperativeai init --dry-run` shows what it would
write first, and it never overwrites a file that is already there.

To bring a project up to date, run `npm update -g coperativeai`, then
`coperativeai update` in the project (add `--dry-run` to see it first):
- framework files nobody changed are replaced;
- edited ones are kept, with the new version beside them as `<file>.update`;
- your answers are never touched.

Using another agent as well as, or instead of, Claude Code? Add `--agents`, e.g.
`coperativeai init --agents claude,cursor`. The choices are `claude`, `cursor`,
`codex`, `gemini`, `copilot`, `opencode` and `kiro`.

Then fill in `Project_brief.md` in plain English, and follow
[`HOW-TO-USE.md`](HOW-TO-USE.md). `init` puts the slash commands (`/draft`,
`/translate`, `/new-item`, `/build`, `/pipeline`, `/emit-guardrails`, `/qa`, `/product`, `/verify`) into the
project's `.claude/commands/`, so they exist the moment Claude Code starts
there. Each one points at a plain-Markdown procedure in
`ai-only/procedures/`, which any other agent can be told to follow.

[`example/`](example/) is a worked project to read before you write your own.

---

## Looking for the desktop app?

[**Swarm**](https://github.com/PeterPartridge/Swarm) is a desktop workspace
built with this framework — Product, Develop, Test and Admin in one window,
with the AI's declared debt filed as work. It lives in its own repository, and
its downloads, install steps and build instructions are there.

Releases up to `v0.2.52`, published here under its earlier name CoperativeAI,
stay on this repository's releases page.
