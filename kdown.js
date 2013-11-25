/***
 * Kdown ~ Kyani download interface
 */
(function (window, $, undefined) {

Kdown = function () {
    "use strict";
    /***
     * config 
     */
    var LOGGING = false,
        NATIVE_LANG = 'en',
        API_URL = "files/dream_api.php",
        NAMES_URL = "files/market_lang.json";

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
    var Kobj = function (publish_name, preset) {

        if (typeof preset === 'undefined') {
            preset = null;
        }
        
        // save as a local var
        var value = preset; 

        /***
         * Will change value to new_val if the values are different
         */
        var change = function (new_val) {

            // make sure they are not equal
            if (value !== new_val && new_val!== null) {

                value = new_val;
                bubpub.say(publish_name);

            } else {
                console.warn("WARN: " + publish_name + " no change to value -> " + value);
            }
        };

        return function kobj_get_set(new_val) {
            // GET
            if (typeof new_val === 'undefined') {
                if (value === null) {
                    console.error(publish_name + " returning NULL");
                }
                return value; // get 
            } else {
                // SET
                return change(new_val);
            }
            
        };
    };

    /***
     * holds all the information in Kojs (see above)
     */
    var db = {
        page : new Kobj('page', 'cat'),                 // current page

        market_list : new Kobj('list/markets'),         // list of valid markets
        cat_list : new Kobj('list/cats'),               // list of valid categories
        lang_list : new Kobj('list/langs', {}),         // list of valid languages
        file_list : new Kobj('list/files'),             // list of valid categories

        market : new Kobj('cat/market'), // current market
        cat : new Kobj('cat/cat'),                      // current category
        lang : new Kobj('cat/lang'),                    // current translation selected (can be 'ALL')
        lang_count : new Kobj('lang_count'),            // each language's count [lang] => count

        file_tree : new Kobj('ajax/load'),              // hold the current table's JSON
                                                        // a list of pages that are aditional to the category ones
        pages : {
            all : "All Downloads"
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

            tree = tree ||  this.current_file_tree('all');

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
            table_row : '<tr>' + $("#table_copy").html() + '</tr>',
            cat : $('#copy-cat').html(), 
            page : $('#copy-page').html()
        },
        hash : {
            /***
             * get out of the hash
             */
            url_import : function () {
                var hash_str = window.location.hash;
                
                if (hash_str.indexOf('null') !== -1) {
                    hash_str = "";
                }

                var hash = hash_str.split('/');
                var page = hash[0].slice(1);

                db.page(page);

                if (page === 'cat') {

                    db.market(hash[1]);
                    db.cat(hash[2]);
                    db.lang(hash[3]);

                }  else {

                    // Hackish way to get first element in the object
                    //      NOT the same in all browsers!!!!
                    //      a better way is needed
                    for(var def_market in db.market_list() ) break;
                    for(var def_cat    in db.cat_list()    ) break;

                    db.market( url_safe(def_market) );
                    db.cat( url_safe(def_cat) );
                    db.lang(NATIVE_LANG);
                }

                if (page === 'page') {

                    bubpub.say( hash_str.slice(1) );

                    
                }

            },
            /***
             * export data to the hash
             */
            url_export : function () {
                var page = db.page();
                var hash = "#" + page;

                if (page === "cat") {
                    hash += "/" + db.market();
                    hash += "/" + db.cat();
                    hash += "/" + db.lang();
                }

                window.location.hash = hash;
            }
        },
        table : {
            populate : function(file_list, lang_list) {

                var table_html = "";
                var copy = view.copy.table_row;
                var row = copy;
                var lang = db.lang();

                // backwards
                for (var i = file_list.length - 1; i >= 0; i--) {
                    var file = file_list[i];

                    row = copy;

                    // Tempating
                    row = row.replace("(HEART_URL)", '#');
                    row = row.replace("(NAME)", file.name);
                    row = row.replace("(FILE_LINK)", 'single.php?id=' + file.id);
                    row = row.replace("(LANG)", lang_list[file.language]);

                    table_html += row;
                }

                $ui.table.first_body.html(table_html);

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
            }
        },
        sidebar : {
            populate : function () {
                var copy_cat = view.copy.cat,
                    copy_page = view.copy.page,
                    pages = db.pages,
                    html = "",
                    cat_list = db.cat_list(),
                    market = db.market(),
                    lang = db.lang();

                console.assert(market !== null, "Sidebar");

                var make_page = function(copy, code, href, title) {

                    var li = copy;

                    li = li.replace(/\(CAT\)/g, code);
                    li = li.replace("(HREF)", href);
                    li = li.replace("(TITLE)", title);

                    return li;
                };

                // make a page for each category
                for (var code in cat_list) {
                    if(cat_list.hasOwnProperty(code)) {
                        var cat_name = cat_list[code];
                        html += make_page(copy_cat, code, "#cat/" + market + "/" + code + "/" + lang, cat_name);
                    }
                 }

                 // add all other pages
                 for (var page_code in pages) {
                     if(pages.hasOwnProperty(page_code)) {
                         var page_name = pages[page_code];
                        html += make_page(copy_cat, page_code, "#page/" + page_code, page_name);
                     }
                 }

                //set the sidebar
                $ui.sidebar.ul.html(html);
                this.set_current();
            }, 
            set_current : function () {
                var sidebar = $ui.sidebar;
                //remove current one
                $($ui.sidebar.current_class).
                    removeClass($ui.sidebar.current_class.slice(1));

                //change to the new one
                sidebar.ul.find( "#cat_" + db.cat() ).
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
                        var option = temp.replace("(NAME)", list[item]);
                        option = option.replace("(CODE)", item);
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
                option = option.replace("(NAME)", "All" );
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
                col1 = col1 + "";
                col2 = col2 + "";

                for (var ii = 0, l = padding - col1.length; ii< l; ii++) {
                    spaces.push("\u00A0");  //this is the char for a non-breaking space
                }
                return  col1 + spaces.join(" ") + col2;
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
                console.log("FAIL", code);
                bubpub.say("ajax/fail");
            });

            promise.fail(function (code) {
                console.log("FAIL", code);
                bubpub.say("ajax/fail");
            });

        },
        /***
         * Save all the ajax information from API
         * in proper format
         */
        save_json : function (json) {

            console.group("save_json");
            console.log("json", json);

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
                     * add the categorys to the list
                     */
                    cat_list[ safe_cat ] = f.category;

                    /***
                     * create entrys if needed
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
                db.file_tree(file_tree);  // publishes ("ajax/load")

                console.log("file_list", file_list);
                console.log("cat_list", cat_list);
                console.log("file_tree", file_tree);

                console.groupEnd("save_json");

        },
        /***
         * Save all list from market_lang.json
         */
        save_lists_json : function (json) {
            console.group("save_lists_json");

            console.log("market_list", json.markets);
            console.log("langs_list", json.langs);

            db.market_list(json.markets);
            db.lang_list(json.langs);

            console.groupEnd("save_lists_json");
        }
    };

    /***
     * first function to run 
     */
    var start = function () {

        bubpub.listen("cat", function cat_change() {
            console.log("Page Change: ", db.cat(), db.market());
            var file_list = db.current_file_tree(); 
            var lang_list = db.current_lang_list(); 

                view.lang_DD.populate();
            // check if file list exists
            if (file_list.length !== 0) { //yes files
                bubpub.say("error/clear");
                view.table.populate(file_list, lang_list);

            } else { //no files
                bubpub.say("error/none_found");
            }

        });

        bubpub.listen("cat/market cat/lang", function market_lang_change() {
            bubpub.say("sidebar/update");
            bubpub.say("hash/export");
        });

        bubpub.listen("sidebar/update", function sidebar_update() {
            view.sidebar.populate();
        });

        bubpub.listen("cat/market", function market_change() {
            var lang = db.lang();

            // check if new market has current lang
            if ( (lang === 'all' || lang in db.current_lang_list()) === false) {
                db.lang('all');
            }
            view.market_DD.update();
        });

        bubpub.listen("page", function page_change() {
            var page = db.page();
            if (page === "cat") {
                view.page.cat();
            } else if (page === "all") {
                view.page.all();
            }
              
        });

        bubpub.listen("cat/cat", function cat_change() {
            view.sidebar.set_current();
        });

        bubpub.listen("list/markets", function market_list_change() {
            view.market_DD.populate();
        });

        bubpub.listen("list/cats", function cat_list_change() {
            bubpub.say("sidebar/update");
        });

        bubpub.listen("error/clear", function error_clear() {
            view.error.clear();
        });

        bubpub.listen("error/none_found", function none_found() {
            view.error.none_found();
        });

        bubpub.listen("hash/export", function hash_export() {
            view.hash.url_export();
        });

        bubpub.listen("hash/import", function hash_import() {
            view.hash.url_import();
        });


        /***
         * Bind events to the DOM
         */
        $ui.DD.market.change(function market_DD_change() {
            db.market( $(this).val() );
        });

        $ui.DD.lang.change(function lang_DD_change() {
            var lang = $(this).val();
            db.lang(lang);
        });

        // NOTE: hash only should work. 
        $ui.sidebar.ul.on('click', 'a', function () {
            var current = $ui.sidebar.current_class;
            $(current).removeClass(current.slice(1));
            $(this).addClass(current.slice(1));
        });

        $(window).bind('hashchange', function () {
            bubpub.say('hash/import');
        });

        server.ajax_load_json();

    };

    return {
        "start" : start,
        "view" : view,
        "db" : db,
        "$ui" : $ui,
        "server" : server
    };
};

var Kdown = Kdown();

Kdown.start();


})(window, $);