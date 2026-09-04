import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = 'https://gripaustralia.com';
const ARTICLES_DIR = path.join(ROOT_DIR, 'src', 'content', 'articles');
const GYMS_DIR = path.join(ROOT_DIR, 'src', 'content', 'gyms');
const ASSETS_DIR = path.join(ROOT_DIR, 'src', 'assets', 'images');

const KNOWN_PATHS = [
  '/',
  '/what-is-grip-sport%3F',
  '/competition-calendar',
  '/australian-grip-feats',
  '/equipment-and-gyms',
  '/get-involved',
  '/media',
  '/gripper-rating-service',
  '/2024-championship',
  '/2025-championship',
  '/mulletts-mandrel',
  '/2026-championship'
];

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  hr: '---'
});
turndownService.use(gfm);

turndownService.remove([
  'script', 'style', 'nav', 'header', 'footer', 'noscript', 'iframe',
  'svg', 'button'
]);

function cleanSlug(routePath) {
  let decoded = decodeURIComponent(routePath);
  if (decoded === '/' || decoded === '') return 'index';
  return decoded
    .replace(/^\/+/, '')
    .replace(/\?+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

async function downloadImage(rawImgUrl, slug) {
  try {
    let imgUrl = rawImgUrl.trim();
    if (imgUrl.startsWith('//')) {
      imgUrl = 'https:' + imgUrl;
    } else if (imgUrl.startsWith('/')) {
      imgUrl = BASE_URL + imgUrl;
    }

    if (imgUrl.startsWith('data:') || !imgUrl.startsWith('http')) return null;

    // Clean GoDaddy resize path parameters to get high quality image if possible
    // e.g. //img1.wsimg.com/isteam/ip/.../foo.jpg/:/cr=... -> //img1.wsimg.com/isteam/ip/.../foo.jpg
    let cleanUrl = imgUrl;
    const isteamMatch = imgUrl.match(/(https?:\/\/img\d*\.wsimg\.com\/isteam\/ip\/[^\/]+\/[^\/:]+)/);
    if (isteamMatch) {
      cleanUrl = isteamMatch[1];
    }

    const parsed = new URL(cleanUrl);
    const hash = crypto.createHash('md5').update(cleanUrl).digest('hex').slice(0, 8);
    let ext = path.extname(parsed.pathname).toLowerCase();
    if (!ext || ext.length > 5 || ext === '.') ext = '.jpg';

    const filename = `${slug}-${hash}${ext}`;
    const targetFile = path.join(ASSETS_DIR, filename);

    const exists = await fs.access(targetFile).then(() => true).catch(() => false);
    if (!exists) {
      const response = await axios.get(cleanUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'GripAustralia-Migration-Bot/1.0 (+https://gripaustralia.com)' }
      });
      await fs.writeFile(targetFile, response.data);
      console.log(`  ↳ Downloaded localized image: ${filename}`);
    }

    return `../../assets/images/${filename}`;
  } catch (err) {
    console.warn(`  ↳ Failed to download image ${rawImgUrl}: ${err.message}`);
    return null;
  }
}

async function extractGymsFromContent() {
  const gyms = [
    {
      slug: 'ultra-fitness-and-strength',
      name: 'Ultra Fitness & Strength',
      state: 'ACT',
      suburb: 'Mitchell',
      equipment: [
        'Napalm Nightmare 2" 2-hand rolling handle',
        'Napalm Nightmare 2x4 pinch blocks',
        'IronMind Little Big Horn',
        'IronMind Hub',
        'Various hubs & pinch blocks'
      ],
      description: 'Supporting venue for grip training with extensive specialised handles and implements in the ACT.',
      featured: true
    },
    {
      slug: 'betapark',
      name: 'Betapark',
      state: 'TAS',
      suburb: 'Hobart',
      equipment: [
        'IronMind Grippers',
        'Loading pin',
        'Grip Genie Rolling Grip Thing',
        'Grip Genie Hub',
        'Grip Genie Vertical Bar',
        'Rogue Anvil',
        'Various pinch blocks'
      ],
      description: 'Climbing gym offering a dedicated grip training setup for members and visitors in Hobart.',
      featured: true
    },
    {
      slug: 'leviathan-strength',
      name: 'Leviathan Strength',
      state: 'TAS',
      suburb: 'Invermay',
      equipment: [
        'Strongman grip handles',
        'Axle & thick bars',
        'Loading pins',
        'Pinch blocks and various grip implements'
      ],
      description: 'Strongman and strength athletics gym equipped with diverse grip implements and training equipment in northern Tasmania.',
      featured: true
    }
  ];

  for (const gym of gyms) {
    const frontmatter = {
      name: gym.name,
      state: gym.state,
      suburb: gym.suburb,
      equipment: gym.equipment,
      featured: gym.featured,
      description: gym.description
    };
    const body = `${gym.description}\n\n### Available Equipment\n\n${gym.equipment.map(e => `- ${e}`).join('\n')}\n`;
    const content = `---\n${yaml.dump(frontmatter)}---\n\n${body}\n`;
    await fs.writeFile(path.join(GYMS_DIR, `${gym.slug}.md`), content, 'utf-8');
    console.log(`✓ Created Gym Entry: ${gym.slug}.md`);
  }
}

async function scrapePage(routePath) {
  const fullUrl = `${BASE_URL}${routePath === '/' ? '' : routePath}`;
  const slug = cleanSlug(routePath);
  console.log(`[Processing] ${fullUrl} -> slug: ${slug}`);

  try {
    const { data: html } = await axios.get(fullUrl, {
      headers: {
        'User-Agent': 'GripAustralia-Migration-Bot/1.0 (+https://github.com)'
      },
      timeout: 15000
    });

    const $ = cheerio.load(html);

    if (slug === 'equipment-and-gyms') {
      await extractGymsFromContent(html);
    }

    // Determine clean title from overrides, h1, or meta
    const TITLE_OVERRIDES = {
      'index': 'Grip Australia',
      'competition-calendar': 'Competition Calendar',
      'australian-grip-feats': 'Australian Grip Feats'
    };

    const h1Text = $('h1').first().text().trim();
    const metaTitle = $('meta[property="og:title"]').attr('content') ||
                      $('title').text().replace(/[-|]\s*Grip Australia.*$/i, '').trim();
    
    let title = TITLE_OVERRIDES[slug] || h1Text || metaTitle || (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '));
    title = title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
    if (title === 'This website uses cookies.' || (title === 'Grip Australia' && slug !== 'index')) {
      title = TITLE_OVERRIDES[slug] || slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }

    const description = (
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''
    ).replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

    // Remove navigation headers, menus, account dropdowns, cookie bars, and footers from DOM
    $(
      'nav, header, footer, noscript, style, script, ' +
      '[data-aid*="NAV"], [data-aid*="MENU"], [data-aid*="ACCOUNT"], ' +
      '[data-ux*="Navigation"], [data-ux*="Menu"], [data-aid*="HEADER"], ' +
      '[data-aid*="FOOTER"], [data-aid*="COOKIE"], [class*="cookie"], ' +
      '#SITE_NAV, #SITE_HEADER, #SITE_FOOTER'
    ).remove();

    let contentSelector = 'main, article, #content, .content, .entry-content';
    let $content = $(contentSelector).first();
    if (!$content.length) {
      $content = $('body');
    }

    // Localize images (handling data-srclazy and normal src)
    const images = $content.find('img').toArray();
    for (const img of images) {
      const el = $(img);
      const lazySrc = el.attr('data-srclazy') || el.attr('data-src');
      const normalSrc = el.attr('src');
      const chosenSrc = (lazySrc && !lazySrc.startsWith('data:')) ? lazySrc : normalSrc;

      if (chosenSrc && !chosenSrc.startsWith('data:')) {
        const localRelPath = await downloadImage(chosenSrc, slug);
        if (localRelPath) {
          el.attr('src', localRelPath);
          el.removeAttr('srcset');
          el.removeAttr('data-srcsetlazy');
          el.removeAttr('data-srclazy');
        } else {
          el.remove();
        }
      } else {
        el.remove(); // Remove empty 1x1 transparent gif placeholders
      }
    }

    let markdownBody = turndownService.turndown($content.html() || '').trim();

    // Sanitize leftover GoDaddy account & nav boilerplate
    markdownBody = markdownBody
      .replace(/Signed in as:[\s\S]*?Sign In[\s\S]*?My Account/gi, '')
      .replace(/filler@godaddy\.com/gi, '')
      .replace(/This website uses cookies[\s\S]*?Accept/gi, '')
      .replace(/Powered by\s*\[?GoDaddy\]?.*$/gim, '')
      .replace(/Copyright © \d{4} Grip Australia.*$/gim, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\[Sign In\]\([^\)]*\)/g, '')
      .replace(/\[My Account\]\([^\)]*\)/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Clean emoji in links and broken calendar links
    markdownBody = markdownBody.replace(/\/competition-calendar-[^\)\s]+/g, '/competition-calendar');
    markdownBody = markdownBody.replace(/\/what-is-grip-sport%3F/g, '/what-is-grip-sport');

    // Remove redundant leading H1 if it equals our title
    const leadingH1Regex = new RegExp(`^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n+`, 'i');
    markdownBody = markdownBody.replace(leadingH1Regex, '').trim();

    const tags = ['grip sport', 'australia'];
    if (slug.includes('championship')) tags.push('championship', 'competition');
    if (slug.includes('calendar')) tags.push('events', 'calendar');
    if (slug.includes('feats')) tags.push('records', 'feats');
    if (slug.includes('gripper')) tags.push('grippers', 'rating');
    if (slug.includes('mandrel')) tags.push('equipment', 'mandrel');

    const frontmatter = {
      title,
      description: description || `Information and resources on ${title} from Grip Australia.`,
      originalUrl: fullUrl,
      migratedAt: new Date().toISOString(),
      author: 'Grip Australia',
      tags
    };

    const fileContent = `---\n${yaml.dump(frontmatter)}---\n\n${markdownBody}\n`;
    await fs.writeFile(path.join(ARTICLES_DIR, `${slug}.md`), fileContent, 'utf-8');
    console.log(`✓ Saved Clean Article: ${slug}.md (${title})`);
  } catch (err) {
    console.error(`✗ Error processing ${fullUrl}:`, err.message);
  }
}

async function run() {
  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  await fs.mkdir(GYMS_DIR, { recursive: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });

  console.log(`Starting clean migration ingestion of ${KNOWN_PATHS.length} routes...\n`);

  for (const routePath of KNOWN_PATHS) {
    await scrapePage(routePath);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\nMigration scraping, asset localization, and conversion complete!');
}

run().catch(console.error);
