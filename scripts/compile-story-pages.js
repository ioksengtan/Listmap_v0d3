'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./csv-data');

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
  const re = new RegExp(
    '<section\\s+data-story-id="' + storyId + '"[\\s\\S]*?<\\/section>',
    'i'
  );
  const m = blogHtml.match(re);
  return m ? m[0] : '';
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
  const thumb = String(story.thumbnail || '').trim();
  if (thumb) {
    if (/^https?:\/\//i.test(thumb)) return thumb;
    return thumb.replace(/^\//, '');
  }
  return DEFAULT_OG_IMAGE;
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
  const imageUrl = /^https?:\/\//i.test(imageRel) ? imageRel : absolutePagesUrl(imageRel);
  const isDefault = imageRel === DEFAULT_OG_IMAGE;
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
  if (isDefault) {
    lines.push('      <meta property="og:image:width" content="' + OG_WIDTH + '">');
    lines.push('      <meta property="og:image:height" content="' + OG_HEIGHT + '">');
    lines.push('      <meta property="og:image:type" content="image/png">');
  }
  lines.push('      <meta name="twitter:card" content="summary_large_image">');
  lines.push('      <meta name="twitter:title" content="' + escapeAttr(title) + '">');
  lines.push('      <meta name="twitter:description" content="' + escapeAttr(description) + '">');
  lines.push('      <meta name="twitter:image" content="' + escapeAttr(imageUrl) + '">');
  return lines.join('\n');
}

function buildStoryPageHtml(blogHtml, story) {
  const description = descriptionForStory(blogHtml, story);
  const imageRel = ogImageRel(story);
  const title = story.title || ('S' + story.story_id);
  let html = String(blogHtml || '').replace(/^\uFEFF/, '');

  html = html.replace(
    /<html\b([^>]*)>/i,
    '<html$1 data-story-page="' + escapeAttr(story.story_id) + '" data-asset-base="../">'
  );
  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    '<title>' + escapeAttr(title) + ' · Listmap</title>\n' + ogBlock(story, description, imageRel)
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

function compileStoryPages(stories) {
  const blogPath = path.join(ROOT, 'blog.html');
  const blogHtml = fs.readFileSync(blogPath, 'utf8');
  const outDir = path.join(ROOT, 'stories');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.readdirSync(outDir).forEach((name) => {
    if (/^\d+\.html$/.test(name)) {
      fs.unlinkSync(path.join(outDir, name));
    }
  });

  const targets = shareableStories(stories, blogHtml);
  const written = [];
  targets.forEach((story) => {
    const html = buildStoryPageHtml(blogHtml, story);
    const dest = path.join(outDir, story.story_id + '.html');
    fs.writeFileSync(dest, html);
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
  extractCardDesc,
  extractSection,
  descriptionForStory,
  ogImageRel,
  shareableStories,
  buildStoryPageHtml,
  compileStoryPages,
};
