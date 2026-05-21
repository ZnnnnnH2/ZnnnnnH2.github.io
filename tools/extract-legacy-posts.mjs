import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'src/content/blog');
const LEGACY_GLOB = ['20*/**/index.html'];
const EXCLUDE = ['node_modules/**', 'dist/**', 'src/**', 'public/**'];

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

turndown.keep(['span']);

turndown.addRule('mathInline', {
  filter: node => node.nodeName === 'SPAN' && node.classList?.contains('math') && node.classList?.contains('inline'),
  replacement: content => `$${content.trim()}$`,
});

turndown.addRule('mathDisplay', {
  filter: node => node.nodeName === 'SPAN' && node.classList?.contains('math') && node.classList?.contains('display'),
  replacement: content => `\n\n$$\n${content.trim()}\n$$\n\n`,
});

function slugifyPath(file) {
  return file
    .replace(/\\/g, '/')
    .replace(/\/index\.html$/, '')
    .split('/')
    .map(part => encodeURIComponent(part).replace(/%/g, '').slice(0, 80))
    .join('-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'post';
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ''));
}

function yamlArray(values) {
  if (!values?.length) return '[]';
  return `[${values.map(yamlString).join(', ')}]`;
}

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeAssetPath(src) {
  if (!src) return src;
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('/')) return src;
  if (src.startsWith('img/') || src.startsWith('images/')) return `/${src}`;
  return src;
}

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/https:\/\/znnnnnh2\.icu/gi, 'https://ZnnnnnH2.github.io')
    .replace(/!\[([^\]]*)\]\((img\/[^)]+)\)/g, '![$1](/$2)')
    .replace(/!\[([^\]]*)\]\((images\/[^)]+)\)/g, '![$1](/$2)')
    .replace(/\]\((img\/[^)]+)\)/g, '](/$1)')
    .replace(/\]\((images\/[^)]+)\)/g, '](/$1)')
    .replace(/[\u2004\u2005\u2006]/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const files = await fg(LEGACY_GLOB, { cwd: ROOT, ignore: EXCLUDE, dot: false });
  let converted = 0;

  for (const file of files) {
    const html = await fs.readFile(path.join(ROOT, file), 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const article = document.querySelector('#article-container, article.post-content, article');
    const title = cleanText(document.querySelector('h1.post-title')?.textContent || document.querySelector('title')?.textContent?.split('|')[0] || path.basename(path.dirname(file)));

    if (!article || !title) continue;

    const pubDate = document.querySelector('time.post-meta-date-created')?.getAttribute('datetime')
      || document.querySelector('meta[property="article:published_time"]')?.getAttribute('content')
      || '2025-01-01T00:00:00.000Z';
    const updatedDate = document.querySelector('time.post-meta-date-updated')?.getAttribute('datetime')
      || document.querySelector('meta[property="article:modified_time"]')?.getAttribute('content')
      || '';
    const category = cleanText(document.querySelector('.post-meta-categories a')?.textContent || '笔记');
    const tags = [...document.querySelectorAll('meta[property="article:tag"]')].map(el => cleanText(el.getAttribute('content'))).filter(Boolean);
    const description = cleanText(document.querySelector('meta[name="description"]')?.getAttribute('content') || article.textContent).slice(0, 180);

    article.querySelectorAll('script, style').forEach(node => node.remove());
    article.querySelectorAll('img').forEach(img => {
      img.setAttribute('src', normalizeAssetPath(img.getAttribute('src')));
    });
    article.querySelectorAll('a[href]').forEach(anchor => {
      anchor.setAttribute('href', normalizeAssetPath(anchor.getAttribute('href')));
    });

    const markdown = normalizeMarkdown(turndown.turndown(article.innerHTML));

    const out = `---\ntitle: ${yamlString(title)}\ndescription: ${yamlString(description)}\npubDate: ${yamlString(pubDate)}\n${updatedDate ? `updatedDate: ${yamlString(updatedDate)}\n` : ''}category: ${yamlString(category)}\ntags: ${yamlArray(tags)}\nlegacyPath: ${yamlString('/' + file.replace(/index\.html$/, ''))}\ndraft: false\n---\n\n${markdown}\n`;

    await fs.writeFile(path.join(OUT_DIR, `${slugifyPath(file)}.md`), out, 'utf8');
    converted += 1;
  }

  console.log(`Converted ${converted} legacy posts to ${path.relative(ROOT, OUT_DIR)}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
