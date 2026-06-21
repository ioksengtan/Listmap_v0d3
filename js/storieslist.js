//$.getScript('http://www.youtube.com/iframe_api');
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
    console.log('function:'+arguments.callee.name);
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

function onPlayerStateChange(evt) {
    console.log('function:'+arguments.callee.name);
    if (evt.data == 1) {
        // this will seek to a certain point when video starts
        // but you're better off using 'start' parameter
        // player.seekTo(22);
    }
}

function onPlayerReady(evt) {
    console.log('function:'+arguments.callee.name);
    // doesn't work here
    // player.seekTo(30);

    // lets make ure we have a function
    //alert("typeof(player.SeekTo) = " + typeof(player.seekTo));
}

function seekto(story_id, time) {
    console.log('function:'+arguments.callee.name);
    youtube_players[story_id].seekTo(time, true);
    //console.log('seekto:'+player+' '+time);
    //console.log('seekto:'+time);
    //player.seekTo(60, true);

}

function pop_menu(story_id){
    console.log('function:'+arguments.callee.name);
    console.log(story_id);
    var popup = document.getElementById("myPopup_"+story_id);
    popup.classList.toggle("show");
}

function append_stories_list(div_id_to_add, data_to_append, where_to_add) {
    console.log('function:'+arguments.callee.name);
    myapp_what = data_to_append.what;
    myapp_where = data_to_append.where;
    myapp_title = data_to_append.title;
    myapp_link = data_to_append.link;
    myapp_avatar = data_to_append.avatar;
    myapp_author = data_to_append.author;
    myapp_gpstory = data_to_append.gpstory;
    myapp_tags = data_to_append.tags;
    myapp_thumbnail = data_to_append.thumbnail;
    myapp_story_id = data_to_append.story_id;
    myapp_type_ = data_to_append.type_;

    //html_reg = get_html_reg();

    html_reg = '';
    html_reg += '<div class=\"accordion\" id=\"accordionExample\" >';
    html_reg += '   <div class=\"accordion-item\" ">';
    html_reg += '     <h2 class=\"accordion-header\" id=\"heading_' + myapp_story_id + '\" style="padding:10px;font-size:14px">';
    html_reg += '       <button style="width:30px;float:right;height:100%;padding:0;background:white;box-shadow:none" class=\"accordion-button\" type=\"button\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse_' + myapp_story_id + '\" aria-expanded=\"true\" aria-controls=\"collapse_' + myapp_story_id + '\">';
    html_reg += '       </button>';
    html_reg += '<div class="popup" onclick="pop_menu('+myapp_story_id+')"><i class=\'fas fa-share-alt\'></i><div class="popuptext" id="myPopup_'+myapp_story_id+'"><a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a><a href=\"story_edit.html?story_id=' + myapp_story_id + '  \">(edit)</a></div></div>';

    switch (myapp_type_) {
        case 'podcast':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/podcast_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'youtube':
            //html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/youtube_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a><a href=\"story_edit.html?story_id=' + myapp_story_id + '  \">(edit)</a>';
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/youtube_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> ';
            //html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> '  + '<a class="story_title" style="color:#0d6efd;text-decoration:none;cursor:pointer;" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a>'+ '<b>youtube</b>'+' <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a> <a href=\"story_youtube_edit.html?story_id='+myapp_story_id+'  \">(edit)</a>';
            break;
        case 'webpage':
            //html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '' + ' <a class="story_title" style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a>'+ '<b>webpage</b>'+' <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/webpage_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a>' + '<b>webpage</b>' + ' <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a><a href=\"story_edit.html?story_id=' + myapp_story_id + '  \">(edit)</a>';
            break;
        case 'facebook':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/facebook_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a></a><a href=\"story_edit.html?story_id=' + myapp_story_id + '  \">(edit)</a>';
            break;
        case 'image':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '' + ' <a class="story_title" style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> ' + '<b>image</b>' + '<a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            //html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/image_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> '+ '<b>image</b>'+'<a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'instagram':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/instagram_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        case 'gpstory':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/gpstory_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a><a href=\"story_edit.html?story_id=' + myapp_story_id + '  \">(edit)</a>';
            break;
        case 'webpage_book':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/book_icon.png>' + ' <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
        default:
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> (type:' + myapp_type_ + ') <a style="color:#0d6efd;text-decoration:none;cursor:pointer" onclick=\"javascript:get_landmarks_by_story_id(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a><a href=\"story_edit.html?story_id=' + myapp_story_id + '  \">(edit)</a>';
    }

    html_reg += '     </h2>';
    html_reg += '     <div id=\"collapse_' + myapp_story_id + '\" class=\"accordion-collapse collapse\" aria-labelledby=\"heading_' + myapp_story_id + '\" data-bs-parent=\"#accordionExample\">';
    html_reg += '       <div class=\"accordion-body\">';
    html_reg += '       </div>';
    switch (myapp_type_) {
        case 'image':
            html_reg += "<div id='map_" + myapp_story_id + "'>";
            html_reg += "<a href=\"image.html\" target=\"_blank\"><img src=\"" + myapp_link + "\"/></a>";
            html_reg += "</div>";
            break;
    }
    html_reg += '       <div id=\"collapse_player_' + myapp_story_id + '\">';
    html_reg += '       </div>';
    html_reg += '       <div>' + myapp_gpstory + '</div>';
    html_reg += '       <div class="collapse_ul" id=\"collapse_ul_' + myapp_story_id + '\">The landmarks are not loaded yet. Please click the story above to load from database.';
    html_reg += '       </div>';
    html_reg += '     </div>';
    html_reg += '   </div>';
    html_reg += ' </div>';

    //console.log(html_reg);

    //console.log(html_reg);
    if (where_to_add == 'prepend') {
        console.log('prepend')
        $(div_id_to_add).prepend(html_reg);
    } else if (where_to_add == 'append') {
      console.log('append')
      $(div_id_to_add).append(html_reg);
        //$(div_id_to_append).
    }

    /*

    */
}



function get_landmarks_by_story_id(story_id) {
    console.log('get_landmarks_by_story_id');
    $('#status').html('processing...')
    $.get(appUrl, { command: 'get_landmarks_by_story_id', story_id: story_id }, function(data) {
        $('#status').html('')
        console.log(data);
        console.log(story_id);

        data_json_landmarks_by_story = { table: data.table };


        //data_json_landmarks_by_story = JSON.parse(data);

        //dbg = data_json_landmarks_by_story;
        gps_locations = [];
        content_reg = '';
        player_id = 'collapse_player_' + story_id;
        console.log(StoriesDict[story_id].type_);
        switch (StoriesDict[story_id].type_) {
            case 'podcast':
                if (typeof StoriesDict[story_id].media_key != 'undefined') {
                    content_reg += '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/episode/' + StoriesDict[story_id].media_key + '?utm_source=generator\" width=\"100%\" height=\"232\" frameBorder=\"0\" allowfullscreen=\"\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\"></iframe>'
                }
                break;
            case 'youtube':
                if (typeof StoriesDict[story_id].media_key != 'undefined') {
                    console.log('enable youtube');
                    console.log('story_id:' + story_id);
                    console.log('player_id:' + player_id);
                    youtube_players[story_id] = new YT.Player(player_id, {
                        //height: '390',
                        width: '90%',
                        videoId: StoriesDict[story_id].media_key,
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
                    //content_reg += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + StoriesDict[story_id].media_key	+ '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'

                }
                break;
            case 'webpage':
                if (typeof StoriesDict[story_id].link != 'undefined') {
                    content_reg += '<iframe width="100%" height="315" src="' + StoriesDict[story_id].link + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
                    //  <iframe width="560" height="315" src="https://www.youtube.com/embed/wpq9TfSBWJM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                }
                break;
            case 'facebook':
                content_reg += StoriesDict[story_id].link;
                break;

        }
        if (data_json_landmarks_by_story.table.length != 0) {
            content_reg += '<ul>'
            for (i in data_json_landmarks_by_story.table) {
                if (typeof(data_json_landmarks_by_story.table[i].lat) == 'undefined' | data_json_landmarks_by_story.table[i].lat == '') continue;
                //console.log(data_json_landmarks_by_story.table[i].landmark_id);
                gps_locations.push({
                    lat: data_json_landmarks_by_story.table[i].lat,
                    lng: data_json_landmarks_by_story.table[i].lng,
                    name: data_json_landmarks_by_story.table[i].name,
                    notes: data_json_landmarks_by_story.table[i].notes,
                    link: data_json_landmarks_by_story.table[i].link,
                    landmark_id: data_json_landmarks_by_story.table[i].landmark_id,
                })
                content_reg += `<li style="cursor:pointer" class="checkboxLandmark"><input class="chilInput${story_id}" id="${data_json_landmarks_by_story.table[i].landmark_id}" type="checkbox"> <a class="singleZoom">`
                content_reg += data_json_landmarks_by_story.table[i].name + '</a>';
                //content_reg += '<a href=\"javascript:seekto(' + youtube_players[story_id] +','+data_json.table[i].link + ')\">('+ data_json.table[i].link +')</a>'
                if (data_json_landmarks_by_story.table[i].link == '') {
                    content_reg += '<a href=\"javascript:seekto(' + story_id + ',' + data_json_landmarks_by_story.table[i].link + ')\">' + '</a>'
                } else {
                    //console.log(data_json_landmarks_by_story.table[i].link);
                    var links_str = String(data_json_landmarks_by_story.table[i].link);
                    //console.log(links_str);
                    for (var link_i = 0; link_i < links_str.split(',').length; link_i++) {
                        //var video_seconds = data_json_landmarks_by_story.table[i].link;
                        var video_seconds = links_str.split(',')[link_i];
                        //console.log(video_seconds);
                        video_mm = Math.floor(video_seconds / 60);
                        video_ss = video_seconds - video_mm * 60;
                        switch (StoriesDict[story_id].type_) {
                            case 'youtube':
                                content_reg += '<a class="seekto" href=\"javascript:seekto(' + story_id + ',' + links_str.split(',')[link_i] + ')\">(' + video_mm + ':' + video_ss + ')</a>'
                                break;
                            case 'podcast':
                                content_reg += '(' + video_mm + ':' + video_ss + ')';
                                break;
                            default:
                                content_reg += '(' + video_mm + ':' + video_ss + ')';
                        }
                    }
                }
                //content_reg += '<a href=\"javascript:add_to_favorite(' + data_json_landmarks_by_story.table[i].landmark_id + ')\">(add)</a>'
                content_reg += '</li>'

            }

            content_reg += '</ul>'
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
        } else {
            $('#collapse_ul_' + story_id).html("there is no landmark in this story.");
            let genInpt = document.getElementById(`genInput${story_id}`)
            genInpt.checked = true
        }
    });


}
