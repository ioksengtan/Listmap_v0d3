
var appUrl = '/api';

        $(document).ready(
          function() {
            $.get(appUrl, { command: 'getRecentStories' }, function(data) {
                     console.log(data);
                     for(i in data.table){
                       addGPStoryList(DivStoriesList, data.table[i], 'prepend')
                    }
          })
        });



function addMarker() {
  //google.maps.Marker.prototype.getDraggable = function() { return false; };
  marker = new google.maps.Marker({
    position: {lat:25.0489782,lng:121.5208181},
    map: map
  });
  //MarkerClusterer.prototype.getDraggable = function() { return false; };
  markerCluster.addMarkers(marker, true);
}

function get_landmarks_by_story_id(story_id){
  console.log('get_landmarks_by_story_id');
  console.log(story_id);
  $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: story_id }, function(data) {
           console.log(data);
           var data_json = data;
           var gps_locations = [];
           for(i in data_json.table){
              gps_locations.push(
                {
                  lat:data_json.table[i].lat,
                  lng:data_json.table[i].lng,
                  name:data_json.table[i].name,
                  content:data_json.table[i].content,
                  link:data_json.table[i].link
                }
              )
            }
            refreshMap(gps_locations);
           //addMarker({lat:25.0489782,lng:121.5208181});
         });
  /*[{
          lat: 25.0682519,
          lng: 121.5922095
      },
  ]*/


}

function addGPStoryList(div_id_to_add, data_to_append, where_to_add){
  //console.log(data_to_append);
    gpstory_what = data_to_append.what;
    gpstory_where = data_to_append.where;
    gpstory_title = data_to_append.title;
    gpstory_link = data_to_append.link;
    gpstory_avatar = data_to_append.avatar;
    gpstory_author = data_to_append.author;
    gpstory_tags = data_to_append.tags;
    gpstory_thumbnail = data_to_append.thumbnail;
    gpstory_story_id = data_to_append.story_id;
    gpstory_type = data_to_append.type;

    html_reg = '';
    html_reg += "<div class=\"gpstory_list\">";
    html_reg += "   <div class=\"gpstory_info\">";
    html_reg += "      <div class=\"gpstory_source\">"+gpstory_what + " @ </span><span class=\"gpstory_location\">" + gpstory_where + "</div>";
    html_reg += "      <div class=\"gpstory_header\">";
    html_reg += "      <input type=\"checkbox\" aria-label=\"Checkbox for following text input\">";
    switch(gpstory_type){
      case 'youtube':
        html_reg += "      <span class=\"gpstory_title\"><a href=\"javascript:get_landmarks_by_story_id("+ gpstory_story_id +")\">" + gpstory_title + "</a> <br/></span><span>(" + "<a href=\""+ gpstory_link +"\"><img src=\"youtube_icon.png\"/></a>" +")(<a href=\"\"><img src=\"add_list.png\"/></a>)</span>";
        break;
      case 'book':
        html_reg += "      <span class=\"gpstory_title\"><a href=\"javascript:get_landmarks_by_story_id("+ gpstory_story_id +")\">" + gpstory_title + "</a> <br/></span><span>(" + "<a href=\""+ gpstory_link +"\"><img src=\"book_icon.png\"/></a>" +")(<a href=\"\"><img src=\"add_list.png\"/></a>)</span>";
        break;
      case 'blog':
        html_reg += "      <span class=\"gpstory_title\"><a href=\"javascript:get_landmarks_by_story_id("+ gpstory_story_id +")\">" + gpstory_title + "</a> <br/></span><span>(" + "<a href=\""+ gpstory_link +"\"><img src=\"webpage_icon.png\"/></a>" +")(<a href=\"\"><img src=\"add_list.png\"/></a>)</span>";
        break;
      default:
        html_reg += "      <span class=\"gpstory_title\"><a href=\"javascript:get_landmarks_by_story_id("+ gpstory_story_id +")\">" + gpstory_title + "</a> <br/></span><span>(" + "<a href=\""+ gpstory_link +"\"><img src=\"webpage_icon.png\"/></a>" +")(<a href=\"\"><img src=\"add_list.png\"/></a>)</span>";
  }
    html_reg += "      </div>";

    html_reg += "      <div class=\"gpstory_author\">";
    html_reg += "         <a href=\"\">";
    html_reg += "         <img src=\"" + gpstory_avatar + "\" class=\"rounded-circle z-depth-0\" alt=\"avatar image\" height=\"35\"><span class=\"gpstory_author_name\">";
    html_reg += "         " + gpstory_author ;
    html_reg += "         </span></a>";
    html_reg += "      </div>";
    html_reg += "      <div class=\"gpstory_tags\">";
    html_reg += "         <ul>";
    tags = gpstory_tags.trim().split(",");
    for(i=0;i<tags.length;i++){
        if(tags[i] == ''){
          continue;
        }else{
          html_reg += "            <button type=\"button\"> " + tags[i] + "</button>";
      }
    //html_reg += "            <li><a href=\"\">#blog</a></li>";
    //html_reg += "            <li><a href=\"\">#taipei</a></li>";
    //tml_reg += "            <li><a href=\"\">#malaysia</a></li>";
    }
    html_reg += "         </ul>";
    html_reg += "      </div>";
    html_reg += "   </div>";
    //html_reg += "   <div class=\"gpstory_thumbnail\"><img src=\"" + gpstory_thumbnail + "\" /></div>";
    html_reg += "</div>";
    if(where_to_add == 'prepend'){
      $(div_id_to_add).prepend(html_reg);
    }else if (where_to_ad == 'append'){
      //$(div_id_to_append).
    }
  /*

  */
}
function refreshMap(locations) {
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
locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
           //.forEach(item => mymap.addLayer(item));
           .forEach(item => markers.addLayer(item));
var baseMaps = {
    "Streets": streets
};

var overlayMaps = {
    "Landmarks": markers
};
mymap.addLayer(markers);
//mymap.rem
mymap.removeControl(p_control);
//p_control.removeFrom(mymap);
p_control = L.control.layers(baseMaps, overlayMaps).addTo(mymap);
  /*
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'pk.eyJ1IjoiaW9rc2VuZ3RhbiIsImEiOiJja3JkeTgxMHI1Z3B2MzFxcHM0NWo3cTEwIn0.kkcIlaMdiTpqqaCk6YpOgQ'
}).addTo(mymap);
*/
/*mymap.setLayoutProperty('country-label', 'text-field', [
'get',
'name_zh-Hant'
]);
*/
/*
var markers = L.markerClusterGroup();

locations.map(item => L.marker(new L.LatLng(item.lat, item.lng)))
           //.forEach(item => mymap.addLayer(item));
           .forEach(item => markers.addLayer(item));
mymap.addLayer(markers);
*/
  /*
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
    for (location_id in locations){
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
      position: {lat:25.0489782,lng:121.5208181},
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
    */
}

const locations = [{
        lat: 25.0682519,
        lng: 121.5922095
    },
    {
        lat: 25.0283965,
        lng: 121.5068964
    },
    {
        lat: 25.0226797,
        lng: 121.5238418
    },
    {
        lat: 25.0591691,
        lng: 121.5120921
    },
    {
        lat: 25.0569105,
        lng: 121.5163941
    },
    {
        lat: 25.0660605,
        lng: 121.5151127
    },
    {
        lat: 25.0742632,
        lng: 121.5132821
    },
    {
        lat: 25.0643845,
        lng: 121.5335046
    },
    {
        lat: 25.050222,
        lng: 121.521047
    },
    {
        lat: 25.0633695,
        lng: 121.5271941
    },
    {
        lat: 25.0818499,
        lng: 121.546687
    },
    {
        lat: 25.0571815,
        lng: 121.5515189
    },
    {
        lat: 25.054349,
        lng: 121.551818
    },
    {
        lat: 25.0484265,
        lng: 121.5458399
    },
    {
        lat: 25.0498467,
        lng: 121.5768498
    },
    {
        lat: 25.0593151,
        lng: 121.5629083
    },
    {
        lat: 25.0385256,
        lng: 121.5023346
    },
    {
        lat: 25.0369298,
        lng: 121.4954589
    },
    {
        lat: 25.0321933,
        lng: 121.5017185
    },
    {
        lat: 25.0277082,
        lng: 121.4957664
    },
    {
        lat: 25.02273,
        lng: 121.4981146
    },
    {
        lat: 25.0290753,
        lng: 121.5611877
    },
    {
        lat: 25.0290753,
        lng: 121.5611877
    },
    {
        lat: 25.0243196,
        lng: 121.5688375
    },
    {
        lat: 25.0243196,
        lng: 121.5688375
    },
    {
        lat: 25.0430691,
        lng: 121.5775774
    },
    {
        lat: 25.0430691,
        lng: 121.5775774
    },
    {
        lat: 25.0960267,
        lng: 121.5307658
    },
    {
        lat: 25.1239268,
        lng: 121.5331959
    },
    {
        lat: 25.0958292,
        lng: 121.5182994
    },
    {
        lat: 25.0823049,
        lng: 121.5107816
    },
    {
        lat: 40.6903213,
        lng: -73.9271644
    },
    {
        lat: 25.1279397,
        lng: 121.5072462
    },
    {
        lat: 25.136298,
        lng: 121.506296
    },
    {
        lat: 25.1456025,
        lng: 121.4931623
    },
    {
        lat: 25.1410198,
        lng: 121.4894972
    },
    {
        lat: 25.1188949,
        lng: 121.5210654
    },
    {
        lat: 25.119306,
        lng: 121.5083849
    },
    {
        lat: 25.1130643,
        lng: 121.5227629
    },
    {
        lat: 25.117352,
        lng: 121.463494
    },
    {
        lat: 25.0824173,
        lng: 121.5664945
    },
    {
        lat: 25.0787172,
        lng: 121.5772693
    },
    {
        lat: 25.0693188,
        lng: 121.5890863
    },
    {
        lat: 25.0674149,
        lng: 121.61261
    },
    {
        lat: 25.0446945,
        lng: 121.6172717
    },
    {
        lat: 25.0549316,
        lng: 121.6080403
    },
    {
        lat: 25.0475755,
        lng: 121.5869666
    },
    {
        lat: 25.0539922,
        lng: 121.5944653
    },
    {
        lat: 25.041307,
        lng: 121.6194827
    },
    {
        lat: 24.9899285,
        lng: 121.5419019
    },
    {
        lat: 24.9877578,
        lng: 121.5509399
    },
    {
        lat: 24.9875252,
        lng: 121.5608752
    },
    {
        lat: 24.988513,
        lng: 121.56916
    },
    {
        lat: 24.9796285,
        lng: 121.5563143
    },
    {
        lat: 25.002215,
        lng: 121.569178
    },
    {
        lat: 24.988685,
        lng: 121.576501
    },
    {
        lat: 25.0036073,
        lng: 121.5363451
    },
    {
        lat: 25.0014966,
        lng: 121.5515751
    },
    {
        lat: 40.6166766,
        lng: -73.8272029
    },
    {
        lat: 23.199298,
        lng: 119.428106
    },
    {
        lat: 25.1311685,
        lng: 121.4519806
    },
    {
        lat: 22.6423591,
        lng: 120.3112491
    },
    {
        lat: 22.6495346,
        lng: 120.3049696
    },
    {
        lat: 25.060706,
        lng: 121.484221
    },
    {
        lat: 25.0664309,
        lng: 121.4772299
    },
    {
        lat: 25.0941603,
        lng: 121.5261352
    },
    {
        lat: 25.1004265,
        lng: 121.5498091
    },
    {
        lat: 25.0552535,
        lng: 121.5199792
    },
    {
        lat: 25.057658,
        lng: 121.512548
    },
    {
        lat: 25.0519592,
        lng: 121.517678
    },
    {
        lat: 25.055805,
        lng: 121.519493
    },
    {
        lat: 25.0533731,
        lng: 121.5152475
    },
    {
        lat: 25.0589342,
        lng: 121.5095108
    },
    {
        lat: 25.0546325,
        lng: 121.509949
    },
    {
        lat: 25.0546552,
        lng: 121.5099947
    },
    {
        lat: 25.0500376,
        lng: 121.5161359
    },
    {
        lat: 25.037412,
        lng: 121.540381
    },
    {
        lat: 25.0385392,
        lng: 121.5556734
    },
    {
        lat: 25.020776,
        lng: 121.531081
    },
    {
        lat: 25.0245572,
        lng: 121.5462911
    },
    {
        lat: 25.0422819,
        lng: 121.5495494
    },
    {
        lat: 25.0440921,
        lng: 121.5498987
    },
    {
        lat: 25.028439,
        lng: 121.530451
    },
    {
        lat: 25.034678,
        lng: 121.525436
    },
    {
        lat: 25.0339379,
        lng: 121.5362421
    },
    {
        lat: 25.0246528,
        lng: 121.5281006
    },
    {
        lat: 25.0441952,
        lng: 121.5451715
    },
    {
        lat: 25.0431793,
        lng: 121.5431107
    },
    {
        lat: 25.0274335,
        lng: 121.5437284
    },
    {
        lat: 25.024457,
        lng: 121.53445
    },
    {
        lat: 25.024206,
        lng: 121.533971
    },
    {
        lat: 25.0204987,
        lng: 121.533661
    },
    {
        lat: 25.0192535,
        lng: 121.5334011
    },
    {
        lat: 25.0190805,
        lng: 121.5331221
    },
    {
        lat: 25.0180733,
        lng: 121.533334
    },
    {
        lat: 25.0171286,
        lng: 121.5329732
    },
    {
        lat: 25.0232101,
        lng: 121.5331756
    },
    {
        lat: 25.0232101,
        lng: 121.5331756
    },
    {
        lat: 25.0275203,
        lng: 121.5399706
    },
    {
        lat: 25.0295239,
        lng: 121.5560614
    },
    {
        lat: 25.018133,
        lng: 121.529168
    },
    {
        lat: 25.0182233,
        lng: 121.5325864
    },
    {
        lat: 25.0177209,
        lng: 121.531625
    },
    {
        lat: 25.0175439,
        lng: 121.5319041
    },
    {
        lat: 25.0175243,
        lng: 121.5327721
    },
    {
        lat: 25.0118672,
        lng: 121.5370857
    },
    {
        lat: 25.02124,
        lng: 121.5383578
    },
    {
        lat: 25.02124,
        lng: 121.5383578
    },
    {
        lat: 24.2346189,
        lng: 120.623043
    },
    {
        lat: 24.8817296,
        lng: 121.2870699
    },
    {
        lat: 25.0569682,
        lng: 121.5222262
    },
    {
        lat: 25.049113,
        lng: 121.5220352
    },
    {
        lat: 25.048535,
        lng: 121.520437
    },
    {
        lat: 25.0725778,
        lng: 121.5248468
    },
    {
        lat: 25.0510565,
        lng: 121.5342143
    },
    {
        lat: 25.0526354,
        lng: 121.5213719
    },
    {
        lat: 25.0612324,
        lng: 121.537369
    },
    {
        lat: 25.0451525,
        lng: 121.5280348
    },
    {
        lat: 25.036731,
        lng: 121.519033
    },
    {
        lat: 25.0352575,
        lng: 121.5182302
    },
    {
        lat: 25.0385437,
        lng: 121.5307324
    },
    {
        lat: 25.0215579,
        lng: 121.5205341
    },
    {
        lat: 25.0383413,
        lng: 121.508384
    },
    {
        lat: 25.0228333,
        lng: 121.5245588
    },
    {
        lat: 25.0399941,
        lng: 121.510812
    },
    {
        lat: 25.0439064,
        lng: 121.522324
    },
    {
        lat: 25.031454,
        lng: 121.511227
    },
    {
        lat: 25.030798,
        lng: 121.5160181
    },
    {
        lat: 25.0272932,
        lng: 121.5184129
    },
    {
        lat: 25.0272271,
        lng: 121.5184051
    },
    {
        lat: 25.041538,
        lng: 121.513264
    },
    {
        lat: 25.044526,
        lng: 121.513378
    },
    {
        lat: 25.044526,
        lng: 121.513378
    },
    {
        lat: 25.044526,
        lng: 121.513378
    },
    {
        lat: 25.043041,
        lng: 121.513371
    },
    {
        lat: 25.0311993,
        lng: 121.5149255
    },
    {
        lat: 25.0474165,
        lng: 121.5114405
    },
    {
        lat: 25.0474165,
        lng: 121.5114405
    },
    {
        lat: 25.0413811,
        lng: 121.5319785
    },
    {
        lat: 25.1314803,
        lng: 121.7457496
    },
    {
        lat: 25.042337,
        lng: 121.510994
    },
    {
        lat: 25.0412049,
        lng: 121.5304087
    },
    {
        lat: 25.0444351,
        lng: 121.5216322
    },
    {
        lat: 25.0448598,
        lng: 121.514066
    },
    {
        lat: 25.0300117,
        lng: 121.5198939
    },
    {
        lat: 25.0164896,
        lng: 121.5308321
    },
    {
        lat: 25.0166998,
        lng: 121.5305298
    },
    {
        lat: 25.016281,
        lng: 121.532434
    },
    {
        lat: 25.016281,
        lng: 121.532434
    },
    {
        lat: 25.016281,
        lng: 121.532434
    },
    {
        lat: 24.8051818,
        lng: 120.9698834
    },
    {
        lat: 22.991034,
        lng: 120.2027121
    },
    {
        lat: 23.0001728,
        lng: 120.196047
    },
    {
        lat: 22.9822734,
        lng: 120.2039322
    },
    {
        lat: 22.9895372,
        lng: 120.2048037
    },
    {
        lat: 22.9830358,
        lng: 120.2056258
    },
    {
        lat: 22.9933252,
        lng: 120.2099472
    },
    {
        lat: 22.9968655,
        lng: 120.1895015
    },
    {
        lat: 24.9874438,
        lng: 121.5091234
    },
    {
        lat: 24.1456432,
        lng: 120.6820764
    },
    {
        lat: 24.1409085,
        lng: 120.6811848
    },
    {
        lat: 24.1406836,
        lng: 120.6796343
    },
    {
        lat: 24.1375604,
        lng: 120.6805365
    },
    {
        lat: 24.8053601,
        lng: 120.96571
    },
    {
        lat: 24.960985,
        lng: 121.211299
    },
    {
        lat: 24.9665867,
        lng: 121.2611053
    },
    {
        lat: 24.9699601,
        lng: 121.2634589
    },
    {
        lat: 25.129963,
        lng: 121.743219
    },
    {
        lat: 22.9575919,
        lng: 120.2294852
    },
    {
        lat: 23.695177,
        lng: 120.5243985
    },
    {
        lat: 23.7060262,
        lng: 120.5368372
    },
    {
        lat: 23.7043445,
        lng: 120.5441934
    },
    {
        lat: 24.1640452,
        lng: 120.6893357
    },
    {
        lat: 24.1659846,
        lng: 120.6928431
    },
    {
        lat: 24.176616,
        lng: 120.699226
    },
    {
        lat: 24.1761693,
        lng: 120.7125012
    },
    {
        lat: 25.1310129,
        lng: 121.4984101
    },
    {
        lat: 25.116355,
        lng: 121.5156726
    },
    {
        lat: 25.1214556,
        lng: 121.5046448
    },
    {
        lat: 24.700782,
        lng: 121.0544053
    },
    {
        lat: 24.1554831,
        lng: 120.6768617
    },
    {
        lat: 24.1564828,
        lng: 120.6687758
    },
    {
        lat: 24.1555154,
        lng: 120.6754987
    },
    {
        lat: 24.1668302,
        lng: 120.6847611
    },
    {
        lat: 25.022187,
        lng: 121.5293173
    },
    {
        lat: 22.7602735,
        lng: 121.1449734
    },
    {
        lat: 22.7412129,
        lng: 121.1389777
    },
    {
        lat: 22.7551021,
        lng: 121.1563592
    },
    {
        lat: 22.9944883,
        lng: 120.2179582
    },
    {
        lat: 24.956238,
        lng: 121.204788
    },
    {
        lat: 24.8959194,
        lng: 121.2262553
    },
    {
        lat: 23.5238377,
        lng: 120.4391664
    },
    {
        lat: 24.9991192,
        lng: 121.5164354
    },
    {
        lat: 25.0162879,
        lng: 121.511092
    },
    {
        lat: 24.9972641,
        lng: 121.5200182
    },
    {
        lat: 24.7841648,
        lng: 121.0142698
    },
    {
        lat: 24.792968,
        lng: 120.9931349
    },
    {
        lat: 23.1238483,
        lng: 121.2177059
    },
    {
        lat: 24.8156261,
        lng: 121.0193081
    },
    {
        lat: 24.812049,
        lng: 121.027269
    },
    {
        lat: 24.8176877,
        lng: 121.0231148
    },
    {
        lat: 24.8106996,
        lng: 121.0292358
    },
    {
        lat: 24.7304202,
        lng: 121.0891022
    },
    {
        lat: 24.7265224,
        lng: 121.0935633
    },
    {
        lat: 24.689511,
        lng: 120.8777104
    },
    {
        lat: 24.6953479,
        lng: 120.8782339
    },
    {
        lat: 24.1827712,
        lng: 120.6469525
    },
    {
        lat: 24.16126,
        lng: 120.655553
    },
    {
        lat: 24.1674344,
        lng: 120.636
    },
    {
        lat: 24.1450419,
        lng: 120.6601351
    },
    {
        lat: 24.1398577,
        lng: 120.6634124
    },
    {
        lat: 23.4834866,
        lng: 120.4428981
    },
    {
        lat: 24.1670263,
        lng: 120.6426242
    },
    {
        lat: 24.1487533,
        lng: 120.6683257
    },
    {
        lat: 24.1429354,
        lng: 120.6738473
    },
    {
        lat: 24.1477666,
        lng: 120.6633342
    },
    {
        lat: 23.474144,
        lng: 120.4486269
    },
    {
        lat: 24.1595211,
        lng: 120.6605758
    },
    {
        lat: 23.4790623,
        lng: 120.444061
    },
    {
        lat: 24.2133461,
        lng: 120.5786953
    },
    {
        lat: 25.0265013,
        lng: 121.5248283
    },
    {
        lat: 24.755405,
        lng: 121.7579296
    },
    {
        lat: 24.7462924,
        lng: 121.7475856
    },
    {
        lat: 24.7379522,
        lng: 121.744175
    },
    {
        lat: 24.7596713,
        lng: 121.7514104
    },
    {
        lat: 25.042943,
        lng: 121.5408841
    },
    {
        lat: 24.1345009,
        lng: 120.685543
    },
    {
        lat: 23.4841924,
        lng: 120.4541764
    },
    {
        lat: 22.99575,
        lng: 120.2135263
    },
    {
        lat: 24.8016243,
        lng: 120.9669818
    },
    {
        lat: 22.975431,
        lng: 120.222524
    },
    {
        lat: 23.4788619,
        lng: 120.4631127
    },
    {
        lat: 24.1435031,
        lng: 120.6861307
    },
    {
        lat: 25.0604263,
        lng: 121.5578459
    },
    {
        lat: 25.0489486,
        lng: 121.5442353
    },
    {
        lat: 25.0505752,
        lng: 121.5755728
    },
    {
        lat: 25.0065143,
        lng: 121.4505252
    },
    {
        lat: 23.9768578,
        lng: 121.6074042
    },
    {
        lat: 23.98301,
        lng: 121.6068674
    },
    {
        lat: 23.7097413,
        lng: 120.4359657
    },
    {
        lat: 23.71383318,
        lng: 120.4216383
    },
    {
        lat: 24.4565774,
        lng: 118.3058515
    },
    {
        lat: 23.3149815,
        lng: 121.4498019
    },
    {
        lat: 25.0436839,
        lng: 121.55935
    },
    {
        lat: 25.0436839,
        lng: 121.55935
    },
    {
        lat: 25.0318988,
        lng: 121.5581902
    },
    {
        lat: 22.6041729,
        lng: 120.3026698
    },
    {
        lat: 24.1544679,
        lng: 120.6359409
    },
    {
        lat: 22.9823386,
        lng: 120.1964916
    },
    {
        lat: 24.132532,
        lng: 120.6791404
    },
    {
        lat: 25.042674,
        lng: 121.6120418
    },
    {
        lat: 22.006156,
        lng: 120.7493977
    },
    {
        lat: 24.8009426,
        lng: 120.9945776
    },
    {
        lat: 24.7987354,
        lng: 120.9966537
    },
    {
        lat: 24.796281,
        lng: 120.998491
    },
    {
        lat: 22.9007721,
        lng: 120.5393745
    },
    {
        lat: 24.4401427,
        lng: 120.6516593
    },
    {
        lat: 22.6201079,
        lng: 120.3040396
    },
    {
        lat: 22.6157949,
        lng: 120.2950138
    },
    {
        lat: 22.6176864,
        lng: 120.3246654
    },
    {
        lat: 22.6259337,
        lng: 120.3278833
    },
    {
        lat: 24.5668243,
        lng: 120.8235708
    },
    {
        lat: 24.5600242,
        lng: 120.8161011
    },
    {
        lat: 24.7941539,
        lng: 120.9663113
    },
    {
        lat: 24.7229,
        lng: 121.7218837
    },
    {
        lat: 23.9587157,
        lng: 120.5719123
    },
    {
        lat: 23.9642967,
        lng: 120.9655253
    },
    {
        lat: 23.9808885,
        lng: 120.955959
    },
    {
        lat: 24.9851965,
        lng: 121.3141134
    },
    {
        lat: 24.9841296,
        lng: 121.2888057
    },
    {
        lat: 24.0367767,
        lng: 120.6433361
    },
    {
        lat: 23.979651,
        lng: 120.684514
    },
    {
        lat: 25.0548618,
        lng: 121.9272358
    },
    {
        lat: 23.5666168,
        lng: 119.5671161
    },
    {
        lat: 23.568478,
        lng: 119.569448
    },
    {
        lat: 26.1679304,
        lng: 119.9516788
    },
    {
        lat: 25.1690298,
        lng: 121.4423064
    },
    {
        lat: 25.1717828,
        lng: 121.4399531
    },
    {
        lat: 24.2698911,
        lng: 120.5769881
    },
    {
        lat: 24.0512724,
        lng: 120.4348651
    },
    {
        lat: 23.748215,
        lng: 120.253582
    },
    {
        lat: 24.8045649,
        lng: 120.9620176
    },
    {
        lat: 25.0002909,
        lng: 121.510329
    },
    {
        lat: 24.983159,
        lng: 121.535581
    },
    {
        lat: 24.971495,
        lng: 121.10289
    },
    {
        lat: 22.6306268,
        lng: 120.31557
    },
    {
        lat: 22.622941,
        lng: 120.3059
    },
    {
        lat: 23.305635,
        lng: 120.320124
    },
    {
        lat: 24.9100305,
        lng: 121.178598
    },
    {
        lat: 22.728685,
        lng: 120.329843
    },
    {
        lat: 23.852753,
        lng: 120.495743
    },
    {
        lat: 25.1062008,
        lng: 121.8419737
    },
    {
        lat: 25.0250626,
        lng: 121.4951639
    },
    {
        lat: 25.0364306,
        lng: 121.5005323
    },
    {
        lat: 22.6207201,
        lng: 120.273819
    },
    {
        lat: 23.842139,
        lng: 121.503705
    },
    {
        lat: 24.0823,
        lng: 120.539382
    },
    {
        lat: 24.0789273,
        lng: 120.541152
    },
    {
        lat: 22.0944077,
        lng: 120.7450337
    },
    {
        lat: 22.7084634,
        lng: 120.6508369
    },
    {
        lat: 22.6263126,
        lng: 120.3544838
    },
    {
        lat: 24.7962374,
        lng: 120.9831449
    },
    {
        lat: 24.1885919,
        lng: 120.5935599
    },
    {
        lat: 24.252642,
        lng: 120.7333747
    },
    {
        lat: 24.675578,
        lng: 121.7693506
    },
    {
        lat: 24.6798201,
        lng: 121.768148
    },
    {
        lat: 24.7890413,
        lng: 121.1763327
    },
    {
        lat: 24.0561319,
        lng: 120.6965026
    },
    {
        lat: 25.0500111,
        lng: 121.2994374
    },
    {
        lat: 25.0865013,
        lng: 121.467951
    },
    {
        lat: 24.5956036,
        lng: 121.8454768
    },
    {
        lat: 24.5825897,
        lng: 121.8679783
    },
    {
        lat: 24.8025449,
        lng: 120.9808697
    },
    {
        lat: 22.6230637,
        lng: 120.2837276
    },
    {
        lat: 22.618516,
        lng: 120.285212
    },
    {
        lat: 22.623956,
        lng: 120.283544
    },
    {
        lat: 22.6242273,
        lng: 120.2846004
    },

];
