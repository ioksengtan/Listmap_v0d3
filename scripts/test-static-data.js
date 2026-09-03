#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, buildStaticPayload } = require('./csv-data');

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

const mapJs = fs.readFileSync(path.join(ROOT, 'js', 'map.js'), 'utf8');
assert(mapJs.includes('invalidateSize'), 'map.js should call invalidateSize on resize');
assert(mapJs.includes('orientationchange'), 'map.js should invalidateSize on orientation change');
assert((mapJs.match(/L\.map\(/g) || []).length >= 1, 'map.js should create a Leaflet map');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(/name="viewport"/.test(blogHtml), 'blog.html needs viewport for mobile media queries');
assert(/name="viewport"/.test(indexHtml), 'index.html needs viewport for mobile media queries');
assert(/class="row map-split"/.test(blogHtml), 'blog.html should use one map-split row');
assert(/class="row map-split"/.test(indexHtml), 'index.html should use one map-split row');
assert(!fs.existsSync(path.join(ROOT, 'blog_m.html')), 'do not add a separate mobile blog HTML');
assert(!fs.existsSync(path.join(ROOT, 'index_m.html')), 'do not add a separate mobile homepage HTML');

const blogCss = fs.readFileSync(path.join(ROOT, 'css', 'blog.css'), 'utf8');
const indexCss = fs.readFileSync(path.join(ROOT, 'css', 'index.css'), 'utf8');
assert(/@media \(max-width:\s*767/.test(blogCss), 'blog.css needs a narrow-screen breakpoint');
assert(/@media \(max-width:\s*767/.test(indexCss), 'index.css needs a narrow-screen breakpoint');
assert(/flex-direction:\s*column/.test(blogCss), 'blog.css should stack map above copy on narrow screens');
assert(/flex-direction:\s*column/.test(indexCss), 'index.css should stack map above copy on narrow screens');
assert(!/javascript:zoomto/.test(indexJs), 'index.js must not use javascript:zoomto');

const aboutHtml = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');
const aboutJs = fs.readFileSync(path.join(ROOT, 'js', 'about.js'), 'utf8');

assert(/個人地圖故事/.test(indexHtml), 'homepage copy should say 個人地圖故事');
assert(/個人地圖故事/.test(aboutHtml), 'about copy should say 個人地圖故事');
assert(/blog\.html#1024/.test(indexHtml), 'homepage should CTA to blog.html#1024');
assert(/blog\.html#1024/.test(aboutHtml), 'about should CTA to blog.html#1024');
assert(!/href=["']\/api/.test(indexHtml), 'index.html must not link to /api');
assert(!/href=["']\/api/.test(aboutHtml), 'about.html must not link to /api');
assert(!/>API<\/a>/.test(indexHtml), 'index must not hero a dead API nav item');
assert(!/>API<\/a>/.test(aboutHtml), 'about must not hero a dead API nav item');
assert(!/appUrl\s*=\s*'\/api'/.test(aboutJs), 'about.js must not hardcode /api');
assert(!/-34\.003646/.test(indexHtml), 'wrong Kyushu/Cape Town coords must not be on homepage');
assert(!/map_kyushu/.test(indexHtml), 'Kyushu image map must not be the homepage hero');
assert(!/javascript:zoomto/.test(indexHtml), 'homepage must not use javascript:zoomto');

const markerBlock = blogJs.match(/var INDEX_MARKERS = \[([\s\S]*?)\];/);
assert(markerBlock, 'INDEX_MARKERS must be defined');
assert(/story_id:\s*'1024'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1024');
assert(!/story_id:\s*'1001'/.test(markerBlock[1]), 'INDEX_MARKERS must not hero internal Heidelberg');
assert(!/story_id:\s*'258'/.test(markerBlock[1]), 'INDEX_MARKERS must not hero NY test story');
assert(!/collection_id:\s*'101'/.test(markerBlock[1]), 'INDEX_MARKERS must not hero Tokyo collection');
assert(indexJs.includes('HOMEPAGE_STORY_IDS'), 'index.js should allowlist homepage stories');
assert(/HOMEPAGE_STORY_IDS\s*=\s*\[['"]1024['"]\]/.test(indexJs), 'homepage list should only hero S1024');

const welcomeMatch = blogHtml.match(/id="blog-welcome"[\s\S]*?<section data-story-id="1001"/);
assert(welcomeMatch, 'blog welcome should precede story 1001 section');
assert(/個人地圖故事/.test(welcomeMatch[0]), 'blog index should say 個人地圖故事');
assert(/loadStoryById\('1024'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1024');
assert(!/loadStoryById\('1001'\)/.test(welcomeMatch[0]), 'blog welcome must not hero Heidelberg');
assert(!/loadStoryById\('258'\)/.test(welcomeMatch[0]), 'blog welcome must not hero NY test');
assert(!/loadCollectionById\('101'\)/.test(welcomeMatch[0]), 'blog welcome must not hero Tokyo collection');

const staticJsonPath = path.join(ROOT, 'data', 'static.json');
assert(fs.existsSync(staticJsonPath), 'data/static.json missing — run npm run compile-data');
const onDisk = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
assert(onDisk.stories.some(s => s.story_id === '1010'), 'checked-in JSON missing 1010');
assert(onDisk.landmarks.some(l => l.story_id === '1010'), 'checked-in JSON missing 1010 landmarks');
assert(onDisk.stories.some(s => s.story_id === '1024'), 'checked-in JSON missing 1024');
assert(onDisk.landmarks.filter(l => l.story_id === '1024').length === 5, 'checked-in JSON missing 1024 landmarks');

console.log('OK: static data compile + Pages wiring checks passed');
console.log('  stories=' + payload.stories.length + ' landmarks=' + payload.landmarks.length);
