// The AI coding agents a project can have the framework's commands for, and
// where each one reads them. One table, read by `coperativeai init --agents`
// to decide what to copy and by tools/agent-commands.mjs to write the files.
//
// The formats are each agent's integration as GitHub's Spec Kit documents it
// (October 2026). `args` is how an agent hands over what the user typed after
// the command; null means it hands over nothing, so the pointer says to take
// it from the conversation.

export const AGENTS = {
  claude: { dir: ".claude", note: "Claude Code — .claude/commands and .claude/skills" },
  cursor: { dir: ".cursor/skills", file: (n) => `${n}/SKILL.md`, kind: "skill", args: null },
  codex: { dir: ".agents/skills", file: (n) => `${n}/SKILL.md`, kind: "skill", args: null },
  gemini: { dir: ".gemini/commands", file: (n) => `${n}.toml`, kind: "toml", args: "{{args}}" },
  opencode: { dir: ".opencode/commands", file: (n) => `${n}.md`, kind: "markdown", args: "$ARGUMENTS" },
  copilot: { dir: ".github/prompts", file: (n) => `${n}.prompt.md`, kind: "markdown", args: null },
  kiro: { dir: ".kiro/prompts", file: (n) => `${n}.md`, kind: "plain", args: null },
};

/** Which agent a framework file is for, or null when it is for every agent. */
export function agentOf(from) {
  for (const [key, { dir }] of Object.entries(AGENTS)) if (from === dir || from.startsWith(`${dir}/`)) return key;
  return null;
}
