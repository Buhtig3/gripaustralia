#!/usr/bin/env node

/**
 * scripts/competitions-csv.js
 *
 * Utility to generate template CSV, export existing competitions,
 * and import/update competitions from CSV into the repository's
 * static JSON datasets (competitions.json and completed_competitions.json).
 *
 * Usage:
 *   node scripts/competitions-csv.js template [outputPath]
 *   node scripts/competitions-csv.js export [outputPath] [--source all|upcoming|completed]
 *   node scripts/competitions-csv.js import <csvFile> [--target auto|upcoming|completed] [--dry-run]
 */

import fs from 'fs';
import path from 'path';

const COMPETITIONS_PATH = path.resolve('src/data/competitions.json');
const COMPLETED_PATH = path.resolve('src/data/completed_competitions.json');
const DEFAULT_TEMPLATE_PATH = path.resolve('src/data/competitions_template.csv');

const CSV_HEADERS = [
  'id',
  'title',
  'date',
  'time',
  'location',
  'venue',
  'registrationUrl',
  'registrationCloseDate',
  'statusOverride',
  'sanctioned',
  'sanctioningBody',
  'description',
  'resultsUrl'
];

const TEMPLATE_ROWS = [
  {
    id: 'brisbane-grip-classic-2027',
    title: 'Brisbane Grip Classic 2027',
    date: '2027-03-20',
    time: '9:30 AM – 3:30 PM AEST',
    location: 'Brisbane, QLD',
    venue: 'Valhalla Strength, Brisbane',
    registrationUrl: 'https://example.com/register/brisbane-2027',
    registrationCloseDate: '2027-03-15',
    statusOverride: null,
    sanctioned: true,
    sanctioningBody: 'GSI',
    description: 'Annual Queensland championship featuring pinch, crush, and axle deadlift.',
    resultsUrl: null
  },
  {
    id: 'hobart-hoist-2027',
    title: 'Hobart Hoist 2027',
    date: '2027-01-30',
    time: '10:00 AM – 2:00 PM AEDT',
    location: 'Hobart, TAS',
    venue: 'Hobart, Tasmania',
    registrationUrl: null,
    registrationCloseDate: null,
    statusOverride: null,
    sanctioned: true,
    sanctioningBody: 'GSI',
    description: 'The premier Tasmanian grip challenge returning for 2027 under GSI sanctioning.',
    resultsUrl: null
  },
  {
    id: 'strongfest-iv-2026',
    title: 'StrongFest IV',
    date: '2026-08-22',
    time: '10:00 AM – 3:00 PM AEST',
    location: 'Canberra, ACT',
    venue: 'Canberra, ACT',
    registrationUrl: 'https://www.eventbrite.com.au/e/strongfest-iv-tickets-1990312708890',
    registrationCloseDate: '2026-08-21',
    statusOverride: 'completed',
    sanctioned: true,
    sanctioningBody: 'GSI',
    description: 'Annual GSI-sanctioned Grip Challenge held in Canberra featuring multi-discipline competition for lifters of all experience levels.',
    resultsUrl: 'https://example.com/results/strongfest-iv-2026'
  },
  {
    id: 'perth-pinch-championship-2027',
    title: 'Perth Pinch Championship 2027',
    date: '2027-05-15',
    time: '10:00 AM – 2:00 PM AWST',
    location: 'Perth, WA',
    venue: 'Perth Barbell Club',
    registrationUrl: null,
    registrationCloseDate: null,
    statusOverride: null,
    sanctioned: false,
    sanctioningBody: 'Independent',
    description: 'Club-level pinch contest testing Euro pinch and block weights.',
    resultsUrl: null
  }
];

/**
 * RFC-4180 compliant CSV parser.
 */
function parseCSV(text) {
  const lines = [];
  let row = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current.trim());
        current = '';
      } else if (char === '\r') {
        // Skip CR
      } else if (char === '\n') {
        row.push(current.trim());
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          lines.push(row);
        }
        row = [];
        current = '';
      } else {
        current += char;
      }
    }
  }

  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      lines.push(row);
    }
  }

  // Filter out empty lines or comment lines starting with '#'
  return lines.filter((r) => r.length > 0 && !(r[0] && r[0].startsWith('#')));
}

/**
 * RFC-4180 CSV serializer.
 */
function serializeCSV(headers, rows) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.join(',');
  const rowLines = rows.map((r) => headers.map((h) => escapeCell(r[h])).join(','));
  return [headerLine, ...rowLines].join('\n') + '\n';
}

/**
 * Validate competition object against schema requirements.
 */
function validateCompetition(comp, index) {
  const errors = [];
  const required = ['id', 'title', 'date', 'location', 'venue', 'sanctioned'];

  for (const field of required) {
    if (comp[field] === undefined || comp[field] === null || comp[field] === '') {
      errors.push(`Row #${index} (${comp.id || 'unknown'}): Missing required field '${field}'`);
    }
  }

  if (comp.date && !/^\d{4}-\d{2}-\d{2}$/.test(comp.date)) {
    errors.push(`Row #${index} (${comp.id}): 'date' must be ISO format YYYY-MM-DD (received '${comp.date}')`);
  }

  if (comp.registrationCloseDate && !/^\d{4}-\d{2}-\d{2}$/.test(comp.registrationCloseDate)) {
    errors.push(`Row #${index} (${comp.id}): 'registrationCloseDate' must be ISO format YYYY-MM-DD (received '${comp.registrationCloseDate}')`);
  }

  if (comp.date && comp.registrationCloseDate && comp.registrationCloseDate > comp.date) {
    errors.push(`Row #${index} (${comp.id}): 'registrationCloseDate' (${comp.registrationCloseDate}) cannot be after 'date' (${comp.date})`);
  }

  if (comp.statusOverride && !['cancelled', 'completed', 'scheduled', 'registration_open'].includes(comp.statusOverride)) {
    errors.push(`Row #${index} (${comp.id}): Invalid statusOverride '${comp.statusOverride}'. Must be one of: cancelled, completed, scheduled, registration_open`);
  }

  return errors;
}

/**
 * Helper to read JSON file or return default.
 */
function readJSON(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    process.exit(1);
  }
}

/**
 * Command: Generate Template CSV
 */
function commandTemplate(outPath = DEFAULT_TEMPLATE_PATH) {
  const resolved = path.resolve(outPath);
  const csvContent = serializeCSV(CSV_HEADERS, TEMPLATE_ROWS);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(resolved, csvContent, 'utf-8');
  console.log(`✓ Template CSV written to: ${resolved}`);
  console.log(`  Included ${TEMPLATE_ROWS.length} illustrative example competitions.`);
}

/**
 * Command: Export competitions to CSV
 */
function commandExport(outPath, options = {}) {
  const resolved = path.resolve(outPath || 'src/data/competitions_export.csv');
  const source = options.source || 'all';

  const upcoming = readJSON(COMPETITIONS_PATH, []);
  const completed = readJSON(COMPLETED_PATH, []);

  let competitions = [];
  if (source === 'upcoming') {
    competitions = upcoming;
  } else if (source === 'completed') {
    competitions = completed;
  } else {
    // Merge, de-duplicating by ID
    const map = new Map();
    upcoming.forEach((c) => map.set(c.id, c));
    completed.forEach((c) => map.set(c.id, c));
    competitions = Array.from(map.values());
  }

  // Sort by date ascending
  competitions.sort((a, b) => (a.date > b.date ? 1 : -1));

  const csvContent = serializeCSV(CSV_HEADERS, competitions);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(resolved, csvContent, 'utf-8');
  console.log(`✓ Exported ${competitions.length} competition(s) to: ${resolved}`);
}

/**
 * Command: Import competitions from CSV
 */
function commandImport(csvFilePath, options = {}) {
  const resolved = path.resolve(csvFilePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: CSV file not found: ${resolved}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  const rows = parseCSV(raw);

  if (rows.length < 2) {
    console.error('Error: CSV file must contain a header row and at least one data row.');
    process.exit(1);
  }

  const headers = rows[0].map((h) => h.trim());
  const missingHeaders = ['id', 'title', 'date', 'location', 'venue'].filter(
    (h) => !headers.includes(h)
  );
  if (missingHeaders.length > 0) {
    console.error(`Error: CSV missing required column headers: ${missingHeaders.join(', ')}`);
    process.exit(1);
  }

  const parsedCompetitions = [];
  const errors = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const comp = {};

    headers.forEach((h, idx) => {
      const cell = row[idx] !== undefined ? row[idx].trim() : '';
      if (h === 'sanctioned') {
        comp[h] = ['true', '1', 'yes'].includes(cell.toLowerCase());
      } else if (cell === '' || cell.toLowerCase() === 'null') {
        comp[h] = null;
      } else {
        comp[h] = cell;
      }
    });

    const rowErrors = validateCompetition(comp, i + 1);
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      parsedCompetitions.push(comp);
    }
  }

  if (errors.length > 0) {
    console.error(`\nValidation FAILED with ${errors.length} error(s) in CSV:`);
    errors.forEach((e) => console.error(`  - ${e}`));
    console.error('\nImport aborted. No changes made.');
    process.exit(1);
  }

  console.log(`✓ Parsed and validated ${parsedCompetitions.length} competition(s) from CSV.`);

  const targetMode = options.target || 'auto'; // 'auto' | 'upcoming' | 'completed'
  const isDryRun = Boolean(options.dryRun);
  const today = new Date().toISOString().split('T')[0];

  let upcoming = readJSON(COMPETITIONS_PATH, []);
  let completed = readJSON(COMPLETED_PATH, []);

  const upcomingMap = new Map(upcoming.map((c) => [c.id, c]));
  const completedMap = new Map(completed.map((c) => [c.id, c]));

  let addedUpcoming = 0;
  let updatedUpcoming = 0;
  let addedCompleted = 0;
  let updatedCompleted = 0;

  parsedCompetitions.forEach((comp) => {
    let targetList = 'upcoming';

    if (targetMode === 'completed') {
      targetList = 'completed';
    } else if (targetMode === 'upcoming') {
      targetList = 'upcoming';
    } else {
      // Auto: if date < today or statusOverride is completed, send to completed
      if (comp.date < today || comp.statusOverride === 'completed') {
        targetList = 'completed';
        if (!comp.statusOverride) {
          comp.statusOverride = 'completed';
        }
      } else {
        targetList = 'upcoming';
      }
    }

    if (targetList === 'completed') {
      // Remove from upcoming if present
      upcomingMap.delete(comp.id);
      if (completedMap.has(comp.id)) {
        updatedCompleted++;
      } else {
        addedCompleted++;
      }
      completedMap.set(comp.id, comp);
    } else {
      // Remove from completed if present
      completedMap.delete(comp.id);
      if (upcomingMap.has(comp.id)) {
        updatedUpcoming++;
      } else {
        addedUpcoming++;
      }
      upcomingMap.set(comp.id, comp);
    }
  });

  const finalUpcoming = Array.from(upcomingMap.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
  const finalCompleted = Array.from(completedMap.values()).sort((a, b) => (a.date < b.date ? 1 : -1));

  console.log('\nImport Summary:');
  console.log(`  Upcoming Competitions:  +${addedUpcoming} new, ${updatedUpcoming} updated (Total: ${finalUpcoming.length})`);
  console.log(`  Completed Competitions: +${addedCompleted} new, ${updatedCompleted} updated (Total: ${finalCompleted.length})`);

  if (isDryRun) {
    console.log('\n[Dry Run] No files modified.');
    return;
  }

  fs.writeFileSync(COMPETITIONS_PATH, JSON.stringify(finalUpcoming, null, 2) + '\n', 'utf-8');
  fs.writeFileSync(COMPLETED_PATH, JSON.stringify(finalCompleted, null, 2) + '\n', 'utf-8');

  console.log(`\n✓ Successfully updated ${COMPETITIONS_PATH}`);
  console.log(`✓ Successfully updated ${COMPLETED_PATH}`);
}

// CLI Argument Parsing
const rawArgs = process.argv.slice(2);
const command = rawArgs[0];

if (!command || ['--help', '-h', 'help'].includes(command)) {
  console.log(`
Grip Australia Competition CSV Utility

Commands:
  template [outputPath]
      Generate a clean competitions CSV template with headers and examples.
      Default output: src/data/competitions_template.csv

  export [outputPath] [--source all|upcoming|completed]
      Export existing repository competitions into CSV format.
      Default output: src/data/competitions_export.csv

  import <csvFile> [--target auto|upcoming|completed] [--dry-run]
      Import or update competitions from a CSV file.
      --target auto (default): Routes past/completed events to completed_competitions.json
                               and future events to competitions.json.
      --dry-run:               Validate and preview changes without writing files.

Examples:
  node scripts/competitions-csv.js template
  node scripts/competitions-csv.js export
  node scripts/competitions-csv.js import src/data/competitions_template.csv --dry-run
  node scripts/competitions-csv.js import new_comps.csv
`);
  process.exit(0);
}

if (command === 'template') {
  const outPath = rawArgs[1];
  commandTemplate(outPath);
} else if (command === 'export') {
  let outPath = null;
  let source = 'all';
  for (let i = 1; i < rawArgs.length; i++) {
    if (rawArgs[i] === '--source' && rawArgs[i + 1]) {
      source = rawArgs[i + 1];
      i++;
    } else if (!rawArgs[i].startsWith('--')) {
      outPath = rawArgs[i];
    }
  }
  commandExport(outPath, { source });
} else if (command === 'import') {
  const csvFile = rawArgs[1];
  if (!csvFile || csvFile.startsWith('--')) {
    console.error('Error: You must specify a CSV file to import.');
    console.error('Usage: node scripts/competitions-csv.js import <path/to/file.csv> [--dry-run]');
    process.exit(1);
  }

  let target = 'auto';
  let dryRun = false;

  for (let i = 2; i < rawArgs.length; i++) {
    if (rawArgs[i] === '--target' && rawArgs[i + 1]) {
      target = rawArgs[i + 1];
      i++;
    } else if (rawArgs[i] === '--dry-run') {
      dryRun = true;
    }
  }

  commandImport(csvFile, { target, dryRun });
} else {
  console.error(`Unknown command: ${command}`);
  console.error("Run 'node scripts/competitions-csv.js --help' for usage.");
  process.exit(1);
}
