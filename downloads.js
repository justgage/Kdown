
/***
 * Handles the saving and loading of requests to the database
 */
var db = db || {};

db.json = {}; // variable used to save ajax querys

//current market
db.market = undefined;
//current category
db.cat = undefined;
//the master list of valid categorys and markets
db.list = undefined;


/***
 * Handles the category list
 */
var catList = catList || {};

/***
 * Handles the table
 */
var table =  table || {};

/***
 * handles the market drop down
 */
var marketDD = {};

//these are the selectors for different elements on the page
MARKET       = "#market_select";
CAT_CURRENT  = ".current_page_item";
CAT_LINKS    = ".cat_link a";
CAT          = ".cat_link";

$(document).ready(function() {


    //***********************************************************
    // table FUNCTIONS
    //***********************************************************
    table.load = function(json) {

        //
        // UPDATE TRANSLATIONS DROP DOWN ***************
        //
        $("#lang_select").html("");

        var option = $("<option value=''></option>");

        //change the translations dropdown
        for (var i = 0, l = json.langs.length; i < l; i ++) {
            var v = json.langs[i];

            var clone = option.clone();

            $(clone).text( v );
            $(clone).attr("value", v );

            $("#lang_select").append(clone);

        }

        //
        // UPDATE TABLE ***************
        //
        $('.table_row').remove();

        //make a copy of the row
        var row = $("#table_copy").clone();

        $(row).removeAttr('id');
        $(row).attr('class', 'table_row' );
        $(row).show();

        for (var i = 0, l = json.cat.length; i < l; i ++) {

            var file = json.cat[i];
            var newRow = row.clone();
            $("#dl_table table").append(newRow);

            //Put the files information into the new row in the table
            $(newRow).find(".table_star").text( "*" );
            $(newRow).find(".table_name a").text( file.filename ).attr("href", "single.php?id=" + encodeURIComponent( file.id ));
            $(newRow).find(".table_lang").text(file.native);
            $(newRow).find(".table_dl_link a").attr("href", file.href);

            if (i % 2 === 0) {
                $(newRow).addClass("table_row_even");
            }

        }
        $("#dl_loading").hide();
        $('#dl_table table').fadeIn();

    }

    //***********************************************************
    // catList FUNCTIONS
    //***********************************************************

    /***
     * Load the cat list from json
     */
    catList.load = function(json) {
        var item = $("#vertical_nav li");

        //$(item).remove();

        for (var i = 0, l = json.cats.length; i < l; i ++) {
            var temp = item.clone();
            $(temp).addClass("cat_link");
            $(temp).find("a").text(json.cats[i])
            $(temp).find("a").attr("href", "#" + json.cats[i] + "@" + db.market)
            var menu_item = $("#vertical_nav ul").append(temp);
        }

        $(item).attr('id', 'all_items');

    };

    catList.hashUpdate = function() {
        $(CAT_LINKS).each(function() {
            $(this).attr("href", "#" + $(this).text() + "@" + db.market);
        });

        //updates the hash in the URL
    };

    /***
     * this function will bind the category links 
     * (if categorys are changed you need to recall this)
     */
    catList.bind = function () {
        //click the category to change to it
        $(CAT_LINKS).click(function () {
            
            $(CAT_CURRENT).removeClass(CAT_CURRENT.slice(1));
            $(this).parent().addClass("current_page_item");

            console.log("catList.hashswitch");
        });
    }

    // this will load the hash from the URL 
    // reload ~ if to reload the downloads list or not. 
    
    catList.hashswitch = function(reload) { 
        console.log("catList.hashswitch");
        

        var find = false;

        // this will use the # in the URL to find the //category
        $("#vertical_nav li a[href*='" + db.cat  + "']").each(function() {
            $(CAT_CURRENT).attr('class', 'cat_link');
            $(this).parent().addClass("current_page_item");
            find = true;
        });

        if (find === false) {
            console.log("   find = false");
            $("#vertical_nav li").first().addClass("current_page_item");
            $(CAT_CURRENT).removeClass(CAT_CURRENT.slice(1));
        }

        if (reload) {
            db.load();
        }

    };

    //***********************************************************
    // marketDD FUNCTIONS
    //***********************************************************

    // this will populate the market list based on the json object
    marketDD.load = function(json) {
        var option = $("<option value=''></option>");
        //change the markets dropdown
        for (var i = 0, l = json.markets.length; i < l; i ++) {
            var v = json.markets[i];

            var clone = option.clone();

            $(clone).text( v );
            $(clone).attr("value", v );

            $("#market_select").append(clone);

        }


    };


    //***********************************************************
    // db FUNCTIONS
    //***********************************************************

    // abstracts the loading and the saving of pages
    // GOOD!
    db.load = function() {
        console.log("---db.load---");

        if ( db.json[ db.market ]  &&  db.json[ db.market ][ db.cat ] ) {
            console.log("   db.load--->db.loadJSON()");
            db.loadJSON( db.json[ db.market ][ db.cat ] );
        }
        else {
            console.log("   db.load--->db.ajax_load()");
            db.ajax_load();
        }
    }

    /***
     * This is a function that will
     * GOOD!
     */
    db.ajax_load =  function () {

        //empty the list of items

        $("#dl_loading").show();
        $("#dl_table table").hide();

        //load using post method
        $.post("api.php", { "market":db.market, "cat":db.cat },  function (json) {
            console.log("Ajax worked!");

            db.json[ db.market ] = db.json[ db.market ] || {};

            db.json[ db.market ][ db.cat ] = json;
            db.loadJSON(json);
        }, "json")
        .fail(function () {
            console.log("ERROR: Ajax failed!");
        });

    };

    db.loadJSON = function (json) {

        // if the category exists in the data
        if (json.cat) {
            table.load(json);
        }
        else {
            console.log("ERROR:" + json.mess);
        }

    };

    /***
     * Take the hash and update the stored values (db.market, db.cat) 
     * IF => the hash is a valid category or market 
     * IF NOT => valid default to the first on the list
     */
    db.loadHash = function() {
        console.log("db.loadHash");

        db.market = false;
        db.cat = false;

        var urlhash = window.location.hash;
        var pos = urlhash.indexOf("@");
        var cathash = urlhash.slice(0,pos);
        var cat = cathash.slice(1);
        var market = urlhash.slice(pos + 1, urlhash.length)

        //Search for the hash in the market
        for (var i = 0, l = db.list.markets.length; i < l; i ++) {
            if (db.list.markets[i] === market)
                {
                    console.log("   FOUND THE MARKET!");
                    db.market = market;
                }

        }
        
        if (db.market === false) {
            db.market = $(MARKET).val();
            console.log("   no market found defalting to, " + db.market);
        }
        
        //Search for the hash in the categorys
        for (var i = 0, l = db.list.cats.length; i < l; i ++) {
            // TRANSLATION PROBLEMS!
            if (db.list.cats[i] === cat)
                {
                    console.log("   FOUND THE CAT!");
                    db.cat = cat;
                }
        }
        
        if (db.cat === false) {
            db.cat = $(CAT_CURRENT).text();
            console.log("   no categoy found defalting to, " + db.cat);
        }

        window.location.hash = "#" + db.cat + "@" + db.market;

        console.log("   after hash fix => " + window.location.hash);

    }

    //this will update tha hash based on the stored values
    db.hashUpdate = function(){
        window.location.hash = "#" + db.cat + "@" + db.market;
    };


    //************************************************************
    // things to do on page load
    //************************************************************

    //populate the categories and markets on page load
    $.post("api.php", {}, function (json) {
        console.log("----------$POST LOAD");

        db.list = json;

        // populate market and cat list
        marketDD.load(json);
        catList.load(json);
        
        //check to see if hash is good
        db.loadHash();

        //bind the cat links
        catList.bind();
        
        //this will switch based on the browsers hash tag
        catList.hashswitch(false);

        // update the cat links to have the right hash
        catList.hashUpdate();
        
        // poplate table with ajax request
        db.load();

    }, "json"); // JSON! very important to include this


    // This will change the category when you push back in the browser
    $(window).on('hashchange', function() {
        console.log("hashchange event");
        db.loadHash();
        catList.hashswitch(true);
    });

    /***
     * Bind market select to reloading the list of files
     */
    $(MARKET).change(function () {
        db.market = $(this).val();
        db.hashUpdate();
        catList.hashUpdate();
    });


});
