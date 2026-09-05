'use strict';

/**
 * Map-itinerary PM locked v0.2 area-flower energy.
 * Experiment only — do not import this into production Pages paths.
 */

const FLOWER_TYPES = {
  weekend: { radius_km: 30, energy_min: 22, stories_min: 2, landmarks_min: 6 },
  week: { radius_km: 80, energy_min: 40, stories_min: 3, landmarks_min: 12 },
  fortnight: { radius_km: 200, energy_min: 70, stories_min: 5, landmarks_min: 20 }
};

const STORY_TIERS = [
  { tag: '去過', score: 8 },
  { tag: '想去', score: 5 },
  { tag: '整理', score: 3 }
];

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return deg * Math.PI / 180;
}

function parseTags(raw) {
  return String(raw || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function storyScore(tags) {
  const set = new Set(parseTags(tags));
  for (const tier of STORY_TIERS) {
    if (set.has(tier.tag)) return tier.score;
  }
  return 0;
}

function hasBeenThere(tags) {
  return parseTags(tags).includes('去過');
}

function haversineKm(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function landmarkWeight(distanceKm, radiusKm, sameCountry) {
  if (!sameCountry) return 0;
  if (distanceKm <= 0.6 * radiusKm) return 1.0;
  if (distanceKm <= radiusKm) return 0.5;
  return 0;
}

function parseCoord(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function averageCentroid(pins) {
  const valid = pins.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (!valid.length) return null;
  const lat = valid.reduce((sum, p) => sum + p.lat, 0) / valid.length;
  const lng = valid.reduce((sum, p) => sum + p.lng, 0) / valid.length;
  return {
    lat: roundCoord(lat),
    lng: roundCoord(lng)
  };
}

function roundCoord(n) {
  return Math.round(n * 1e6) / 1e6;
}

function roundEnergy(n) {
  return Math.round(n * 10) / 10;
}

function bloomReady(flowerType, energy, storyCount, landmarkCount, hasBeenOrPocket) {
  const need = FLOWER_TYPES[flowerType];
  if (!need) return false;
  return Boolean(hasBeenOrPocket)
    && energy >= need.energy_min
    && storyCount >= need.stories_min
    && landmarkCount >= need.landmarks_min;
}

function computeAreaEnergy({ areas, storyMaps, stories, landmarks }) {
  const mapByStory = new Map(storyMaps.map((m) => [String(m.story_id), m]));

  const publishedMapped = stories.filter((s) => {
    const id = String(s.story_id);
    return s.visibility === 'public' && mapByStory.has(id);
  });

  const publishedIds = new Set(publishedMapped.map((s) => String(s.story_id)));

  const pins = landmarks.map((lm) => {
    const lat = parseCoord(lm.lat);
    const lng = parseCoord(lm.lng);
    const storyId = String(lm.story_id);
    const mapped = mapByStory.get(storyId);
    return {
      landmark_id: String(lm.landmark_id || ''),
      story_id: storyId,
      lat,
      lng,
      country: mapped ? mapped.country : null,
      primary_area: mapped ? mapped.primary_area : null
    };
  }).filter((p) => publishedIds.has(p.story_id) && Number.isFinite(p.lat) && Number.isFinite(p.lng));

  return areas.map((area) => {
    const areaStories = publishedMapped.filter((s) => {
      const mapped = mapByStory.get(String(s.story_id));
      return mapped && mapped.primary_area === area.id;
    });

    const ownPins = pins.filter((p) => p.primary_area === area.id);
    const centroid = averageCentroid(ownPins);
    const story_count = areaStories.length;
    const hasBeenOrPocket = areaStories.some((s) => {
      const mapped = mapByStory.get(String(s.story_id));
      return hasBeenThere(s.tags) || Boolean(mapped && mapped.pocket);
    });
    const story_energy = areaStories.reduce((sum, s) => sum + storyScore(s.tags), 0);

    const flowers = {};
    Object.keys(FLOWER_TYPES).forEach((flowerType) => {
      const radius_km = FLOWER_TYPES[flowerType].radius_km;
      let landmark_energy = 0;
      let landmark_count = 0;

      pins.forEach((pin) => {
        if (!centroid) return;
        const sameCountry = pin.country === area.country;
        const d = haversineKm(centroid, pin);
        const w = landmarkWeight(d, radius_km, sameCountry);
        if (w > 0) {
          landmark_count += 1;
          landmark_energy += w;
        }
      });

      const energy = roundEnergy(story_energy + landmark_energy);
      flowers[flowerType] = {
        radius_km,
        energy,
        story_count,
        landmark_count,
        bloom_ready: bloomReady(flowerType, energy, story_count, landmark_count, hasBeenOrPocket),
        story_energy: roundEnergy(story_energy),
        landmark_energy: roundEnergy(landmark_energy)
      };
    });

    return {
      id: area.id,
      country: area.country,
      slug: area.slug,
      name: area.name,
      name_en: area.name_en,
      centroid,
      stories: areaStories.map((s) => {
        const mapped = mapByStory.get(String(s.story_id));
        return {
          story_id: String(s.story_id),
          title: s.title || '',
          tags: s.tags || '',
          score: storyScore(s.tags),
          pocket: Boolean(mapped && mapped.pocket)
        };
      }),
      has_been_or_pocket: hasBeenOrPocket,
      pin_count: ownPins.length,
      flowers
    };
  });
}

module.exports = {
  FLOWER_TYPES,
  STORY_TIERS,
  EARTH_RADIUS_KM,
  parseTags,
  storyScore,
  hasBeenThere,
  haversineKm,
  landmarkWeight,
  averageCentroid,
  bloomReady,
  computeAreaEnergy
};
