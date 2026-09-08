# Mohit Pal — Portfolio

One-page, scroll-driven portfolio. Static HTML/CSS/JS, no build step.
Motion is powered by [GSAP](https://gsap.com) + ScrollTrigger and [Lenis](https://lenis.darkroom.engineering) (loaded from CDN).

## Résumé

The hero's "Download my resume" button serves `Mohit_Pal_Resume.pdf` from the project root.
To update it, replace that file (keep the same name) and push.

## Contact links

Email, phone, GitHub and LinkedIn are set in `index.html` (contact section) and `js/main.js` (`SITE.linkedin`).

The hero photo is `assets/profile.jpg` (a copy of `assets/WhatsApp Image 2026-07-11 at 10.30.56 PM.jpg`,
which is no longer referenced and can be deleted). It is shown whole inside a white circle.
To swap the photo later, replace `assets/profile.jpg` with any portrait-orientation photo.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy to Vercel

**Option A: Vercel dashboard**
1. Push this folder to a GitHub repo.
2. In Vercel, click **Add New → Project**, import the repo.
3. Framework preset: **Other**. Leave build command and output directory empty. Click **Deploy**.

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel          # first deploy (preview)
vercel --prod   # production
```

## Editing content

| What | Where |
|------|-------|
| Name, tagline, hero badges | `index.html` → `<section id="hero">` |
| Summary paragraph + terminal lines | `index.html` → `#about`, `js/main.js` → `initTerminal()` |
| Skill cards | `index.html` → `#skills` |
| Experience entries | `index.html` → `#experience` |
| Project panels (short version) | `index.html` → `#projects` |
| Full case studies (modal) | `index.html` → `<template id="case-…">` near the bottom |
| Certificates + links | `index.html` → `#certifications` |
| Colours / fonts | `css/style.css` → `:root` |

## Structure

```
index.html        page content
css/style.css     design system + layout + responsive rules
js/main.js        animations (preloader, cursor, canvas, marquee, horizontal scroll, modal…)
assets/           profile.png (you add), favicon.svg
vercel.json       headers + clean URLs
```
