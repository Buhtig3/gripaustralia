import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const files = [
  {
    year: 2026,
    contestId: 483,
    gsiUrl: 'https://www.gripsport.org/contest/483',
    filePath: 'C:/Users/Cam.Chimera/.gemini/antigravity/brain/e80ffbb9-23c1-4907-a932-edcac8b1c977/.system_generated/steps/123/content.md',
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
    filePath: 'C:/Users/Cam.Chimera/.gemini/antigravity/brain/e80ffbb9-23c1-4907-a932-edcac8b1c977/.system_generated/steps/155/content.md',
    title: '2025 Australian Grip Sport Championship',
    venue: 'Ultra Fitness & Strength, Brisbane, QLD',
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
    filePath: 'C:/Users/Cam.Chimera/.gemini/antigravity/brain/e80ffbb9-23c1-4907-a932-edcac8b1c977/.system_generated/steps/157/content.md',
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

const allResults = {};

for (const contest of files) {
  const content = fs.readFileSync(contest.filePath, 'utf8');
  const $ = cheerio.load(content);

  const table = $('#contestResultsTable');
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
}

const outputPath = path.resolve('src/data/results.json');
fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf8');
console.log(`Successfully generated ${outputPath} with years: ${Object.keys(allResults).join(', ')}`);
