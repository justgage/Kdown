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
    MY_CAT = null,
    API_URL = 'api.php',
    NAMES_URL = 'api.php';

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
            second_link : $('#second_link'),
            all_langs_link : $('#all_langs_link')
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
        page : new bubpub.obj('page/page', 'cat'),                         // current page

        market_list : new bubpub.obj('list/markets'),                      // list of valid markets
        cat_list : new bubpub.obj('list/cats'),                            // list of valid categories
        lang_list : new bubpub.obj('list/langs', {}),                      // list of valid languages
        file_list : new bubpub.obj('list/files'),                          // flat array list of files

        market : new bubpub.obj('page/cat/market', null, function (test) {
            return test in db.market_list();
        }),                                                                // current market
        cat : new bubpub.obj('page/cat/cat', null, function (test) {
            return test in db.cat_list();
        }),                                                                // current category
        lang : new bubpub.obj('page/cat/lang', null, function (test) {
            return test === 'all' || test in db.current_lang_list();
        }),                                                                // current translation selected (can be 'ALL')

        search : new bubpub.obj('page/search', ""),                        // search string

        lang_count : new bubpub.obj('lang_count'),                         // each language's count [lang] => count
        file_tree : new bubpub.obj('ajax/load'),                           // hold the current table's JSON

        hash : new bubpub.obj('hash'),                                     // hold the hash in the URL

        pages : {
            search : 'Search all Documents'
        },

        /***
         * @name db.sort_file_list
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
         * @name db.current_file_list
         * will get the current file list based on the current db.market and db.cat
         *
         * @arg {string} lang pass in a language to filter by 'all' get's all.
         * @returns {array} list of files in the current market, cat, and lang
         */
        current_file_list : function current_file_list(lang) {

            var tree = db.file_tree(); // get all files
            var market = db.market();
            var cat = db.cat();
            lang = lang || db.lang();

            if (typeof tree[market] === 'undefined') {
                return [];
            }

            if (typeof tree[market][cat] === 'undefined') {
                return [];
            }

            // filter out all files in other languages
            var list = $.map(tree[market][cat], function map_filter_lang(file) {
                if (lang === 'all' || file.language === lang) {
                    return file;
                }
            });

            return list;
        },

        /***
         * @name db.current_lang_count
         * count how many times a language is found in a file list to update the language dropdown count.
         *
         * @arg {arr} file_list a array of file objects
         *
         * @return {object} returns language counts in this structure -> { 'en' : 6, 'hk' : 0 ...}
         */
        current_lang_count : function current_lang_count(file_list) {

            file_list = file_list || this.current_file_list('all');

            var lang_count = {},
            i = file_list.length;

            while(i--) {
                var lang = file_list[i].language;
                lang_count[lang] = ++lang_count[lang] || 1;
            }

            return lang_count;
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
        current_lang_list : function current_lang_list(market, cat) {
            market = market || db.market();
            cat = cat || db.cat();
            var lang_list = db.lang_list();

            var current = lang_list[market];

            if (typeof current === 'undefined') {
                console.error("lang list doesn't exist?", market, "<-", lang_list);
                current = {};
            }

            return current;
        },

        /***
         * @name db.set_defaults
         * will set the market, category, language to a default one if they are null.
         */
        set_defaults : function set_defaults() {
            console.groupCollapsed('DEFAULTS');
            if (this.market() === null) {
                this.market(MY_MARKET);
            }

            if (this.cat() === null) {
                this.cat(MY_CAT);
            }

            if (this.lang() === null) {
                this.lang(MY_LANG);
            }
            console.groupEnd('DEFAULTS');
        }
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
            table_row : '<tr>' + $('#table_copy').html() + '</tr>',
            table_row_second : '<tr>' + $('#table_copy_second').html() + '</tr>',
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

                // if the page is on a category import from the hash.
                if (page === 'cat') {
                    db.market(hash[1]);
                    db.cat(hash[2]);
                    db.lang(hash[3]);

                    bubpub.say('cat'); // publish using bubpub
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
                    hash += '/' + db.cat();
                    hash += '/' + db.lang();
                }

                if (page === 'search') {
                    hash += '/' + db.market();
                    hash += '/' + db.lang();
                    if (db.search() !== "") {
                        hash += '/' + encodeURI(db.search());
                    }
                }
                window.location.hash = hash;
                db.hash("hash");
            }
        },

        /***
         * @name view.table
         * helper functions for manipulating the table.
         */
        table : {

            /***
             * used to store the other markets and languages table
             * html till needed.
             */
            other_table_list : null,

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

                var copy = "";
                var $table = "";
                var table_html = '';
                var lang = db.lang();
                var market_list = db.market_list();
                var row;
                var i;
                var l;

                lang_list = lang_list || db.current_lang_list();
                table_num = table_num || 1;

                if (table_num === 1) {
                    $table = $ui.table.first_body;
                    copy = view.copy.table_row;
                } else {
                    $table = $ui.table.second_body;
                    copy = view.copy.table_row_second;
                }

                row = copy;

                // Sort it by name
                file_list = db.sort_file_list(file_list);

                //generate each file's HTML
                for (i=0, l = file_list.length; i < l; i++) {

                    var file = file_list[i];

                    row = copy;

                    row = row.replace('(NUM)', 1 + i);
                    row = row.replace('(NAME)', file.name);
                    row = row.replace('(ID)', file.id);
                    row = row.replace('(DL_LINK)', file.url);

                    if (typeof lang_list[file.language] !== 'undefined') {
                        row = row.replace('(LANG)', lang_list[file.language]);
                    } else {
                        row = row.replace('(LANG)', file.language);
                    }

                    if (typeof market_list[file.market] !== 'undefined') {
                        row = row.replace('(MARKET)', market_list[file.market]);
                    } else {
                        row = row.replace('(MARKET)', file.market);
                    }


                    table_html += row;
                }

                // dump into the table
                $table.html(table_html);
            },

            /***
             * @name table.lang_filter
             * Filter all the files that don't contain the lang specified
             *
             * @arg {string} lang language code for the language which we want to find in the file list.
             *
             * @return
             */
            lang_filter : function(lang) {
                var file_list = db.table_json(), // TODO: table_json is invalid
                filtered_list = [],
                num_found = 0,
                i = 0, l;

                lang = lang || db.lang();

                if (lang === 'all') {
                    num_found = file_list.length;
                    this.populate();
                    i = 1;
                } else {
                    for (i = 0, l = file_list.length; i < l; i++) {
                        var file = file_list[i];
                        if (file.langs[lang]) {
                            num_found += 1;
                            filtered_list.push(file);
                        }
                    }
                    this.populate(filtered_list);
                }

                return num_found > 0;
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

                var file_list = db.file_list(),
                main_list = [],
                other_list = [],
                market = db.market(),
                lang = db.lang(),
                lang_count = {};

                console.groupCollapsed("Search");


                for (var i=0, l = file_list.length; i < l; i++) {
                    var file = file_list[i];

                    // If file name contains search string
                    if (search_str === "" ||
                        file.name.toLocaleLowerCase().indexOf(search_str) !== -1) {

                        if (file.market === market && ('all' === lang || file.language === lang)) {
                            console.log("main_list", file);
                            main_list.push(file);

                        } else {
                            console.log("other_list", file);
                            other_list.push(file);
                        }

                        if (file.market === market) {
                            lang_count[file.language] = ++lang_count[file.language] || 1;
                        }
                    }

                }

                // fill languages
                view.lang_DD.populate(lang_count);

                console.log(lang_count);
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

                if (main_list.length > 0) {
                    view.table.populate(main_list);
                    view.error.found_first();
                } else {
                    view.error.none_found_first();
                }

                if (other_list.length > 0) {
                    $ui.search.second_link.
                        find("span").
                        text(other_list.length);
                } else {
                    view.error.none_found();
                }

                $ui.search.other_options.show();

                if (db.lang() !== "all") {
                    $ui.search.all_langs_link.show();
                } else {
                    $ui.search.all_langs_link.hide();
                }

                this.other_table_list = other_list;

                $ui.table.second.hide();

            },
            /***
             * @name table.show_other_table
             */
            show_other_table : function show_other_table() {
                view.table.populate(this.other_table_list, null, 2);
                $ui.table.second.fadeIn();
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

                // add all other pages
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

                count = count || db.current_lang_count();
                var langs = db.current_lang_list();
                var html;
                var temp = '<option value="(VAL)">(NAME)</option>';
                var option = temp.replace("(VAL)", 'all');

                //add the all option at the top
                option = option.replace("(NAME)", 'All' );
                html += option;

                // add each lang to the drop down HTML
                for (var code in langs) {
                    if(langs.hasOwnProperty(code)) {
                        var name = langs[code],
                        num = count[code] || 0;

                        option = temp; // clear option html

                        name = this.spaces_align(num, name);

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
                $ui.table.first.stop().fadeIn();
                $ui.error.none_found_first.hide();
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
     * @name server
     * Handles all the AJAX requests.
     */
    var server = {
        /***
         * @name server.ajax_load_json
         * save the json in the proper formats
         */
        ajax_load_json : function () {
            var promise = $.post(API_URL, {}, null, 'json');
            var lists_promise = $.get(NAMES_URL, {}, null, 'json');

            // When BOTH are done, do this:
            $.when(promise, lists_promise).done(function (a1, a2) {
                server.save_lists_json( a2[0] );
                server.save_json( a1[0] );
                view.hash.url_import();
            });

            // If either Error out:
            lists_promise.fail(function (error_obj) {
                console.log('FAIL', error_obj);
                bubpub.say('ajax/fail');
            });

            promise.fail(function (error_obj) {
                console.log('FAIL', error_obj);
                bubpub.say('ajax/fail');
            });

            view.error.loading();
        },

        /***
         * @name server.save_json
         * Save all the ajax information from API
         * in proper format
         *
         * @arg {array} json json from api to save in db.
         */
        save_json : function (json) {

            console.group('save_json');

            if (json === null) {
                bubpub.say("ajax/fail");
                return;
            }

            var file_list  = json.files,
            market_list = {},
            cat_list    = {},
            file_tree   = {},
            i           = file_list.length;

            // go through every file (backwards!)
            while (i--) {
                var f = file_list[i]; // single file
                var safe_market, safe_cat;

                if (typeof f.doc_market !== 'undefined') {
                    safe_market = url_safe(f.doc_market);
                } else {
                    console.log("BAD FILE: (no market)" ,f);
                    continue;
                }

                if (typeof f.doc_category !== 'undefined') {
                    safe_cat = url_safe(f.doc_category);
                } else {
                    console.log("BAD FILE: (no category)" ,f);
                    continue;
                }

                /***
                 * add the categories to the list
                 */
                cat_list[ safe_cat ] = f.doc_category;

                /***
                 * create entries if needed
                 */
                file_tree[ safe_market ] = file_tree[ safe_market ] || {};
                file_tree[ safe_market ][ safe_cat ] =
                    file_tree[ safe_market ][ safe_cat ] || [];

                /***
                 * add file to the tree
                 * tree -> market -> category -> file
                 */
                file_tree[ safe_market ][ safe_cat ].push(f);

            } // while()

            // stick it all in the local storage
            db.file_list(file_list);
            db.cat_list(cat_list);
            db.file_tree(file_tree);  // publishes ('ajax/load')

            // set default cat
            for (var def_cat in cat_list) break;
            MY_CAT = def_cat;

                db.set_defaults();

                console.groupEnd('save_json');

            },

            /***
             * @name server.save_lists_json
             * Save all list from market_lang.json
             *
             * @arg {obj} json an object with two market and lang lists
             */
            save_lists_json : function (json) {
                console.group('save_lists_json');

                db.market_list(json.markets);
                db.lang_list(json.langs);

                console.groupEnd('save_lists_json');
            }
        };

        /***
         * @name start
         * first function to run
         *
         * contains all the bubpub listeners
         */
        var start = function () {


            bubpub.listen('sidebar/populate', function sidebar_populate() {
                view.sidebar.populate();
            });

            /****************************************************
             * BUBPUB: page changes
             ****************************************************/
            bubpub.listen('page', function page_change() {
                console.log('cat page change: ', db.cat(), db.market(), db.lang());

                var page = db.page();

                // check if file list exists
                if (page === 'cat') {
                    var file_list = db.current_file_list();
                    var lang_list = db.current_lang_list();
                    view.lang_DD.populate();

                    if (file_list.length !== 0) { //yes files
                        bubpub.say('error/clear');
                        view.table.populate(file_list, lang_list);

                    } else { //no files
                        bubpub.say('error/none_found');
                    }

                    $ui.search.mess.hide();
                    $ui.search.other_options.hide();

                    //make search box small
                    $ui.search.box.
                        removeClass('dl_search_big').
                        addClass('dl_search_small');

                } else if (page === 'search') {  // search
                    view.error.loading();
                    bubpub.say('table/search');


                    var search = db.search();

                    if (search === "") {
                        $ui.search.mess.hide();
                    } else {
                        $ui.search.mess.show().find('span').text( db.search() );
                    }
                }
            });

            bubpub.listen('table/search', function page_change() {
                view.error.clear();
                view.table.search();

                //make search box big
                $ui.search.box.
                    addClass('dl_search_big').
                    removeClass('dl_search_small').
                    select().
                    focus();
            });

            bubpub.listen('page/page', function page_change() {

                var page = db.page();
                if (page === 'cat') {
                } else if (page === 'search') {
                    view.table.search();
                }

            });


            bubpub.listen('page/cat/market', function market_change() {
                var lang = db.lang();

                // check if new market has current lang
                if ( (lang === 'all' || lang in db.current_lang_list()) === false) {
                    db.lang('all');
                }

                view.market_DD.update();
            });

            bubpub.listen('page/cat/cat page', function cat_change() {
                view.sidebar.set_current();
            });

            bubpub.listen('page/search', function search_update() {
                var search = db.search();
                $ui.search.form.find('#dl_search_box').val(search);
                view.hash.url_export();
            });

            /****************************************************
             * BUBPUB: lists
             ****************************************************/

            bubpub.listen('list/markets', function market_list_change() {
                view.market_DD.populate();
            });

            bubpub.listen('list/cats', function cat_list_change() {
                bubpub.say('sidebar/populate');
            });

            /****************************************************
             * BUBPUB: error
             ****************************************************/

            /***
             * Clear all the errors and show the table
             */
            bubpub.listen('error/clear', function error_clear() {
                view.error.clear();
            });

            /***
             * No files where found in a category
             */
            bubpub.listen('error/none_found', function none_found() {
                view.error.none_found();
            });

            /***
             * Hash changed in the browser window (usually from clicking
             * the back or forward buttons)
             */
            bubpub.listen('hash', function hash_change() {
                view.hash.url_import();

                if ( db.market() === null ) {
                    for(var def_market in db.market_list() ) break;
                    db.market(def_market);
                }

                if ( db.cat() === null ) {
                    for(var def_cat in db.cat_list() ) break;
                    db.cat(def_cat);
                }

                if ( db.lang() === null ) {
                    db.cat(MY_LANG);
                }
            });

            /***
             * there was an AJAX error
             */
            bubpub.listen('ajax/fail', function () {
                view.error.ajax();
            });

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
            $ui.table.each.delegate(".table_name > a", "click", function (e) {
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
                view.table.show_other_table();
            });

            /***
             * click the "can't find it?" link that sets language to all that sets language to all.
             */
            $ui.search.all_langs_link.find('a').click(function (e) {
                e.preventDefault();
                db.lang("all");
            });

            /***
             * click the sidebar tab
             */
            $ui.sidebar.ul.on('click', 'a', function (e) {
                e.preventDefault(); // stop hash change

                var $this = $(this).parent();
                var current = $ui.sidebar.current_class;
                var page = $this.data('page');

                db.page(page);

                if (page === 'cat') {

                    //if it did change
                    if (db.cat( $this.data('cat') ) === true) {
                        view.error.loading();
                    }
                    // make sure to fire even if it doesn't change
                    bubpub.say('cat');
                }

                if (page === 'page') {
                    if (db.page( $this.data('cat') ) === true) {
                        view.error.loading();
                    }
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
                server.ajax_load_json();
            });

            $('#to_top').click(function () {
                $('html,body').animate({scrollTop:0},0);
            });

            server.ajax_load_json();

        };

        return {
            'start' : start,
            'view' : view,
            'db' : db,
            '$ui' : $ui,
            'server' : server
        };
    };

    var Kdown = new Kdown();

    Kdown.start();


