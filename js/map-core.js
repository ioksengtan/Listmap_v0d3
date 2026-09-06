(function (root) {
    'use strict';

    var DEFAULT_CENTER = [25.1130643, 121.5227629];
    var MAPBOX_TOKEN = 'pk.eyJ1IjoiaW9rc2VuZ3RhbiIsImEiOiJja3JkeTgxMHI1Z3B2MzFxcHM0NWo3cTEwIn0.kkcIlaMdiTpqqaCk6YpOgQ';

    function createTileLayer() {
        return L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: MAPBOX_TOKEN
        });
    }

    function createMap(elementId, options) {
        var opts = options || {};
        var tileLayer = opts.tileLayer || createTileLayer();
        var map = L.map(elementId, {
            center: opts.center || DEFAULT_CENTER,
            zoom: opts.zoom == null ? 7 : opts.zoom,
            layers: [tileLayer]
        });
        map._listmapBaseLayer = tileLayer;
        return map;
    }

    function createCluster() {
        return typeof L.markerClusterGroup === 'function'
            ? L.markerClusterGroup()
            : L.layerGroup();
    }

    function addMarkers(layer, locations, options) {
        var opts = options || {};
        (locations || []).forEach(function (location) {
            var lat = Number(location.lat);
            var lng = Number(location.lng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
            var marker = L.marker([lat, lng], opts.markerOptions || {});
            if (opts.popup) marker.bindPopup(opts.popup(location));
            layer.addLayer(marker);
        });
        return layer;
    }

    function fitLocations(map, locations, padding) {
        var bounds = (locations || [])
            .map(function (location) {
                return [Number(location.lat), Number(location.lng)];
            })
            .filter(function (point) {
                return Number.isFinite(point[0]) && Number.isFinite(point[1]);
            });
        if (bounds.length === 1) map.setView(bounds[0], 12);
        if (bounds.length > 1) map.fitBounds(bounds, { padding: padding || [30, 30] });
    }

    root.ListmapMapCore = {
        createTileLayer: createTileLayer,
        createMap: createMap,
        createCluster: createCluster,
        addMarkers: addMarkers,
        fitLocations: fitLocations
    };
})(window);
