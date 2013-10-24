/***
 * K-DOWN ~ Kyani download interface
 *
 * Made by Gage Peterson 2013, 
 * justgage@gmail.com, twitter @justgage. 
 *
 * This file will follow the style guide found at:
 * https://github.com/rwaldron/idiomatic.js/
 *
 * Objects:
 *       MODEL
 *       handles interaction between the server and the interface.
 *       including the saving of that data for later use.
 *
 *       db
 *       acts as local 'database' hodling values such as current market and category
 *
 *       table
 *       handles the interaction with the table of downloads
 *
 *       marketDD
 *       handles the interaction with the markets dropdown
 *
 *       catList
 *       handles interactions with the category list
 *
 *       search
 *       handles interaction with the search bar.
 *
 *
 *       my conventions:
 *       'cat'             is short for category
 *       '$sel or sel'     a jQuery object that is commenly used in an object
 *       'load'            populates the DOM object
 *       'bind'            binds the DOM object's events (or rebind)
 *       
 *
 */

var Kdown = function () {
    //holds values needed to be stored
    var db = {
        //these contain the selected market and category
        market : null,
        cat : null,

        //this holds the list of valid categories and markets
        valid_list : "",

        // this holds the saved file list in the format
        // json[market][category]
        // also note that the cat-list (a list of the categorys)
        // is also listed as a market
        json : {}
    };

    // constant selectors (not used exclusively in the code yet)
    var MARKETDD = "#market_select",
    LANGDD = "#lang_select",
    CAT_CURRENT = ".current_page_item",
    CAT_LINKS = ".cat_link a",
    router = make_router(false);

    var Model = {
        set : function (cat, market) {
            return function () {
                Model.setMarket(market);
                Model.setCat(cat);
                Model.uiUpdate();
            };
        },
        setCat : function (cat) {
            var oldCat = db.cat;

            if (typeof db.valid_list.cats[cat] !== 'undefined') {
                klog('SET db.cat (' + oldCat + ') -> (' + cat + ')');
                db.cat = cat;
                return true;
            } else {
                kerr('Setting to invalid Cat' + cat);
                return false;
            }
        },
        setMarket : function (market) {
            //test each one 

            var oldMarket = db.market;

            for (var i = 0, l = db.valid_list.markets.length; i < l; i ++) {
                var test = db.valid_list.markets[i];

                if (market === test) {
                    klog('SET db.market (' + oldMarket + ') -> (' + market + ')');
                    db.market = market;
                    return true;
                }
            }

            // error out if none are found
            kerr('Setting to invalid Market -> ' + market);
            return false;

        },
        getCat : function () {
            return db.cat;
        },
        getMarket : function () {
            return db.market;
        },

        /***
         * this will update the sored values of market and category
         * to match the interface
         *
         *  WARNING: trying to depriciate. 
         */
        varUpdate : function () {
            "use strict";
            Model.setMarket($(MARKETDD).val());

            var tempcat = decodeURIComponent($(CAT_CURRENT + " a" ).attr('href'));

            var place = tempcat.indexOf("@");

            if (place === -1) {
                tempcat = tempcat.slice(1);
            } else {
                tempcat = tempcat.slice(1, place);
            }

            Model.setCat(tempcat);

            returnOB.catList.links_update();
        },

        // this will update the UI based on information on the inside. 
        uiUpdate : function () {

            $(returnOB.MARKETDD).val(Model.market);

            $("#none_found").hide();
            $(".current_page_item").attr("class", "cat_link");
            $("#cat_" + db.cat).addClass("current_page_item");

            returnOB.catList.links_update();

            Model.load();

        },
        // This will load the category list either
        // from the saved JSON or the ajax loaded JSON
        // dictated by db.market/db.cat
        load : function () {
            "use strict";

            if ( db.json[ db.market ]  &&  db.json[ db.market ][ db.cat ] ) {
                Model.loadJSON( db.json[ db.market ][ db.cat ] );
            }
            else {
                Model.ajax_load();
            }
        },

        //
        // This function will load the file list from the API
        //
        ajax_load :  function () {
            "use strict";

            //empty the list of items

            $("#ajax_error").hide();
            $("#dl_loading").show();
            $("#dl_table_first").hide();

            //load using post method
            $.post("api.php", { "market":db.market, "cat":db.cat },  function (json) {

                //creates an entry for the market if there isn't one
                db.json[ db.market ] = db.json[ db.market ] || {};

                //creates the place to store the json for reuse (in the loadJSON function)
                db.json[ db.market ][ db.cat ] = json;

                Model.loadJSON(json);

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
                returnOB.table.load(json);
            } else {
                $("#ajax_error").show();
            }
        }
    };

    // This is what is returned to the object
    var returnOB = {
        table : {
            $sel : $("#dl_table_first").find("table"),
            tbody_sel : $("#dl_table_first").find("tbody"),
            html_row : $("#table_copy")[0].innerHTML,
            bind : function () {
                router.add('table_highlight', function () {
                    $(".dl_table tr").removeClass( "table_row_odd").filter(":odd").addClass("table_row_odd");
                });
                router.add("table_filter", this.filter);

            },
            load : function (json) {
                "use strict";
                //klog("table.load-------------------");
                this.$sel.parent().hide();
                this.$sel.show();


                var i, l, table_sel, row;
                var html_tbody = "";
                var html_row = "<tr class='table_row (ROW_CLASS) (LANG_CLASS)' >" + this.html_row + "</tr>";
                var list = [];
                var class_list = [];
                //var table = returnOB.table;
                var langDD = returnOB.langDD;

                langDD.lang_list = {};

                //
                // UPDATE TABLE ***************
                //

                //go through each file in the array
                $.each(json.cat, function(i, file) {

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

                });

                this.tbody_sel.html(html_tbody);

                $("#ajax_error").hide();
                $("#dl_loading").hide();
                $(this.sel).parent().fadeIn();

                window.setTimeout(function () { langDD.load(json); },10);

                window.setTimeout(function () { returnOB.fav.bind(); },20);

                //time.report();
                this.$sel.parent().show();
            },
            filter : function () {
                $("#dl_table_first").hide();
                $("#none_found").hide();
                var filter_lang = $(LANGDD).val();

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
                    $("#dl_table_first").show();
                    // $("#dl_table_first table").hide();
                } else {
                    $("#dl_table_first table").show();
                    $("#dl_table_first").fadeIn();
                    router.fire("table_highlight");
                }

            }
        },
        marketDD : {
            //populates the market drop down from the db.valid_list
            $sel: $(MARKETDD),
            load : function (json) {
                "use strict";
                var markets = db.valid_list.markets;
                var i, l;
                var option = $("<option value=''></option>");
                var $sel = this.$sel;

                //populate the market drop down
                $.each(markets, function(i, market) {

                    var clone = option.clone();

                    $(clone).text( market );
                    $(clone).attr("value", market );

                    $sel.append(clone);
                });

                Model.setMarket(markets[0]);
            },
            bind : function () {
                router.add("market_change",function () {
                    Model.setMarket($(MARKETDD).val());
                    router.hashUpdate("#" + db.cat + "@" + db.market);
                    Model.uiUpdate();
                });

                this.$sel.change(function () {
                    router.fire("market_change");
                });
            },
        },
        langDD : {
            $sel : $("#lang_select"),
            lang_list : {},
            template : "<option value='(CODE)'>(NAME)</option>",
            load : function (json) {
                var langDD = returnOB.langDD;
                var html = "";
                var clone;

                this.$sel.html("");

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
                this.$sel.html(html);
            },
            bind : function () {
                $(LANGDD).change(function () {
               router.fire("table_filter");
            });
         }
      },
      catList : {
         /***
          * Load the cat list from the db.valid_list 
          * NOTE: db.market must be set before this is ran
          */

         $sel : $('#copy-cat'),
         load : function () {
            "use strict";
            var cats = db.valid_list.cats;

            //hack to get outerHTML
            var copy = this.$sel.html();
            this.$sel.remove();
            var html = ""; //holds the return html
            var i, l;

            // Add a category to the page's sidebar
            $.each(cats, function(code, cat) {
               var temp = copy;
               var hash = "#" + code + "@" + db.market;

               //using javascript replaces replace the key words. 
               temp = temp.replace("copy-cat", "cat_" + code);
               temp = temp.replace("(TITLE)", cat);
               temp = temp.replace("(HREF)", hash);
               temp = temp.replace("(CAT)", code);

               html += temp;
            });

            // add to the beginning of navigation
            $('#vertical_nav ul').prepend(html);

            // set the first one on the list to the current page item. 
            $(".cat_link").first().addClass("current_page_item");

            returnOB.catList.bind();

         },
         //
         // this will bind the clicks to the categorys links
         //
         bind: function () {
            // this is not needed due to the hash change event
            $(".cat_link").click(function () {
               //do somthing???
            });
         },

         links_update : function () {
            $(".cat_link a").each(function() {
               $(this).attr("href",
                            "#" + $(this).parent().data("cat") + "@" + db.market);
            });
         }
      },
      search : {
         bind : function () {
            "use strict";
            var Model = Model;
            Model.search = true;
            $("#search_go").click(function () {
               $("#none_found").hide();
               Model.load();
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
      },
      start : function () {
         "use strict";

         // this gets the list of valid categories and markets
         $.post("api.php", {}, function (json) {
            db.valid_list = json;

            // load all the category routes we will use. 
            for (var i = 0, l = json.markets.length; i < l; i ++) {
               var market = json.markets[i];
               for( var cat in json.cats ) {
                  if (json.cats.hasOwnProperty(cat)) {
                     router.add("#" + cat + "@" + market,
                                Model.set(cat, market));
                  }
               }
            }

            // debug routes (can delete later)
            router.show();

            // populate market and cat list
            returnOB.marketDD.load();
            returnOB.marketDD.bind();

            returnOB.catList.load();
            returnOB.langDD.bind();

            returnOB.table.bind();

            // poplate table with ajax request
            Model.load();

            router.add("#search", function () {
               $('#dl_table_first').fadeOut();
            });

            //load it from the URL
            if (router.fire(window.location.hash) === false) {
               klog('NO ROUTE FOUND, default values');
               router.fire($(".cat_link a").first().attr('href'));
            }

            // go back to the top link
            $("#to_top").click(function() {
               $("html, body").animate({ scrollTop: 0 }, "fast");
               return false; // prevent default
            });

         }, "json"); // JSON! Very important to include this
      },
      Model : Model // for debuging, get rid of this later. 
   };

   return returnOB;

};

kdown = new Kdown();

//************************************************************
// things to do on page load
//************************************************************
$(document).ready(function () {
   time.setLineReportMethod(kreport);
   kdown.start();
});

/***
 * TODO: make DB variables private members, (market, category)
 * TODO: make search on the same page
 * TODO: make maretDD change hash. 
 *
 */
