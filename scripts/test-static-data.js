#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, buildStaticPayload, normalizeStoryTags } = require('./csv-data');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL: ' + msg);
    process.exit(1);
  }
}

const payload = buildStaticPayload();
assert(payload.stories.length > 0, 'expected stories');
assert(payload.landmarks.length > 0, 'expected landmarks');

const s1010 = payload.stories.find(s => s.story_id === '1010');
assert(s1010, 'story 1010 missing');
assert(/交通/.test(s1010.title), 'story 1010 title');
assert(s1010.author, 'story 1010 author');

const lm1010 = payload.landmarks.filter(l => l.story_id === '1010');
assert(lm1010.length >= 2, 'story 1010 landmarks');
assert(lm1010.every(l => l.lat && l.lng), 'story 1010 coords');

const s258 = payload.stories.find(s => s.story_id === '258');
assert(s258, 'story 258 missing');
assert(payload.landmarks.some(l => l.story_id === '258'), 'story 258 landmarks');

const col101 = payload.collections.find(c => c.collection_id === '101');
assert(col101, 'collection 101 missing');

const blogJs = fs.readFileSync(path.join(ROOT, 'js', 'blog.js'), 'utf8');
assert(!/appUrl\s*=\s*'\/api'/.test(blogJs), 'blog.js still hardcodes /api');
assert(!/\$\.get\(\s*appUrl/.test(blogJs), 'blog.js still $.get(appUrl)');

const indexJs = fs.readFileSync(path.join(ROOT, 'js', 'index.js'), 'utf8');
assert(!/appUrl\s*=\s*'\/api'/.test(indexJs), 'index.js still hardcodes /api');
assert(indexJs.includes('ListmapData'), 'index.js should use ListmapData');

const s1024 = payload.stories.find(s => s.story_id === '1024');
assert(s1024, 'story 1024 missing');
assert(s1024.title === '新竹牛肉麵五選', 'story 1024 title');
assert(s1024.author === 'Yu-Sheng', 'story 1024 author');
assert(s1024.tags === '吃,去過', 'story 1024 tags must be 吃,去過 (quoted CSV field)');
assert(s1024.visibility === 'public', 'story 1024 visibility must stay public (not shifted by unquoted tags)');
assert(s1024.thumbnail === '', 'story 1024 thumbnail must stay empty');
assert(s1024.avatar === '', 'story 1024 avatar must stay empty');
assert(!payload.stories.some(s => s.story_id === '1022' || s.story_id === '1023'), 'S1022/S1023 should not be added');

const lm1024 = payload.landmarks.filter(l => l.story_id === '1024');
assert(lm1024.length === 5, 'story 1024 should have 5 landmarks');
['475', '476', '477', '478', '479'].forEach(id => {
  const lm = lm1024.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1024');
  assert(lm.lat && lm.lng, 'landmark ' + id + ' coords');
});
assert(lm1024.find(l => l.landmark_id === '476').name === '璽子牛肉麵', '璽子 spelling');
assert(lm1024.find(l => l.landmark_id === '475').content.includes('城隍廟'), '城隍廟 in 475 content');
assert(lm1024.find(l => l.landmark_id === '475').content.includes('清燉'), '清燉 in 475 content');

const blogHtml = fs.readFileSync(path.join(ROOT, 'blog.html'), 'utf8');
const m1024 = blogHtml.match(/data-story-id="1024"[\s\S]*?<\/section>/);
assert(m1024, 'blog.html missing story 1024 section');
assert(!/javascript:zoomto/.test(m1024[0]), 'story 1024 must not use javascript:zoomto');
assert((m1024[0].match(/class="map-place-link"/g) || []).length >= 5, 'story 1024 place links');
assert(blogJs.includes('zoomToLandmarkId'), 'blog.js should zoom from static landmark JSON');

const staticJsonPath = path.join(ROOT, 'data', 'static.json');
assert(fs.existsSync(staticJsonPath), 'data/static.json missing — run npm run compile-data');
const onDisk = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
assert(onDisk.stories.some(s => s.story_id === '1010'), 'checked-in JSON missing 1010');
assert(onDisk.landmarks.some(l => l.story_id === '1010'), 'checked-in JSON missing 1010 landmarks');
assert(onDisk.stories.some(s => s.story_id === '1024'), 'checked-in JSON missing 1024');
assert(onDisk.landmarks.filter(l => l.story_id === '1024').length === 5, 'checked-in JSON missing 1024 landmarks');
const onDisk1024 = onDisk.stories.find(s => s.story_id === '1024');
assert(onDisk1024.tags === '吃,去過', 'checked-in JSON S1024 tags');
assert(onDisk1024.visibility === 'public', 'checked-in JSON S1024 visibility');
assert(onDisk1024.thumbnail === '', 'checked-in JSON S1024 thumbnail');

assert(normalizeStoryTags('吃,去過') === '吃,去過', 'normalize keeps allowed tags');
assert(normalizeStoryTags('吃, unknown,去過,想去') === '吃,去過,想去', 'normalize drops unknown tokens');
assert(normalizeStoryTags('bucket list') === '', 'normalize drops non-vocab tags');
assert(normalizeStoryTags('吃,吃,去過') === '吃,去過', 'normalize de-dupes');

const storiesCsv = fs.readFileSync(path.join(ROOT, 'data', 'stories.csv'), 'utf8');
assert(/1024,,新竹牛肉麵五選,blog,,Yu-Sheng,blog,Hsinchu,,"吃,去過",,public,2026-09-02,,/.test(storiesCsv),
  'S1024 CSV row must quote the tags field so 吃,去過 stay in tags');
assert(!/Hsinchu,,,吃,去過,,public/.test(storiesCsv), 'S1024 must not split unquoted tags into thumbnail/visibility');

assert(blogJs.includes('injectStoryHashtags'), 'blog.js should render story hashtags');
assert(indexJs.includes('hashtagsHtml'), 'index.js should render story hashtags on homepage list');
assert(fs.readFileSync(path.join(ROOT, 'js', 'static-data.js'), 'utf8').includes('parseAllowedTags'),
  'static-data.js should filter tags to the public vocabulary');

console.log('OK: static data compile + Pages wiring checks passed');
console.log('  stories=' + payload.stories.length + ' landmarks=' + payload.landmarks.length);
