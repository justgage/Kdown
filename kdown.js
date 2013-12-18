/***
 * @name Kdown ~ Kyani download interface
 *
 * @constructor
 *
 */


/***
 * TODO:
 *      add the cat loading to api.
 *      make table load category view.
 *      change category on click.
 *      search page.
 *      TRANSLATEABLE
 *      global option on search.
 *      file pane.
 *      bug fixes.
 */

Kdown = function (new_config) {
    "use strict";

    // default config
    var config = {
        DEF_MARKET : "usa-can",
        DEF_LANG : "en"
    };

    // override default config with new_config
    $.extend(true, config, new_config);

    /***
     * @name api
     * this handles all the server requests
     */
    var api = (function () {

        var LISTS_URL = 'files/market_lang.json';
        var API_URL = 'api.php';

        var file_tree = new bubpub.obj('file_tree', {});

        /***
         * @name api.load_lists
         * this will load the list of valid markets / languages
         * see flat market_lang.json
         */
        var load_lists = function () {

            var promise = $.get(LISTS_URL, {}, null, 'json');

            promise.done(function (json) {
                console.log(json);
                console.log(page.market_DD);
                page.market_DD.list(json.markets);
                page.lang_DD.list(json.langs);

                load_file_tree();
            });

            promise.fail(function (error_obj) {
                page.main.change("ajax");
            });
        };


        /***
         * @name api.load_file_tree
         * will load a file tree with the current market / language
         *
         * @return {jquery xhr(promise)}
         */
        var load_file_tree = function () {

            var market = page.market_DD.current();
            var lang = page.lang_DD.current();

            var request = {
                "market" : market,
                "lang" : lang
            };

            var promise = $.post(API_URL, request, null, 'json');

            promise.done(function (json) {
                if (json.error === false) {

                    var cat_list = {};
                    var code = "";
                    var temp_tree = {};
                    var tree = file_tree();

                    // add onto the existing tree
                    temp_tree[market] = {};
                    temp_tree[market][lang] = json.cats;
                    $.extend(tree, temp_tree);

                    file_tree(tree);

                    for (var cat in json.cats) {
                        if(json.cats.hasOwnProperty(cat)) {
                            cat_list[cat] = cat;

                            //***************************
                            // translate cat if needed
                            //****************************
                        }
                    }

                    page.sidebar.cat_list(cat_list);


                } else {
                    console.log("AJAX_ERROR:", json);
                    bubpub.say("ajax/cat/error");
                }
            });

            promise.fail(function () {
                console.log(API_URL, "failed");
            });

            return promise;
        }; // api.load_file_tree

        /***
         * @name api.check_current_file_tree
         * This will make sure that we always have an up to date
         * file_tree.
         */
        var check_current_file_tree = function () {
            var market = page.market_DD.current();
            var lang = page.lang_DD.current();
            var tree = file_tree()[market];
            if (typeof tree === 'undefined' || typeof tree[lang] === 'undefined') {
                load_file_tree().done(function () {
                    page.main.ajax_cat_done();
                });
            } else {
                page.main.ajax_cat_done();
            }
        };

        //check every time the page changes
        bubpub.listen("hash", check_current_file_tree);

        var get_file_list = function(market, lang, cat) {
            // set defaults if not passed
            market = market || page.market_DD.current();
            lang = lang || page.lang_DD.current();
            cat = cat || page.sidebar.current();
            var tree = file_tree()[market][lang];
            var return_list = [];

            if (cat === "search") {
                // merge every category to get a full list.
                $.each(tree, function (cat, list) {
                    $.merge(return_list, list);
                });
            } else {
                return_list = tree[cat];
            }

            return return_list;
        };

        return {
            file_tree : file_tree,
            load_lists : load_lists,
            load_file_tree : load_file_tree,
            get_file_list : get_file_list
        };

    })(); // end of api


    /***
     * This deals with the hash in the URL
     *
     * the format is:
     *
     * for categorys
     *     market/lang/page
     *
     * or for search
     *     market/lang/search:uri_encoded_search_term
     *
     */
    var hash = (function () {

        var self = {};
        var local_hash_str = bubpub.obj("hash_str", "");

        $(window).bind('hashchange', function () {
            local_hash_str( window.location.hash.slice(1) );
        });

        bubpub.listen("hash_str", function () {
            self.url_import();
        });

        bubpub.listen("hash", function () {
            self.url_export();
        });

        /***
         * @name hash.url_export
         * export the hash
         */
        self.url_export = function () {
            var hash_str = "";
            var search_str = page.search.search_str();

            hash_str += page.market_DD.current();
            hash_str += "/" + page.lang_DD.current();

            var page_current = page.sidebar.current();

            if (page_current === "search") {

                hash_str += "/search:";
                if (search_str !== "") {
                    hash_str += encodeURI(search_str);
                }
            } else {
                if (page_current !== null) {
                    hash_str += "/" + encodeURI(page_current);
                }
            }

            window.location.hash = hash_str;
        };

        /***
         * @name hash.url_import
         * import the hash
         */
        self.url_import = function () {
                var hash_str = local_hash_str();
                var hash = hash_str.split('/');
                var search_term = "";
                // just in case!
                hash_str = $.trim(hash_str);

                //make sure we have a hash
                if (hash_str === '') {
                    return false;

                }

                if (page.market_DD.current( hash[0] ) === false) {
                    page.market_DD.current( config.DEF_MARKET );
                }

                page.lang_DD.pick_default( hash[1] );


                if (typeof hash[2] !== 'undefined') {
                    if (hash_str.indexOf("search:") > -1) {
                        // this will:
                        // 1. grab the right part of the URL
                        // 2. split it at the :
                        // 3. grab the right half
                        // 4. decode it.
                        search_term = decodeURI( hash[2].split(":")[1] );
                        page.search.search_str(search_term);

                        page.sidebar.current("search");
                    } else {
                        page.sidebar.current(decodeURI(hash[2]));
                    }
                }

                return true;
        };


        return self;
    })();



    /***
     * @name page
     *
     * this handles all the VIEW parts of the application.
     */
    var page = (function () {

        /***
         * @name page.main
         *
         * this will be the controller for the main area of the page
         * it will switch out whatever needs to be there.
         *
         * it also includes methods to create new "display objects" (New_obj)
         * and create object that inherit from other objects (Inherit)
         */
        var main = (function () {
            var main_self = {};

            var current = bubpub.obj("main/current", null, function (test) {
                return test.tag in display_objs;
            });

            /***
             * change view after AJAX is done
             */
            main_self.ajax_cat_done = function () {

                if (sidebar.current() === "search") {
                    main_self.change("table_search");
                } else {
                    main_self.change("table_normal");
                }
            };

            // a list of display_objects that will.
            var display_objs = {};

            /***
             * @name main.New_obj
             * a constructor for new display objects.
             *
             * @arg {string} tag the name by which it will be referred to with main.show()
             *                   and stored with in display_objs.
             * @arg {function} Construct the function that creates the new object.
             *
             * @returns {object} the new object created.
             */
            main_self.Display_obj = function (tag, Construct) {

                // the object that all display objects will be derived.
                var new_obj = {
                    tag : tag,
                    parent_tag : "DEFAULT",
                    show : function () {
                        console.error(this.tag + ".show for not written!");
                    },
                    hide : function () {
                        console.error(this.tag + ".hide for not written!");
                    }
                };


                // add the constructor to the new object
                $.extend(true, new_obj, new Construct() );

                // add the newly merged object to the display_objects
                display_objs[tag] = new_obj;

                console.log("[ main.Display_obj ] NEW: " + tag);

                return new_obj; // return it
            };

            /***
             * @name main.Inherit
             * Take an existing display object and inherit from it.
             *
             * @arg {string} tag_to_clone the tag from which to clone.
             * @arg {string} new_tag the new tag it will be known by.
             * @arg {function} Construct the function that creates the new object.
             *                  @arg {object} self to edit
             */
            main_self.Inherit = function (tag_to_clone, new_tag, Construct) {

                if (tag_to_clone in display_objs) {
                    var new_obj = $.extend( true, {}, display_objs[tag_to_clone] );

                    var temp_obj = new Construct(new_obj);

                    $.extend(true, new_obj, temp_obj);

                    new_obj.parent_tag = new_obj.tag;
                    new_obj.tag = new_tag;

                    display_objs[new_tag] = new_obj;

                    console.log("[ main.Inherit ] INHERIT: " + tag_to_clone  + " ++> " + new_tag, new_obj);

                    return new_obj;
                } else {
                    console.error(tag_to_clone + " is does not exist to inherit from ->", display_objs);
                }
            };

            /***
             * @name main.change
             * Change which display object is presenting
             */
            main_self.change = function (tag) {

                if (current() !== null) {
                    console.log("[ main.change ]: " + current().tag + " >> " + tag);
                    //call hide object
                    current().hide( current() );
                }

                // change current
                current( display_objs[tag] );

                // run display new one
                current().show( current() );

            };

            main_self.log = function () {

                console.log("[ main.display_objects ]");

                for (var tag in display_objs) {
                    if(display_objs.hasOwnProperty(tag)) {
                        console.log(" - " + tag, display_objs[tag]);
                    }
                }

            };

            return main_self;

        })();// end of page.main

        /***
         * @name page.table_normal
         * the display_obj for the normal category view of the table.
         */
        var table_normal = main.Display_obj("table_normal", function () {

            var self = {};
            var file_list = new bubpub.obj('table/file_list');

            var table_row = '<tr>' + $('#table_copy').html() + '</tr>';

            self.$ui = {
                all : $('#dl_table_all'),
                each : $('.dl_table'),
                first : $('#dl_table_first'),
                first_body : $('#dl_table_first').find('tbody'),
                second : $('#dl_table_second'),
                second_body : $('#dl_table_second').find('tbody')
            };

            self.show = function () {
                self.$ui.all.stop().fadeIn();
                self.$ui.first.show();
                this.prepare();
            };

            self.hide = function () {
                self.$ui.all.hide();
            };

            self.prepare = function () {
                var file_list = api.get_file_list();
                this.populate(file_list);
            };

            self.sort = function (file_list) {
                var compare = function (a, b) {

                    a = a.name.toLocaleLowerCase();
                    b = b.name.toLocaleLowerCase();

                    return a.localeCompare(b);
                };

                return file_list.sort(compare);
            };


            self.populate = function(file_list, lang_list) {

                lang_list = lang_list || page.lang_DD.list();

                var copy = "";
                var $table = "";
                var table_html = "";
                var market_list = page.market_DD.list();
                var lang = page.lang_DD.current_name();
                var market = page.market_DD.current_name();
                var row;
                var i;
                var l;

                $table = self.$ui.first_body;
                copy = table_row;

                row = copy;

                // Sort it by name
                file_list = self.sort(file_list);

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
            };

            return self;
        }); // table_normal end

        /***
         * @name table_search
         * this is the display_obj for table searching
         */
        var table_search = main.Inherit("table_normal", "table_search", function (self) {

            self.show = function () {
                this.$ui.all.stop().fadeIn();
                this.$ui.first.show();
                this.$ui.second.show();
            };

            self.hide = function () {
                self.$ui.all.hide();
                self.$ui.second.hide();
            };

            return self;
        });

        //********************
        //  Messages
        //********************

        /***
         * @name page.message
         * This is a abstract object that other messages are derived from.
         */
        main.Display_obj("message", function () {

            var self = {};

            self.$ui = $();

            self.show = function (_this) {
                _this.$ui.show();
            };

            self.hide = function (_this) {
                _this.$ui.hide();
            };

            return self;
        });

        main.Inherit("message", "loading", function (self) {

            self.$ui = $('#dl_loading');

            self.$ui.find("#reload_img").click(function (e) {
                e.preventDefault(); // stop hash change
            });
        });

        main.Inherit("message", "ajax", function (self) {
            self.$ui = $('#ajax_error');
        });

        main.Inherit("message", "none_found", function (self) {
            self.$ui = $('#none_found');
        });

        //////////////////////
        //
        // end of Display_obj
        //
        //////////////////////

        /***
         * @name page.sidebar
         */
        var sidebar = (function () {
            var self = {};


            var copy = $('#copy-cat').html();
            var current_class = 'current_page_item';

            var $ui = {

                cat_links : $('.cat_link a'),
                cats : $('.cat_link'),
                ul: $('#vertical_nav ul')
            };

            self.cat_list = bubpub.obj("sidebar/cat_list");
            self.page_list = bubpub.obj("sidebar/page_list", {
                "search" : "Search",
            });

            self.current = bubpub.obj("hash/sidebar");

            bubpub.listen("hash/sidebar", function () {
                self.set_current();
            });

            bubpub.listen("sidebar/cat_list", function () {
                self.populate();
            });


            $ui.ul.on('click', 'a', function (e) {
                e.preventDefault(); // stop hash change
                var $this = $(this).parent();

                if ( self.current( $this.data('cat') )) {
                    page.main.change("loading");
                }
            });

            /***
             * @name sidebar.set_current
             * this will change the sidebar link to the current page
             */
            self.set_current = function () {
                var sidebar = $ui;
                //remove current one
                $("." + current_class).removeClass(current_class);

                $ui.ul.find("[data-cat='" + self.current() + "']" ).
                    addClass(current_class);
            };

            /***
             * @name sidebar.populate
             * this will fill the sidebar with categorys and other pages
             */
            self.populate = function () {

                var copy_cat = copy,
                    pages = self.page_list(),
                    cat_list = self.cat_list(),
                    html = '';

                /***
                 * will replace the appropriate fields.
                 */
                var make_page = function(copy, cat, title) {
                    var li = copy;

                    li = li.replace(/\(CAT\)/g, cat);
                    li = li.replace('(TITLE)', title);

                    return li;
                };

                // make a page for each category
                for (var cat in cat_list) {
                    if(cat_list.hasOwnProperty(cat)) {
                        var cat_name = cat_list[cat];
                        html += make_page(copy_cat, cat, cat_name);
                    }
                }

                // add all other page.
                for (var page_code in pages) {
                    if(pages.hasOwnProperty(page_code)) {
                        var page_name = pages[page_code];
                        html += make_page(copy_cat, page_code, page_name);
                    }
                }

                //set the sidebar
                $ui.ul.html(html).show();
                this.set_current();
            };

            return self;
        })();

        /***
         * @name page.market_DD
         * handles the market drop down and houses the market list
         */
        var market_DD = (function () {

            var self = {};
            var $ui = $('#market_select');

            // this is what market is currently selected
            self.current = bubpub.obj(
                "hash/market", config.DEF_MARKET,
                function (test) {
                    return test in self.list();
            });

            self.list = bubpub.obj("lists/market");

            self.current_name = function () {
                return self.list()[ self.current() ];
            };

            bubpub.listen("lists/market", function () {
                self.populate();
                $ui.val( config.DEF_MARKET );
                $ui.show();
            });

            // update the drop down when the value changes
            bubpub.listen("hash/market", function () {
                $ui.val( self.current() );
            });

            // when drop down changes update the var
            $ui.change(function () {
                self.current( $(this).val() );
            });

            /***
             * @name market_DD.populate
             * fill the market drop down
             */
            self.populate = function market_DD_populate() {

                var list = self.list();
                var html = "";

                var temp = '<option value="(CODE)">(NAME)</option>';
                for (var item in list) {
                    if(list.hasOwnProperty(item)) {
                        var option = temp.replace('(NAME)', list[item]);
                        option = option.replace('(CODE)', item);
                        html += option;
                    }
                }

                // update market_DD
                $ui.html(html);
            };

            return self;
        })(); // <-- end of market_DD

        /***
         * @name page.lang_DD
         * is the abstraction of the language drop down
         * also houses the lang_list given from the API
         */
        var lang_DD = (function () {
            var self = {};

            var $ui = $('#lang_select');

            // this is what market is currently selected
            self.current = bubpub.obj(
                "hash/lang", config.DEF_LANG,
                function (test) {
                    return test in self.current_list();
            });

            self.list = bubpub.obj("lists/lang");

            self.current_name = function () {
                return self.list()[ self.current() ];
            };

            // bubpub events
            bubpub.listen("hash/market", function () {
                self.pick_default();
                self.populate();
            });

            bubpub.listen("lists/lang", function () {
                self.populate();
                $ui.val( config.DEF_LANG );
                $ui.show();
            });

            // update the drop down when the value changes
            bubpub.listen("hash/lang", function () {
                $ui.val( self.current() );
            });


            // when drop down changes update the var
            $ui.change(function () {
                self.current( $(this).val() );
            });

            self.pick_default = function (current) {
                var list = self.current_list();
                current = current || self.current(); // optional argument

                if (current in list === false) {
                    for (var def in list) break;

                    self.current(def);
                } else {
                    // changes it if it came from the argument
                    // otherwise just set to the same thing
                    // (which doesn't publish an event)
                    self.current(current);
                }
            };

            /***
             * @name lang.current_list
             * gets the current lang list
             */
            self.current_list = function () {
                return self.list()[ market_DD.current() ];
            };

            /***
             * @name lang.populate
             *
             * fill the language drop down
             */
            self.populate = function () {

                var langs = self.current_list();
                var temp = '<option value="(VAL)">(NAME)</option>';
                var option = "";
                var html;

                $ui.hide();

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

                $ui.html(html).fadeIn();

                bubpub.say("hash/lang");
            };


            return self;
        })(); // <-- end of lang_DD

        /***
         * @name page.search
         * this is the object that handles the searchbox.
         */
        var search = (function () {
            var self = {};

            self.search_str = bubpub.obj("hash/search", "");

            var $ui = {
                search_box : $('#dl_search_box'),
                form : $('#dl_search_form')
            };

            bubpub.listen("hash/search", function () {
                $ui.search_box.val( self.search_str() );
            });

            $ui.form.submit(function (e) {
                e.preventDefault();
                self.search_str( $ui.search_box.val() );
                page.sidebar.current("search");
            });

            return self;
        })();

        return {
            main : main,
            sidebar : sidebar,
            market_DD : market_DD,
            lang_DD : lang_DD,
            hash : hash,
            search : search,
        };

    })(); // <--- end of page object

    return {
        api : api,
        hash : hash,
        page : page
    };

};

var kdown = Kdown({
    DEF_MARKET : "eu"
});

kdown.api.load_lists();

