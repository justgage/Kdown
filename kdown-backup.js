/***
 * @name Kdown ~ Kyani download interface
 *
 * @constructor
 */

Kdown = function () {
    "use strict";

    /***
     * config constants
     */
    var LOGGING = false,
    MY_LANG = 'en',
    MY_MARKET = 'usa-can',
    API_URL = 'api.php',
    NAMES_URL = 'files/market_lang.json';

    /***
     * commonly used jQuery objects.
     */
    var $ui = {
        table: {
            all : $('#dl_table_all'),
            each : $('.dl_table'),
            first : $('#dl_table_first'),
            first_body : $('#dl_table_first').find('tbody'),
            second : $('#dl_table_second'),
            second_body : $('#dl_table_second').find('tbody')
        },
        error : {
            loading : $('#dl_loading'),
            ajax : $('#ajax_error'),
            none_found : $('#none_found'),
            none_found_first : $('#none_found_first'),
            none_found_second : $('#none_found_second')
        },
        DD : {
            market : $('#market_select'),
            lang : $('#lang_select')
        },
        sidebar: {
            ul: $('#vertical_nav ul'),
            current_class : '.current_page_item',
            cats : $('.cat_link'),
            cat_links : $('.cat_link a')
        },
        search : {
            box : $('#dl_search_box'),
            form : $('#dl_search_form'),
            mess : $('#search_mess'),
            other_options : $('#other_options'),
            second_link : $('#second_link')
        },
        file_pane : {
            pane : $('.file_pane'),
        }
    };

    /***
     * db
     *
     * holds all the information about the state of the page
     *
     * see bubpub.obj in the bubpub README for more info.
     */
    var db = {

        // list of valid markets
        market_list : new bubpub.obj('list/markets'),
        // list of valid languages
        lang_list : new bubpub.obj('list/langs', {}),
        // list of valid categories
        cat_list : new bubpub.obj('list/cats'),

        // current page
        page : new bubpub.obj('document/sidebar/page', 'cat'),
        
        // current category
        cat : new bubpub.obj('document/sidebar/cat', null, function (test) {
            return test === 'search' || test in db.cat_list();
        }),

        // current market
        market : new bubpub.obj('document/DD/market', null, function (test) {
            return test in db.market_list();
        }),

        // current translation selected
        lang : new bubpub.obj('document/DD/lang', null, function (test) {
            return test in model.current_lang_list();
        }),

        // search string
        search : new bubpub.obj('document/search', ""),

        // each language's count [lang] => count
        lang_count : new bubpub.obj('lang_count'),
        // hold the current table's JSON
        file_tree : new bubpub.obj('file_tree/load', {}),

            // hold the hash in the URL
        hash : new bubpub.obj('hash', "", function (test) {
            return test !== "hash";
        }),

        pages : {
            search : 'All Documents'
        },

        /***
         * @name db.log
         * an easy way to get a log of the current state of the DB.
         * (used for debugging)
         */
        log : function () {
            console.group("DB");
            console.log("page : ", this.page());
            console.log("market_list : ", this.market_list());
            console.log("lang_list : ", this.lang_list());
            console.log("cat_list : ", this.cat_list());
            console.log("");

            console.log("market: ",  db.market());
            console.log("cat: ",  db.cat());
            console.log("lang: ",  db.lang());
            console.log("");

            console.log("search: ",  '"' + db.search() + '"' );
            console.log("");

            console.log("lang_count: ",  db.lang_count());
            console.log("file_tree: ",  db.file_tree());
            console.log("");

            console.log("hash: ", '"' +  db.hash() + '"' );
            console.log("");
            console.groupEnd("DB");
        }


    };

    /***
     * helper functions for the DB
     */
    var model = {

        /***
         * @name model.sort_file_list
         * @arg {arr} file_list a array of files
         * @return {arr} sorted file list
         */
        sort_file_list : function sort_file_list(file_list) {
            var compare = function sort_compare(a, b) {

                a = a.name.toLocaleLowerCase();
                b = b.name.toLocaleLowerCase();

                return a.localeCompare(b);
            };

            return file_list.sort(compare);
        },

        /***
         * @name model.get_current_file_list
         */
         get_current_file_list : function () {
            var tree = db.file_tree(); // get all files
            var market = db.market();
            var lang = db.lang();
            var cat = db.cat();

            // do we have it in file_tree?
            if (typeof tree[market] === 'undefined' ||
                typeof tree[market][lang] === 'undefined') {
                return null;
            } else {
                var current_tree = tree[market][lang];


                if (cat !== 'search') {
                    return current_tree[ db.cat_list()[cat] ];
                } else {
                    return $.map(current_tree, function (item) {
                        return item;
                    });
                }
            }
        },

        /***
         * @name model.current_file_list_update
         *
         * changes model.current_file_list() to current
         * market/lang one loading it with AJAX if
         * it doesn't exist
         *
         */
        current_file_list_update : function () {

           console.log("current_file_list update!!!!");

            var market = db.market();
            var lang = db.lang();
            var tree = this.get_current_file_list();

            // do we have it in file_tree?
            if (tree === null) {
                console.log("no current tree, ajax load...");

                // load it ajax wise
                API.load_file_tree();

            } else {
                console.log("oh we already have that tree setting it...");
                table.file_list( tree );
            }
        },

        /***
         * @name current_lang_list
         * Return the langs in the current market
         *
         * @arg {string} market URL safe (see function) version of the market to look in
         * @arg {string} category URL safe (see function) version of the category to look in
         *
         * @returns {array} list of languages in the specified market and category.
         */
        current_lang_list : function current_lang_list(market) {
            var lang_list = db.lang_list();
            market = market || db.market();

            return lang_list[market];
        },

        /***
         * @name model.set_defaults
         * will set the market, category, language to a default one if they are null.
         */
        set_defaults : function set_defaults() {
            console.log("set_defaults");

            if (db.market() === null) {
                db.market(MY_MARKET);
            }

            if (db.lang() === null) {
                db.lang(MY_LANG);
            }

            if (db.cat() === null) {
                var cat_list = db.cat_list();
                if (cat_list !== null) {
                    for (var def_cat in cat_list) break;
                    db.cat(def_cat);
                } else {
                    console.log("CAT not set to default");
                }
            }
        },

    };

    /***
     * @name table {object}
     * an object that represents the table area of the page.
     *
     * used to:
     *      change what the table contains (file list)
     *      and to change the messages displayed where the table would be.
     */
    var table = (function () {
        // the file_list that the table is currently populated with. 
        var file_list = new bubpub.obj('table/file_list');

        var message = bubpub.obj('table/mess'); 

        var other_table_list = null;
        var table_row = '<tr>' + $('#table_copy').html() + '</tr>';
        var table_row_second = '<tr>' + $('#table_copy_second').html() + '</tr>';

        bubpub.listen('table/mess', function update_message() {

            switch ( message() ) {
                // just display normal table
                case "NORMAL":
                    view.error.clear();
                break;

                // just display normal table
                case "SEARCH":
                    view.error.clear();
                break;

                // just display normal table
                case "NONE_FOUND":
                    view.error.none_found();
                break;

                // just display normal table
                case "AJAX_ERROR":
                    view.error.ajax();
                break;

                case "LOADING":
                    view.error.loading();
                break;

                default:
                    console.error("table.message set to bad value! -> " + message());
                break;
            }
        });

        bubpub.listen('table/file_list', function () {
            if (file_list() !== null) {
                message("NORMAL");
                table.populate( file_list() );
            } else {
                message("NONE_FOUND");
            }
        });

        // return table helper object
        return {
            message : message,
            file_list : file_list,

            /***
             * @name table.populate
             *
             * fill a table with a list of files.
             *
             * @arg {array} file_list (optional) a array of files to fill the table with.
             * @arg {object} lang_list (optional) a mapping of the language code to the language name.
             *                         eg: {"en" : "English", "es" : "Spanish", ... }
             * @arg {number} table_num (optional) which table to fill, 1 or 2? (second only used for search)
             */

            populate : function(file_list, lang_list, table_num) {

                lang_list = lang_list || model.current_lang_list();
                table_num = table_num || 1;

                var copy = "";
                var $table = "";
                var table_html = '';
                var market_list = db.market_list();
                var lang = lang_list[ db.lang() ];
                var market = market_list[ db.market() ];
                var row;
                var i;
                var l;

                if (table_num === 1) {
                    $table = $ui.table.first_body;
                    copy = table_row;
                } else {
                    $table = $ui.table.second_body;
                    copy = table_row_second;
                }

                row = copy;

                // Sort it by name
                file_list = model.sort_file_list(file_list);

                //generate each file's HTML
                for (i=0, l = file_list.length; i < l; i++) {

                    var file = file_list[i];

                    row = copy;

                    row = row.replace('(NUM)', 1 + i);
                    row = row.replace('(NAME)', file.name);
                    row = row.replace('(ID)', file.id);
                    row = row.replace('(DL_LINK)', file.url);
                    row = row.replace('(LANG)', lang);
                    row = row.replace('(MARKET)', market);
                    row = row.replace('(FILETYPE)', file.file_ext);


                    table_html += row;
                }

                // dump into the table
                $table.html(table_html);

                message("NORMAL");
            },

            /***
             * @name table.search
             * search all files name in the database for the search string.
             *
             * @arg {string} search_str string to search for in file.name.
             */
            search : function table_search(search_str) {
                search_str = search_str || db.search();
                search_str = search_str.toLocaleLowerCase(); 
                var file_list = model.get_current_file_list(),
                main_list = [],
                other_list = [],
                market = db.market(),
                lang = db.lang(),
                lang_count = {};

                console.groupCollapsed("Search");


                for (var i=0, l = file_list.length; i < l; i++) {
                    var file = file_list[i];

                    // If file name contains search string
                    if (search_str === "" || file.name.toLowerCase().indexOf(search_str) > -1) {
                        main_list.push(file);
                    }

                }

                console.groupEnd("Search");

                this.search_view(main_list, other_list);

            },
            /***
             * @name table.search_view
             *
             * this will decide how the search results are displayed
             *
             * @arg {obj} main_list a list of files found in search in
             *                      current market / lang
             * @arg {obj} other_list a list of files found in search
             *                      NOT in current market / lang
             */
            search_view : function table_search_view(main_list, other_list) {

                // IS files in main list
                if (main_list.length > 0) {
                    console.log("main_list > 0");
                    table.populate(main_list);
                    view.error.found_first(); //TODO change for message
                } else {
                    console.log("main_list NONE");
                    view.error.none_found_first(); //TODO change for message
                }

                if (other_list.length > 0) {
                    console.log("other_list > 0");
                    $ui.search.other_options.show();
                    $ui.search.second_link.
                        find("span").
                        text(other_list.length);
                } else {
                    console.log("other_list NONE");
                    $ui.search.other_options.hide();
                }

                this.other_table_list = other_list;

                $ui.table.second.hide();

            },
            /***
             * @name table.show_other_table
             */
            show_other_table : function show_other_table() {
                table.populate(this.other_table_list, null, 2);
                $ui.table.second.fadeIn();
            }
        };
    })(); // <-- SELF EVALUATING FUNCTION

    /***
     * view
     *
     * helper functions/objects with handling the DOM.
     */
    var view = {
        /***
         * @name view.copy
         * the html of the copy objects used for tempesting
         */
        copy : {
            cat : $('#copy-cat').html(),
            page : $('#copy-page').html()
        },

        /***
         * @name view.hash
         * helper object to deal with the hash in the URL.
         */
        hash : {

            /***
             * @name hash.url_import
             * import the information into the hash to the db.
             */
            url_import : function url_import() {
                var hash_str = window.location.hash;

                if (hash_str === '' || db.file_tree() === null) {
                    return false;
                }

                // if anything is null.
                if (hash_str.indexOf('null') !== -1) {
                    hash_str = '#cat';
                }

                var hash = hash_str.split('/');
                var page = hash[0].slice(1);

                db.page(page);

                if (page === 'cat') {
                    db.market(hash[1]);
                    db.lang(hash[2]);

                    if (db.cat_list() !== null) {
                        db.cat(hash[3]);

                    } else {
                        db.cat_temp = hash[3]; // TODO add this or get rid of this
                    }

                }

                if (page === 'search') {
                    db.market(hash[1]);
                    db.lang(hash[2]);
                    if (hash.length > 3) {
                        db.search( decodeURI(hash[3]) );
                    } else {
                        db.search("");
                    }
                }

                return true;
            },

            /***
             * @name hash.url_export
             * export the db information to the hash for the current page
             */
            url_export : function url_export() {
                var page = db.page();
                var hash = '#' + page;

                if (page === 'cat') {
                    hash += '/' + db.market();
                    hash += '/' + db.lang();
                    hash += '/' + db.cat();
                }

                if (page === 'search') {
                    hash += '/' + db.market();
                    hash += '/' + db.lang();
                    if (db.search() !== "") {
                        hash += '/' + encodeURI(db.search());
                    }
                }
                window.location.hash = hash;
                db.hash(hash);
            }
        },

        /***
         * @name view.sidebar
         * helper object with the links in the sidebar
         */
        sidebar : {
            /***
             * @name sidebar.populate
             *
             * fill the sidebar with categories and pages
             */
            populate : function sidebar_populate() {
                var copy_cat = view.copy.cat,
                pages = db.pages,
                html = '',
                cat_list = db.cat_list();

                /***
                 * will replace the appropriate fields.
                 */
                var make_page = function(copy, code, href, title, page) {

                    var li = copy;

                    li = li.replace(/\(PAGE\)/g, page);
                    li = li.replace(/\(CAT\)/g, code);
                    li = li.replace('(HREF)', href);
                    li = li.replace('(TITLE)', title);

                    return li;
                };

                // make a page for each category
                for (var code in cat_list) {
                    if(cat_list.hasOwnProperty(code)) {
                        var cat_name = cat_list[code];
                        html += make_page(copy_cat, code, '#', cat_name, 'cat');
                    }
                }

                // add all other page.
                for (var page_code in pages) {
                    if(pages.hasOwnProperty(page_code)) {
                        var page_name = pages[page_code];
                        html += make_page(copy_cat, page_code, '#', page_name, 'page');
                    }
                }

                //set the sidebar
                $ui.sidebar.ul.html(html).show();
                this.set_current();
            },

            /***
             * @name sidebar.set_current
             * Change with page is selected in the sidebar.
             */
            set_current : function sidebar_set_current() {
                var sidebar = $ui.sidebar;
                //remove current one
                $($ui.sidebar.current_class).
                    removeClass($ui.sidebar.current_class.slice(1));

                //change to the new one
                if (db.page() === 'cat') {
                    sidebar.ul.find( '#cat_' + db.cat() ).
                        addClass(sidebar.current_class.slice(1));
                } else {
                    sidebar.ul.find( '#page_' + db.page() ).
                        addClass(sidebar.current_class.slice(1));
                }
            }
        },

        /***
         * @name view.market_DD
         * helps with interaction with the market drop down.
         */
        market_DD : {
            /***
             * @name market_DD.populate
             * fill the market drop down with markets in db.market_list
             */
            populate : function market_DD_populate() {

                var list = db.market_list();
                var html;
                var temp = '<option value="(CODE)">(NAME)</option>';
                for (var item in list) {
                    if(list.hasOwnProperty(item)) {
                        var option = temp.replace('(NAME)', list[item]);
                        option = option.replace('(CODE)', item);
                        html += option;
                    }
                }
                $ui.DD.market.html(html);

                this.update();
            },

            /***
             * @name market_DD.update
             *
             * change which one is selected in the DOM based on db.market
             */
            update : function market_DD_update() {
                $ui.DD.market.val( db.market() );
            }

        },
        /***
         * @name view.lang_DD
         * helps with interaction with the language drop down.
         */
        lang_DD : {
            /***
             * @name lang_DD.populate
             *
             * @arg {object} count a object assosiating the language code with the amount in the table
             *                     eg {"en" : 2, "es" : 4...}
             */
            populate : function lang_DD_populate(count) {

                var langs = model.current_lang_list();
                var temp = '<option value="(VAL)">(NAME)</option>';
                var option = "";
                var html;

                // add each lang to the drop down HTML
                for (var code in langs) {
                    if(langs.hasOwnProperty(code)) {
                        var name = langs[code];
                        option = temp;

                        option = option.replace("(VAL)", code);
                        option = option.replace("(NAME)", name );
                        html += option;

                    }
                }
                $ui.DD.lang.html(html).val(db.lang());
            },

            /***
             * @name lang_DD.spaces_align
             * creates a table using spaces based on padding.
             * Used for making the lang count in the lang drop down
             *
             *                eg:"1   English"
             *                   "4   Spanish"
             *                   "12  Japanese"
             *                        ^- notice how this row is lined up
             *
             * @arg {string} col1 the thing in the first row.
             * @arg {string} col2 the thing in the second row.
             *
             * @var padding how many characters wide to have col1 be.
             *
             * @return string a row in the table that has col2 lined up.
             */
            spaces_align : function lang_DD_spaces_align(col1, col2) {
                var padding = 4,
                spaces = [];
                col1 = col1 + '';
                col2 = col2 + '';

                for (var ii = 0, l = padding - col1.length; ii< l; ii++) {
                    spaces.push('\u00A0');  //this is the char for a non-breaking space
                }
                return  col1 + spaces.join(' ') + col2;
            }
        },

        /***
         * @name view.error
         * helper with hiding and showing error messages
         */
        error: {
            /***
             * @name error.hide_all
             * hide all tables and error messages
             */
            hide_all : function error_hide_all  () {
                $ui.table.all.hide();
                for (var single in $ui.error) {
                    if($ui.error.hasOwnProperty(single)) {
                        $ui.error[single].hide();
                    }
                }
                return true;
            },

            /***
             * @name error.ajax
             * show ajax error
             */
            ajax : function () {
                this.hide_all();
                $ui.error.ajax.show();
            },

            /***
             * @name error.none_found
             *
             * show 'no files found message'
             */
            none_found : function () {
                this.hide_all();
                $ui.error.none_found.show();
            },

            /***
             * @name error.found_first
             * Show first table (used in the search)
             */
            found_first : function () {
                $ui.table.first.show();
                this.clear();
            },

            /***
             * @name error.none_found_first
             * show message that none where found in the first table
             */
            none_found_first : function () {
                $ui.table.first.hide();
                $ui.error.none_found_first.show();
            },

            /***
             * @name error.none_found_second
             * show message that none where found in the second table
             */
            none_found_second : function () {
                //$ui.table.second.hide();
                // $ui.error.none_found_second.show();
            },

            /***
             * @name error.clear
             * clear all error messages and show table (used in normal category view)
             */
            clear : function () {
                this.hide_all();
                $ui.table.all.stop().fadeIn();
            },

            /***
             * @name error.loading
             * Show loading throbber for ajax
             */
            loading : function () {
                this.hide_all();
                $ui.error.loading.show();
            }
        },
        file_pane : {
            open : function (id) {
                var $pane = $ui.file_pane.pane;

                console.log(id);

                //close it
                this.close();
                // reopen it in a second
                // to show that it's changed
                window.setTimeout(function () {
                    $pane.
                        addClass("file_pane_show").
                        scrollTop(0).
                        removeClass("file_pane_hide");
                }, 200);
            },
            close : function () {
                $ui.file_pane.pane.
                    removeClass("file_pane_show").
                    addClass("file_pane_hide");
            }
        }
    };

    /***
     * @name API
     * Handles all the AJAX requests.
     */
    var API = {
        /***
         * @name API.load_lists
         * load enough to start off the page.
         */
        load_lists : function () {

            var promise = $.get(NAMES_URL, {}, null, 'json');
            table.message("LOADING");

            promise.done(function promise_list_done(json) {
                API.save_lists_json(json);
                model.set_defaults();

            });

            promise.fail(function (error_obj) {
                console.log('FAIL', error_obj);
                table.message("AJAX");
            });

        },

        /***
         * @name API.load_file_tree
         */
        load_file_tree : function () {

            var market = db.market();
            var lang = db.lang();

            var request = {
                "market" : market,
                "lang" : lang
            };

            var promise = $.post(API_URL, request, null, 'json');

            promise.done(function (json) {
                if (json.error === false) {

                    var temp_tree = {};
                    var tree = db.file_tree();
                    var cat_list = db.cat_list();
                    var code = "";

                    temp_tree[market] = {};
                    temp_tree[market][lang] = json.cats;

                    $.extend(tree, temp_tree);


                    // make cat_list if needed
                    if (cat_list === null) {
                        cat_list = [];

                        for (var cat in json.cats) {
                            if(json.cats.hasOwnProperty(cat)) {
                                code = url_safe(cat);

                                cat_list[code] = cat;
                            }
                        }

                        db.cat_list(cat_list);
                    }

                    db.file_tree(tree);

                    var current = model.get_current_file_list();

                    if ( table.file_list(current)) {
                        console.log("ajax CHANGED somthing!", current);
                    } else {
                        console.log("didn't change anything!", current, db.cat());
                    }

                    view.hash.url_import();
                    model.set_defaults();

                } else {

                    console.log("AJAX_ERROR:", json);

                    table.file_list(null);
                    bubpub.say('file_tree/current');

                }
            });

            promise.fail(function () {
                console.log(API_URL, "failed");
            });
        },

        /***
         * @name API.save_lists_json
         * Save all list from market_lang.json
         *
         * @arg {obj} json an object with two master lists, language and market.
         */
        save_lists_json : function (json) {
            db.market_list(json.markets);
            db.lang_list(json.langs);
        }
    };

        /***
         * @name start
         * first function to run
         *
         * contains all the bubpub listeners
         */
        var start = function () {

            /****************************************************
             * BUBPUB: page changes
             ****************************************************/

            bubpub.listen('document/sidebar', function sidebar_change() {
                var page = db.page();

                if (page === 'cat') {

                    $ui.search.mess.hide();
                    $ui.search.other_options.hide();
                    $ui.search.box.
                        removeClass('dl_search_big').
                        addClass('dl_search_small');

                } else if (page === 'search') {
                    bubpub.say('table/search');


                    var search = db.search();

                    if (search === "") {
                        $ui.search.mess.hide();
                    } else {
                        $ui.search.mess.show().find('span').text( db.search() );
                    }

                }

                $ui.table.first.show();
                $ui.table.second.hide();

            });

            // TODO NEEDED?
            bubpub.listen('table/search', function page_change() {

                //make search box big
                $ui.search.box.
                    addClass('dl_search_big').
                    removeClass('dl_search_small').
                    select().
                    focus();
            });

            bubpub.listen('document', function () {
                model.current_file_list_update();
            });

            bubpub.listen('document/DD', function market_change() {
                view.market_DD.update();
                view.lang_DD.populate();
            });

            bubpub.listen('document/sidebar', function sidebar_change() {
                view.sidebar.set_current();
            });

            bubpub.listen('document/search', function search_update() {
                var search = db.search();
                $ui.search.form.find('#dl_search_box').val(search);
                view.hash.url_export();
            });

            /****************************************************
             * BUBPUB: lists
             ****************************************************/

            bubpub.listen('list/markets', function market_list_change() {
                view.market_DD.populate();
                
                model.current_file_list_update();
            });

            bubpub.listen('list/langs', function market_list_change() {
                view.lang_DD.populate();
            });

            bubpub.listen('list/cats', function sidebar_populate() {
                view.sidebar.populate();
            });

            bubpub.listen('file_tree/current', function file_tree_current() {
                console.log("updating table");

                var file_list = table.file_list();
                console.log("file_list is", file_list);

                if (file_list !== null) {

                    table.populate(file_list);

                } else {
                    table.message("AJAX_ERROR");
                }
            });

            /****************************************************
             * BUBPUB: error
             ****************************************************/

            /***
             * Hash changed in the browser window (usually from clicking
             * the back or forward buttons)
             */
            bubpub.listen('hash', function hash_change() {
                view.hash.url_import();
            });


            /****************************************************
             * jQuery UI bindings
             ****************************************************/

            /***
             * Bind submitting the search form
             */
            $ui.search.form.submit(function search_submit(e) {
                e.preventDefault();
                var search_str = $('#dl_search_box').val();
                db.search(search_str);
                db.page("search");

            });

            /***
             * change the market drop down
             */
            $ui.DD.market.change(function market_DD_change() {
                db.market( $(this).val() );
                view.hash.url_export();
            });

            /***
             * change the language drop down
             */
            $ui.DD.lang.change(function lang_DD_change() {
                db.lang( $(this).val() );
                view.hash.url_export();
            });

            /***
             * Click on the name of a file opens up the side pane
             */
            $ui.table.each.delegate(".table_name a", "click", function (e) {
                // check the bug where click doesn't always register
                console.log("delegate click");
                e.preventDefault();
                var id = $(this).data("id");
                view.file_pane.open(id);
                return false; // don't propagate!
            });

            /***
             * anywhere on the page outside of the .file_pane
             * will close it
             */
            $(".center").click(function () {
                view.file_pane.close();
            });

            /***
             * click on link that allows you to see more market / languages
             * in the search.
             */
            $ui.search.second_link.click(function (e) {
                e.preventDefault();
                $ui.search.other_options.hide();
                table.show_other_table();
            });

            /***
             * click the sidebar tab
             */
            $ui.sidebar.ul.on('click', 'a', function (e) {
                e.preventDefault(); // stop hash change

                var $this = $(this).parent();
                var current = $ui.sidebar.current_class;
                var page = $this.data('page');

                if (db.cat( $this.data('cat') ) === true) {
                    table.message("LOADING");
                }

                console.log('click', page);

                // change current visually
                $(current).removeClass(current.slice(1));
                $(this).parent().addClass(current.slice(1));

                view.hash.url_export();

            });

            $(window).bind('hashchange', function () {
                db.hash( window.location.hash );
            });

            $ui.search.mess.click(function (e) {
                e.preventDefault(); // stop hash change
                db.search("");
            });

            $('#reload_img').click(function (e) {
                e.preventDefault(); // stop hash change

                API.load_lists();
            });

            $('#to_top').click(function () {
                $('html,body').animate({scrollTop:0},0);
            });

            API.load_lists();
        };

        /***
         * @name url_safe
         *
         * escape strings for the URL
         *
         * @arg {string} unsafe string to make URL safe
         * @return {string} string with all spaces and non
         *                  alpha-numeric characters turned to a '-'
         */
        var url_safe = function url_safe(unsafe) {
            return unsafe.toLocaleLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');
        };

        return {
            'start' : start,
            'view' : view,
            'table' : table,
            'db' : db,
            '$ui' : $ui,
            'API' : API
        };
};

var Kdown = new Kdown();

Kdown.start();

