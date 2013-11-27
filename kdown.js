/***
 * Kdown ~ Kyani download interface
 */

Kdown = function () {
    "use strict";
    /***
     * config
     */
    var LOGGING = false,
        MY_LANG = 'en',
        MY_MARKET = 'usa-can',
        MY_CAT = null,
        API_URL = 'files/dream_api.php',
        NAMES_URL = 'files/market_lang.json';

    /***
     * UI handlers
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
            none_found : $('#none_found')
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
     * an object that publishes events when it changes
     *
     * also has ability to have a validator function passed
     * in to test if the input is valid or not.
     *
     * @arg  {string} publish_name
     * a string of a publishing name, which can be name spaced like so
     *
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
         * Will change value to new_val if the values are different
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
     * holds all the information in kobjs (see above)
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
         * current_file_tree
         *
         * @arg {string} lang pass in a language to filter by 'all' get's all.
         * @returns {array} list of files in the current market, cat, and lang
         */
        current_file_tree : function (lang) {

            var tree = db.file_tree(); // all files
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
            var result = $.map(tree[market][cat], function (file) {
                if (lang === 'all' || file.language === lang) {
                    return file;
                }
            });

            return  result;
        },

        /***
         * Returns a list of langs in the current market and the amount in the current cateogry
         *
         * eg: { 'en' : 6, 'hk' 0 }
         */
        current_lang_count : function (tree) {

            tree = tree || this.current_file_tree('all');

            var lang_count = {},
                i = tree.length;

            while(i--) {
                var lang = tree[i].language;
                lang_count[lang] = ++lang_count[lang] || 1;
            }

            return lang_count;
        },

        /***
         * Return the langs in the current market
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
     * url_safe - escape strings for the URL
     *
     * @arg {string} unsafe string to make URL safe
     * @return {string} string with all spaces and non
     *                  alpha-numeric characters turned to a '-'
     */
    var url_safe = function (unsafe) {
        return unsafe.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-');
    };

    /***
     * helpers with handling the DOM
     */
    var view = {
        /***
         * the html of the copy objects used for tempesting
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
        copy : {
            table_row : '<tr>' + $('#table_copy').html() + '</tr>',
            table_row_second : '<tr>' + $('#table_copy_second').html() + '</tr>',
            cat : $('#copy-cat').html(),
            page : $('#copy-page').html()
        },
        hash : {
            /***
             * get out of the hash
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

                if (page === 'cat') {
                    db.market(hash[1]);
                    db.cat(hash[2]);
                    db.lang(hash[3]);
                }
            },
            /***
             * export data to the hash
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
        table : {
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

                return true;
            },
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
             * Search all the file in the data base
             */
            search : function (search_str) {
                search_str = search_str || db.search();
                search_str = search_str.toLowerCase();

                var json = db.file_list(),
                main_list = [],
                other_list = [],
                market = db.market(),
                lang = db.lang();


                for (var i=0, l = json.length; i < l; i++) {
                    var file = json[i];

                    if (search_str === "" || file.name.toLowerCase().indexOf(search_str) !== -1) {
                        console.log(file.market, market);
                        console.log(file.language, lang);

                        if (file.market === market && ('all' === lang || file.language === lang)) {
                            console.log("main_list", file);
                            main_list.push(file);
                        } else {
                            console.log("other_list", file);
                            other_list.push(file);
                        }
                    }

                }

                view.table.populate(main_list);
                view.table.populate(other_list, null, 2);

            }
        },
        sidebar : {
            populate : function () {
                var copy_cat = view.copy.cat,
                    pages = db.pages,
                    html = '',
                    cat_list = db.cat_list();

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
            set_current : function () {
                var sidebar = $ui.sidebar;
                //remove current one
                $($ui.sidebar.current_class).
                    removeClass($ui.sidebar.current_class.slice(1));

                //change to the new one
                sidebar.ul.find( '#' + db.page() + '_' + db.cat() ).
                    addClass(sidebar.current_class.slice(1));
            }
        },
        market_DD : {
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
            update : function () {
                $ui.DD.market.val( db.market() );
            }

        },
        lang_DD : {
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
    /***
     * Handles all the AJAX requests.
     */
    var server = {
        /***
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
         * Save all the ajax information from API
         * in proper format
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
         * Save all list from market_lang.json
         */
        save_lists_json : function (json) {
            console.group('save_lists_json');

            db.market_list(json.markets);
            db.lang_list(json.langs);

            console.groupEnd('save_lists_json');
        }
    };

    /***
     * first function to run
     */
    var start = function () {

        bubpub.listen('cat search', function cat_change() {
            console.log('cat page change: ', db.cat(), db.market(), db.lang());
            var file_list = db.current_file_tree();
            var lang_list = db.current_lang_list();

            view.lang_DD.populate();
            // check if file list exists
            if (db.page() === 'cat') {
                if (file_list.length !== 0) { //yes files
                    bubpub.say('error/clear');
                    view.table.populate(file_list, lang_list);

                } else { //no files
                    bubpub.say('error/none_found');
                }
            } else {
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

        bubpub.listen('cat/cat', function cat_change() {
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


