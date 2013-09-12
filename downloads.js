
/***
 * K-DOWN ~ Kyani download interface
 *
 * Objects:
 *      db
 *      handles interaction between the server and the interface.
 *      including the saving of that data for later use. 
 *
 *      table
 *      handles the interaction with the table of downloads
 *
 *      marketDD
 *      handles the interaction with the markets dropdown
 *
 *      catList
 *      handles interactions with the category list
 *
 *      search
 *      handles interaction with the search bar.
 */
var kdown = {
    db:{
        // constant selectors (not used exclusively in the code yet)
        MARKETDD : "#market_select",
        LANGDD : "#lang_select",
        CAT_CURRENT : ".current_page_item",
        CAT_LINKS : ".cat_link a",

        //these contain the selected market and category
        market : "",
        cat : "",
        //this holds the list of valid categories and markets
        valid_list : "",

        // this holds the saved file list in the format
        // json[market][category]
        json: {},

        //
        // This will load the category list either 
        // from the saved JSON or the ajax loaded JSON
        //
        load : function () {
            "use strict";

            var app = kdown.db;
            
            console.log("---db.load---");

            if (app.market !== "all-list") {
                if ( app.json[ app.market ]  &&  app.json[ app.market ][ app.cat ] ) {
                    console.log("   app.load--->app.loadJSON()");
                    app.loadJSON( app.json[ app.market ][ app.cat ] );
                }
                else {
                    console.log("   app.load--->app.ajax_load()");
                    app.ajax_load();
                }
            } else {

                $.post("api.php", { "market": "all-list" } ,  function (json) {

                    app.loadJSON(json.list[app.market]);
                });

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
            $("#dl_table_first table").hide();

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
                console.error("ERROR: Ajax failed!");
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


            kdown.langDD.lang_list = {};

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
                $("#dl_table_first table").append(newRow);

                //Put the files information into the new row in the table
                $(newRow).find(".table_star").text( "*" );
                $(newRow).find(".table_name a").text( file.filename ).attr("href", "single.php?id=" + encodeURIComponent( file.id ));
                $(newRow).find(".table_lang").text(file.native_lang);
                $(newRow).find(".table_dl_link a").attr("href", file.href);

                if (typeof file.langs === "object") {
                    for (var locale in file.langs) {
                        kdown.langDD.lang_list[locale] = true;
                        $(newRow).addClass("lang_" + locale);
                    }
                }

                //
                // UPDATE TRANSLATIONS DROP DOWN ***************
                //

                kdown.langDD.load(json);

            }
            $("#dl_loading").hide();
            $('#dl_table_first table').fadeIn();

            kdown.table.highlight();

        },
        filter : function () {
            console.log("table.filter()");
            $("#dl_table_first").hide();
            $("#none_found").hide();
            var filter_lang = $(kdown.db.LANGDD).val();

            var found = 0;

            if (filter_lang === "all") {
                $(".table_row").show();
                found = 1;
            } else {
                $(".table_row").hide();
                $(".lang_" + filter_lang ).each(function () {
                    $(this).show();
                    found++;
                });
            }

            $("#dl_table_first").fadeIn();

            if (found === 0) {
                $("#none_found").show();
            }

            kdown.table.highlight();
            

        },
        //
        //fixes the colors in the rows 
        //
        highlight : function () {
            $("#dl_table_first tr").removeClass("table_row_odd");
            $("#dl_table_first tr:visible").filter(":odd").addClass("table_row_odd");
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
    langDD : {
        lang_list : {},
        load : function (json) {
            var app = kdown.langDD;


            $("#lang_select").html("");

            var option = $("<option value=''></option>");

            for (var code in json.langs) {

                // make it false if it isn't set by the table.load()
                app.lang_list[code] = app.lang_list[code] ? app.lang_list[code] : false;

                if (app.lang_list[code] === true) {
                    var clone = option.clone();
                    $(clone).text( json.langs[code] ); 
                    $(clone).attr("value", code );
                    $("#lang_select").append(clone);
                }

            }

            var allclone = option.clone();
            $(allclone).text( "All" ); 
            $(allclone).attr("value", "all" );
            $("#lang_select").prepend(allclone);
        },
        bind : function () {
            $(kdown.db.LANGDD).change(function () {
                console.log("translation changed");
                kdown.table.filter();
            });
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
                $(temp).find("a").attr("href", "#" + encodeURIComponent( json.cats[i] ));
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
                $("#none_found").hide();
                $(".current_page_item").attr("class", "cat_link");
                $(this).parent().addClass("current_page_item");

                kdown.db.var_update();
                kdown.db.load();
            });
        }
    },
    search : {
        bind : function () {
            "use strict";
            var app = kdown.db;
            app.search = true;
            $("#search_go").click(function () { 
                $("#none_found").hide();
                app.load();
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
        kdown.langDD.bind();
        
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

    var oldHash = "";

    var hashGet = function() {
        var hashObj = {};
        var hash =  decodeURIComponent( window.location.hash );

        if (hash !== oldHash && hash !== "") {
            console.log(hash);
            oldHash = hash;

            kdown.db.cat = hash.slice(1);
            kdown.db.load();
        }
    };


    var hascheckID = window.setInterval(hashGet, 200);



});
