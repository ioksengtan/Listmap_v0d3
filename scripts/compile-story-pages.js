'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./csv-data');
const { generatedOgRel, compileOgImages } = require('./compile-og-images');

/** GitHub project Pages origin. Do not invent a custom domain. */
const PAGES_ORIGIN = 'https://ioksengtan.github.io/Listmap_v0d3';
const DEFAULT_OG_IMAGE = 'img/og-default.png';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function escapeAttr(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripTags(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function storyPageRel(storyId) {
  return 'stories/' + storyId + '.html';
}

function absolutePagesUrl(relPath) {
  const rel = String(relPath || '').replace(/^\//, '');
  return PAGES_ORIGIN + '/' + rel;
}

function extractCardDesc(blogHtml, storyId) {
  const re = new RegExp(
    'data-i18n-story="' + storyId + '"\\s+data-i18n-story-field="cardDesc">([^<]*)<',
    'i'
  );
  const m = blogHtml.match(re);
  return m ? m[1].trim() : '';
}

function extractSection(blogHtml, storyId) {
  const html = String(blogHtml || '');
  const openRe = new RegExp(
    '<section\\b[^>]*\\bdata-story-id="' + storyId + '"[^>]*>',
    'i'
  );
  const open = html.match(openRe);
  if (!open) return '';
  const start = open.index;
  const end = findMatchingSectionEnd(html, start + open[0].length);
  return end === -1 ? '' : html.slice(start, end);
}

/** Find the </section> that closes the tag that ended at openEnd, counting nested <section>. */
function findMatchingSectionEnd(html, openEnd) {
  const scanner = /<\/section>|<section\b/gi;
  scanner.lastIndex = openEnd;
  let depth = 1;
  let sm;
  while ((sm = scanner.exec(html))) {
    if (sm[0].charAt(1) === '/') {
      depth -= 1;
      if (depth === 0) return sm.index + sm[0].length;
    } else {
      depth += 1;
    }
  }
  return -1;
}

/**
 * Permalink pages keep shared chrome + map + only this story's section.
 * Other <section data-story-id> blocks (and their images) are dropped.
 */
function stripOtherStorySections(html, keepId) {
  const keep = String(keepId);
  const openRe = /<section\b[^>]*\bdata-story-id="(\d+)"[^>]*>/gi;
  let out = '';
  let last = 0;
  let m;
  while ((m = openRe.exec(html))) {
    const start = m.index;
    const end = findMatchingSectionEnd(html, start + m[0].length);
    if (end === -1) break;
    out += html.slice(last, start);
    if (m[1] === keep) out += html.slice(start, end);
    last = end;
    openRe.lastIndex = end;
  }
  out += html.slice(last);
  return out;
}

function stripStoryIdCommentsExcept(html, keepId) {
  return String(html || '').replace(/<!--\s*story_id=(\d+)[\s\S]*?-->\s*/g, function (full, id) {
    return String(id) === String(keepId) ? full : '';
  });
}

function addImgLazyLoading(html) {
  return String(html || '').replace(/<img\b([^>]*?)(\s*\/?)>/gi, function (full, attrs, slash) {
    if (/\bloading\s*=/i.test(attrs)) return full;
    return '<img' + attrs + ' loading="lazy"' + (slash ? slash : '') + '>';
  });
}

function useVueMinBuild(html) {
  return String(html || '').replace(
    /cdn\.jsdelivr\.net\/npm\/vue@2\/dist\/vue\.js/g,
    'cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js'
  );
}

function storyJsonRel(storyId) {
  return 'data/stories/' + storyId + '.json';
}

function buildStoryPayload(story, landmarks, routes) {
  const sid = String(story.story_id);
  return {
    stories: [story],
    landmarks: (landmarks || []).filter((lm) => String(lm.story_id) === sid),
    collections: [],
    routes: (routes || []).filter((r) => String(r.story_id) === sid),
  };
}

function descriptionForStory(blogHtml, story) {
  const fromCard = extractCardDesc(blogHtml, story.story_id);
  if (fromCard) return fromCard;
  const section = extractSection(blogHtml, story.story_id);
  const firstP = section.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const text = stripTags(firstP ? firstP[1] : section);
  if (text.length <= 180) return text;
  return text.slice(0, 177).replace(/\s+\S*$/, '') + '…';
}

function ogImageRel(story) {
  const generated = generatedOgRel(story.story_id);
  if (fs.existsSync(path.join(ROOT, generated))) return generated;
  const thumb = String(story.thumbnail || '').trim();
  if (thumb) {
    if (/^https?:\/\//i.test(thumb)) return thumb;
    return thumb.replace(/^\//, '');
  }
  return DEFAULT_OG_IMAGE;
}

function resolveImageUrl(imageRel) {
  return /^https?:\/\//i.test(imageRel) ? imageRel : absolutePagesUrl(imageRel);
}

/** Every public CSV story that has a blog.html section — low lane and 100000+ lane. */
function shareableStories(stories, blogHtml) {
  return (stories || []).filter((s) => {
    if (!s || !s.story_id) return false;
    if (s.visibility !== 'public') return false;
    return blogHtml.indexOf('data-story-id="' + s.story_id + '"') !== -1;
  });
}

function ogBlock(story, description, imageRel) {
  const title = story.title || ('S' + story.story_id);
  const pageUrl = absolutePagesUrl(storyPageRel(story.story_id));
  const imageUrl = resolveImageUrl(imageRel);
  const isDefault = imageRel === DEFAULT_OG_IMAGE;
  const isGeneratedOg = /^images\/og\/\d+\.jpg$/.test(imageRel);
  const lines = [
    '      <!-- Generated share meta: do not edit by hand; npm run compile-data -->',
    '      <base href="../">',
    '      <meta name="description" content="' + escapeAttr(description) + '">',
    '      <link rel="canonical" href="' + escapeAttr(pageUrl) + '">',
    '      <meta property="og:type" content="article">',
    '      <meta property="og:site_name" content="Listmap">',
    '      <meta property="og:locale" content="zh_TW">',
    '      <meta property="og:title" content="' + escapeAttr(title) + '">',
    '      <meta property="og:description" content="' + escapeAttr(description) + '">',
    '      <meta property="og:url" content="' + escapeAttr(pageUrl) + '">',
    '      <meta property="og:image" content="' + escapeAttr(imageUrl) + '">',
    '      <meta property="og:image:alt" content="' + escapeAttr(title + ' · Listmap') + '">',
  ];
  if (isDefault || isGeneratedOg) {
    lines.push('      <meta property="og:image:width" content="' + OG_WIDTH + '">');
    lines.push('      <meta property="og:image:height" content="' + OG_HEIGHT + '">');
    lines.push('      <meta property="og:image:type" content="' + (isGeneratedOg ? 'image/jpeg' : 'image/png') + '">');
  }
  lines.push('      <meta name="twitter:card" content="summary_large_image">');
  lines.push('      <meta name="twitter:title" content="' + escapeAttr(title) + '">');
  lines.push('      <meta name="twitter:description" content="' + escapeAttr(description) + '">');
  lines.push('      <meta name="twitter:image" content="' + escapeAttr(imageUrl) + '">');
  return lines.join('\n');
}

/** JSON-LD (schema.org) so AI crawlers and rich results can parse the article + its geography. */
function jsonLdScript(story, description, imageUrl, storyLandmarks) {
  const pageUrl = absolutePagesUrl(storyPageRel(story.story_id));
  const title = story.title || ('S' + story.story_id);

  const places = (storyLandmarks || [])
    .filter((lm) => lm.lat && lm.lng)
    .map((lm) => ({
      '@type': 'Place',
      name: lm.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: Number(lm.lat),
        longitude: Number(lm.lng),
      },
    }));

  const article = {
    '@type': 'BlogPosting',
    '@id': pageUrl + '#article',
    mainEntityOfPage: pageUrl,
    headline: title,
    description: description,
    url: pageUrl,
    inLanguage: 'zh-TW',
    image: [imageUrl],
    author: { '@type': 'Person', name: story.author || 'Listmap' },
    publisher: { '@type': 'Organization', name: 'Listmap' },
  };
  if (story.created_at) article.datePublished = story.created_at;
  if (places.length) article.contentLocation = places;

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Listmap', item: absolutePagesUrl('index.html') },
      { '@type': 'ListItem', position: 2, name: '故事', item: absolutePagesUrl('blog.html') },
      { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
    ],
  };

  const graph = { '@context': 'https://schema.org', '@graph': [article, breadcrumb] };
  // Escape "<" so a title/description containing "</script>" can't break out of the tag.
  const json = JSON.stringify(graph, null, 2).replace(/</g, '\\u003c');
  return '      <script type="application/ld+json">\n' + json + '\n      </script>';
}

function buildStoryPageHtml(blogHtml, story, landmarks) {
  const description = descriptionForStory(blogHtml, story);
  const imageRel = ogImageRel(story);
  const imageUrl = resolveImageUrl(imageRel);
  const title = story.title || ('S' + story.story_id);
  const storyLandmarks = (landmarks || []).filter((lm) => lm.story_id === story.story_id);
  let html = String(blogHtml || '').replace(/^\uFEFF/, '');

  html = stripOtherStorySections(html, story.story_id);
  html = stripStoryIdCommentsExcept(html, story.story_id);
  html = useVueMinBuild(html);
  html = addImgLazyLoading(html);

  html = html.replace(
    /<html\b([^>]*)>/i,
    '<html$1 data-story-page="' + escapeAttr(story.story_id) + '" data-asset-base="../">'
  );
  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    '<title>' + escapeAttr(title) + ' · Listmap</title>\n' +
      ogBlock(story, description, imageRel) + '\n' +
      jsonLdScript(story, description, imageUrl, storyLandmarks)
  );
  html = html.replace(
    /<div id="blog-welcome">/,
    '<div id="blog-welcome" style="display:none;">'
  );
  html = html.replace(
    new RegExp('<section(\\s+)data-story-id="' + story.story_id + '"\\s+style="display:none;">', 'i'),
    '<section$1data-story-id="' + story.story_id + '">'
  );
  html = '<!-- Generated by npm run compile-data from blog.html. Do not edit by hand. -->\n' + html;
  return html;
}

function writeStoryJson(story, landmarks, routes) {
  const dir = path.join(ROOT, 'data', 'stories');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(ROOT, storyJsonRel(story.story_id));
  fs.writeFileSync(dest, JSON.stringify(buildStoryPayload(story, landmarks, routes), null, 2) + '\n');
}

function compileStoryPages(stories, landmarks, options) {
  const routes = (options && options.routes) || [];
  const blogPath = path.join(ROOT, 'blog.html');
  const blogHtml = fs.readFileSync(blogPath, 'utf8');
  compileOgImages(stories, blogHtml);
  const outDir = path.join(ROOT, 'stories');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.readdirSync(outDir).forEach((name) => {
    if (/^\d+\.html$/.test(name)) {
      fs.unlinkSync(path.join(outDir, name));
    }
  });

  const jsonDir = path.join(ROOT, 'data', 'stories');
  if (fs.existsSync(jsonDir)) {
    fs.readdirSync(jsonDir).forEach((name) => {
      if (/^\d+\.json$/.test(name)) {
        fs.unlinkSync(path.join(jsonDir, name));
      }
    });
  }

  const targets = shareableStories(stories, blogHtml);
  const written = [];
  targets.forEach((story) => {
    const html = buildStoryPageHtml(blogHtml, story, landmarks);
    const dest = path.join(outDir, story.story_id + '.html');
    fs.writeFileSync(dest, html);
    writeStoryJson(story, landmarks, routes);
    written.push(story.story_id);
  });
  return written;
}

module.exports = {
  PAGES_ORIGIN,
  DEFAULT_OG_IMAGE,
  escapeAttr,
  stripTags,
  storyPageRel,
  absolutePagesUrl,
  resolveImageUrl,
  extractCardDesc,
  extractSection,
  descriptionForStory,
  ogImageRel,
  shareableStories,
  jsonLdScript,
  stripOtherStorySections,
  stripStoryIdCommentsExcept,
  addImgLazyLoading,
  useVueMinBuild,
  storyJsonRel,
  buildStoryPayload,
  buildStoryPageHtml,
  compileStoryPages,
  generatedOgRel,
};
