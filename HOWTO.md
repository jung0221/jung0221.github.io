# HOWTO

Personal academic site — [jung0221.github.io](https://jung0221.github.io).
Jekyll + [al-folio](https://github.com/alshedivat/al-folio).

---

## Run it locally

Bundler lives in your user gem dir, so put it on `PATH` first:

```bash
export PATH="$HOME/.local/share/gem/ruby/3.2.0/bin:$PATH"
cd ~/Documents/jung0221.github.io
bundle exec jekyll serve --livereload
```

Open <http://localhost:4000>. Edits to `_pages/`, `_data/` and `_bibliography/`
reload automatically; **changes to `_config.yml` need a restart.**

Add the `export PATH=...` line to your `~/.bashrc` to skip the first step.

First-time setup on a new machine:

```bash
sudo apt install ruby-dev build-essential imagemagick
gem install --user-install bundler
bundle config set --local path 'vendor/bundle'
bundle install
```

---

## Add a publication

Edit **`_bibliography/papers.bib`** — that is the only place. The Publications
page and the "selected publications" block on the home page both render from it.

```bibtex
@article{choi2027something,
  abbr        = {JOURNAL},        % short tag in the left margin
  bibtex_show = {true},           % adds the "BibTeX" button
  title       = {Title of the paper},
  author      = {Choi, Jungeui and Tsuzuki, Marcos S. G.},
  journal     = {Journal Name},
  year        = {2027},
  doi         = {10.xxxx/yyyy},
  selected    = {true},           % also pin it to the home page
  abstract    = {...},
}
```

Optional fields, each of which adds a button: `pdf`, `html`, `code`, `slides`,
`poster`, `video`, `award`, `preview`.

- `pdf = {file.pdf}` looks in `assets/pdf/`. A full URL also works.
- `preview = {image.png}` looks in `assets/img/publication_preview/`.

Your name is bolded automatically — `_config.yml` keys `scholar.last_name` /
`scholar.first_name` on *Choi* / *Jungeui, J.*

### Two BibTeX traps

1. **`%` is not a comment inside an entry.** BibTeX only treats `%` as a comment
   *between* entries. Put notes above `@article{...}`, never inside it, or the
   build logs a lexer warning and the entry may be mangled.
2. **Only self-host a PDF you have the right to.** `choi2026_lunas.pdf` is here
   because that article is CC BY. The IEEE and IFAC papers are linked by
   DOI/venue instead.

---

## Add a figure

1. Put the image in `assets/img/research/` (or anywhere under `assets/img/`).
2. Cap it at **1400 px** on the long side — that is the largest responsive
   variant the theme generates, so anything bigger is never served:
   ```bash
   convert big.png -resize '1400x1400>' -strip assets/img/research/fig_name.png
   ```
3. Reference it in a page:
   ```liquid
   {% include figure.liquid
      path="assets/img/research/fig_name.png"
      class="img-fluid rounded z-depth-1"
      caption="What the figure shows."
   %}
   ```

`.webp` variants at 480/800/1400 px are generated automatically at build time by
ImageMagick — do not commit them, they are gitignored. SVG is passed through
untouched and is the better choice for diagrams.

Two figures side by side:

```liquid
<div class="row">
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/research/a.png" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/research/b.png" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
<div class="caption">Shared caption.</div>
```

---

## Write equations

MathJax is on (`enable_math: true`). In any page:

- inline: `$$E = mc^2$$`
- display: put `$$ ... $$` on its own lines

---

## Add or edit a page in both languages

The site is **English-first with a Portuguese mirror**, using real pages at real
URLs (`/research/` and `/pt/research/`) rather than swapping text with
JavaScript — so both versions are crawlable and work with scripting off.

Every page carries two extra front-matter keys:

```yaml
lang: en # or: pt
ref: research # the SAME slug in both languages — this is what pairs them
```

The `ref` is the whole mechanism. The navigation shows only pages whose `lang`
matches the current page, and the language button links to the page with the
same `ref` in the other language. **If a `ref` exists in only one language the
button silently disappears on that page**, which is the intended failure mode —
better a missing button than a link to a 404.

So to add a page:

1. `_pages/thing.md` — `lang: en`, `ref: thing`, `permalink: /thing/`
2. `_pages/thing.pt.md` — `lang: pt`, `ref: thing`, `permalink: /pt/thing/`
3. Both need `nav: true` and the **same** `nav_order`.
4. Give it an icon and a colour in `_data/nav_style.yml`, keyed by the `ref`:

   ```yaml
   thing:
     icon: fa-solid fa-flask # any Font Awesome 6 free solid icon
     tint: "14, 154, 167" # r, g, b — light mode
     tint_dark: "64, 208, 216" # r, g, b — dark mode
   ```

   Without an entry the page still appears, just with no icon and the default
   cobalt glow.

Interface strings — button tooltips, CV section headings — live in
`_data/i18n.yml`, keyed by language. Never hardcode a visible English string in
a layout or include.

---

## Update the CV

Three files, kept in sync by hand:

| What | Where |
|---|---|
| The rendered `/cv/` page | `_data/cv.yml` |
| The rendered `/pt/cv/` page | `_data/cv_pt.yml` |
| The downloadable PDF | `assets/pdf/jungeui_choi_cv.pdf` |

In `cv_pt.yml` the **section keys stay in English** (`Education`, `Experience`,
…). The renderer dispatches on them to choose a per-section template; the
displayed headings are translated in `_data/i18n.yml`. Translating a key does
not fail the build — it drops the section into the generic branch, which renders
it wrong, quietly.

The PDF is built from `~/Documents/resume/general_template`:

```bash
cd ~/Documents/resume/general_template && latexmk -pdf main.tex
cp main.pdf ~/Documents/jung0221.github.io/assets/pdf/jungeui_choi_cv.pdf
```

An empty `end_date: ""` renders as *Present* (*Atual* in Portuguese). Give it any
other value and the entry sorts to the bottom, because the sorter only treats an
empty or `present`-like end date as ongoing.

Publications are **not** in `cv.yml` on purpose — they would then need updating
in two places.

---

## The look: gradient, menu, dark mode

**Dark mode** was already part of al-folio (`enable_darkmode: true`). The
sun/moon button in the menu cycles system → dark → light and remembers the
choice.

**The gradient** is the 21st.dev "Ocean Ripple" preset — Foam `#EAF7FB`, Sky
blue `#7FC6E6`, Cobalt `#2E7CC0`, Navy `#123A6B` — rendered as a band across the
top of every page:

| File | Does what |
|---|---|
| `assets/js/ocean-ripple.js` | draws the stripe field on a `<canvas>` |
| `assets/css/ocean.scss` | the band, the palette, the menu, the CSS fallback |

It paints once (the preset is `animated: false`) and then costs nothing.
Three knobs in `ocean.scss`, all custom properties:

| Property | Effect |
|---|---|
| `--ocean-hero-height` | band height (the home page overrides it via `ocean-hero-tall`) |
| `--ocean-hero-alpha` | how strong the wash is; lower in dark mode |
| `--ocean-hero-mask` | where it starts fading out |

The band is a **wash**, not a picture. At full strength the Navy end is a dark
slab against the right edge of a centred text column and reads as a stain.

The wave amplitude is aspect-corrected in `ocean-ripple.js`. The preset states
the swing in *along* units while the period is in *cross* units, which are the
same length only on a square canvas; on a 1900×150 band the raw numbers give a
62 px period with an 80 px swing, so every colour boundary becomes a horizontal
streak and the whole field reads as one giant chevron.

To turn the drift on, add `data-animated="true"` to the canvas in
`_layouts/default.liquid` — it stays off under `prefers-reduced-motion`
regardless.

The `background-image` on `.ocean-hero` is the preset's own CSS approximation,
kept as the no-JavaScript fallback. It is exact wherever `wave` is zero; the
canvas exists to add the bend.

**The menu** is a port of a React/framer-motion component to plain CSS — the
pill, the hover aura, the per-item 3D flip and the active-item glow are all
`:hover` and `.active` rules, so there is no JavaScript and no build step. The
pill is deliberately **opaque**: the original component is translucent, which
over a gradient picks up whatever is behind it and turns grey.
Per-item colours come from `_data/nav_style.yml` as `r, g, b` triples, which is
what lets one declaration feed the glow, the hover glow and the icon colour.

Between 576 px and 991 px the labels drop and the icons carry the meaning —
five labelled items plus three buttons do not fit a 930 px container.

---

## Deploy

```bash
git add -A
git commit -m "..."
git push
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
and pushes the result to the `gh-pages` branch. Watch it under the repo's
**Actions** tab; a run takes about two minutes.

The build has to happen in the Action rather than in GitHub Pages' own build,
because the site uses `jekyll-scholar` to render `papers.bib` and Pages' native
build only permits a fixed allow-list of plugins that excludes it.

You can also trigger a rebuild by hand: **Actions → Deploy site → Run workflow**.

### Repository setup — done, but do not undo it

These are already configured. They are recorded because each one silently breaks
the site if changed:

- **Settings → Pages → Source**: *Deploy from a branch*, branch **`gh-pages`**,
  folder **`/ (root)`**. Pointing this at `main` makes Pages run its own Jekyll,
  which cannot load `jekyll-scholar` or the `al_folio_*` gems and fails with
  *"The al_folio_core theme could not be found"*.
- **Settings → Actions → General → Workflow permissions**: *Read and write*.
  Without it the deploy step gets a 403 pushing to `gh-pages`.
- The repository is **public**. The account is on **GitHub Free**, where Pages
  only works on public repositories — making it private takes the site offline.
  (Pro, at $4/month, would allow a private repo.)

Never edit the `gh-pages` branch by hand; every build overwrites it.

---

## Known issues

- The JSON-LD `sameAs` array contains one `null`. This is an upstream al-folio
  bug: its metadata template pushes `social[1].url` for any key it does not
  recognise, and `cv_pdf` — a key the theme itself requires in
  `_data/socials.yml` — is not recognised. Cosmetic; fixing it would mean
  forking a 250-line theme include that would then drift on every upgrade.

## Open TODOs

Search the repo for `TODO` to find them all:

- `_data/socials.yml` — ORCID, Lattes and Google Scholar IDs are commented out
- `_bibliography/papers.bib` — confirm the IFAC 2026 venue city
- `_pages/contact.md` / `contact.pt.md` — lab page URL
- `_data/cv.yml` / `cv_pt.yml` — spoken languages section
- `_pages/research.md` / `research.pt.md` — EMBC 2025 reconstruction figures
- The CV PDF exists in English only; `/pt/cv/` links to it and says so

---

## Upgrading the theme

This repo has its own history; it is not a fork. To pull in upstream changes,
diff against al-folio by hand:

```bash
git clone --depth 1 https://github.com/alshedivat/al-folio /tmp/al-folio
diff -ru /tmp/al-folio/_config.yml _config.yml | less
```

Most of the theme lives in the `al_folio_core` gem, so routine updates are just
a version bump in `Gemfile` followed by `bundle update`.

**Four theme files are overridden locally.** Jekyll resolves the site root
before the gems, so these copies win — and they will *not* pick up upstream
changes. After a `bundle update`, diff each against its gem original and
re-apply anything worth taking:

| Local file | Why it is forked |
|---|---|
| `_layouts/default.liquid` | per-page `lang`, hreflang alternates, gradient mount |
| `_layouts/about.liquid` | language-aware "selected publications" heading and link |
| `_includes/header.liquid` | the glow menu, language-filtered nav, language button |
| `_includes/cv/render.liquid` | picks `cv.yml` vs `cv_pt.yml`, translated headings |

Each one names its source gem and version in a comment at the top:

```bash
diff -u vendor/bundle/ruby/3.2.0/gems/al_folio_core-1.0.15/_includes/header.liquid \
        _includes/header.liquid
```
