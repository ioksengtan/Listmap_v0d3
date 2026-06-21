var appUrl = '/api';
parameter = {    //command:"get_landmarks_by_story_id",
    command: "getRecentStories",
    //story_id:"1"
};
$(document).ready(
    function() {
      const i18n = new VueI18n({
        locale: 'en',
        messages,
      })
      new Vue({ i18n }).$mount('#dropdown')

    });

function renderMap() {
    var mymap = L.map('map').setView([25.1130643, 121.5227629], 7);
    console.log('test');
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiaW9rc2VuZ3RhbiIsImEiOiJja3JkeTgxMHI1Z3B2MzFxcHM0NWo3cTEwIn0.kkcIlaMdiTpqqaCk6YpOgQ'
    }).addTo(mymap);
    /*mymap.setLayoutProperty('country-label', 'text-field', [
'get',
'name_zh-Hant'
  ]);
  */
    var markers = L.markerClusterGroup();
    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        //.forEach(item => mymap.addLayer(item));
        .forEach(item => markers.addLayer(item));
    mymap.addLayer(markers);

}

function addMarker() {
    //google.maps.Marker.prototype.getDraggable = function() { return false; };
    marker = new google.maps.Marker({
        position: {
            lat: 25.0489782,
            lng: 121.5208181
        },
        map: map
    });
    //MarkerClusterer.prototype.getDraggable = function() { return false; };
    markerCluster.addMarkers(marker, true);
}


function getGPSbyStoryID(story_id) {
    //console.log(story_id);
    // let point = document.querySelectorAll('leaflet-marker-icon')
    // point.forEach(a => {
    //     a.style.visibility = 'hidden'
    // })
    // console.log(point)
    parameter = {
        //command:"get_landmarks_by_story_id",
        command: "get_landmarks_by_story_id",
        story_id: story_id
    };
    $.get(appUrl, parameter, function(data) {
        //console.log(data);
        var data_json = JSON.parse(data);

        var gps_locations = [];
        content_reg = '';
        content_reg += '<ul>'
        for (i in data_json.table) {
            gps_locations.push({
                lat: data_json.table[i].lat,
                lng: data_json.table[i].lng,
                name: data_json.table[i].name,
                content: data_json.table[i].content,
                link: data_json.table[i].link,
                landmark_id: data_json.table[i].landmark_id,
            })

            content_reg += `<li style="cursor:pointer" class="checkboxLandmark"><input class="chilInput${story_id}" id="${data_json.table[i].landmark_id}" type="checkbox"> <a class="singleZoom">`
            content_reg += data_json.table[i].name + '</a>';
            content_reg += '<a href=\"javascript:spec_func(' + data_json.table[i].landmark_id + ')\">(add)</a>'
            content_reg += '</li>'

        }

        content_reg += '</ul>'
        test_str = '#collapse_' + story_id;
        $('#collapse_' + story_id).html(content_reg);

        //refreshMap(gps_locations, story_id);

        let markerIcon = document.querySelectorAll('.leaflet-marker-icon')
        let markerShadow = document.querySelectorAll('.leaflet-marker-shadow')

        if (gps_locations.length != markerIcon.length) {
            for (let i = 0; i < (markerShadow.length - gps_locations.length); i++) {
                markerIcon[i].remove()
                markerShadow[i].remove()
            }
        }
        let main_input = document.querySelectorAll('.groupinput').checked = true

        // document.getElementById(`collapse_${story_id}`).classList.add("show");
        document.getElementById(`genInput${story_id}`).checked = false


    });
    /*[{
            lat: 25.0682519,
            lng: 121.5922095
        },
    ]*/


}

function getGPSbyStoryID2(story_id) {

    // let point = document.querySelectorAll('leaflet-marker-icon')
    // point.forEach(a => {
    //     a.style.visibility = 'hidden'
    // })
    // console.log(point)
    parameter = {
        //command:"get_landmarks_by_story_id",
        command: "get_landmarks_by_story_id",
        story_id: story_id
    };
    $.get(appUrl, parameter, function(data) {
        console.log(data);
        var data_json = JSON.parse(data);

        var gps_locations = [];
        for (i in data_json.table) {
            gps_locations.push({
                lat: data_json.table[i].lat,
                lng: data_json.table[i].lng,
                name: data_json.table[i].name,
                notes: data_json.table[i].notes,
                link: data_json.table[i].link,
                landmark_id: data_json.table[i].landmark_id,
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
        let main_input = document.querySelectorAll('.groupinput').checked = true

        // document.getElementById(`collapse_${story_id}`).classList.add("show");

        let genInpt = document.getElementById(`genInput${story_id}`)
        genInpt.checked = true
        MultiCheck(story_id, genInpt.checked)

    });
    /*[{
            lat: 25.0682519,
            lng: 121.5922095
        },
    ]*/


}

function ZoomByStoryID(story_id) {
    console.log(story_id);
    // let point = document.querySelectorAll('leaflet-marker-icon')
    // point.forEach(a => {
    //     a.style.visibility = 'hidden'
    // })
    // console.log(point)
    parameter = {
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

            })
        }

        ZoomToGroup(gps_locations)
        let genInpt = document.getElementById(`genInput${story_id}`)
        genInpt.checked = true

        MultiCheck(story_id, genInpt.checked)

        let markerIcon = document.querySelectorAll('.leaflet-marker-icon')
        let markerShadow = document.querySelectorAll('.leaflet-marker-shadow')
        console.log('markerIcon', markerIcon)
        if (markerIcon.length === 0) {
            GetCluster(story_id)
        } else {
            console.log('no iconssss', gps_locations.length)
            console.log('no icon', markerIcon.length)
            for (let i = 0; i < (markerShadow.length - gps_locations.length); i++) {
                markerIcon[i].remove()
                markerShadow[i].remove()
            }
        }

    });
    /*[{
            lat: 25.0682519,
            lng: 121.5922095
        },
    ]*/


}


// parameter = {
//
//     //command:"get_landmarks_by_story_id",
//     command: "get_landmarks_by_story_id",
//     story_id: 2
// };
// $.get(appUrl, parameter, function (data) {
//     //console.log(data);
//     var data_json = JSON.parse(data);

//     var markers = L.markerClusterGroup();
//     data_json.table.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
//         .forEach(item => markers.addLayer(item));
//     mymap.addLayer(markers)
// });

function addmyappList(div_id_to_add, data_to_append, where_to_add, id_div) {
    //console.log(div_id_to_add);
    //console.log(data_to_append);
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

    //html_reg = get_html_reg();

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


    //console.log(html_reg);
    if (where_to_add == 'prepend') {
        $('#' + div_id_to_add).prepend(html_reg);
    } else if (where_to_ad == 'append') {
        //$(div_id_to_append).
    }

    /*

    */
}

var global_markers;
function addStoriesToLayer(locations) {
    //mymap.removeLayer(global_markers);
    console.log(locations);
    var markers = L.markerClusterGroup();
    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        .forEach((marker,i) => {
          markers.addLayer(marker);
          marker.bindPopup("<b>"+ locations[i].name +"</b><br>" + locations[i].notes + "<br>" + "<a href=\"stories.html?story_id=" + locations[i].story_id + "\" target=\"__blank\">"+ data_json.table_stories[locations[i].story_id] +"</a>").openPopup();
          }
        );
    global_markers = markers;
    mymap.addLayer(global_markers)
}

// function ZoomToGroup(input, coor) {

//     input.forEach((input, i) => {
//         if (input.checked === true) {
//             let bound = coor.getBounds()
//             mymap.fitBounds(bound)
//         } else {
//             console.log('k')
//         }
//     })
// }


function ShowHideMarker(input, loc, opt) {

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

        mymap.flyTo(loc._latlng, 16, {
            animate: true,
            duration: 0.3
        })
    })
}

function ZoomToGroup(coor) {

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

function onclickTitleShowMarker(location) {
    var markers = L.markerClusterGroup();
    markers.addLayer(location)

    mymap.addLayer(markers)
}
var gps_locations;
function GetCluster(story_id) {
    parameter = {
        //command:"get_landmarks_by_story_id",
        command: "get_landmarks_by_story_id",
        story_id: story_id
    };
    $.get(appUrl, parameter, function(data) {

        var data_json = JSON.parse(data);
        console.log(data_json);
        gps_locations = [];

        for (i in data_json.table) {
            gps_locations.push({
                lat: data_json.table[i].lat,
                lng: data_json.table[i].lng,
                name: data_json.table[i].name,
                content: data_json.table[i].content,
                link: data_json.table[i].link,
                landmark_id: data_json.table[i].landmark_id,
                notes: data_json.table[i].notes,
            })
        }




        // onclickTitleShowMarker(gps_locations)
        addStoriesToLayer(gps_locations)
    });
}

function MultiCheck(id, val) {
    let childIcon = document.querySelectorAll(`.chilInput${id}`)
    childIcon.forEach(child => {
        child.checked = val
    })
}

function refreshMap(locations, sid) {

    // if(markerIcon.length !== locations.length) {
    //     let test = markerIcon[0]
    //     console.log(markerIcon)
    // }

    //mymap.invalidateSize();
    //var mymap = L.map('map').setView([25.1130643, 121.5227629], 7);
    console.log('refreshMap');
    /*

  var markers = L.markerClusterGroup();
  //var landmarks_layergroup = L.layerGroup();
  locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
             //.forEach(item => mymap.addLayer(item));
             .forEach(item => markers.addLayer(item));

mymap = L.map('map', {
  center: [25.1130643, 121.5227629],
  zoom: 7,
  layers: [streets, markers]
});*/


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
        //.forEach(item => mymap.addLayer(item));
        .forEach((item, i) => {
            markers.addLayer(item)
            ShowHideMarker(input[i], item, markers)
            SingleZoom(a[i], item)

        });

    let genInput = document.getElementById(`genInput${sid}`)

    // let markerShadow = document.querySelectorAll('.leaflet-marker-shadow')

    // if (gps_locations.length != markerIcon.length) {
    //     for (let i = 0; i < (markerShadow.length - gps_locations.length); i++) {
    //         markerIcon[i].remove()
    //         markerShadow[i].remove()
    //     }
    // }
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
            MultiCheck(id, val)
            console.log(markerIcon.length)
        } else {
            markers.eachLayer(function(layer) {
                layer.remove()
            })
            mymap.removeLayer(markers);
            MultiCheck(id, val)
            console.log(markerIcon.length)
        }
    })

    // ZoomToGroup(markers)


    var baseMaps = {
        //    "Streets": streets
    };

    var overlayMaps = {
        "Landmarks": markers
    };
    mymap.removeLayer(markers);

}

function refreshMap2(locations, sid) {


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
        //.forEach(item => mymap.addLayer(item));
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
            MultiCheck(id, val)
            console.log(markerIcon.length)
        } else {
            markers.eachLayer(function(layer) {
                layer.remove()
            })
            mymap.removeLayer(markers);
            MultiCheck(id, val)
            console.log(markerIcon.length)
        }
    })

    ZoomToGroup(locations)


    var baseMaps = {
        //    "Streets": streets
    };

    var overlayMaps = {
        "Landmarks": markers
    };

    mymap.addLayer(markers);

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
        for (let i in m) {
            //console.log(m[i].getLabel());
            //console.log(m[i].getTitle());
            //console.log(m[i].myObj.myKey);
        }
    });
}


function initMap() {
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
    var markers = L.markerClusterGroup();
    //var landmarks_layergroup = L.layerGroup();
    /*
	locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        //.forEach(item => mymap.addLayer(item));
        .forEach(item => markers.addLayer(item));
    */
    mymap = L.map('map', {
        center: [25.1130643, 121.5227629],
        //center: [39.921640, -75.412165],
        zoom: 12,
        layers: [streets]
    });

    mymap.on('zoomend', function() {
        if(this.getZoom()>11){
        console.log('zoom');
        console.log(this.getZoom() + ' ' + this.getCenter() + ' ' + this.getBounds().getWest());
      }
    });


    mymap.on('moveend', function() {
      $('#DivStoriesList').empty();
        console.log('zoom');
        console.log(this.getZoom() + ' ' + this.getCenter() + ' ' + this.getBounds().getWest() + ' ' + this.getBounds().getEast() + ' ' + this.getBounds().getNorth() + ' ' + this.getBounds().getSouth());
        if (this.getZoom() > 12) {
            west = this.getBounds().getWest();
            north = this.getBounds().getNorth();
            east = this.getBounds().getEast();
            south = this.getBounds().getSouth();
            $.get(appUrl, {                command: "get_landmarks_by_zone",
                lat_south: south,
                lat_north: north,
                lng_west: west,
                lng_east: east
            }, function(data) {
                $('#DivStoriesList').empty();
                data_json = JSON.parse(data);
                console.log(data_json)
                var gps_locations = [];
                var landmarks = {};
                for (i in data_json.table){
                    if(typeof(landmarks[data_json.table[i].story_id])=="undefined"){
                      landmarks[data_json.table[i].story_id] = [];
                      landmarks[data_json.table[i].story_id].push(data_json.table[i]);
                    }else{
                      landmarks[data_json.table[i].story_id].push(data_json.table[i]);
                    }
                    gps_locations.push({
                        lat: data_json.table[i].lat_lng.split(',')[0],
                        lng: data_json.table[i].lat_lng.split(',')[1],
                        name: data_json.table[i].name,
                        content: data_json.table[i].content,
                        link: data_json.table[i].link,
                        landmark_id: data_json.table[i].landmark_id,
                        notes: data_json.table[i].notes,
                        story_id: data_json.table[i].story_id,
                    })
                }
                console.log(landmarks);
                /*
                for(story_id in landmarks){
                  $('#DivStoriesList').append("<b>" + data_json.table_stories[story_id] + "</b>" + '<br/>');
                  for(i in landmarks[story_id]){
                      var html_reg = '';
                      //html_reg+= "<a href=\"javascript:flyto(" + landmarks[story_id][i].lat_lng.split(',')[0] +", "+landmarks[story_id][i].lat_lng.split(',')[1]+")>"+landmarks[story_id][i].name+"</a>"
                      //$('#DivStoriesList').append(html_reg + '<br/>');
                      html_reg += "<a href=\"javascript:flyto("+ landmarks[story_id][i].lat_lng.split(',')[0] +","+ landmarks[story_id][i].lat_lng.split(',')[1] +")\">"
                      html_reg += landmarks[story_id][i].name + '</a><br/>';
                      $('#DivStoriesList').append(html_reg);
                  }
                  $('#DivStoriesList').append("<br/>");
                }

                */

                //$('#DivStoriesList').append(data_json.table[i].name + '<br/>');


                // onclickTitleShowMarker(gps_locations)

                addStoriesToLayer(gps_locations)

            })
        }
    });

    var baseMaps = {
        "Streets": streets
    };
    p_control = L.control.layers(baseMaps);



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
