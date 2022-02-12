$.getScript('http://www.youtube.com/iframe_api');

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
    youtube_players[story_id].seekTo(time, true);
    //console.log('seekto:'+player+' '+time);
    //console.log('seekto:'+time);
    //player.seekTo(60, true);

}
function appendStoriesList(div_id_to_add, data_to_append, where_to_add, id_div) {
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
    myapp_types = data_to_append.types;

    //html_reg = get_html_reg();

    html_reg = '';
    html_reg += '<div class=\"accordion\" id=\"accordionExample\" >';
    html_reg += '   <div class=\"accordion-item\" ">';
    html_reg += '     <h2 class=\"accordion-header\" id=\"heading_' + myapp_story_id + '\" style="padding:10px;font-size:16px">';
    html_reg += '       <button style="width:50px;float:right;height:100%;padding:0;background:white;box-shadow:none" class=\"accordion-button\" type=\"button\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse_' + myapp_story_id + '\" aria-expanded=\"true\" aria-controls=\"collapse_' + myapp_story_id + '\">';
    html_reg += '       </button>';

    switch(myapp_types){
    case 'podcast':
    	html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/podcast_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
      break;
		case 'youtube':
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/youtube_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
			break;
		case 'webpage':
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/webpage_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
			break;
    case 'facebook':
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/facebook_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
			break;
      case 'image':
  			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/image_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
  			break;
      case 'instagram':
  			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/instagram_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
  			break;
        case 'gpstory':
    			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/gpstory_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
    			break;
          case 'webpage_book':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/book_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
		default:
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> (type:' + myapp_types + ') <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getLandmarksByStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
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


    //console.log(html_reg);
    if (where_to_add == 'prepend') {
        $(div_id_to_add).prepend(html_reg);
    } else if (where_to_ad == 'append') {
        //$(div_id_to_append).
    }

    /*

    */
}

function getLandmarksByStoryID(story_id) {
    parameter = {
        url: sheetsUrl,
        command: "getLandmarksByStory",
        story_id: story_id
    };
    $.get(appUrl, parameter, function(data) {
        console.log(data);

        var data_json_landmarks_by_story = JSON.parse(data);
        dbg = data_json_landmarks_by_story;
        var gps_locations = [];
        content_reg = '';
        player_id = 'collapse_player_' + story_id;
        switch (StoriesDict[story_id].type) {
            case 'podcast':
              if (typeof StoriesDict[story_id].media_key != 'undefined') {
                content_reg += '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/episode/' + StoriesDict[story_id].media_key + '?utm_source=generator\" width=\"100%\" height=\"232\" frameBorder=\"0\" allowfullscreen=\"\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\"></iframe>'
              }
              break;
            case 'youtube':
                if (typeof StoriesDict[story_id].media_key != 'undefined') {
                    youtube_players[story_id] = new YT.Player(player_id, {
                        height: '390',
                        width: '640',
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
                }
                break;
        }

        content_reg += '<ul>'
        for (i in data_json_landmarks_by_story.table) {
            gps_locations.push({
                lat: data_json_landmarks_by_story.table[i].lat,
                lng: data_json_landmarks_by_story.table[i].lng,
                name: data_json_landmarks_by_story.table[i].name,
                notes: data_json_landmarks_by_story.table[i].notes,
                link: data_json_landmarks_by_story.table[i].link,
                landmark_id: data_json_landmarks_by_story.table[i].landmark_id,
            })
            content_reg += `<li style="cursor:pointer" class="checkboxLandmark"><input class="chilInput${story_id}" id="${data_json.table[i].landmark_id}" type="checkbox"> <a class="singleZoom">`
            content_reg += data_json_landmarks_by_story.table[i].name + '</a>';
            //content_reg += '<a href=\"javascript:seekto(' + youtube_players[story_id] +','+data_json.table[i].link + ')\">('+ data_json.table[i].link +')</a>'
            if (data_json_landmarks_by_story.table[i].link == '') {
                content_reg += '<a href=\"javascript:seekto(' + story_id + ',' + data_json_landmarks_by_story.table[i].link + ')\">' + '</a>'
            } else {
                var video_seconds = data_json_landmarks_by_story.table[i].link;
                video_mm = Math.floor(video_seconds / 60);
                video_ss = video_seconds - video_mm * 60;
                switch(StoriesDict[story_id].type){
                  case 'youtube':
                    content_reg += '<a href=\"javascript:seekto(' + story_id + ',' + data_json_landmarks_by_story.table[i].link + ')\">(t=' + video_mm + 'm' + video_ss + 's)</a>'
                    break;
                  case 'podcast':
                    content_reg += '(t=' + video_mm + 'm' + video_ss + 's)';
                    break;
                  default:
                    content_reg += '(t=' + video_mm + 'm' + video_ss + 's)';
                }
            }
            //content_reg += '<a href=\"javascript:add_to_favorite(' + data_json_landmarks_by_story.table[i].landmark_id + ')\">(add)</a>'
            content_reg += '</li>'

        }

        content_reg += '</ul>'
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

    });


}