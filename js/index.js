StoriesDict = {};
var homepageStoryLayer = null;

var HOMEPAGE_MAX_SHOWN = 8;

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function publicHomepageStories() {
    var all = (ListmapData.stories ? ListmapData.stories() : []);
    return all.filter(function (s) {
        return s.visibility === 'public' || ListmapData.isLocalhost();
    }).sort(function (a, b) {
        return (b.created_at || '').localeCompare(a.created_at || '');
    });
}

function zoomHomepageStories(ids) {
    if (typeof mymap === 'undefined' || !mymap) return;
    var latlngs = [];
    if (homepageStoryLayer) {
        mymap.removeLayer(homepageStoryLayer);
        homepageStoryLayer = null;
    }
    homepageStoryLayer = L.layerGroup().addTo(mymap);
    var cluster = L.markerClusterGroup();
    (ids || []).forEach(function (storyId) {
        ListmapData.landmarksByStoryId(storyId).forEach(function (lm) {
            var lat = parseFloat(lm.lat);
            var lng = parseFloat(lm.lng);
            if (isNaN(lat) || isNaN(lng)) return;
            latlngs.push([lat, lng]);
            L.marker([lat, lng])
                .bindPopup('<b>' + escapeHtml(lm.name) + '</b>' + (lm.content ? '<br>' + escapeHtml(lm.content) : ''))
                .addTo(cluster);
        });
    });
    cluster.addTo(homepageStoryLayer);
    if (latlngs.length === 1) {
        mymap.flyTo(latlngs[0], 14, { animate: true, duration: 0.4 });
    } else if (latlngs.length > 1) {
        mymap.fitBounds(latlngs, { padding: [40, 40] });
    }
}

function zoomHomepageStory(storyId) {
    zoomHomepageStories([storyId]);
}

function renderHomepageList() {
    var $ul = $('#maplist ul');
    if (!$ul.length) return;
    $ul.empty();
    var stories = publicHomepageStories();
    stories.forEach(function (s) {
        var name = s.title || s.story_id;
        var $li = $('<li>');
        var $cb = $('<input type="checkbox" aria-label="Toggle story on map" checked>');
        $cb.on('change', function () {
            if (this.checked) zoomHomepageStory(s.story_id);
        });
        var $link = $('<a class="story-list-link">');
        $link.attr('href', 'stories/' + s.story_id + '.html');
        $link.text(name);
        $link.on('click', function () {
            $cb.prop('checked', true);
            zoomHomepageStory(s.story_id);
        });
        $li.append($cb).append($link);
        var tagsHtml = ListmapData.hashtagsHtml(s.tags);
        if (tagsHtml) $li.append(tagsHtml);
        $ul.append($li);
        StoriesDict[s.story_id] = s;
    });
    $('#maplist').addClass('maplist-visible');
}

function renderVisitorStories() {
    var $container = $('#visitor-story-list');
    if (!$container.length) return;
    var stories = publicHomepageStories();
    var shown = stories.slice(0, HOMEPAGE_MAX_SHOWN);
    $container.empty();
    shown.forEach(function (s) {
        var $card = $('<div class="visitor-story-card">');
        var $copy = $('<div class="visitor-story-copy">');
        var $link = $('<a>').attr('href', 'stories/' + s.story_id + '.html').text(s.title || s.story_id);
        $copy.append($link);
        if (s.where) {
            $copy.append($('<span class="visitor-story-where">').text(s.where));
        }
        var $preview = $('<button type="button" class="visitor-story-preview">')
            .attr('aria-label', (window.ListmapI18n ? ListmapI18n.t('visitor.previewMap') : '在地圖預覽') + '：' + (s.title || s.story_id))
            .text(window.ListmapI18n ? ListmapI18n.t('visitor.preview') : '地圖');
        $preview.on('click', function () { zoomHomepageStory(s.story_id); });
        $card.append($copy).append($preview);
        $container.append($card);
    });
    var total = stories.length;
    if (total > 0) {
        var $more = $('<a class="visitor-stories-more" href="blog.html">查看全部 ' + total + ' 篇故事 →</a>');
        $container.append($more);
    }
}

$(document).ready(function () {
    if (window.ListmapI18n) {
        ListmapI18n.init({
            onChange: function () {
                if (typeof mymap !== 'undefined' && mymap && typeof mymap.invalidateSize === 'function') {
                    mymap.invalidateSize();
                }
            }
        });
    }

    if (typeof mymap === 'undefined' || !mymap) {
        initMap();
    }

    $('#explore-map-btn').on('click', function () {
        var mapEl = document.getElementById('map');
        if (mapEl && window.matchMedia('(max-width: 767.98px)').matches) {
            mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (mymap && typeof mymap.invalidateSize === 'function') mymap.invalidateSize();
    });

    ListmapData.load().done(function () {
        var stories = publicHomepageStories();
        var allIds = stories.map(function (s) { return s.story_id; });
        renderHomepageList();
        renderVisitorStories();
        zoomHomepageStories(allIds);
    }).fail(function () {
        console.error('Failed to load data/static.json');
    });
});
