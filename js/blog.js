var appUrl = '/api';
var currentLandmarkLayer = null;
var currentArrowheadLayers = [];
var currentVectorLayer = null;   // hover/click 時 highlight 用的臨時向量
var currentStoryVectorLayer = null; // story 載入時常駐的所有 edge
var currentStoryRegionLayer = null; // story 載入時常駐的所有 region
var currentStoryLandmarks = []; // 當前故事的 landmarks（for vector lookup）
// 圖層面板追蹤
var storyMarkerItems = []; // { name, marker, cluster }
var storyEdgeItems   = []; // { label, color, group }
var storyRegionItems = []; // { label, color, layer }
var regionGeoJsonCache = {}; // regionId → geojson（避免重複載入）
var indexLayer = null;
var mapBackControl = null;
// 'home' | { type: 'collection', id, title } | null
var previousView = null;

// 手動定義索引標記：位置 + 對應的動作
// type: 'story' → 載入某篇故事; type: 'latest' → 載入最新文章
// 座標要放在初始視野內（中心 25.1, 121.5  zoom:5 大致涵蓋東亞）
// 首頁地圖只顯示這些索引標記（對應首頁有提到的內容）
var INDEX_MARKERS = [
    { label: '海德堡城市漫遊', type: 'story', story_id: '1001' },
    { label: '紐約球場之旅', type: 'story', story_id: '258' },
    // 東京系列用一個 collection 標記代表，定位在東京市中心
    { label: '醉旅宿東京篇', type: 'collection', collection_id: '101', lat: 35.6812, lng: 139.7671 },
];

$(document).ready(function() {
    const i18n = new VueI18n({ locale: 'en', messages });
    new Vue({ i18n }).$mount('#dropdown');

    initMap();
    loadIndexMarkers();

    // 頁面載入時解析 hash → 直接載入對應 story 或 collection
    var hash = location.hash.replace('#', '');
    if (hash) {
        var parts = hash.split('/');
        var sid = parts[0];
        var cid = parts[1] || null;
        if (/^\d+$/.test(sid)) {
            // 等 index markers 載入完再 load story（延遲讓地圖初始化）
            setTimeout(function() { loadStoryById(sid, cid); }, 300);
        }
    }

    // 回索引按鈕放在地圖左下角
    var BackControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: function() {
            var btn = L.DomUtil.create('button', 'map-back-btn');
            btn.innerHTML = '← 回索引';
            btn.style.display = 'none';
            L.DomEvent.on(btn, 'click', function(e) {
                L.DomEvent.stopPropagation(e);
                blogGoBack();
            });
            return btn;
        }
    });
    mapBackControl = new BackControl();
    mymap.addControl(mapBackControl);
});

function loadIndexMarkers() {
    indexLayer = L.layerGroup();

    $.get(appUrl, { command: 'getStoriesIndex' }, function(data) {
        var storiesWithGps = data.table;

        INDEX_MARKERS.forEach(function(def) {
            var story = null;
            var lat = def.lat;
            var lng = def.lng;

            if (def.type === 'latest') {
                story = storiesWithGps[0];
                if (story) { lat = parseFloat(story.lat); lng = parseFloat(story.lng); }
            } else if (def.type === 'story') {
                story = storiesWithGps.find(function(s) { return s.story_id === def.story_id; });
                if (story) { lat = parseFloat(story.lat); lng = parseFloat(story.lng); }
            } else if (def.type === 'collection') {
                lat = def.lat;
                lng = def.lng;
            }

            if (isNaN(lat) || isNaN(lng)) return;

            var isCollection = def.type === 'collection';
            var icon = L.divIcon({
                className: '',
                html: '<div class="index-marker-pin' + (isCollection ? ' index-marker-collection' : '') + '"><span class="index-marker-label">' + def.label + '</span></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6],
            });

            var marker = L.marker([lat, lng], { icon: icon });
            if (isCollection) {
                var collId = def.collection_id;
                marker.on('click', function() { loadCollectionById(collId); });
            } else if (story) {
                marker.on('click', function() { loadStory(story); });
            }
            indexLayer.addLayer(marker);
        });

        indexLayer.addTo(mymap);

        // 首頁卡片 visibility 處理
        var storyMap = {};
        storiesWithGps.forEach(function(s) { storyMap[s.story_id] = s; });
        $('#blog-welcome .blog-article-card, #blog-welcome [data-collection-id] .blog-article-card').each(function() {
            var onclick = $(this).attr('onclick') || '';
            var m = onclick.match(/loadStoryById\('(\d+)'/);
            if (!m) return;
            var sid = m[1];
            if (!storyMap[sid]) {
                $(this).hide(); // 不在 API 回傳中（internal 且非 localhost）
            } else if (storyMap[sid].visibility === 'internal') {
                $(this).find('.blog-id-tag').before('<span class="story-internal-badge" style="font-size:10px;padding:1px 5px;margin-right:4px;">Internal</span>');
            }
        });

        // 縮放到索引標記範圍
        var bounds = indexLayer.getLayers()
            .filter(function(l) { return l.getLatLng; })
            .map(function(l) { return l.getLatLng(); });
        if (bounds.length === 1) {
            mymap.setView(bounds[0], 10);
        } else if (bounds.length > 1) {
            mymap.fitBounds(bounds, { padding: [60, 60] });
        }
    });
}

function showPanelBackBtn(label, onclick) {
    var btn = $('#blog-back-btn');
    btn.html('<button class="btn btn-sm btn-outline-secondary" onclick="' + onclick + '">← ' + label + '</button>');
    btn.show();
}

function clearMapLayers() {
    if (currentLandmarkLayer) mymap.removeLayer(currentLandmarkLayer);
    if (currentStoryVectorLayer) { mymap.removeLayer(currentStoryVectorLayer); currentStoryVectorLayer = null; }
    if (currentStoryRegionLayer) { mymap.removeLayer(currentStoryRegionLayer); currentStoryRegionLayer = null; }
    currentArrowheadLayers.forEach(function(l) { mymap.removeLayer(l); });
    currentArrowheadLayers = [];
    if (pinnedVectorEl) { $(pinnedVectorEl).removeClass('map-vector-pinned'); pinnedVectorEl = null; }
    clearCurrentVector();
    currentStoryLandmarks = [];
    storyMarkerItems = []; storyEdgeItems = []; storyRegionItems = [];
    $('.map-layers-panel').remove();
    $('.story-internal-badge').remove();
}

function clearCurrentVector() {
    if (currentVectorLayer) {
        // 若是 layerGroup，逐一清除內含的 arrowheads
        if (currentVectorLayer.eachLayer) {
            currentVectorLayer.eachLayer(function(l) {
                if (l._arrowheads) mymap.removeLayer(l._arrowheads);
            });
        } else if (currentVectorLayer._arrowheads) {
            mymap.removeLayer(currentVectorLayer._arrowheads);
        }
        mymap.removeLayer(currentVectorLayer);
        currentVectorLayer = null;
    }
}

// 建立向量/純量 layer，不加到地圖
function buildVectorLayer(fromId, toId, label, type, color) {
    var from = currentStoryLandmarks.find(function(l) { return l.landmark_id === fromId; });
    var to   = currentStoryLandmarks.find(function(l) { return l.landmark_id === toId; });
    if (!from || !to) return null;
    var fromLL = [parseFloat(from.lat), parseFloat(from.lng)];
    var toLL   = [parseFloat(to.lat),   parseFloat(to.lng)];
    var group = L.layerGroup();
    var line = L.polyline([fromLL, toLL], { color: color, weight: 4, opacity: 0.9 });
    if (type === 'vector' && typeof line.arrowheads === 'function') {
        line.arrowheads({ size: '20px', frequency: 'endonly', fill: true, yawn: 50 });
    }
    line.addTo(group);
    if (label) {
        var midLat = (fromLL[0] + toLL[0]) / 2;
        var midLng = (fromLL[1] + toLL[1]) / 2;
        var labelIcon = L.divIcon({
            className: '',
            html: '<div class="vector-label">' + label + '</div>',
            iconAnchor: [0, 0],
        });
        L.marker([midLat, midLng], { icon: labelIcon, interactive: false }).addTo(group);
    }
    group._bounds = [fromLL, toLL];
    return group;
}

var pinnedVectorEl = null; // 目前被 click 固定的連結元素

// Click：zoom 到該 region 或特定 feature 的範圍
$(document).on('click', '.map-region-link', function(e) {
    e.preventDefault();
    var regionId    = $(this).data('region');
    var featureName = $(this).data('feature');

    function zoomTo(geojson) {
        var target = geojson;
        if (featureName && geojson.features) {
            var feat = geojson.features.find(function(f) {
                return f.properties && (f.properties.name === featureName || f.properties.NAME === featureName);
            });
            if (feat) target = feat;
        }
        mymap.fitBounds(L.geoJSON(target).getBounds(), { padding: [40, 40] });
    }

    if (regionGeoJsonCache[regionId]) {
        zoomTo(regionGeoJsonCache[regionId]);
    } else {
        $.getJSON('/data/regions/' + regionId + '.geojson').done(function(geojson) {
            regionGeoJsonCache[regionId] = geojson;
            zoomTo(geojson);
        });
    }
});

// Click：zoom 到該條線的範圍
$(document).on('click', '.map-vector-link', function(e) {
    e.preventDefault();
    var fromId = $(this).data('from').toString();
    var toId   = $(this).data('to').toString();
    var from = currentStoryLandmarks.find(function(l) { return l.landmark_id === fromId; });
    var to   = currentStoryLandmarks.find(function(l) { return l.landmark_id === toId; });
    if (!from || !to) return;
    var fromLL = [parseFloat(from.lat), parseFloat(from.lng)];
    var toLL   = [parseFloat(to.lat),   parseFloat(to.lng)];
    mymap.fitBounds([fromLL, toLL], { padding: [60, 60] });
});

function loadStory(story, fromCollection) {
    $.get(appUrl, { command: 'logView', story_id: story.story_id });
    clearMapLayers();

    currentLandmarkLayer = L.layerGroup().addTo(mymap);
    var allLatlngs = [];

    $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: story.story_id }, function(data) {
        currentStoryLandmarks = data.table;
        storyMarkerItems = [];
        var clusterLayer = L.markerClusterGroup();
        data.table.forEach(function(lm) {
            var lat = parseFloat(lm.lat), lng = parseFloat(lm.lng);
            if (isNaN(lat) || isNaN(lng)) return;
            allLatlngs.push([lat, lng]);
            var marker = L.marker([lat, lng])
                .bindPopup('<b>' + lm.name + '</b>' + (lm.content ? '<br>' + lm.content : ''));
            marker.addTo(clusterLayer);
            storyMarkerItems.push({ name: lm.name, marker: marker, cluster: clusterLayer });
        });
        clusterLayer.addTo(currentLandmarkLayer);
        if (allLatlngs.length > 0) mymap.fitBounds(allLatlngs, { padding: [40, 40] });

        // edges
        storyEdgeItems = [];
        currentStoryVectorLayer = L.layerGroup().addTo(mymap);
        $('[data-story-id="' + story.story_id + '"] .map-vector-link').each(function() {
            var fromId = $(this).data('from').toString();
            var toId   = $(this).data('to').toString();
            var label  = $(this).data('label') || $(this).text().trim();
            var type   = $(this).data('type') || 'vector';
            var color  = $(this).data('color') || (type === 'vector' ? '#e74c3c' : '#3498db');
            var group  = buildVectorLayer(fromId, toId, label, type, color);
            if (group) {
                group.addTo(currentStoryVectorLayer);
                storyEdgeItems.push({ label: label, color: color, group: group });
            }
        });

        // regions (async, deduplicated by data-region)
        storyRegionItems = [];
        currentStoryRegionLayer = L.layerGroup().addTo(mymap);
        var regionPromises = [];
        var uniqueRegions = {}; // regionId → { color, opacity, label }
        $('[data-story-id="' + story.story_id + '"] .map-region-link').each(function() {
            var rid = $(this).data('region');
            if (!rid || uniqueRegions[rid]) return; // 去重
            uniqueRegions[rid] = {
                color:   $(this).data('color') || '#3498db',
                opacity: parseFloat($(this).data('opacity') || '0.25'),
                label:   $(this).data('label') || ''
            };
        });
        Object.keys(uniqueRegions).forEach(function(regionId) {
            var def = uniqueRegions[regionId];
            function renderRegion(geojson) {
                regionGeoJsonCache[regionId] = geojson;
                var regionLayer = L.geoJSON(geojson, {
                    style: { color: def.color, weight: 1.5, fillColor: def.color, fillOpacity: def.opacity }
                });
                if (def.label) {
                    var center = regionLayer.getBounds().getCenter();
                    L.marker(center, {
                        icon: L.divIcon({ className: '', html: '<div class="vector-label">' + def.label + '</div>', iconAnchor: [0,0] }),
                        interactive: false
                    }).addTo(currentStoryRegionLayer);
                }
                regionLayer.addTo(currentStoryRegionLayer);
                storyRegionItems.push({ label: def.label || regionId, color: def.color, layer: regionLayer });
            }
            if (regionGeoJsonCache[regionId]) {
                var d = $.Deferred(); renderRegion(regionGeoJsonCache[regionId]); d.resolve();
                regionPromises.push(d.promise());
            } else {
                var p = $.getJSON('/data/regions/' + regionId + '.geojson').done(renderRegion);
                regionPromises.push(p);
            }
        });

        var done = function() { buildLayersPanel(story.story_id); };
        if (regionPromises.length > 0) $.when.apply($, regionPromises).always(done);
        else done();
    });

    if (fromCollection) {
        previousView = { type: 'collection', id: fromCollection.id, title: fromCollection.title };
        showPanelBackBtn(fromCollection.title, "blogGoBack()");
    } else {
        previousView = 'home';
        showPanelBackBtn('回首頁', "blogGoBack()");
    }
    if (mapBackControl) $(mapBackControl.getContainer()).hide();

    $('#blog-welcome').hide();
    $('[data-story-id], [data-collection-id]').hide();
    var section = $('[data-story-id="' + story.story_id + '"]').show();
    if (story.visibility === 'internal') {
        section.find('h2').first().append('<span class="story-internal-badge">Internal</span>');
    }
}

function buildLayersPanel(storyId) {
    var section = $('[data-story-id="' + storyId + '"]');
    section.find('.map-layers-panel').remove();
    if (!storyMarkerItems.length && !storyEdgeItems.length && !storyRegionItems.length) return;

    var html = '<div class="map-layers-panel">';
    html += '<div class="map-layers-header">地圖圖層 <span class="map-layers-arrow">▾</span></div>';
    html += '<div class="map-layers-body">';

    if (storyMarkerItems.length) {
        html += '<div class="map-layers-group">地標</div>';
        storyMarkerItems.forEach(function(item, i) {
            html += '<label class="map-layer-item"><input type="checkbox" checked data-ltype="landmark" data-idx="' + i + '"><span class="layer-dot" style="background:#27ae60"></span>' + item.name + '</label>';
        });
    }
    if (storyEdgeItems.length) {
        html += '<div class="map-layers-group">路線</div>';
        storyEdgeItems.forEach(function(item, i) {
            html += '<label class="map-layer-item"><input type="checkbox" checked data-ltype="edge" data-idx="' + i + '"><span class="layer-dot" style="background:' + item.color + '"></span>' + item.label + '</label>';
        });
    }
    if (storyRegionItems.length) {
        html += '<div class="map-layers-group">區域</div>';
        storyRegionItems.forEach(function(item, i) {
            html += '<label class="map-layer-item"><input type="checkbox" checked data-ltype="region" data-idx="' + i + '"><span class="layer-dot" style="background:' + item.color + '"></span>' + item.label + '</label>';
        });
    }

    html += '</div></div>';
    section.append(html);
}

// 圖層面板：折疊/展開
$(document).on('click', '.map-layers-header', function() {
    $(this).siblings('.map-layers-body').slideToggle(180);
    $(this).find('.map-layers-arrow').text(function(_, t) { return t === '▾' ? '▸' : '▾'; });
});

// 圖層面板：checkbox 控制顯示
$(document).on('change', '.map-layer-item input[type=checkbox]', function() {
    var ltype = $(this).data('ltype');
    var idx = parseInt($(this).data('idx'));
    var on = this.checked;
    if (ltype === 'landmark') {
        var item = storyMarkerItems[idx];
        if (!item) return;
        if (on) item.cluster.addLayer(item.marker);
        else item.cluster.removeLayer(item.marker);
    } else if (ltype === 'edge') {
        var item = storyEdgeItems[idx];
        if (!item) return;
        if (on) item.group.addTo(currentStoryVectorLayer);
        else currentStoryVectorLayer.removeLayer(item.group);
    } else if (ltype === 'region') {
        var item = storyRegionItems[idx];
        if (!item) return;
        if (on) item.layer.addTo(currentStoryRegionLayer);
        else currentStoryRegionLayer.removeLayer(item.layer);
    }
});

function blogGoBack() {
    clearMapLayers();
    $('#blog-back-btn').hide();

    if (previousView && previousView.type === 'collection') {
        var collId = previousView.id;
        previousView = 'home';
        loadCollectionById(collId);
        return;
    }

    // 回首頁
    previousView = null;
    history.replaceState(null, '', location.pathname);
    $('[data-story-id], [data-collection-id]').hide();
    $('#blog-welcome').show();
    if (mapBackControl) $(mapBackControl.getContainer()).hide();
    if (indexLayer) {
        var pts = indexLayer.getLayers().filter(function(l){ return l.getLatLng; }).map(function(l){ return l.getLatLng(); });
        if (pts.length === 1) mymap.setView(pts[0], 10);
        else if (pts.length > 1) mymap.fitBounds(pts, { padding: [60,60] });
    }
}

function loadCollectionById(collection_id) {
    clearMapLayers();

    $.get(appUrl, { command: 'getStoriesByCollection', collection_id: collection_id }, function(data) {
        currentLandmarkLayer = L.layerGroup();
        var latlngs = [];
        data.table.forEach(function(s) {
            $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: s.story_id }, function(lmData) {
                if (!lmData.table || lmData.table.length === 0) return;
                var lm = lmData.table[0];
                var lat = parseFloat(lm.lat);
                var lng = parseFloat(lm.lng);
                if (isNaN(lat) || isNaN(lng)) return;
                latlngs.push([lat, lng]);
                var sid = s.story_id;
                var icon = L.divIcon({
                    className: '',
                    html: '<div class="index-marker-pin index-marker-sub"><span class="index-marker-label">' + s.title.split('｜')[0] + '</span></div>',
                    iconSize: [12, 12], iconAnchor: [6, 6],
                });
                L.marker([lat, lng], { icon: icon })
                    .on('click', function() { loadStoryById(sid, collection_id); })
                    .addTo(currentLandmarkLayer);
                if (latlngs.length > 1) mymap.fitBounds(latlngs, { padding: [40, 40] });
                else mymap.setView([lat, lng], 10);
            });
        });
        currentLandmarkLayer.addTo(mymap);
    });

    previousView = 'home';
    showPanelBackBtn('回首頁', "blogGoBack()");
    if (mapBackControl) $(mapBackControl.getContainer()).hide();

    $('#blog-welcome').hide();
    $('[data-story-id], [data-collection-id]').hide();
    $('[data-collection-id="' + collection_id + '"]').show();
}

function loadStoryById(story_id, from_collection_id) {
    // 更新 URL hash 以便 refresh / 分享
    var newHash = from_collection_id ? story_id + '/' + from_collection_id : story_id;
    if (location.hash !== '#' + newHash) {
        history.replaceState(null, '', '#' + newHash);
    }

    function proceed(fromCollection) {
        $.get(appUrl, { command: 'getStoriesIndex' }, function(data) {
            var story = data.table.find(function(s) { return s.story_id === story_id; });
            if (story) {
                loadStory(story, fromCollection);
            } else {
                clearMapLayers();
                if (fromCollection) {
                    showPanelBackBtn(fromCollection.title, "blogGoBack()");
                    previousView = { type: 'collection', id: fromCollection.id, title: fromCollection.title };
                } else {
                    showPanelBackBtn('回首頁', "blogGoBack()");
                    previousView = 'home';
                }
                if (mapBackControl) $(mapBackControl.getContainer()).hide();
                $('#blog-welcome').hide();
                $('[data-story-id], [data-collection-id]').hide();
                $('[data-story-id="' + story_id + '"]').show();
            }
        });
    }

    if (from_collection_id) {
        $.get(appUrl, { command: 'getCollections' }, function(colData) {
            var col = colData.table.find(function(c) { return c.collection_id === from_collection_id; });
            proceed(col ? { id: from_collection_id, title: col.title } : null);
        });
    } else {
        proceed(null);
    }
}
