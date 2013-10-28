/***
 * K-DOWN ~ Kyani download interface
 *
 * Made by Gage Peterson 2013,
 * justgage@gmail.com, twitter @justgage.
 *
 * rewritten on:  Wed Oct 23 11:50:39 MDT 2013
 *
 * style_rules: ----------------------------------------
 * naming: snake_case_normal_vars
 *          CONSTANT_VAR
 *          Constructor
 * indent:  4 spaces
 * json:    space around the colon eg( "key" : "value" )
 * functions: var a = function (...) { ... };
 *                            ^ space
 * -----------------------------------------------------
 *
 */

var Kdown = function () {

    "use strict";

    var API_URL = 'api.php';
    var NATIVE_LANG = 'en';
    var logging = true;


    function log(message) {
        if (logging === true && typeof console !== 'undefined') {
            console.log(message);
        }
    }
    function err(message) {
        if (logging === true && typeof console !== 'undefined') {
            console.error(message);
        }
    }

    /***
     * This is the local database that holds everything we need
     * to know about the current page
     */
    var db = {
        page : null,        // current page

        market : null,      // current market
        cat : null,         // current category
        lang : null,        // current translation selected (can be 'ALL')

        cat_list : null,    // list of valid categorys
        market_list : null, // list of valid markets
        lang_list : null,   // list of valid markets
        lang_count : null,   // list of valid markets

        json : {},          // saved json from the ajax querys
        table_json : null,  // hold the current table's JSON
        past_search : null  // a way to filter out the file list faster.
    };

    var model = {
        /***
         * load the json to the API
         */
        format_json : function () { /* format the JSON into the list spesified in
             * files/structure.json
             */
        },
        get_market : function () {
            return db.market;
        },
        get_cat : function () {
            return db.cat;
        },
        get_lang : function () {
            return db.lang;
        },
        set_market : function (new_val) {
            var old_market = db.market;

            if ($.inArray(new_val, db.market_list) !== -1) {
                log('SET db.market (' + old_market + ') -> (' + new_val + ')');
                db.market = new_val;
                return true;
            } else {
                err('Setting to invalid Market ' + new_val);
                log(db.market_list);
                return false;
            }
        },
        set_cat : function (new_val) {
            var old_cat = db.cat;

            if (this.find_in_arary_obj(new_val, db.cat_list, 'key') !== -1) {
                log('SET db.cat (' + old_cat + ') -> (' + new_val + ')');
                db.cat = new_val;
                return true;
            } else {
                err('Setting to invalid Cat ' + new_val);
                return false;
            }
        },
        set_lang : function (new_val) {
            var old_lang = db.lang;

            if ($.inArray(new_val, db.lang_list) !== -1) {
                log('SET db.lang (' + old_lang + ') -> (' + new_val + ')');
                db.lang = new_val;
                return true;
            } else {
                err('Setting to invalid Lang ' + new_val);
                return false;
            }
        },

        get_market_list : function () {
            return db.market_list;
        },
        get_cat_list : function () {
            return db.cat_list;
        },
        get_lang_list : function () {
            return db.lang_list;
        },
        get_lang_name : function (key) {
            return db.lang_list[key];
        },
        get_lang_count : function (key) {
            if (typeof key === 'undefined') {
                return db.lang_count;
            } else {
                return db.lang_count[key];
            }
        },
        get_json : function () {
            return db.json;
        },

        /***
         * returns a JSON string that has market and cat in it too
         * in case you want to list that in the table. 
         */
        get_table_json : function (market, cat) {
            // check if they are false (hopefully undefined!)
            // if so set to the current market/cat
            market = market || db.market;
            cat = cat || db.cat;

            var json = db.json[market][cat].cat;
            var table_json = [];
            var lang_count = {};

            for (var i = 0, l = json.length; i < l; i ++) {
                var file = json[i],
                    lang_list = [];  // a list of languages in a file.
                file.market = market;
                file.cat = cat;


                for (var lang in file.langs) {
                    if(file.langs.hasOwnProperty(lang)) {
                        // will make it 1 if it's empty or add one to the count
                        // otherwise
                        lang_count[lang] = ++lang_count[lang] || 1;

                        lang_list.push(lang);
                    }
                }

                file.langs = lang_list;

                table_json.push(file);
            }

            db.lang_count = lang_count;

            return table_json;
        },
        ajax_lists : function (callback) {
            var me = this;
            $.post("api.php", {}, function (json) {
                db.market_list = json.markets;
                db.cat_list = model.object_to_array(json.cats);

                me.set_market(db.market_list[0]);
                me.set_cat(db.cat_list[0].key);
                callback();
            }, 'json');
        },
        ajax_cat_files : function (callback) {

            var worked = null;

            if (db.market !== null && db.cat !== null ) {
                $.post(API_URL, { "market":db.market, "cat":db.cat }, function (json) {

                    //creates an entry for the market if there isn't one
                    db.json[ db.market ] = db.json[ db.market ] || {};

                    //creates the place to store the json for reuse
                    db.json[ db.market ][ db.cat ] = json;

                    //updates the_lang_list
                    db.lang_list = json.langs;

                    worked = true;

                    callback();
                }, "json")
                .fail(function () {
                    worked = false;
                });
            } else { // if  one is not set
                worked = false;
                err('ajax_to_db: Market = ' + db.market + ' Cat = ' + db.cat);
            }


            return worked;
        },

        sort_table : function (filter_feild, table_json) {
            // sort the table_json
        },
        show : function () {
            log(db);
        },
        me : function () {
            return this;
        },

        /***
         * Converts object to arrays using the words from
         * php 'key' and value' this is used to transform json
         * from the API to the proper array format that's
         * faster to go through with a for loop
         **/
        object_to_array : function (object) {
            var array = [];
            for(var prop in object) {
                if(object.hasOwnProperty(prop)) {
                    array.push({
                        "key" : prop,
                        "value" : object[prop]
                    });
                }
            }

            return array;
        },

        // search arrays that are outputed by the 
        // above function, object_to_array
        //
        // returns: if it finds it it returns the index
        //          if not -1
        find_in_arary_obj : function (needle, arr, prop) {
            for (var i = 0, l = arr.length; i < l; i ++) {
                var item =  arr[i];
                if (item[prop] === needle) {
                    return i;
                }
            }
            return -1;
        },

        /***
         * allows you to access the array_object
         * like a normal object
         * 
         * var val = array[key];
         * var val = array.get_val(key);
         */
        get_val  : function (key, array) {

            var item = array.pop();

            if (item.key === key) {
                return item.value;
            } else {
                if (array.length === 0) {
                    return false;
                } else {
                    return get_val(array);
                }
            }
        }

    };

    /***
     * this are a collection of objects that
     * abstract the DOM manipulation
     */
    var view = {

        /***
         * the html of the copy objects used for templating
         */
        copy : {
            table_row : '<tr>' + $("#table_copy").html() + '</tr>',
            page : $('#copy-cat').html() //NOTE: need to change HTML
        },

        /***
         * Jquery handlers for everything.
         * important for preformance. 
         */
        $ui : {
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
                current : $(".current_page_item"),
                cats : $(".cat_link"),
                cat_links : $(".cat_link a")
            }
        },
        /***
         * abstracton of the tables
         */
        table : {
            populate : function(json) {
                if (typeof json === 'undefined') {
                    json = model.get_table_json();
                }
                var table_html = "";
                var copy = view.copy.table_row;
                var row = copy;

                for (var i = json.length - 1; i >= 0; i--) {
                    var row_data = json[i];
                    row = copy;

                    // Tempating
                    row = row.replace("(HEART_URL)", '#');
                    row = row.replace("(NAME)", row_data.filename);
                    row = row.replace("(FILE_LINK)", 'single.php?id=' + row_data.id);
                    //if there is more than one. 
                    if (row_data.langs.length === 1) {
                        row = row.replace("(LANG)", db.lang_list[row_data.langs[0]]);
                    } else {
                        row = row.replace("(LANG)", row_data.langs.join(', '));
                    }
                    row = row.replace("(DL_LINK)", row_data.urlasd , "#");

                    table_html += row;
                }

                view.$ui.table.first_body.html(table_html);
            }
        },
        /***
         * abstracton of the sidebar
         *
         */
        sidebar : {
            populate : function () {
                var copy = view.copy.page;
                var html = "";

                var list = model.get_cat_list();
                var market = model.get_market();
                var li = "";
                for (var i = 0, l = list.length; i < list.length; i++) {
                    var page = list[i];
                    li = copy;

                    li = li.replace("(CAT)", page.key);
                    li = li.replace("(HREF)", "#cat/" + market + "/" + page.key);
                    li = li.replace("(TITLE)", page.value);

                    html += li;
                }
                view.$ui.sidebar.ul.html(html);
            }, 
            set_current : function () {
                //code
            }
        },
        /***
         * Abstracts the market drop down
         */
        market_DD : {
            populate : function () {
                var list = model.get_market_list();
                var html;
                var temp = '<option value="(NAME)">(NAME)</option>';
                for (var i = list.length - 1; i >= 0; i--) {
                    var option = temp.replace(/\(NAME\)/g, list[i]);
                    html += option;
                }
                view.$ui.DD.market.html(html);
            }
        },
        lang_DD : {
            populate : function () {
                var langs = model.get_lang_list();
                var html;
                var temp = '<option value="(VAL)">(NAME)</option>';
                var count = model.get_lang_count();
                for (var code in langs) {
                    if(langs.hasOwnProperty(code)) {
                        var name = langs[code];
                        var option = temp.replace("(VAL)", code);
                        var num = count[code] + "";
                        var spaces = [];
                        for (var ii = 0, l = 4 - num.length; ii< l; ii++) {
                            spaces.push("\u00A0"); //this is the char for a non-breaking space
                        }
                    name = num + spaces.join(" ") + name;

                    option = temp.replace("(NAME)", name );
                    html += option;
                        
                    }
                }
                view.$ui.DD.lang.html(html);

            }
        }
    };

    /***
     * this is the controller, it relys on 'events'
     * which are a collection of dom manipulations
     * which are tied to some event in the browser
     */
    var event = {
        router : new Router(),

        page_load : function () {
            model.ajax_lists(function () {
                model.ajax_cat_files(function () {
                    view.market_DD.populate();
                    view.sidebar.populate();
                    view.table.populate();
                    view.lang_DD.populate();
                    model.show();
                });
            });
        },
        change_cat : function (cat) {
            model.set_cat(cat);
            view.table.populate();
            view.lang_DD.populate();
        },
        change_market : function (market) {
            model.set_market(market);
            view.table.populate();
            view.lang_DD.populate();
            view.sidebar.populate();
        },

        /***
         * bind or rebind all the dom elements
         */
        bind : function () {},
    };

    return {
        "model" : model,
        "view" : view,
        "event" : event
    };
};


var test = {
    //testing ajax load
    ajax_format : function () {
        var k = new Kdown();
        var m = k.model.me();

        m.ajax_lists(function () {
            m.set_cat('applications');
            m.ajax_cat_files(function () {
                m.set_cat('business');
                m.ajax_cat_files(function () {
                    console.log(m.get_json()); 
                    console.log(m.get_table_json()); 
                });
            });
        });
    },
    router : function() {
        var r = Router(true);

        r.add("#cool");

        r.listen('#cool', function (args) {
            console.log("Here's the args");
            console.log(args);
        });

        r.show();

        r.fire("#cool/a/b/c");

    },
    page_load : function () {
        var k = new Kdown();
        k.event.page_load();
    },
};

test.page_load();

