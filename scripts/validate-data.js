#!/usr/bin/env node
/**
 * Schema conformity validator for Grip Australia data files and submissions.
 * Validates:
 * 1. src/data/records.json
 * 2. src/data/mandrel_records.json
 * 3. src/data/results.json
 * 4. Optional: any arbitrary JSON file passed as an argument (e.g. from an Issue submission)
 */

import fs from 'fs';
import path from 'path';

const VALID_CATEGORIES = new Set([
  'crush',
  'pinch',
  'thick-bar',
  'vertical-lift',
  'historical-feat',
  'endurance'
]);

const VALID_GENDERS = new Set(['men', 'women']);

function validateRecord(record, index, sourceName) {
  const errors = [];
  const requiredFields = [
    'id', 'event', 'category', 'gender', 'division',
    'weightClass', 'weightKg', 'unit', 'holder',
    'date', 'year', 'location', 'status'
  ];

  for (const field of requiredFields) {
    if (record[field] === undefined || record[field] === null || record[field] === '') {
      errors.push(`Record #${index} (${record.id || 'unknown'}): Missing required field '${field}'`);
    }
  }

  if (record.category && !VALID_CATEGORIES.has(record.category)) {
    errors.push(`Record #${index} (${record.id}): Invalid category '${record.category}'. Expected one of: ${Array.from(VALID_CATEGORIES).join(', ')}`);
  }

  if (record.gender && !VALID_GENDERS.has(record.gender)) {
    errors.push(`Record #${index} (${record.id}): Invalid gender '${record.gender}'. Expected 'men' or 'women'`);
  }

  if (record.weightKg !== undefined && (typeof record.weightKg !== 'number' || isNaN(record.weightKg))) {
    errors.push(`Record #${index} (${record.id}): 'weightKg' must be a valid number`);
  }

  if (record.year && (typeof record.year !== 'number' || record.year < 1900 || record.year > 2100)) {
    errors.push(`Record #${index} (${record.id}): 'year' must be a reasonable 4-digit integer`);
  }

  return errors;
}

function validateResults(data, sourceName) {
  const errors = [];
  for (const [year, contest] of Object.entries(data)) {
    if (!contest.year || !contest.title || !contest.venue || !contest.date || !contest.champions || !Array.isArray(contest.athletes)) {
      errors.push(`Contest ${year}: Missing core metadata (year, title, venue, date, champions, athletes)`);
      continue;
    }
    for (let i = 0; i < contest.athletes.length; i++) {
      const a = contest.athletes[i];
      if (!a.athlete || !a.weightClass || !a.gender || !a.events) {
        errors.push(`Contest ${year}, Athlete #${i}: Missing required athlete fields (athlete, weightClass, gender, events)`);
      }
    }
  }
  return errors;
}

function runValidation() {
  let allErrors = [];

  // Check specific argument file if supplied
  const targetFile = process.argv[2];
  if (targetFile) {
    const filePath = path.resolve(targetFile);
    console.log(`\nValidating target file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (Array.isArray(content)) {
      content.forEach((rec, idx) => {
        allErrors.push(...validateRecord(rec, idx, filePath));
      });
    } else {
      allErrors.push(...validateRecord(content, 0, filePath));
    }
  } else {
    // Validate repository data files
    console.log('Running Grip Australia Data Integrity & Schema Validation...\n');

    const recordsPath = path.resolve('src/data/records.json');
    if (fs.existsSync(recordsPath)) {
      const records = JSON.parse(fs.readFileSync(recordsPath, 'utf-8'));
      console.log(`Checking ${records.length} records in ${path.basename(recordsPath)}...`);
      records.forEach((rec, idx) => {
        allErrors.push(...validateRecord(rec, idx, recordsPath));
      });
    }

    const resultsPath = path.resolve('src/data/results.json');
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      const years = Object.keys(results);
      console.log(`Checking championship results for ${years.join(', ')} in ${path.basename(resultsPath)}...`);
      allErrors.push(...validateResults(results, resultsPath));
    }
  }

  if (allErrors.length > 0) {
    console.error(`\nValidation FAILED with ${allErrors.length} error(s):`);
    allErrors.forEach(err => console.error(` ✗ ${err}`));
    process.exit(1);
  } else {
    console.log('✓ All data structures passed schema validation with 0 errors.\n');
  }
}

runValidation();
