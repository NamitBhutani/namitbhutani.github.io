# namitbhutani.github.io

Astro site. All content (bio facts, news, publications, research, experience, projects)
lives in `src/data/profile.ts`; the homepage and the paper page (`/photoelasticity`) read
from it. The CV is a separate LaTeX PDF (see below).

## Run locally

    nix-shell            # or: direnv allow
    bun install
    bun run dev          # http://localhost:4321

## Common edits

- **Photo:** save a square headshot as `public/headshot.jpg` (about 600×600). It appears in
  the hero automatically; no code change needed.
- **Google Scholar:** paste your profile URL into `profile.scholar` in `src/data/profile.ts`.
- **AI & Law paper link:** add `{ label: "Springer", href: "https://doi.org/..." }` to its
  `links` array in `src/data/profile.ts`.
- **CV PDF:** the CV is LaTeX, source `~/life-sort/practice-school/cv_academic.tex`
  (black and white, one page). Rebuild and copy:

      ~/life-sort/practice-school/build.sh cv_academic.tex
      cp ~/life-sort/practice-school/cv_academic.pdf public/Namit_Bhutani_CV.pdf
      cp public/Namit_Bhutani_CV.pdf public/Resume.pdf   # keeps old /Resume.pdf links working

  `/cv` redirects to the PDF (see `astro.config.mjs`).

Pushing to `main` deploys via GitHub Actions (`.github/workflows/deploy.yml`).
