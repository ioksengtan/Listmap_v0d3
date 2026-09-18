#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, buildStaticPayload } = require('./csv-data');
const { compileStoryPages } = require('./compile-story-pages');
const { compileSitemap } = require('./compile-sitemap');
const { execFileSync } = require('child_process');

try {
  execFileSync(process.execPath, [path.join(__dirname, 'check-unique-ids.js')], { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}

const payload = buildStaticPayload();
const outFile = path.join(ROOT, 'data', 'static.json');
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n');

const storyPages = compileStoryPages(payload.stories, payload.landmarks, { routes: payload.routes });
const sitemap = compileSitemap(payload.stories);

const storyIds = new Set(payload.stories.map(s => s.story_id));
const landmarkStoryIds = new Set(payload.landmarks.map(l => l.story_id));
console.log('Wrote ' + outFile);
console.log('  stories:      ' + payload.stories.length);
console.log('  landmarks:    ' + payload.landmarks.length);
console.log('  collections:  ' + payload.collections.length);
console.log('  routes:       ' + payload.routes.length);
console.log('  stories with landmarks: ' + [...storyIds].filter(id => landmarkStoryIds.has(id)).length);
console.log('  share pages:  ' + (storyPages.length ? storyPages.join(', ') : '(none)'));
console.log('  story json:   data/stories/<id>.json × ' + storyPages.length);
console.log('  sitemap urls: ' + sitemap.urlCount);
console.log('  og images:    ' + fs.readdirSync(path.join(ROOT, 'images', 'og')).filter((n) => /^\d+\.jpg$/.test(n)).length);
