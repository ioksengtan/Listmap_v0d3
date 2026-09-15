'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./csv-data');
const {
  PAGES_ORIGIN,
  storyPageRel,
  absolutePagesUrl,
  shareableStories,
} = require('./compile-story-pages');

const STATIC_PAGES = ['index.html', 'about.html', 'blog.html'];

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isoDate(value) {
  const m = String(value || '').trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

function fileMtimeDate(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return '';
  return new Date(fs.statSync(abs).mtimeMs).toISOString().slice(0, 10);
}

function lastmodForStatic(relPath) {
  return fileMtimeDate(relPath);
}

function lastmodForStory(story) {
  const fromCreated = isoDate(story && story.created_at);
  if (fromCreated) return fromCreated;
  return fileMtimeDate(storyPageRel(story.story_id));
}

function urlEntry(relPath, lastmod) {
  let xml = '  <url>\n    <loc>' + escapeXml(absolutePagesUrl(relPath)) + '</loc>\n';
  if (lastmod) xml += '    <lastmod>' + lastmod + '</lastmod>\n';
  xml += '  </url>\n';
  return xml;
}

function buildSitemapXml(stories, blogHtml) {
  const chunks = [
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',
  ];

  STATIC_PAGES.forEach((rel) => {
    if (!fs.existsSync(path.join(ROOT, rel))) return;
    chunks.push(urlEntry(rel, lastmodForStatic(rel)));
  });

  shareableStories(stories, blogHtml).forEach((story) => {
    chunks.push(urlEntry(storyPageRel(story.story_id), lastmodForStory(story)));
  });

  chunks.push('</urlset>\n');
  return chunks.join('');
}

function buildRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: ' + PAGES_ORIGIN + '/sitemap.xml',
    '',
  ].join('\n');
}

function compileSitemap(stories) {
  const blogPath = path.join(ROOT, 'blog.html');
  const blogHtml = fs.readFileSync(blogPath, 'utf8');
  const sitemap = buildSitemapXml(stories, blogHtml);
  const robots = buildRobotsTxt();
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
  return {
    sitemapRel: 'sitemap.xml',
    robotsRel: 'robots.txt',
    urlCount: (sitemap.match(/<loc>/g) || []).length,
  };
}

module.exports = {
  STATIC_PAGES,
  escapeXml,
  isoDate,
  lastmodForStory,
  buildSitemapXml,
  buildRobotsTxt,
  compileSitemap,
};
