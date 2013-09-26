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
        // dictated by db.market/db.cat
        load : function () {
            "use strict";
            var db = kdown.db;

            if ( db.json[ db.market ]  &&  db.json[ db.market ][ db.cat ] ) {
                db.loadJSON( db.json[ db.market ][ db.cat ] );
            }
            else {
                db.ajax_load();
            }
        },

        /***
         * this will update the sored values of market and category
         * to match the interface
         */
        var_update : function () {
            "use strict";
            var db = kdown.db;
            db.market = $(db.MARKETDD).val();
            db.cat = $(db.CAT_CURRENT + " a" ).attr('href').slice(1);
            kdown.catList.links_update();
        },

        // 
        ui_update : function () {

            $(kdown.db.MARKETDD).val(kdown.db.market);

            $("#none_found").hide();
            $(".current_page_item").attr("class", "cat_link");
            $("#cat_" + kdown.db.cat).addClass("current_page_item");

            kdown.catList.links_update();

            kdown.db.load();

        },
        //
        // This function will load the file list from the API
        //
        ajax_load :  function () {
            "use strict";

            var db = kdown.db;

            //empty the list of items

            $("#ajax_error").hide();
            $("#dl_loading").show();
            $("#dl_table_first").hide();

            //load using post method
            time.start("ajax_wait");
            $.post("api.php", { "market":db.market, "cat":db.cat },  function (json) {
            time.start("ajax_wait");

                //creates an entry for the market if there isn't one
                db.json[ db.market ] = db.json[ db.market ] || {};

                //creates the place to store the json for reuse (in the loadJSON function)
                db.json[ db.market ][ db.cat ] = json;

                db.loadJSON(json);

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
            // if the category exists in the data
            if (json.cat) {
                kdown.table.load(json);
            } else {
                $("#ajax_error").show();
            }
        }
    },
    hash : {
        oldHash : "",
        loopID : "", 
        load : function() {
            "use strict";
            var hash = kdown.hash;
            var db = kdown.db;
            var vl = kdown.db.valid_list;
            var hash_str =  decodeURIComponent( window.location.hash );
            klog(hash_str);
            var if_market = false;
            var first_cat = $(kdown.db.CAT_CURRENT).attr('id').slice(4);

            if (hash_str !== hash.oldHash && hash_str !== "") {
                hash.oldHash = hash_str;

                klog("HASH LOAD:");

                // this will split the hash at the @
                // left is category
                // right is market
                var hash_array = hash_str.slice(1).split("@");


                klog(vl);

                //checks if there's a valid cat in the hash
                if (vl.cats[hash_array[0]]) {
                    db.cat = hash_array[0];
                } else {
                    db.cat = first_cat;
                }

                for (var i = 0, l = vl.markets.length; i < l; i ++) {
                    if (vl.markets[i] === hash_array[1]) {
                        if_market = true;
                        continue;
                    }
                }

                //checks if there's a valid market in the hash
                if (if_market === true) {
                    db.market = hash_array[1];
                } else {
                    db.market = vl.markets[0];
                }

                //window.location.hash = "#" + db.cat + "@" + db.market;
                kdown.db.ui_update();
            } else {
                db.market = vl.markets[0];
                db.cat = first_cat;
                db.load();
            }
        },
       update : function () {
            "use strict";
            var db = kdown.db;
            window.location.hash =  "#" + db.cat + "@" + db.market;
        },
        bind : function () {
            ie_version = kdown.hash.ie_check();
            if ( ie_version > 8 || ie_version === -1 ) {
                    $(window).bind('hashchange', function() {
                        kdown.hash.load();
                    });
            } else {
                klog("using pooling loop! this should be for IE only.");
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
        sel : $("#dl_table_first").find("table"),
        tbody_sel : $("#dl_table_first").find("tbody"),
        html_row : $("#table_copy")[0].innerHTML,
        load : function (json) {
            "use strict";
            klog("table.load-------------------");
            var i, l, table_sel, row;
            var html_tbody = "";
            var html_row = "<tr class='table_row (ROW_CLASS) (LANG_CLASS)' >" + kdown.table.html_row + "</tr>";
            var list = [];
            var class_list = [];
            var table = kdown.table;
            var langDD = kdown.langDD;

            langDD.lang_list = {};

            //
            // UPDATE TABLE ***************
            //

            //go through each file in the array
            time.start("html_making");
            $.each(json.cat, function(i, file) {

                time.start("     one_file" + file.filename );
                table_sel = "";
                row = html_row;
                
                //highlight the table
                if ( (i % 2) === 0) {
                    row = row.replace("(ROW_CLASS)", "table_row_odd");
                } else {
                    row = row.replace("(ROW_CLASS)", "");
                }

                row = row.replace("(NAME)", file.filename);
                row = row.replace("(HEART_URL)", "#");
                row = row.replace("(FILE_LINK)", "single.php?id=" + encodeURIComponent(file.id));
                row = row.replace("(DL_LINK)", file.href);

                list = [];

                $.each( file.langs, function (locale, info) {
                    if (typeof langDD.lang_list[locale] === "undefined" ) {
                        langDD.lang_list[locale] = 1;
                    }
                    else {
                        langDD.lang_list[locale] += 1 ;
                    }
                    list.push(locale);
                });

                class_list = [];
                $.each(list, function (i, list) {
                    class_list.push("lang_" + list);
                });

                row = row.replace("(LANG_CLASS)", class_list.join(" ") );

                if (list.length < 3) {
                    $.each(list, function (i, locale) {
                        list[i] = json.langs[locale];
                    });
                }

                row = row.replace("(LANG)", list.join(", "));

                html_tbody += row;

                time.stop("     one_file" + file.filename );
            });
            time.stop("html_making");

            time.start('inject_html');
            kdown.table.tbody_sel.html(html_tbody);
            time.stop('inject_html');

            time.start('showing_stuff');
            $("#ajax_error").hide();
            $("#dl_loading").hide();
            $('#dl_table_first').show();
            time.stop('showing_stuff');

            window.setTimeout(function () { langDD.load(json); },10);

            window.setTimeout(function () { kdown.fav.bind(); },10);

            //time.report();
        },
        filter : function () {
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
            $(".dl_table tr").removeClass( "table_row_odd").filter(":odd").addClass("table_row_odd");
        }

    },
    marketDD : {
        //populates the market drop down from the db.valid_list
        load : function (json) {
            "use strict";
            var db = kdown.db;
            var markets = db.valid_list.markets;
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
        sel : $("#lang_select"),
        lang_list : {},
        template : "<option value='(CODE)'>(NAME)</option>",
        load : function (json) {
            time.start("langDD.load");
            var langDD = kdown.langDD;
            var html = "";
            var clone;

            langDD.sel.html("");

            //goes through each language and adds it. 
            $.each(json.langs, function (code, lang) {
                clone = langDD.template;

                // make it false if it isn't set by the table.load()
                langDD.lang_list[code] = langDD.lang_list[code] ? langDD.lang_list[code] : 0;


                // this next block of code will add spaces to the right of the number
                // so that all the translations are nicely lined up. 
                var num = langDD.lang_list[code] + "" ;
                var spaces = [];
                for (var i = 0, l = 4 - num.length; i < l; i++) {
                    spaces.push("\u00A0"); //this is the char for a non-breaking space
                }

                num = num + spaces.join(" ");

                clone = clone.replace("(NAME)", num + lang);
                clone = clone.replace("(CODE)", code);

                html += clone;
            });

            clone = langDD.template;
            clone = clone.replace("(NAME)", "All");
            clone = clone.replace("(CODE)", "all");

            html = clone + html;
            langDD.sel.html(html);
            time.stop("langDD.load");
        },
        bind : function () {
            $(kdown.db.LANGDD).change(function () {
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
            var db = kdown.db;
            var cats = db.valid_list.cats;

            var item = $("#vertical_nav li");
            var i, l;

            // Add a category to the page's sidebar
            $.each(cats, function(code, cat) {
                var temp = item.clone().show();
                $(temp).addClass("cat_link");
                $(temp).attr("id", "cat_" + code);
                $(temp).find("a").text(cat);
                $(temp).find("a").attr("href", "#" + encodeURIComponent(cat) + db.market );
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
            $(".cat_link").click(function () {
                time.start("hash");
            //     kdown.db.cat = $(this).parent().data("cat");
            //     kdown.db.ui_update();
            });
        },

        links_update : function () {
            var db = kdown.db;
            $(".cat_link a").each(function() {
                $(this).attr("href",
                             "#" + $(this).parent().data("cat") + "@" + db.market);
            });
        }
    },
    search : {
        bind : function () {
            "use strict";
            var db = kdown.db;
            db.search = true;
            $("#search_go").click(function () {
                $("#none_found").hide();
                db.load();
            });
        }
    },
    fav : {
        bind : function () {
            $(".table_fav a").click(function (e) {
                $(this).toggleClass("favd");
                e.preventDefault();
            });
        }
    }
};

function klog(mess) {
    "use strict";
    if (window.console !== undefined) {
        console.log(mess);
    }
}

function kreport(mess) {
    "use strict";
    if (window.console !== undefined) {
        console.log(mess + "");
    }
}

//************************************************************
// things to do on page load
//************************************************************
$(document).ready(function () {
    "use strict";

    time.setLineReportMethod(kreport);

    // this gets the list of valid categories and markets
    $.post("api.php", {}, function (json) {

        kdown.db.valid_list = json;

        // populate market and cat list
        kdown.marketDD.load();
        kdown.catList.load();
        kdown.langDD.bind();


        // poplate table with ajax request
        kdown.db.load();

        //update variables 
        kdown.db.var_update();

        kdown.hash.bind();
        kdown.hash.load();


        $("#to_top").click(function() {
            $("html, body").animate({ scrollTop: 0 }, "fast");
            return false;
        });



    }, "json"); // JSON! very important to include this

    /***
     * Bind market select to reloading the list of files
     */
    $(kdown.db.MARKETDD).change(function () {
        kdown.db.market = $(this).val();
        kdown.hash.update();
        kdown.db.ui_update();
    });



});
