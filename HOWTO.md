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

## Update the CV

Two files, kept in sync by hand:

| What | Where |
|---|---|
| The rendered `/cv/` page | `_data/cv.yml` |
| The downloadable PDF | `assets/pdf/jungeui_choi_cv.pdf` |

The PDF is built from `~/Documents/resume/general_template`:

```bash
cd ~/Documents/resume/general_template && latexmk -pdf main.tex
cp main.pdf ~/Documents/jung0221.github.io/assets/pdf/jungeui_choi_cv.pdf
```

An empty `end_date: ""` renders as *Present*. Publications are **not** in
`cv.yml` on purpose — they would then need updating in two places.

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

### One-time repository setup

Not yet done — the repo `jung0221/jung0221.github.io` does not exist.

1. Create it, **public**, named exactly `jung0221.github.io`, with no README,
   `.gitignore` or licence.
2. `git remote add origin git@github.com:jung0221/jung0221.github.io.git`
   then `git push -u origin main`.
3. **Settings → Actions → General → Workflow permissions** → select
   **Read and write permissions** → Save.
   Without this the deploy step cannot push to `gh-pages` and fails with a 403.
4. Wait for the first run to go green. It creates the `gh-pages` branch.
5. **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **`gh-pages`**, folder **`/ (root)`** → Save

   The `gh-pages` branch does not exist before step 4, so this option is not
   selectable until then.

The site appears at `https://jung0221.github.io` a minute or so later.

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
- `_pages/about.md` — `prof_pic.jpg` is still the theme placeholder
- `_bibliography/papers.bib` — confirm the IFAC 2026 venue city
- `_pages/contact.md` — lab page URL
- `_data/cv.yml` — spoken languages section

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
