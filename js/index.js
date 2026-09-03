StoriesDict = {};
var homepageStoryLayer = null;

/** Visitor homepage only heroes clearly public stories. */
var HOMEPAGE_STORY_IDS = ['1024'];

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function publicHomepageStories() {
    var all = ListmapData.getRecentStories().table || [];
    return HOMEPAGE_STORY_IDS.map(function (id) {
        return all.find(function (s) {
            return String(s.story_id) === String(id);
        });
    }).filter(function (s) {
        return s && (!s.visibility || s.visibility === 'public' || ListmapData.isLocalhost());
    });
}

function zoomHomepageStory(storyId) {
    if (typeof mymap === 'undefined' || !mymap) return;
    var landmarks = ListmapData.landmarksByStoryId(storyId);
    var latlngs = [];
    if (homepageStoryLayer) {
        mymap.removeLayer(homepageStoryLayer);
        homepageStoryLayer = null;
    }
    homepageStoryLayer = L.layerGroup().addTo(mymap);
    var cluster = L.markerClusterGroup();
    landmarks.forEach(function (lm) {
        var lat = parseFloat(lm.lat);
        var lng = parseFloat(lm.lng);
        if (isNaN(lat) || isNaN(lng)) return;
        latlngs.push([lat, lng]);
        L.marker([lat, lng])
            .bindPopup('<b>' + escapeHtml(lm.name) + '</b>' + (lm.content ? '<br>' + escapeHtml(lm.content) : ''))
            .addTo(cluster);
    });
    cluster.addTo(homepageStoryLayer);
    if (latlngs.length === 1) {
        mymap.flyTo(latlngs[0], 14, { animate: true, duration: 0.4 });
    } else if (latlngs.length > 1) {
        mymap.fitBounds(latlngs, { padding: [40, 40] });
    }
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
        $link.attr('href', 'blog.html#' + s.story_id);
        $link.text(name);
        $link.on('click', function () {
            $cb.prop('checked', true);
            zoomHomepageStory(s.story_id);
        });
        $li.append($cb).append($link);
        $ul.append($li);
        StoriesDict[s.story_id] = s;
    });
    $('#maplist').addClass('maplist-visible');
}

$(document).ready(function () {
    if (typeof mymap === 'undefined' || !mymap) {
        initMap();
    }

    ListmapData.load().done(function () {
        renderHomepageList();
        if (HOMEPAGE_STORY_IDS[0]) zoomHomepageStory(HOMEPAGE_STORY_IDS[0]);
    }).fail(function () {
        console.error('Failed to load data/static.json');
    });
});
