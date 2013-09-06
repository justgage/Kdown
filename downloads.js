
$(document).ready(function() {

    /***
     * download ui object
     */
    //load ategory and markets on page load
    $.post("api.php", {}, function (json) {

        var item = $("#vertical_nav li"); $(item).remove();

        for (var i = 0, l = json.cats.length; i < l; i ++) {
            var temp = item.clone();
            $(temp).find("a").text(json.cats[i])
            $(temp).find("a").attr("href", "#" + json.cats[i] )
            var menu_item = $("#vertical_nav ul").append(temp);
        }

        var find = false;
        var urlhash = window.location.hash;

        // this will use the # in the URL to find the category
        $("#vertical_nav li a[href='" + urlhash + "'").each(function() {
            $(this).parent().attr("class", "current_page_item");
            find = true;
        });

        if (!find) {
            $("#vertical_nav li").first().attr("class", "current_page_item");
        }


        var option = $("<option value=''></option>");

        //change the markets dropdown
        for (var i = 0, l = json.markets.length; i < l; i ++) {
            var v = json.markets[i];

            var clone = option.clone();

            $(clone).text( v );
            $(clone).attr("value", v );

            $("#market_select").append(clone);

        }

        dl_ui.bind();
        dl_ui.ajax_load();

    }, "json"); // JSON! very important to include this

    var dl_ui = dl_ui || {};

    //these are the selectors for different elements on the page
    dl_ui.SEL_MARKET       = "#market_select";
    dl_ui.SEL_CAT_CURRENT  = ".current_page_item";
    dl_ui.SEL_CAT_LINK     = "#vertical_nav ul li a";

    dl_ui.save = {}; // variable used to save ajax querys


    // abstracts the loading and the saving of pages
    dl_ui.load = function() {

        var market = $(dl_ui.SEL_MARKET).val();
        var cat    = $(dl_ui.SEL_CAT_CURRENT).text();

        if ( dl_ui.save[ market ]  &&  dl_ui.save[ market ][ cat ] ) {
            dl_ui.loadJSON( dl_ui.save[ market ][ cat ] );
        }
        else {
            dl_ui.ajax_load();
        }
    }

    dl_ui.bind = function () {

        //click the category to change to it
        $(dl_ui.SEL_CAT_LINK).click(function () {
            $(dl_ui.SEL_CAT_CURRENT).removeAttr("class");
            $(this).parent().attr("class", dl_ui.SEL_CAT_CURRENT.slice(1));

            dl_ui.load();

        });

        /***
         * Bind market select to reloading the list of files
         */
        $(dl_ui.SEL_MARKET).change(function () {
            dl_ui.load();
        });
    }


    /***
     * This is a function that will
     */
    dl_ui.ajax_load =  function () {

        var market = $(dl_ui.SEL_MARKET).val();
        var cat = $(dl_ui.SEL_CAT_CURRENT   ).text();
        //empty the list of items

        $("#dl_loading").show();
        $("#dl_table table").hide();

        //load using post method
        $.post("api.php", { "market":market, "cat":cat },  function (json) {
            console.log("Ajax worked!");

            dl_ui.save[ market ] = dl_ui.save[ market ] || {};

            dl_ui.save[ market ][ cat ] = json;
            dl_ui.loadJSON(json); // it worked!
        }, "json")
        .fail(function () {
            console.log("Ajax failed!");
        });

    };

    dl_ui.loadJSON = function (json) {

        console.log(json.mess);

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
                $(newRow).find(".table_lang").text(file.native);
                $(newRow).find(".table_dl_link a").attr("href", file.href);

                if (i % 2 === 0) {
                    $(newRow).addClass("table_row_even");
                }

            }
            $("#dl_loading").hide();
            $('#dl_table table').fadeIn();
        }
        else {console.log("ERROR:" + json.mess);}

    };

});
