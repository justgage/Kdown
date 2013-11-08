/***
 * K-DOWN ~ Kyani download interface
 *
 * Made by:         Gage Peterson 2013 
 *                  justgage@gmail.com, twitter @justgage.
 * rewritten on:    Wed Oct 23 11:50:39 MDT 2013
 *
 * How it works:----------------------------------------
 *
 * The application has a few major parts (in order of apearence): 
 *
 * db ~ the place where all global data is stored
 * model ~ this is the db helper, this will protect all
 *         the changes of db, and can log whenever values
 *         change OR atempted to change to values that are
 *         invalid. 
 *
 *         also provides for a way to abstract the json
 *         provided by the API thus we only need to change
 *         it in once place if the API shifts the JSON
 *         it hands us (currently not entirely implimented
 *         at the moment)
 *
 *
 * view  ~ This is the abstracton of the DOM elements such
 *         as the "table" providing methods that are not
 *         coupled with other views. Meaning the don't depend on 
 *         other view objects (eg: language Drop down should never
 *         call the table) these combinations are made in events
 *          
 *
 * event ~ These are the controller actions. They are called 
 *         events because they represent some event on the page
 *         such as click on a sidebar link, or a hash change.
 *         they combine the view objects to provide a easy way
 *         to see which is running before the other and prevent
 *         doing things twice or in the views.
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
 *  block comments are made like this
 */

var Kdown = function () {

    "use strict";

    var API_URL = 'api.php';
    var NATIVE_LANG = 'en';
    var logging = true;

    function log(message, indent) {
        if (typeof indent === 'undefined') {
            indent = 0;
        }
        
        if (logging === true && typeof console !== 'undefined') {
            var spaces = "";
            for (var i=0, l = indent.length; i < l; i++) {
                spaces += "   ";
            }
            console.log(spaces, message);
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
        lang_list : {},     // list of valid markets
        lang_count : null,  // list of valid markets

        json : {},          // saved json from the ajax querys
        table_json : null,  // hold the current table's JSON
        past_search : null  // a way to filter out the file list faster.
    };

    /***
     * The abstraction of db
     */
    var model = {
        logging : false,
        /***
         * These are getters and setters jQuery style
         * If there IS somthing passed it will set it
         * and return if it worked
         * 
         * if not it will simply get the value
         */
        market : function (new_val) {

            // GET the value
            if (typeof new_val === 'undefined') {

                return db.market;

            } else { // SET the value

                var old_market = db.market;

                if ($.inArray(new_val, db.market_list) !== -1) {
                    if (this.logging === true) {
                        log('SET db.market (' + old_market + ') -> (' + new_val + ')');
                    }

                    db.market = new_val;
                    return true;
                } else {
                    err('Setting to invalid Market ' + new_val);
                    log(db.market_list);
                    return false;
                }
            }

        },
        cat : function (new_val) {
            if (typeof new_val === 'undefined') {

                return db.cat;

            } else {
                var old_cat = db.cat;

                if (this.find_in_arary_obj(new_val, db.cat_list, 'key') !== -1) {
                    if (this.logging === true) {
                        log('SET db.cat (' + old_cat + ') -> (' + new_val + ')');
                    }
                    db.cat = new_val;
                    return true;
                } else {
                    err('Setting to invalid Cat ' + new_val);
                    return false;
                }
            }
        },
        lang : function (new_val) {
            if (typeof new_val === 'undefined') {

                return db.lang;

            } else {
                var old_lang = db.lang;

                if (new_val === 'all') {
                    if (this.logging === true) {
                        log('SET db.lang (' + old_lang + ') -> (' + new_val + ')');
                    }
                    db.lang = new_val;
                    return true;
                }
                if (typeof db.lang_list[db.market][db.cat][new_val] !== 'undefined') {
                    if (this.logging === true) {
                        log('SET db.lang (' + old_lang + ') -> (' + new_val + ')');
                    }
                    db.lang = new_val;
                    return true;
                } else {
                    err('Setting to invalid Lang ' + new_val);
                    return false;
                }
            }
        },
        market_list : function () {
            return db.market_list;
        },
        cat_list : function () {
            return db.cat_list;
        },
        /***
         * Get the lang list for the spesified market and category
         * default to the current one. 
         */
        lang_list : function (market, cat) {

            market = market || db.market;
            cat = cat || db.cat;

            return db.lang_list[market][cat]; // ERROR:  Cannot read property 'applications' of undefined 
        },
        /***
         * pass in the langage local code
         * get the language name
         */
        lang_name : function (key) {
            return db.lang_list[key];
        },
        /***
         * this one kinda breaks convention
         * if a key is passed it will return a spesific language
         * if not it will return the whole list
         */
        lang_count : function (key) {
            if (typeof key === 'undefined') {
                return db.lang_count;
            } else {
                return db.lang_count[key];
            }
        },
        json : function () {
            return db.json;
        },

        /***
         * Checks if lists where loaded properly
         *
         * @returns {booleen} did lists for the sidebar and market load properly
         */
        are_lists_loaded : function () {
            return (db.market_list !== null && db.cat_list !== null );
        },

        /***
         * returns a JSON string that has market and cat in it too
         * in case you want to list that in the table. 
         */
        table_json : function (market, cat) {
            // check if they are false (hopefully undefined!)
            // if so set to the current market/cat
            market = market || db.market;
            cat = cat || db.cat;

            var json = null;

            if (typeof db.json[market][cat] !== 'undefined') {
                json = db.json[market][cat].cat;
            } else {
                log(market, cat, db.json);
                err("db.json does not contain the right market / category", json);
                return false;
            }
            var table_json = [];
            var lang_count = {};

            for (var i = 0, l = json.length; i < l; i ++) {
                var file = json[i],
                lang_list = [];  // a list of languages in a file.
                file.market = market;
                file.cat = cat;


                for (var lang in file.langs) {
                    if(file.langs.hasOwnProperty(lang)) {

                        lang_list.push(lang);

                        // will make it 1 if it's empty or add one to the count
                        // otherwise
                        lang_count[lang] = ++lang_count[lang] || 1;

                    }
                }

                file.lang_list = lang_list; 

                table_json.push(file);
            }

            db.lang_count = lang_count;

            return table_json;
        },
        /***
         * Gets a list of categories and markets from the API
         *
         * @callback {function} ({boolean} failed, {string} message)} 
         *      a function that is called after request was success or failure 
         */
        ajax_lists : function (callback) {
            var me = this;
            var request = $.post("api.php", {}, function (json) {
                if (json.error === false) {
                    // Save a list of valid markets
                    db.market_list = json.markets;

                    // Save a list of valid categories
                    db.cat_list = model.object_to_array(json.cats);

                    // Set the first one in each list as a default
                    me.market(db.market_list[0]);
                    me.cat(db.cat_list[0].key);

                    callback(true, json.mes);
                } else {
                    callback(false, json.mess);
                }
            }, 'json');

            // If there was an Error with the API call
            request.fail(function (mess) {
                log(mess);
                callback(false, "API was not reached, ");
            });
        },
        /***
         * Gets a list of files in a category
         * @callback {function} ({boolean} worked)
         *      function to be run after the AJAX failed or ran
         *      passing a boolean if worked or not. 
         */
        files_load : function (callback) {

            // if the entry already exist in local storage
            if (db.json.hasOwnProperty(db.market) &&
                db.json[db.market].hasOwnProperty(db.cat) ) {

                callback(true);

            } else { // if the entry doesn't, load it into the storage

                if (db.market !== null && db.cat !== null ) {
                    var request = $.post(API_URL, { "market":db.market, "cat":db.cat }, function (json) {

                        //creates an entry for the market if there isn't one
                        db.json[db.market] = db.json[db.market] || {};

                        //creates the place to store the json for reuse
                        db.json[db.market][db.cat] = json;

                        //adds the_lang_list values
                        db.lang_list[db.market] = db.lang_list[ db.market ] || {};
                        db.lang_list[db.market][db.cat] = json.langs;

                        callback(true);
                    }, "json");

                    request.fail(function () {
                        err('ajax_to_db: Unable to connect to API');
                        callback(false);
                    });

                } else { // if one is not set
                    err('ajax_to_db: ERROR: db.market = ' + db.market + ' db.cat = ' + db.cat + ' can not load file list');
                }
            }
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
                current_class : ".current_page_item",
                cats : $(".cat_link"),
                cat_links : $(".cat_link a")
            }
        },
        table : {
            populate : function(json) {
                if (typeof json === 'undefined') {
                    json = model.table_json();
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
                        row = row.replace("(LANG)", model.lang_list()[row_data.lang_list[0]]);
                    } else {
                        row = row.replace("(LANG)", row_data.lang_list.join(', '));
                    }
                    row = row.replace("(DL_LINK)", row_data.url || "#");

                    table_html += row;
                }

                view.$ui.table.first_body.html(table_html);
                view.error.clear();
            },
            lang_filter : function(lang) {
                var json = model.table_json(),
                filtered_json = [],
                num_found = 0,
                i = 0;

                lang = lang || model.lang();

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

                var list = model.cat_list();
                var market = model.market();
                var cat = model.cat();
                var li = "";
                for (var i = 0, l = list.length; i < l; i++) {
                    var page = list[i];
                    li = copy;

                    li = li.replace(/\(CAT\)/g, page.key);
                    li = li.replace("(HREF)", "#cat/" + market + "/" + page.key);
                    li = li.replace("(TITLE)", page.value);


                    html += li;
                }
                //set the sidebar
                view.$ui.sidebar.ul.html(html);
                this.set_current();
            }, 
            set_current : function () {
                var sidebar = view.$ui.sidebar;
                //remove current one
                $(sidebar.current_class).removeClass(sidebar.current_class.slice(1));

                //change to the new one
                sidebar.ul.find( "#cat_" + model.cat() ).
                    addClass(sidebar.current_class.slice(1));
            }
        },
        market_DD : {
            populate : function () {
                var list = model.market_list();
                var html;
                var temp = '<option value="(NAME)">(NAME)</option>';
                for (var i = list.length - 1; i >= 0; i--) {
                    var option = temp.replace(/\(NAME\)/g, list[i]);
                    html += option;
                }
                view.$ui.DD.market.html(html);
            },
            update : function () {
                view.$ui.DD.market.val( model.market() );
            }

        },
        lang_DD : {
            populate : function () {
                var langs = model.lang_list();
                var html;
                var temp = '<option value="(VAL)">(NAME)</option>';
                var count = model.lang_count();
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
                view.$ui.DD.lang.html(html).val(NATIVE_LANG);
            }
        },
        error: {
            hide_all : function () {
                view.$ui.table.all.hide();
                for (var single in view.$ui.error) {
                    if(view.$ui.error.hasOwnProperty(single)) {
                        view.$ui.error[single].hide();
                    }
                }
                return true;
            },
            ajax : function () {
                this.hide_all();
                view.$ui.error.ajax.show();
            },
            none_found : function () {
                this.hide_all();
                view.$ui.error.none_found.show();
            },
            clear : function () {
                this.hide_all();
                view.$ui.table.all.show();
            },
            loading : function () {
                this.hide_all();
                view.$ui.error.loading.show();
            }
        }
    };

    /***
     * this is the controller, it relies on 'events'
     * which are a collection of DOM manipulations
     * which are tied to some event in the browser
     */
    var event = {

        /***
         * Create a router in router.js
         * @arg {booleen} if you want to log or not.
         */
        router : new Router(false), 

        /***
         * the way to load any page
         *
         * @peram {string} tag of page.
         */
        page_load: function(page) {
            /***
             * populate the table when there's files
             */
            function table_populate() {
                ajax_load_table(function () {
                    if (worked === true) {
                        view.table.populate();
                        view.langs_DD.populate();
                        view.market_DD.update();
                        view.errors.clear();
                    } else  {
                        view.errors.table_ajax();
                    }
                });
            }

            if (model.page_setup() === true) {

                table_populate();

            } else { // page needs to be loaded

                // load API data into the model
                ajax_load_lists(function(worked) {
                    if (worked === true) {
                        view.market_DD.populate();
                        view.pages.populate();
                    } else {
                        view.error.page_load();
                    }
                });

            }
        },

        hash_load : function () {
            router.get_hash();
        },

        /***
         * To be fired on page load (jQuery event)
         *
         * NOTE: ASYNC
         */
        ajax_page_load : function () {
            if (model.are_lists_loaded() === true) {

                event.ajax_table_populate();

            } else {

                model.ajax_lists(function (worked, mess) {

                    if (worked === true) {
                        view.sidebar.populate();
                        view.lang_DD.populate();
                        view.market_DD.populate();
                        event.ajax_table_populate();
                    } else {
                        view.error.ajax();
                    }

                });

            }
        },

        /***
         * This will load the file list into the table from the API
         * NOTE: ASYNC 
         */
        ajax_table_populate : function () {
            console.log("event.ajax_table_populate");

            /***
             * create a function as a callback
             * to model.files_load below
             */
            var table_load = function(worked) {
                if (worked === true) {
                    console.log("   AJAX worked");
                    console.log("   populating table");
                    view.table.populate();
                } else {
                    view.error.ajax();
                }
            };

            model.files_load(table_load);
        },

        /***
         * Changes which category page we're on
         *
         * NOTE: USED?
         */
        change_cat : function (cat) {
            view.error.clear();
            if (model.cat(cat)) {
                event.ajax_page_load();
            } else {
                return false;
            }
        },

        /***
         * Changes which market we're in
         */
        change_market : function (market) {
            view.error.clear();
            if (model.market(market)) {
                event.ajax_page_load();
                return true;
            } else {
                return false;
            }
        },

        /***
         * Filters out all files in another language
         */
        change_lang : function (lang) {
            view.error.clear();
            if (model.lang(lang)) {
                model.files_load(function (no_error) {

                    if (no_error === true) {
                        if (view.table.lang_filter()) {
                            view.error.none_found();
                        }
                    } else { view.error.ajax(); }

                });
            }
        },

        /***
         * Loads market and category if they exist in the hash. 
         */
        hash_load_cat : function(market, cat, lang) {

            if ( model.market(market) && model.cat(cat) ) {

                setTimeout(view.sidebar.set_current, 0);

                this.ajax_table_populate(function (worked) {
                    if (worked === true) {
                        setTimeout(function () {
                            view.lang_DD.populate();
                            view.market_DD.update();
                            view.table.populate();
                            model.show();
                        }, 0);
                    } else {
                        view.error.ajax();
                    }
                });

            }  
        },

        /***
         * bind or rebind all the dom elements
         */
        bind : function () {
            var $ui = view.$ui;
            $ui.DD.market.change(function () {
                event.change_market($(this).val());
            });

            $ui.DD.lang.change(function () {
                event.change_lang($(this).val());
            });

            this.router.add("#cat", function (args) {
                event.hash_load(args[0], args[1]);
            });


            $ui.error.ajax.find("a").click(function (e) {
                e.preventDefault();
                view.error.loading();
                event.ajax_page_load();
            });

        },
    };

    event.bind();

    return {
        "model" : model,
        "view" : view,
        "event" : event
    };
};

var k = new Kdown();
k.event.ajax_page_load();
