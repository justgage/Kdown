
/***
 * @name Kdown ~ Kyani download interface
 *
 * @constructor
 */

Kdown = (function ($, window, undefined) {
    "use strict";
    var kdown = {};

    var api = function () {
        var self = {};
    };

    var page = function () {
        var page_self = {};

        /***
         * @name page.main
         *
         * this will be the controller for the main area of the page
         * it will switch out whatever needs to be there.
         *
         * it also includes methods to create new "display objects" (New_obj)
         * and create object that inherit from other objects (Inherit)
         */
        page_self.main = function () {
            var self = {};

            var current = bubpub.obj("page/main/current", null, function (test) {
                return test in display_objs;
            });

            // a list of display_objects that will.
            var display_objs = {};

            /***
             * @name main.New_obj
             * a constructor for new display objects.
             *
             * @arg {string} tag the name by which it will be referred to with main.display() 
             *                   and stored with in display_objs.
             * @arg {function} Construct the function that creates the new object.
             *
             * @returns {object} the new object created. 
             */
            self.New_obj = function (tag, Construct) {

                // the object that all display objects will be derived.
                var def_obj = {
                    tag : tag,
                    display : function () {
                        console.log(".hide for " + tag + " not written!");
                    },
                    hide : function () {
                        console.log(".hide for " + tag + " not written!");
                    }
                };

                var new_obj = new Construct();

                display_objs[tag] = obj;

                console.log("NEW " + tag + " >>  was added to display objects");

                //combine the two overwriting the first one with second
                return $.extend(true, def, extra);
            };

            /***
             * @name main.Inherit
             * Take an existing display object and inherit from it.
             *
             * @arg {string} tag_to_clone the tag from which to clone.
             * @arg {string} new_tag the new tag it will be known by.
             * @arg {function} Construct the function that creates the new object.
             */
            self.Inherit = function (tag_to_clone, new_tag, Construct) {

                if (tag_to_clone in display_objs) {
                    var new_obj = $.extend( true, {}, display_objs[tag_to_clone] );

                    $.extend(true, new_obj, new Construct());

                    display_objs[new_tag] = new_obj;

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

                //call hide object
                current().hide();

                // change current
                current( display_objs[tag] );

                // run display new one
                current().display();
            };

            self.log = function () {

                console.log("display_objects");

                for (var tag in display_objs) {
                    if(display_objs.hasOwnProperty(tag)) {
                        console.log(" - " + tag);
                    }
                }

            };

            return self;

        };// end of page.main

        var table_normal = main.new_obj("table_normal", function () {
            var self = {};
            var file_list = new bubpub.obj('table/file_list');


            self.populate = function(file_list, lang_list, table_num) {

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
            };
             
            return self;
        }); // table_normal end

        var table_search = main.Inherit("table_normal", "table_search", function () {
            self = {};

            return self;
        });

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

        return page_self;
    };

})($, window);
