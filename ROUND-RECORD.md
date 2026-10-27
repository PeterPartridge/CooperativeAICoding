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
