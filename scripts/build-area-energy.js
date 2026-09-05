#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { readCsv } = require('./csv-data');
const { FLOWER_TYPES, computeAreaEnergy } = require('./area-energy');

const ROOT = path.join(__dirname, '..');
const EXP = path.join(ROOT, 'exp');

function loadJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(EXP, filename), 'utf8'));
}

const areasSeed = loadJson('areas.json');
const storyMaps = loadJson('story_areas.json');
const stories = readCsv('stories.csv');
const landmarks = readCsv('landmarks.csv');

const computed = computeAreaEnergy({
  areas: areasSeed.areas,
  storyMaps: storyMaps.stories,
  stories,
  landmarks
});

const areasWithCentroids = areasSeed.areas.map((area) => {
  const row = computed.find((a) => a.id === area.id);
  return Object.assign({}, area, {
    centroid: row ? row.centroid : null,
    pin_count: row ? row.pin_count : 0
  });
});

fs.writeFileSync(path.join(EXP, 'areas.json'), JSON.stringify({
  version: areasSeed.version,
  do_not_merge: true,
  note: areasSeed.note,
  areas: areasWithCentroids
}, null, 2) + '\n');

const payload = {
  version: 'v0.2',
  do_not_merge: true,
  mark_only: true,
  formula: {
    name: 'map-itinerary PM locked v0.2',
    published_stories_only: true,
    story_contribution: {
      rule: 'highest tier only',
      tiers: [
        { tag: '去過', score: 8 },
        { tag: '想去', score: 5 },
        { tag: '整理', score: 3 }
      ]
    },
    landmark_contribution: {
      per_landmark: '+1 × w(d)',
      weight: [
        { when: 'cross-country', w: 0 },
        { when: 'd ≤ 0.6R', w: 1.0 },
        { when: 'd ≤ R', w: 0.5 },
        { when: 'd > R', w: 0 }
      ],
      energy: 'sum of assigned story scores + sum of landmark weights vs the area centroid'
    },
    radii_km: {
      weekend: FLOWER_TYPES.weekend.radius_km,
      week: FLOWER_TYPES.week.radius_km,
      fortnight: FLOWER_TYPES.fortnight.radius_km
    },
    bloom_ready: {
      weekend: 'E≥22 AND stories≥2 AND landmarks≥6',
      week: 'E≥40 AND stories≥3 AND landmarks≥12',
      fortnight: 'E≥70 AND stories≥5 AND landmarks≥20',
      also: '≥1 story tagged 去過 OR marked pocket',
      note: 'Mark only. Never auto-publish collections.'
    },
    centroid: 'average of pin lat/lng for stories whose primary_area is this area',
    nantes: 'S1028 → fr-nantes; centroid = mean of landmarks 495–499; 想去 +5; pocket-style 想去地景'
  },
  generated_from: {
    stories_csv: 'data/stories.csv',
    landmarks_csv: 'data/landmarks.csv',
    areas: 'exp/areas.json',
    story_areas: 'exp/story_areas.json'
  },
  areas: computed
};

fs.writeFileSync(path.join(EXP, 'area_energy.json'), JSON.stringify(payload, null, 2) + '\n');
console.log('Wrote exp/area_energy.json and updated centroids in exp/areas.json');
computed.forEach((area) => {
  const flowers = Object.keys(area.flowers).map((k) => {
    const f = area.flowers[k];
    return k + '(E=' + f.energy + ',S=' + f.story_count + ',L=' + f.landmark_count + ',bloom=' + f.bloom_ready + ')';
  });
  console.log('  ' + area.id + ' centroid=' + JSON.stringify(area.centroid) + ' ' + flowers.join(' '));
});
