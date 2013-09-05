$(document).ready(function() {

    /***
     * download ui object
     */

    var dl_ui = dl_ui || {};

    //these are the selectors for different elements on the page 
    dl_ui.SEL_MARKET       = "#market_select";
    dl_ui.SEL_CAT_CURRENT  = ".current_page_item";
    dl_ui.SEL_CAT_LINK     = "#vertical_nav ul li a";

    dl_ui.bind = function () {

        //click the category to change to it
        $(dl_ui.SEL_CAT_LINK).click(function () {
            $(dl_ui.SEL_CAT_CURRENT).removeAttr("class");
            $(this).parent().attr("class", dl_ui.SEL_CAT_CURRENT.slice(1));
            dl_ui.ajax_load();
        });
    }

    //load category list
    $.post("api.php", { "cat-list":""},  function (json) {


        var item = $("#vertical_nav li"); $(item).remove();

        for (var i = 0, l = json.list.length; i < l; i ++) {
            var temp = item.clone(); 
            var menu_item = $("#vertical_nav ul").append(temp);
            $("#vertical_nav a").last().text(json.list[i]);
        }

        $("#vertical_nav li").first().attr("class", dl_ui.SEL_CAT_CURRENT   .slice(1));
        dl_ui.bind();
        dl_ui.ajax_load();

    }, "json"); // JSON! very important to include this 


    /***
     * Bind market select to reloading the list of files
     */
    $(dl_ui.SEL_MARKET).change(
        function () {
        dl_ui.ajax_load();
    });


    /***
     * This is a function that will 
     */
    dl_ui.ajax_load =  function () {

        var market = $(dl_ui.SEL_MARKET).val();
        var cat = $(dl_ui.SEL_CAT_CURRENT   ).text();
        //empty the list of items

        $("dl_loading").show();

        //load using post method
        $.post("api.php", { "market":market, "cat":cat },  function (json) {
            dl_ui.loadJSON(json); // it worked!
        }, "json")
        .fail(function () {
            console.log("Ajax failed!");
            $('#dl_table').html("<h3><em>loading list failed! <a href=''" + document.URL + "'>click to reload</a></em></h3>");
        });

    };

    dl_ui.loadJSON = function (json) {

        $('.table_row').remove();

        $("#lang_select").html("");

        var option = $("<option value=''></option>");

        //change the translations dropdown
        for (var i = 0, l = json.langs.length; i < l; i ++) {
            var v = json.langs[i];

            var clone = option.clone();

            $(clone).text( v );
            $(clone).attr("value", v );

            $("#lang_select").append(clone);

        }

        //make a copy and get rid of it
        var row = $("#table_copy").clone();

        $(row).removeAttr('id');
        $(row).attr('class', 'table_row' );
        $(row).show();

        // if the category exists in the data
        if (json.cat) {
            for (var i = 0, l = json.cat.length; i < l; i ++) {

                var file = json.cat[i];
                var newRow = row.clone();
                $("#dl_table table").append(newRow);

                //Put the files information into the new row in the table
                $(newRow).find(".table_star").text( "*" );
                $(newRow).find(".table_name a").text( file.filename ).attr("href", "single.php?id=" + encodeURIComponent( file.id ));
                $(newRow).find(".table_lang").text("---");
                $(newRow).find(".table_dl_link a").attr("href", file.href);

                if (i % 2 === 0) {
                    $(newRow).addClass("table_row_even");
                }

            }
            $("dl_loading").hide();
            $('#dl_table').fadeIn();
        }
        else {console.log("ERROR:" + json.mess);}




    };

});
