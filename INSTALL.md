# Install

The framework is the forms and the four commands. **One command and no
download**, because it is Markdown, JSON and prompts — and
[Claude Code](https://claude.com/claude-code):

```bash
cd my-project
npx github:PeterPartridge/CooperativeAICoding init
claude
```

It runs wherever Claude Code runs — Windows, macOS, Linux alike. Nothing in
it is platform-specific.

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
