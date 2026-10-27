### What I did
- **The app left this repository.** `app/`, `application/`, `rust-toolchain.toml`,
  the release workflow and its two version scripts are gone; the app, its
  briefs and its history are in [Swarm](https://github.com/PeterPartridge/Swarm),
  renamed there from CoperativeAI. CI keeps only the `documents` job, which
  checks the framework itself. This record starts fresh — the old one, which
  mixed app and framework rounds, went to Swarm with the app.
- **The site is the framework's.** It no longer publishes the app's briefs,
  offers app downloads or shows app screenshots; one section says Swarm is
  built with the framework and links to it.
- **`INSTALL.md` covers only the framework.** The app's download, install and
  build guide became Swarm's README (Swarm PR #10).
- **The guardrails describe this repository.** `AGENTS.md` and `GEMINI.md`
  were generated from the app's brief and described the app; both are now
  hand-written for working on the framework, since the framework has no brief
  of its own to generate them from.
- **Every example that pointed at the app points at `example/`** — the
  command hints, `HOW-TO-USE.md`, the template procedures and `template/README.md`.
  Where the framework names the app in text it is emitted into projects with
  (`emit-guardrails`, `AGENTS.template.md`, `ai-only/README.md`), it now says
  Swarm.
- **Tidied after the move.** `.gitignore` loses its Rust and Cargo rules;
  `lint.test.mjs` uses a neutral `app/Shop/` fixture path instead of the old
  app's name. The repository has a description, the Pages site as its
  website, and the five topics from `package.json`. Locally: the merged
  branches and the leftover `app/` build output are gone, and the loose
  objects from the deletion were packed. This answers the debt item below
  about the `app/` folder surviving on disk.
- **`commands.test.mjs` keeps `application` in its list of real top-level
  folders, on purpose.** A command that still cited `application/…` would now
  fail that test, which is right; dropping it from the list would let the
  dead reference through unchecked.
- **Ready to publish to npm as `coperativeai`.** The docs, the site, the CLI's
  own help, the skills and `tools/QA.md` now say `npm install -g coperativeai`
  then `coperativeai init`, instead of `npx github:…`. `package.json` publishes
  exactly what `init` copies, plus the CLI and its four docs: it used to name
  the whole `.claude/` folder, which would have shipped a working copy's
  `settings.local.json`. A new test asks npm what it would publish and fails on
  anything else. Verified by packing, installing the tarball globally into a
  temporary prefix and running `coperativeai init` in an empty folder.

### What I could not do (and what you would need to tell me)
- **I did not publish.** `npm publish` runs under the owner's npm account, so
  it is theirs to run; until it has, every install instruction here points at
  a package the registry does not have.
- **The framework has no Project brief of its own,** so `AGENTS.md` and
  `GEMINI.md` are hand-written rather than generated. If you want them
  generated, the framework needs a brief first.
- **Old links break.** Anyone holding a link to an `app/` or `application/`
  file on this repository, or to a site page for one of the app's briefs, now
  gets a 404. GitHub does not redirect a moved path across repositories.

### Debt I left behind
- **`round-record-lint` only watches `app/`.** It decides a round happened when
  solution code under `app/` changed, and the framework has none, so CI here
  never asks for a record. The copy in `tools/` is the one every project
  receives from `init`, so changing what it watches is a change to every
  project, and needs deciding rather than patching. Its comment still names
  `app/CoperativeAI` as the example layout.

- **`tools/lint.test.mjs` still uses `app/CoperativeAI/...` as a fixture
  path.** The tests write those files into a temporary folder, so they still
  test the right thing; only the name is from the old layout.

- **The local `app/` folder survives on disk.** Its `node_modules` and Rust
  build cache are ignored by git, so removing the folder from the repository
  left them behind. Deleting them is a person's call.

- **Every framework change now needs a publish to reach anybody.** Before,
  `npx github:` read whatever was on `main`; now people get what was last
  published, so a merged fix does nothing until `npm version` and
  `npm publish` are run. Nothing automates that yet, and nothing notices when
  `main` and the registry have drifted apart.

- **`package.json`'s file list and `init`'s copy list are two lists.** The new
  test keeps them in step, but adding a folder to `init` means adding it in
  both places.

## 2026-10-27 — Procedure paths and quick fixes

### What I did
- **The procedures no longer send a project to paths it does not have.**
  `translate.md` linked `../../../template/ai-only/…` for the bridge and the
  spec shape, `build.md` said to create the code map from
  `template/ai-only/3-code-map.template.md`, and `pipeline.md` said framework
  assets "always live at the repo's `template/`". In a project made by
  `coperativeai init` none of those exist — the same breakage as the earlier
  `template/_forms/` one, one layer further in. They now name the project's own
  `ai-only/` and `_forms/`, with the repository's `template/` given only as
  "inside this repository".
- **A test that reads what a project receives.** `commands.test.mjs` now runs
  `init` and checks every Markdown link in the project's `ai-only/` lands inside
  the project on a real file, and that no `template/<file>` path is named except
  as this repository's layout. It failed on the six faults above before the fix.
- **Docs that had drifted.** "four commands" → six in `README.md`,
  `INSTALL.md` and the site; `INSTALL.md` now lists all six and says `init`
  installs them and that each points at a procedure; `HOW-TO-USE.md` says the
  forms come from the project's `_forms/`; `ai-only/README.md` points at
  `procedures/build.md` rather than the command file for the code-map rule.
- **The example caught up with the form.** `example/ClothingWebsite/userLogin.md`
  still asked the old `in-memory` and `tests` questions. Both headings now match
  `page.md`, and the `in-memory` answer is restated as the constraint the
  ClothingWebsite spec already carries "from the userLogin page brief": the
  typed password is never saved.

### What I could not do  (and what you would need to tell me)
- **The code-map surfaces and the `app/`-only round-record rule are not quick
  fixes.** Both ship Swarm's layout to every project, and changing what they
  watch changes every project, so they need deciding rather than patching.

### Debt I left behind
- **The new test checks backticked `template/<file>` paths by the words on the
  same line** ("inside this repository"). A sentence that wraps the qualifier
  onto the next line would be reported wrongly. That is a false alarm, not a
  missed fault, which is the safer way to be wrong, but it may still need a
  rewording one day.

- **Projects created before this fix keep the broken procedures.** `init` never
  overwrites, so the fix only reaches projects that run `init` afterwards. This
  is gap 7 (updates never reach existing projects).

## 2026-10-27 — Lean AI layer, step 2: the baseline

### What I did
- **Translated the example with today's procedures**, so there is something
  real to measure. `example/ai-only/Project_system.md` comes from the Project
  Brief, and `example/ai-only/ClothingWebsite/userLogin.md` from the login page.
  This also gives `example/` the translated spec it never had.
- **Measured what each step reads**, at four characters per token: always
  loaded ~1,340; translate project ~4,460; translate item ~4,050; build up to
  the plan ~11,100. The whole chain is **~21,000 tokens**. The read lists and
  the script are in the PR description.
- **The translation found four real gaps in the example**, now listed as Open
  Questions:
  - the MVP needs customers to register, but `CreateUser` is Admin-only;
  - nothing covers "see their account";
  - the Manager role is never used;
  - a logged-out customer is offered a password reset that needs a login.

### What I could not do  (and what you would need to tell me)
- **These are estimates, not tokenizer counts.** Exact counts need the API's
  token-counting endpoint and a key. The same estimator is used before and
  after, so the comparison holds.
- **The target is yours to set** now that the baseline exists.

### Debt I left behind
- **My earlier guess aimed at the wrong place.** The procedures are only about
  15% of the chain (~3,150 tokens). The biggest single read is
  `_forms/boilerplates.json` (~3,590 tokens, a third of the build step), read
  whole to resolve one preset and one baseline. Build also re-reads the Project
  Brief (~1,260) for deliverables the Digest already carries. Trimming the
  procedures alone cannot reach a large cut.

- **The example's four open questions are real gaps in a worked example
  people copy.** Answering them is Product's job, not mine, so they stay open.

## 2026-10-27 — Lean AI layer, steps 3–8 (Deliverable 1)

### What I did
- **A spec format for the AI, checked instead of read.**
  `ai-only/2-ai-system.template.md` is now the format: front matter, then one
  `key: value [source]` line per fact, from a fixed set of keys. Every line cites
  the brief answer it came from. A gap is `UNKNOWN: <question> [source]`, never a
  guess. Only a person turns it into `DEFERRED: … — owner: <name>`.
- **`tools/spec-lint.mjs`, the fourth check**, does the read-back people no
  longer do. It fails on:
  - a line with no source;
  - a source naming a question the brief doesn't have;
  - a fact citing an answer nobody gave;
  - a key the format doesn't list (read from the format's own table, so the two
    cannot drift);
  - prose where a line should be;
  - a preset that doesn't exist;
  - a deferral with no owner.

  `--ready <spec>` also fails on any open `UNKNOWN`, and `/build` runs it before
  planning. There are 15 tests, LF and CRLF. It is wired into `init`, the
  package, `npm run check`, CI and the starter `AGENTS.md`.
- **Items 1–3, as agreed:**
  - `/translate` writes `ai-only/<solution>/_solution.md` with only the named
    preset and baseline copied in, so builds never read `boilerplates.json`.
  - `/build` no longer re-reads the Project Brief.
  - The digest is its own file, `Project_digest.md`.
- **Lean procedures.**
  - Rewritten: `translate`, `build`, `pipeline`, `draft`, `emit-guardrails`, the
    starter `AGENTS.md` and `1-translate-for-ai.md`.
  - Every rule kept, each with a few words of reason. The longer *why* moved to
    `procedures/README.md`, which only people read.
  - A token budget per procedure in `commands.test.mjs`; it may only come down,
    and was mutation-checked to fail.
- **The approval card.** `/build`'s plan opens with ten plain-English lines for
  a person, ending `Unknowns: 0`. `/translate` no longer writes a plan, so there
  is one plan, not two.
- **The promise changed, in the docs:** people can read anything in `ai-only/`
  and nobody has to; the checks do the routine reading. Updated: README
  (workflow, and the reasoning under *Decisions taken deliberately*),
  `HOW-TO-USE.md`, `ai-only/README.md`, `template/README.md`, `tools/QA.md`
  scenarios 3–4, the CLI's next steps, and the translate skill's description.
- **Re-translated the example** in the new format: digest, system,
  ClothingWebsite's `_solution.md`, and the login page. All pass `spec-lint`.
  The login page is correctly not ready, with three open unknowns.
- **Measured** (characters ÷ 4), the same chain as the baseline plus the new
  solution translation:

  | Step | Before | After |
  |---|---|---|
  | always loaded | 1,340 | 890 |
  | translate project | 4,460 | 2,770 |
  | translate solution | — | 3,000 |
  | translate item | 4,050 | 2,640 |
  | build to plan | 11,100 | 3,570 |
  | **total** | **20,950** | **12,860** |

  That is **39% less** across the chain, and 68% less on the build step.

### What I could not do  (and what you would need to tell me)
- **The target was 40%; this measures 39%.** The estimate is characters ÷ 4,
  not a tokenizer, so one point is inside its error, but I won't call it met.
  The remaining cut would come from trimming the format's worked example, which
  helps a model follow it. I'd rather keep it. Whether 39% is done is your call.
- **QA scenarios 1–4 have not been run by a person against a real agent.** I
  followed the new translate procedure myself to produce the example, and
  `--ready` refuses the login page as scenario 4 expects. An agent judging its
  own output is a weak check, though.
- **One commit, not one per step.** The steps touched the same files
  (`commands.test.mjs`, the procedures), so they could not be split cleanly
  without interactive staging.

### Debt I left behind
- **Existing projects keep the old format.** `init` never overwrites. A project
  created earlier has `Project_system.md` with a digest inside, and the new
  `build.md` will not reach it, because it never receives the new `build.md`
  either. This is gap 7, and it is now sharper: the format changed underneath.

- **Only the example's login page and one solution are translated.**
  ClothingAPI, ClothingDatabase and their items have no specs yet. Translating
  them was not needed to measure, and doing it would be scope I wasn't asked for.

- **Build still reads a whole JSON brief to learn a dependency's status.** That
  is about 560 tokens for `Login.json`. A status flag on `brief-lint` would
  remove it.

- **`translate.md` carries a `node -e` one-liner to read two preset entries.**
  It works with any agent that can run Node, but it is a command inside a
  procedure. A small script would be cleaner, at the cost of a fifth file in the
  copy lists.

- **The copy lists grew again.** `spec-lint.mjs` had to be added to
  `bin/coperativeai.mjs`, `package.json`, `commands.test.mjs`, the starter
  `AGENTS.md` and CI: five places for one file.

## 2026-10-27 — Lean AI layer, A–C: the push to 50%

### What I did
- **A: builds stop reading whole briefs.**
  - Item specs now copy the brief's `deliverable` and `depends-on` into their
    front matter, and `spec-lint` fails if either drifts from the brief.
  - `node tools/brief-lint.mjs --status <brief…>` prints one line per brief, so
    `/build` learns a dependency's status without reading the file.
  - Tests for both were written first and failed first: three for `--status`
    and four for the drift check.
- **B: one place for each rule.**
  - `translate.md` and the format document repeated the same rules and were read
    together on every translate, three times per item.
  - Each rule now lives once: the format holds the line grammar, the keys and
    the example; the procedure holds routing and steps.
- **C: `build.md` trimmed**, and the starter `AGENTS.md` lost two lines that
  repeated what the procedures say.
- **Kept two copies of one paragraph in step.** The emit procedure now writes the
  same "What this file cannot give you" paragraph as the starter `AGENTS.md`;
  they had drifted.
- **Lowered the token budgets** in `commands.test.mjs` to lock the gains in.
- **Measured** (characters ÷ 4):

  | Step | Before | After |
  |---|---|---|
  | always loaded | 1,340 | 825 |
  | translate project | 4,460 | 2,440 |
  | translate solution | — | 2,660 |
  | translate item | 4,050 | 2,300 |
  | build to plan | 11,100 | 2,330 |
  | **total** | **20,950** | **10,550** |

  That is **50% less**. Counting what `spec-lint --ready` and
  `brief-lint --status` print adds about 60 tokens, which makes it about 49.5%.

### What I could not do  (and what you would need to tell me)
- **The estimate cannot separate 49.5% from 50%.** Exact counts need the API's
  token-counting endpoint and your key.
- **QA scenarios 1–4 are still not run by a person** against a real agent.

### Debt I left behind
- **I broke spec-lint and caught it myself.** Renaming the format's heading to
  `## Keys: only these` left `spec-lint` with no keys. It failed loudly ("no key
  table"), which is the right failure, and now matches the word rather than the
  whole heading. No test pinned the heading's exact wording; one could.

- **`/build` still edits the brief to set `status: built`**, so the full round
  (not just the plan) still opens the brief once. The measurement stops at the
  plan, as the baseline did.

- **`brief-lint` now has two jobs:** checking deliverables, and reporting status.
  Both read the same front matter, but if it grows a third, it should be split.

## 2026-10-27 — Deliverable 2: QA sign-off

### What I did
- **QA has a track of its own, owned by a person.**
  - `_forms/qa-review.md` holds the six questions QA answers before work starts,
    one review per item, at `qa/<solution>/<item>.md`, with `status: happy` when
    QA is.
  - `qa/regression.md` is QA's suite: ID, what it proves, the item, manual or
    automated, steps, expected result, and where the automation lives.
  - `qa/signoff.md` is where QA signs a deliverable off.
  - `init` gives every new project the last two.
- **`/qa`, the AI's only way in, and only when QA asks.** It writes the
  automation (in the solution's repo, named after the test's ID, testing from
  the outside) and the manual scripts QA asked for, and runs the suite. Rules:
  - It plans first with the approval card.
  - Any app change a test needs is listed separately.
  - It never fixes a failure, in the test or the app.
  - It never writes in `signoff.md`.
  - It does not read the AI's item specs or the code map: it tests what the
    brief promised, not what was built.
- **Kept apart from the build.** `translate`, `build`, the starter `AGENTS.md`
  and emitted guardrails all say not to read `qa/`. `/build` now stops at the
  end of a deliverable *and waits for QA's sign-off*. `/pipeline` runs a
  solution's `regression` command on every PR, and the solution form gained that
  command.
- **Checked, in `brief-lint`.** It reads people's documents against the Project
  Brief, which these are, and putting the checks there avoided a fifth set of
  copy-list edits. It fails on:
  - two tests sharing an ID;
  - a kind that is neither manual nor automated;
  - a test of an item that does not exist;
  - automation that does not exist;
  - a review of a missing item;
  - a sign-off for a deliverable the brief does not list, or that nobody signed.

  It notes automated tests not automated yet, and says which deliverables are
  built and waiting on QA, or signed off and when. It leaves a project with no
  `qa/` alone. There are 12 tests, written first.
- **Docs:** a QA sign-off section in the README and `HOW-TO-USE.md`, `/qa` in
  every command list, seven commands where it said six, the layout in
  `template/README.md`, the reasoning in `procedures/README.md`, and scenario 7
  in `tools/QA.md`.
- **The token budgets held.** The new table rows pushed the starter `AGENTS.md`
  and `emit-guardrails.md` over. I trimmed them and moved two reasons to the
  README rather than raising the ceilings.

### What I could not do  (and what you would need to tell me)
- **I used my defaults on two open questions:**
  - QA signs off Product's deliverables rather than having deliverables of its
    own;
  - regression automation lives in each solution's repo, under
    `tests/regression/`.

  Either is a small change if you decide otherwise.
- **QA scenarios 1–7 have not been run by a person** against a real agent.
- **The example project has no QA review or regression rows.** Writing QA's
  answers for it would be me answering as QA. A person should write them, or
  tell me to draft them marked as drafted.

### Debt I left behind
- **The separation rule is written, not enforced.** Nothing stops an agent
  reading `qa/`. Real enforcement is not giving the builder access to the
  folder, which belongs in Swarm's per-agent permissions (already an open design
  item there).

- **`brief-lint` now does three jobs:** deliverables, status, and QA's documents.
  I said it should be split at a third. It still reads one set of documents
  against one brief, but the file is getting long. Splitting it would bring back
  the five-place copy-list problem, which is worth fixing first.

- **Regression tests are linked to items, not to the brief's acceptance checks.**
  A suite can't yet show that every check QA cares about has a test. That is gap
  6 (traceability) from the review.

- **Swarm's Test area should read `qa/`**, not keep a second copy of the suite.
  That work belongs in the Swarm repository.

## 2026-10-27 — One copy list

### What I did
- **`init` copies what `package.json` publishes, and nothing else.**
  `bin/layout.mjs` derives the copy list from `files`:
  - `template/<path>` lands at `<path>`;
  - `template/<name>.template.md` lands at `<name>.md`;
  - `.claude/` and `tools/` land where they are;
  - the CLI and docs are published but not copied.

  The two lists that had to be kept in step are now one. The derived list
  matched the old one exactly, plus the new runner.
- **`tools/check.mjs` runs every `*-lint.mjs` beside it.** All of them, always:
  a failure does not stop the rest. `package.json` publishes `tools/*-lint.mjs`.
  `npm run check`, CI, the starter `AGENTS.md`, the CLI's next steps and the
  docs name that one command. Two tests, written first, give it a check no list
  names and a failing check followed by a passing one.
- **Adding a check is now adding a file.** It used to mean five edits. The
  fresh-project test finds the checks by file name rather than from a list, and
  a mutation check confirmed it fails ("tools/brief-lint.mjs is missing from a
  fresh project") when `package.json` stops publishing them.

### What I could not do  (and what you would need to tell me)
- **CI still runs `round-record-lint` a second time**, with `--since`, because
  only it can ask "did this change bring a record?", and that needs the pull
  request's base. One special case, said so in the workflow.

### Debt I left behind
- **Splitting `brief-lint` is now cheap**, but not done: it wasn't asked for. A
  new `qa-lint.mjs` would run everywhere with no other edits.

- **The `*-lint.mjs` naming is now load-bearing.** A check named anything else
  silently doesn't run. This is written in `check.mjs` and `AGENTS.md`, not
  enforced. A test that every `.mjs` in `tools/` is either a check, a test,
  `check.mjs` or listed as a helper would close it.

## 2026-10-27 — Gap 7: `coperativeai update`

### What I did
- **`coperativeai update [folder] [--dry-run]`** brings framework fixes into a
  project that already ran `init`, without losing anybody's work:
  - a missing file is added;
  - a framework file nobody changed is replaced;
  - an edited one is kept, with the new version beside it as `<file>.update`;
  - a file people fill in (the Project Brief, `AGENTS.md`, QA's suite and
    sign-off) is never touched once it differs from the blank form;
  - a file the framework dropped is reported, never deleted;
  - specs in the old format get the `/translate` steps that bring them up to
    date.
- **Ownership comes from where a file comes from in the template** (`ownerOf`
  in `bin/layout.mjs`), so there is no list to keep.
- **`.coperativeai.json`**, written by `init` and `update`, records a
  fingerprint of every file as installed. Fingerprints normalise line endings,
  so a Windows checkout is not mistaken for an edit.
- **Projects from before the record are recognised too.**
  `bin/known-versions.json` holds a fingerprint of every committed version of
  every file a project receives (167 versions of 38 files). It is generated by
  `tools/known-versions.mjs` from git history in under four seconds, and
  regenerated on every publish (`prepublishOnly`). A test checks the committed
  list against the history.
- **The starter `AGENTS.md` is replaced when its own header says it may be.**
  One written from the project's spec is left alone, with a pointer to
  `/emit-guardrails`.
- **Tests first:** 14 for `update` and the install record, each from the side
  of the person who owns the file. Checked for real against a project made by
  the CLI as it was this morning (commit `444f2f5`): 7 added, 12 updated, the one
  procedure I edited kept with a `.update`, the answered brief untouched, the
  old-format specs spotted; a second run changed nothing.
- **Docs:** README, INSTALL, HOW-TO-USE, the repo's `AGENTS.md`, and QA
  scenario 8.

### What I could not do  (and what you would need to tell me)
- **Old-format specs are reported, not converted.** Re-translating needs an AI,
  so `update` prints the steps.
- **Untested against Swarm**, the one real project built with the framework.
  Running `coperativeai update --dry-run` there would show what it would do,
  but that is another repository.

### Debt I left behind
- **`.update` files are left for a person to resolve.** Nothing lists the ones
  still lying around. A note from `check.mjs` would.

- **An edited file is reported as "kept yours" on every run**, and its `.update`
  is rewritten each time. That is a fair reminder, but noisy if a team keeps a
  procedure edited for good. A way to say "this one is ours now" would quiet it.

- **The version list is generated from this repository's history.** Copies of
  the framework that never went through it (a fork, or a hand-copied
  `template/`) are treated as edited. That is safe, but noisy for them.
