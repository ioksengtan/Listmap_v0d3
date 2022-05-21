const locations = []

function flyto(lat, lng){
  mymap.flyTo(L.latLng(lat, lng), 18, {
      animate: true,
      duration: 0.7
  })

}


function GetCluster(story_id) {
    parameter = {
        url: sheetsUrl,
        //command:"getLandmarksByStory",
        command: "getLandmarksByStory",
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
    var markers = L.markerClusterGroup();
    locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
        .forEach(item => markers.addLayer(item));
    mymap.addLayer(markers)
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
  mymap.flyTo(loc, 16, {
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

    input.addEventListener('click', () => {
        if (input.checked === false) {
            mymap.removeLayer(loc)
        } else {
            mymap.addLayer(loc)
        }
    })
}

function SingleZoom(name, loc) {
    console.log('SingleZoom');
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



function get_stories_by_keyword(keyword){
  $('#DivStoriesList').empty();
  var parameter = {
    url: sheetsUrl,
    name: sheetName,
    command: "sql_get_stories_by_keyword",
    keyword: keyword
  };
      $.get(appUrl, parameter, function(data) {

          console.log(data);
          data_array = JSON.parse(data);
          for (i in data_array) {
              //console.log(i + ',' +data_json.table[i]);
              if(i==0){

              }else{
                data_json.table[i] = {
                  'title': data_array[i][0],
                  'author': data_array[i][4],
                  'type_':data_array[i][2],
                  'link':data_array[i][3],
                  'story_id':data_array[i][1]
                }
                appendStoriesList(DivStoriesList, data_json.table[i], 'prepend');
              }

              switch(data_json.table[i].type_){
                case 'podcast':
                  StoriesDict[data_json.table[i].story_id] = {
                      'type_': data_json.table[i].type_,
                      'media_key': data_json.table[i].link,
                      'link': data_json.table[i].link,
                  };
                  break;
                case 'youtube':
                  StoriesDict[data_json.table[i].story_id] = {
                      'type_': data_json.table[i].type_,
                      'media_key': data_json.table[i].link.split('v=')[1],
                      'link': data_json.table[i].link,
                  };
                  break;
                  default:
                  StoriesDict[data_json.table[i].story_id] = {
                      'type_': data_json.table[i].type_,
                      'media_key': data_json.table[i].link,
                      'link': data_json.table[i].link,
                  };
              }

          }
        });
}


function get_stories_by_author(author){
  $('#DivStoriesList').empty();
  var parameter = {
    url: sheetsUrl,
    name: sheetName,
    command: "sql_get_stories_by_author",
    author:author
  };
      $.get(appUrl, parameter, function(data) {

          console.log(data);
          data_array = JSON.parse(data);
          for (i in data_array) {
              //console.log(i + ',' +data_json.table[i]);
              if(i==0){

              }else{
                data_json.table[i] = {
                  'title': data_array[i][0],
                  'author': data_array[i][4],
                  'type_':data_array[i][2],
                  'link':data_array[i][3],
                  'story_id':data_array[i][1]
                }
                appendStoriesList(DivStoriesList, data_json.table[i], 'prepend');
              }

              switch(data_json.table[i].type_){
                case 'podcast':
                  StoriesDict[data_json.table[i].story_id] = {
                      'type': data_json.table[i].type_,
                      'media_key': data_json.table[i].link,
                      'link': data_json.table[i].link,
                  };
                  break;
                case 'youtube':
                  StoriesDict[data_json.table[i].story_id] = {
                      'type': data_json.table[i].type_,
                      'media_key': data_json.table[i].link.split('v=')[1],
                      'link': data_json.table[i].link,
                  };
                  break;
                  default:
                  StoriesDict[data_json.table[i].story_id] = {
                      'type': data_json.table[i].type_,
                      'media_key': data_json.table[i].link,
                      'link': data_json.table[i].link,
                  };
              }

          }
        });
}

function get_stories_by_tag(tag){
  $('#DivStoriesList').empty();
  var parameter = {
    url: sheetsUrl,
    name: sheetName,
    command: "sql_get_stories_by_tag",
    tag:tag
  };
      $.get(appUrl, parameter, function(data) {

          console.log(data);
          data_array = JSON.parse(data);
          for (i in data_array) {
              //console.log(i + ',' +data_json.table[i]);
              if(i==0){

              }else{
                data_json.table[i] = {
                  'title': data_array[i][0],
                  'author': data_array[i][4],
                  'type_':data_array[i][2],
                  'link':data_array[i][3],
                  'story_id':data_array[i][1]
                }
                appendStoriesList(DivStoriesList, data_json.table[i], 'prepend');
              }

              switch(data_json.table[i].type_){
                case 'podcast':
                  StoriesDict[data_json.table[i].story_id] = {
                      'type': data_json.table[i].type_,
                      'media_key': data_json.table[i].link,
                      'link': data_json.table[i].link,
                  };
                  break;
                case 'youtube':
                  StoriesDict[data_json.table[i].story_id] = {
                      'type': data_json.table[i].type_,
                      'media_key': data_json.table[i].link.split('v=')[1],
                      'link': data_json.table[i].link,
                  };
                  break;
                  default:
                  StoriesDict[data_json.table[i].story_id] = {
                      'type': data_json.table[i].type_,
                      'media_key': data_json.table[i].link,
                      'link': data_json.table[i].link,
                  };
              }

          }
        });
}
