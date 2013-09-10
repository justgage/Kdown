
var kdown = {

    db:{
        MARKETDD : "#market_select",
        CAT_CURRENT : ".current_page_item",
        CAT_LINKS : ".cat_link a",
        market : "",
        cat : "",
        valid_list : "",
        json: {},

        //
        // This will load the category list either from the saved JSON or the ajax loaded JSON
        //
        load : function () {

            app = kdown.db;
            
            console.log("---db.load---");

            if ( app.json[ app.market ]  &&  app.json[ app.market ][ app.cat ] ) {
                console.log("   app.load--->app.loadJSON()");
                app.loadJSON( app.json[ app.market ][ app.cat ] );
            }
            else {
                console.log("   app.load--->app.ajax_load()");
                app.ajax_load();
            }
        },

        //
        // This function will load the file list from the API 
        //
        ajax_load :  function () {

            app = kdown.db;

            //empty the list of items

            $("#dl_loading").show();
            $("#dl_table table").hide();

            //load using post method
            $.post("api.php", { "market":app.market, "cat":app.cat },  function (json) {
                console.log("Ajax worked!");

                //creates an entry for the market if there isn't one
                app.json[ app.market ] = app.json[ app.market ] || {};
                //creates the place to store the json
                app.json[ app.market ][ app.cat ] = json;

                app.loadJSON(json);

            }, "json")
            .fail(function () {
                console.log("ERROR: Ajax failed!");
            });

        },

        //
        // This will load the json IF the category exists
        //
        loadJSON : function (json) {

            app = kdown;

            // if the category exists in the data
            if (json.cat) {
                app.table.load(json);
            }
            else {
                console.log("ERROR:" + json.mess);
            }

        },

        // 
        //  Take the hash and update the stored values (db.market, db.cat) 
        //  IF => the hash is a valid category or market 
        //  IF NOT => valid default to the first on the list
        //  
        loadHash : function () {
            app = kdown.db;
            console.log("db.loadHash");

            app.market = false;
            app.cat = false;

            // take the market and the cat fromt the windows hash.
            var split =  window.location.hash.slice(1).split("@");
            var cat = split[0];
            var market = split[1];
            var i, l;

            //Search for the hash in the market
            for (i = 0, l = app.list.markets.length; i < l; i ++) {
                if (app.list.markets[i] === market)
                    {
                        console.log("   FOUND THE MARKET!");
                        app.market = market;
                    }

            }

            if (app.market === false) {
                app.market = $(app.MARKET).val();
                console.log("   no market found defalting to, " + app.market);
            }

            //Search for the hash in the categorys
            for (i = 0, l = app.list.cats.length; i < l; i ++) {
                // TRANSLATION PROBLEMS!
                if (app.list.cats[i] === cat)
                    {
                        console.log("   FOUND THE CAT!");
                        app.cat = cat;
                    }
            }

            if (app.cat === false) {
                app.cat = $(app.CAT_CURRENT).text();
                console.log("   no categoy found defalting to, " + app.cat);
            }

            window.location.hash = "#" + app.cat + "@" + app.market;

            console.log("   after hash fix => " + window.location.hash);

        },

        //
        //this will update tha hash based on the stored values
        //
        hashUpdate : function () {
            app = kdown.db;
            window.location.hash = "#" + app.cat + "@" + app.market;
        }


    },

    table : {
        load : function (json) {

            var i, l;
            //
            // UPDATE TRANSLATIONS DROP DOWN ***************
            //
            $("#lang_select").html("");

            var option = $("<option value=''></option>");

            //change the translations dropdown
            for (i = 0, l = json.langs.length; i < l; i ++) {
                var v = json.langs[i];

                var clone = option.clone();

                $(clone).text( v );
                $(clone).attr("value", v );

                $("#lang_select").append(clone);

            }

            //
            // UPDATE TABLE ***************
            //
            $('.table_row').remove();

            //make a copy of the row
            var row = $("#table_copy").clone();

            $(row).removeAttr('id');
            $(row).attr('class', 'table_row' );
            $(row).show();

            for (i = 0, l = json.cat.length; i < l; i ++) {

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

    },
    marketDD : {
        //populates the market drop down
        load : function (json) {
            var i, l;
            var option = $("<option value=''></option>");
            //change the markets dropdown
            for (i = 0, l = json.markets.length; i < l; i ++) {
                var v = json.markets[i];

                var clone = option.clone();

                $(clone).text( v );
                $(clone).attr("value", v );

                $("#market_select").append(clone);

            }


        },

        // makes the market equal the stored value.
        update : function () {
            app = kdown.db;
            $(app.MARKETDD).val(app.market);
        }
    
    },
    catList : {
        /***
         * Load the cat list from json
         */
        load : function (json) {
            app = kdown.db;
            var item = $("#vertical_nav li");
            var i, l;

            //$(item).remove();

            for (i = 0, l = json.cats.length; i < l; i ++) {
                var temp = item.clone();
                $(temp).addClass("cat_link");
                $(temp).find("a").text(json.cats[i]);
                $(temp).find("a").attr("href", "#" + json.cats[i] + "=" + app.market);
                $("#vertical_nav ul").append(temp);
            }

            $(item).attr('id', 'all_items');

        },

        /***
         * updates the hash in the HREF of the links of the category
         */
        hashswitch : function (reload) {
            app = kdown.db;
            console.log("catList.hashswitch");


            var find = false;

            // this will use the # in the URL to find the //category
            $("#vertical_nav li a[href*='" + app.cat  + "']").each(function () {
                $(app.CAT_CURRENT).attr('class', 'cat_link');
                $(this).parent().addClass("current_page_item");
                find = true;
            });

            if (find === false) {
                console.log("   find = false");
                $("#vertical_nav li").first().addClass("current_page_item");
                $(app.CAT_CURRENT).removeClass(app.CAT_CURRENT.slice(1));
            }

            if (reload) {
                app.load();
            }

        },

        hashUpdate : function () {
            $(app.CAT_LINKS).each(function () {
                $(this).attr("href", "#" + $(this).text() + "@" + app.market);
            });
        }
    }

};


$(document).ready(function () {

    "use strict";
    //************************************************************
    // things to do on page load
    //************************************************************

    //populate the categories and markets on page load
    $.post("api.php", {}, function (json) {
        console.log("----------$POST LOAD");

        kdown.db.list = json;

        // populate market and cat list
        kdown.marketDD.load(json);
        kdown.catList.load(json);
        
        //check to see if hash is good
        kdown.db.loadHash();
        
        //this will switch based on the browsers hash tag
        kdown.catList.hashswitch(false);

        // update the cat links to have the right hash
        kdown.catList.hashUpdate();
        
        // poplate table with ajax request
        kdown.db.load();

    }, "json"); // JSON! very important to include this


    // This will change the category when you push back in the browser
    $(window).on('hashchange', function () {
        console.log("hashchange event");
        kdown.db.loadHash();
        kdown.catList.hashswitch(true);
        kdown.marketDD.update();
    });

    /***
     * Bind market select to reloading the list of files
     */
    $(kdown.MARKET).change(function () {
        kdown.db.market = $(this).val();
        kdown.db.hashUpdate();
        kdown.catList.hashUpdate();
    });

});
