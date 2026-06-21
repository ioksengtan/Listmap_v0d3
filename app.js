const express = require('express');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('./'));

app.set('views', './views');
app.set('view engine', 'ejs');

function readCsv(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true });
}

function readStories() {
  const realFile = path.join(__dirname, 'listmap - stories.csv');
  const extraFile = path.join(__dirname, 'data', 'stories.csv');
  const mainFile = fs.existsSync(realFile) ? realFile : extraFile;

  const toStory = r => ({
    story_id: r.story_id,
    collection_id: r.storyBook_id || r.collection_id || '',
    title: r.title,
    type: r.type,
    link: r.link || '',
    author: r.author || '',
    what: r.type || '',
    where: '',
    avatar: '',
    tags: r.tags || '',
    thumbnail: '',
    language: r.language || '',
    visibility: r.visibility || '',
  });

  const mainRows = parse(fs.readFileSync(mainFile, 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true })
    .filter(r => r.is_delete !== '1')
    .map(toStory);

  // 如果主檔案是 Google Sheets 匯出，額外合併 data/stories.csv（blog 自訂文章）
  if (mainFile !== extraFile && fs.existsSync(extraFile)) {
    const extraRows = parse(fs.readFileSync(extraFile, 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true })
      .filter(r => r.is_delete !== '1')
      .map(toStory);
    return [...mainRows, ...extraRows];
  }
  return mainRows;
}

function readLandmarks() {
  const realFile = path.join(__dirname, 'listmap - landmarks.csv');
  const extraFile = path.join(__dirname, 'data', 'landmarks.csv');
  const mainFile = fs.existsSync(realFile) ? realFile : extraFile;

  const toLandmark = r => ({
    landmark_id: r.landmark_id,
    story_id: r.story_id,
    name: r.name,
    lat: r.lat,
    lng: r.lng,
    content: r.notes || r.content || '',
    link: r.link || '',
    address: r.address || '',
    tags: r.tags || '',
  });

  const mainRows = parse(fs.readFileSync(mainFile, 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true })
    .filter(r => r.is_delete !== '1')
    .map(toLandmark);

  if (mainFile !== extraFile && fs.existsSync(extraFile)) {
    const extraRows = parse(fs.readFileSync(extraFile, 'utf8'), { columns: true, skip_empty_lines: true, relax_quotes: true })
      .filter(r => r.is_delete !== '1')
      .map(toLandmark);
    return [...mainRows, ...extraRows];
  }
  return mainRows;
}

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
