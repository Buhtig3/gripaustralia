import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const DIST_DIR = path.resolve('dist');

function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const basePrefixes = [
  process.env.BASE_PATH,
  repoName ? `/${repoName}` : '',
  '/gripaustralia',
  '/grip-australia-alpha'
].filter(Boolean);

function stripBasePrefix(url) {
  let stripped = url;
  for (const prefix of basePrefixes) {
    if (stripped === prefix) {
      return '/';
    }
    if (stripped.startsWith(`${prefix}/`)) {
      return stripped.slice(prefix.length);
    }
  }
  return stripped;
}

function verifyLink(link, sourceFile) {
  // Ignore external, mailto, tel, anchor-only, or javascript
  if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('javascript:')) {
    return { ok: true };
  }
  if (link.startsWith('#') || !link) {
    return { ok: true };
  }

  // Strip hash and query
  const clean = link.split('#')[0].split('?')[0];
  if (!clean || clean === '/') {
    return { ok: fs.existsSync(path.join(DIST_DIR, 'index.html')) };
  }

  // Internal route check - strip base prefix if present
  let stripped = stripBasePrefix(clean);
  if (!stripped || stripped === '/') {
    return { ok: fs.existsSync(path.join(DIST_DIR, 'index.html')) };
  }
  let rel = stripped.replace(/^\/+/, '');
  const candidate1 = path.join(DIST_DIR, rel, 'index.html');
  const candidate2 = path.join(DIST_DIR, rel);
  const candidate3 = path.join(DIST_DIR, `${rel}.html`);

  const exists = fs.existsSync(candidate1) || fs.existsSync(candidate2) || fs.existsSync(candidate3);
  return {
    ok: exists,
    target: clean,
    source: path.relative(DIST_DIR, sourceFile)
  };
}

console.log('Running Link Integrity Verification across dist/...\n');

const files = getAllHtmlFiles(DIST_DIR);
console.log(`Found ${files.length} HTML files to inspect.`);

let broken = [];
let totalLinks = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf-8');
  const $ = cheerio.load(html);

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    totalLinks++;
    const result = verifyLink(href, file);
    if (!result.ok) {
      broken.push(result);
    }
  });
}

console.log(`Inspected ${totalLinks} links.`);

if (broken.length > 0) {
  console.error(`\nFound ${broken.length} broken internal links:`);
  for (const b of broken) {
    console.error(` ✗ ${b.target} in ${b.source}`);
  }
  process.exit(1);
} else {
  console.log('✓ All internal links verified successfully! 0 broken links.\n');
}
