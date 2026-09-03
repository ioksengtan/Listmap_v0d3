StoriesDict = {};
var homepageStoryLayer = null;

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
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
    var stories = ListmapData.getRecentStories().table;
    stories.forEach(function (s) {
        var what = s.what || s.type || '';
        var who = s.author || '';
        var name = s.title || s.story_id;
        var $li = $('<li>');
        var $cb = $('<input type="checkbox" aria-label="Toggle story on map">');
        $cb.on('change', function () {
            if (this.checked) zoomHomepageStory(s.story_id);
        });
        var $link = $('<a href="#">');
        $link.append($('<span>').text(what));
        $link.append(document.createTextNode('@'));
        $link.append($('<span>').text(who));
        $link.append(document.createTextNode(', ' + name));
        $link.on('click', function (e) {
            e.preventDefault();
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

    ListmapData.load().done(function () {
        renderHomepageList();
    }).fail(function () {
        console.error('Failed to load data/static.json');
    });
});
