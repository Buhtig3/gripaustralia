import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  try {
    const res = await axios.get('https://gripaustralia.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log('Homepage status:', res.status);
    const $ = cheerio.load(res.data);
    const links = new Set();
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) links.add(href);
    });
    console.log('All links on homepage:');
    for (const l of [...links].sort()) {
      console.log(' -', l);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
