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
assert(!energyJson.areas.some((a) => a.id === 'fr-nantes'), 'do not invent fr-nantes without S1028');
assert(!stories.some((s) => String(s.story_id) === '1028'), 'S1028 is not a public story on master');

const ids = energyJson.areas.map((a) => a.id).sort();
assert(ids.join(',') === 'jp-makuhari,tw-hsinchu,tw-yangmingshan', 'seed areas only');

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

assert(hsinchu.stories.length === 1 && hsinchu.stories[0].story_id === '1024', 'S1024 → tw-hsinchu');
assert(yangming.stories.length === 1 && yangming.stories[0].story_id === '1025', 'S1025 → tw-yangmingshan');
assert(makuhari.stories.length === 1 && makuhari.stories[0].story_id === '1027', 'S1027 → jp-makuhari');
assert(hsinchu.stories[0].score === 8, 'S1024 去過 = 8');
assert(yangming.stories[0].score === 8, 'S1025 去過 = 8');
assert(makuhari.stories[0].score === 5, 'S1027 想去 = 5');

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

['weekend', 'week', 'fortnight'].forEach((flower) => {
  assert(hsinchu.flowers[flower].bloom_ready === false, 'Hsinchu ' + flower + ' not bloom_ready');
  assert(yangming.flowers[flower].bloom_ready === false, 'Yangmingshan ' + flower + ' not bloom_ready');
  assert(makuhari.flowers[flower].bloom_ready === false, 'Makuhari ' + flower + ' not bloom_ready');
});

assert(hsinchu.has_been_or_pocket === true, 'Hsinchu has 去過');
assert(yangming.has_been_or_pocket === true, 'Yangmingshan has 去過');

const html = fs.readFileSync(path.join(ROOT, 'exp', 'flower-energy.html'), 'utf8');
assert(html.includes('area_energy.json'), 'page loads exp/area_energy.json');
assert(/bloom_ready|bloom-ready/.test(html), 'page marks bloom_ready');
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
