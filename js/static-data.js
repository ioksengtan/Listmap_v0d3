/**
 * Static CSV-compiled data for GitHub Pages (no Node /api).
 * Loads data/static.json via a path that works on project Pages (/Listmap_v0d3/).
 */
(function (root) {
  function pageBase() {
    var path = location.pathname || '/';
    if (path.endsWith('/')) return path;
    if (/\.html?$/i.test(path)) return path.replace(/\/[^/]+$/, '/');
    return path + '/';
  }

  function assetUrl(relPath) {
    var rel = String(relPath || '').replace(/^\//, '');
    return pageBase() + rel;
  }

  function isLocalhost() {
    var h = location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '';
  }

  function publicOnly(rows) {
    if (isLocalhost()) return rows;
    return (rows || []).filter(function (r) {
      return !r.visibility || r.visibility === 'public';
    });
  }

  var cache = null;
  var loadPromise = null;

  function load() {
    if (cache) {
      return $.Deferred().resolve(cache).promise();
    }
    if (loadPromise) return loadPromise;
    loadPromise = $.getJSON(assetUrl('data/static.json')).then(function (data) {
      cache = data || { stories: [], landmarks: [], collections: [], routes: [] };
      cache.stories = cache.stories || [];
      cache.landmarks = cache.landmarks || [];
      cache.collections = cache.collections || [];
      cache.routes = cache.routes || [];
      return cache;
    });
    return loadPromise;
  }

  function stories() {
    return publicOnly((cache && cache.stories) || []);
  }

  function allLandmarks() {
    return (cache && cache.landmarks) || [];
  }

  function landmarksByStoryId(storyId) {
    var sid = String(storyId);
    return allLandmarks().filter(function (l) {
      return String(l.story_id) === sid;
    });
  }

  function landmarkByIdForStory(landmarkId, storyId) {
    var lid = String(landmarkId);
    var pool = storyId ? landmarksByStoryId(storyId) : allLandmarks();
    return pool.find(function (l) {
      return String(l.landmark_id) === lid;
    }) || null;
  }

  function getRecentStories() {
    return { table: stories() };
  }

  function getLandmarksByStoryId(storyId) {
    return { table: landmarksByStoryId(storyId) };
  }

  function getStoriesIndex() {
    var lms = allLandmarks();
    var result = stories().map(function (s) {
      var firstLm = lms.find(function (l) {
        return String(l.story_id) === String(s.story_id);
      });
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
    }).filter(function (s) {
      return s.lat && s.lng;
    });
    return { table: result };
  }

  function getCollections() {
    var cols = publicOnly((cache && cache.collections) || []);
    var sts = stories();
    var result = cols.map(function (c) {
      var copy = {};
      Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
      copy.story_count = sts.filter(function (s) {
        return String(s.collection_id) === String(c.collection_id);
      }).length;
      return copy;
    });
    return { table: result };
  }

  function getStoriesByCollection(collectionId) {
    var cid = String(collectionId);
    return {
      table: stories().filter(function (s) {
        return String(s.collection_id) === cid;
      }),
    };
  }

  function latLngsForStory(storyId) {
    return landmarksByStoryId(storyId)
      .map(function (lm) {
        return [parseFloat(lm.lat), parseFloat(lm.lng)];
      })
      .filter(function (ll) {
        return !isNaN(ll[0]) && !isNaN(ll[1]);
      });
  }

  root.ListmapData = {
    assetUrl: assetUrl,
    pageBase: pageBase,
    isLocalhost: isLocalhost,
    load: load,
    stories: stories,
    landmarksByStoryId: landmarksByStoryId,
    landmarkByIdForStory: landmarkByIdForStory,
    latLngsForStory: latLngsForStory,
    getRecentStories: getRecentStories,
    getLandmarksByStoryId: getLandmarksByStoryId,
    getStoriesIndex: getStoriesIndex,
    getCollections: getCollections,
    getStoriesByCollection: getStoriesByCollection,
  };
})(window);
