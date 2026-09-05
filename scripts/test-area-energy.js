#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, readCsv } = require('./csv-data');
const {
  storyScore,
  landmarkWeight,
  haversineKm,
  averageCentroid,
  bloomReady,
  computeAreaEnergy
} = require('./area-energy');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL: ' + msg);
    process.exit(1);
  }
}

assert(storyScore('吃,去過') === 8, 'highest tier 去過 beats 吃');
assert(storyScore('渡假,想去') === 5, '想去 scores 5; 渡假 is not a tier');
assert(storyScore('整理') === 3, '整理 scores 3');
assert(storyScore('去過,想去,整理') === 8, 'highest tier only');
assert(storyScore('吃,渡假') === 0, 'non-tier tags score 0');

assert(landmarkWeight(10, 30, true) === 1, 'd ≤ 0.6R → 1');
assert(landmarkWeight(18, 30, true) === 1, 'd = 0.6R → 1');
assert(landmarkWeight(18.1, 30, true) === 0.5, '0.6R < d ≤ R → 0.5');
assert(landmarkWeight(30, 30, true) === 0.5, 'd = R → 0.5');
assert(landmarkWeight(30.1, 30, true) === 0, 'd > R → 0');
assert(landmarkWeight(1, 30, false) === 0, 'cross-country → 0 even if nearby');

assert(bloomReady('weekend', 22, 2, 6, true) === true, 'weekend bloom all gates');
assert(bloomReady('weekend', 21.9, 2, 6, true) === false, 'weekend energy gate');
assert(bloomReady('weekend', 22, 1, 6, true) === false, 'weekend story gate');
assert(bloomReady('weekend', 22, 2, 5, true) === false, 'weekend landmark gate');
assert(bloomReady('weekend', 99, 9, 99, false) === false, 'need 去過 or pocket');
assert(bloomReady('week', 40, 3, 12, true) === true, 'week bloom all gates');
assert(bloomReady('fortnight', 70, 5, 20, true) === true, 'fortnight bloom all gates');
assert(bloomReady('week', 39.9, 3, 12, true) === false, 'week energy gate');

const c = averageCentroid([
  { lat: 24.0, lng: 120.0 },
  { lat: 26.0, lng: 122.0 }
]);
assert(c.lat === 25 && c.lng === 121, 'centroid is the mean of pins');

const taipei = { lat: 25.033, lng: 121.565 };
const hsinchuApprox = { lat: 24.804, lng: 120.968 };
const d = haversineKm(taipei, hsinchuApprox);
assert(d > 60 && d < 90, 'Hsinchu–Taipei haversine should be ~70–80km, got ' + d);

const stories = readCsv('stories.csv');
const landmarks = readCsv('landmarks.csv');
const areasSeed = JSON.parse(fs.readFileSync(path.join(ROOT, 'exp', 'areas.json'), 'utf8'));
const storyMaps = JSON.parse(fs.readFileSync(path.join(ROOT, 'exp', 'story_areas.json'), 'utf8'));
const energyJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'exp', 'area_energy.json'), 'utf8'));

assert(energyJson.version === 'v0.2', 'energy json version');
assert(energyJson.do_not_merge === true, 'energy json must say do_not_merge');
assert(energyJson.mark_only === true, 'energy json is mark-only');
assert(stories.some((s) => String(s.story_id) === '1028' && s.visibility === 'public'), 'S1028 must be public on master');
assert(energyJson.areas.some((a) => a.id === 'fr-nantes'), 'fr-nantes must be seeded from S1028');

const ids = energyJson.areas.map((a) => a.id).sort();
assert(ids.join(',') === 'fr-nantes,jp-makuhari,tw-hsinchu,tw-yangmingshan', 'four seed areas');

const recomputed = computeAreaEnergy({
  areas: areasSeed.areas,
  storyMaps: storyMaps.stories,
  stories,
  landmarks
});

recomputed.forEach((area) => {
  const frozen = energyJson.areas.find((a) => a.id === area.id);
  assert(frozen, 'missing frozen area ' + area.id);
  ['weekend', 'week', 'fortnight'].forEach((flower) => {
    const a = area.flowers[flower];
    const b = frozen.flowers[flower];
    assert(a.energy === b.energy, area.id + ' ' + flower + ' energy drift');
    assert(a.story_count === b.story_count, area.id + ' ' + flower + ' story_count drift');
    assert(a.landmark_count === b.landmark_count, area.id + ' ' + flower + ' landmark_count drift');
    assert(a.bloom_ready === b.bloom_ready, area.id + ' ' + flower + ' bloom drift');
    assert(a.radius_km === b.radius_km, area.id + ' ' + flower + ' radius drift');
  });
});

const hsinchu = energyJson.areas.find((a) => a.id === 'tw-hsinchu');
const yangming = energyJson.areas.find((a) => a.id === 'tw-yangmingshan');
const makuhari = energyJson.areas.find((a) => a.id === 'jp-makuhari');
const nantes = energyJson.areas.find((a) => a.id === 'fr-nantes');

assert(hsinchu.stories.length === 1 && hsinchu.stories[0].story_id === '1024', 'S1024 → tw-hsinchu');
assert(yangming.stories.length === 1 && yangming.stories[0].story_id === '1025', 'S1025 → tw-yangmingshan');
assert(makuhari.stories.length === 1 && makuhari.stories[0].story_id === '1027', 'S1027 → jp-makuhari');
assert(nantes.stories.length === 1 && nantes.stories[0].story_id === '1028', 'S1028 → fr-nantes');
assert(hsinchu.stories[0].score === 8, 'S1024 去過 = 8');
assert(yangming.stories[0].score === 8, 'S1025 去過 = 8');
assert(makuhari.stories[0].score === 5, 'S1027 想去 = 5');
assert(nantes.stories[0].score === 5, 'S1028 想去 = 5');
assert(nantes.stories[0].pocket === true, 'S1028 is pocket-style 想去地景');
assert(nantes.country === 'fr', 'Nantes country is fr');
assert(nantes.centroid.lat === 47.203462 && nantes.centroid.lng === -1.569861,
  'Nantes centroid is mean of landmarks 495–499, got ' + JSON.stringify(nantes.centroid));

assert(hsinchu.flowers.weekend.energy === 13, 'Hsinchu weekend = 8 + 5 own pins');
assert(hsinchu.flowers.weekend.story_count === 1, 'Hsinchu story count');
assert(hsinchu.flowers.weekend.landmark_count === 5, 'Hsinchu weekend landmarks stay local');
assert(hsinchu.flowers.week.landmark_count === 11, 'Hsinchu week picks up Yangmingshan pins');
assert(hsinchu.flowers.week.energy === 16, 'Hsinchu week = 8 + 5 + 6×0.5');
assert(hsinchu.flowers.fortnight.landmark_count === 11, 'Hsinchu fortnight same-country pins');
assert(hsinchu.flowers.fortnight.energy === 19, 'Hsinchu fortnight = 8 + 5 + 6×1');

assert(yangming.flowers.weekend.energy === 14, 'Yangmingshan weekend = 8 + 6');
assert(yangming.flowers.weekend.landmark_count === 6, 'Yangmingshan weekend landmarks');
assert(yangming.flowers.week.energy === 16.5, 'Yangmingshan week = 8 + 6 + 5×0.5');
assert(yangming.flowers.fortnight.energy === 19, 'Yangmingshan fortnight = 8 + 6 + 5');

assert(makuhari.flowers.weekend.energy === 9, 'Makuhari = 5 + 4');
assert(makuhari.flowers.week.energy === 9, 'Makuhari week unchanged (TW pins are cross-country)');
assert(makuhari.flowers.fortnight.energy === 9, 'Makuhari fortnight unchanged');
assert(makuhari.flowers.weekend.landmark_count === 4, 'Makuhari own pins only');
assert(makuhari.has_been_or_pocket === false, 'Makuhari has 想去, not 去過/pocket');
assert(nantes.has_been_or_pocket === true, 'Nantes pocket-style satisfies 去過-or-pocket gate');

['weekend', 'week', 'fortnight'].forEach((flower) => {
  assert(nantes.flowers[flower].energy === 10, 'Nantes ' + flower + ' = 5 + 5 own pins');
  assert(nantes.flowers[flower].story_count === 1, 'Nantes ' + flower + ' story count');
  assert(nantes.flowers[flower].landmark_count === 5, 'Nantes ' + flower + ' landmarks stay local');
  assert(nantes.flowers[flower].bloom_ready === false, 'Nantes ' + flower + ' not bloom_ready');
  assert(hsinchu.flowers[flower].bloom_ready === false, 'Hsinchu ' + flower + ' not bloom_ready');
  assert(yangming.flowers[flower].bloom_ready === false, 'Yangmingshan ' + flower + ' not bloom_ready');
  assert(makuhari.flowers[flower].bloom_ready === false, 'Makuhari ' + flower + ' not bloom_ready');
});

const nantesPins = landmarks.filter((l) => String(l.story_id) === '1028');
assert(nantesPins.length === 5, 'S1028 has 5 landmarks');
['495', '496', '497', '498', '499'].forEach((id) => {
  assert(nantesPins.some((l) => String(l.landmark_id) === id), 'S1028 missing landmark ' + id);
});

assert(hsinchu.has_been_or_pocket === true, 'Hsinchu has 去過');
assert(yangming.has_been_or_pocket === true, 'Yangmingshan has 去過');

const html = fs.readFileSync(path.join(ROOT, 'exp', 'flower-energy.html'), 'utf8');
assert(html.includes('area_energy.json'), 'page loads exp/area_energy.json');
assert(html.includes('fr-nantes'), 'page keeps fr-nantes as an internal id');
assert(/bloom_ready|bloom-ready/.test(html), 'page still reads bloom_ready from JSON');
assert(html.includes('區域能量試算（實驗）'), 'page title is Traditional Chinese');
assert(html.includes('可以開花（草稿）'), 'bloom mark uses 可以開花（草稿）');
assert(html.includes('長週末花') && html.includes('一週花') && html.includes('兩週花'),
  'flower types use 長週末花／一週花／兩週花');
assert(html.includes('故事篇數') && html.includes('地圖釘點') && html.includes('涵蓋範圍'),
  'counts use 故事篇數／地圖釘點／涵蓋範圍');
assert(html.includes('怎麼算'), 'formula is collapsed under 怎麼算');
assert(!html.includes('bloom_ready ·') && !html.includes('not bloom_ready'),
  'English bloom_ready must not be user-facing');
assert(!/auto-publish|自動發布/.test(html) || /不自動|never auto-publish|不會自動/.test(html),
  'page must not auto-publish collections');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const blogHtml = fs.readFileSync(path.join(ROOT, 'blog.html'), 'utf8');
assert(!/exp\//.test(indexHtml), 'homepage must not link into exp/');
assert(!/exp\//.test(blogHtml), 'blog.html must not link into exp/');
assert(!/flower-energy/.test(indexHtml), 'homepage must not mention flower-energy');
assert(!/flower-energy/.test(blogHtml), 'blog.html must not mention flower-energy');

console.log('OK: v0.2 area-flower energy checks passed');
energyJson.areas.forEach((area) => {
  const parts = ['weekend', 'week', 'fortnight'].map((k) => {
    const f = area.flowers[k];
    return k + '=' + f.energy + (f.bloom_ready ? '*' : '');
  });
  console.log('  ' + area.id + ' ' + parts.join(' '));
});
