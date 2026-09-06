const locations = []

function invalidateMapSize() {
    if (typeof mymap === 'undefined' || !mymap || typeof mymap.invalidateSize !== 'function') {
        return;
    }
    mymap.invalidateSize({ animate: false });
}

function bindMapSizeInvalidation() {
    if (bindMapSizeInvalidation._bound) {
        invalidateMapSize();
        return;
    }
    bindMapSizeInvalidation._bound = true;
    var later = null;
    function scheduleInvalidate() {
        invalidateMapSize();
        if (later) clearTimeout(later);
        later = setTimeout(invalidateMapSize, 250);
    }
    window.addEventListener('resize', scheduleInvalidate);
    window.addEventListener('orientationchange', scheduleInvalidate);
}

function flyto(lat, lng){
  mymap.flyTo(L.latLng(lat, lng), 18, {
      animate: true,
      duration: 0.7
  })

}

function draw_line(latlngs=[ [45.51, -122.68], [37.77, -122.43], [34.04, -118.2] ]){
  // create a red polyline from an array of LatLng points
  /*
var latlngs = [
    [45.51, -122.68],
    [37.77, -122.43],
    [34.04, -118.2]
];
*/

var polyline = L.polyline(latlngs, {color: 'red'}).addTo(mymap);

// zoom the map to the polyline
mymap.fitBounds(polyline.getBounds());
}
var map_is_home = false;
var home_gps_lat = 22.630114
var home_gps_lng = 120.313253
var reg_gps_lat = 0
var reg_gps_lng = 0
function gohome(){
  if(map_is_home){
    zoomto(loc = {'lat': reg_gps_lat,'lng': reg_gps_lng}, zoom = mymap.getZoom())
    map_is_home = false;
  }else{
    reg_gps_lat = mymap.getCenter().lat;
    reg_gps_lng = mymap.getCenter().lng;
    zoomto(loc = {'lat': home_gps_lat,'lng': home_gps_lng}, zoom =  mymap.getZoom())
    map_is_home = true;
  }

}

function set_as_reference(){
  home_gps_lat = mymap.getCenter().lat;
  home_gps_lng = mymap.getCenter().lng;
}

function GetCluster(story_id) {
    parameter = {
        url: sheetsUrl,
        //command:"get_landmarks_by_story_id",
        command: "get_landmarks_by_story_id",
        story_id: story_id
    };
    $.get(appUrl, parameter, function(data) {
        //console.log(data);
        var data_json = JSON.parse(data);
        var gps_locations = [];
        for (i in data_json.table) {
            gps_locations.push({
                lat: data_json.table[i].lat,
                lng: data_json.table[i].lng,
                name: data_json.table[i].name,
                content: data_json.table[i].content,
                link: data_json.table[i].link,
                landmark_id: data_json.table[i].landmark_id,
            })

        }

        addStoriesToLayer(gps_locations)
    });
}



function addStoriesToLayer(locations) {
    var markers = window.ListmapMapCore
        ? ListmapMapCore.createCluster()
        : L.markerClusterGroup();
    if (window.ListmapMapCore) {
        ListmapMapCore.addMarkers(markers, locations);
    } else {
        locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
            .forEach(item => markers.addLayer(item));
    }
    mymap.addLayer(markers)
}

function pngMap(){
  mymap.remove();
  var img = new Image();
  img.onload = function() {
    //alert(this.width + 'x' + this.height);
    var bounds = [[0, 0], [this.width, this.height]];
    mymap = L.map('map', {
    	crs: L.CRS.Simple,
    	maxZoom: 1,
    	minZoom: -4,
    	maxBounds: bounds
    });
    //L.imageOverlay('img/image0.png', bounds).addTo(map2);
    L.imageOverlay('https://i.imgur.com/x3Wf4tF.jpg', bounds).addTo(mymap);
    mymap.fitBounds(bounds);
    mymap.on('zoomend', function() {
        console.log('zoom to:' + 'level(' + this.getZoom() + ') ' + this.getCenter());
    });
    mymap.on('click', function(e) {
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
    });
  }
  img.src = 'https://i.imgur.com/x3Wf4tF.jpg';
}
function initMap() {
    if (window.ListmapMapCore) {
        mymap = ListmapMapCore.createMap('map', { center: [25.1130643, 121.5227629], zoom: 7 });
        bindMapSizeInvalidation();
        return;
    }

    //mymap = L.map('map').setView([25.1130643, 121.5227629], 7);
    //console.log('test');
    var streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiaW9rc2VuZ3RhbiIsImEiOiJja3JkeTgxMHI1Z3B2MzFxcHM0NWo3cTEwIn0.kkcIlaMdiTpqqaCk6YpOgQ'
    });
    /*
    	var streets = L.tileLayer('https://api.mapbox.com/styles/v1/yushengc/cksmkvn1wnscl17lydjzbzhtv/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieXVzaGVuZ2MiLCJhIjoiY2phYnJ6NDdwMDM2bzMzcXV1NTEzMWlucCJ9.0mKbx5AhNu9BLzYyLwCyXQ', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,

        });
    */
    var markers = L.markerClusterGroup();
    //var landmarks_layergroup = L.layerGroup();
    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        //.forEach(item => mymap.addLayer(item));
        .forEach(item => markers.addLayer(item));

    mymap = L.map('map', {
        //center: [25.1130643, 121.5227629],
        center: [25.1130643, 121.5227629],
        zoom: 7,
        layers: [streets]
    });

    bindMapSizeInvalidation();

    mymap.on('zoomend', function() {
        console.log('zoom to:' + 'level(' + this.getZoom() + ') ' + this.getCenter());
    });
    mymap.on('click', function(e) {
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
    });
    var baseMaps = {
        "Streets": streets
    };
    p_control = L.control.layers(baseMaps);
    var cost_underground = 12.55,
        cost_above_ground = 17.89,
        html = [
            '<table>',
            ' <tr><td class="cost_label">Cost Above Ground:</td><td class="cost_value">${total_above_ground}</td></tr>',
            ' <tr><td class="cost_label">Cost Underground:</td><td class="cost_value">${total_underground}</td></tr>',
            '</table>'
        ].join(''),
        numberWithCommas = function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };
    if (!L.Control.LinearMeasurement) return;
    var Ruler = L.Control.LinearMeasurement.extend({
        layerSelected: function(e){

            /* cost should be in feet */

            var distance = e.total.scalar;

            if(e.total.unit === 'mi'){
                distance *= e.sub_unit;

            } else if(e.total.unit === 'km'){
                distance *= 3280.84;

            } else if(e.total.unit === 'm'){
                distance *= 3.28084;
            }

            var data = {
                total_above_ground: numberWithCommas(L.Util.formatNum(cost_above_ground * distance, 2)),
                total_underground: numberWithCommas(L.Util.formatNum(cost_underground * distance, 2))
            };

            var content = L.Util.template(html, data),
                popup = L.popup().setContent(content);

            //e.total_label.bindPopup(popup, { offset: [45, 0] });
            //e.total_label.openPopup();
        }
    });

    mymap.addControl(new Ruler({
      unitSystem: 'metric',
      color: '#FF0080'
    }));

}

function initGMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: {
            lat: 24.790078397806973,
            lng: 121.07471724480152
        },
    });
    const infowindow = new google.maps.InfoWindow({
        content: "<h1>test</h1>",
    });
    // Create an array of alphabetical characters used to label the markers.
    const labels = ["一", "B1"];
    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    markers = locations.map((location, i) => {
        var marker = new google.maps.Marker({
            position: location,
            label: labels[i % labels.length],
            title: 'test'
        });
        marker.addListener("click", () => {
            //map.setZoom(8);
            //map.setCenter(marker.getPosition());
            infowindow.setContent(marker.getLabel());
            infowindow.open(map, marker);
            console.log(marker.getLabel());

        });
        return marker
    });
    // Add a marker clusterer to manage the markers.
    markerCluster = new MarkerClusterer(map, markers, {
        imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    });
    marker = new google.maps.Marker({
        position: {
            lat: 25.0489782,
            lng: 121.5208181
        },
    });
    //markerCluster.addMarkers(marker, true);

    google.maps.event.addListener(markerCluster, 'clusterclick', function(c) {
        console.log('Number of managed markers in cluster: ' + c.getSize());
        var m = c.getMarkers();
        for (let i in m) {
            //console.log(m[i].getLabel());
            //console.log(m[i].getTitle());
            //console.log(m[i].myObj.myKey);
        }
    });
}
function UpdateMap(locations, sid) {
    console.log('UpdateMap');
    console.log(locations);
    console.log(sid);

    var streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiaW9rc2VuZ3RhbiIsImEiOiJja3JkeTgxMHI1Z3B2MzFxcHM0NWo3cTEwIn0.kkcIlaMdiTpqqaCk6YpOgQ'
    });

    var markers = L.markerClusterGroup();
    //var landmarks_layergroup = L.layerGroup();


    let input = document.querySelectorAll(`#collapse_${sid} input`)
    let a = document.querySelectorAll(`#collapse_${sid} .singleZoom`)

    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        .forEach((marker, i) => {
            markers.addLayer(marker);
            ShowHideMarker(input[i], marker, markers);
            SingleZoom(a[i], marker);
            marker.bindPopup("<b>" + locations[i].name + "</b><br>" + locations[i].notes).openPopup();
        });

    let genInput = document.getElementById(`genInput${sid}`)


    let markerIcon = document.querySelectorAll('.leaflet-marker-icon')
    let markerShadow = document.querySelectorAll('.leaflet-marker-shadow')

    genInput.addEventListener('click', function() {
        let id = genInput.id.replace('genInput', '')
        let val = genInput.checked

        if (genInput.checked === true) {
            mymap.eachLayer(function(layer) {
                mymap.addLayer(layer)
            })
            mymap.addLayer(markers);
            GotoStory(id, val)
            console.log(markerIcon.length)
        } else {
            markers.eachLayer(function(layer) {
                layer.remove()
            })
            mymap.removeLayer(markers);
            GotoStory(id, val)
            console.log(markerIcon.length)
        }
    }


  )

    ZoomToGroup(locations)


    var baseMaps = {
        //    "Streets": streets
    };

    var overlayMaps = {
        "Landmarks": markers
    };

    mymap.addLayer(markers);


}


function GotoStory(id, val) {

    let childIcon = document.querySelectorAll(`.chilInput${id}`)
    childIcon.forEach(child => {
        child.checked = val
    })
}

function onclickTitleShowMarker(location) {
    var markers = L.markerClusterGroup();
    markers.addLayer(location)

    mymap.addLayer(markers)
}
function ShowHideCluster(location, input) {
    var markers = L.markerClusterGroup();
    input.addEventListener('click', () => {
        if (input.checked === false) {
            markers.removeLayer(location)
        } else {
            markers.addLayer(location)
        }
    })

    mymap.addLayer(markers)


}
function zoomto(loc = {'lat': -34.003646,'lng': 18.469909}, zoom = 16){
  //var loc = {'lat': -34.003646,'lng': 18.469909};
  console.log('zoomto');
  mymap.flyTo(loc, zoom, {
      animate: true,
      duration: 0.3
  })
}

function ZoomToGroup(input, coor) {
    console.log('ZoomToGroup');
     input.forEach((input, i) => {
         if (input.checked === true) {
             let bound = coor.getBounds()
             mymap.fitBounds(bound)
         } else {
             console.log('k')
         }
     })
 }


function ShowHideMarker(input, loc, opt) {
	console.log(input);
    input.addEventListener('click', () => {
        if (input.checked === false) {
            mymap.removeLayer(loc)
        } else {
            mymap.addLayer(loc)
        }
    })
}

function SingleZoom(name, loc) {
    console.log('function:'+arguments.callee.name);
    name.addEventListener('click', () => {

        mymap.flyTo(loc._latlng, 18, {
            animate: true,
            duration: 0.3
        })
    })
}

function ZoomToGroup(coor) {
    console.log('ZoomToGroup');
    var markers = L.markerClusterGroup();
    //var landmarks_layergroup = L.layerGroup();

    coor.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        //.forEach(item => mymap.addLayer(item));
        .forEach((item, i) => {
            markers.addLayer(item)
        });

    let bound = markers.getBounds()

    mymap.fitBounds(bound)

    // ZoomToGroup(markers)
}






function refreshGMap(locations) {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: {
            lat: 24.790078397806973,
            lng: 121.07471724480152
        },
    });
    const infowindow = new google.maps.InfoWindow({
        content: "<h1>test</h1>",
    });
    // Create an array of alphabetical characters used to label the markers.
    let labels = [];
    for (location_id in locations) {
        //const labels = ["", "B1"];
        labels.push(locations[location_id].name);
    }
    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    markers = locations.map((location, i) => {
        var marker = new google.maps.Marker({
            position: location,
            label: labels[i % labels.length],
            title: 'test'
        });
        marker.addListener("click", () => {
            //map.setZoom(8);
            //map.setCenter(marker.getPosition());
            infowindow.setContent(location.content + '<br/>' + '<a href=\"' + location.link + '\">link</a>');
            infowindow.open(map, marker);
            console.log(marker.getLabel());

        });
        return marker
    });
    // Add a marker clusterer to manage the markers.
    markerCluster = new MarkerClusterer(map, markers, {
        imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    });
    marker = new google.maps.Marker({
        position: {
            lat: 25.0489782,
            lng: 121.5208181
        },
    });
    //markerCluster.addMarkers(marker, true);

    google.maps.event.addListener(markerCluster, 'clusterclick', function(c) {
        console.log('Number of managed markers in cluster: ' + c.getSize());
        var m = c.getMarkers();

    });
}

//[[1,2],[3],[3],[]]
//test_graph = [[1], [2,3,4], [5],[5],[5],[]]
//九宮格：[[1,3],[0,2,4],[1,5],[0,4,6],[1,3,5,7],[2,4,8],[3,7],[4,6,8],[5,7]]
// leetcode 797
function get_all_paths_source_target(graph) {
    const target = graph.length - 1;
    const paths = [[0]];
    const targets = [];
    while (paths.length > 0) {
      const path = paths.shift();
      const edges = graph[path[path.length - 1]];
      if (edges.length === 0) {
        continue;
      }
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        if (edge === target) {
          targets.push([...path, edge]);
        } else {
          paths.push([...path, edge]);
        }
      }
    }
    return targets;
  }
  
// points = [[0,0],[2,2],[3,10],[5,2],[7,0]]
// leetcode 1584
function get_min_cost_connect_points(ps) {
    const n = ps.length;
    let res = 0, i = 0, connected = 0;
    const min_d = new Array(n).fill(10000000);
    while (++connected < n) {
        min_d[i] = Infinity;
        let min_j = i;
        for (let j = 0; j < n; ++j) {
            if (min_d[j] !== Infinity) {
                weight = Math.abs(ps[i][0] - ps[j][0]) + Math.abs(ps[i][1] - ps[j][1])
                min_d[j] = Math.min(min_d[j], weight);
                min_j = min_d[j] < min_d[min_j] ? j : min_j;
            }
        }
        res += min_d[min_j];
        i = min_j;
    }
    return res;
}

// leetcode 743
// times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2
function networkDelayTime(times, n, k) {
    const adj = Array.from({ length: n + 1 }, () => []);
    for (let [i, j, w] of times) {
        adj[i].push([j, w]);
    }
    const dst = Array(n + 1).fill(Infinity);
    dst[0] = 0;
    dst[k] = 0;
    const st = [];
    for (let [i, w] of adj[k]) {
        dst[i] = w;
        st.push([w, i]);
    }
    st.sort((a, b) => a[0] - b[0]);
    while (st.length) {
        const [wt, x] = st.shift();
        for (let [i, w] of adj[x]) {
            if (wt + w < dst[i]) {
                dst[i] = wt + w;
                st.push([dst[i], i]);
                st.sort((a, b) => a[0] - b[0]);
            }
        }
    }
    if (dst.some(x => x === Infinity)) {
        return -1;
    }
    return Math.max(...dst);
}

/*
const graph = {
    A: { B: 5, C: 2 },
    B: { A: 5, D: 4 },
    C: { A: 2, D: 7 },
    D: { B: 4, C: 7 },
  };
  const graph = {
    'home': { '7_11': 10},
    '7_11': { 'HSR': 30, 'goverment': 30, 'train_station': 40 },
    'HSR': { 'office': 20 },
    'goverment': { 'office': 10 },
    'train_station': { 'office':10 },
    'office':{},
  };
const distances = dijkstra(graph, 'A');
console.log(distances); // { A: 0, B: 5, C: 2, D: 9 }
*/
function dijkstra(graph, startNode) {
    const distances = {};
    const visited = {};
    const unvisited = new Set(Object.keys(graph));
  
    // Initialize all distances to infinity except for the start node,
    // which is initialized to 0.
    for (const node in graph) {
      distances[node] = Infinity;
    }
    distances[startNode] = 0;
  
    while (unvisited.size > 0) {
      // Find the unvisited node with the smallest distance.
      let currentNode = null;
      let minDistance = Infinity;
      for (const node of unvisited) {
        if (distances[node] < minDistance) {
          currentNode = node;
          minDistance = distances[node];
        }
      }
  
      // Mark the current node as visited.
      visited[currentNode] = true;
      unvisited.delete(currentNode);
  
      // Update the distances of the unvisited neighbors of the current node.
      for (const neighbor in graph[currentNode]) {
        if (!visited[neighbor]) {
          const distance = graph[currentNode][neighbor];
          const totalDistance = distance + distances[currentNode];
          if (totalDistance < distances[neighbor]) {
            distances[neighbor] = totalDistance;
          }
        }
      }
    }
  
    return distances;
  }