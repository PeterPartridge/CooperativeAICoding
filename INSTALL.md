# Install

The framework is the forms and the four commands, and it installs from npm.
You need Node 20 or later and [Claude Code](https://claude.com/claude-code):

```bash
npm install -g coperativeai
cd my-project
coperativeai init
claude
```

It runs wherever Claude Code runs — Windows, macOS, Linux alike. Nothing in
it is platform-specific. `coperativeai init --dry-run` shows what it would
write first, and it never overwrites a file that is already there — so
running it again after `npm update -g coperativeai` is how a project picks up
forms added since.

Then fill in `Project_brief.md` in plain English, and follow
[`HOW-TO-USE.md`](HOW-TO-USE.md). The slash commands (`/translate`,
`/new-item`, `/build`, `/pipeline`) are checked into this repository — in
[`.claude/commands/`](.claude/commands/), with the longer skills they call in
[`.claude/skills/`](.claude/skills/) — so they exist the moment Claude Code
starts from this folder, and travel with a copy of it.

[`example/`](example/) is a worked project to read before you write your own.

---

## Looking for the desktop app?

[**Swarm**](https://github.com/PeterPartridge/Swarm) is a desktop workspace
built with this framework — Product, Develop, Test and Admin in one window,
with the AI's declared debt filed as work. It lives in its own repository, and
its downloads, install steps and build instructions are there.

Releases up to `v0.2.52`, published here under its earlier name CoperativeAI,
stay on this repository's releases page.
