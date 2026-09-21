#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, buildStaticPayload, readStories, readCollections } = require('./csv-data');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const payload = buildStaticPayload();
const publicStoryIds = new Set(payload.stories.map(story => story.story_id));
const nonPublicStories = readStories().filter(story => story.visibility === 'internal' || story.visibility === 'private');
const nonPublicCollections = readCollections().filter(collection => collection.visibility === 'internal' || collection.visibility === 'private');

assert(nonPublicStories.length > 0, 'fixture must include a non-public story');
assert(nonPublicCollections.length > 0, 'fixture must include a non-public collection');
assert(nonPublicStories.every(story => !publicStoryIds.has(story.story_id)), 'static payload leaked a non-public story');
assert(payload.landmarks.every(landmark => publicStoryIds.has(landmark.story_id)), 'static payload leaked an orphan/private landmark');
assert(payload.routes.every(route => publicStoryIds.has(String(route.story_id))), 'static payload leaked a private route');
assert(nonPublicCollections.every(collection => !payload.collections.some(item => item.collection_id === collection.collection_id)), 'static payload leaked a non-public collection');

const appSource = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
assert(appSource.includes('filterLandmarksByVisibility'), 'API landmark visibility guard missing');
assert(appSource.includes('stories|landmarks|collections|routes|views'), 'raw CSV static-file guard missing');

console.log('OK: public payload excludes private/internal stories, landmarks, routes, and collections');
