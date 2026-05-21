# ZnnnnnH2.github.io

This repository is being rebuilt as an Astro-powered personal blog.

Public site:

- <https://ZnnnnnH2.github.io>

## New architecture

The new source structure is:

- `src/content/blog/` — Markdown posts managed by Astro content collections.
- `src/pages/` — route pages such as homepage, archive, tags, and post detail pages.
- `src/layouts/` — shared layout templates.
- `src/styles/global.css` — the custom dark academic theme.
- `tools/extract-legacy-posts.mjs` — migration script that extracts legacy generated HTML posts into Markdown.
- `.github/workflows/deploy.yml` — GitHub Pages deployment workflow.

## Math rendering

The Astro build uses:

- `remark-math`
- `rehype-katex`
- `katex`

This supports inline math with `$...$` and block math with `$$...$$`.

## Legacy migration

The previous repository was mostly generated Hexo output. The migration script scans legacy paths like:

```text
20*/**/index.html
```

It extracts the article body, metadata, category, tags, and original path into `src/content/blog/*.md` before each build.

Run locally:

```bash
npm install
npm run migrate:legacy
npm run dev
```

Build locally:

```bash
npm run build
```

## Important note

The migration script preserves content as much as possible, but HTML-to-Markdown conversion cannot always recover the exact original Markdown source. If the original Hexo `_posts/*.md` files are found later, they should replace the auto-extracted Markdown files.

## Domain status

The expired custom domain `znnnnnh2.icu` has been removed. The active URL is:

- <https://ZnnnnnH2.github.io>
