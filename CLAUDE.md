# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Commit style

- Do NOT add `Co-Authored-By: Claude...` lines to commit messages.
- Do NOT add "Generated with Claude Code" (or similar) footers to commits, merge
  requests, or PR descriptions.
- Small, descriptive commits. Prefix with the area touched: `content:`, `config:`,
  `style:`, `ci:`, `docs:`, `chore:`, `fix:`.

## Main branch

- The main/default branch is `main`.
- `gh-pages` is **generated output**, written only by the deploy workflow. Never
  commit to it by hand and never edit it — anything you put there is destroyed on
  the next build.

## Push policy

- Do not push to the remote without asking first.

## Instruction precedence

This `CLAUDE.md` is the single source of truth for Claude in this repository.

If other agent-guidance files exist here and they conflict with this file or
describe a different project, prefer this file. Do **not** import architecture,
stack, or workflow assumptions from unrelated copied instructions — in
particular, this repo is **not** `eit-data` and is not a research-data repo,
even though it describes the same research.

---

## What this repo is

`jung0221.github.io` is the **personal academic website** of Jungeui Choi,
served at <https://jung0221.github.io>. It is a **Jekyll** site built on the
**al-folio** theme.

It is a static site. There is no React, no Next.js, no TypeScript, no npm build
step, and no `/components/ui`. Requests that assume a React/shadcn stack cannot
be satisfied by copying components in — port the behaviour to vanilla
CSS/JS instead, or say why it is not possible.

### The stack, concretely

- **Jekyll 4** with the theme split across gems: `al_folio_core` plus `al_*`
  plugin gems (`al_folio_cv`, `al_math`, `al_search`, `al_img_tools`, ...).
  As of al-folio 1.0.15 the theme is **not** a single `_layouts`/`_includes`
  tree in this repo — it lives in `vendor/bundle/ruby/3.2.0/gems/`.
- **jekyll-scholar** renders publications from `_bibliography/papers.bib`.
- Gems are installed **locally, without sudo**: `.bundle/config` sets
  `path: vendor/bundle`.

### Overriding the theme

Jekyll resolves `_includes`, `_layouts` and `_sass` from the site root **before**
the theme gems. So to change a theme file, copy it from
`vendor/bundle/ruby/3.2.0/gems/<gem>-<version>/` into the same relative path here
and edit the copy.

**A fork is a maintenance cost.** Before forking a theme file, check whether a
`_config.yml` flag or a data file already does the job. When you must fork,
prefer forking the smallest file that gives you the hook, and put a comment at
the top saying which gem/version it came from and what was changed — otherwise
the next theme upgrade silently reverts or conflicts with the customisation.

Current forks live in `_includes/` and `_layouts/`; each carries that header.

---

## Local development

```bash
export PATH="$HOME/.local/share/gem/ruby/3.2.0/bin:$PATH"
bundle exec jekyll serve --livereload      # http://127.0.0.1:4000
bundle exec jekyll build                   # one-shot, into _site/
```

Use `JEKYLL_ENV=production bundle exec jekyll build` when checking anything that
only happens in production — HTML/CSS minification in particular. A change that
looks fine under `serve` can still break minified.

`_site/`, `.jekyll-cache/`, `vendor/` and `.bundle/` are build artifacts. Never
commit them.

---

## Deployment

`.github/workflows/deploy.yml` builds the site and pushes `_site/` to the
`gh-pages` branch with `JamesIves/github-pages-deploy-action`.

**This indirection is mandatory, not a preference.** GitHub Pages' own native
Jekyll build only allows a fixed allow-list of plugins, and `jekyll-scholar` and
the `al_*` gems are not on it. If Pages is ever switched to "Deploy from a
branch → main", the build fails with `The al_folio_core theme could not be
found`. The Pages source must stay **`gh-pages` / `/ (root)`**.

Two things in that workflow look removable and are not:

- **No `paths:` filter on the push trigger.** Upstream ships one; it silently
  skipped the very first push here, which reads exactly like a broken workflow.
- **`touch _site/.nojekyll`.** Pages runs its own legacy Jekyll pass over
  `gh-pages`; without this file it re-processes the already-built site and drops
  every path beginning with `_`.

The repository is **public**, and must stay public: the account is on GitHub
Free, where Pages is only available on public repositories.

---

## Content model — one source of truth per thing

| Thing | Lives in | Do not duplicate it in |
| --- | --- | --- |
| Publications | `_bibliography/papers.bib` | `_data/cv.yml`, any page |
| CV (English) | `_data/cv.yml` | `_pages/cv.md` |
| CV (Portuguese) | `_data/cv_pt.yml` | — |
| UI strings, nav labels | `_data/i18n.yml` | layouts, includes |
| Social/profile links | `_data/socials.yml` | `_config.yml` |
| Venue tags and colours | `_data/venues.yml` | `papers.bib` |

`_data/cv.yml` deliberately has **no Publications section** — `papers.bib` is the
only place a publication is recorded. Do not "helpfully" add one.

### Editing `papers.bib`

Two traps, both of which have already bitten this repo once:

1. **`%` is not a comment inside a BibTeX entry.** It is only a comment
   *between* entries. A `%` note placed inside `@article{...}` produces
   `unexpected token` lexer warnings and silently corrupts the field. Put notes
   on their own line above the `@`.
2. **Do not link to `/assets/bibliography/papers.bib`** — Jekyll never publishes
   that path, so the link 404s. Use `bibtex_show = {true}` on the entry instead;
   that is al-folio's own per-entry BibTeX popup.

---

## Bilingual content (EN / PT-BR)

The site is **English-first** with a Portuguese mirror. Translation is done with
real pages at real URLs, not client-side text swapping, so both languages are
crawlable and work without JavaScript.

- Every page carries `lang: en` or `lang: pt`, plus a `ref:` slug.
- The language switcher pairs pages by matching `ref` across languages. **A page
  without a `ref` gets no switcher**, and a `ref` that exists in only one
  language silently drops the button.
- English pages live at `/`, `/research/`, ...; Portuguese at `/pt/`,
  `/pt/research/`, ....
- UI strings (nav labels, button titles, section headings) come from
  `_data/i18n.yml`, keyed by language. Never hardcode a user-visible English
  string in a layout or include.

**When you add a page, add both languages or neither.** A half-translated site
is worse than a monolingual one, because the switcher leads to a 404.

---

## Working rules

### 1. Never invent facts

Publications, dates, venues, grant numbers, awards and affiliations are real
claims about a real person's academic record. If the information is not in the
repo or in a source you have actually read, write a `TODO` marker — do not
guess, and do not infer a venue from a sibling entry.

The open `TODO`s are listed at the end of `HOWTO.md`. They are the user's to
fill, not yours.

### 2. Figures are capped at 1400px

`assets/img/` is served through `jekyll-imagemagick`, which generates responsive
WebP at 480/800/1400 widths. Anything wider than 1400px is wasted bytes in the
repo forever. Downscale before committing:

```bash
convert in.png -resize '1400x1400>' -strip -quality 88 assets/img/research/out.jpg
```

Do not commit videos, raw CT volumes, meshes, or multi-megabyte PDFs. The only
PDFs that belong here are the CV and open-access papers the author may
legitimately self-host — check the licence before adding one.

### 3. Keep `baseurl` empty

This is a **user page** (`<user>.github.io`), not a project page. `baseurl: ""`
in `_config.yml` is correct; setting it breaks every link on the site.

### 4. Prefer configuration to forking, and data to markup

Most of what looks like it needs a code change is a `_config.yml` flag or a
`_data/*.yml` entry. Check `_config.yml` first — it is long and heavily
commented.

### 5. Respect the licence boundary

The theme is MIT (see `LICENSE`); the author's own text, figures and CV are not.
Do not push research content here that belongs to a private repo — in
particular nothing from `eit-data/papers/review_papers/` (confidential peer
review) and nothing from `docs_fapesp/` (personal records).

---

## Where to look first

- **"How do I add a publication / figure / deploy?"** → `HOWTO.md`. It is the
  user-facing companion to this file; keep the two consistent.
- **Site behaviour flags** → `_config.yml`.
- **A theme file you want to change** → find it under
  `vendor/bundle/ruby/3.2.0/gems/al_folio_core-*/`, then copy it to the site root.
- **Why the deploy is shaped this way** → the header comment in
  `.github/workflows/deploy.yml`.

## Avoid

- Adding `Co-Authored-By` or "Generated with" footers.
- Pushing without asking.
- Committing `_site/`, `vendor/`, or `.jekyll-cache/`.
- Switching the Pages source to `main`, or adding a `paths:` filter to the
  deploy workflow, or dropping `.nojekyll`.
- Making the repository private (Pages would go offline on GitHub Free).
- Recording a publication anywhere other than `papers.bib`.
- Hardcoding user-visible English strings in layouts instead of `_data/i18n.yml`.
- Assuming this repo has a JavaScript build step, a React tree, or Tailwind
  config of its own.
