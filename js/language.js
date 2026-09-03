/**
 * Language layer for Listmap public Pages.
 *
 * Language is a carrier, not a second site: same story_id / landmarks.
 * Traditional Chinese is the source of truth in HTML + CSV.
 * English (and later locales) overlay chrome and story body by story_id.
 * Landmark `name` is never swapped.
 *
 * VueI18n `messages` is kept for older pages that still mount #dropdown.
 */
(function (root) {
  var STORAGE_KEY = 'listmap-lang';
  var DEFAULT_LOCALE = 'zh-TW';
  var SUPPORTED = ['zh-TW', 'en'];

  var ui = {
    'zh-TW': {
      'nav.home': '首頁',
      'nav.blog': '文章',
      'nav.stories': '故事',
      'nav.explore': '探索',
      'nav.about': '關於',
      'visitor.kicker': 'Listmap',
      'visitor.title': '個人地圖故事',
      'visitor.homeLead': '把親身走過的地方寫成地圖故事。不是行程規劃工具，也不是實驗室示範頁。',
      'visitor.homeHint': '首頁只放目前對外公開的故事。點地圖圖釘或左側列表，就能對上店家位置。',
      'visitor.publicStories': '公開故事',
      'visitor.readStory': '閱讀這則故事',
      'visitor.blogLead': '目前對外公開兩篇。內部測試與未校正座標的故事不放在這裡。',
      'visitor.aboutLead': 'Listmap 把親身走過的地方寫成地圖故事：店家、路、還記得的距離，都落在真實座標上。訪客可以讀故事、點地名、看地圖，不需要帳號。',
      'visitor.aboutHint': '這不是行程規劃平台，也不是實驗室示範頁。公開頁只走靜態資料。',
      'visitor.aboutPublic': '現在對外公開兩篇：〈新竹牛肉麵五選〉、〈陽明山：住一晚，走兩天〉。',
      'visitor.read1024': '閱讀新竹牛肉麵五選',
      'visitor.read1025': '閱讀陽明山：住一晚，走兩天',
      'nav.findStories': '找故事',
      'nav.search': '搜尋',
      'nav.searchPlaceholder': '搜尋',
      'nav.toggle': '切換導覽',
      'lang.zhTW': '繁中',
      'lang.en': 'EN',
      'home.collections': '故事集',
      'home.featured': '精選文章',
      'home.backIndex': '回索引',
      'home.backHome': '回首頁',
      'home.apply': '套用',
      'home.tokyoBadge': '9 篇',
      'home.tokyoTitle': '醉旅宿介紹東京篇',
      'home.tokyoDesc': '醉旅宿 Merry Journey 頻道的東京旅遊系列：住宿推薦・市場美食・近郊景點・交通票券完整攻略',
      'home.tokyoAuthor': '醉旅宿 Merry Journey',
      'home.tagCity': '城市漫遊',
      'home.tagBallpark': '球場之旅',
      'home.heidelbergTitle': '海德堡城市漫遊',
      'home.heidelbergDesc': '沿著內卡河漫步，探索哲學家小徑、老橋與千年大學城的歷史氣息。',
      'home.nyTitle': '紐約大聯盟球場之旅',
      'home.nyDesc': '在花旗球場感受大聯盟現場的氛圍，賽後探索紐約街頭。',
      'layers.title': '地圖圖層',
      'layers.landmarks': '地標',
      'layers.routes': '路線',
      'layers.regions': '區域',
      'badge.internal': 'Internal'
    },
    en: {
      'nav.home': 'Home',
      'nav.blog': 'Blog',
      'nav.stories': 'Stories',
      'nav.explore': 'Explore',
      'nav.about': 'About',
      'visitor.kicker': 'Listmap',
      'visitor.title': 'Personal map stories',
      'visitor.homeLead': 'Places walked, written as map stories. Not a trip planner, and not a lab demo page.',
      'visitor.homeHint': 'The homepage only lists stories that are public. Tap a pin or a title to match it with a place.',
      'visitor.publicStories': 'Public stories',
      'visitor.readStory': 'Read this story',
      'visitor.blogLead': 'Two stories are public. Internal tests and uncorrected coordinates stay off this page.',
      'visitor.aboutLead': 'Listmap writes places walked as map stories: shops, paths, remembered distances, on real coordinates. Visitors can read, tap a place name, and look at the map. No account.',
      'visitor.aboutHint': 'This is not a trip-planning platform, and not a lab demo. Public pages use static data only.',
      'visitor.aboutPublic': 'Two stories are public: Hsinchu beef noodle five, and Yangmingshan stay-and-hike.',
      'visitor.read1024': 'Read Hsinchu beef noodle five',
      'visitor.read1025': 'Read Yangmingshan: stay one night, walk two days',
      'nav.findStories': 'Find Stories',
      'nav.search': 'Search',
      'nav.searchPlaceholder': 'Search',
      'nav.toggle': 'Toggle navigation',
      'lang.zhTW': '繁中',
      'lang.en': 'EN',
      'home.collections': 'Collections',
      'home.featured': 'Featured',
      'home.backIndex': 'Index',
      'home.backHome': 'Home',
      'home.apply': 'Apply',
      'home.tokyoBadge': '9 stories',
      'home.tokyoTitle': 'Tokyo with Merry Journey',
      'home.tokyoDesc': 'Merry Journey’s Tokyo series: where to stay, market food, day trips, and transit passes.',
      'home.tokyoAuthor': 'Merry Journey',
      'home.tagCity': 'City walk',
      'home.tagBallpark': 'Ballpark',
      'home.heidelbergTitle': 'A walk through Heidelberg',
      'home.heidelbergDesc': 'Along the Neckar: Philosophers’ Walk, the Old Bridge, and the old university town.',
      'home.nyTitle': 'New York ballpark trip',
      'home.nyDesc': 'A Mets game at Citi Field, then the streets around it.',
      'layers.title': 'Map layers',
      'layers.landmarks': 'Landmarks',
      'layers.routes': 'Routes',
      'layers.regions': 'Regions',
      'badge.internal': 'Internal'
    }
  };

  var locale = DEFAULT_LOCALE;
  var storyI18n = {};
  var originalStoryHtml = {};
  var originalStoryText = {};
  var changeListeners = [];
  var translationsLoaded = false;

  function normalizeLocale(value) {
    var raw = String(value || '').trim();
    if (!raw) return '';
    if (SUPPORTED.indexOf(raw) !== -1) return raw;
    var lower = raw.toLowerCase().replace(/_/g, '-');
    if (lower === 'en' || lower.indexOf('en-') === 0) return 'en';
    if (lower === 'zh-tw' || lower === 'zh-hant' || lower.indexOf('zh-hant') === 0 || lower === 'zh-hk' || lower === 'zh-mo') {
      return 'zh-TW';
    }
    if (lower === 'tw' || lower === 'zh') return 'zh-TW';
    return '';
  }

  function detectLocaleFrom(langs) {
    var list = Array.isArray(langs) ? langs : [];
    for (var i = 0; i < list.length; i++) {
      var hit = normalizeLocale(list[i]);
      if (hit) return hit;
    }
    return DEFAULT_LOCALE;
  }

  function browserLanguages() {
    var langs = [];
    if (typeof navigator === 'undefined') return langs;
    if (navigator.languages && navigator.languages.length) {
      for (var i = 0; i < navigator.languages.length; i++) langs.push(navigator.languages[i]);
    }
    if (navigator.language) langs.push(navigator.language);
    if (navigator.userLanguage) langs.push(navigator.userLanguage);
    return langs;
  }

  function readStoredLocale() {
    try {
      return normalizeLocale(root.localStorage && root.localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return '';
    }
  }

  function writeStoredLocale(value) {
    try {
      if (root.localStorage) root.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) { /* ignore quota / private mode */ }
  }

  function detectLocale() {
    return readStoredLocale() || detectLocaleFrom(browserLanguages());
  }

  function t(key) {
    var pack = ui[locale] || ui[DEFAULT_LOCALE] || {};
    if (pack[key] != null) return pack[key];
    var fallback = ui[DEFAULT_LOCALE] || {};
    return fallback[key] != null ? fallback[key] : key;
  }

  function storyRecord(storyId, loc) {
    var rec = storyI18n[String(storyId)];
    if (!rec) return null;
    var use = loc || locale;
    if (use === DEFAULT_LOCALE) return null;
    return rec[use] || null;
  }

  function cacheStoryHtml() {
    if (typeof root.$ === 'undefined') return;
    root.$('[data-story-id]').each(function () {
      var id = String(root.$(this).attr('data-story-id') || '');
      if (!id || originalStoryHtml[id]) return;
      originalStoryHtml[id] = root.$(this).html();
    });
    root.$('[data-i18n-story]').each(function () {
      var $el = root.$(this);
      var key = $el.attr('data-i18n-story') + '::' + ($el.attr('data-i18n-story-field') || 'title');
      if (!originalStoryText[key]) originalStoryText[key] = $el.text();
    });
  }

  function applyChrome() {
    if (typeof root.$ === 'undefined') return;
    if (root.document && root.document.documentElement) {
      root.document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant' : 'en';
    }
    root.$('[data-i18n]').each(function () {
      var key = root.$(this).attr('data-i18n');
      if (key) root.$(this).text(t(key));
    });
    root.$('[data-i18n-placeholder]').each(function () {
      var key = root.$(this).attr('data-i18n-placeholder');
      if (key) root.$(this).attr('placeholder', t(key));
    });
    root.$('[data-i18n-aria]').each(function () {
      var key = root.$(this).attr('data-i18n-aria');
      if (key) root.$(this).attr('aria-label', t(key));
    });
    root.$('[data-lang]').removeClass('is-active').filter('[data-lang="' + locale + '"]').addClass('is-active');
  }

  function overlayStories() {
    if (typeof root.$ === 'undefined') return;
    cacheStoryHtml();
    root.$('[data-story-id]').each(function () {
      var $sec = root.$(this);
      var id = String($sec.attr('data-story-id') || '');
      if (!id || originalStoryHtml[id] == null) return;
      var rec = storyRecord(id);
      $sec.html(rec && rec.html ? rec.html : originalStoryHtml[id]);
    });
    root.$('[data-i18n-story]').each(function () {
      var $el = root.$(this);
      var id = $el.attr('data-i18n-story');
      var field = $el.attr('data-i18n-story-field') || 'title';
      var key = id + '::' + field;
      var rec = storyRecord(id);
      var original = originalStoryText[key];
      $el.text((rec && rec[field]) || original || $el.text());
    });
  }

  function refreshMapSize() {
    var map = root.mymap;
    if (map && typeof map.invalidateSize === 'function') {
      map.invalidateSize();
    }
  }

  function applyAll() {
    applyChrome();
    overlayStories();
    refreshMapSize();
    for (var i = 0; i < changeListeners.length; i++) {
      try { changeListeners[i](locale); } catch (e) { /* listener errors should not break i18n */ }
    }
  }

  function setLocale(next, options) {
    var loc = normalizeLocale(next) || DEFAULT_LOCALE;
    var persist = !options || options.persist !== false;
    var force = options && options.force;
    if (!force && loc === locale && translationsLoaded) {
      applyAll();
      return locale;
    }
    locale = loc;
    if (persist) writeStoredLocale(locale);
    applyAll();
    return locale;
  }

  function assetUrl(relPath) {
    if (root.ListmapData && typeof root.ListmapData.assetUrl === 'function') {
      return root.ListmapData.assetUrl(relPath);
    }
    return relPath;
  }

  function loadStoryTranslations() {
    if (!root.$ || typeof root.$.getJSON !== 'function') {
      translationsLoaded = true;
      return null;
    }
    return root.$.getJSON(assetUrl('data/story-i18n.json')).then(function (data) {
      storyI18n = data || {};
      translationsLoaded = true;
      overlayStories();
      return storyI18n;
    }).fail(function () {
      translationsLoaded = true;
      storyI18n = storyI18n || {};
    });
  }

  function bindSwitcher() {
    if (typeof root.$ === 'undefined' || bindSwitcher._bound) return;
    bindSwitcher._bound = true;
    root.$(document).on('click', '[data-lang]', function (e) {
      e.preventDefault();
      setLocale(root.$(this).attr('data-lang'));
    });
  }

  function init(options) {
    options = options || {};
    if (typeof options.onChange === 'function') changeListeners.push(options.onChange);
    bindSwitcher();
    cacheStoryHtml();
    locale = detectLocale();
    applyChrome();
    var loading = loadStoryTranslations();
    if (loading && loading.always) {
      loading.always(function () {
        applyAll();
      });
    } else {
      applyAll();
    }
    return loading;
  }

  function onChange(fn) {
    if (typeof fn === 'function') changeListeners.push(fn);
  }

  root.ListmapI18n = {
    DEFAULT_LOCALE: DEFAULT_LOCALE,
    SUPPORTED: SUPPORTED,
    ui: ui,
    t: t,
    init: init,
    setLocale: setLocale,
    getLocale: function () { return locale; },
    detectLocale: detectLocale,
    detectLocaleFrom: detectLocaleFrom,
    normalizeLocale: normalizeLocale,
    applyChrome: applyChrome,
    overlayStories: overlayStories,
    refreshMapSize: refreshMapSize,
    storyRecord: storyRecord,
    loadStoryTranslations: loadStoryTranslations,
    onChange: onChange,
    originalStoryHtml: originalStoryHtml
  };
})(typeof window !== 'undefined' ? window : this);

// VueI18n dictionary used by older pages (lab dropdown). Public Pages use ListmapI18n.
const messages = {
  en: {
    message: {
      hello: 'hello',
      minwt: 'minwt',
      lab: 'lab',
      tour: 'tour',
      task: 'task',
      QandA: 'Q and A'
    }
  },
  tw: {
    message: {
      hello: '哈囉',
      minwt: '梅問題',
      lab: '實驗室',
      tour: '走讀',
      task: '任務',
      QandA: '問答'
    }
  },
  cn: {
    message: {
      hello: '哈啰',
      minwt: '梅问题',
      lab: '實驗室'
    }
  },
  jp: {
    message: {
      hello: 'ハロー',
      minwt: 'メイウンディー',
      lab: 'メイウンディー'
    }
  }
};
