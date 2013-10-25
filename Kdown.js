/***
 * K-DOWN ~ Kyani download interface
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
 */

var Kdown = function () {
    "use strict";

    var API_URL = 'api.php';
    var logging = true;

    function log(message) {
        if (logging === true && typeof console !== 'undefined') {
            console.log(message);
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
        lang_list : null,   // list of valid markets

        json : {},          // saved json from the ajax querys
        table_json : null,  // hold the current table's JSON
        past_search : null  // a way to filter out the file list faster.
    };

    /***
     * Converts object to arrays using the words from
     * php 'key' and value' this is used to transform json
     * from the API to the proper array format that's
     * faster to go through with a for loop
     **/
    function object_to_array(object) {
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
    }

    // search arrays that are outputed by the 
    // above function, object_to_array
    //
    // returns: if it finds it it returns the index
    //          if not -1
    function find_in_arary_obj(needle, arr, prop) {
        for (var i = 0, l = arr.length; i < l; i ++) {
            var item =  arr[i];
            if (item[prop] === needle) {
                return i;
            }
        }
        return -1;
    }

    /***
     * allows you to access the array_object
     * like a normal object
     * 
     * var val = array[key];
     * var val = array.get_val(key);
     */
    function get_val (key, array) {

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

    var model = {

        /***
         * load the json to the API
         */
        format_json : function () { /* format the JSON into the list spesified in
             * files/structure.json
             */
        },

        get_market : function () {
            return db.market;
        },
        get_cat : function () {
            return db.cat;
        },
        get_lang : function () {
            return db.lang;
        },
        set_market : function (new_val) {
            var old_market = db.market;

            if ($.inArray(new_val, db.market_list) !== -1) {
                log('SET db.market (' + old_market + ') -> (' + new_val + ')');
                db.market = new_val;
                return true;
            } else {
                err('Setting to invalid Market ' + new_val);
                log(db.market_list);
                return false;
            }
        },
        set_cat : function (new_val) {
            var old_cat = db.cat;

            if (find_in_arary_obj(new_val, db.cat_list, 'key') !== -1) {
                log('SET db.cat (' + old_cat + ') -> (' + new_val + ')');
                db.cat = new_val;
                return true;
            } else {
                err('Setting to invalid Cat ' + new_val);
                return false;
            }
        },
        set_lang : function (new_val) {
            var old_lang = db.lang;

            if ($.inArray(new_val, db.lang_list) !== -1) {
                log('SET db.lang (' + old_lang + ') -> (' + new_val + ')');
                db.lang = new_val;
                return true;
            } else {
                err('Setting to invalid Lang ' + new_val);
                return false;
            }
        },

        get_market_list : function () {
            return db.market_list;
        },
        get_cat_list : function () {
            return db.cat_list;
        },
        get_lang_list : function () {
            return db.lang_list;
        },

        get_json : function () {
            return db.json;
        },

        /***
         * returns a JSON string that has market and cat in it too
         * in case you want to list that in the table. 
         */
        get_table_json : function (market, cat) {
            // check if they are false (hopefully undefined!)
            // if so set to the current market/cat
            market = market || db.market;
            cat = cat || db.cat;

            var json = db.json[market][cat].cat;
            var table_json = [];

            for (var i = 0, l = json.length; i < l; i ++) {
                var file = json[i];
                file.market = market;
                file.cat = cat;

                var lang_list = []; 
                for (var lang in file.langs) {
                    if(file.langs.hasOwnProperty(lang)) {
                        lang_list.push(lang);
                    }
                }

                file.langs = lang_list;

                table_json.push(file);
            }


            return table_json;
        },
        ajax_lists : function (callback) {
            var me = this;
            $.post("api.php", {}, function (json) {
                db.market_list = json.markets;
                db.cat_list = object_to_array(json.cats);

                me.set_market(db.market_list[0]);
                me.set_cat(db.cat_list[0].key);
                callback();
            }, 'json');
        },
        ajax_cat_files : function (callback) {

            var worked = null;

            if (db.market !== null && db.cat !== null ) {
                $.post(API_URL, { "market":db.market, "cat":db.cat }, function (json) {

                    //creates an entry for the market if there isn't one
                    db.json[ db.market ] = db.json[ db.market ] || {};

                    //creates the place to store the json for reuse
                    db.json[ db.market ][ db.cat ] = json;

                    //updates the_lang_list
                    db.lang_list = json.langs;

                    worked = true;

                    callback();
                }, "json")
                .fail(function () {
                    worked = false;
                });
            } else { // if  one is not set
                worked = false;
                err('ajax_to_db: Market = ' + db.market + ' Cat = ' + db.cat);
            }


            return worked;
        },

        sort_table : function (filter_feild, table_json) {
            // sort the table_json
        },
        filter_table : function (search_term ,table_json) {
            // filter the table_json
        },
        show : function () {
            log(db);
        },
        me : function () {
            return this;
        }


    };


    /***
     * Jquery handlers for everything.
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
        dropdown : {
            market : $('#market_select'),
            lang : $("#lang_select")
        },
        sidebar: {
            ul: $('#vertical_nav ul'),
            current : $(".current_page_item"),
            cats : $(".cat_link"),
            cat_links : $(".cat_link a")
        }
    };

    /***
     * the html of the copy objects
     */
    var html_copy = {
        table_row : '<tr>' + $("#table_copy").html() + '</tr>',
        cat : $('#copy-cat').html() //NOTE: need to change HTML
    };

    /***
     * This is a very simple Templating system. 
     * you hand it a string of HTML
     *      use put()       to replace a tag with value 
     *                      and fallback placeholder
     *      use clear()     get the html and reset it
     */
    var Template = function (template) {
        var temp = template;
        return {

            put : function(tag, replacement, placeholder) {
                if (typeof replacement === 'function') {
                    temp = temp.replace(tag, replacement() || placeholder);
                } else if (typeof placeholder !== 'undefined') {
                    temp = temp.replace(tag, replacement || placeholder);
                } else {
                    temp = temp.replace(tag, replacement);
                }
            },

            empty : function () {
                var ret = temp;
                temp = template;
                return ret;
            },
        };
    };


    /***
     * this are a collection of objects that
     * abstract the DOM
     */
    var helper = {
        table : {
            populate : function(json) {
                if (typeof json === 'undefined') {
                    json = model.get_table_json();
                }
                var table_html = "";
                var row = new Template(html_copy.table_row);

                for (var i = json.length - 1; i >= 0; i--) {
                    var row_data = json[i];

                    // Tempating
                    row.put("(HEART_URL)", '#');
                    row.put("(NAME)", row_data.filename);
                    row.put("(FILE_LINK)", 'single.php?id=' + row_data.id);
                    if (row_data.langs.length === 1) {
                        row.put("(LANG)", db.lang_list[row_data.langs[0]] , "~langs go here~");
                    } else {
                        row.put("(LANG)", row_data.langs.join(', ') , "~langs go here~");
                    }
                    row.put("(DL_LINK)", row_data.urlasd , "#");

                    table_html += row.empty();
                }
                
                $ui.table.first_body.html(table_html);
            }
        },
        cat_list : {
            populate : function(attribute) {
                
            },
            set_current : function () {
                //code
            }
        }
    };


    var view = {

        /***
         * bind or rebind all the dom elements
         */
        bind : function () {},

        /***
         * this is the amount of things that have to be updated.
         * by their 'update' id.
         *
         * when the push() command is run it will go through
         * each of these and execute their function. 
         *
         * see prepare object below, and make below that. 
         */
        que : [],

        /***
         * a list of methods to update UI coponents
         */
        update : {
            loading : {
                 
            },
            table : function () {
                var return_html;

            }
        },
        /***
         * this will update the dom with everything in the QUE
         */
        push : function () {
            if (this.que.length > 0) {
                this.prepare[this.que[0]]();
                this.cue = this.cue.slice(1);
                this.update();
            } else {
                return true;
            }
        },
    };

    return {
        "model" : model,
        "helper" : helper
    };
};


var test = {
    //testing ajax load
    ajax_format : function () {
        var k = new Kdown();
        var m = k.model.me();

        m.ajax_lists(function () {
            m.set_cat('applications');
            m.ajax_cat_files(function () {
                m.set_cat('business');
                m.ajax_cat_files(function () {
                    console.log(m.get_json()); 
                    console.log(m.get_table_json()); 
                });
            });
        });
    },
    router : function() {
        var r = Router(true);

        r.add("#cool");

        r.listen('#cool', function (args) {
            console.log("Here's the args");
            console.log(args);
        });

        r.show();

        r.fire("#cool/a/b/c");

    },
    populate : function () {
        var k = new Kdown();

        k.model.ajax_lists(function () {
            k.model.ajax_cat_files(function () {
                k.helper.table.populate();
            });
        });

    },

};

test.ajax_format();
test.populate();
