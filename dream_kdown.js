
/***
 * Kdown ~ Kyani download interface
 */
Kdown = function () {
    "use strict";
    /***
     * config 
     */
    var LOGGING = false,
        API_URL = "files/dream_api.php";

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
    var Kobj = function (publish_name, preset, validator) {

        if (typeof preset === 'undefined') {
            preset = null;
        }
        var value = preset; // save as a local var
        validator = validator || null;

        /***
         * Will change value to new_val if the values are different
         */
        var change = function (new_val) {

            if (validator === null || validator(new_val) === true) { // passed 
                if (value !== new_val) {

                    if (LOGGING === true) {
                        console.log(publish_name + " changed " +
                                    value + " => " , new_val);
                    }

                    value = new_val;

                    bubpub.say(publish_name);

                    return true;
                     
                } else {
                    if (LOGGING === true) {
                        console.warn("WARN: " +
                                    publish_name +
                                    " no change to value -> " + value);
                    }
                    return false;
                }

            } else { // validation failed
                console.error(publish_name + " validation failed! => " + new_val);
                return false;
            }
        };

        var get = function () {
            return value; // get 
        };

        var set = function (new_val) {
            change(new_val);
        };

        return {
            get : get,
            set : set,
        };
    };

    /***
     * holds all the information in Kojs (see above)
     */
    var db = {
        page : new Kobj('page_change', 'cat'),        // current page

        market : new Kobj('page/market', null, function (test) {
            return test in  db.market_list.get === false;
        }),         // current market
        cat : new Kobj('page/cat'),               // current category
        lang : new Kobj('page/lang'),             // current translation selected (can be 'ALL')
        lang_count : new Kobj('lang_count'),      // each language's count [lang] => count

        file_list : new Kobj('list/files'),          // list of valid categories
        cat_list : new Kobj('list/cats'),          // list of valid categories
        market_list : new Kobj('list/markets'),    // list of valid markets
        lang_list : new Kobj('list/langs', {}),    // list of valid languages

        file_tree : new Kobj('ajax/load'), // hold the current table's JSON

        current_file_tree : function () {

            var tree = db.file_tree.get(); // all files
            var market = url_safe( db.market.get() );
            var cat = url_safe( db.cat.get() );
            
            if (typeof tree[market] === 'undefined') {
                return null;
            }

            if (typeof tree[market][cat] === 'undefined') {
                return null;
            }

            return  tree[market][cat];
        },
        current_lang_list : function () {
            var tree = this.current_file_tree();

            var i = tree.length;
        }
    };

    /***
     * a little helper function to make things URL safe 
     * that changes it to lowercase and replaces anything 
     * that's not alphanumeric to a dash
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
        copy : {
            table_row : '<tr>' + $("#table_copy").html() + '</tr>',
            page : $('#copy-cat').html() //NOTE: need to change HTML
        },
        hash : {

            /***
             * get out of the hash
             */
            import : function () {
                var hash = window.location.hash;

                hash = hash.split('/');

                var page = hash[0].slice(1);

                db.page.set(page);

                if (page === "#cat") {
                    db.market.set(hash[1]);
                    db.cat.set(hash[2]);
                } else {
                    
                    // Hackish way to get first element in the object
                    //      NOT the same in all browsers!!!!
                    //      a better way is needed
                    for(var def_market in db.market_list.get() ) break;
                    for(var def_cat    in db.cat_list.get()    ) break;

                    db.market.set( url_safe(def_market) );
                    db.cat.set( url_safe(def_cat) );
                }

            },
            /***
             * export data to the hash
             */
            export : function () {
                var page = db.page.get();
                var hash = "#" + page;

                if (page === "cat") {
                    hash += "/" + db.market.get();
                    hash += "/" + db.cat.get();
                }

                window.location.hash = hash;
            }
        },
        table : {
            populate : function(file_list) {


                if (typeof file_list === 'undefined') {
                    //file_list = db.file_list(); // all files
                    file_list = db.current_file_tree(); // all files

                    if (file_list === null) {
                        bubpub.say("error/none_found");
                        return false;
                    } else {
                        bubpub.say("error/clear");
                    }
                }

                var table_html = "";
                var copy = view.copy.table_row;
                var row = copy;

                // backwards
                for (var i = file_list.length - 1; i >= 0; i--) {
                    var file = file_list[i];
                    row = copy;

                    // Tempating
                    row = row.replace("(HEART_URL)", '#');
                    row = row.replace("(NAME)", file.name);
                    row = row.replace("(FILE_LINK)", 'single.php?id=' + file.id);
                    row = row.replace("(LANG)", file.language);

                    table_html += row;
                }

                $ui.table.first_body.html(table_html);

                return true;
            },
            lang_filter : function(lang) {
                var json = db.table_json.get(), // TODO: table_json is invalid
                    filtered_json = [],
                    num_found = 0,
                    i = 0, l;

                lang = lang || db.lang.get();

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
        },
        sidebar : {
            populate : function () {
                var copy = view.copy.page,
                    html = "",
                    li = "",
                    cat_list = db.cat_list.get(),
                    market = db.market.get();

                console.assert(market !== null, "Sidebar");

                for (var code in cat_list) {
                    if(cat_list.hasOwnProperty(code)) {
                        var page = cat_list[code];
                        li = copy;

                        li = li.replace(/\(CAT\)/g, code);
                        li = li.replace("(HREF)", "#cat/" + market + "/" + code);
                        li = li.replace("(TITLE)", page);


                        html += li;
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
                sidebar.ul.find( "#cat_" + db.cat.get() ).
                    addClass(sidebar.current_class.slice(1));
            }
        },
        market_DD : {
            populate : function () {
                var list = db.market_list.get();
                var html;
                var temp = '<option value="(NAME)">(NAME)</option>';
                for (var item in list) {
                    if(list.hasOwnProperty(item)) {
                        var option = temp.replace(/\(NAME\)/g, list[item]);
                        html += option;
                    }
                }
                $ui.DD.market.html(html);
            },
            update : function () {
                $ui.DD.market.val( db.market.get() );
            }

        },
        lang_DD : {
            populate : function () {
                var langs = db.lang_list.get();
                var html;
                var temp = '<option value="(VAL)">(NAME)</option>';
                var count = db.lang_count.get();
                var option = temp.replace("(VAL)", 'all');
                option = option.replace("(NAME)", "All" );
                html += option;

                for (var code in langs) {
                    if(langs.hasOwnProperty(code)) {
                        option = temp;
                        var name = langs[code],
                        num = count[code] || 0,
                        spaces = [];

                        option = option.replace("(VAL)", code);
                        num = num + ""; // change to a string
                        for (var ii = 0, l = 4 - num.length; ii< l; ii++) {
                            spaces.push("\u00A0"); //this is the char for a non-breaking space
                        }
                        name = num + spaces.join(" ") + name;

                        option = option.replace("(NAME)", name );
                        html += option;

                    }
                }
                $ui.DD.lang.html(html).val(NATIVE_LANG);
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
        load_json : function () {
            var promise = $.post(API_URL, {}, null, 'json');

            promise.done(server.save_json);

            promise.fail(function (code) {
                console.log("FAIL", code);
                bubpub.say("ajax/fail");
            });

        },
        save_json : function (json) {

            console.log("json response", json);

            var file_list  = json.files,
                market_list = {},
                lang_list   = {},
                cat_list    = {},
                file_tree   = {},
                i           = file_list.length;


                // go through every file (backwards!)
                while (i--) {
                    var f = file_list[i]; // single file

                    f.safe_market = url_safe(f.market);
                    f.safe_cat = url_safe(f.category);

                    /***
                     * add them all the object (overwrites if already there)
                     */
                    cat_list[ f.safe_cat ]       = f.category;
                    lang_list[ f.safe_lang ]     = f.language;
                    market_list[ f.safe_market ] = f.market;

                    /***
                     * create entrys if needed
                     */
                    file_tree[ f.safe_market ] = file_tree[ f.safe_market ] || {};
                    file_tree[ f.safe_market ][ f.safe_cat ] =
                        file_tree[ f.safe_market ][ f.safe_cat ] || [];

                    /***
                     * add file to the tree
                     * tree -> market -> category -> file
                     */
                    file_tree[ f.safe_market ][ f.safe_cat ].push(f);

                } // end while

                // stick it all in the local storage
                db.file_list.set(file_list);
                db.market_list.set(market_list);
                db.lang_list.set(lang_list);
                db.cat_list.set(cat_list);
                db.file_tree.set(file_tree);  // publishes ("ajax/load")

                // set the defaults (from the hash if needed)
                view.hash.import();
        }
    };

    /***
     * first function to run 
     */
    var start = function () {

        bubpub.listen("ajax/load", function () {
            view.table.populate();
        });

        bubpub.listen("page", function () {
            console.log("Page Change: ", db.cat.get(), db.market.get());
            view.table.populate();
            //view..populate();
        });

        bubpub.listen("page/market", function () {
            view.sidebar.populate();
        });

        bubpub.listen("page/cat", function () {
            view.sidebar.set_current();
        });

        bubpub.listen("list/markets", function () {
            console.log("market_list");
            view.market_DD.populate();
        });

        bubpub.listen("list/cats", function () {
            console.log("cat_list");
            view.sidebar.populate();
        });

        bubpub.listen("error/clear", function () {
            view.error.clear();
        });

        bubpub.listen("error/none_found", function () {
            console.log("none_found fire");
            view.error.none_found();
        });

        /***
         * Bind events to the DOM
         */
        $ui.DD.market.change(function () {
            db.market.set( $(this).val() );
        });

        $ui.sidebar.ul.on('click', 'a', function () {
            db.cat.set( $(this).parent().data('cat') );
        });

        server.load_json();

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




