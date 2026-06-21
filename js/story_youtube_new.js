//$.getScript('http://www.youtube.com/iframe_api');
var appUrl = '/api';
//https://docs.google.com/spreadsheets/d/1GNvkC8t3xua_ibN2GnnXJi-MXasuX5SXb4y1G6idFSc/edit?usp=sharing
var scriptUrl = 'https:\/\/www.youtube.com\/s\/player\/87b9576a\/www-widgetapi.vflset\/www-widgetapi.js';
try {
    var ttPolicy = window.trustedTypes.createPolicy("youtube-widget-api", {
        createScriptURL: function(x) {
            return x
        }
    });
    scriptUrl = ttPolicy.createScriptURL(scriptUrl)
} catch (e) {}
if (!window["YT"]) var YT = {
    loading: 0,
    loaded: 0
};
if (!window["YTConfig"]) var YTConfig = {
    "host": "https://www.youtube.com"
};
if (!YT.loading) {
    YT.loading = 1;
    (function() {
        var l = [];
        YT.ready = function(f) {
            if (YT.loaded) f();
            else l.push(f)
        };
        window.onYTReady = function() {
            YT.loaded = 1;
            for (var i = 0; i < l.length; i++) try {
                l[i]()
            } catch (e$0) {}
        };
        YT.setConfig = function(c) {
            for (var k in c)
                if (c.hasOwnProperty(k)) YTConfig[k] = c[k]
        };
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.id = "www-widgetapi-script";
        a.src = scriptUrl;
        a.async = true;
        var c = document.currentScript;
        if (c) {
            var n = c.nonce || c.getAttribute("nonce");
            if (n) a.setAttribute("nonce", n)
        }
        var b =
            document.getElementsByTagName("script")[0];
        b.parentNode.insertBefore(a, b)
    })()
};

var youtube_players = {}
var player;

function onYouTubePlayerAPIReady() {


    /*
      player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'EVNTyuZrAlg',
          playerVars: { 'start': 159, 'autoplay': 1, 'controls': 1 },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
        }

      });
      */
}

function update_db() {
    /*
      var landmarks_json = [
        {
          name:"test name",
          flags:"test flags",
          address:"test address",
          notes:"test notes",
          lat_lng:"23, 12",
          link:"2:3"
        },
        {
          name:"test name 2",
          flags:"test flags 2",
          address:"test address 2",
          notes:"test notes 2",
          lat_lng:"1, 2",
          link:"1:30"
        }
      ];
    */
    var landmarks_json = [];

    for (let [key, value] of Object.entries(LandmarkdView)) {
        tmp = {
            name: "",
            flags: "",
            address: "",
            notes: "",
            lat_lng: "",
            link: "0:0"
        }
        for (let [landmark_key, landmark_value] of Object.entries(value)) {
            tmp[landmark_key] = landmark_value;
        }
        landmarks_json.push(tmp);
    }

    //console.log(landmarks_json);
    var videoId = window.location.search.split('?')[1].split('=')[1];
    var parameter = {
        command: "new_story",
        name: youtube_title,
        types: "youtube",
        link: "https://www.youtube.com/watch?v=" + videoId,
        landmarks: JSON.stringify(landmarks_json),
        author: youtube_channel,
        tags:$('#text-input-tags').val()
    }
    //console.log(parameter);
    /*
          var parameter = {            command: "getRecentStories",

          };
    */

    $.post(appUrl, parameter, function(data) {
        console.log(data);
        window.location.replace("stories.html");
    });

}

function utility() {
    if (utility_display) {
        utility_display = false;
        $('#utility').hide();
    } else {
        utility_display = true;
        $('#utility').show();
    }
}

function dragElement(elmnt) {
    console.log('drag');
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;


    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    document.getElementById("collapse_ul_0").onmousedown = dragMouseDown;
    document.getElementById("youtube_window").onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        console.log('dragMouseDown');
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
var utility_display = false;
$(document).ready(
    /*
    setTimeout(function(){
        get_landmarks_by_story_id(164);
    },1000);
    */


    function() {


        $('#utility').hide()
        dragElement(document.getElementById("mydiv"));
        dragElement(document.getElementById("youtube_window"));
        //get_landmarks_by_story_id(164);
        var query = window.location.search.split('?')[1];
        if(query.includes('&')){
          alert('error: only one argument in query is supported');
        }else{
          var cmd = query.split('=')[0];
          switch(cmd){
            case 'yt_id':
              var videoId = window.location.search.split('?')[1].split('=')[1];
              video_id = videoId;
              var appYoutube = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=AIzaSyCsiStpIlMr_0RhLo9gvJ_gUjjpCRvPXmk'
              $.get(appYoutube, function(data) {
                  tmp = data;
                  youtube_title = data.items[0].snippet.title;
                  youtube_channel = data.items[0].snippet.channelTitle;
                  youtube_published = data.items[0].snippet.publishedAt;
                  youtube_description = data.items[0].snippet.description;
                  $('#heading_0').html(youtube_title);
                  get_landmarks_by_story_id(0);
              })
              break;
            case 'story_id':
            var parameter = {
                command: "get_story_and_landmarks_by_story_id",
                story_id: query.split('=')[1]
            }

              $.get(appUrl, parameter, function(data) {
                   data_json = JSON.parse(data);
                  console.log(data);
                  var link = data_json.story[1][3];
                  video_id = link.split('=')[1];
                  tags = data_json.story[1][5];
                  youtube_title = data_json.story[1][0];
                  youtube_channel = data_json.story[1][4];
                  $('#text-input-tags').val(tags);
                  $('#heading_0').html(youtube_title);
                  output_reg = '';


                  for(var i in data_json.landmarks){
                      console.log(i);
                      if(i != 0) {
                      var name = data_json.landmarks[i][0];
                      var notes = data_json.landmarks[i][3];
                      var lat_lng = data_json.landmarks[i][5];
                      var link = data_json.landmarks[i][8];
                      mm = Math.floor(parseInt(link)/60);
                      ss = parseInt(link)%60;
                      output_reg+= i + '\nname ' + name + '\nnotes ' + notes + '\nlat_lng ' + lat_lng + '\nlink ' + mm + ':' + ss + '\n\n';
                    }
                  }
                  //$('#text-input').val(output_reg);
                  editor.getDoc().setValue(output_reg);
                  console.log(output_reg);
                  get_landmarks_by_story_id(0);


              });

              break;
            default:
              alert(cmd + " is not supported!");

          }
        }

        console.log(appYoutube);


        var editor = CodeMirror.fromTextArea(document.getElementById("text-input"), {
            lineNumbers: true,
            lineWrapping: true
        });
        editor.setSize(null, 300)
        editor.on("change", function(cm, change) {
            doc = editor.getDoc();
            text_input_on_change();
        });
        var editor_gmap = CodeMirror.fromTextArea(document.getElementById("text-input-gmap"), {
            lineNumbers: true,
            lineWrapping: true
        });
        editor_gmap.setSize(null, 30)
        editor_gmap.on("change", function(cm, change) {
            var doc_gmap = editor_gmap.getDoc();
            console.log(doc_gmap);
            var tmp2 = doc_gmap.getValue().split('@')[1].split('/')[0].split(',');
            tmp2.pop();

            $('#text-view-gmap').html(tmp2.join());
        });
        /*
        setTimeout(function() {
            get_landmarks_by_story_id(0);
        }, 3000);
        */
    }

    //get_landmarks_by_story_id(164);

);

var markers = [];

function text_input_on_change() {
    //preview.innerHTML = "";
    content = doc.getValue();
    //console.log(content);
    LandmarkdView = str2view(content);
    //console.log(LandmarkdView);
    html_reg = '';
    html_reg += '<ul>';

    for (i in markers) {
        mymap.removeLayer(markers[i]);
    }

    for (let [key, value] of Object.entries(LandmarkdView)) {

        html_reg += '<li>' + LandmarkdView[key].name;
        if ('lat_lng' in LandmarkdView[key]) {
            var lat = LandmarkdView[key].lat_lng.split(',')[0];
            var lng = LandmarkdView[key].lat_lng.split(',')[1];
            //https://www.google.com/maps/place/%E6%96%B0%E7%AB%B9%E8%87%BA%E5%A4%A7%E5%88%86%E9%99%A2%E6%96%B0%E7%AB%B9%E9%86%AB%E9%99%A2/@24.8158818,120.9806239,15z/data=!4m2!3m1!1s0x0:0x92e23500cc39e11e?sa=X&ved=2ahUKEwj6--ve9NH3AhXumFYBHXSIBFgQ_BJ6BAheEAU
            /*
            if('@' in  LandmarkdView[key].lat_lng){

            }else{

            }
            */
            markers.push(L.marker([lat, lng]).addTo(mymap).bindPopup(LandmarkdView[key].name).openPopup());

            html_reg += '<a href=\"javascript:flyto(' + lat + ',' + lng + ')\">(' + lat + ',' + lng + ')</a>';
        } else {
            html_reg += '(NaN, NaN)';
        }
        if ('link' in LandmarkdView[key]) {
            var mm = parseInt(LandmarkdView[key].link.split(':')[0]);
            var nn = parseInt(LandmarkdView[key].link.split(':')[1]);
            var ss = mm * 60 + nn;
            html_reg += '<a href=\"javascript:seekto(' + 0 + ',' + ss + ')\">(t=' + mm + 'm' + nn + 's)</a>';
        } else {
            html_reg += '(t=' + 'NaN' + 'm' + 'NaN' + 's)';
        }



        html_reg += '</li>'
    }
    html_reg += '</ul>';
    $('#text-view').html(html_reg);
    //[ListMdppObject, ListDiv] = mdpp2ListDiv(content);
    /*
          ListDiv2StaticDisplay(ListMdppObject, ListDiv, $('#preview'));
          for (var i = 0; i < ListMdppObject.length; i++) {
              DynamicDisplay(ListMdppObject, ListDiv, i);
          }
          //$('#preview').html(html_content);
          var preview_height = $('#preview').height();
          if (preview_height < 500) preview_height = 500;

          $('.AutoHeight').height(preview_height);
          $('img').width('70%');
          */
}

function seekto(story_id, time) {
    console.log('seekto');
    youtube_players[story_id].seekTo(time, true);
    //console.log('seekto:'+player+' '+time);
    //console.log('seekto:'+time);
    //player.seekTo(60, true);

}


function utility_proc() {
    var content = $('#text-input-utility').val().split('\n');
    console.log(content);
    var output_reg = '';
    var cnt = 1;
    for (i in content) {
        if (content[i].trim() != '') {
            //output_reg += cnt + '\n';
            output_reg += '#\n';
            output_reg += 'name ' + content[i] + '\n';
            output_reg += 'notes\n';
            output_reg += 'lat_lng 0,0\n';
            output_reg += 'link 0:0\n\n'
        }
        //console.log(output_reg);
        cnt += 1;
    }
    console.log(output_reg);
    $('#text-input-utility').val(output_reg);
}

function str2view(content) {
    var cmd = content.split('\n');
    var LandmarkdView = {};
    var reg = {};
    var curr_id = 0;
    for (i = 0; i < cmd.length; i++) {

        //console.log('cmd:'+cmd[i]);
        trim_cmd = cmd[i].trim();
        if (trim_cmd == '') {
            //console.log('continue');
            continue;
        } else if (trim_cmd == '#'/*!isNaN(parseInt(trim_cmd))*/) { //int
            if (Object.keys(reg).length != 0) {
                //console.log('store to view');
                LandmarkdView[curr_id] = reg;
                //console.log(LandmarkdView);
                reg = {};
                //curr_id = parseInt(trim_cmd);
            } else {
                //curr_id = parseInt(trim_cmd);
            }
            curr_id += 1;
        } else {
            var cmd_list = cmd[i].split(' ');
            var header = cmd_list[0];
            //console.log(cmd_list);
            cmd_list.shift();
            var content = cmd_list.join(' ');
            reg[header] = content;
            //console.log('store to reg');
        }
    } //end of for
    if (Object.keys(reg).length != 0) {
        LandmarkdView[curr_id] = reg;
        reg = {}
        //console.log('store last reg to view');
    }
    return LandmarkdView;
}

function onPlayerStateChange(evt) {
    if (evt.data == 1) {
        // this will seek to a certain point when video starts
        // but you're better off using 'start' parameter
        // player.seekTo(22);
    }
}

function onPlayerReady(evt) {

    // doesn't work here
    // player.seekTo(30);

    // lets make ure we have a function
    //alert("typeof(player.SeekTo) = " + typeof(player.seekTo));
}

function seekto(story_id, time) {
    console.log('seekto');
    youtube_players[story_id].seekTo(time, true);
    //console.log('seekto:'+player+' '+time);
    //console.log('seekto:'+time);
    //player.seekTo(60, true);

}

function append_stories_list(div_id_to_add, data_to_append, where_to_add, id_div) {
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
    myapp_type = data_to_append.types;

    //html_reg = get_html_reg();

    html_reg = '';
    html_reg += '<div class=\"accordion\" id=\"accordionExample\" >';
    html_reg += '   <div class=\"accordion-item\" ">';
    html_reg += '     <h2 class=\"accordion-header\" id=\"heading_' + myapp_story_id + '\" style="padding:10px;font-size:16px">';
    html_reg += '       <button style="width:50px;float:right;height:100%;padding:0;background:white;box-shadow:none" class=\"accordion-button\" type=\"button\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse_' + myapp_story_id + '\" aria-expanded=\"true\" aria-controls=\"collapse_' + myapp_story_id + '\">';
    html_reg += '       </button>';

    switch (myapp_type) {
        case 'podcast':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/podcast_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'youtube':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/youtube_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'webpage':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/webpage_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'facebook':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/facebook_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'image':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/image_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'instagram':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/instagram_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'gpstory':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/gpstory_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'webpage_book':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/book_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        default:
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> (type:' + myapp_type + ') <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
    }

    html_reg += '     </h2>';
    html_reg += '     <div id=\"collapse_' + myapp_story_id + '\" class=\"accordion-collapse collapse\" aria-labelledby=\"heading_' + myapp_story_id + '\" data-bs-parent=\"#accordionExample\">';
    html_reg += '       <div class=\"accordion-body\">';
    html_reg += '       </div>';
    html_reg += '       <div id=\"collapse_player_' + myapp_story_id + '\">';
    html_reg += '       </div>';
    html_reg += '       <div id=\"collapse_ul_' + myapp_story_id + '\">The landmarks are not loaded yet. Please click the story above to load from database.';
    html_reg += '       </div>';
    html_reg += '     </div>';
    html_reg += '   </div>';
    html_reg += ' </div>';

    console.log(html_reg);

    //console.log(html_reg);
    if (where_to_add == 'prepend') {
        $(div_id_to_add).prepend(html_reg);
    } else if (where_to_ad == 'append') {
        //$(div_id_to_append).
    }

    /*

    */
}

function YoutubePlayerRender(video_id){
  youtube_players[0] = new YT.Player('collapse_player_0', {
      height: '390',
      width: '640',
      videoId: video_id,
      playerVars: {
          'start': 0,
          'autoplay': 0,
          'controls': 1
      },
      events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
      }

  });
}

function get_landmarks_by_story_id(story_id) {
    console.log('get_landmarks_by_story_id');
    //console.log(story_id);
    parameter = {
        command: "get_landmarks_by_story_id",
        story_id: story_id
    };
    //$.get(appUrl, parameter, function(data) {

    //console.log(story_id);


    //var data_json_landmarks_by_story = JSON.parse(data);

    //dbg = data_json_landmarks_by_story;
    var gps_locations = [];
    content_reg = '';
    player_id = 'collapse_player_' + story_id;
    //var videoId = window.location.search.split('?')[1].split('=')[1];
    //        https://www.googleapis.com/youtube/v3/videos?part=snippet&id=nMBYrQgK4pY&key=AIzaSyCsiStpIlMr_0RhLo9gvJ_gUjjpCRvPXmk
    console.log(video_id);
    YoutubePlayerRender(video_id);

    //if (data_json_landmarks_by_story.table.length != 0) {
    if (true) {
        //console.log(content_reg)
        test_str = '#collapse_' + story_id;
        $('#collapse_ul_' + story_id).html(content_reg);
        UpdateMap(gps_locations, story_id);

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
        GotoStory(story_id, genInpt.checked)
    }


}
