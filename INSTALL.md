# Install

Two things live in this repository, and **only one of them needs installing**.

- **The framework** — the forms and the four commands. **One command and no
  download**, because it is Markdown, JSON and prompts:

  ```bash
  npx github:PeterPartridge/CooperativeAICoding init
  ```

  It runs wherever Claude Code runs — Windows, macOS, Linux alike. More at
  [Framework only](#framework-only-no-download) below.
- **CoperativeAI, the desktop app** — the Product / Develop / Test / Admin
  workspace built *with* the framework. This is the part with binaries, and the
  rest of this page is how to get it.

If you arrived from the docs wanting to try the way of working rather than the
app, the framework is the half you want, and it costs you a `git clone`.

---

## Download the app

Every release carries **six assets, built from one commit by the same
pipeline** ([`release.yml`](.github/workflows/release.yml)) — the Windows and
Linux builds are never a version apart.

| Platform | Asset | What it is |
|---|---|---|
| Windows | `CoperativeAI_<version>_x64_en-US.msi` | The installer most people want (~18 MB). |
| Windows | `CoperativeAI_<version>_x64-setup.exe` | NSIS installer — same app, smaller download (~13 MB). |
| Windows | `coperativeai.exe` (lower case — it is named after the crate, not the product) | Portable, ~47 MB. No installer; run it where it lands. |
| Linux | `*_amd64.deb` | Debian, Ubuntu, Mint and derivatives (~19 MB). |
| Linux | `*.x86_64.rpm` | Fedora, RHEL, openSUSE (~19 MB). |
| Linux | `*.AppImage` | Any distribution, nothing installed (~91 MB — it carries what the packages ask your package manager for). |

**[→ Latest release](https://github.com/PeterPartridge/CooperativeAICoding/releases/latest)**

**x86-64 only, and no macOS build.** Neither is a technical wall — Tauri
targets both — but no machine here has ever produced one, and an untested
binary is worse than a missing one. Said here rather than left to be discovered
on the releases page.

**Nothing is signed.** Windows SmartScreen will warn about the installers and
the portable binary, and it is right to: the certificate that would silence it
is not something this project has. The honest check is the one you can actually
make — every asset is built in public from a named commit, and the run that
produced it is linked from the release.

---

## Windows

1. Download the `.msi` (or the `-setup.exe` — either is fine; the `.msi` is the
   conventional one).
2. Run it. On the SmartScreen warning: **More info → Run anyway**.
3. Launch **CoperativeAI** from the Start menu.

**Portable instead:** download `coperativeai.exe`, put it anywhere, run it.
Be aware that portable means "no installer", **not** "no footprint" — it reads
and writes the same per-user data folder as an installed copy
(`%APPDATA%\com.coperativeai.app`), so the two share one database rather than
living separate lives.

---

## Linux

```bash
# Debian / Ubuntu
sudo apt install ./CoperativeAI_*_amd64.deb

# Fedora / RHEL / openSUSE
sudo dnf install ./CoperativeAI-*.x86_64.rpm

# Anywhere — nothing installed
chmod +x CoperativeAI_*.AppImage
./CoperativeAI_*.AppImage
```

Two things are worth knowing before you pick:

- **The app renders in a web view, so it needs WebKitGTK 4.1 and GTK 3.** The
  `.deb` and `.rpm` declare that, so your package manager installs it for you —
  and, on a distribution that does not package WebKitGTK **4.1**, refuses the
  install rather than giving you an app that opens to a blank window. The
  AppImage declares nothing, so on a minimal system it is the one that fails
  confusingly. Prefer the packages; reach for the AppImage when you cannot
  install.
- **API keys go to the system keyring**, over secret-service. That means a
  keyring daemon must be running (GNOME Keyring, KWallet) or saving a key will
  fail — on a bare window manager, this is the thing that catches people out.

Your data lives in `~/.local/share/com.coperativeai.app/`. Setting
`COPERATIVEAI_DATA_DIR` moves it, on every platform.

---

## What the app still needs after installing

It is a workspace for agents; it does not ship one. In **Admin** you point it at:

- **An AI provider** — an Anthropic API key, a local [Ollama](https://ollama.com)
  (no key, no cost), or the **Claude Code** CLI if you already subscribe. The
  subscription route deliberately records **no spend**, because the app cannot
  see what a subscription costs and will not print a number it cannot source.
- **Somewhere for agents to run**, if you want them bounded — a WSL
  distribution the app creates and owns, or a container per run. The
  **where agents run** table says what this machine can actually offer, which
  verdicts are *enforced* by the operating system, and which are merely
  *asked* for. Where it cannot prove containment it says so instead of showing
  you a padlock.

There are no accounts and no server of its own: the app talks to the provider
you configure and to the repositories and policies you point it at, and
nothing else.

---

## Build it from source

Needed: **Node 24** ([`.nvmrc`](app/CoperativeAI/.nvmrc)) and the Rust in
[`rust-toolchain.toml`](rust-toolchain.toml) — `rustup` reads that file and
installs the right one, so don't pick a version yourself.

```bash
git clone https://github.com/PeterPartridge/CooperativeAICoding
cd CooperativeAICoding/app/CoperativeAI
npm ci                 # on Linux, see the note below
npx tauri dev          # run it
npx tauri build        # or produce the installers/packages for this platform
```

On **Linux** you also need Tauri's build dependencies present:

```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev libxdo-dev libssl-dev \
  libdbus-1-dev patchelf build-essential file
```

…and `npm ci` will refuse the lockfile. `package.json` pins the **Windows**
native binaries for rollup and the Tauri CLI — itself a workaround for
[npm/cli#4828](https://github.com/npm/cli/issues/4828), without which npm
installs neither platform's binary and the build dies on a missing module. So
on Linux: drop those two pins, add their `-linux-x64-gnu` equivalents, delete
`package-lock.json`, and `npm install` to resolve fresh. The Linux job in
[`release.yml`](.github/workflows/release.yml) does exactly that and is the
authoritative copy of the steps — read it there rather than trusting this
paragraph to have kept up.

The gates the pipeline runs, if you want them locally:

```bash
cargo clippy --manifest-path app/CoperativeAI/src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test  --manifest-path app/CoperativeAI/src-tauri/Cargo.toml
cd app/CoperativeAI && npx tsc --noEmit && npm test
```

---

## Framework only (no download)

The way of working needs no binary at all — one command, and
[Claude Code](https://claude.com/claude-code):

```bash
cd my-project
npx github:PeterPartridge/CooperativeAICoding init
claude
```

**What the two halves actually give you**, since the difference is easy to miss:

| | `npx … init` | The desktop app |
|---|---|---|
| What arrives | the brief, the blank forms, four commands, two checks | all of that, plus a product around it |
| Where the work happens | your editor and Claude Code | a board, a code editor and a real terminal, in four environments |
| The AI's declared debt | written into the spec, for you to read | filed as work items and questions somebody owns |
| Repositories | whatever you point it at | several registered at once, switchable |
| Cost and models | whatever your agent charges you | model and effort per work item, and what each run spent |
| Runs agents | your own machine, your own rules | on this machine, in a Linux distribution it owns, or a container per run |
| Costs | nothing, and no install | nothing, and a download |

Then fill in `Project_brief.md` in plain English, and follow
[`HOW-TO-USE.md`](HOW-TO-USE.md). The slash commands (`/translate`,
`/new-item`, `/build`, `/pipeline`) are checked into this repository — in
[`.claude/commands/`](.claude/commands/), with the longer skills they call in
[`.claude/skills/`](.claude/skills/) — so they exist the moment Claude Code
starts from this folder, and travel with a copy of it. Nothing in that path is
platform-specific.

[`example/`](example/) is a worked project to read before you write your own,
and [`application/`](application/) is this repository's real one — the
framework specifying the desktop app above.
