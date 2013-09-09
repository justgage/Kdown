
$(document).ready(function() {

    /***
     * Handles the saving and loading of requests to the database
     */
    var db = db || {};

    db.save = {}; // variable used to save ajax querys

    /***
     * Handles the cat list
     */
    var catList = {};
    
    /***
     * Handles the table
     */
    var table = {};
        table.load = undefined;

    /***
     * handles the market drop down
     */
    var marketDD = {};

    //these are the selectors for different elements on the page
    MARKET       = "#market_select";
    CAT_CURRENT  = ".current_page_item";
    CAT_LINKS    = ".cat_link a";
    CAT          = ".cat_link";


    //***********************************************************
    // table FUNCTIONS
    //***********************************************************
    table.load = function(json) {
        
        // UPDATE TRANSLATIONS DROP DOWN ***************
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
        
        // UPDATE TABLE ***************
        $('.table_row').remove();

        //make a copy of the row
        var row = $("#table_copy").clone();

        $(row).removeAttr('id');
        $(row).attr('class', 'table_row' );
        $(row).show();

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

    //***********************************************************
    // catList FUNCTIONS
    //***********************************************************

    /***
     * Load the cat list from json
     */
    catList.load = function(json) {
        var item = $("#vertical_nav li");

        //$(item).remove();

        for (var i = 0, l = json.cats.length; i < l; i ++) {
            var temp = item.clone();
            $(temp).addClass("cat_link");
            $(temp).find("a").text(json.cats[i])
            $(temp).find("a").attr("href", "#" + json.cats[i])
            var menu_item = $("#vertical_nav ul").append(temp);
        }

        $(item).attr('id', 'all_items');

    };

    /***
     * this function will bind the category links 
     * (if categorys are changed you need to recall this)
     */
    catList.bind = function () {
        //click the category to change to it
        $(CAT_LINKS).click(function () {
            $(CAT_CURRENT).removeClass(CAT_CURRENT.slice(1));
            $(this).parent().addClass(CAT_CURRENT.slice(1));
            db.load();
        });
    }

    // this will load the hash from the URL 
    // reload ~ if to reload the downloads list or not. 
    catList.hashswitch = function(reload) {
        var find = false;
        var urlhash = window.location.hash;

        // this will use the # in the URL to find the //category
        $("#vertical_nav li a[href='" + urlhash + "'").each(function() {
            $(this).parent().addClass("class", "current_page_item");
            find = true;
        });

        if (!find) {
            $("#vertical_nav li").first().attr("class", "current_page_item");
        }

        if (reload) {
            db.load();
        }
    };

    //***********************************************************
    // marketDD FUNCTIONS
    //***********************************************************

    marketDD.load = function(json) {
        var option = $("<option value=''></option>");
        //change the markets dropdown
        for (var i = 0, l = json.markets.length; i < l; i ++) {
            var v = json.markets[i];

            var clone = option.clone();

            $(clone).text( v );
            $(clone).attr("value", v );

            $("#market_select").append(clone);

        }

    };


    //***********************************************************
    // db FUNCTIONS
    //***********************************************************

    // abstracts the loading and the saving of pages
    // GOOD!
    db.load = function() {

        var market = $(MARKET).val();
        var cat    = $(CAT_CURRENT).text();

        if ( db.save[ market ]  &&  db.save[ market ][ cat ] ) {
            db.loadJSON( db.save[ market ][ cat ] );
        }
        else {
            db.ajax_load();
        }
    }




    /***
     * This is a function that will
     * GOOD!
     */
    db.ajax_load =  function () {

        var market = $(MARKET).val();
        var cat = $(CAT_CURRENT).text();
        //empty the list of items

        $("#dl_loading").show();
        $("#dl_table table").hide();

        //load using post method
        $.post("api.php", { "market":market, "cat":cat },  function (json) {
            console.log("Ajax worked!");

            db.save[ market ] = db.save[ market ] || {};

            db.save[ market ][ cat ] = json;
            db.loadJSON(json);
        }, "json")
        .fail(function () {
            console.log("ERROR: Ajax failed!");
        });

    };

    db.loadJSON = function (json) {

        // if the category exists in the data
        if (json.cat) {

            table.load(json);
        }
        else {console.log("ERROR:" + json.mess);}

    };

    //************************************************************
    // things to do on page load
    //************************************************************
    
    //load category and markets on page load
    $.post("api.php", {}, function (json) {
        catList.load(json);
        catList.hashswitch(false);
        catList.bind();

        marketDD.load(json);

        db.ajax_load(); //populates the table

    }, "json"); // JSON! very important to include this

    
    //
    // This will change the category when you push back in the browser
    $(window).on('hashchange', function() {
        catList.hashswitch(true);
    });



    /***
     * Bind market select to reloading the list of files
     */
    $(MARKET).change(function () {
        db.load();
    });


});
