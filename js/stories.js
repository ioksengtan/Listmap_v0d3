var sheetName = 'landmarks';

StoriesDict = {}
$(document).ready(

    function() {

        const i18n = new VueI18n({
            locale: 'en',
            messages,
        })
        new Vue({
            i18n
        }).$mount('#dropdown')
        $('#text-input-story').keydown(function(e) {
            if(e.which == 13) {// Enter was pressed. Run your code.
                story_content = $('#text-input-story').val().trim();
                //$('#text-input-story').val("");
                $(this).val('').focus();
                console.log(story_content);
                data_to_append = {
                }
                if(story_content.includes('@select')){
				  console.log('@select');
                  $('#DivStoriesListQuery').html("");
                  var data_to_append = {}
                  data_to_append.title = story_content;
                  data_to_append.type_ = '';
                  append_stories_list(DivStoriesListQuery, data_to_append, 'prepend')
				}else if(story_content.includes('@listmap')){
					$(this).val('').focus();
					
                }else if(story_content.includes('www.youtube.com')){
                  videoId = story_content.split("&")[0].split("=")[1];//https://www.youtube.com/watch?v=dtXONHulWcA&bls
                  var appYoutube = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=AIzaSyCsiStpIlMr_0RhLo9gvJ_gUjjpCRvPXmk'
                  $('#status').html('processing...')
                  $.get(appYoutube, function(data) {
                      $('#status').html('');
                      console.log(data);
                      //tmp = data;
                      youtube_title = data.items[0].snippet.title;
                      youtube_channel = data.items[0].snippet.channelTitle;
                      youtube_published = data.items[0].snippet.publishedAt;
                      youtube_description = data.items[0].snippet.description;
                      //$('#heading_0').html(youtube_title);
                      //get_landmarks_by_story_id(0);
                      data_to_append.type_ = 'youtube';
                      data_to_append.title = youtube_title
                      var current = new Date();

                      var parameter = {
                          url: sheetsUrl,
                          command: "new_story",
                          name: youtube_title,
                          type_: "youtube",
                          link: "https://www.youtube.com/watch?v=" + videoId,
                          //landmarks: JSON.stringify(landmarks_json),
                          author: youtube_channel,
                          tags:'',
                          update_timestamp:current.toString(),
                      }
                      console.log(parameter);
                      $('#status').html('processing...')
                      $.post(appUrl, parameter, function(data) {
                          $('#status').html('');
                          console.log(data);
                          data_to_append.story_id = data;
                          append_stories_list(DivStoriesList, data_to_append, 'prepend')
                      });

                  })

                }else if(story_content.includes('www.facebook.com')){
                  data_to_append.type_ = 'facebook';
                  data_to_append.title = 'user defined title';
                  $('#status').html('processing...')
                  var parameter = {
                      url: sheetsUrl,
                      command: "new_story",
                      name: data_to_append.title,
                      type_: "facebook",
                      link: story_content,
                      author: "",
                      tags:''
                  }

                  $('#status').html('processing...')
                  $.post(appUrl, parameter, function(data) {
                      $('#status').html('');
                      console.log(data);
                      append_stories_list(DivStoriesList, data_to_append, 'prepend')
                  });

                }else{
                  data_to_append.type_ = '';
                  data_to_append.title = story_content;
                  $('#status').html('processing...')
                  var parameter = {
                      url: sheetsUrl,
                      command: "new_story",
                      name: data_to_append.title,
                      type_: "",
                      link: "",
                      author: "",
                      tags:''
                  }
                  $('#status').html('processing...')
                  $.post(appUrl, parameter, function(data) {
                      $('#status').html('');
                      console.log(data);
                      data_to_append.story_id = data;
                      append_stories_list(DivStoriesList, data_to_append, 'prepend')
                  });

                }

                /*
                myapp_what = data_to_append.what;
                myapp_where = data_to_append.where;
                myapp_title = data_to_append.title;
                myapp_link = data_to_append.link;
                myapp_avatar = data_to_append.avatar;
                myapp_author = data_to_append.author;
                myapp_tags = data_to_append.tags;
                myapp_thumbnail = data_to_append.thumbnail;
                myapp_story_id = data_to_append.story_id;
                myapp_type_ = data_to_append.type_;
                */

            }
        });
        $('#status').html('processing...')
        $.get(appUrl, { command: 'getRecentStories' }, function(data) {
            $('#status').html('')
            console.log(data);

            var data_json = { table: data.table.map(function(r) {
                return {
                    title: r.title,
                    story_id: r.story_id,
                    type_: r.type,
                    link: r.link,
                    author: r.author,
                    tags: r.tags,
                    gpstory: r.gpstory || '',
                    update_time_stamp: r.update_time_stamp || '',
                    is_delete: r.is_delete || '',
                };
            }) };

            //data_json = JSON.parse(data);
            $('#TagList ul').append("<b>authors</b>");
            for (i in data_json.table_authors){
              //console.log(data_json.table_authors[i].tag);
              $('#TagList ul').append('<li>@<a href=\"javascript:get_stories_by_author(\'' + data_json.table_authors[i].tag +'\')\">'+ data_json.table_authors[i].tag +'</a></li>')
            }
            for (i in data_json.table_tags){
              if(i == 0){
                $('#TagList ul').append("<b>tags</b>");
              }else {
                $('#TagList ul').append('<li>#<a href=\"javascript:get_stories_by_tag(\'' + data_json.table_tags[i] +'\')\">'+ data_json.table_tags[i] +'</a></li>')
              }
            }
            for (i in data_json.table) {
                append_stories_list(DivStoriesList, data_json.table[i], 'append')
                switch(data_json.table[i].type_){
                  case 'podcast':
                    StoriesDict[data_json.table[i].story_id] = {
                        'type_': data_json.table[i].type_,
                        'media_key': data_json.table[i].link,
                        'link': data_json.table[i].link,
                    };
                    break;
                  case 'youtube':
                    var _yt_link = data_json.table[i].link || '';
                    var _yt_key = '';
                    if (_yt_link.includes('v=')) {
                        _yt_key = _yt_link.split('v=')[1].split('&')[0];
                    } else if (_yt_link.includes('youtu.be/')) {
                        _yt_key = _yt_link.split('youtu.be/')[1].split('?')[0];
                    }
                    StoriesDict[data_json.table[i].story_id] = {
                        'type_': data_json.table[i].type_,
                        'media_key': _yt_key,
                        'link': _yt_link,
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


        })
    });


function search_by_keyword(){
  console.log('function:'+arguments.callee.name);
  var keyword = $('#text-input-search').val();
  get_stories_by_keyword(keyword);
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
