
/***
 * @name Kdown ~ Kyani download interface
 *
 * @constructor
 */

Kdown = (function ($, window, undefined) {
    "use strict";

    var api = function () {
        var self = {};
    };

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
            var self = {};

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
            self.Display_obj = function (tag, Construct) {

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
            self.Inherit = function (tag_to_clone, new_tag, Construct) {

                if (tag_to_clone in display_objs) {
                    var new_obj = $.extend( true, {}, display_objs[tag_to_clone] );

                    $.extend(true, new_obj, new Construct(new_obj));

                    new_obj.parent_tag = new_obj.tag;
                    new_obj.tag = new_tag;

                    display_objs[new_tag] = new_obj;

                    console.log("[ main.Inherit ] INHERIT: " + tag_to_clone  + " ++> " + new_tag);

                    return new_obj;
                } else {
                    console.error(tag_to_clone + " is does not exist to inherit from ->", display_objs);
                }
            };

            /***
             * @name main.change
             * Change which display object is presenting
             */
            self.change = function (tag) {

                if (current() !== null) {
                    console.log("[ main.change ]: " + current().tag + " >> " + tag);
                    //call hide object
                    current().hide();
                }

                // change current
                current( display_objs[tag] );

                // run display new one
                current().show();

            };

            self.log = function () {

                console.log("[ main.display_objects ]");

                for (var tag in display_objs) {
                    if(display_objs.hasOwnProperty(tag)) {
                        console.log(" - " + tag, display_objs[tag]);
                    }
                }

            };

            return self;

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
        main.Display_obj("message", function () {

            return {
                show : function () {
                    $ui.show();
                },
                hide : function () {
                    $ui.hide();
                }
            };
        });

        main.Inherit("message", "loading", function (self) {
            self.$ui = $('#dl_loading');
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

        var sidebar = function () {
            var self = {};
            return self;
        };

        var market_DD = function () {
            var self = {};
            return self;
        };

        var lang_DD = function () {
            var self = {};
            return self;
        };

        var hash = function () {
            var self = {};
            return self;
        };

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

})($, window);

Kdown.page.main.log();

Kdown.page.main.change("table_normal");
Kdown.page.main.change("table_search");
