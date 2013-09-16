var kdown  = {
    db : {
        list : {},
        market : "",
        /***
         * this will load the whole file list into db.list
         */
        load : function () {
            "use strict";
            $.post("api.php", { "search": ""} ,  function (json) {
                kdown.db.list = json.list;
                delete kdown.db.list["cat-list"];
                console.log(kdown.db.list);

                kdown.marketDD.load();
                kdown.langDD.load();
                kdown.table.load();
                kdown.search.bind();
                kdown.search.load();
                kdown.search.go();


            }, "json" );

        }
    },
    search : {
        // this will get the GET parameter from the URL based on name
        _GET : function (name) {
            var result = decodeURI(
                (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
            );

            //fixes all the + and makes them spaces
            return result.replace(/\+/g, " ");

        },
        // use get in the URL 
        load : function () {
            var search_term = kdown.search._GET('search');
            if (search_term !== 'null') {
                $("#dl_search_box").val(unescape(search_term));
            } else {
                $("#dl_search_box").val("");
            }
        },
        bind : function () {
            $("#dl_search_box").keyup(function () {
                kdown.search.go();
            });

            $(".search_clear").click(function () {
                $("#dl_search_box").val("");
                kdown.search.go();
                $("#dl_search_box").focus();
            });

            $("#to_top").click(function() {
                $("html, body").animate({ scrollTop: 0 }, "fast");
                return false;
            });
        },
        go : function () {

            // get users search term and splits it up by spaces
            var searchtext = $("#dl_search_box").val().toUpperCase();
            searchtext = searchtext.split(" ");

            if (searchtext.length > 0) {

                $(".table_row").hide();
                //checks for any blank items in the array and deletes them
                (function() {
                    $.each(searchtext, function (i, searchterm) {
                        //if the item is blank
                        if ( searchtext[i] === "" ) {
                            searchtext.splice(i,1);
                        }
                    });
                })();


                $(".dl_table").each(function () {
                    var numFound = 0; 

                    //goes through each table row
                    $(this).find(".table_row").each(function () {
                        // this will get an uppercase string to search in.
                        var haystack = $(this).find(".table_name a").text().toUpperCase();
                        var isFound = -1;
                        // console.log(haystack);

                        // this checks each search term 
                        $.each(searchtext, function (i, term) {
                            if (haystack.indexOf(term) !== -1 ) {
                                isFound++;
                            }
                        });

                        //found each search term in the text
                        if (isFound === (searchtext.length - 1) ) {
                            numFound++;
                            $(this).show();
                        }

                    });

                    // if none found in the table show the message
                    if (numFound === 0) {
                        $(this).find(".none_found").show();
                        $(this).find("table").hide();
                    } else {
                        $(this).find(".none_found").hide();
                        $(this).find("table").show();
                    }

                    kdown.table.highlight();


                });


            } else { // if no search term
                $(".table_row").show();
                $(".none_found").hide();
            }
        },
    },
    marketDD : {
        // this will populate the market drop down
        load : function () {
            var app = kdown.db;
            var option = $("<option value=''></option>");

            $.each(app.list, function(market, inside) {

                var clone = option.clone();

                $(clone).text( market );
                $(clone).attr("value", market );

                $("#market_select").append(clone);

                app.market = $("#market_select").val();

                $("#market_label").text(app.market);
            });
        }
    },
    langDD : {
        load : function () {

            var app = kdown.db;

            $("#lang_select").html("");

            var option = $("<option value=''></option>");

            // make an entry for each language in the drop down. 
            $.each(app.list[app.market].langs, function(lang_code, lang_name) {
                var clone = option.clone();
                $(clone).text(lang_name);
                $(clone).attr("value", lang_code );
                $("#lang_select").append(clone);
            });

            var allclone = option.clone();
            $(allclone).text( "All" );
            $(allclone).attr("value", "all" );
            $("#lang_select").prepend(allclone);
        }
    },
    table : {
        load : function () {
            "use strict";

            var app = kdown.db;
            var db = kdown.db.list;
            var i, l;

            //goes through each market
            $.each( db, function (market, inside) {

                var table_sel = "";

                //if market equal to the selected one in the drop down. 
                if (market === app.market) {
                    table_sel = $("#dl_table_first table");
                } else {
                    table_sel = $("#dl_table_second table");
                }
                // go through each category
                $.each(inside.cats, function(i, cat) {

                    // each file
                    $.each(cat.files, function(i, file) {

                        var row = $(table_sel).find(".table_copy").clone();

                        $(row).attr('class', 'table_row' );
                        $(row).show();

                        var newRow = row.clone();
                        $(table_sel).append(newRow);

                        //Put the files information into the new row in the table
                        $(newRow).find(".table_star").text( "*" );
                        $(newRow).find(".table_name a").text( file.filename ).attr("href",
                                "single.php?id=" + encodeURIComponent( file.id ));
                        $(newRow).find(".table_lang").text(file.native_lang);
                        $(newRow).find(".table_market").text(market);
                        $(newRow).find(".table_dl_link a").attr("href", file.href);

                    });
                });

            });
        },
        highlight : function () {
            $("#dl_table_first tr, #dl_table_second tr").removeClass("table_row_odd");
            $("#dl_table_first tr:visible, #dl_table_second tr:visible").filter(":odd").addClass("table_row_odd");
        }
    }
};


kdown.db.load();


