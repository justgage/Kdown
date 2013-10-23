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

    var logging = true;

    function log(message) {
        if (loggin === true && typeof console !== 'undefined') {
            console.log(message);
        }
    }

    function err(message) {
        if (loggin === true && typeof console !== 'undefined') {
            console.error(message);
        }
    }

    var API_URL = 'api.php';
    /***
     * This is the local database that holds everything we need
     * to know about the current page
     */
    db = {
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

    model = {
        /***
         * this will choose if the console.log is used
         */

        /***
         * load the json to the API
         */
        AjaxToDb : function () {

            var error = null;

            $.post(API_URL, { "market":db.market, "cat":db.cat }, function (json) {

                //creates an entry for the market if there isn't one
                db.json[ db.market ] = db.json[ db.market ] || {};

                //creates the place to store the json for reuse 
                db.json[ db.market ][ db.cat ] = json;

                error = false;

            }, "json")
            .fail(function () {
                error = true;
            });

            return error;
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

    };




};





