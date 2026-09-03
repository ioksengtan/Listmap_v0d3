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

const staticJsonPath = path.join(ROOT, 'data', 'static.json');
assert(fs.existsSync(staticJsonPath), 'data/static.json missing — run npm run compile-data');
const onDisk = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
assert(onDisk.stories.some(s => s.story_id === '1010'), 'checked-in JSON missing 1010');
assert(onDisk.landmarks.some(l => l.story_id === '1010'), 'checked-in JSON missing 1010 landmarks');
assert(onDisk.stories.some(s => s.story_id === '1024'), 'checked-in JSON missing 1024');
assert(onDisk.landmarks.filter(l => l.story_id === '1024').length === 5, 'checked-in JSON missing 1024 landmarks');

// i18n: chrome dictionary + story overlays (no duplicate CSV rows, no /api)
const langJs = fs.readFileSync(path.join(ROOT, 'js', 'language.js'), 'utf8');
assert(langJs.includes('ListmapI18n'), 'language.js should export ListmapI18n');
assert(langJs.includes("'zh-TW'"), 'language.js Traditional Chinese locale');
assert(langJs.includes("'nav.home'"), 'language.js chrome keys');
assert(langJs.includes('data/story-i18n.json'), 'language.js loads static story-i18n JSON');
assert(!/\/api/.test(langJs), 'language.js must not call /api');

const vm = require('vm');
const sandbox = {
  window: {
    localStorage: { getItem: function () { return null; }, setItem: function () {} }
  },
  console: console
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(langJs, sandbox);
const I18n = sandbox.window.ListmapI18n;
assert(I18n, 'ListmapI18n attached to window');
assert(I18n.detectLocaleFrom(['en-US']) === 'en', 'en-US → en');
assert(I18n.detectLocaleFrom(['en']) === 'en', 'en → en');
assert(I18n.detectLocaleFrom(['zh-TW']) === 'zh-TW', 'zh-TW stays');
assert(I18n.detectLocaleFrom(['zh-Hant-TW']) === 'zh-TW', 'zh-Hant → zh-TW');
assert(I18n.detectLocaleFrom(['ja-JP']) === 'zh-TW', 'unknown browser language falls back to zh-TW');
assert(I18n.detectLocaleFrom(['zh-CN']) === 'zh-TW', 'zh-CN falls back to Traditional Chinese');
assert(I18n.detectLocaleFrom([]) === 'zh-TW', 'empty languages → zh-TW');
I18n.setLocale('en', { persist: false, force: true });
assert(I18n.t('nav.home') === 'Home', 'English chrome');
I18n.setLocale('zh-TW', { persist: false, force: true });
assert(I18n.t('nav.home') === '首頁', 'Traditional Chinese chrome');

const storyI18nPath = path.join(ROOT, 'data', 'story-i18n.json');
assert(fs.existsSync(storyI18nPath), 'data/story-i18n.json missing');
const storyI18n = JSON.parse(fs.readFileSync(storyI18nPath, 'utf8'));
assert(storyI18n['1024'] && storyI18n['1024'].en, 'S1024 English overlay');
assert(/Hsinchu/i.test(storyI18n['1024'].en.title), 'S1024 English title');
assert((storyI18n['1024'].en.html.match(/class="map-place-link"/g) || []).length >= 5, 'S1024 EN place links');
['475', '476', '477', '478', '479'].forEach(id => {
  assert(storyI18n['1024'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1024 EN landmark ' + id);
});
assert(storyI18n['1024'].en.html.indexOf('璽子牛肉麵') !== -1, 'S1024 EN keeps original shop name');
assert(!storyI18n['1024']['zh-TW'], 'do not duplicate Traditional Chinese body in story-i18n.json');
assert(storyI18n['1002'] && storyI18n['1002'].en && storyI18n['1002'].en.html, 'Tokyo S1002 English overlay');
assert(!onDisk.stories.filter(s => s.story_id === '1024').length || onDisk.stories.filter(s => s.story_id === '1024').length === 1, 'S1024 must not duplicate CSV rows');
assert(onDisk.landmarks.find(l => l.story_id === '1024' && l.landmark_id === '476').name === '璽子牛肉麵', 'pin name stays original in static JSON');

assert(blogHtml.includes('data-lang="zh-TW"') && blogHtml.includes('data-lang="en"'), 'blog language switcher');
assert(blogHtml.includes('data-i18n="nav.home"'), 'blog chrome through data-i18n');
assert(blogHtml.includes('data-i18n-story="1024"'), 'blog S1024 overlay hooks');
assert(blogJs.includes('ListmapI18n'), 'blog.js uses ListmapI18n');
assert(blogJs.includes('invalidateSize'), 'language switch should invalidateSize');
assert(/function afterLanguageChange\(\) \{\s*refreshDynamicI18n\(\);[\s\S]*?invalidateSize/.test(blogJs), 'afterLanguageChange invalidateSize');
const afterLang = blogJs.match(/function afterLanguageChange\(\) \{[\s\S]*?\n    \}/);
assert(afterLang && !/initMap/.test(afterLang[0]), 'language switch must not re-init the map');
assert(!/location\.reload/.test(blogJs), 'language switch must not reload the page');
assert(/bindPopup\('<b>' \+ lm\.name/.test(blogJs), 'pin popup uses original landmark name');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(indexHtml.includes('data-i18n="nav.home"'), 'homepage chrome through data-i18n');
assert(indexHtml.includes('data-lang="en"'), 'homepage language switcher');
assert(indexJs.includes('ListmapI18n'), 'index.js uses ListmapI18n');
assert(indexJs.includes('invalidateSize'), 'homepage language switch invalidateSize');

console.log('OK: static data compile + Pages wiring checks passed');
console.log('  stories=' + payload.stories.length + ' landmarks=' + payload.landmarks.length);
