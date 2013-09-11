
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
            "use strict";

            var app = kdown.db;
            
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

        /***
         * this will update the sored values of market and category
         * to match the interface
         */
        var_update : function () {
            var app = kdown.db;
           
            app.market = $(app.MARKETDD).val();
            app.cat = $(app.CAT_CURRENT).text();

        },

        //
        // This function will load the file list from the API 
        //
        ajax_load :  function () {
            "use strict";

            var app = kdown.db;

            //empty the list of items

            $("#dl_loading").show();
            $("#dl_table table").hide();

            //load using post method
            $.post("api.php", { "market":app.market, "cat":app.cat },  function (json) {
                console.log("Ajax worked!");

                //creates an entry for the market if there isn't one
                app.json[ app.market ] = app.json[ app.market ] || {};
                
                //creates the place to store the json for reuse (in the loadJSON function)
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
            "use strict";

            var root_app = kdown;

            // if the category exists in the data
            if (json.cat) {
                root_app.table.load(json);
            }
            else {
                console.log("ERROR:" + json.mess);
            }

        },


    },

    table : {
        load : function (json) {
            "use strict";

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
            "use strict";
            var app = kdown.db;
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
            "use strict";
            var app = kdown.db;
            $(app.MARKETDD).val(app.market);
        }
    
    },
    catList : {
        /***
         * Load the cat list from json
         */
        load : function (json) {
            "use strict";
            var item = $("#vertical_nav li");
            var i, l;

            //$(item).remove();

            for (i = 0, l = json.cats.length; i < l; i ++) {
                var temp = item.clone();
                $(temp).addClass("cat_link");
                $(temp).find("a").text(json.cats[i]);
                $(temp).find("a").attr("href", "#");
                $("#vertical_nav ul").append(temp);
            }

            $(item).attr('id', 'all_items');

            $(".cat_link").first().addClass("current_page_item");

            kdown.catList.bind();

        },
        //
        // this will bind the clicks to the categorys links
        //
        bind: function () {
            $(".cat_link a").click(function () { 
                console.log("CLICK!");
                $(".current_page_item").attr("class", "cat_link");
                $(this).parent().addClass("current_page_item");

                kdown.db.var_update();
                kdown.db.load();
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

        kdown.db.valid_list = json;

        // populate market and cat list
        kdown.marketDD.load(json);
        kdown.catList.load(json);
        
        // poplate table with ajax request
        kdown.db.var_update();
        kdown.db.load();


    }, "json"); // JSON! very important to include this



    /***
     * Bind market select to reloading the list of files
     */
    $(kdown.db.MARKETDD).change(function () {
        console.log("market changed");
        kdown.db.var_update();
        kdown.db.load();
    });

});
