import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getCompetitionStatus, getVenueDate, getNextVenueMidnight } from '../src/utils/competition-status.ts';

const competitions = JSON.parse(readFileSync('src/data/competitions.json', 'utf8'));
const kingKong = competitions.find((comp) => comp.id === 'king-kong-grip-2026');
const hoist = competitions.find((comp) => comp.id === 'hobart-hoist-2027');

test('registration and expiry follow venue midnight, including UTC dates still on the previous day', () => {
  for (const [comp, close, expiry] of [
    [kingKong, '2026-10-23T13:00:00Z', '2026-10-24T13:00:00Z'],
    [hoist, '2027-01-29T13:00:00Z', '2027-01-30T13:00:00Z'],
  ]) {
    assert.equal(getCompetitionStatus(comp, new Date(Date.parse(close) - 1)).status, 'registration_open');
    assert.equal(getCompetitionStatus(comp, new Date(close)).status, 'scheduled');
    assert.equal(getCompetitionStatus(comp, new Date(Date.parse(expiry) - 1)).isPast, false);
    assert.equal(getCompetitionStatus(comp, new Date(expiry)).status, 'completed');
    assert.equal(getCompetitionStatus({ ...comp, statusOverride: 'registration_open' }, new Date(close)).status, 'scheduled');
    assert.equal(getCompetitionStatus({ ...comp, statusOverride: 'registration_open' }, new Date(expiry)).isPast, true);
  }
});

test('cancelled and completed overrides stay inactive', () => {
  const now = new Date('2026-10-12T00:00:00Z');
  assert.equal(getCompetitionStatus({ ...hoist, statusOverride: 'cancelled' }, now).status, 'cancelled');
  assert.equal(getCompetitionStatus({ ...hoist, statusOverride: 'completed' }, now).isPast, true);
  assert.equal(getCompetitionStatus({ ...hoist, registrationUrl: null }, now).status, 'scheduled');
});

test('next venue midnight handles daylight-saving changes and different Australian venues', () => {
  for (const zone of ['Australia/Hobart', 'Australia/Sydney']) {
    for (const [start, end, hours] of [
      ['2026-10-03T14:00:00Z', '2026-10-04T13:00:00Z', 23],
      ['2027-04-03T13:00:00Z', '2027-04-04T14:00:00Z', 25],
    ]) {
      const midnight = getNextVenueMidnight(new Date(start), zone);
      assert.equal(midnight, Date.parse(end));
      assert.equal((midnight - Date.parse(start)) / 3600000, hours);
      assert.notEqual(getVenueDate(new Date(midnight - 1), zone), getVenueDate(new Date(midnight), zone));
    }
  }
  assert.equal(getNextVenueMidnight(new Date('2026-10-24T13:00:00Z'), 'Australia/Perth'), Date.parse('2026-10-24T16:00:00Z'));
  assert.equal(getNextVenueMidnight(new Date('2026-12-31T13:00:00Z'), 'Australia/Hobart'), Date.parse('2027-01-01T13:00:00Z'));
});

test('CSV round-trip, legacy timezone reuse, and invalid/new timezone rejection', () => {
  const workspace = mkdtempSync(path.join(tmpdir(), 'grip-competitions-'));
  try {
    mkdirSync(path.join(workspace, 'src/data'), { recursive: true });
    for (const file of ['competitions.json', 'completed_competitions.json']) {
      copyFileSync(path.resolve('src/data', file), path.join(workspace, 'src/data', file));
    }
    const run = (...args) => spawnSync(process.execPath, [path.resolve('scripts/competitions-csv.js'), ...args], {
      cwd: workspace, encoding: 'utf8',
    });
    const csv = path.join(workspace, 'export.csv');
    assert.equal(run('export', csv).status, 0);
    const before = readFileSync(path.join(workspace, 'src/data/competitions.json'), 'utf8');
    assert.equal(run('import', csv, '--target', 'auto').status, 0);
    const after = JSON.parse(readFileSync(path.join(workspace, 'src/data/competitions.json'), 'utf8'));
    assert.deepEqual(after, JSON.parse(before));

    const legacy = path.join(workspace, 'legacy.csv');
    const rows = readFileSync(csv, 'utf8').trimEnd().split('\n');
    const timezoneIndex = rows[0].split(',').indexOf('timeZone');
    writeFileSync(legacy, rows.map((row) => {
      const fields = row.split(',');
      fields.splice(timezoneIndex, 1);
      return fields.join(',');
    }).join('\n'));
    assert.equal(run('import', legacy).status, 0);
    assert.deepEqual(JSON.parse(readFileSync(path.join(workspace, 'src/data/competitions.json'), 'utf8')), after);

    const invalid = path.join(workspace, 'invalid.csv');
    writeFileSync(invalid, 'id,title,date,timeZone,location,venue,sanctioned\nnew,New,2027-01-30,,Hobart,Hobart,true\n');
    assert.equal(run('import', invalid).status, 1);
    writeFileSync(invalid, 'id,title,date,timeZone,location,venue,sanctioned\nnew,New,2027-01-30,Australia/Invalid,Hobart,Hobart,true\n');
    assert.equal(run('import', invalid).status, 1);
    assert.deepEqual(JSON.parse(readFileSync(path.join(workspace, 'src/data/competitions.json'), 'utf8')), after);

    const validate = () => spawnSync(process.execPath, [path.resolve('scripts/validate-data.js')], {
      cwd: workspace, encoding: 'utf8',
    });
    for (const timeZone of [undefined, 'Australia/Invalid', false, 0, '+11:00']) {
      writeFileSync(path.join(workspace, 'src/data/competitions.json'), JSON.stringify([{ ...hoist, timeZone }]));
      const result = validate();
      assert.equal(result.status, 1);
      assert.match(result.stderr, /timeZone/);
    }
    writeFileSync(path.join(workspace, 'src/data/competitions.json'), JSON.stringify([{ ...hoist, timeZone: 'UTC' }]));
    assert.equal(validate().status, 0);
  } finally {
    assert.equal(path.dirname(workspace), path.resolve(tmpdir()));
    rmSync(workspace, { recursive: true });
  }
});
