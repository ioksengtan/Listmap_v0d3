const express = require('express');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const {
  readStories,
  readLandmarks,
  readCsv,
  appendCsvRow,
  updateCsvRow,
  softDeleteCsvRow,
} = require('./scripts/csv-data');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('./'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', './views');
app.set('view engine', 'ejs');

function isLocalhost(req) {
  const ip = req.ip || (req.connection && req.connection.remoteAddress) || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

function filterByVisibility(rows, local) {
  if (local) return rows;
  // localhost 以外只顯示 public（空值視為 public）
  return rows.filter(r => !r.visibility || r.visibility === 'public');
  // internal / private 都不對外公開
}

const STORY_COLUMNS = [
  'story_id', 'collection_id', 'title', 'type', 'link', 'author', 'what',
  'where', 'avatar', 'tags', 'thumbnail', 'visibility', 'created_at',
  'start_date', 'end_date', 'contributor', 'is_delete'
];
const LANDMARK_COLUMNS = [
  'landmark_id', 'story_id', 'name', 'lat', 'lng', 'content', 'link',
  'contributor', 'is_delete'
];
const STORY_FIELDS = new Set(STORY_COLUMNS.filter(field => field !== 'story_id'));
const LANDMARK_FIELDS = new Set(LANDMARK_COLUMNS.filter(field => field !== 'landmark_id'));

function apiOk(res, data, status = 200) {
  return res.status(status).json({ data });
}

function apiError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function requireLocalWrite(req, res) {
  if (!isLocalhost(req)) {
    apiError(res, 403, 'LOCAL_WRITE_ONLY', 'CSV content management is available from localhost only');
    return false;
  }
  return true;
}

function nextId(rows, field) {
  const ids = rows
    .map(row => Number.parseInt(row[field], 10))
    .filter(Number.isInteger);
  return String((ids.length ? Math.max(...ids) : 0) + 1);
}

function pickFields(source, allowed) {
  return Object.keys(source || {}).reduce((result, key) => {
    if (allowed.has(key)) result[key] = source[key];
    return result;
  }, {});
}

function validateStory(input) {
  if (!input.title || !String(input.title).trim()) return 'title is required';
  return null;
}

function validateLandmark(input) {
  if (!input.story_id) return 'story_id is required';
  if (!input.name || !String(input.name).trim()) return 'name is required';
  const lat = Number(input.lat);
  const lng = Number(input.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return 'lat must be between -90 and 90';
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return 'lng must be between -180 and 180';
  return null;
}

function addRestApi() {
  app.get('/api/v1/stories', (req, res) => {
    const stories = filterByVisibility(readStories(), isLocalhost(req));
    return apiOk(res, stories);
  });

  app.get('/api/v1/stories/:storyId', (req, res) => {
    const story = filterByVisibility(readStories(), isLocalhost(req))
      .find(item => item.story_id === String(req.params.storyId));
    return story ? apiOk(res, story) : apiError(res, 404, 'NOT_FOUND', 'Story not found');
  });

  app.post('/api/v1/stories', (req, res) => {
    if (!requireLocalWrite(req, res)) return;
    const input = pickFields(req.body, STORY_FIELDS);
    const validationError = validateStory(input);
    if (validationError) return apiError(res, 400, 'VALIDATION_ERROR', validationError);
    const stories = readStories();
    const story = {
      story_id: req.body.story_id ? String(req.body.story_id) : nextId(stories, 'story_id'),
      collection_id: input.collection_id || '',
      title: String(input.title).trim(),
      type: input.type || 'blog',
      link: input.link || '',
      author: input.author || '',
      what: input.what || input.type || 'blog',
      where: input.where || '',
      avatar: input.avatar || '',
      tags: input.tags || '',
      thumbnail: input.thumbnail || '',
      visibility: input.visibility || 'private',
      created_at: input.created_at || new Date().toISOString().slice(0, 10),
      start_date: input.start_date || '',
      end_date: input.end_date || '',
      contributor: input.contributor || '',
    };
    if (stories.some(item => item.story_id === story.story_id)) {
      return apiError(res, 409, 'DUPLICATE_ID', 'story_id already exists');
    }
    appendCsvRow('stories.csv', story, STORY_COLUMNS);
    return apiOk(res, story, 201);
  });

  app.patch('/api/v1/stories/:storyId', (req, res) => {
    if (!requireLocalWrite(req, res)) return;
    const input = pickFields(req.body, STORY_FIELDS);
    const validationError = validateStory({ ...readStories().find(item => item.story_id === String(req.params.storyId)), ...input });
    if (validationError) return apiError(res, 400, 'VALIDATION_ERROR', validationError);
    const updated = updateCsvRow('stories.csv', 'story_id', req.params.storyId, input, STORY_COLUMNS);
    if (!updated) return apiError(res, 404, 'NOT_FOUND', 'Story is not managed by data/stories.csv');
    const story = readStories().find(item => item.story_id === String(req.params.storyId));
    return apiOk(res, story);
  });

  app.delete('/api/v1/stories/:storyId', (req, res) => {
    if (!requireLocalWrite(req, res)) return;
    const deleted = softDeleteCsvRow('stories.csv', 'story_id', req.params.storyId, STORY_COLUMNS);
    return deleted ? apiOk(res, { story_id: String(req.params.storyId), deleted: true })
      : apiError(res, 404, 'NOT_FOUND', 'Story is not managed by data/stories.csv');
  });

  app.get('/api/v1/stories/:storyId/landmarks', (req, res) => {
    const landmarks = readLandmarks().filter(item => item.story_id === String(req.params.storyId));
    return apiOk(res, landmarks);
  });

  app.post('/api/v1/landmarks', (req, res) => {
    if (!requireLocalWrite(req, res)) return;
    const input = pickFields(req.body, LANDMARK_FIELDS);
    const validationError = validateLandmark(input);
    if (validationError) return apiError(res, 400, 'VALIDATION_ERROR', validationError);
    const landmarks = readLandmarks();
    const landmark = {
      landmark_id: req.body.landmark_id ? String(req.body.landmark_id) : nextId(landmarks, 'landmark_id'),
      story_id: String(input.story_id),
      name: String(input.name).trim(),
      lat: String(input.lat),
      lng: String(input.lng),
      content: input.content || '',
      link: input.link || '',
      contributor: input.contributor || '',
    };
    if (!readStories().some(item => item.story_id === landmark.story_id)) {
      return apiError(res, 400, 'INVALID_STORY', 'story_id does not exist');
    }
    if (landmarks.some(item => item.landmark_id === landmark.landmark_id)) {
      return apiError(res, 409, 'DUPLICATE_ID', 'landmark_id already exists');
    }
    appendCsvRow('landmarks.csv', landmark, LANDMARK_COLUMNS);
    return apiOk(res, landmark, 201);
  });

  app.patch('/api/v1/landmarks/:landmarkId', (req, res) => {
    if (!requireLocalWrite(req, res)) return;
    const current = readLandmarks().find(item => item.landmark_id === String(req.params.landmarkId));
    if (!current) return apiError(res, 404, 'NOT_FOUND', 'Landmark is not managed by data/landmarks.csv');
    const input = pickFields(req.body, LANDMARK_FIELDS);
    const next = { ...current, ...input };
    const validationError = validateLandmark(next);
    if (validationError) return apiError(res, 400, 'VALIDATION_ERROR', validationError);
    const updated = updateCsvRow('landmarks.csv', 'landmark_id', req.params.landmarkId, input, LANDMARK_COLUMNS);
    if (!updated) return apiError(res, 404, 'NOT_FOUND', 'Landmark is not managed by data/landmarks.csv');
    return apiOk(res, readLandmarks().find(item => item.landmark_id === String(req.params.landmarkId)));
  });

  app.delete('/api/v1/landmarks/:landmarkId', (req, res) => {
    if (!requireLocalWrite(req, res)) return;
    const deleted = softDeleteCsvRow('landmarks.csv', 'landmark_id', req.params.landmarkId, LANDMARK_COLUMNS);
    return deleted ? apiOk(res, { landmark_id: String(req.params.landmarkId), deleted: true })
      : apiError(res, 404, 'NOT_FOUND', 'Landmark is not managed by data/landmarks.csv');
  });
}

addRestApi();

app.get('/api', (req, res) => {
  const { command, story_id, collection_id, keyword, author, tag } = req.query;
  const local = isLocalhost(req);

  try {
    if (command === 'getRecentStories') {
      const stories = filterByVisibility(readStories(), local);
      res.json({ table: stories });

    } else if (command === 'get_landmarks_by_story_id') {
      const landmarks = readLandmarks();
      const filtered = landmarks.filter(r => r.story_id === story_id);
      res.json({ table: filtered });

    } else if (command === 'sql_get_stories_by_keyword') {
      const stories = filterByVisibility(readStories(), local);
      const kw = keyword.toLowerCase();
      const filtered = stories.filter(r =>
        r.title.toLowerCase().includes(kw) ||
        r.what.toLowerCase().includes(kw) ||
        r.where.toLowerCase().includes(kw)
      );
      res.json(filtered.map(r => [r.title, r.story_id, r.type, r.link, r.author]));

    } else if (command === 'sql_get_stories_by_author') {
      const stories = filterByVisibility(readStories(), local);
      const filtered = stories.filter(r => r.author.toLowerCase() === author.toLowerCase());
      res.json(filtered.map(r => [r.title, r.story_id, r.type, r.link, r.author]));

    } else if (command === 'sql_get_stories_by_tag') {
      const stories = filterByVisibility(readStories(), local);
      const filtered = stories.filter(r =>
        r.tags.split(',').map(t => t.trim()).includes(tag)
      );
      res.json(filtered.map(r => [r.title, r.story_id, r.type, r.link, r.author]));

    } else if (command === 'getCollections') {
      const collections = filterByVisibility(readCsv('collections.csv'), local);
      const stories = filterByVisibility(readStories(), local);
      const result = collections.map(c => ({
        ...c,
        story_count: stories.filter(s => s.collection_id === c.collection_id).length
      }));
      res.json({ table: result });

    } else if (command === 'getStoriesByCollection') {
      const stories = filterByVisibility(readStories(), local);
      const filtered = stories.filter(r => r.collection_id === collection_id);
      res.json({ table: filtered });

    } else if (command === 'getCollectionWithStories') {
      const collections = filterByVisibility(readCsv('collections.csv'), local);
      const stories = filterByVisibility(readStories(), local);
      const landmarks = readLandmarks();
      const collection = collections.find(c => c.collection_id === collection_id);
      if (!collection) return res.status(404).json({ error: 'Collection not found' });
      const collectionStories = stories.filter(s => s.collection_id === collection_id);
      const result = {
        ...collection,
        stories: collectionStories.map(s => ({
          ...s,
          landmarks: landmarks.filter(l => l.story_id === s.story_id)
        }))
      };
      res.json(result);

    } else if (command === 'getStoriesIndex') {
      const stories = filterByVisibility(readStories(), local);
      const landmarks = readLandmarks();
      const result = stories.map(s => {
        const firstLm = landmarks.find(l => l.story_id === s.story_id);
        return {
          story_id: s.story_id,
          title: s.title,
          author: s.author,
          tags: s.tags,
          type: s.type,
          visibility: s.visibility || 'public',
          lat: firstLm ? firstLm.lat : null,
          lng: firstLm ? firstLm.lng : null,
        };
      }).filter(s => s.lat && s.lng);
      res.json({ table: result });

    } else if (command === 'logView') {
      const sid = req.query.story_id || '';
      if (sid) {
        const viewsFile = path.join(__dirname, 'data', 'views.csv');
        const ts = new Date().toISOString();
        const ip = req.ip || '';
        const ref = req.headers.referer || '';
        const line = `${ts},${sid},${ip},${JSON.stringify(ref)}\n`;
        if (!fs.existsSync(viewsFile)) fs.writeFileSync(viewsFile, 'timestamp,story_id,ip,referrer\n');
        fs.appendFileSync(viewsFile, line);
      }
      res.json({ ok: true });

    } else if (command === 'getViewStats') {
      const viewsFile = path.join(__dirname, 'data', 'views.csv');
      if (!fs.existsSync(viewsFile)) return res.json({ table: [] });
      const rows = parse(fs.readFileSync(viewsFile, 'utf8'), { columns: true, skip_empty_lines: true });
      // 統計每個 story_id 的瀏覽次數
      const counts = {};
      rows.forEach(r => { counts[r.story_id] = (counts[r.story_id] || 0) + 1; });
      const stories = readStories();
      const result = Object.entries(counts)
        .map(([sid, count]) => {
          const s = stories.find(x => x.story_id === sid);
          return { story_id: sid, title: s ? s.title : sid, views: count };
        })
        .sort((a, b) => b.views - a.views);
      res.json({ table: result });

    } else if (command === 'getRoutesByStoryId') {
      const routes = readCsv('routes.csv');
      const filtered = routes.filter(r => r.story_id === story_id);
      // 將同一 route_id 的點合併成一條路線
      const routeMap = {};
      filtered.forEach(r => {
        if (!routeMap[r.route_id]) {
          routeMap[r.route_id] = { route_id: r.route_id, name: r.name, type: r.type, color: r.color, points: [] };
        }
        routeMap[r.route_id].points.push({ seq: parseInt(r.sequence), lat: parseFloat(r.lat), lng: parseFloat(r.lng) });
      });
      Object.values(routeMap).forEach(r => r.points.sort((a, b) => a.seq - b.seq));
      res.json({ table: Object.values(routeMap) });

    } else if (command === 'get_landmarks_by_zone') {
      const { lat_south, lat_north, lng_west, lng_east } = req.query;
      const landmarks = readLandmarks();
      const stories = readStories();
      const filtered = landmarks.filter(r =>
        parseFloat(r.lat) >= parseFloat(lat_south) &&
        parseFloat(r.lat) <= parseFloat(lat_north) &&
        parseFloat(r.lng) >= parseFloat(lng_west) &&
        parseFloat(r.lng) <= parseFloat(lng_east)
      );
      const storyMap = {};
      filtered.forEach(lm => {
        const story = stories.find(s => s.story_id === lm.story_id);
        if (story) storyMap[lm.story_id] = story.title;
      });
      res.json({ landmarks: filtered, stories: storyMap });

    } else {
      res.status(400).json({ error: 'Unknown command' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/test', (req, res) => {
  res.render('test');
});

app.listen(port, () => {
  console.log(`Listmap running at http://localhost:${port}`);
});
