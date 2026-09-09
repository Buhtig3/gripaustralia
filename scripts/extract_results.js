import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const SCRIPT_DIR = path.resolve('scripts');
const DEBUG_DIR = path.join(SCRIPT_DIR, 'debug_html');
if (!fs.existsSync(DEBUG_DIR)) {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

const DEFAULT_CONTESTS = [
  {
    year: 2026,
    contestId: 483,
    gsiUrl: 'https://www.gripsport.org/contest/483',
    title: '2026 Australian Grip Sport Championship',
    venue: 'Iron Revolution Gym, Melbourne, VIC',
    date: 'June 27, 2026',
    promoter: 'Isaac Pitt',
    abbreviation: 'AGSC26',
    champions: {
      mensOverall: 'Declan Wright',
      womensOverall: 'Megan Galvin',
      mensP4P: 'Isaac Pitt',
      womensP4P: 'Sarah Rodwell'
    }
  },
  {
    year: 2025,
    contestId: 433,
    gsiUrl: 'https://www.gripsport.org/contest/433',
    title: '2025 Australian Grip Sport Championship',
    venue: 'Steel Stone Gym, Brisbane, QLD',
    date: 'June 1, 2025',
    promoter: 'Isaac Pitt',
    abbreviation: 'AGSC25',
    champions: {
      mensOverall: 'Henry Mullett',
      womensOverall: 'Sarah Rainbow',
      mensP4P: 'Isaac Pitt',
      womensP4P: null
    }
  },
  {
    year: 2024,
    contestId: 395,
    gsiUrl: 'https://www.gripsport.org/contest/395',
    title: '2024 Australian Grip Sport Championship',
    venue: 'Sydney, NSW',
    date: 'June 1, 2024',
    promoter: 'Isaac Pitt',
    abbreviation: 'AGSC24',
    champions: {
      mensOverall: 'Luke Reynolds',
      womensOverall: null,
      mensP4P: 'Isaac Pitt',
      womensP4P: null
    }
  }
];

async function fetchContestHtml(contest) {
  const cachePath = path.join(DEBUG_DIR, `contest_${contest.contestId}.html`);
  if (fs.existsSync(cachePath)) {
    console.log(`[Cache Hit] Loading contest ${contest.contestId} from ${cachePath}`);
    return fs.readFileSync(cachePath, 'utf8');
  }

  // Fallback to legacy artifact path if present
  if (contest.filePath && fs.existsSync(contest.filePath)) {
    console.log(`[Local File] Loading contest ${contest.contestId} from ${contest.filePath}`);
    const content = fs.readFileSync(contest.filePath, 'utf8');
    fs.writeFileSync(cachePath, content, 'utf8');
    return content;
  }

  console.log(`[HTTP Fetch] Downloading contest ${contest.contestId} from ${contest.gsiUrl}...`);
  const response = await axios.get(contest.gsiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GripSportResearch/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 15000,
  });

  fs.writeFileSync(cachePath, response.data, 'utf8');
  return response.data;
}

export async function processContests(contests = DEFAULT_CONTESTS) {
  const outputPath = path.resolve('src/data/results.json');
  let existingResults = {};
  if (fs.existsSync(outputPath)) {
    try {
      existingResults = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    } catch {
      existingResults = {};
    }
  }

  const allResults = { ...existingResults };

  for (const contest of contests) {
    try {
      const content = await fetchContestHtml(contest);
      const $ = cheerio.load(content);

      const table = $('#contestResultsTable');
      if (!table.length) {
        console.warn(`[Warning] No #contestResultsTable found for contest ${contest.contestId}`);
        continue;
      }

      const headers = [];
      table.find('thead th').each((i, el) => {
        headers.push($(el).text().trim());
      });

      const athletes = [];
      table.find('tbody tr').each((i, tr) => {
        const row = {};
        const tds = $(tr).find('td');
        const athleteName = $(tds[0]).text().trim();
        const athleteHref = $(tds[0]).find('a').attr('href') || '';
        const athleteId = athleteHref.replace('/athlete/', '').trim();
        const weightClass = $(tds[1]).text().trim();
        const isWomen = weightClass.toLowerCase().includes('women');

        row.athlete = athleteName;
        row.athleteId = athleteId;
        row.weightClass = weightClass;
        row.gender = isWomen ? 'Women' : 'Men';
        row.events = {};

        for (let c = 2; c < headers.length; c++) {
          const eventName = headers[c];
          const rawVal = $(tds[c]).text().trim();
          const numVal = parseFloat($(tds[c]).attr('data-order') || rawVal) || 0;
          row.events[eventName] = {
            display: rawVal,
            value: numVal
          };
        }
        athletes.push(row);
      });

      allResults[contest.year] = {
        year: contest.year,
        contestId: contest.contestId,
        title: contest.title,
        gsiUrl: contest.gsiUrl,
        date: contest.date,
        venue: contest.venue,
        promoter: contest.promoter,
        abbreviation: contest.abbreviation,
        champions: contest.champions,
        eventNames: headers.slice(2),
        athleteCount: athletes.length,
        mensCount: athletes.filter(a => a.gender === 'Men').length,
        womensCount: athletes.filter(a => a.gender === 'Women').length,
        athletes
      };
      console.log(`✓ Processed ${contest.title} (${athletes.length} athletes)`);
    } catch (err) {
      console.error(`Error processing contest ${contest.contestId}:`, err.message);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`\nSuccessfully updated ${outputPath} (Years: ${Object.keys(allResults).join(', ')})`);
}

if (process.argv[1] && process.argv[1].endsWith('extract_results.js')) {
  processContests();
}
