# AI spec format

> The shape of every spec the AI writes in `ai-only/`. People can read any of it,
> but nobody has to: `node tools/spec-lint.mjs` does the routine reading — every
> fact has a source, every key is a known one, every gap is marked.

Which brief becomes which file is in `procedures/translate.md`.

## Lines

Front matter (`spec:` digest · system · solution · page · endpoint · model, and
`from:` the human file, path from the project root), then one fact per line:

```
key: value [source]
```

- **Every line has a source** — where the fact came from:
  - `[id]` — a question in the `from:` file: the `### id —` heading of a Markdown
    brief, or a dotted path in a JSON one (`[whatItDoes.purpose]`).
  - `[path#id]` — the same in another file, path from the project root
    (`[Project_brief.md#roles]`).
  - `[preset:name]`, `[baseline:name]` — an entry in `_forms/boilerplates.json`.
  - Several: `[actions, limits]`.
- **No source means invented.** Leave it out.
- **Terse plain English.** Short sentences, no invented abbreviations or symbols —
  shorthand nobody else can read is the drift this format exists to stop.
- **A gap is a line, never a guess:** `UNKNOWN: <question> [source]`. Build stops
  while one is open. Only a person turns it into
  `DEFERRED: <question> — owner: <name> [source]`.
- `#` headings and `>` notes may appear; nothing is checked after the first
  `## Round` heading, where build appends its reports.

## Keys

Only these. A fact that fits none of them is a question for a person.

| File | Keys |
|---|---|
| digest, system | `purpose` `user` `deliverable` `platform` `solution` `infra` `env` `secrets` `rule` `floor` `role` `security` `look` `tier` `skill` |
| solution | `purpose` `host` `lang` `framework` `auth` `talks-to` `look` `style` `log` `docs` `base-path` `layout` `test` `cmd` `rule` `resource` `provision` `env` `setting` `pipeline` `must-not` `limit` |
| page, endpoint, model | `objective` `model` `action` `look` `info` `store` `must` `access` `check` `limit` `uses` `op` `request` `response` `status` `field` `rel` `index` `retention` `sensitive` `invariant` `skill` |
| any | `UNKNOWN` `DEFERRED` |

`rule` is a house rule *with* its meaning on this project, or a security rule.
`floor` is the testing floor. `tier` is when to use a model and effort. `cmd` is
`cmd: test = npm test`. `check` is an acceptance check. `skill` is
`skill: name — why`.

## Example

```
---
spec: page
from: ClothingWebsite/userLogin.md
---
objective: So a customer can log in to their account. [why-exists]
action: customer enters username and password and logs in [actions]
must: the typed password is never saved [in-memory]
check: wrong password shows an error and does not log in [tests]
UNKNOWN: how a logged-out customer starts a reset — ResetPassword needs a login [actions, ClothingAPI/Login.json#operations]
```
