import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = 'https://gripaustralia.godaddysites.com';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ARCHIVE_DIR = path.join(ROOT_DIR, 'site-archive');
const SNAPSHOTS_DIR = path.join(ARCHIVE_DIR, 'snapshots');
const DESKTOP_DIR = path.join(SNAPSHOTS_DIR, 'desktop');
const MOBILE_DIR = path.join(SNAPSHOTS_DIR, 'mobile');

const ROUTES = [
  { path: '/', slug: 'index', title: 'Home' },
  { path: '/what-is-grip-sport%3F', slug: 'what-is-grip-sport', title: 'What is Grip Sport?' },
  { path: '/competition-calendar', slug: 'competition-calendar', title: 'Competition Calendar' },
  { path: '/australian-grip-feats', slug: 'australian-grip-feats', title: 'Australian Grip Feats' },
  { path: '/equipment-and-gyms', slug: 'equipment-and-gyms', title: 'Equipment & Gyms' },
  { path: '/get-involved', slug: 'get-involved', title: 'Get Involved' },
  { path: '/media', slug: 'media', title: 'Media' },
  { path: '/gripper-rating-service', slug: 'gripper-rating-service', title: 'Gripper Rating Service' },
  { path: '/2024-championship', slug: '2024-championship', title: '2024 Championship' },
  { path: '/2025-championship', slug: '2025-championship', title: '2025 Championship' },
  { path: '/2026-championship', slug: '2026-championship', title: '2026 Championship' },
  { path: '/mulletts-mandrel', slug: 'mulletts-mandrel', title: "Mullett's Mandrel" },
  { path: '/international-records', slug: 'international-records', title: 'International Records' }
];

const targetSlug = process.argv[2];
const targetRoutes = targetSlug ? ROUTES.filter(r => r.slug === targetSlug) : ROUTES;

async function captureSnapshots() {
  await fs.mkdir(DESKTOP_DIR, { recursive: true });
  await fs.mkdir(MOBILE_DIR, { recursive: true });

  console.log(`\n=== Launching Headless Chrome via puppeteer-core ===\n`);
  console.log(`Chrome binary: ${CHROME_PATH}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const snapshotManifest = [];

  try {
    for (const route of targetRoutes) {
      const fullUrl = BASE_URL + route.path;
      console.log(`\n[Capturing] ${route.title} (${route.slug})`);

      // 1. Desktop Capture (1920x1080)
      const pageDesktop = await browser.newPage();
      await pageDesktop.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      
      try {
        await pageDesktop.goto(fullUrl, { waitUntil: 'load', timeout: 30000 });
      } catch (e) {
        console.warn(`  Desktop navigation timeout/warning for ${route.slug}: ${e.message}`);
      }

      // Wait for client-side hydration
      await new Promise(r => setTimeout(r, 3500));

      // Remove cookie banner and any blocking modals, ensure hero poster and lazy images load
      await pageDesktop.evaluate(() => {
        const cookieBanners = document.querySelectorAll('[data-aid*="COOKIE"], [class*="cookie"], #cookie-banner');
        cookieBanners.forEach(el => el.remove());

        // In case hero video background is buffering or blocked, reveal the poster image and dismiss spinner
        const heroImgs = document.querySelectorAll('[data-aid*="HERO"] img, [data-ux*="Hero"] img, img[src*="vimeocdn.com"]');
        heroImgs.forEach(img => {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
          img.style.display = 'block';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.position = 'absolute';
          img.style.top = '0';
          img.style.left = '0';
          img.style.zIndex = '0';
        });

        // Hide empty iframes / spinners
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(f => f.remove());
        const loaders = document.querySelectorAll('[class*="spinner"], [data-aid*="LOADER"]');
        loaders.forEach(l => l.remove());

        window.scrollTo(0, document.body.scrollHeight);
      });

      // Wait a moment for lazy assets to trigger
      await new Promise(r => setTimeout(r, 1500));
      await pageDesktop.evaluate(() => window.scrollTo(0, 0));
      await new Promise(r => setTimeout(r, 500));

      const desktopFile = path.join(DESKTOP_DIR, `${route.slug}.png`);
      await pageDesktop.screenshot({ path: desktopFile, fullPage: true });
      const desktopStats = await fs.stat(desktopFile);
      console.log(`  ✓ Desktop snapshot saved: ${route.slug}.png (${Math.round(desktopStats.size / 1024)} KB)`);
      await pageDesktop.close();

      // 2. Mobile Capture (390x844 - iPhone 13/14)
      const pageMobile = await browser.newPage();
      await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await pageMobile.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');

      try {
        await pageMobile.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (e) {
        console.warn(`  Mobile navigation timeout/warning for ${route.slug}: ${e.message}`);
      }

      await pageMobile.evaluate(() => {
        const cookieBanners = document.querySelectorAll('[data-aid*="COOKIE"], [class*="cookie"], #cookie-banner');
        cookieBanners.forEach(el => el.remove());
        window.scrollTo(0, document.body.scrollHeight);
      });

      await new Promise(r => setTimeout(r, 1500));
      await pageMobile.evaluate(() => window.scrollTo(0, 0));
      await new Promise(r => setTimeout(r, 500));

      const mobileFile = path.join(MOBILE_DIR, `${route.slug}.png`);
      await pageMobile.screenshot({ path: mobileFile, fullPage: true });
      const mobileStats = await fs.stat(mobileFile);
      console.log(`  ✓ Mobile snapshot saved: ${route.slug}.png (${Math.round(mobileStats.size / 1024)} KB)`);
      await pageMobile.close();

      snapshotManifest.push({
        slug: route.slug,
        title: route.title,
        desktopFile: `site-archive/snapshots/desktop/${route.slug}.png`,
        desktopSizeKB: Math.round(desktopStats.size / 1024),
        mobileFile: `site-archive/snapshots/mobile/${route.slug}.png`,
        mobileSizeKB: Math.round(mobileStats.size / 1024)
      });
    }
  } finally {
    await browser.close();
  }

  // Update site-archive/manifest.json with snapshot metadata
  const manifestPath = path.join(ARCHIVE_DIR, 'manifest.json');
  try {
    const rawManifest = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(rawManifest);
    manifest.snapshots = snapshotManifest;
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`\n✓ Updated manifest with snapshot catalog: ${manifestPath}`);
  } catch (e) {
    console.warn('Could not update manifest.json:', e.message);
  }

  // Clean up any test screenshot files if present
  try {
    await fs.unlink(path.join(ARCHIVE_DIR, 'test_screen.png')).catch(() => {});
    await fs.unlink(path.join(ARCHIVE_DIR, 'test_screen_timed.png')).catch(() => {});
  } catch (e) {}

  console.log(`\nAll visual snapshots captured successfully!`);
}

captureSnapshots().catch(err => {
  console.error('Fatal snapshot error:', err);
  process.exit(1);
});
