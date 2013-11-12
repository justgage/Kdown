
/*
 * jQuery Tiny Pub/Sub
 * https://github.com/cowboy/jquery-tiny-pubsub
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(jQuery));


/***
 * Kdown ~ Kyani download interface
 */
Kdown = function () {
    /***
     * config 
     */
    var LOGGING = false,
        API_URL = "files/dream_api.php";


    /***
     * UI handlers
     */
    var $ui = {
        table: {
            all : $('.dl_table'),
            first : $('#dl_table_first'),
            first_body : $("#dl_table_first").find("tbody"),
            second : $('#dl_table_second'),
            second_body : $("#dl_table_second").find("tbody")
        },
        error : {
            loading : $("#dl_loading"),
            ajax : $("#ajax_error"),
            none_found : $('#none_found')
        },
        DD : {
            market : $('#market_select'),
            lang : $("#lang_select")
        },
        sidebar: {
            ul: $('#vertical_nav ul'),
            current_class : ".current_page_item",
            cats : $(".cat_link"),
            cat_links : $(".cat_link a")
        }
    };



    /***
     * an object that publishes events when it changes
     *
     * also has abilithy to have a validator funciton passed
     * in to test if the input is valid or not. 
     *
     * @arg  {string} publish_name 
     * a string of a publishing name, which can be namespaced like so
     *  
     */
    Kobj = function (publish_name, preset) {

        publish_name = publish_name.split("/");

        if (typeof preset === 'undefined') {
            preset = null;
        }

        var value = preset;

        /***
         * Will change value to new_val
         * IF: the value is different
         *
         * also will fire all the subscriptions in a bubbling way,
         * eg:
         * fire: "namespace/object/smaller"
         * fire: "namespace/object/"
         * fire: "namespace"
         *
         */
        var change = function (new_val) {
            if (value !== new_val) {

                if (LOGGING === true) {
                    console.log(publish_name.join("/") + " changed " + value + " => " , new_val);
                }

                value = new_val;

                // publish all events 
                var i = publish_name.length;
                while(i--) {
                    var pub_name = publish_name.slice(0, i + 1).join("/");
                    $.publish(pub_name, value); 
                }

            } else {
                if (LOGGING === true) {
                    console.log("WARN: " + publish_name + " set not fired due to no change -> " + value);
                }
            }
        };

        // getter / setter function 
        return function (new_val, validator) {
            if (typeof new_val === 'undefined') {
                return value; // get 
            } else {
                if (typeof validator === 'undefined') {

                    change(new_val);

                } else {

                    if (validator(new_val) === true) { // passed 
                        change(new_val);
                    } else { 
                        console.error(publish_name + " being set to invalid value, " + new_val);
                    }

                }
            }

        };
    };

    var db = {
        page : Kobj('page_change', 'cat'),        // current page

        market : new Kobj('page/market'),         // current market
        cat : new Kobj('page/cat'),               // current category
        lang : new Kobj('page/lang'),             // current translation selected (can be 'ALL')
        lang_count : new Kobj('lang_count'),      // each language's count [lang] => count

        file_list : new Kobj('list/files'),          // list of valid categories
        cat_list : new Kobj('list/cats'),          // list of valid categories
        market_list : new Kobj('list/markets'),    // list of valid markets
        lang_list : new Kobj('list/langs', {}),    // list of valid languages

        file_tree : new Kobj('ajax/load'), // hold the current table's JSON
    };

    /***
     * helpers with handling the DOM
     */
    var view = {
        /***
         * the html of the copy objects used for tempesting
         */
        copy : {
            table_row : '<tr>' + $("#table_copy").html() + '</tr>',
            page : $('#copy-cat').html() //NOTE: need to change HTML
        },

        table : {
            populate : function(file_list) {
                if (typeof file_list === 'undefined') {
                    file_list = db.file_list();
                }
                var table_html = "";
                var copy = view.copy.table_row;
                var row = copy;

                for (var i = file_list.length - 1; i >= 0; i--) {
                    var file = file_list[i];
                    row = copy;

                    // Tempating
                    row = row.replace("(HEART_URL)", '#');
                    row = row.replace("(NAME)", file.name);
                    row = row.replace("(FILE_LINK)", 'single.php?id=' + file.id);
                    row = row.replace("(LANG)", file.language);

                    table_html += row;
                }

                $ui.table.first_body.html(table_html);
                view.error.clear();
            },
            lang_filter : function(lang) {
                var json = db.table_json(), // TODO: table_json is invalid
                filtered_json = [],
                num_found = 0,
                i = 0;

                lang = lang || db.lang();

                if (lang === 'all') {
                    num_found = json.length; 
                    this.populate();
                    i = 1;
                } else {
                    for (i = 0, l = json.length; i < l; i++) {
                        var file = json[i];
                        if (file.langs[lang]) {
                            num_found += 1;
                            filtered_json.push(file);
                        }
                    }
                    this.populate(filtered_json);
                }

                return num_found > 0;
            },
        },
        sidebar : {
            populate : function () {
                var copy = view.copy.page;
                var html = "";

                var cat_list = db.cat_list();
                var market = db.market();
                var cat = db.cat();
                var li = "";
                for (var i = 0, l = cat_list.length; i < l; i++) {
                    var page = cat_list[i];
                    li = copy;
                    
                    var code = page.replace(/ /g, "-");
                    code = page.replace(/\//g, "-");

                    li = li.replace(/\(CAT\)/g, code);
                    li = li.replace("(HREF)", "#cat/" + market + "/" + code);
                    li = li.replace("(TITLE)", page);


                    html += li;
                }
                //set the sidebar
                $ui.sidebar.ul.html(html);
                this.set_current();
            }, 
            set_current : function () {
                var sidebar = $ui.sidebar;
                //remove current one
                $(sidebar.current_class).removeClass(sidebar.current_class.slice(1));

                //change to the new one
                sidebar.ul.find( "#cat_" + db.cat() ).
                    addClass(sidebar.current_class.slice(1));
            }
        },
        market_DD : {
            populate : function () {
                var list = db.market_list();
                var html;
                var temp = '<option value="(NAME)">(NAME)</option>';
                for (var i = list.length - 1; i >= 0; i--) {
                    var option = temp.replace(/\(NAME\)/g, list[i]);
                    html += option;
                }
                $ui.DD.market.html(html);
            },
            update : function () {
                $ui.DD.market.val( db.market() );
            }

        },
        lang_DD : {
            populate : function () {
                var langs = db.lang_list();
                var html;
                var temp = '<option value="(VAL)">(NAME)</option>';
                var count = db.lang_count();
                var option = temp.replace("(VAL)", 'all');
                option = option.replace("(NAME)", "All" );
                html += option;

                for (var code in langs) {
                    if(langs.hasOwnProperty(code)) {
                        option = temp;
                        var name = langs[code],
                        num = count[code] || 0,
                        spaces = [];

                        option = option.replace("(VAL)", code);
                        num = num + ""; // change to a string
                        for (var ii = 0, l = 4 - num.length; ii< l; ii++) {
                            spaces.push("\u00A0"); //this is the char for a non-breaking space
                        }
                        name = num + spaces.join(" ") + name;

                        option = option.replace("(NAME)", name );
                        html += option;

                    }
                }
                $ui.DD.lang.html(html).val(NATIVE_LANG);
            }
        },
        error: {
            hide_all : function () {
                $ui.table.all.hide();
                for (var single in $ui.error) {
                    if($ui.error.hasOwnProperty(single)) {
                        $ui.error[single].hide();
                    }
                }
                return true;
            },
            ajax : function () {
                this.hide_all();
                $ui.error.ajax.show();
            },
            none_found : function () {
                this.hide_all();
                $ui.error.none_found.show();
            },
            clear : function () {
                this.hide_all();
                $ui.table.all.show();
            },
            loading : function () {
                this.hide_all();
                $ui.error.loading.show();
            }
        }
    };


    var server = {
        /***
         * save the json in the proper formats
         */
        save_json : function (json) {

            console.log("json response", json);

            var file_list  = json.files,
                market_list = [],
                lang_list   = [],
                cat_list    = [],
                file_tree   = {},
                i           = file_list.length;


                // go through every file (backwards!)
                while (--i) {
                    var file = file_list[i];

                     
                    // add entry for market if not already there
                    if ( $.inArray(file.market, market_list) === -1 ) {

                        console.log("add to market list ",file.market);
                        market_list.push(file.market);

                        file_tree[file.market] = {};
                    }
                    
                    // add entry for category if not already there
                    if ( $.inArray(file.category, cat_list) === -1 ) {

                        console.log("add to cat list ",file.category);
                        cat_list.push(file.category);

                    }

                    if (typeof file_tree[ file.market ][ file.category ]   === 'undefined') {
                        file_tree[ file.market ][ file.category ] = [];
                    }

                    // add entry for lang if not already there
                    if ( $.inArray(file.language, lang_list) === -1 ) {
                        lang_list.push(file.language);
                    }

                    /***
                     * add file to the tree
                     * tree -> market -> category -> file
                     */
                    console.log("file tree add", file_tree);
                    file_tree[ file.market ][ file.category ].push(file);

                } // end while

                // stick it all in the local storage
                db.file_list(file_list);
                db.market_list(market_list);
                db.lang_list(lang_list);
                db.cat_list(cat_list);
                db.file_tree(file_tree);  // publishes ("ajax/load")
        },
        load_json : function () {
            var promise = $.post(API_URL, {}, null, 'json');

            promise.done(server.save_json);
            promise.fail(function (code) {
                console.log("FAIL", code);
                $.publish("ajax/fail");
            });
        },
    };

    /***
     * Bind the events
     */
    $.subscribe("ajax/load", function () {
        view.table.populate();
    });

    $.subscribe("list/markets", function () {
        console.log("market_list");
        view.market_DD.populate();
    });

    $.subscribe("list/cats", function () {
        console.log("cat_list");
        view.sidebar.populate();
    });

    return {
        "view" : view,
        "db" : db,
        "server" : server
    };
};

var Kdown = Kdown();


Kdown.server.load_json();


