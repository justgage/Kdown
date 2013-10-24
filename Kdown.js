/***
 * K-DOWN ~ Kyani download interface
 *
 * Made by Gage Peterson 2013,
 * justgage@gmail.com, twitter @justgage.
 *
 * rewritten on:  Wed Oct 23 11:50:39 MDT 2013
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
        page : null,       // current page

        market : null,     // current market
        cat : null,        // current category
        lang : null,       // current translation selected (can be 'ALL')

        catList : null,    // list of valid categorys
        marketList : null, // list of valid markets
        langList : null,   // list of valid markets

        json : {},       // saved json from the ajax querys
        tableJson : null,  // hold the current table's JSON
        pastSearch : null  // a way to filter out the file list faster.
    };

    /***
     * Converts object to arrays using the words from
     * php 'key' and value' this is used to transform json
     * from the API to the proper array format that's
     * faster to go through with a for loop
     **/
    function objectToArray(object) {
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
    // above function, objectToArray
    //
    // returns: if it finds it it returns the index
    //          if not -1
    function findInAraryObj(needle, arr, prop) {
        for (var i = 0, l = arr.length; i < l; i ++) {
            var item =  arr[i];
            if (item[prop] === needle) {
                return i;
            }
        }
        return -1;
    }

    var model = {
        /***
         * this will choose if the console.log is used
         */

        /***
         * load the json to the API
         */
        formatJson : function () {
            /* format the JSON into the list spesified in
             * files/structure.json
             */
        },

        getMarket : function () {
            return db.market;
        },
        getCat : function () {
            return db.cat;
        },
        getLang : function () {
            return db.lang;
        },
        setMarket : function (newVal) {
            var oldMarket = db.market;

            if ($.inArray(newVal, db.marketList) !== -1) {
                log('SET db.market (' + oldMarket + ') -> (' + newVal + ')');
                db.market = newVal;
                return true;
            } else {
                err('Setting to invalid Market ' + newVal);
                log(db.marketList);
                return false;
            }
        },
        setCat : function (newVal) {
            var oldCat = db.cat;

            if (findInAraryObj(newVal, db.catList, 'key') !== -1) {
                log('SET db.cat (' + oldCat + ') -> (' + newVal + ')');
                db.cat = newVal;
                return true;
            } else {
                err('Setting to invalid Cat ' + newVal);
                return false;
            }
        },
        setLang : function (newVal) {
            var oldLang = db.lang;

            if ($.inArray(newVal, db.langList) !== -1) {
                log('SET db.lang (' + oldLang + ') -> (' + newVal + ')');
                db.lang = newVal;
                return true;
            } else {
                err('Setting to invalid Lang ' + newVal);
                return false;
            }
        },

        getMarketList : function () {
            return db.marketList;
        },
        getCatList : function () {
            return db.catList;
        },
        getLangList : function () {
            return db.langList;
        },

        getJson : function () {
            return db.json;
        },

        getTableJson : function (market, cat) {
            return db.tableJson;
        },
        ajaxLists : function (callback) {
            var me = this;
            $.post("api.php", {}, function (json) {
                db.marketList = json.markets;
                db.catList = objectToArray(json.cats);

                me.setMarket(db.marketList[0]);
                me.setCat(db.catList[0].key);
                callback();
            }, 'json');
        },
        ajaxCatFiles : function (callback) {

            var worked = null;

            if (db.market !== null && db.cat !== null ) {


                $.post(API_URL, { "market":db.market, "cat":db.cat }, function (json) {

                    //creates an entry for the market if there isn't one
                    db.json[ db.market ] = db.json[ db.market ] || {};

                    //creates the place to store the json for reuse
                    db.json[ db.market ][ db.cat ] = json;

                    worked = true;

                    callback();
                }, "json")
                .fail(function () {
                    worked = false;
                });
            } else { // if  one is not set
                worked = false;
                err('ajaxToDb: Market = ' + db.market + ' Cat = ' + db.cat);
            }


            return worked;
        },

        sortTable : function (filterFeild, tableJson) {
            // sort the tableJson
        },
        filterTable : function (searchTerm ,tableJson) {
            // filter the tableJson
        },
        show : function () {
            log(db);
        },
        me : function () {
            return this;
        }


    };

    var controller = {

    };

    var view = {
        /***
         * Jquery handlers for everything.
         */
        $ui : {
            table: {
                all : $('.dl_table'),
                first : $('#dl_table_first'),
                firstBody : $("#dl_table_first").find("tbody"),
                second : $('#dl_table_second'),
                secondBody : $("#dl_table_second").find("tbody")
            },
            error : {
                loading : $("#dl_loading"),
                ajax : $("#ajax_error"),
                noneFound : $('#none_found')
            },
            dropdown : {
                market : $('#market_select'),
                lang : $("#lang_select")
            },
            sidebar: {
                ul: $('#vertical_nav ul'),
                current : $(".current_page_item"),
                cats : $(".cat_link"),
                catLinks : $(".cat_link a")
            }
        },

        /***
         * the html of the copy objects
         */
        htmlCopy : {
            tableRow : $("#table_copy").html(),
            cat : $('#copy-cat').html() //NOTE: need to change HTML
        },
        /***
         * Easy way to replace traslations to other things.
         */
        templater : {
            table : function () {

            }
        },
        /***
         * bind or rebind all the dom elements
         */
        //bind : function () { },
        /***
         * This will prepare all the HTML for exporting it to the DOM
         */
        make : function () {

        },
        /***
         * This will push the prepared HTML to the dom.
         */
        display : function () {

        },
    };

    return {
        "model" : model
    };
};

var test = {
    //testing ajax load
    ajaxFormat : function () {
        var k = new Kdown();
        var m = k.model.me();

        m.ajaxLists(function () {
            m.show();
            m.setCat('applications');
            m.ajaxCatFiles(function () {
                m.setCat('business');
                m.ajaxCatFiles(function () {
                    m.show(); 
                });
            });
        });
    },
    router : function() {
        var r = Router(true);

        r.add("#cool");

        r.listen('#cool', function (a, b, c) {
            console.log("fired");
            console.log(a);
        });

        r.show();

        r.fire("#cool/a/b/c");

    }

};

test.router();

