'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT } = require('./csv-data');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_DIR_REL = 'images/og';
const SOURCE_DIR_REL = 'images/stories';
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function generatedOgRel(storyId) {
  return OG_DIR_REL + '/' + storyId + '.jpg';
}

function listStorySourceImages(storyId) {
  const dir = path.join(ROOT, SOURCE_DIR_REL, String(storyId));
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir)
    .filter((name) => IMAGE_EXT.test(name) && name.toLowerCase() !== 'og.jpg')
    .sort()
    .map((name) => path.join(dir, name));
}

function pickSourceImage(storyId, blogHtml) {
  const sectionRe = new RegExp(
    '<section\\s+data-story-id="' + storyId + '"[\\s\\S]*?<\\/section>',
    'i'
  );
  const section = ((blogHtml || '').match(sectionRe) || [])[0] || '';
  const imgRe = /src="(?:\.\.\/)?images\/stories\/\d+\/([^"?#]+)"/gi;
  let m;
  while ((m = imgRe.exec(section))) {
    const file = m[1];
    if (!IMAGE_EXT.test(file)) continue;
    const abs = path.join(ROOT, SOURCE_DIR_REL, String(storyId), file);
    if (fs.existsSync(abs)) return abs;
  }
  const listed = listStorySourceImages(storyId);
  return listed[0] || '';
}

function ensureFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'pipe' });
  } catch (e) {
    throw new Error('ffmpeg is required to generate OG images (crop/resize to 1200x630)');
  }
}

function writeOgJpeg(srcPath, destPath) {
  execFileSync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-i', srcPath,
    '-vf',
    'scale=' + OG_WIDTH + ':' + OG_HEIGHT + ':force_original_aspect_ratio=increase,crop=' + OG_WIDTH + ':' + OG_HEIGHT,
    '-frames:v', '1',
    '-q:v', '3',
    destPath,
  ], { stdio: 'pipe' });
}

/** Crop/resize authorized photos in images/stories/<id>/ to images/og/<id>.jpg. */
function compileOgImages(stories, blogHtml) {
  const ogDir = path.join(ROOT, OG_DIR_REL);
  if (!fs.existsSync(ogDir)) fs.mkdirSync(ogDir, { recursive: true });

  const keep = new Set();
  const written = [];
  let ffmpegChecked = false;

  (stories || []).forEach((story) => {
    if (!story || !story.story_id) return;
    const src = pickSourceImage(story.story_id, blogHtml);
    if (!src) return;
    const rel = generatedOgRel(story.story_id);
    const dest = path.join(ROOT, rel);
    const destFresh = fs.existsSync(dest)
      && fs.statSync(dest).size > 1000
      && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs;
    if (!destFresh) {
      if (!ffmpegChecked) {
        ensureFfmpeg();
        ffmpegChecked = true;
      }
      writeOgJpeg(src, dest);
    }
    keep.add(path.basename(dest));
    written.push(story.story_id);
  });

  fs.readdirSync(ogDir).forEach((name) => {
    if (!/^\d+\.jpg$/.test(name)) return;
    if (keep.has(name)) return;
    fs.unlinkSync(path.join(ogDir, name));
  });

  return written;
}

module.exports = {
  OG_WIDTH,
  OG_HEIGHT,
  OG_DIR_REL,
  generatedOgRel,
  listStorySourceImages,
  pickSourceImage,
  compileOgImages,
};
