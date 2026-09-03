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

const s1025 = payload.stories.find(s => s.story_id === '1025');
assert(s1025, 'story 1025 missing');
assert(s1025.title === '陽明山：住一晚，走兩天', 'story 1025 title');
assert(s1025.author === 'Yu-Sheng', 'story 1025 author');
assert(s1025.where === 'Yangmingshan', 'story 1025 where');
assert(s1025.tags === '去過,渡假', 'story 1025 tags must be 去過,渡假 (quoted CSV field)');
assert(s1025.visibility === 'public', 'story 1025 visibility must stay public (not shifted by unquoted tags)');
assert(s1025.thumbnail === '', 'story 1025 thumbnail must stay empty');
assert(s1025.avatar === '', 'story 1025 avatar must stay empty');

const lm1025 = payload.landmarks.filter(l => l.story_id === '1025');
assert(lm1025.length === 6, 'story 1025 should have 6 landmarks');
const lm1025Expected = {
  '480': { name: '陽明山天籟渡假酒店', content: '新北市金山區名流路1-7號。渡假健身基地。弱酸泉。' },
  '481': { name: '七星山主峰', content: '週六。從小油坑上。' },
  '482': { name: '小油坑', content: '週六停車與登山口。短陡、噴氣孔。' },
  '483': { name: '金包里城門', content: '週日魚路北段。' },
  '484': { name: '憨丙厝地', content: '魚路北段。補草鞋遺跡。' },
  '485': { name: '上磺溪停車場', content: '魚路北段近金山側。' }
};
Object.keys(lm1025Expected).forEach(id => {
  const lm = lm1025.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1025');
  assert(lm.lat && lm.lng, 'landmark ' + id + ' coords');
  assert(lm.name === lm1025Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1025Expected[id].content, 'landmark ' + id + ' PM content');
});

const blogHtml = fs.readFileSync(path.join(ROOT, 'blog.html'), 'utf8');
const m1024 = blogHtml.match(/data-story-id="1024"[\s\S]*?<\/section>/);
assert(m1024, 'blog.html missing story 1024 section');
assert(!/javascript:zoomto/.test(m1024[0]), 'story 1024 must not use javascript:zoomto');
assert((m1024[0].match(/class="map-place-link"/g) || []).length >= 5, 'story 1024 place links');
const m1025 = blogHtml.match(/data-story-id="1025"[\s\S]*?<\/section>/);
assert(m1025, 'blog.html missing story 1025 section');
assert(!/javascript:zoomto/.test(m1025[0]), 'story 1025 must not use javascript:zoomto');
assert(!/\/api/.test(m1025[0]), 'story 1025 must not call /api');
assert((m1025[0].match(/class="map-place-link"/g) || []).length >= 9, 'story 1025 place links');
['480', '481', '482', '483', '484', '485'].forEach(id => {
  assert(m1025[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1025 section landmark ' + id);
});
assert(m1025[0].includes('補口氣——以前過路人在這補草鞋'), 'story 1025 keeps 憨丙厝地 補草鞋 line');
assert(blogHtml.includes("loadStoryById('1025')"), 'blog index card for S1025');
assert(blogHtml.includes('data-i18n-story="1025"'), 'blog S1025 overlay hooks');
assert(blogJs.includes("story_id: '1025'"), 'blog.js index markers include S1025');
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
const onDisk1024 = onDisk.stories.find(s => s.story_id === '1024');
assert(onDisk1024.tags === '吃,去過', 'checked-in JSON S1024 tags');
assert(onDisk1024.visibility === 'public', 'checked-in JSON S1024 visibility');
assert(onDisk1024.thumbnail === '', 'checked-in JSON S1024 thumbnail');
assert(onDisk.stories.some(s => s.story_id === '1025'), 'checked-in JSON missing 1025');
assert(onDisk.landmarks.filter(l => l.story_id === '1025').length === 6, 'checked-in JSON missing 1025 landmarks');
const onDisk1025 = onDisk.stories.find(s => s.story_id === '1025');
assert(onDisk1025.tags === '去過,渡假', 'checked-in JSON S1025 tags');
assert(onDisk1025.visibility === 'public', 'checked-in JSON S1025 visibility');
assert(onDisk1025.thumbnail === '', 'checked-in JSON S1025 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1025' && l.landmark_id === '480').content.includes('弱酸泉'), 'checked-in JSON 480 PM blurb');
assert(onDisk.landmarks.find(l => l.story_id === '1025' && l.landmark_id === '484').content === '魚路北段。補草鞋遺跡。', 'checked-in JSON 484 PM blurb');

assert(normalizeStoryTags('吃,去過') === '吃,去過', 'normalize keeps allowed tags');
assert(normalizeStoryTags('吃, unknown,去過,想去') === '吃,去過,想去', 'normalize drops unknown tokens');
assert(normalizeStoryTags('bucket list') === '', 'normalize drops non-vocab tags');
assert(normalizeStoryTags('吃,吃,去過') === '吃,去過', 'normalize de-dupes');

const storiesCsv = fs.readFileSync(path.join(ROOT, 'data', 'stories.csv'), 'utf8');
assert(/1024,,新竹牛肉麵五選,blog,,Yu-Sheng,blog,Hsinchu,,"吃,去過",,public,2026-09-02,,/.test(storiesCsv),
  'S1024 CSV row must quote the tags field so 吃,去過 stay in tags');
assert(!/Hsinchu,,,吃,去過,,public/.test(storiesCsv), 'S1024 must not split unquoted tags into thumbnail/visibility');
assert(/1025,,陽明山：住一晚，走兩天,blog,,Yu-Sheng,blog,Yangmingshan,,"去過,渡假",,public,2026-09-04,,/.test(storiesCsv),
  'S1025 CSV row must quote the tags field so 去過,渡假 stay in tags');
assert(!/Yangmingshan,,,去過,渡假,,public/.test(storiesCsv), 'S1025 must not split unquoted tags into thumbnail/visibility');

assert(blogJs.includes('injectStoryHashtags'), 'blog.js should render story hashtags');
assert(/function refreshDynamicI18n\(\) \{[\s\S]*injectStoryHashtags\(vis/.test(blogJs),
  'language overlay must re-inject hashtags after replacing story HTML');
assert(indexJs.includes('hashtagsHtml'), 'index.js should render story hashtags on homepage list');
assert(fs.readFileSync(path.join(ROOT, 'js', 'static-data.js'), 'utf8').includes('parseAllowedTags'),
  'static-data.js should filter tags to the public vocabulary');

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
assert(storyI18n['1025'] && storyI18n['1025'].en, 'S1025 English overlay');
assert(/Yangmingshan/i.test(storyI18n['1025'].en.title), 'S1025 English title');
assert((storyI18n['1025'].en.html.match(/class="map-place-link"/g) || []).length >= 9, 'S1025 EN place links');
['480', '481', '482', '483', '484', '485'].forEach(id => {
  assert(storyI18n['1025'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1025 EN landmark ' + id);
});
assert(storyI18n['1025'].en.html.indexOf('javascript:zoomto') === -1, 'S1025 EN must not use javascript:zoomto');
assert(storyI18n['1025'].en.html.indexOf('憨丙厝地') !== -1, 'S1025 EN keeps 憨丙厝地 name');
assert(storyI18n['1025'].en.html.indexOf('catch your breath') !== -1 || storyI18n['1025'].en.html.indexOf('補草鞋') !== -1,
  'S1025 EN keeps the straw-sandal rest line');
assert(!storyI18n['1025']['zh-TW'], 'do not duplicate Traditional Chinese body for S1025 in story-i18n.json');
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

assert(indexHtml.includes('data-i18n="nav.home"'), 'homepage chrome through data-i18n');
assert(indexHtml.includes('data-lang="en"'), 'homepage language switcher');
assert(indexJs.includes('ListmapI18n'), 'index.js uses ListmapI18n');
assert(indexJs.includes('invalidateSize'), 'homepage language switch invalidateSize');

console.log('OK: static data compile + Pages wiring checks passed');
console.log('  stories=' + payload.stories.length + ' landmarks=' + payload.landmarks.length);
