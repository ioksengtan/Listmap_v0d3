var appUrl = 'https://script.google.com/macros/s/AKfycby-gL9w_PIzt4TDnqfpErNP1YTck93p4j7z1FTpt52bCkryg5Iu/exec';
var sheetsUrl = 'https://docs.google.com/spreadsheets/d/1GNvkC8t3xua_ibN2GnnXJi-MXasuX5SXb4y1G6idFSc/edit#gid=1023127248';
//https://docs.google.com/spreadsheets/d/1GNvkC8t3xua_ibN2GnnXJi-MXasuX5SXb4y1G6idFSc/edit?usp=sharing
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
            if(e.which == 13) {
                // Enter was pressed. Run your code.
                story_content = $('#text-input-story').val().trim();
                //$('#text-input-story').val("");
                $(this).val('').focus();
                console.log(story_content);
                data_to_append = {
                }
                if(story_content.includes('www.youtube.com')){
                  data_to_append.types = 'youtube';
                  data_to_append.title = 'get youtube title by API'
                  appendStoriesList(DivStoriesList, data_to_append, 'prepend')
                }else if(story_content.includes('www.facebook.com')){
                  data_to_append.types = 'facebook';
                  data_to_append.title = 'user defined title';
                  appendStoriesList(DivStoriesList, data_to_append, 'prepend')
                }else{
                  data_to_append.types = '';
                  data_to_append.title = story_content;
                  appendStoriesList(DivStoriesList, data_to_append, 'prepend')
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
                myapp_types = data_to_append.types;
                */

            }
        });
		var parameter = {
			url: sheetsUrl,
			name: sheetName,
			command: "getRecentStories",
		};
        $.get(appUrl, parameter, function(data) {

            console.log(data);
            data_json = JSON.parse(data);
            $('#TagList ul').append("<b>authors</b>");
            for (i in data_json.table_authors){
              //console.log(data_json.table_authors[i].tag);
              $('#TagList ul').append('<li>@<a href=\"javascript:getStoriesByAuthor(\'' + data_json.table_authors[i].tag +'\')\">'+ data_json.table_authors[i].tag +'</a></li>')
            }
            for (i in data_json.table_tags){
              if(i == 0){
                $('#TagList ul').append("<b>tags</b>");
              }else {
                $('#TagList ul').append('<li>#<a href=\"javascript:getStoriesByTag(\'' + data_json.table_tags[i] +'\')\">'+ data_json.table_tags[i] +'</a></li>')
              }
            }
            for (i in data_json.table) {
                appendStoriesList(DivStoriesList, data_json.table[i], 'prepend')
                switch(data_json.table[i].types){
                  case 'podcast':
                    StoriesDict[data_json.table[i].story_id] = {
                        'type': data_json.table[i].types,
                        'media_key': data_json.table[i].link,
                        'link': data_json.table[i].link,
                    };
                    break;
                  case 'youtube':
                    StoriesDict[data_json.table[i].story_id] = {
                        'type': data_json.table[i].types,
                        'media_key': data_json.table[i].link.split('v=')[1],
                        'link': data_json.table[i].link,
                    };
                    break;
                    default:
                    StoriesDict[data_json.table[i].story_id] = {
                        'type': data_json.table[i].types,
                        'media_key': data_json.table[i].link,
                        'link': data_json.table[i].link,
                    };
                }

            }


        })
    });







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
