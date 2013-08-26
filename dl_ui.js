/**
 * This is my fancy script to render and filter the downloads page
 * written in javascript using the jQuery library.
 *
 * -Gage Peterson justgage@gmail.com
 *
 */

$(function () {

    "use strict";
    /***
     * my download ui object
     */
    var dl_ui = dl_ui || {};

    /***
     * this handles the translations
     */

    dl_ui.trans = (function() {
        var trans = {};

        $("#dl_ui_translate p").each(function() {
            trans[ $(this).attr('translate') ] = $(this).text();
        });

        $("#t_downloads").html(trans['Downloads Page']);
        $("#t_market").html(trans['Market']);
        $("#t_cat").html(trans['Categorys']);
        $("#t_quick_find").html(trans['Quick Find']);
        $("#t_clear").html(trans['clear']);
        $("#t_show_all").html(trans['hide / show all']);

        return trans;
    })();


    /***************************************************************************
     * FUNCTION: This will update the amount of documents in each category
     */

    dl_ui.countDocs = function() {
        $("li.category").each(function () {
            var numFound = $(this).find(".download-item").length;
            $(this).find(".num-results").html("(" + numFound + ")");

        });
    };

    /***************************************************************************
     * FUNCTION this will rebind clicks and other events after changed html
     */
    dl_ui.bind = function(){

        ///bind click to categories opening and closing
        $(".category").on("click", "a", function () {
            $(this).parent().find(".cat-list").slideToggle(300);
        });
         
        //Show the translations when you click the button
        $(".lang-button").click(function () {
            $(this).parent().find(".lang-list").slideToggle(200);
        });

        //clears when you push the clear button
        $(".clear-button").click(function () {
            $("#file-search").val('');
            $("#file-search").focus();
            $(".download-item").show();
            $(".none-found").hide();

            dl_ui.countDocs();
        });

        $(".lang-button").hover(function() {
            $(this).toggleClass("lang-button-hover");
        });
    };


    /***************************************************************************
     * reload_downloads_list
     *
     * this will reload the categories
     * which is used in the ajax call when the market is changed
     *
     * This contains all the html for the list, which is horrible but I don't
     * know what else to do.
     * *************************************************************************
     */
    dl_ui.reload = function(json) {
        console.log(json);
        var html = "",
            i = 0,
            l = json.categories.length;

        //go through each category
        for ( ; i < l; i++ ) {
            var cat = json.categories[i];

            // add a category
            html += '<li class="category"> ';
            html += '<a class="cat-title" href="#aaa"><span class="num-results">...</span>&nbsp;&nbsp;';
            html += cat.name;
            html += ' </a><ul class="cat-list"> ';

            var j = 0,
                ll = cat.files.length;

            //go through each file
            for (; j < ll; j++) {

                var k = 0,
                    file = cat.files[j],
                    temp = "",
                    langNum = 0;


                //add an menu item
                html +=  '<li class="download-item">';
                html += '<a target="_blank" href="files/">';
                html += file.filename + "." + file.filetype + '</a>';

                if (file.languages) {

                    var lll = file.languages.length;


                    temp += '<span class="lang-button">  [ ' + dl_ui.trans['Translations']  + ' ### ]</span>';
                    temp += '<ul class="lang-list">';


                    //languages list
                    temp += "<table><tbody>";

                    // each language in the list
                    for (; k < lll; k ++) {
                        var langFile = file.languages[k];


                        if (langFile.url !== "#") {
                            var filename = "----";
                            if (langFile.url.indexOf("/") !== -1) {
                                filename = decodeURIComponent(langFile.url.slice(langFile.url.lastIndexOf("/") + 1));
                            }
                            temp += '<tr><td>' + langFile.name + '</td><td><a href="'+ langFile.url + '">'  + filename + '</a></td></tr>';

                            langNum++;
                        }


                    }

                    temp += "</table></tbody>";
                    temp += '</ul></li>'; //end lang list

                    if (langNum !== 0) {
                        temp = temp.replace("###", langNum);
                        html += temp;
                    }
                }
            }

            html += "<li class='none-found'>" + dl_ui.trans["no files found"] + "<a href='#'  class='clear-button' > " + dl_ui.trans["clear"] + "</a> </li>";
            
            //close category
            html = html + '</ul>';
        }

        $('#downloads-list').hide();
        $('#downloads-list').html(html);
        $('#downloads-list').fadeIn();

        dl_ui.bind();
        dl_ui.countDocs();

    };

    
    /***
     * Uses ajax to dynamically change
     * the downloads list to a market
     */
    dl_ui.ajax_load =  function(market) {

        //empty the list of items
        $('#downloads-list').html("<li class='loading'><img alt='%' src='/files/ticker.gif' />Loading...</li>");
        $('.none-found').show();



        $.ajax({
            url: "dl_api.php",
            data: {
                market: market
            },
            type: "POST",
            dataType: "json",
            success: function (json) {

                //IT WORKED! Reload the ui.

                setTimeout(function() {dl_ui.reload(json)}, 500);
            },
            error: function ( nothing, another,  error) {
                $('#downloads-list').html("<h3>" + dl_ui.trans["loading error"]+ "</h3><li>ERROR: <em>" + error + "</em></li>");
                $('.none-found').show();
            },
        });
    };
    dl_ui.ajax_load($("#market-select").val());

    /***
     * -NOTE- This function is to find a flat list of files but is currently unused.
     **/
     /*
    dl_ui.ajax_files_only = function(market) {

        //empty the list of items
        $('#downloads-list').html("<li class='loading'><img alt='%' src='/files/ticker.gif' />Loading...</li>");



        $.ajax({
            url: "dl_api.php",
            data: {
                market: "all-list"
            },
            type: "POST",
            dataType: "json",
            success: function (json) {
                console.log(json);
            },
            error: function ( nothing, another,  error) {
                $('#downloads-list').html("<h3>" + dl_ui.trans["loading error"]+ "</h3><li>ERROR: <em>" + error + "</em></li>");
            },
        });

    };
    */


    // bind drop down to the ajax loading
    $("#market-select").change(
        function () {
            var market = $(this).val();

            dl_ui.ajax_load(market);

        });

    /***
     *clear the search and put cursor in the box
    */
    $("#hide-all-button").click(function () {

       
        // if all are visible hide them
        if ($('.cat-list:visible').length !==  0) {
            $(".lang-list").hide();
            $(".cat-list").hide();
            $(".none-found").hide();
        }
        else { // if all are hidden show
            $(".cat-list").show();
            $("#file-search").val('');
            $(".download-item").show();
            $(".none-found").hide();
        }
    });

    /***
     * This is the search engine. Whenever there is a
     * key up then it filters out the results
     */
    $("#file-search").keyup(function () {

        $(".lang-list").hide();
        $(".arrow").show();
        $(".cat-list").show();

        var numFound = 0;

        // get users search term
        var searchtext = $(this).val().toUpperCase();
        var searchtext = searchtext.split(" ");

        //if the search term is not empty
        if (searchtext[0].length > 0) {
            $(".download-item").hide();


            $(".category").each(function () {
                numFound = 0;
                $(this).find(".download-item").each(function () {
                    // this will get an uppercase string to search in.
                    var haystack = $(this).find("a").text().toUpperCase();
                    var isFound = -1;

                    // this checks each search term 
                    for (var i = 0, l = searchtext.length; i < l; i ++) {
                        
                        var term = searchtext[i];
                        if (haystack.indexOf(term) !== -1 ) {
                            isFound++;
                        }
                    }
                    
                    //found each search term in the text
                    if (isFound === (searchtext.length - 1) ) {
                        numFound++;
                        $(this).show();
                    }

                });

                $(this).find(".num-results").html("(" + numFound + ")");

                if (numFound === 0) {
                    $(this).find(".none-found").show();
                } else {
                    $(this).find(".none-found").hide();
                }
            });

        } else { // if no search term
            dl_ui.countDocs();
            $(".download-item").show();
            $(".none-found").hide();
        }

    });

});
