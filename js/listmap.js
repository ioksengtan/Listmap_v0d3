

function get_stories_by_keyword(keyword){
  $('#DivStoriesList').empty();
      $.get(appUrl, { command: 'sql_get_stories_by_keyword', keyword: keyword }, function(data) {

          console.log(data);
          data_array = data;
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
                append_stories_list(DivStoriesList, data_json.table[i], 'prepend');
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
      $.get(appUrl, { command: 'sql_get_stories_by_author', author: author }, function(data) {

          console.log(data);
          data_array = data;
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
                append_stories_list(DivStoriesList, data_json.table[i], 'prepend');
              }
              console.log(data_json.table[i].type_);
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

function get_stories_by_tag(tag){
  $('#DivStoriesList').empty();
      $.get(appUrl, { command: 'sql_get_stories_by_tag', tag: tag }, function(data) {

          console.log(data);
          data_array = data;
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
                append_stories_list(DivStoriesList, data_json.table[i], 'prepend');
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
