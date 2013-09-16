
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

function log(mess) {
    if (window.console !== undefined) {
        console.log(mess);
    }
}


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
        // dictated by db.market/db.cat
        load : function () {
            "use strict";

            var app = kdown.db;

            log("---db.load---");

            if (app.market !== "all-list") {
                if ( app.json[ app.market ]  &&  app.json[ app.market ][ app.cat ] ) {
                    log("   app.load--->app.loadJSON()");
                    app.loadJSON( app.json[ app.market ][ app.cat ] );
                }
                else {
                    log("   app.load--->app.ajax_load()");
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
            app.cat = $(app.CAT_CURRENT + " a" ).attr('href').slice(1);
            log("setting cat to :" + app.cat);
            kdown.catList.links_update();
        },

        // 
        ui_update : function () {
            var app = kdown;

            $(app.db.MARKETDD).val(app.db.market);

            $("#none_found").hide();
            $(".current_page_item").attr("class", "cat_link");
            $("#cat_" + app.db.cat).addClass("current_page_item");

            app.catList.links_update();

            app.db.load();

        },
        //
        // This function will load the file list from the API
        //
        ajax_load :  function () {
            "use strict";

            var app = kdown.db;

            //empty the list of items

            $("#ajax_error").hide();
            $("#dl_loading").show();
            $("#dl_table_first table").hide();

            //load using post method
            $.post("api.php", { "market":app.market, "cat":app.cat },  function (json) {
                log("Ajax worked!");

                //creates an entry for the market if there isn't one
                app.json[ app.market ] = app.json[ app.market ] || {};

                //creates the place to store the json for reuse (in the loadJSON function)
                app.json[ app.market ][ app.cat ] = json;

                app.loadJSON(json);

            }, "json")
            .fail(function () {
                $("#ajax_error").show();
                $("#dl_loading").hide();
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
            } else {
                //log("ERROR:" + json.mess);
            }
        }
    },
    hash : {
        oldHash : "",
        loopID : "", 
        load : function() {
            "use strict";
            var app = kdown.hash;
            var hash =  decodeURIComponent( window.location.hash );
            if (hash !== app.oldHash && hash !== "") {
                app.oldHash = hash;

                // this will split the hash at the @
                // left is category
                // right is market
                var hash_array = hash.slice(1).split("@");
                if (hash_array[0]) {
                    kdown.db.cat = hash_array[0];
                }
                    
                kdown.db.market = hash_array[1];

                kdown.db.ui_update();
            }
        },
       update : function () {
            "use strict";
            var app = kdown.db;
            window.location.hash =  "#" + app.cat + "@" + app.market;
        },
        bind : function () {
            ie_version = kdown.hash.ie_check();
            if ( ie_version > 8 || ie_version === -1 ) {
                    $(window).bind('hashchange', function() {
                        log("Hashchange canceled.");
                        kdown.hash.load();
                    });
            } else {
                kdown.hash.loopID = window.setInterval(kdown.hash.load, 100);
            } 
        },
        ie_check: function () {
            var rv = -1; // Return value assumes failure.
            if (navigator.appName == 'Microsoft Internet Explorer')
                {
                    var ua = navigator.userAgent;
                    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                    if (re.exec(ua) != null)
                        rv = parseFloat( RegExp.$1 );
                }
                return rv;
        }
    },
    table : {
        load : function (json) {
            "use strict";
            var i, l;

            kdown.langDD.lang_list = {};

            $('#dl_table_first table').hide();

            //
            // UPDATE TABLE ***************
            //
            $('.table_row').remove();

            //make a copy of the row
            var row = $("#table_copy").clone();

            $(row).removeAttr('id');
            $(row).attr('class', 'table_row' );
            $(row).show();

            //go through each file in the array
            $.each(json.cat, function(i, file) {

                var newRow = row.clone();

                //Put the files information into the new row in the table
                $(newRow).find(".table_star").text( "*" );
                $(newRow).find(".table_name a").text( file.filename ).attr("href", "single.php?id=" + encodeURIComponent( file.id ));
                $(newRow).find(".table_lang").text(file.native_lang);
                $(newRow).find(".table_dl_link a").attr("href", file.href);

                if (typeof file.langs === "object") {
                        $.each( file.langs, function (locale, info) {
                        kdown.langDD.lang_list[locale] = true;
                        $(newRow).addClass("lang_" + locale);
                    });
                }
                $("#dl_table_first table").append(newRow);

                //
                // UPDATE TRANSLATIONS DROP DOWN ***************
                //

                kdown.langDD.load(json);

            });

            $("#ajax_error").hide();
            $("#dl_loading").hide();
            $('#dl_table_first table').show();

            kdown.table.highlight();

        },
        filter : function () {
            log("table.filter()");
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


            if (found === 0) {
                $("#none_found").show();
            }


            $("#dl_table_first").show();
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
        //populates the market drop down from the db.valid_list
        load : function (json) {
            "use strict";
            var app = kdown.db;
            var markets = app.valid_list.markets;
            var i, l;
            var option = $("<option value=''></option>");
            
            //populate the market drop down
            $.each(markets, function(i, market) {

                var clone = option.clone();

                $(clone).text( market );
                $(clone).attr("value", market );

                $("#market_select").append(clone);
            });
        }
    },
    langDD : {
        lang_list : {},
        load : function (json) {
            var app = kdown.langDD;


            $("#lang_select").html("");

            var option = $("<option value=''></option>");

            $.each(json.langs, function (code, lang) {

                // make it false if it isn't set by the table.load()
                app.lang_list[code] = app.lang_list[code] ? app.lang_list[code] : false;

                if (app.lang_list[code] === true) {
                    var clone = option.clone();
                    $(clone).text( json.langs[code] );
                    $(clone).attr("value", code );
                    $("#lang_select").append(clone);
                }

            });

            var allclone = option.clone();
            $(allclone).text( "All" );
            $(allclone).attr("value", "all" );
            $("#lang_select").prepend(allclone);
        },
        bind : function () {
            $(kdown.db.LANGDD).change(function () {
                log("translation changed");
                kdown.table.filter();
            });
        }

    },
    catList : {
        /***
         * Load the cat list from the db.valid_list 
         * NOTE: db.market must be set before this is ran
         */
        load : function () {
            "use strict";
            var app = kdown.db;
            var cats = app.valid_list.cats;

            var item = $("#vertical_nav li");
            var i, l;

            // Add a category to the page's sidebar
            $.each(cats, function(code, cat) {
                var temp = item.clone().show();
                $(temp).addClass("cat_link");
                $(temp).attr("id", "cat_" + code);
                $(temp).find("a").text(cat);
                $(temp).find("a").attr("href", "#" + encodeURIComponent(cat) + app.market );
                $(temp).data("cat", code);
                $("#vertical_nav ul").append(temp);
            });

            // set first one to it's own category
            //$(item).attr('id', 'all_items');
            $(item).remove();


            // set the first one on the list to the current page item. 
            $(".cat_link").first().addClass("current_page_item");

            kdown.catList.bind();

        },
        //
        // this will bind the clicks to the categorys links
        //
        bind: function () {
            // this is not needed due to the hash change event
            // $(".cat_link a").click(function () {
            //     kdown.db.cat = $(this).parent().data("cat");
            //     kdown.db.ui_update();
            // });
        },

        links_update : function () {
            var app = kdown.db;
            $(".cat_link a").each(function() {
                $(this).attr("href",
                             "#" + $(this).parent().data("cat") + "@" + app.market);
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


//************************************************************
// things to do on page load
//************************************************************
$(document).ready(function () {
    "use strict";

    // this gets the list of valid categories and markets
    $.post("api.php", {}, function (json) {
        log("----------$POST LOAD");

        kdown.db.valid_list = json;

        // populate market and cat list
        kdown.marketDD.load();
        kdown.catList.load();
        kdown.langDD.bind();


        // poplate table with ajax request
        kdown.db.load();

        //update variables 
        kdown.db.var_update();

        kdown.hash.load();
        kdown.hash.bind();


        $("#to_top").click(function() {
            $("html, body").animate({ scrollTop: 0 }, "fast");
            return false;
        });



    }, "json"); // JSON! very important to include this

    /***
     * Bind market select to reloading the list of files
     */
    $(kdown.db.MARKETDD).change(function () {
        log("market changed");
        kdown.db.market = $(this).val();
        kdown.hash.update();
        kdown.db.ui_update();
    });


});
