
/*
 * jQuery Tiny Pub/Sub
 * https://github.com/cowboy/jquery-tiny-pubsub
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(jQuery));



/***
 * Kdown ~ Kyani download interface
 */
Kdown = function () {
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
     * config 
     */
    var LOGGING = true;


    /***
     * an object that publishes events when it changes
     *
     * also has abilithy to have a validator funciton passed
     * in to test if the input is valid or not. 
     */
    Kobj = function (publish_name, preset) {



        if (typeof preset === 'undefined') {
            preset = null;
        }

        var value = preset;

        var change = function (new_val) {
            if (value !== new_val) {

                if (LOGGING === true) {
                    console.log(publish_name + " changed " + value + " => " + new_val);
                }

                value = new_val;
                $.publish(publish_name, value); 
            } else {
                if (LOGGING === true) {
                    console.log("WARN: " + publish_name + " set not fired due to no change -> " + value);
                }
            }
        };

        // getter / setter function 
        return function (new_val, validator) {
            if (typeof new_val === 'undefined') {
                return value; // get 
            } else {
                if (typeof validator === 'undefined') {

                    change(new_val);

                } else {

                    if (validator(new_val) === true) { // passed 
                        change(new_val);
                    } else { 
                        console.error(publish_name + " being set to invalid value, " + new_val);
                    }

                }
            }

        };
    };

    var db = {
        page : Kobj('page_change', 'cat'),     // current page

        market : new Kobj('market'),           // current market
        cat : new Kobj('cat'),                 // current category
        lang : new Kobj('lang'),               // current translation selected (can be 'ALL')

        cat_list : new Kobj('cat_list'),       // list of valid categorys
        market_list : new Kobj('market_list'), // list of valid markets
        lang_list : new Kobj('lang_list', {}), // list of valid markets
        lang_count : new Kobj('lang_count'),   // list of valid markets

        json : new Kobj('json', {}),           // saved json from the ajax querys
        table_json : new Kobj('table_json'),   // hold the current table's JSON
        past_search : new Kobj('past_search'), // a way to filter out the file list faster.
    };


    console.log('Kdown Loaded');

    return {
        "Model" : Model
    };
};

var Kdown = Kdown();
