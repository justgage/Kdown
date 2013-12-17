/***
 * @name Kdown ~ Kyani download interface
 *
 * @constructor
 *
 */


/***
 * TODO:
 *      add sidebar loading
 *      add the cat loading to api
 *      make table load categorys
 *      change category on click
 *      import / export from the hash
 *      search page
 *      global option
 *      file pane
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

        var file_tree = new bubpub.obj('file_tree/load', {});

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
            });

            promise.fail(function (error_obj) {
                page.main.change("ajax");
            });
        };

        /***
         * @name API.load_file_tree
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

                    var temp_tree = {};
                    var tree = file_tree();
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
        };

        return {
            file_tree : file_tree,
            load_lists : load_lists,
            load_file_tree : load_file_tree
        };

    })(); // end of api




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

            var current = bubpub.obj("page/main/current", null, function (test) {
                return test.tag in display_objs;
            });

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

            self.$ui = {
                all : $('#dl_table_all'),
                each : $('.dl_table'),
                first : $('#dl_table_first'),
                first_body : $('#dl_table_first').find('tbody'),
                second : $('#dl_table_second'),
                second_body : $('#dl_table_second').find('tbody')
            };

            self.show = function () {
                self.$ui.all.show();
                self.$ui.first.show();
            };

            self.hide = function () {
                self.$ui.all.hide();
            };

            self.populate = function(file_list, lang_list) {

                lang_list = lang_list || model.current_lang_list();
                table_num = table_num || 1;

                var copy = "";
                var $table = "";
                var table_html = "";
                var market_list = db.market_list();
                var lang = lang_list[ db.lang() ];
                var market = market_list[ db.market() ];
                var row;
                var i;
                var l;

                if (table_num === 1) {
                    $table = self.$ui.first_body;
                    copy = table_row;
                } else {
                    $table = self.$ui.second_body;
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
            };

            return self;
        }); // table_normal end

        /***
         * @name table_search
         * this is the display_obj for table searching
         */
        var table_search = main.Inherit("table_normal", "table_search", function (self) {

            self.show = function () {
                self.$ui.all.show();
                self.$ui.first.show();
                self.$ui.second.show();
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

            self.cat_list = bubpub.obj("page/sidebar/cat_list");
            self.current = bubpub.obj("page/sidebar/current");
            self.page_list = bubpub.obj("page/sidebar/page_list");

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
                "page/DD/market/current", config.DEF_MARKET,
                function (test) {
                    return test in self.list();
            });

            self.list = bubpub.obj("page/DD/market/list");

            bubpub.listen("page/DD/market/list", function () {
                self.populate();
                $ui.val( config.DEF_MARKET );
                $ui.show();
            });

            // update the drop down when the value changes
            bubpub.listen("page/DD/market/current", function () {
                $ui.val( self.current() );
            });

            // when drop down changes update the var
            $ui.change(function () {
                self.current( $(this).val() );
            });

            /***
             * @name market_DD.populate
             * fill the market drop down with markets in db.market_list
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
                "page/DD/lang/current", config.DEF_LANG,
                function (test) {
                    return test in self.current_list();
            });

            self.list = bubpub.obj("page/DD/lang/list");

            bubpub.listen("page/DD/market/current", function () {
                self.populate();
            });

            bubpub.listen("page/DD/lang/list", function () {
                self.populate();
                $ui.val( config.DEF_LANG );
                $ui.show();
            });

            // update the drop down when the value changes
            bubpub.listen("page/DD/lang/current", function () {
                $ui.val( self.current() );
            });

            // when drop down changes update the var
            $ui.change(function () {
                self.current( $(this).val() );
            });

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

                $ui.html(html);
            };


            return self;
        })(); // <-- end of lang_DD

        var hash = (function () {
            var self = {};
            return self;
        })();

        return {
            main : main,
            sidebar : sidebar,
            market_DD : market_DD,
            lang_DD : lang_DD,
            hash : hash,
        };

    })(); // <--- end of page object

    return {
        api : api,
        page : page
    };

};

var kdown = Kdown({
    DEF_MARKET : "eu"
});

kdown.api.load_lists();
kdown.page.main.change("table_normal");
kdown.page.main.change("loading");

