import fs from 'fs';
import path from 'path';

const competitionsPath = path.resolve('src/data/competitions.json');
const completedPath = path.resolve('src/data/completed_competitions.json');

if (!fs.existsSync(competitionsPath)) {
  console.error(`Error: File not found: ${competitionsPath}`);
  process.exit(1);
}

const competitions = JSON.parse(fs.readFileSync(competitionsPath, 'utf-8'));
const completed = fs.existsSync(completedPath)
  ? JSON.parse(fs.readFileSync(completedPath, 'utf-8'))
  : [];

// CLI args parsing
const args = process.argv.slice(2);
let targetId = null;
let resultsUrl = null;
let isDryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--id' && args[i + 1]) {
    targetId = args[i + 1];
    i++;
  } else if (args[i] === '--results' && args[i + 1]) {
    resultsUrl = args[i + 1];
    i++;
  } else if (args[i] === '--dry-run') {
    isDryRun = true;
  }
}

const today = new Date().toISOString().split('T')[0];

const toArchive = [];
const remainingUpcoming = [];

competitions.forEach((comp) => {
  const shouldArchive = targetId
    ? comp.id === targetId
    : comp.date < today;

  if (shouldArchive) {
    toArchive.push(comp);
  } else {
    remainingUpcoming.push(comp);
  }
});

if (toArchive.length === 0) {
  console.log('No competitions found matching archive criteria.');
  if (targetId) {
    console.log(`(Searched for ID: "${targetId}")`);
  } else {
    console.log(`(All competitions in competitions.json are scheduled on or after today: ${today})`);
  }
  process.exit(0);
}

console.log(`\nArchiving ${toArchive.length} competition(s):`);

toArchive.forEach((comp) => {
  console.log(`  • ${comp.title} (ID: ${comp.id}, Date: ${comp.date})`);

  // Update status and optional results URL
  comp.statusOverride = 'completed';
  if (resultsUrl && (targetId === comp.id || toArchive.length === 1)) {
    comp.resultsUrl = resultsUrl;
    console.log(`    → Set resultsUrl: ${resultsUrl}`);
  }

  // Check if already in completed (prevent duplicates)
  const existingIdx = completed.findIndex((c) => c.id === comp.id);
  if (existingIdx >= 0) {
    completed[existingIdx] = comp;
  } else {
    completed.push(comp);
  }
});

// Sort completed descending (newest first)
completed.sort((a, b) => b.date.localeCompare(a.date));

// Sort upcoming ascending (soonest first)
remainingUpcoming.sort((a, b) => a.date.localeCompare(b.date));

if (isDryRun) {
  console.log('\n[Dry Run] No files modified.');
  process.exit(0);
}

fs.writeFileSync(competitionsPath, JSON.stringify(remainingUpcoming, null, 2) + '\n');
fs.writeFileSync(completedPath, JSON.stringify(completed, null, 2) + '\n');

console.log(`\n✓ Successfully moved ${toArchive.length} competition(s) to ${path.basename(completedPath)}.`);
console.log(`✓ Updated ${path.basename(competitionsPath)} (${remainingUpcoming.length} upcoming event(s) remaining).\n`);
