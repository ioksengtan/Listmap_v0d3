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

const s1027 = payload.stories.find(s => s.story_id === '1027');
assert(s1027, 'story 1027 missing');
assert(s1027.title === '東京桌上遊戲市集：怎麼住幕張、哪天充電（2026 秋）', 'story 1027 title');
assert(s1027.author === 'Yu-Sheng', 'story 1027 author');
assert(s1027.where === 'Makuhari', 'story 1027 where');
assert(s1027.tags === '渡假,想去', 'story 1027 tags must be 渡假,想去 (quoted CSV field)');
assert(s1027.visibility === 'public', 'story 1027 visibility must stay public (not shifted by unquoted tags)');
assert(s1027.thumbnail === '', 'story 1027 thumbnail must stay empty');
assert(s1027.avatar === '', 'story 1027 avatar must stay empty');

const lm1027 = payload.landmarks.filter(l => l.story_id === '1027');
assert(lm1027.length === 4, 'story 1027 should have 4 landmarks');
const lm1027Expected = {
  '491': { name: '幕張メッセ', content: 'ゲームマーケット2026秋會場。展示ホール1–5。不是Big Sight。不畫攤位。', lat: '35.6473', lng: '140.0347' },
  '492': { name: '海浜幕張駅', content: '住宿軸。可10/16先住。メッセ步行約5分。', lat: '35.6487', lng: '140.0415' },
  '493': { name: '幕張海浜公園', content: '充電。走或騎。展後降音量。', lat: '35.6454', lng: '140.0419' },
  '494': { name: '幕張温泉 湯楽の里', content: '充電。美浜区／JFA夢フィールド。試遊後泡湯。', lat: '35.6360', lng: '140.0396' }
};
Object.keys(lm1027Expected).forEach(id => {
  const lm = lm1027.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1027');
  assert(lm.lat === lm1027Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm1027Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm1027Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1027Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(lm1027.find(l => l.landmark_id === '494').content.includes('美浜区／JFA夢フィールド'), '494 uses PM JFA copy, not 美浜区美浜26');
assert(!lm1027.find(l => l.landmark_id === '494').content.includes('美浜区美浜26'), '494 must not keep CC 美浜区美浜26');
assert(lm1027.find(l => l.landmark_id === '491').link === 'https://www.gamemarket.jp/gamemarket/2026a', '491 official link');
assert(lm1027.find(l => l.landmark_id === '494').link === 'https://www.yurakirari.com/makuhari/', '494 yurakirari link');

const m1027 = blogHtml.match(/data-story-id="1027"[\s\S]*?<\/section>/);
assert(m1027, 'blog.html missing story 1027 section');
assert(!/javascript:zoomto/.test(m1027[0]), 'story 1027 must not use javascript:zoomto');
assert(!/\/api/.test(m1027[0]), 'story 1027 must not call /api');
assert((m1027[0].match(/class="map-place-link"/g) || []).length === 4, 'story 1027 place links');
['491', '492', '493', '494'].forEach(id => {
  assert(m1027[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1027 section landmark ' + id);
});
assert(m1027[0].includes('data-landmark="492"') && m1027[0].includes('海浜幕張'), 'story 1027 station link says 海浜幕張');
assert(m1027[0].includes('幕張，不要新宿來回'), 'story 1027 v5 heading: stay in Makuhari, not Shinjuku commutes');
assert(m1027[0].includes('兩天在會場，另外留一天給腿'), 'story 1027 v5 heading: two hall days plus a day for the legs');
assert(m1027[0].includes('先住下來'), 'story 1027 v5 heading: check in first');
assert(!/javascript:zoomto/.test(m1027[0]), 'story 1027 no zoomto');
assert(blogHtml.includes("loadStoryById('1027')"), 'blog index card for S1027');
assert(blogHtml.includes('data-i18n-story="1027"'), 'blog S1027 overlay hooks');
assert(blogJs.includes("story_id: '1027'"), 'blog.js index markers include S1027');
assert(blogJs.includes('zoomToLandmarkId'), 'blog.js should zoom from static landmark JSON');

const s1028 = payload.stories.find(s => s.story_id === '1028');
assert(s1028, 'story 1028 missing');
assert(s1028.title === '南特造船廠裡，有隻會走路的大象', 'story 1028 title');
assert(s1028.author === 'Yu-Sheng', 'story 1028 author');
assert(s1028.where === 'Nantes', 'story 1028 where');
assert(s1028.tags === '想去', 'story 1028 tags must be single token 想去');
assert(s1028.visibility === 'public', 'story 1028 visibility must stay public (not shifted by tags)');
assert(s1028.thumbnail === '', 'story 1028 thumbnail must stay empty');
assert(s1028.avatar === '', 'story 1028 avatar must stay empty');
assert(s1028.created_at === '2026-09-05', 'story 1028 created_at');

const lm1028 = payload.landmarks.filter(l => l.story_id === '1028');
assert(lm1028.length === 5, 'story 1028 should have 5 landmarks');
const lm1028Expected = {
  '495': { name: "Les Machines de l'Île", content: '主針。Parc des Chantiers。大象停Voyage窗見正文。', lat: '47.206472', lng: '-1.564297' },
  '496': { name: 'Les Anneaux', content: '河岸環（Buren & Bouchain）。', lat: '47.20194', lng: '-1.57278' },
  '497': { name: 'Hangar à Bananes', content: 'Quai des Antilles／Hangar 21。座標對齊 WP 47°12′02″N 1°34′23″W。', lat: '47.20056', lng: '-1.57306' },
  '498': { name: 'Grue Titan grise', content: '灰起重機。勿與園區黃 Titan 混淆。', lat: '47.19917', lng: '-1.57389' },
  '499': { name: "Mémorial de l'abolition", content: '北岸。過橋。', lat: '47.20917', lng: '-1.56528' }
};
Object.keys(lm1028Expected).forEach(id => {
  const lm = lm1028.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1028');
  assert(lm.lat === lm1028Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm1028Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm1028Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1028Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(lm1028.find(l => l.landmark_id === '495').link === 'https://www.lesmachines-nantes.fr/', '495 official link');

const m1028 = blogHtml.match(/data-story-id="1028"[\s\S]*?<\/section>/);
assert(m1028, 'blog.html missing story 1028 section');
assert(!/javascript:zoomto/.test(m1028[0]), 'story 1028 must not use javascript:zoomto');
assert(!/\/api/.test(m1028[0]), 'story 1028 must not call /api');
assert((m1028[0].match(/class="map-place-link"/g) || []).length === 6, 'story 1028 place links');
['495', '496', '497', '498', '499'].forEach(id => {
  assert(m1028[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1028 section landmark ' + id);
});
assert(m1028[0].includes('data-landmark="495"') && m1028[0].includes("Les Machines de l'Île"), 'story 1028 machines link');
assert(m1028[0].includes('Grand Éléphant'), 'story 1028 Grand Éléphant link text');
assert(m1028[0].includes('Les Anneaux'), 'story 1028 Anneaux');
assert(m1028[0].includes('Hangar à Bananes'), 'story 1028 Hangar');
assert(m1028[0].includes('Grue Titan grise'), 'story 1028 grey Titan');
assert(m1028[0].includes("Mémorial de l'abolition"), 'story 1028 memorial');
assert(blogHtml.includes("loadStoryById('1028')"), 'blog index card for S1028');
assert(blogHtml.includes('data-i18n-story="1028"'), 'blog S1028 overlay hooks');
assert(blogJs.includes("story_id: '1028'"), 'blog.js index markers include S1028');

const s1029 = payload.stories.find(s => s.story_id === '1029');
assert(s1029, 'story 1029 missing');
assert(s1029.title === '福隆：住一晚，騎舊草嶺', 'story 1029 title');
assert(s1029.author === 'Yu-Sheng', 'story 1029 author');
assert(s1029.where === 'Fulong', 'story 1029 where');
assert(s1029.tags === '渡假,想去', 'story 1029 tags must be 渡假,想去 (quoted CSV field)');
assert(s1029.visibility === 'public', 'story 1029 visibility must stay public (not shifted by unquoted tags)');
assert(s1029.thumbnail === '', 'story 1029 thumbnail must stay empty');
assert(s1029.avatar === '', 'story 1029 avatar must stay empty');
assert(s1029.created_at === '2026-09-05', 'story 1029 created_at');

const lm1029 = payload.landmarks.filter(l => l.story_id === '1029');
assert(lm1029.length === 6, 'story 1029 should have 6 landmarks');
const lm1029Expected = {
  '500': { name: '福隆車站', content: '樞紐／便當／站前租車群（約估座標）。', lat: '25.0159', lng: '121.9447' },
  '501': { name: '舊草嶺隧道北口', content: '制天險。觀光署 121.95834／25.003945。', lat: '25.003945', lng: '121.95834' },
  '502': { name: '舊草嶺隧道南口', content: '白雲飛處／石城端。軌跡約值，非單頁官方點。', lat: '24.983971', lng: '121.955542' },
  '503': { name: '福隆遊客中心／海水浴場', content: '內河外海；沙岸練游（海泳季約5/1–10/20、戒護至17:00）。', lat: '25.017177', lng: '121.94255' },
  '504': { name: '龍門吊橋', content: '西側短脊；接龍門—鹽寮。觀光開放資料。', lat: '25.02277', lng: '121.93545' },
  '505': { name: '福容大飯店福隆', content: '過夜極。貼浴場／沙嘴；海洋溫泉收腿。官網 fullon-hotels。', lat: '25.019018', lng: '121.943771' }
};
Object.keys(lm1029Expected).forEach(id => {
  const lm = lm1029.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1029');
  assert(lm.lat === lm1029Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm1029Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm1029Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1029Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(lm1029.find(l => l.landmark_id === '501').link === 'https://www.necoast-nsa.gov.tw/Attraction-Content.aspx?a=197&l=1', '501 official link');
assert(lm1029.find(l => l.landmark_id === '503').link === 'https://www.fullon-hotels.com.tw/fl/tw/fac-detail/fullonbeach/', '503 beach link');
assert(lm1029.find(l => l.landmark_id === '505').link === 'https://www.fullon-hotels.com.tw/fl/tw/', '505 Fullon link');

const m1029 = blogHtml.match(/data-story-id="1029"[\s\S]*?<\/section>/);
assert(m1029, 'blog.html missing story 1029 section');
assert(!/javascript:zoomto/.test(m1029[0]), 'story 1029 must not use javascript:zoomto');
assert(!/\/api/.test(m1029[0]), 'story 1029 must not call /api');
assert((m1029[0].match(/class="map-place-link"/g) || []).length === 11, 'story 1029 place links');
['500', '501', '502', '503', '504', '505'].forEach(id => {
  assert(m1029[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1029 section landmark ' + id);
});
assert(/data-landmark="501"[^>]*>舊草嶺隧道</.test(m1029[0]), 'story 1029 intro 舊草嶺隧道 maps to 501');
assert(m1029[0].includes('data-landmark="500"') && m1029[0].includes('福隆車站'), 'story 1029 station link');
assert(m1029[0].includes('data-landmark="501"') && m1029[0].includes('北口'), 'story 1029 north mouth');
assert(m1029[0].includes('data-landmark="502"') && m1029[0].includes('南口'), 'story 1029 south mouth');
assert(m1029[0].includes('data-landmark="503"') && m1029[0].includes('遊客中心'), 'story 1029 visitor centre');
assert(m1029[0].includes('海水浴場'), 'story 1029 beach');
assert(m1029[0].includes('data-landmark="504"') && m1029[0].includes('龍門吊橋'), 'story 1029 Longmen');
assert(m1029[0].includes('data-landmark="505"') && m1029[0].includes('福容'), 'story 1029 Fullon');
assert(blogHtml.includes("loadStoryById('1029')"), 'blog index card for S1029');
assert(blogHtml.includes('data-i18n-story="1029"'), 'blog S1029 overlay hooks');
assert(blogJs.includes("story_id: '1029'"), 'blog.js index markers include S1029');

const s1030 = payload.stories.find(s => s.story_id === '1030');
assert(s1030, 'story 1030 missing');
assert(s1030.title === '秋芳洞：地下十七度，電梯上去是台地', 'story 1030 title');
assert(s1030.author === 'Yu-Sheng', 'story 1030 author');
assert(s1030.where === 'Akiyoshido', 'story 1030 where');
assert(s1030.tags === '想去', 'story 1030 tags must be single token 想去');
assert(s1030.visibility === 'public', 'story 1030 visibility must stay public (not shifted by tags)');
assert(s1030.thumbnail === '', 'story 1030 thumbnail must stay empty');
assert(s1030.avatar === '', 'story 1030 avatar must stay empty');
assert(s1030.created_at === '2026-09-05', 'story 1030 created_at');

const lm1030 = payload.landmarks.filter(l => l.story_id === '1030');
assert(lm1030.length === 5, 'story 1030 should have 5 landmarks');
const lm1030Expected = {
  '506': { name: '秋芳洞正面入口', content: '主針。觀光起點。座標 Wikidata 二次。', lat: '34.2281', lng: '131.3035' },
  '507': { name: '百枚皿', content: '洞內主景；精確點未知，暫釘入口區。', lat: '34.2281', lng: '131.3035' },
  '508': { name: '黃金柱', content: '洞內象徵石柱（黄金柱）；精確點未知，暫釘入口區。', lat: '34.2281', lng: '131.3035' },
  '509': { name: '冒険コース', content: '青天井支線；＋300円、租手電筒。不是未公開探洞。', lat: '34.2281', lng: '131.3035' },
  '510': { name: 'カルスト展望台', content: '地上台地對照；約值。電梯口再走約5–10分。', lat: '34.236', lng: '131.308' }
};
Object.keys(lm1030Expected).forEach(id => {
  const lm = lm1030.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1030');
  assert(lm.lat === lm1030Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm1030Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm1030Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1030Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(lm1030.find(l => l.landmark_id === '506').link === 'https://karusuto.com/spot/akiyoshido/', '506 official link');
assert(lm1030.find(l => l.landmark_id === '509').link === 'https://caving.karusuto.com/html/adventure.html', '509 adventure link');
assert(lm1030.find(l => l.landmark_id === '510').link === 'https://karusuto.com/spot/akiyoshidai/', '510 plateau link');

const m1030 = blogHtml.match(/data-story-id="1030"[\s\S]*?<\/section>/);
assert(m1030, 'blog.html missing story 1030 section');
assert(!/javascript:zoomto/.test(m1030[0]), 'story 1030 must not use javascript:zoomto');
assert(!/\/api/.test(m1030[0]), 'story 1030 must not call /api');
assert((m1030[0].match(/class="map-place-link"/g) || []).length === 5, 'story 1030 place links');
['506', '507', '508', '509', '510'].forEach(id => {
  assert(m1030[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1030 section landmark ' + id);
});
assert(/data-landmark="506"[^>]*data-zoom="13"[^>]*>秋芳洞正面入口</.test(m1030[0]), 'story 1030 intro entrance maps to 506 zoom 13');
assert(/data-landmark="507"[^>]*data-zoom="16"[^>]*>百枚皿</.test(m1030[0]), 'story 1030 百枚皿 maps to 507 zoom 16');
assert(/data-landmark="508"[^>]*data-zoom="16"[^>]*>黃金柱</.test(m1030[0]), 'story 1030 黃金柱 maps to 508 zoom 16');
assert(/data-landmark="509"[^>]*data-zoom="16"[^>]*>冒險コース</.test(m1030[0]), 'story 1030 冒險コース maps to 509');
assert(/data-landmark="510"[^>]*data-zoom="15"[^>]*>カルスト展望台</.test(m1030[0]), 'story 1030 展望台 maps to 510 zoom 15');
assert(blogHtml.includes("loadStoryById('1030')"), 'blog index card for S1030');
assert(blogHtml.includes('data-i18n-story="1030"'), 'blog S1030 overlay hooks');
assert(blogJs.includes("story_id: '1030'"), 'blog.js index markers include S1030');
assert(!fs.existsSync(path.join(ROOT, 'stories', '1030.html')), 'do not generate stories/1030.html while PR #15 is open');

const s1031 = payload.stories.find(s => s.story_id === '1031');
assert(s1031, 'story 1031 missing');
assert(s1031.title === '越生：黒山園釣烤，順路三座瀑布', 'story 1031 title');
assert(s1031.author === 'Yu-Sheng', 'story 1031 author');
assert(s1031.where === 'Ogose', 'story 1031 where');
assert(s1031.tags === '想去', 'story 1031 tags must be single token 想去');
assert(s1031.visibility === 'public', 'story 1031 visibility must stay public (not shifted by tags)');
assert(s1031.thumbnail === '', 'story 1031 thumbnail must stay empty');
assert(s1031.avatar === '', 'story 1031 avatar must stay empty');
assert(s1031.created_at === '2026-09-06', 'story 1031 created_at');

const lm1031 = payload.landmarks.filter(l => l.story_id === '1031');
assert(lm1031.length === 4, 'story 1031 should have 4 landmarks');
const lm1031Expected = {
  '511': { name: '黒山園', content: '釣＋烤。門牌黒山1445一帶；座標約值。TEL 049-292-3862。', lat: '35.9372', lng: '139.2472' },
  '512': { name: '黒山三滝', content: '三座瀑布（男／女／天狗）。溪谷步道免門票。', lat: '35.9408', lng: '139.2447' },
  '513': { name: '黒山三滝町營駐車場', content: '步道入口附近；至滝約徒步15分。駐車約值。', lat: '35.9388', lng: '139.2522' },
  '514': { name: '越生駅', content: '東武越生線。再轉巴士／計程車進黒山。', lat: '35.9622', lng: '139.2993' }
};
Object.keys(lm1031Expected).forEach(id => {
  const lm = lm1031.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1031');
  assert(lm.lat === lm1031Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm1031Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm1031Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1031Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(lm1031.find(l => l.landmark_id === '511').link === 'https://www.kanritsuriba.com/kuroyamaen/', '511 official link');
assert(lm1031.find(l => l.landmark_id === '512').link === 'https://ogose-kanko.jp/tourist_attractions/kuroyamasantaki/', '512 official link');
assert(!lm1031.find(l => l.landmark_id === '513').link, '513 has no official link');
assert(lm1031.find(l => l.landmark_id === '514').link === 'https://www.town.ogose.saitama.jp/', '514 town link');

const m1031 = blogHtml.match(/data-story-id="1031"[\s\S]*?<\/section>/);
assert(m1031, 'blog.html missing story 1031 section');
assert(!/javascript:zoomto/.test(m1031[0]), 'story 1031 must not use javascript:zoomto');
assert(!/\/api/.test(m1031[0]), 'story 1031 must not call /api');
assert((m1031[0].match(/class="map-place-link"/g) || []).length === 4, 'story 1031 place links');
['511', '512', '513', '514'].forEach(id => {
  assert(m1031[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1031 section landmark ' + id);
});
assert(/data-landmark="512"[^>]*data-zoom="14"[^>]*>黒山三滝</.test(m1031[0]), 'story 1031 intro 黒山三滝 maps to 512 zoom 14');
assert(/data-landmark="511"[^>]*data-zoom="16"[^>]*>黒山園</.test(m1031[0]), 'story 1031 黒山園 maps to 511 zoom 16');
assert(/data-landmark="513"[^>]*data-zoom="15"[^>]*>町營停車場</.test(m1031[0]), 'story 1031 町營停車場 maps to 513 zoom 15');
assert(/data-landmark="514"[^>]*data-zoom="14"[^>]*>越生站</.test(m1031[0]), 'story 1031 越生站 maps to 514 zoom 14');
assert(m1031[0].includes('烤大約半小時到四十分鐘，以現場為準'), 'story 1031 keeps grill timing text');
assert(blogHtml.includes("loadStoryById('1031')"), 'blog index card for S1031');
assert(blogHtml.includes('data-i18n-story="1031"'), 'blog S1031 overlay hooks');
assert(blogJs.includes("story_id: '1031'"), 'blog.js index markers include S1031');
assert(!fs.existsSync(path.join(ROOT, 'stories', '1031.html')), 'do not generate stories/1031.html while PR #15 is open');

const s1032 = payload.stories.find(s => s.story_id === '1032');
assert(s1032, 'story 1032 missing');
assert(s1032.title === '河津：山側七座瀑布，海岸另半天', 'story 1032 title');
assert(s1032.author === 'Yu-Sheng', 'story 1032 author');
assert(s1032.where === 'Kawazu', 'story 1032 where');
assert(s1032.tags === '想去', 'story 1032 tags must be single token 想去');
assert(s1032.visibility === 'public', 'story 1032 visibility must stay public (not shifted by tags)');
assert(s1032.thumbnail === '', 'story 1032 thumbnail must stay empty');
assert(s1032.avatar === '', 'story 1032 avatar must stay empty');
assert(s1032.created_at === '2026-09-06', 'story 1032 created_at');

const lm1032 = payload.landmarks.filter(l => l.story_id === '1032');
assert(lm1032.length === 6, 'story 1032 should have 6 landmarks');
const lm1032Expected = {
  '515': { name: '河津駅', content: '伊豆急／踊り子。門戶。', lat: '34.74756', lng: '138.99597' },
  '516': { name: '河津七滝', content: '遊歩道無料。巴士口約值。', lat: '34.79466', lng: '138.93526' },
  '517': { name: '天城荘', content: '日歸外湯；須泳衣；大人2000。每週三休。', lat: '34.79317', lng: '138.93684' },
  '518': { name: '峰温泉大噴湯公園', content: '整點噴約1分；火金休。無料。', lat: '34.75728', lng: '138.98232' },
  '519': { name: '今井浜海岸', content: '非泳季可散步。2026泳季已結束。', lat: '34.7539', lng: '139.005' },
  '520': { name: '舟戸の番屋', content: '展望露天；一般300；火休。非「船戸」。', lat: '34.75289', lng: '139.00814' }
};
Object.keys(lm1032Expected).forEach(id => {
  const lm = lm1032.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1032');
  assert(lm.lat === lm1032Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm1032Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm1032Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1032Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(!lm1032.find(l => l.landmark_id === '515').link, '515 has no official link');
assert(!lm1032.find(l => l.landmark_id === '516').link, '516 has no official link');
assert(lm1032.find(l => l.landmark_id === '517').link === 'https://amagisou.jp/', '517 official link');
assert(!lm1032.find(l => l.landmark_id === '518').link, '518 has no official link');
assert(!lm1032.find(l => l.landmark_id === '519').link, '519 has no official link');
assert(!lm1032.find(l => l.landmark_id === '520').link, '520 has no official link');

const m1032 = blogHtml.match(/data-story-id="1032"[\s\S]*?<\/section>/);
assert(m1032, 'blog.html missing story 1032 section');
assert(!/javascript:zoomto/.test(m1032[0]), 'story 1032 must not use javascript:zoomto');
assert(!/\/api/.test(m1032[0]), 'story 1032 must not call /api');
assert((m1032[0].match(/class="map-place-link"/g) || []).length === 6, 'story 1032 place links');
['515', '516', '517', '518', '519', '520'].forEach(id => {
  assert(m1032[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1032 section landmark ' + id);
});
assert(/data-landmark="515"[^>]*data-zoom="13"[^>]*>河津駅</.test(m1032[0]), 'story 1032 河津駅 maps to 515 zoom 13');
assert(/data-landmark="516"[^>]*data-zoom="15"[^>]*>河津七滝</.test(m1032[0]), 'story 1032 河津七滝 maps to 516 zoom 15');
assert(/data-landmark="517"[^>]*data-zoom="16"[^>]*>天城荘</.test(m1032[0]), 'story 1032 天城荘 maps to 517 zoom 16');
assert(/data-landmark="518"[^>]*data-zoom="15"[^>]*>峰温泉大噴湯公園</.test(m1032[0]), 'story 1032 大噴湯 maps to 518 zoom 15');
assert(/data-landmark="519"[^>]*data-zoom="15"[^>]*>今井浜</.test(m1032[0]), 'story 1032 今井浜 maps to 519 zoom 15');
assert(/data-landmark="520"[^>]*data-zoom="16"[^>]*>舟戸の番屋</.test(m1032[0]), 'story 1032 舟戸の番屋 maps to 520 zoom 16');
assert(m1032[0].includes('images/stories/1032/odaru-fall.jpg'), 'story 1032 inline odaru-fall');
assert(m1032[0].includes('images/stories/1032/amagiso-odaru-onsen.jpg'), 'story 1032 inline amagiso');
assert(m1032[0].includes('images/stories/1032/mine-daifunto-jifunsui.jpg'), 'story 1032 inline mine geyser');
assert(m1032[0].includes('images/stories/1032/funado-banya.jpg'), 'story 1032 inline funado-banya');
assert(m1032[0].includes('店名是「舟戸」，不是常被寫錯的「船戸」'), 'story 1032 keeps 舟戸 vs 船戸 note');
assert(blogHtml.includes("loadStoryById('1032')"), 'blog index card for S1032');
assert(blogHtml.includes('data-i18n-story="1032"'), 'blog S1032 overlay hooks');
assert(blogJs.includes("story_id: '1032'"), 'blog.js index markers include S1032');
assert(!fs.existsSync(path.join(ROOT, 'stories', '1032.html')), 'do not generate stories/1032.html while PR #15 is open');

const s1033 = payload.stories.find(s => s.story_id === '1033');
assert(s1033, 'story 1033 missing');
assert(s1033.title === '立山室堂：兩千四百五十公尺的平地', 'story 1033 title');
assert(s1033.author === 'Yu-Sheng', 'story 1033 author');
assert(s1033.where === 'Tateyama Murodo', 'story 1033 where');
assert(s1033.tags === '想去', 'story 1033 tags must be single token 想去');
assert(s1033.visibility === 'public', 'story 1033 visibility must stay public (not shifted by tags)');
assert(s1033.thumbnail === '', 'story 1033 thumbnail must stay empty');
assert(s1033.avatar === '', 'story 1033 avatar must stay empty');
assert(s1033.created_at === '2026-09-06', 'story 1033 created_at');

const lm1033 = payload.landmarks.filter(l => l.story_id === '1033');
assert(lm1033.length === 4, 'story 1033 should have 4 landmarks');
const lm1033Expected = {
  '521': { name: '立山駅', content: '富山側門戶。座標 Wikipedia。', lat: '36.58332', lng: '137.44522' },
  '522': { name: '彌陀ヶ原', content: '高原濕原。Ramsar 場址中心約值，非巴士站針點。', lat: '36.575', lng: '137.5333' },
  '523': { name: '室堂', content: '路線最高點約2450m。Wikidata 室堂ターミナル。', lat: '36.5773', lng: '137.5955' },
  '524': { name: 'みくりが池', content: '室堂平短散策。二次座標約值。', lat: '36.58056', lng: '137.59722' }
};
Object.keys(lm1033Expected).forEach(id => {
  const lm = lm1033.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 1033');
  assert(lm.lat === lm1033Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm1033Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm1033Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm1033Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(lm1033.find(l => l.landmark_id === '521').link === 'https://www.alpen-route.com/', '521 official link');
assert(!lm1033.find(l => l.landmark_id === '522').link, '522 has no official link');
assert(lm1033.find(l => l.landmark_id === '523').link === 'https://alpen-route.com/area/murodo.php', '523 official link');
assert(!lm1033.find(l => l.landmark_id === '524').link, '524 has no official link');

const m1033 = blogHtml.match(/data-story-id="1033"[\s\S]*?<\/section>/);
assert(m1033, 'blog.html missing story 1033 section');
assert(!/javascript:zoomto/.test(m1033[0]), 'story 1033 must not use javascript:zoomto');
assert(!/\/api/.test(m1033[0]), 'story 1033 must not call /api');
assert((m1033[0].match(/class="map-place-link"/g) || []).length === 4, 'story 1033 place links');
['521', '522', '523', '524'].forEach(id => {
  assert(m1033[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 1033 section landmark ' + id);
});
assert(/data-landmark="521"[^>]*data-zoom="13"[^>]*>立山駅</.test(m1033[0]), 'story 1033 立山駅 maps to 521 zoom 13');
assert(/data-landmark="522"[^>]*data-zoom="13"[^>]*>彌陀ヶ原</.test(m1033[0]), 'story 1033 彌陀ヶ原 maps to 522 zoom 13');
assert(/data-landmark="523"[^>]*data-zoom="14"[^>]*>室堂</.test(m1033[0]), 'story 1033 室堂 maps to 523 zoom 14');
assert(/data-landmark="524"[^>]*data-zoom="15"[^>]*>みくりが池</.test(m1033[0]), 'story 1033 みくりが池 maps to 524 zoom 15');
assert(blogHtml.includes("loadStoryById('1033')"), 'blog index card for S1033');
assert(blogHtml.includes('data-i18n-story="1033"'), 'blog S1033 overlay hooks');
assert(blogJs.includes("story_id: '1033'"), 'blog.js index markers include S1033');
assert(!fs.existsSync(path.join(ROOT, 'stories', '1033.html')), 'do not generate stories/1033.html while PR #15 is open');

const s100026 = payload.stories.find(s => s.story_id === '100026');
assert(s100026, 'story 100026 missing');
assert(s100026.title === '日本粉雪三選：湯澤、留壽都、富良野', 'story 100026 title');
assert(s100026.author === 'Yu-Sheng', 'story 100026 author');
assert(s100026.where === 'Japan powder ski', 'story 100026 where');
assert(s100026.tags === '想去', 'story 100026 tags must be single token 想去');
assert(s100026.visibility === 'public', 'story 100026 visibility must stay public (not shifted by tags)');
assert(s100026.thumbnail === '', 'story 100026 thumbnail must stay empty');
assert(s100026.avatar === '', 'story 100026 avatar must stay empty');
assert(s100026.created_at === '2026-09-06', 'story 100026 created_at');

const lm100026 = payload.landmarks.filter(l => l.story_id === '100026');
assert(lm100026.length === 3, 'story 100026 should have 3 landmarks');
assert(lm100026.every(l => ['100029', '100030', '100031'].includes(l.landmark_id)),
  'S100026 must use ONLY 100029/100030/100031');
['100001', '100002', '100003', '100015', '100016', '100017'].forEach(id => {
  assert(!lm100026.find(l => l.landmark_id === id), 'S100026 must not reuse landmark ' + id);
});
const lm100026Expected = {
  '100029': { name: '石打丸山スキー場', content: '新潟南魚沼。Wikidata Q11586538。', lat: '36.976111', lng: '138.794722' },
  '100030': { name: 'ルスツリゾート', content: '北海道留壽都。Wikidata Q7382688。', lat: '42.74968', lng: '140.90329' },
  '100031': { name: '富良野スキー場', content: '北海道富良野。OSM 建議針。', lat: '43.3326', lng: '142.3281' }
};
Object.keys(lm100026Expected).forEach(id => {
  const lm = lm100026.find(l => l.landmark_id === id);
  assert(lm, 'landmark ' + id + ' missing for 100026');
  assert(lm.lat === lm100026Expected[id].lat, 'landmark ' + id + ' lat');
  assert(lm.lng === lm100026Expected[id].lng, 'landmark ' + id + ' lng');
  assert(lm.name === lm100026Expected[id].name, 'landmark ' + id + ' name');
  assert(lm.content === lm100026Expected[id].content, 'landmark ' + id + ' PM content');
});
assert(lm100026.find(l => l.landmark_id === '100029').link === 'https://ishiuchi.or.jp/winter/hours/', '100029 official link');
assert(lm100026.find(l => l.landmark_id === '100030').link === 'https://rusutsu.com/', '100030 official link');
assert(lm100026.find(l => l.landmark_id === '100031').link === 'https://www.princehotels.co.jp/ski/furano/winter/', '100031 official link');

const m100026 = blogHtml.match(/data-story-id="100026"[\s\S]*?<\/section>/);
assert(m100026, 'blog.html missing story 100026 section');
assert(!/javascript:zoomto/.test(m100026[0]), 'story 100026 must not use javascript:zoomto');
assert(!/\/api/.test(m100026[0]), 'story 100026 must not call /api');
assert((m100026[0].match(/class="map-place-link"/g) || []).length === 3, 'story 100026 place links');
['100029', '100030', '100031'].forEach(id => {
  assert(m100026[0].indexOf('data-landmark="' + id + '"') !== -1, 'story 100026 section landmark ' + id);
});
assert(!/data-landmark="100001"/.test(m100026[0]), 'S100026 body must not use 100001');
assert(!/data-landmark="100015"/.test(m100026[0]), 'S100026 body must not use 100015');
assert(/data-landmark="100029"[^>]*data-zoom="12"[^>]*>石打丸山</.test(m100026[0]), 'story 100026 石打丸山 maps to 100029 zoom 12');
assert(/data-landmark="100030"[^>]*data-zoom="11"[^>]*>留壽都度假村</.test(m100026[0]), 'story 100026 留壽都 maps to 100030 zoom 11');
assert(/data-landmark="100031"[^>]*data-zoom="11"[^>]*>富良野滑雪場</.test(m100026[0]), 'story 100026 富良野 maps to 100031 zoom 11');
assert(blogHtml.includes("loadStoryById('100026')"), 'blog index card for S100026');
assert(blogHtml.includes('data-i18n-story="100026"'), 'blog S100026 overlay hooks');
assert(blogJs.includes("story_id: '100026'"), 'blog.js index markers include S100026');
assert(!fs.existsSync(path.join(ROOT, 'stories', '100026.html')), 'do not generate stories/100026.html while PR #15 is open');

const imgDir1032 = path.join(ROOT, 'images', 'stories', '1032');
['odaru-fall.jpg', 'amagiso-odaru-onsen.jpg', 'mine-daifunto-jifunsui.jpg', 'funado-banya.jpg'].forEach(name => {
  const imgPath = path.join(imgDir1032, name);
  assert(fs.existsSync(imgPath), 'missing ' + name);
  const size = fs.statSync(imgPath).size;
  assert(size > 10000, name + ' too small to be a real photo');
  assert(size < 800 * 1024, name + ' should stay under ~800KB for web');
});
assert(fs.existsSync(path.join(imgDir1032, 'CREDITS.md')), 'S1032 CREDITS.md missing');

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
assert(/blog\.html#1025/.test(indexHtml), 'homepage should CTA to blog.html#1025');
assert(/blog\.html#1027/.test(indexHtml), 'homepage should CTA to blog.html#1027');
assert(/blog\.html#1028/.test(indexHtml), 'homepage should CTA to blog.html#1028');
assert(/blog\.html#1029/.test(indexHtml), 'homepage should CTA to blog.html#1029');
assert(/blog\.html#1030/.test(indexHtml), 'homepage should CTA to blog.html#1030');
assert(/blog\.html#1031/.test(indexHtml), 'homepage should CTA to blog.html#1031');
assert(/blog\.html#1032/.test(indexHtml), 'homepage should CTA to blog.html#1032');
assert(/blog\.html#1033/.test(indexHtml), 'homepage should CTA to blog.html#1033');
assert(/blog\.html#100026/.test(indexHtml), 'homepage should CTA to blog.html#100026');
assert(/blog\.html#1024/.test(aboutHtml), 'about should CTA to blog.html#1024');
assert(/blog\.html#1025/.test(aboutHtml), 'about should CTA to blog.html#1025');
assert(/blog\.html#1027/.test(aboutHtml), 'about should CTA to blog.html#1027');
assert(/blog\.html#1028/.test(aboutHtml), 'about should CTA to blog.html#1028');
assert(/blog\.html#1029/.test(aboutHtml), 'about should CTA to blog.html#1029');
assert(/blog\.html#1030/.test(aboutHtml), 'about should CTA to blog.html#1030');
assert(/blog\.html#1031/.test(aboutHtml), 'about should CTA to blog.html#1031');
assert(/blog\.html#1032/.test(aboutHtml), 'about should CTA to blog.html#1032');
assert(/blog\.html#1033/.test(aboutHtml), 'about should CTA to blog.html#1033');
assert(/blog\.html#100026/.test(aboutHtml), 'about should CTA to blog.html#100026');
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
assert(/story_id:\s*'1025'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1025');
assert(/story_id:\s*'1027'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1027');
assert(/story_id:\s*'1028'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1028');
assert(/story_id:\s*'1029'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1029');
assert(/story_id:\s*'1030'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1030');
assert(/story_id:\s*'1031'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1031');
assert(/story_id:\s*'1032'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1032');
assert(/story_id:\s*'1033'/.test(markerBlock[1]), 'INDEX_MARKERS must include S1033');
assert(/story_id:\s*'100026'/.test(markerBlock[1]), 'INDEX_MARKERS must include S100026');
assert(!/story_id:\s*'1001'/.test(markerBlock[1]), 'INDEX_MARKERS must not hero internal Heidelberg');
assert(!/story_id:\s*'258'/.test(markerBlock[1]), 'INDEX_MARKERS must not hero NY test story');
assert(!/collection_id:\s*'101'/.test(markerBlock[1]), 'INDEX_MARKERS must not hero Tokyo collection');
assert(indexJs.includes('HOMEPAGE_STORY_IDS'), 'index.js should allowlist homepage stories');
assert(/HOMEPAGE_STORY_IDS\s*=\s*\[['"]1024['"],\s*['"]1025['"],\s*['"]1027['"],\s*['"]1028['"],\s*['"]1029['"],\s*['"]1030['"],\s*['"]1031['"],\s*['"]1032['"],\s*['"]1033['"],\s*['"]100026['"]\]/.test(indexJs), 'homepage list should hero public S1024–S1033 and S100026');

const welcomeMatch = blogHtml.match(/id="blog-welcome"[\s\S]*?<section data-story-id="1001"/);
assert(welcomeMatch, 'blog welcome should precede story 1001 section');
assert(/個人地圖故事/.test(welcomeMatch[0]), 'blog index should say 個人地圖故事');
assert(/loadStoryById\('1024'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1024');
assert(/loadStoryById\('1025'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1025');
assert(/loadStoryById\('1027'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1027');
assert(/loadStoryById\('1028'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1028');
assert(/loadStoryById\('1029'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1029');
assert(/loadStoryById\('1030'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1030');
assert(/loadStoryById\('1031'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1031');
assert(/loadStoryById\('1032'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1032');
assert(/loadStoryById\('1033'\)/.test(welcomeMatch[0]), 'blog welcome must hero S1033');
assert(/loadStoryById\('100026'\)/.test(welcomeMatch[0]), 'blog welcome must hero S100026');
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
assert(onDisk.stories.some(s => s.story_id === '1027'), 'checked-in JSON missing 1027');
assert(onDisk.landmarks.filter(l => l.story_id === '1027').length === 4, 'checked-in JSON missing 1027 landmarks');
const onDisk1027 = onDisk.stories.find(s => s.story_id === '1027');
assert(onDisk1027.tags === '渡假,想去', 'checked-in JSON S1027 tags');
assert(onDisk1027.visibility === 'public', 'checked-in JSON S1027 visibility');
assert(onDisk1027.thumbnail === '', 'checked-in JSON S1027 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1027' && l.landmark_id === '494').content.includes('美浜区／JFA夢フィールド'), 'checked-in JSON 494 PM blurb');
assert(onDisk.stories.some(s => s.story_id === '1028'), 'checked-in JSON missing 1028');
assert(onDisk.landmarks.filter(l => l.story_id === '1028').length === 5, 'checked-in JSON missing 1028 landmarks');
const onDisk1028 = onDisk.stories.find(s => s.story_id === '1028');
assert(onDisk1028.tags === '想去', 'checked-in JSON S1028 tags');
assert(onDisk1028.visibility === 'public', 'checked-in JSON S1028 visibility');
assert(onDisk1028.thumbnail === '', 'checked-in JSON S1028 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1028' && l.landmark_id === '495').name === "Les Machines de l'Île", 'checked-in JSON 495 name');
assert(onDisk.landmarks.find(l => l.story_id === '1028' && l.landmark_id === '495').link === 'https://www.lesmachines-nantes.fr/', 'checked-in JSON 495 link');
assert(onDisk.landmarks.find(l => l.story_id === '1028' && l.landmark_id === '498').content.includes('勿與園區黃 Titan 混淆'), 'checked-in JSON 498 PM blurb');
assert(onDisk.stories.some(s => s.story_id === '1029'), 'checked-in JSON missing 1029');
assert(onDisk.landmarks.filter(l => l.story_id === '1029').length === 6, 'checked-in JSON missing 1029 landmarks');
const onDisk1029 = onDisk.stories.find(s => s.story_id === '1029');
assert(onDisk1029.tags === '渡假,想去', 'checked-in JSON S1029 tags');
assert(onDisk1029.visibility === 'public', 'checked-in JSON S1029 visibility');
assert(onDisk1029.thumbnail === '', 'checked-in JSON S1029 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1029' && l.landmark_id === '501').name === '舊草嶺隧道北口', 'checked-in JSON 501 name');
assert(onDisk.landmarks.find(l => l.story_id === '1029' && l.landmark_id === '502').content.includes('白雲飛處'), 'checked-in JSON 502 PM blurb');
assert(onDisk.landmarks.find(l => l.story_id === '1029' && l.landmark_id === '505').link === 'https://www.fullon-hotels.com.tw/fl/tw/', 'checked-in JSON 505 link');
assert(onDisk.stories.some(s => s.story_id === '1030'), 'checked-in JSON missing 1030');
assert(onDisk.landmarks.filter(l => l.story_id === '1030').length === 5, 'checked-in JSON missing 1030 landmarks');
const onDisk1030 = onDisk.stories.find(s => s.story_id === '1030');
assert(onDisk1030.tags === '想去', 'checked-in JSON S1030 tags');
assert(onDisk1030.visibility === 'public', 'checked-in JSON S1030 visibility');
assert(onDisk1030.thumbnail === '', 'checked-in JSON S1030 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1030' && l.landmark_id === '506').name === '秋芳洞正面入口', 'checked-in JSON 506 name');
assert(onDisk.landmarks.find(l => l.story_id === '1030' && l.landmark_id === '508').content.includes('黄金柱'), 'checked-in JSON 508 PM blurb');
assert(onDisk.landmarks.find(l => l.story_id === '1030' && l.landmark_id === '510').link === 'https://karusuto.com/spot/akiyoshidai/', 'checked-in JSON 510 link');
assert(onDisk.stories.some(s => s.story_id === '1031'), 'checked-in JSON missing 1031');
assert(onDisk.landmarks.filter(l => l.story_id === '1031').length === 4, 'checked-in JSON missing 1031 landmarks');
const onDisk1031 = onDisk.stories.find(s => s.story_id === '1031');
assert(onDisk1031.tags === '想去', 'checked-in JSON S1031 tags');
assert(onDisk1031.visibility === 'public', 'checked-in JSON S1031 visibility');
assert(onDisk1031.thumbnail === '', 'checked-in JSON S1031 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1031' && l.landmark_id === '511').name === '黒山園', 'checked-in JSON 511 name');
assert(onDisk.landmarks.find(l => l.story_id === '1031' && l.landmark_id === '512').content.includes('男／女／天狗'), 'checked-in JSON 512 PM blurb');
assert(onDisk.landmarks.find(l => l.story_id === '1031' && l.landmark_id === '511').link === 'https://www.kanritsuriba.com/kuroyamaen/', 'checked-in JSON 511 link');
assert(onDisk.stories.some(s => s.story_id === '1032'), 'checked-in JSON missing 1032');
assert(onDisk.landmarks.filter(l => l.story_id === '1032').length === 6, 'checked-in JSON missing 1032 landmarks');
const onDisk1032 = onDisk.stories.find(s => s.story_id === '1032');
assert(onDisk1032.tags === '想去', 'checked-in JSON S1032 tags');
assert(onDisk1032.visibility === 'public', 'checked-in JSON S1032 visibility');
assert(onDisk1032.thumbnail === '', 'checked-in JSON S1032 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1032' && l.landmark_id === '515').name === '河津駅', 'checked-in JSON 515 name');
assert(onDisk.landmarks.find(l => l.story_id === '1032' && l.landmark_id === '516').content.includes('遊歩道無料'), 'checked-in JSON 516 PM blurb');
assert(onDisk.landmarks.find(l => l.story_id === '1032' && l.landmark_id === '517').link === 'https://amagisou.jp/', 'checked-in JSON 517 link');
assert(onDisk.landmarks.find(l => l.story_id === '1032' && l.landmark_id === '520').content.includes('非「船戸」'), 'checked-in JSON 520 舟戸 note');
assert(onDisk.stories.some(s => s.story_id === '1033'), 'checked-in JSON missing 1033');
assert(onDisk.landmarks.filter(l => l.story_id === '1033').length === 4, 'checked-in JSON missing 1033 landmarks');
const onDisk1033 = onDisk.stories.find(s => s.story_id === '1033');
assert(onDisk1033.tags === '想去', 'checked-in JSON S1033 tags');
assert(onDisk1033.visibility === 'public', 'checked-in JSON S1033 visibility');
assert(onDisk1033.thumbnail === '', 'checked-in JSON S1033 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '1033' && l.landmark_id === '521').name === '立山駅', 'checked-in JSON 521 name');
assert(onDisk.landmarks.find(l => l.story_id === '1033' && l.landmark_id === '523').link === 'https://alpen-route.com/area/murodo.php', 'checked-in JSON 523 link');
assert(onDisk.stories.some(s => s.story_id === '100026'), 'checked-in JSON missing 100026');
assert(onDisk.landmarks.filter(l => l.story_id === '100026').length === 3, 'checked-in JSON missing 100026 landmarks');
const onDisk100026 = onDisk.stories.find(s => s.story_id === '100026');
assert(onDisk100026.tags === '想去', 'checked-in JSON S100026 tags');
assert(onDisk100026.visibility === 'public', 'checked-in JSON S100026 visibility');
assert(onDisk100026.thumbnail === '', 'checked-in JSON S100026 thumbnail');
assert(onDisk.landmarks.find(l => l.story_id === '100026' && l.landmark_id === '100029').name === '石打丸山スキー場', 'checked-in JSON 100029 name');
assert(onDisk.landmarks.find(l => l.story_id === '100026' && l.landmark_id === '100030').link === 'https://rusutsu.com/', 'checked-in JSON 100030 link');
assert(onDisk.landmarks.find(l => l.story_id === '100026' && l.landmark_id === '100031').lat === '43.3326', 'checked-in JSON 100031 lat');
['100001', '100002', '100003', '100015', '100016', '100017'].forEach(id => {
  const stolen = onDisk.landmarks.find(l => l.story_id === '100026' && l.landmark_id === id);
  assert(!stolen, 'checked-in JSON S100026 must not reuse landmark ' + id);
});

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
assert(/1027,,東京桌上遊戲市集：怎麼住幕張、哪天充電（2026 秋）,blog,,Yu-Sheng,blog,Makuhari,,"渡假,想去",,public,2026-09-04,,/.test(storiesCsv),
  'S1027 CSV row must quote the tags field so 渡假,想去 stay in tags');
assert(!/Makuhari,,,渡假,想去,,public/.test(storiesCsv), 'S1027 must not split unquoted tags into thumbnail/visibility');
assert(/1028,,南特造船廠裡，有隻會走路的大象,blog,,Yu-Sheng,blog,Nantes,,想去,,public,2026-09-05,,/.test(storiesCsv),
  'S1028 CSV row must keep single-token 想去 in tags with no comma spill');
assert(!/Nantes,,,想去,,public/.test(storiesCsv), 'S1028 must not split tags into thumbnail/visibility');
assert(/1029,,福隆：住一晚，騎舊草嶺,blog,,Yu-Sheng,blog,Fulong,,"渡假,想去",,public,2026-09-05,,/.test(storiesCsv),
  'S1029 CSV row must quote the tags field so 渡假,想去 stay in tags');
assert(!/Fulong,,,渡假,想去,,public/.test(storiesCsv), 'S1029 must not split unquoted tags into thumbnail/visibility');
assert(/1030,,秋芳洞：地下十七度，電梯上去是台地,blog,,Yu-Sheng,blog,Akiyoshido,,想去,,public,2026-09-05,,/.test(storiesCsv),
  'S1030 CSV row must keep single-token 想去 in tags with no comma spill');
assert(!/Akiyoshido,,,想去,,public/.test(storiesCsv), 'S1030 must not split tags into thumbnail/visibility');
assert(/1031,,越生：黒山園釣烤，順路三座瀑布,blog,,Yu-Sheng,blog,Ogose,,想去,,public,2026-09-06,,/.test(storiesCsv),
  'S1031 CSV row must keep single-token 想去 in tags with no comma spill');
assert(!/Ogose,,,想去,,public/.test(storiesCsv), 'S1031 must not split tags into thumbnail/visibility');
assert(/1032,,河津：山側七座瀑布，海岸另半天,blog,,Yu-Sheng,blog,Kawazu,,想去,,public,2026-09-06,,/.test(storiesCsv),
  'S1032 CSV row must keep single-token 想去 in tags with no comma spill');
assert(!/Kawazu,,,想去,,public/.test(storiesCsv), 'S1032 must not split tags into thumbnail/visibility');
assert(/1033,,立山室堂：兩千四百五十公尺的平地,blog,,Yu-Sheng,blog,Tateyama Murodo,,想去,,public,2026-09-06,,/.test(storiesCsv),
  'S1033 CSV row must keep single-token 想去 in tags with no comma spill');
assert(!/Tateyama Murodo,,,想去,,public/.test(storiesCsv), 'S1033 must not split tags into thumbnail/visibility');
assert(/100026,,日本粉雪三選：湯澤、留壽都、富良野,blog,,Yu-Sheng,blog,Japan powder ski,,想去,,public,2026-09-06,,/.test(storiesCsv),
  'S100026 CSV row must keep single-token 想去 in tags with no comma spill');
assert(!/Japan powder ski,,,想去,,public/.test(storiesCsv), 'S100026 must not split tags into thumbnail/visibility');

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
assert(storyI18n['1027'] && storyI18n['1027'].en, 'S1027 English overlay');
assert(/Makuhari/i.test(storyI18n['1027'].en.title), 'S1027 English title');
assert((storyI18n['1027'].en.html.match(/class="map-place-link"/g) || []).length === 4, 'S1027 EN place links');
['491', '492', '493', '494'].forEach(id => {
  assert(storyI18n['1027'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1027 EN landmark ' + id);
});
assert(storyI18n['1027'].en.html.indexOf('javascript:zoomto') === -1, 'S1027 EN must not use javascript:zoomto');
assert(storyI18n['1027'].en.html.indexOf('幕張メッセ') !== -1, 'S1027 EN keeps 幕張メッセ name');
assert(storyI18n['1027'].en.html.indexOf('海浜幕張') !== -1, 'S1027 EN station link says 海浜幕張');
assert(storyI18n['1027'].en.html.indexOf('湯楽の里') !== -1, 'S1027 EN keeps 湯楽の里 name');
assert(/tabletop market/i.test(storyI18n['1027'].en.title), 'S1027 EN title matches v5 tabletop-market wording');
assert(storyI18n['1027'].en.html.indexOf('do not commute from Shinjuku') !== -1, 'S1027 EN heading matches v5 Makuhari-not-Shinjuku');
assert(storyI18n['1027'].en.html.indexOf('leave another day for the legs') !== -1, 'S1027 EN heading matches v5 extra day for the legs');
assert(!storyI18n['1027']['zh-TW'], 'do not duplicate Traditional Chinese body for S1027 in story-i18n.json');
assert(storyI18n['1028'] && storyI18n['1028'].en, 'S1028 English overlay');
assert(/Nantes/i.test(storyI18n['1028'].en.title), 'S1028 English title');
assert((storyI18n['1028'].en.html.match(/class="map-place-link"/g) || []).length === 6, 'S1028 EN place links');
['495', '496', '497', '498', '499'].forEach(id => {
  assert(storyI18n['1028'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1028 EN landmark ' + id);
});
assert(storyI18n['1028'].en.html.indexOf('javascript:zoomto') === -1, 'S1028 EN must not use javascript:zoomto');
assert(storyI18n['1028'].en.html.indexOf("Les Machines de l'Île") !== -1, 'S1028 EN keeps Machines name');
assert(storyI18n['1028'].en.html.indexOf('Grand Éléphant') !== -1, 'S1028 EN keeps Grand Éléphant');
assert(storyI18n['1028'].en.html.indexOf('Les Anneaux') !== -1, 'S1028 EN keeps Les Anneaux');
assert(storyI18n['1028'].en.html.indexOf('Hangar à Bananes') !== -1, 'S1028 EN keeps Hangar');
assert(storyI18n['1028'].en.html.indexOf('Grue Titan grise') !== -1, 'S1028 EN keeps grey Titan');
assert(storyI18n['1028'].en.html.indexOf("Mémorial de l'abolition") !== -1, 'S1028 EN keeps memorial name');
assert(!storyI18n['1028']['zh-TW'], 'do not duplicate Traditional Chinese body for S1028 in story-i18n.json');
assert(storyI18n['1029'] && storyI18n['1029'].en, 'S1029 English overlay');
assert(/Fulong/i.test(storyI18n['1029'].en.title), 'S1029 English title');
assert(/Old Caoling/i.test(storyI18n['1029'].en.title), 'S1029 EN title keeps Old Caoling');
assert((storyI18n['1029'].en.html.match(/class="map-place-link"/g) || []).length === 11, 'S1029 EN place links');
['500', '501', '502', '503', '504', '505'].forEach(id => {
  assert(storyI18n['1029'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1029 EN landmark ' + id);
});
assert(storyI18n['1029'].en.html.indexOf('javascript:zoomto') === -1, 'S1029 EN must not use javascript:zoomto');
assert(storyI18n['1029'].en.html.indexOf('福隆車站') !== -1, 'S1029 EN keeps 福隆車站 name');
assert(storyI18n['1029'].en.html.indexOf('舊草嶺隧道') !== -1, 'S1029 EN keeps 舊草嶺隧道');
assert(storyI18n['1029'].en.html.indexOf('北口') !== -1, 'S1029 EN keeps 北口');
assert(storyI18n['1029'].en.html.indexOf('南口') !== -1, 'S1029 EN keeps 南口');
assert(storyI18n['1029'].en.html.indexOf('福隆遊客中心') !== -1, 'S1029 EN keeps visitor centre name');
assert(storyI18n['1029'].en.html.indexOf('海水浴場') !== -1, 'S1029 EN keeps 海水浴場');
assert(storyI18n['1029'].en.html.indexOf('龍門吊橋') !== -1, 'S1029 EN keeps 龍門吊橋');
assert(storyI18n['1029'].en.html.indexOf('福容') !== -1, 'S1029 EN keeps 福容');
assert(!storyI18n['1029']['zh-TW'], 'do not duplicate Traditional Chinese body for S1029 in story-i18n.json');
assert(storyI18n['1030'] && storyI18n['1030'].en, 'S1030 English overlay');
assert(/Akiyoshido/i.test(storyI18n['1030'].en.title), 'S1030 English title');
assert((storyI18n['1030'].en.html.match(/class="map-place-link"/g) || []).length === 5, 'S1030 EN place links');
['506', '507', '508', '509', '510'].forEach(id => {
  assert(storyI18n['1030'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1030 EN landmark ' + id);
});
assert(storyI18n['1030'].en.html.indexOf('javascript:zoomto') === -1, 'S1030 EN must not use javascript:zoomto');
assert(storyI18n['1030'].en.html.indexOf('秋芳洞正面入口') !== -1, 'S1030 EN keeps 秋芳洞正面入口 name');
assert(storyI18n['1030'].en.html.indexOf('百枚皿') !== -1, 'S1030 EN keeps 百枚皿');
assert(storyI18n['1030'].en.html.indexOf('黃金柱') !== -1, 'S1030 EN keeps 黃金柱');
assert(storyI18n['1030'].en.html.indexOf('冒險コース') !== -1, 'S1030 EN keeps 冒險コース');
assert(storyI18n['1030'].en.html.indexOf('カルスト展望台') !== -1, 'S1030 EN keeps カルスト展望台');
assert(!storyI18n['1030']['zh-TW'], 'do not duplicate Traditional Chinese body for S1030 in story-i18n.json');
assert(storyI18n['1031'] && storyI18n['1031'].en, 'S1031 English overlay');
assert(/Ogose/i.test(storyI18n['1031'].en.title), 'S1031 English title');
assert(/Kuroyamaen/i.test(storyI18n['1031'].en.title), 'S1031 EN title keeps Kuroyamaen');
assert((storyI18n['1031'].en.html.match(/class="map-place-link"/g) || []).length === 4, 'S1031 EN place links');
['511', '512', '513', '514'].forEach(id => {
  assert(storyI18n['1031'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1031 EN landmark ' + id);
});
assert(storyI18n['1031'].en.html.indexOf('javascript:zoomto') === -1, 'S1031 EN must not use javascript:zoomto');
assert(storyI18n['1031'].en.html.indexOf('黒山園') !== -1, 'S1031 EN keeps 黒山園 name');
assert(storyI18n['1031'].en.html.indexOf('黒山三滝') !== -1, 'S1031 EN keeps 黒山三滝');
assert(storyI18n['1031'].en.html.indexOf('町營停車場') !== -1, 'S1031 EN keeps 町營停車場');
assert(storyI18n['1031'].en.html.indexOf('越生站') !== -1, 'S1031 EN keeps 越生站');
assert(!storyI18n['1031']['zh-TW'], 'do not duplicate Traditional Chinese body for S1031 in story-i18n.json');
assert(storyI18n['1032'] && storyI18n['1032'].en, 'S1032 English overlay');
assert(/Kawazu/i.test(storyI18n['1032'].en.title), 'S1032 English title');
assert((storyI18n['1032'].en.html.match(/class="map-place-link"/g) || []).length === 6, 'S1032 EN place links');
['515', '516', '517', '518', '519', '520'].forEach(id => {
  assert(storyI18n['1032'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1032 EN landmark ' + id);
});
assert(storyI18n['1032'].en.html.indexOf('javascript:zoomto') === -1, 'S1032 EN must not use javascript:zoomto');
assert(storyI18n['1032'].en.html.indexOf('河津駅') !== -1, 'S1032 EN keeps 河津駅 name');
assert(storyI18n['1032'].en.html.indexOf('河津七滝') !== -1, 'S1032 EN keeps 河津七滝');
assert(storyI18n['1032'].en.html.indexOf('天城荘') !== -1, 'S1032 EN keeps 天城荘');
assert(storyI18n['1032'].en.html.indexOf('峰温泉大噴湯公園') !== -1, 'S1032 EN keeps 峰温泉大噴湯公園');
assert(storyI18n['1032'].en.html.indexOf('今井浜') !== -1, 'S1032 EN keeps 今井浜');
assert(storyI18n['1032'].en.html.indexOf('舟戸の番屋') !== -1, 'S1032 EN keeps 舟戸の番屋');
assert(storyI18n['1032'].en.html.indexOf('images/stories/1032/odaru-fall.jpg') !== -1, 'S1032 EN keeps odaru-fall');
assert(storyI18n['1032'].en.html.indexOf('images/stories/1032/funado-banya.jpg') !== -1, 'S1032 EN keeps funado-banya');
assert(!storyI18n['1032']['zh-TW'], 'do not duplicate Traditional Chinese body for S1032 in story-i18n.json');
assert(storyI18n['1033'] && storyI18n['1033'].en, 'S1033 English overlay');
assert(/Tateyama Murodo/i.test(storyI18n['1033'].en.title), 'S1033 English title');
assert((storyI18n['1033'].en.html.match(/class="map-place-link"/g) || []).length === 4, 'S1033 EN place links');
['521', '522', '523', '524'].forEach(id => {
  assert(storyI18n['1033'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S1033 EN landmark ' + id);
});
assert(storyI18n['1033'].en.html.indexOf('javascript:zoomto') === -1, 'S1033 EN must not use javascript:zoomto');
assert(storyI18n['1033'].en.html.indexOf('立山駅') !== -1, 'S1033 EN keeps 立山駅 name');
assert(storyI18n['1033'].en.html.indexOf('室堂') !== -1, 'S1033 EN keeps 室堂');
assert(storyI18n['1033'].en.html.indexOf('みくりが池') !== -1, 'S1033 EN keeps みくりが池');
assert(storyI18n['1033'].en.html.indexOf('彌陀ヶ原') !== -1, 'S1033 EN keeps 彌陀ヶ原');
assert(!storyI18n['1033']['zh-TW'], 'do not duplicate Traditional Chinese body for S1033 in story-i18n.json');
assert(storyI18n['100026'] && storyI18n['100026'].en, 'S100026 English overlay');
assert(/powder/i.test(storyI18n['100026'].en.title), 'S100026 English title');
assert((storyI18n['100026'].en.html.match(/class="map-place-link"/g) || []).length === 3, 'S100026 EN place links');
['100029', '100030', '100031'].forEach(id => {
  assert(storyI18n['100026'].en.html.indexOf('data-landmark="' + id + '"') !== -1, 'S100026 EN landmark ' + id);
});
assert(storyI18n['100026'].en.html.indexOf('javascript:zoomto') === -1, 'S100026 EN must not use javascript:zoomto');
assert(storyI18n['100026'].en.html.indexOf('石打丸山') !== -1, 'S100026 EN keeps 石打丸山');
assert(storyI18n['100026'].en.html.indexOf('留壽都度假村') !== -1, 'S100026 EN keeps 留壽都度假村');
assert(storyI18n['100026'].en.html.indexOf('富良野滑雪場') !== -1, 'S100026 EN keeps 富良野滑雪場');
assert(storyI18n['100026'].en.html.indexOf('data-landmark="100001"') === -1, 'S100026 EN must not reuse 100001');
assert(storyI18n['100026'].en.html.indexOf('data-landmark="100015"') === -1, 'S100026 EN must not reuse 100015');
assert(!storyI18n['100026']['zh-TW'], 'do not duplicate Traditional Chinese body for S100026 in story-i18n.json');
assert(storyI18n['1002'] && storyI18n['1002'].en && storyI18n['1002'].en.html, 'Tokyo S1002 English overlay');
assert(!onDisk.stories.filter(s => s.story_id === '1024').length || onDisk.stories.filter(s => s.story_id === '1024').length === 1, 'S1024 must not duplicate CSV rows');
assert(onDisk.landmarks.find(l => l.story_id === '1024' && l.landmark_id === '476').name === '璽子牛肉麵', 'pin name stays original in static JSON');

assert(blogHtml.includes('data-lang="zh-TW"') && blogHtml.includes('data-lang="en"'), 'blog language switcher');
assert(blogHtml.includes('data-i18n="nav.home"'), 'blog chrome through data-i18n');
assert(blogHtml.includes('data-i18n-story="1024"'), 'blog S1024 overlay hooks');
assert(blogHtml.includes('data-i18n-story="1028"'), 'blog S1028 overlay hooks');
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
