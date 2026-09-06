#!/usr/bin/env node
'use strict';

// Concurrent branches each compute "current max id + 1" from their own stale
// checkout. Two branches appending a row with the same story_id/landmark_id
// merge cleanly as far as git is concerned — it's just two new lines — so the
// collision produces silently duplicated ids instead of a merge conflict.
// This script is the check that catches it instead: run via `npm test`,
// `npm run compile-data`, and in CI on every push/PR.
//
// Scoped to data/stories.csv + data/landmarks.csv only — the files SPEC.md
// and CLAUDE.md name as the source of truth for new content. The legacy
// root-level "listmap - stories.csv" / "listmap - landmarks.csv" (old Google
// Sheets exports) are a separate, known overlap handled elsewhere; see
// scripts/csv-data.js's mergeCsv, which is why the id ranges below don't need
// to stay clear of that file too.

const { readCsv } = require('./csv-data');

function findDuplicates(rows, idField, label) {
  const seen = new Map();
  rows.forEach((row) => {
    const id = row[idField];
    if (!id) return;
    if (!seen.has(id)) seen.set(id, []);
    seen.get(id).push(row);
  });

  const dupes = [...seen.entries()].filter(([, list]) => list.length > 1);
  if (!dupes.length) return true;

  console.error(`\nDuplicate ${label} found:`);
  dupes.forEach(([id, list]) => {
    console.error(`  ${idField}=${id} used ${list.length} times:`);
    list.forEach((row) => {
      const desc = row.title || row.name || '';
      console.error(`    - ${desc}`);
    });
  });
  return false;
}

const storiesOk = findDuplicates(readCsv('stories.csv'), 'story_id', 'story_id (data/stories.csv)');
const landmarksOk = findDuplicates(readCsv('landmarks.csv'), 'landmark_id', 'landmark_id (data/landmarks.csv)');

if (!storiesOk || !landmarksOk) {
  console.error('\nRenumber one side using the highest id on origin/master, not a stale local checkout.');
  process.exit(1);
}

console.log('No duplicate story_id or landmark_id found.');
