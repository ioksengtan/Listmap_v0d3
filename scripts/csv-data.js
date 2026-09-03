'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const ROOT = path.join(__dirname, '..');

/** Public Pages hashtags: drop anything outside this list rather than inventing labels. */
const ALLOWED_STORY_TAGS = ['去過', '想去', '渡假', '吃'];

function normalizeStoryTags(raw) {
  const allowed = new Set(ALLOWED_STORY_TAGS);
  const seen = new Set();
  const out = [];
  String(raw || '').split(',').forEach((token) => {
    const t = String(token || '').trim();
    if (!t || !allowed.has(t) || seen.has(t)) return;
    seen.add(t);
    out.push(t);
  });
  return out.join(',');
}

function readCsvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true });
}

function readCsv(filename) {
  return readCsvFile(path.join(ROOT, 'data', filename));
}

function toStory(r) {
  return {
    story_id: String(r.story_id || ''),
    collection_id: r.storyBook_id || r.collection_id || '',
    title: r.title || '',
    type: r.type || '',
    link: r.link || '',
    author: r.author || '',
    what: r.what || r.type || '',
    where: r.where || '',
    avatar: r.avatar || '',
    tags: normalizeStoryTags(r.tags),
    thumbnail: r.thumbnail || '',
    language: r.language || '',
    visibility: r.visibility || '',
    created_at: r.created_at || '',
    start_date: r.start_date || '',
    end_date: r.end_date || '',
  };
}

function toLandmark(r) {
  return {
    landmark_id: String(r.landmark_id || ''),
    story_id: String(r.story_id || ''),
    name: r.name || '',
    lat: r.lat,
    lng: r.lng,
    content: r.notes || r.content || '',
    link: r.link || '',
    address: r.address || '',
    tags: r.tags || '',
  };
}

function mergeCsv(mainFile, extraFile, mapFn) {
  const mainRows = readCsvFile(mainFile)
    .filter(r => r.is_delete !== '1')
    .map(mapFn);

  if (mainFile !== extraFile && fs.existsSync(extraFile)) {
    const extraRows = readCsvFile(extraFile)
      .filter(r => r.is_delete !== '1')
      .map(mapFn);
    return [...mainRows, ...extraRows];
  }
  return mainRows;
}

function readStories() {
  const realFile = path.join(ROOT, 'listmap - stories.csv');
  const extraFile = path.join(ROOT, 'data', 'stories.csv');
  const mainFile = fs.existsSync(realFile) ? realFile : extraFile;
  return mergeCsv(mainFile, extraFile, toStory);
}

function readLandmarks() {
  const realFile = path.join(ROOT, 'listmap - landmarks.csv');
  const extraFile = path.join(ROOT, 'data', 'landmarks.csv');
  const mainFile = fs.existsSync(realFile) ? realFile : extraFile;
  return mergeCsv(mainFile, extraFile, toLandmark);
}

function readCollections() {
  const filePath = path.join(ROOT, 'data', 'collections.csv');
  if (!fs.existsSync(filePath)) return [];
  return readCsvFile(filePath);
}

function readRoutes() {
  const filePath = path.join(ROOT, 'data', 'routes.csv');
  if (!fs.existsSync(filePath)) return [];
  return readCsvFile(filePath);
}

function buildStaticPayload() {
  return {
    stories: readStories(),
    landmarks: readLandmarks(),
    collections: readCollections(),
    routes: readRoutes(),
  };
}

module.exports = {
  ROOT,
  ALLOWED_STORY_TAGS,
  normalizeStoryTags,
  readCsv,
  readCsvFile,
  readStories,
  readLandmarks,
  readCollections,
  readRoutes,
  buildStaticPayload,
};
