
$(document).ready(
    function() {
      const i18n = new VueI18n({
        locale: 'en',
        messages,
      })
      new Vue({ i18n }).$mount('#dropdown')
    });

function renderMap() {
	console.log('function:'+arguments.callee.name);
    var mymap = L.map('map').setView([25.1130643, 121.5227629], 7);
    var markers = L.markerClusterGroup();
    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        .forEach(item => markers.addLayer(item));
    mymap.addLayer(markers);
}

function getGPSbyStoryID(story_id) {
	console.log('function:'+arguments.callee.name);
    $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: story_id }, function(data) {
        var gps_locations = [];
        content_reg = '';
        content_reg += '<ul>'
        for (i in data.table) {
            gps_locations.push({
                lat: data.table[i].lat,
                lng: data.table[i].lng,
                name: data.table[i].name,
                content: data.table[i].content,
                link: data.table[i].link,
                landmark_id: data.table[i].landmark_id,
            })
            content_reg += `<li style="cursor:pointer" class="checkboxLandmark"><input class="chilInput${story_id}" id="${data.table[i].landmark_id}" type="checkbox"> <a class="singleZoom">`
            content_reg += data.table[i].name + '</a>';
            content_reg += '<a href=\"javascript:spec_func(' + data.table[i].landmark_id + ')\">(add)</a>'
            content_reg += '</li>'
        }
        content_reg += '</ul>'
        $('#collapse_' + story_id).html(content_reg);

        let markerIcon = document.querySelectorAll('.leaflet-marker-icon')
        let markerShadow = document.querySelectorAll('.leaflet-marker-shadow')
        if (gps_locations.length != markerIcon.length) {
            for (let i = 0; i < (markerShadow.length - gps_locations.length); i++) {
                markerIcon[i].remove()
                markerShadow[i].remove()
            }
        }
        document.getElementById(`genInput${story_id}`).checked = false
    });
}

function getGPSbyStoryID2(story_id) {
	console.log('function:'+arguments.callee.name);
    $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: story_id }, function(data) {
        var gps_locations = [];
        for (i in data.table) {
            gps_locations.push({
                lat: data.table[i].lat,
                lng: data.table[i].lng,
                name: data.table[i].name,
                notes: data.table[i].content,
                link: data.table[i].link,
                landmark_id: data.table[i].landmark_id,
            })
        }
        refreshMap2(gps_locations, story_id);

        let markerIcon = document.querySelectorAll('.leaflet-marker-icon')
        let markerShadow = document.querySelectorAll('.leaflet-marker-shadow')
        if (gps_locations.length != markerIcon.length) {
            for (let i = 0; i < (markerShadow.length - gps_locations.length); i++) {
                markerIcon[i].remove()
                markerShadow[i].remove()
            }
        }
        let genInpt = document.getElementById(`genInput${story_id}`)
        genInpt.checked = true
        MultiCheck(story_id, genInpt.checked)
    });
}

function ZoomByStoryID(story_id) {
	console.log('function:'+arguments.callee.name);
    $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: story_id }, function(data) {
        var gps_locations = [];
        for (i in data.table) {
            gps_locations.push({ lat: data.table[i].lat, lng: data.table[i].lng })
        }
        ZoomToGroup(gps_locations)
        let genInpt = document.getElementById(`genInput${story_id}`)
        genInpt.checked = true
        MultiCheck(story_id, genInpt.checked)

        let markerIcon = document.querySelectorAll('.leaflet-marker-icon')
        let markerShadow = document.querySelectorAll('.leaflet-marker-shadow')
        if (markerIcon.length === 0) {
            GetCluster(story_id)
        } else {
            for (let i = 0; i < (markerShadow.length - gps_locations.length); i++) {
                markerIcon[i].remove()
                markerShadow[i].remove()
            }
        }
    });
}

function GetCluster(story_id) {
	console.log('function:'+arguments.callee.name);
    $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: story_id }, function(data) {
        var gps_locations = [];
        for (i in data.table) {
            gps_locations.push({
                lat: data.table[i].lat,
                lng: data.table[i].lng,
                name: data.table[i].name,
                content: data.table[i].content,
                link: data.table[i].link,
                landmark_id: data.table[i].landmark_id,
                notes: data.table[i].content,
            })
        }
        addStoriesToLayer(gps_locations)
    });
}

function addmyappList(div_id_to_add, data_to_append, where_to_add, id_div) {
	console.log('function:'+arguments.callee.name);
    myapp_what = data_to_append.what;
    myapp_where = data_to_append.where;
    myapp_title = data_to_append.title;
    myapp_link = data_to_append.link;
    myapp_avatar = data_to_append.avatar;
    myapp_author = data_to_append.author;
    myapp_tags = data_to_append.tags;
    myapp_thumbnail = data_to_append.thumbnail;
    myapp_story_id = data_to_append.story_id;
    myapp_type = data_to_append.type;

    html_reg = '';
    html_reg += '<div class=\"accordion\" id=\"accordionExample\" >';
    html_reg += '   <div class=\"accordion-item\" ">';
    html_reg += '     <h2 class=\"accordion-header\" id=\"heading_' + myapp_story_id + '\" style="padding:10px;font-size:16px">';
    html_reg += '       <button style="width:50px;float:right;height:100%;padding:0;background:white;box-shadow:none" class=\"accordion-button\" type=\"button\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse_' + myapp_story_id + '\" aria-expanded=\"true\" aria-controls=\"collapse_' + myapp_story_id + '\">';
    html_reg += '       </button>';
    html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> (type:' + myapp_type + ') <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID2(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
    html_reg += '     </h2>';
    html_reg += '     <div id=\"collapse_' + myapp_story_id + '\" class=\"accordion-collapse collapse\" aria-labelledby=\"heading_' + myapp_story_id + '\" data-bs-parent=\"#accordionExample\">';
    html_reg += '       <div class=\"accordion-body\">';
    html_reg += '       </div>';
    html_reg += '     </div>';
    html_reg += '   </div>';
    html_reg += ' </div>';

    if (where_to_add == 'prepend') {
        $('#' + div_id_to_add).prepend(html_reg);
    } else if (where_to_add == 'append') {
        $('#' + div_id_to_add).append(html_reg);
    }
}

var global_markers;

function addStoriesToLayer(locations) {
	console.log('function:'+arguments.callee.name);
    var markers = L.markerClusterGroup();
    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        .forEach((marker,i) => {
          markers.addLayer(marker);
          marker.bindPopup("<b>"+ locations[i].name +"</b><br>" + locations[i].notes).openPopup();
        });
    global_markers = markers;
    mymap.addLayer(global_markers)
}

function ShowHideMarker(input, loc, opt) {
	console.log('function:'+arguments.callee.name);
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
        mymap.flyTo(loc._latlng, 16, { animate: true, duration: 0.3 })
    })
}

function ZoomToGroup(coor) {
	console.log('function:'+arguments.callee.name);
    var markers = L.markerClusterGroup();
    coor.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        .forEach((item, i) => { markers.addLayer(item) });
    let bound = markers.getBounds()
    mymap.fitBounds(bound)
}

function MultiCheck(id, val) {
	console.log('function:'+arguments.callee.name);
    let childIcon = document.querySelectorAll(`.chilInput${id}`)
    childIcon.forEach(child => { child.checked = val })
}

function refreshMap(locations, sid) {
	console.log('function:'+arguments.callee.name);
    var markers = L.markerClusterGroup();
    let input = document.querySelectorAll(`#collapse_${sid} input`)
    let a = document.querySelectorAll(`#collapse_${sid} .singleZoom`)
    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        .forEach((item, i) => {
            markers.addLayer(item)
            ShowHideMarker(input[i], item, markers)
            SingleZoom(a[i], item)
        });
    let genInput = document.getElementById(`genInput${sid}`)
    let markerIcon = document.querySelectorAll('.leaflet-marker-icon')
    genInput.addEventListener('click', function() {
        let id = genInput.id.replace('genInput', '')
        let val = genInput.checked
        if (genInput.checked === true) {
            mymap.addLayer(markers);
            MultiCheck(id, val)
        } else {
            mymap.removeLayer(markers);
            MultiCheck(id, val)
        }
    })
    mymap.removeLayer(markers);
}

function refreshMap2(locations, sid) {
	console.log('function:'+arguments.callee.name);
    var markers = L.markerClusterGroup();
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
    genInput.addEventListener('click', function() {
        let id = genInput.id.replace('genInput', '')
        let val = genInput.checked
        if (genInput.checked === true) {
            mymap.addLayer(markers);
            MultiCheck(id, val)
        } else {
            mymap.removeLayer(markers);
            MultiCheck(id, val)
        }
    })
    ZoomToGroup(locations)
    mymap.addLayer(markers);
}

function initMap() {
	console.log('function:'+arguments.callee.name);
    var streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiaW9rc2VuZ3RhbiIsImEiOiJja3JkeTgxMHI1Z3B2MzFxcHM0NWo3cTEwIn0.kkcIlaMdiTpqqaCk6YpOgQ'
    });

    mymap = L.map('map', {
        center: [25.1130643, 121.5227629],
        zoom: 12,
        layers: [streets]
    });

    mymap.on('moveend', function() {
        if (this.getZoom() > 12) {
            var west  = this.getBounds().getWest();
            var north = this.getBounds().getNorth();
            var east  = this.getBounds().getEast();
            var south = this.getBounds().getSouth();
            $('#DivStoriesList').empty();
            $.get(appUrl, {
                command: 'get_landmarks_by_zone',
                lat_south: south, lat_north: north,
                lng_west: west,   lng_east: east
            }, function(data) {
                var gps_locations = [];
                var landmarks = {};
                $('#DivStoriesList').empty();

                for (var i in data.landmarks) {
                    var lm = data.landmarks[i];
                    if (!landmarks[lm.story_id]) landmarks[lm.story_id] = [];
                    landmarks[lm.story_id].push(lm);
                    gps_locations.push({ lat: lm.lat, lng: lm.lng, name: lm.name, notes: lm.content });
                }

                for (var sid in landmarks) {
                    var storyTitle = data.stories[sid] || '(故事 ' + sid + ')';
                    $('#DivStoriesList').append("<b>" + storyTitle + "</b><br/>");
                    for (var j in landmarks[sid]) {
                        var lm = landmarks[sid][j];
                        var html = "<a href=\"javascript:flyto(" + lm.lat + "," + lm.lng + ")\">" + lm.name + "</a><br/>";
                        $('#DivStoriesList').append(html);
                    }
                    $('#DivStoriesList').append("<br/>");
                }
                addStoriesToLayer(gps_locations)
            });
        }
    });

    p_control = L.control.layers({ "Streets": streets });
}
