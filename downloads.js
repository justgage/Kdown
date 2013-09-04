$(function () {

    /***
     * download ui object
     */


    var dl_ui = dl_ui || {};

    //these are the selectors for different elements on the page 
    dl_ui.sel_dropdown      = "#market_select";
    dl_ui.sel_current_cat = ".current_page_item";
    dl_ui.cat_links     = "#vertical_nav ul li a";

    dl_ui.bind = function() {

        //click the category changes it
        $(dl_ui.cat_links).click(function(){
            $(dl_ui.sel_current_cat).removeAttr('class');
            $(this).parent().attr('class', dl_ui.sel_current_cat.slice(1));
            dl_ui.ajax_load();
        });
    }


    //load category list
    $.post("api.php", { "cat-list":""},  function(json){


        var item = $("#vertical_nav li"); $(item).remove();

        for (var i = 0, l = json.list.length; i < l; i ++) {


            var temp = item.clone(); 

            var menu_item = $("#vertical_nav ul").append(temp);

            $("#vertical_nav a").last().text(json.list[i]);
             
        }

        $("#vertical_nav li").first().attr('class', dl_ui.sel_current_cat.slice(1));

        dl_ui.bind();
        dl_ui.ajax_load();

    }, "json");
    

    /***
     * Bind market select to reloading the list of files
     */
    $(dl_ui.sel_dropdown).change(
        function () {
        dl_ui.ajax_load();
    });


    dl_ui.ajax_load =  function() {

        var market = $(dl_ui.sel_dropdown).val();
        var cat = $(dl_ui.sel_current_cat).text();
        //empty the list of items
        $('#dl_table').html("<h3><em>Download list loading...</em></h3>");
        $('.none-found').show();

        //load using post method
        $.post("api.php", { "market":market, "cat":cat },  function(json){
            dl_ui.loadJSON(json); // it worked!
        }, "json")
        .fail(function() {
            console.log("Ajax failed!");
            //ajax method later
            $('#dl_table').html("<h3><em>loading list failed! <a href=''" + document.URL + "'>click to reload</a></em></h3>");
            //if request failed!
            //$('#downloads-list').html("<h3>" + dl_ui.trans["loading error"]+ "</h3><li>ERROR: <em>" + error + "</em></li>");
            //$('.none-found').show();
        });

    };

    dl_ui.loadJSON = function(json) {

        //load the template
        $("#dl_table").load("table.html", function(){

            //make a copy and get rid of it
            var row = $("#table_copy"); row.remove();

            if (json.cats) {
                for (var i = 0, l = json.cats.length; i < l; i ++) {

                    var file = json.cats[i];

                    //other stuff

                    var newRow = row.clone();
                    var copy = $("#dl_table table").append(newRow);

                    //replace all values in the file
                    $(newRow).find(".table_star").text( "*" );
                    $(newRow).find(".table_name a").text( file.filename );
                    $(newRow).find(".table_name a").attr('href', "single.php?id=" + encodeURIComponent( file.id ));
                    $(newRow).find(".table_lang").text("---");
                    $(newRow).find(".table_dl_link a").attr('href', file.href);

                }
            }
            else {console.log("ERROR:" + json.mess)}

        });



    };









});
