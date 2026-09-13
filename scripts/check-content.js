import fs from 'fs';
import path from 'path';

let hardErrors = [];
let advisoryWarnings = [];

function error(msg) {
  hardErrors.push(msg);
}

function warn(file, line, msg) {
  advisoryWarnings.push({ file, line, msg });
}

console.log('\n======================================================');
console.log('  Grip Australia Content Governance & Guardrails Check');
console.log('======================================================\n');

// 1. EVENT DATE & REGISTRATION LIFECYCLE CHECKS
console.log('1. Checking Event Dates & Lifecycle Integrity...');
const competitionsPath = path.resolve('src/data/competitions.json');
const completedPath = path.resolve('src/data/completed_competitions.json');

if (fs.existsSync(competitionsPath)) {
  const comps = JSON.parse(fs.readFileSync(competitionsPath, 'utf-8'));
  const today = new Date().toISOString().split('T')[0];

  comps.forEach((c) => {
    // Check if event has passed
    if (c.date < today) {
      // Hard error: Cannot claim registration is open for a past event
      if (c.statusOverride === 'registration_open') {
        error(`Competition "${c.title}" (${c.id}): Event date (${c.date}) is in the past, but statusOverride is 'registration_open'.`);
      }
      // Advisory warning: Notify user that an event date has passed and should be archived
      warn(
        'src/data/competitions.json',
        0,
        `Event "${c.title}" (${c.date}) has passed. Run 'npm run archive:competitions' to move it to completed competitions.`
      );
    }

    // Check if registration close date has passed
    if (c.registrationCloseDate && c.registrationCloseDate < today) {
      if (c.statusOverride === 'registration_open') {
        error(`Competition "${c.title}" (${c.id}): Registration close date (${c.registrationCloseDate}) has passed, but statusOverride is 'registration_open'.`);
      }
      if (c.date >= today && !c.statusOverride) {
        warn(
          'src/data/competitions.json',
          0,
          `Event "${c.title}" (${c.id}): Registration close date (${c.registrationCloseDate}) has passed while event is still upcoming.`
        );
      }
    }

    // registrationCloseDate must be on or before event date
    if (c.registrationCloseDate && c.date && c.registrationCloseDate > c.date) {
      error(`Competition "${c.title}" (${c.id}): Registration close date (${c.registrationCloseDate}) cannot be after event date (${c.date}).`);
    }

    // Missing registration close date warning
    if (c.registrationUrl && !c.registrationCloseDate && c.date >= today) {
      warn(
        'src/data/competitions.json',
        0,
        `Upcoming event "${c.title}" has registrationUrl but missing registrationCloseDate.`
      );
    }
  });

  // Verify built calendar if dist/ exists
  const calendarHtmlPath = path.resolve('dist/competition-calendar/index.html');
  if (fs.existsSync(calendarHtmlPath)) {
    const html = fs.readFileSync(calendarHtmlPath, 'utf-8');
    comps.forEach((c) => {
      if (c.date < today) {
        const upcomingSection = html.split('Past Competitions')[0];
        if (upcomingSection && upcomingSection.includes(c.title)) {
          error(`dist/competition-calendar: Past event "${c.title}" (${c.date}) is rendering in the Upcoming section.`);
        }
      }
    });
  }
} else {
  error('src/data/competitions.json not found!');
}

// Also audit completed_competitions.json if present
if (fs.existsSync(completedPath)) {
  const completedComps = JSON.parse(fs.readFileSync(completedPath, 'utf-8'));
  const today = new Date().toISOString().split('T')[0];

  completedComps.forEach((c) => {
    if (c.date > today) {
      warn(
        'src/data/completed_competitions.json',
        0,
        `Event "${c.title}" in completed_competitions.json has future date (${c.date}).`
      );
    }
  });
}

// 2. CHECK DUPLICATE ORGANISATION URLS (Advisory Warnings)
console.log('2. Checking for Duplicate Organisation URLs...');
const usefulResourcesPath = path.resolve('src/pages/useful-resources.astro');
if (fs.existsSync(usefulResourcesPath)) {
  const content = fs.readFileSync(usefulResourcesPath, 'utf-8');
  // Match resource entries with name and url
  const nameUrlRegex = /name:\s*["']([^"']+)["'][\s\S]*?url:\s*["']([^"']+)["']/g;
  let match;
  const urlToNames = new Map();
  while ((match = nameUrlRegex.exec(content)) !== null) {
    const name = match[1];
    const url = match[2].toLowerCase().replace(/\/+$/, '');
    if (!urlToNames.has(url)) {
      urlToNames.set(url, []);
    }
    urlToNames.get(url).push(name);
  }

  for (const [url, names] of urlToNames.entries()) {
    if (names.length > 1) {
      warn('src/pages/useful-resources.astro', 0, `Duplicate organisation URL "${url}" used by different entries: ${names.join(', ')}`);
    }
  }
}

// 3. SCAN CONTENT ARTICLES & PAGES FOR HIGH-RISK PROSE & PLACEHOLDERS (Advisory Warnings)
console.log('3. Scanning Content Guardrails & Tone (Advisory Warnings)...');

// TODO Add pinacle and other.
const HIGH_RISK_PATTERNS = [
  { pattern: /\bofficial national\b/i, label: 'High-confidence claim: "official national"' },
  { pattern: /\bthe official\b/i, label: 'High-confidence claim: "the official"' },
  { pattern: /\bgoverns all\b/i, label: 'Universal governance claim: "governs all"' },
  { pattern: /\buniversal standard\b/i, label: 'Universal standard claim: "universal standard"' },
  { pattern: /\bworld's most\b/i, label: 'Superlative claim: "world\'s most"' },
  { pattern: /\bguarantees\b/i, label: 'Absolute guarantee: "guarantees"' },
  { pattern: /\b(TODO|FIXME|TBD)\b/, label: 'Unfinished task marker' },
  { pattern: /\bComing Soon\b/i, label: 'Placeholder: "Coming Soon"' },
  { pattern: /\b\d+(\.\d+)?\s*kN\b/, label: 'Specific force assertion (kN)' }
];

function scanFile(filePath) {
  const relPath = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let inScript = false;
  let inStyle = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.includes('<script')) inScript = true;
    if (line.includes('</script>')) { inScript = false; continue; }
    if (line.includes('<style')) inStyle = true;
    if (line.includes('</style>')) { inStyle = false; continue; }

    if (inScript || inStyle) continue;

    // Skip CSS variable or class definition lines
    if (line.trim().startsWith('--') || line.trim().startsWith('var(--')) continue;

    for (const { pattern, label } of HIGH_RISK_PATTERNS) {
      if (pattern.test(line)) {
        warn(relPath, lineNum, `${label} -> "${line.trim().slice(0, 80)}"`);
      }
    }
  }
}

// Scan articles in src/content/articles/
const articlesDir = path.resolve('src/content/articles');
if (fs.existsSync(articlesDir)) {
  const articles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
  for (const article of articles) {
    const fullPath = path.join(articlesDir, article);
    scanFile(fullPath);

    // Frontmatter check: check if sourceName or sourceUrl exists
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.startsWith('---')) {
      const frontmatter = content.split('---')[1] || '';
      if (!frontmatter.includes('sourceName:') && !frontmatter.includes('sourceUrl:')) {
        warn(path.join('src/content/articles', article), 1, 'Article lacks source metadata (sourceName / sourceUrl).');
      }
    }
  }
}

// Scan primary user-facing pages in src/pages/ (excluding themes)
const pagesDir = path.resolve('src/pages');
if (fs.existsSync(pagesDir)) {
  const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.astro') && f !== '[slug].astro' && f !== '404.astro');
  for (const page of pages) {
    scanFile(path.join(pagesDir, page));
  }
}

// REPORTING RESULTS
console.log('\n------------------------------------------------------');
console.log(`Results: ${hardErrors.length} hard error(s), ${advisoryWarnings.length} advisory warning(s).\n`);

if (advisoryWarnings.length > 0) {
  console.log('Advisory Warnings:');
  advisoryWarnings.forEach(w => {
    console.log(`  [WARN] ${w.file}${w.line ? `:${w.line}` : ''} - ${w.msg}`);
  });
  console.log('');
}

if (hardErrors.length > 0) {
  console.error('Hard Errors (Blocking):');
  hardErrors.forEach(e => {
    console.error(`  [ERROR] ${e}`);
  });
  console.error('\n✗ Content validation check FAILED.\n');
  process.exit(1);
} else {
  console.log('✓ Content validation check PASSED (All deterministic checks verified).\n');
  process.exit(0);
}
