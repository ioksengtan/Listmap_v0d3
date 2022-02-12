
function addmyappList(div_id_to_add, data_to_append, where_to_add, id_div) {
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
    	html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/podcast_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
      break;
		case 'youtube':
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/youtube_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
			break;
		case 'webpage':
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/webpage_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
			break;
    case 'facebook':
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/facebook_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
			break;
      case 'image':
  			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/image_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
  			break;
      case 'instagram':
  			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/instagram_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
  			break;
        case 'gpstory':
    			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/gpstory_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
    			break;
          case 'webpage_book':
            html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> ' + '<img class="list_type_icon" src=img/book_icon.png>' + ' <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
            break;
		default:
			html_reg += '           <input id=\"genInput' + myapp_story_id + '\" class="groupinput" type=\"checkbox\"> (type:' + myapp_types + ') <a style="color:#0d6efd;text-decoration:underline;cursor:pointer" onclick=\"javascript:getGPSbyStoryID(' + myapp_story_id + ')\">' + myapp_title + '</a> <a href=\"javascript:spec_func(' + myapp_story_id + ')\">(add)</a>';
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
