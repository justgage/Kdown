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
        API_URL = 'files/dream_api.php',
        NAMES_URL = 'files/market_lang.json';

    /***
     * commonly used jQuery objects. 
     */
    var $ui = {
        table: {
            all : $('#dl_table_all'),
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
            form : $('#dl_search_form')
        }
    };

    /***
     * Kobj
     *
     * An object that publishes events when it changes
     *
     * also has ability to have a validator function passed
     * in to test if the input is valid or not.
     *
     * @arg {string} publish_name   a string of a publishing name that is pushed to bubpub.
     * @arg {any} preset            a value to set the object to when created.
     * @arg {funciton} validator    a function that will return TRUE if the value is valid.
     *
     * @return {function}           returns function for getting and setting the value.
     *
     * @constructor
     */
    var Kobj = function (publish_name, preset, validator) {

        if (typeof preset === 'undefined') {
            preset = null;
        }
        if (typeof validator === 'undefined') {
            validator = null;
        }

        // save as a local var
        var value = preset;

        /***
         * Will change value to new_val 
         *  IF the values are different 
         *  AND it passes the validator function (if there is one)
         *
         * @arg {any} new_val value to try to change 'value' to.
         */
        var change = function (new_val) {

            // and is valid
            if (validator === null || validator(new_val) === true) {
                // make sure we're changing it
                if (value !== new_val) {
                    console.log('SET' ,value, '-> ' + publish_name + ' ->', new_val);
                    value = new_val;
                    bubpub.say(publish_name);
                }
            } else {
                console.error(publish_name, ' trying to set to ', new_val);
            }
        };

        /***
         * function that will get/set the value.
         *      IF new_val is passed it SETS value.
         *      IF NOT it GETS value.
         *
         * @arg {any} new_val value to change 'value' to. 
         *
         * @return {any / bool} returns if the value was changed if it SETS
         *                           returns value if not set. 
         */
        return function kobj_get_set(new_val) {
            // GET
            if (typeof new_val === 'undefined') {
                if (value === null) {
                    console.error(publish_name + ' returning NULL');
                }
                return value; // get
            } else {
                // SET
                return change(new_val);
            }

        };
    };

    /***
     * db 
     *
     * holds all the information about the state of the page
     * in kobjs (see above)
     */
    var db = {
        page : new Kobj('page', 'cat'),                   // current page

        market_list : new Kobj('list/markets'),           // list of valid markets
        cat_list : new Kobj('list/cats'),                 // list of valid categories
        lang_list : new Kobj('list/langs', {}),           // list of valid languages
        file_list : new Kobj('list/files'),               // list of valid categories

        market : new Kobj('cat/market', null, function (test) {
            return test in db.market_list();
        }),                                               // current market
        cat : new Kobj('cat/cat', null, function (test) {
            return test in db.cat_list();
        }),                                               // current category
        lang : new Kobj('cat/lang', null, function (test) {
            return test === 'all' || test in db.current_lang_list();
        }),                                               // current translation selected (can be 'ALL')

        lang_count : new Kobj('lang_count'),              // each language's count [lang] => count
        file_tree : new Kobj('ajax/load'),                // hold the current table's JSON

        search : new Kobj('search', ""),

        pages : {
            all : 'All Downloads'
        },

        /***
         * @name db.current_file_list
         * will get the current file list based on the current db.market and db.cat
         *
         * @arg {string} lang pass in a language to filter by 'all' get's all.
         * @returns {array} list of files in the current market, cat, and lang
         */
        current_file_list : function (lang) {

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
            var list = $.map(tree[market][cat], function (file) {
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
         * @arg {arr} file_list a array of files that contain the language attribute. 
         *
         * @return {object} returns language counts in this structure -> { 'en' : 6, 'hk' : 0 ...}
         */
        current_lang_count : function (file_list) {

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
        current_lang_list : function (market, cat) {
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
        set_defaults : function () {
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
    var url_safe = function (unsafe) {
        return unsafe.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');
    };

    /***
     * view 
     *
     * helper functions/objects with handling the DOM.
     */
    var view = {
        /***
         * @name view.page 
         * helpers to do page changes.
         */
        page : {
            all : function () {
                view.error.clear();
                $ui.table.first.show();
                $ui.table.second.show();
            },
            cat : function () {
                view.error.clear();
                $ui.table.first.show();
                $ui.table.second.hide();
            }
        },

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
            url_import : function () {
                var hash_str = window.location.hash;

                if (hash_str === '') {
                    return null;
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
            },

            /***
             * @name hash.url_export 
             * export the db information to the hash for the current page
             */
            url_export : function () {
                var page = db.page();
                var hash = '#' + page;

                if (page === 'cat') {
                    hash += '/' + db.market();
                    hash += '/' + db.cat();
                    hash += '/' + db.lang();
                }

                window.location.hash = hash;
            }
        },

        /***
         * @name view.table
         * helper functions for manipulating the table.
         */
        table : {

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
                // backwards
                for (var i = file_list.length - 1; i >= 0; i--) {
                    var file = file_list[i];

                    row = copy;

                    // Tempting
                    row = row.replace('(HEART_URL)', '#');
                    row = row.replace('(NAME)', file.name);
                    row = row.replace('(FILE_LINK)', 'single.php?id=' + file.id);
                    row = row.replace('(LANG)', lang_list[file.language]);
                    row = row.replace('(MARKET)', market_list[file.market]);

                    table_html += row;
                }
                $table.html(table_html);
            },

            /***
             * @name table.lang_filter
             * Filter all the files that don't contain a lang
             *
             * @arg {string} lang language code for the language which we want to find in the file list.
             *
             * @return
             */
            lang_filter : function(lang) {
                var json = db.table_json(), // TODO: table_json is invalid
                    filtered_json = [],
                    num_found = 0,
                    i = 0, l;

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
            /***
             * @name table.search
             * search all files name in the database for the search string. 
             *
             * @arg {string} search_str string to search for in file.name.
             */
            search : function (search_str) {
                search_str = search_str || db.search();
                search_str = search_str.toLowerCase();

                var json = db.file_list(),
                    main_list = [],
                    other_list = [],
                    market = db.market(),
                    lang = db.lang(),
                    lang_count = {};

                console.groupCollapsed("Search");


                for (var i=0, l = json.length; i < l; i++) {
                    var file = json[i];

                    if (search_str === "" ||
                        file.name.toLowerCase().indexOf(search_str) !== -1) {

                        if (file.market === market && ('all' === lang || file.language === lang)) {
                            console.log("main_list", file);
                            main_list.push(file);

                        } else {
                            console.log("other_list", file);
                            other_list.push(file);
                        }

                        lang_count[file.language] = ++lang_count[file.language] || 1;
                    }

                }

                console.log(lang_count);
                console.groupEnd("Search");

                if (main_list.length > 0) {
                    console.log('main list found');
                    view.table.populate(main_list);
                    view.error.found_first();
                } else {
                    console.log('main list NONE found');
                    view.error.none_found_first();
                }

                if (other_list.length > 0) {
                    console.log('other list found');
                    view.table.populate(other_list, null, 2);
                    view.error.found_second();
                } else {
                    console.log('other list NONE found');
                    view.error.none_found_second();
                }

                view.lang_DD.populate(lang_count);

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
            populate : function () {
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
            set_current : function () {
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
            populate : function () {
            
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
            },

            /***
             * @name market_DD.update
             *
             * change which one is selected in the DOM based on db.market 
             */
            update : function () {
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
            populate : function (count) {

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
            spaces_align : function (col1, col2) {
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
             * hide all tables and error messages
             */
            hide_all : function () {
                $ui.table.all.hide();
                for (var single in $ui.error) {
                    if($ui.error.hasOwnProperty(single)) {
                        $ui.error[single].hide();
                    }
                }
                return true;
            },

            /***
             * show ajax error
             */
            ajax : function () {
                this.hide_all();
                $ui.error.ajax.show();
            },

            /***
             * show 'no files found message'
             */
            none_found : function () {
                this.hide_all();
                $ui.error.none_found.show();
            },

            /***
             * Show first table (used in the search)
             */
            found_first : function () {
                $ui.table.first.show();
                $ui.error.none_found_first.hide();
            },

            /***
             * Show second table (used in the search)
             */
            found_second : function () {
                $ui.table.second.show();
                $ui.error.none_found_second.hide();
            },

            /***
             * show message that none where found in the first table
             */
            none_found_first : function () {
                $ui.table.first.hide();
                $ui.error.none_found_first.show();
            },

            /***
             * show message that none where found in the second table
             */
            none_found_second : function () {
                $ui.table.second.hide();
                $ui.error.none_found_second.show();
            },

            /***
             * clear all error messages and show table (used in normal category view)
             */
            clear : function () {
                this.hide_all();
                $ui.table.all.show();
            },

            /***
             * Show loading throbbed for ajax
             */
            loading : function () {
                this.hide_all();
                $ui.error.loading.show();
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
            lists_promise.fail(function (code) {
                console.log('FAIL', code);
                bubpub.say('ajax/fail');
            });

            promise.fail(function (code) {
                console.log('FAIL', code);
                bubpub.say('ajax/fail');
            });

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

            var file_list  = json.files,
                market_list = {},
                cat_list    = {},
                file_tree   = {},
                i           = file_list.length;

                // go through every file (backwards!)
                while (i--) {
                    var f = file_list[i]; // single file

                    var safe_market = url_safe(f.market);
                    var safe_cat = url_safe(f.category);

                    /***
                     * add the categories to the list
                     */
                    cat_list[ safe_cat ] = f.category;

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

        bubpub.listen('cat search', function cat_change() {
            console.log('cat page change: ', db.cat(), db.market(), db.lang());

            // check if file list exists
            if (db.page() === 'cat') {
                var file_list = db.current_file_tree();
                var lang_list = db.current_lang_list();
                view.lang_DD.populate();

                if (file_list.length !== 0) { //yes files
                    bubpub.say('error/clear');
                    view.table.populate(file_list, lang_list);

                } else { //no files
                    bubpub.say('error/none_found');
                }

            } else {  // search
                view.table.search();
            }

        });

        bubpub.listen('sidebar/populate', function sidebar_populate() {
            view.sidebar.populate();
        });

        bubpub.listen('cat/market', function market_change() {
            var lang = db.lang();

            // check if new market has current lang
            if ( (lang === 'all' || lang in db.current_lang_list()) === false) {
                db.lang('all');
            }
            view.market_DD.update();
        });

        bubpub.listen('page', function page_change() {

            var page = db.page();
            if (page === 'cat') {
                view.page.cat();
            } else if (page === 'all') {
                view.page.all();
                view.table.search();
            }

        });

        bubpub.listen('cat/cat page', function cat_change() {
            view.sidebar.set_current();
        });

        bubpub.listen('list/markets', function market_list_change() {
            view.market_DD.populate();
        });

        bubpub.listen('list/cats', function cat_list_change() {
            bubpub.say('sidebar/populate');
        });

        bubpub.listen('error/clear', function error_clear() {
            view.error.clear();
        });

        bubpub.listen('error/none_found', function none_found() {
            view.error.none_found();
        });

        bubpub.listen('hash/export', function hash_export() {
            view.hash.url_export();
        });

        bubpub.listen('search', function search_update() {
            $ui.search.form.find('#dl_search_box').val( db.search() );
        });

        bubpub.listen('hash/import', function hash_import() {
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
         * Bind events to the DOM
         */
        $ui.search.form.submit(function search_submit(e) {
            e.preventDefault();
            var search_str = $('#dl_search_box').val();
            console.log("searching for...", search_str);
            db.search(search_str);
            db.page("all");

        });

        $ui.DD.market.change(function market_DD_change() {
            db.market( $(this).val() );
            bubpub.say('hash/export');
        });

        $ui.DD.lang.change(function lang_DD_change() {
            db.lang( $(this).val() );
            bubpub.say('hash/export');
        });

        $ui.sidebar.ul.on('click', 'a', function (e) {
            e.preventDefault(); // stop hash change

            var $this = $(this).parent();
            var current = $ui.sidebar.current_class;
            var page = $this.data('page');

            db.page(page);

            if (page === 'cat') {
                db.cat( $this.data('cat') );
                // make sure to fire even if it doesn't change
                bubpub.say('cat'); 
            }

            if (page === 'page') {
                db.page( $this.data('cat') );
            }

            console.log('click', page);

            // change current visually
            $(current).removeClass(current.slice(1));
            $(this).parent().addClass(current.slice(1));


            bubpub.say('hash/export');

        });

        $(window).bind('hashchange', function () {
            bubpub.say('hash/import');
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

