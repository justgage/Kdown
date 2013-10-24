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

        json : null,       // saved json from the ajax querys
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

    var model = {
        /***
         * this will choose if the console.log is used
         */

        /***
         * load the json to the API
         */
        ajaxLists : function () {
            $.post("api.php", {}, function (json) {
                db.marketList = json.markets;
                db.catList = objectToArray(json.cats);
            }, 'json');
        },
        ajaxCatFiles : function () {

            var worked = null;

            if (db.market !== null && db.cat !== null ) {


                $.post(API_URL, { "market":db.market, "cat":db.cat }, function (json) {

                    //creates an entry for the market if there isn't one
                    db.json[ db.market ] = db.json[ db.market ] || {};

                    //creates the place to store the json for reuse
                    db.json[ db.market ][ db.cat ] = json;

                    worked = true;

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

            if (typeof db.marketList[market] !== 'undefined') {
                log('SET db.market (' + oldMarket + ') -> (' + market + ')');
                db.market = market;
                return true;
            } else {
                err('Setting to invalid Market' + market);
                return false;
            }
        },
        setCat : function (newVal) {
            var oldCat = db.cat;

            if (typeof db.catList[cat] !== 'undefined') {
                log('SET db.cat (' + oldCat + ') -> (' + cat + ')');
                db.cat = cat;
                return true;
            } else {
                err('Setting to invalid Cat' + cat);
                return false;
            }
        },
        setLang : function (newVal) {
            var oldLang = db.lang;

            if (typeof db.langList[lang] !== 'undefined') {
                log('SET db.lang (' + oldLang + ') -> (' + lang + ')');
                db.lang = lang;
                return true;
            } else {
                err('Setting to invalid Lang' + lang);
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
        ui : {
            tables: {
                all : $('.dl_table'),
                first : $('#dl_table_first'),
                second : $('#dl_table_second')
            },
            errors : {
                ajax : $('#'),
                noneFound : $('#')
            }
        },
        /***
         * Easy way to replace traslations to other things.
         */
        templater : function (html) {

        },
        /***
         * bind or rebind all the dom elements
         */
        bind : function () {

        },
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

k = Kdown();
