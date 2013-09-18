function klog(mess) {
    if (window.console !== undefined) {
        console.log(mess);
    }
}

var kdown = {
    db: {
        marketsJSON: {}, // saved JSON from ajax query
        langsJSON: {}, // this will save the languages based on market
        market: "", // current market

        //  this will load the whole file list into db.marketsJSON
        load: function () {
            "use strict";
            $.post("api.php", {
                "search": ""
            }, function (json) {
                //TODO: make it so this is included in the table?
                var cat_list = json.list["cat-list"];
                delete json.list["cat-list"];

                klog("API json  ->");

                var temp = json.list;

                var list = {};

                // crawl the json the take out categories and make them
                // a item of file. 
                $.each(temp, function (market_name, inside) {
                    list[market_name] = [];

                    kdown.db.langsJSON[market_name] = inside.langs;

                    $.each(inside.cats, function (cat_code, cat) {
                        $.each(cat.files, function (i, file) {
                            list[market_name].push(file);
                            //this will add a cat field to the list
                            list[market_name][list[market_name]
                                .length - 1
                            ].cat = cat.name;
                        });
                    });
                });


                klog("New list ->");
                klog(list);
                kdown.db.marketsJSON = list;

                kdown.marketDD.load();
                kdown.langDD.load();
                kdown.table.load();
                kdown.search.bind();
                kdown.search.load();
                kdown.search.go();


            }, "json");

        },
        // will return a filtered json object of the file list. 
        // terms seperated by spaces so that the words don't have to be in order. 
        filter: function (searchtext) {
            // get users search term and splits it up by spaces
            searchtext = searchtext.split(" ");

            if (searchtext.length > 0) {

                //checks for any blank items in the array and deletes them
                (function () {
                    $.each(searchtext, function (i, searchterm) {
                        //if the item is blank
                        if (searchtext[i] === "") {
                            searchtext.splice(i, 1);
                        } else {
                            searchtext[i] = searchtext[i].toUpperCase();
                        }
                    });
                })();

                //makes a copy of the list
                var jsonCopy = jQuery.extend(true, {}, kdown.db.marketsJSON);

                var filtered = {};

                // go through each market
                $.each(jsonCopy, function (market_name, market_list) {
                    filtered[market_name] = [];
                    filtered[market_name] = $.grep(market_list, function (file, i) {

                        var num = 0;

                        // try each term against the filename
                        $.each(searchtext, function (i, term) {
                            var haystack = file.filename.toUpperCase();
                            if (haystack.indexOf(term) !== -1) {
                                num++;
                            }
                        });

                        // if all terms where matched
                        if (num === searchtext.length) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                });

                return filtered;
            }

            //return unfiltered list if no search terms
            return kdown.db.marketsJSON;
        }
    },
    table : {
        html_row : $(".table_copy").html(),
        // populate the table with given json
        load: function (json) {
            "use strict";
            klog("table.load()-------");
            console.log(typeof json);
            if (typeof json === "undefined") {
                json = kdown.db.marketsJSON;
            }

            klog("JSON => ");
            klog(json);


            //yes going back to this way. 

            var db = kdown.db;
            var table_yours = $("#dl_table_first table");
            var table_other = $("#dl_table_second table");
            var html_tbody_yours = "";
            var html_tbody_other = "";

            var html_row = "<tr>" + kdown.table.html_row + "</tr>";


            klog("db looks like :");
            klog(table_yours);


            //goes through each market
            $.each(json, function (market, files) {
                $.each(files, function (i, file) {
                    var table_sel = "";
                    //if market equal to the selected one in the drop down. 
                    var row = html_row;

                    row = row.replace("(NAME)", file.filename);
                    row = row.replace("(FILE_LINK)", "single.php?id=" + encodeURIComponent(file.id));
                    row = row.replace("(LANG)", file.native_lang);
                    row = row.replace("(MARKET)", market);
                    row = row.replace("(DL_LINK)", file.href);

                    if (market === db.market) {
                        html_tbody_yours += row;
                    } else {
                        html_tbody_other += row;
                    }
                });
            });

            table_yours.find("tbody").html(html_tbody_yours);
            table_other.find("tbody").html(html_tbody_other);
            kdown.table.highlight();
            klog("-------");
        },
        // stripes the table
        highlight: function () {
            $("#dl_table_first tr, #dl_table_second tr").removeClass(
                "table_row_odd");
            $("#dl_table_first tr:visible, #dl_table_second tr:visible").filter(
                ":odd").addClass("table_row_odd");
        }
    },
    marketDD: {
        // this will populate the market drop down
        load: function () {
            var db = kdown.db;
            var option = $("<option value=''></option>");

            $.each(db.marketsJSON, function (market, inside) {

                var clone = option.clone();

                $(clone).text(market);
                $(clone).attr("value", market);

                $("#market_select").append(clone);

                db.market = $("#market_select").val();

                $("#market_label").text(db.market);
            });
        }
    },
    langDD: {
        load: function () {

            var db = kdown.db;

            $("#lang_select").html("");

            var option = $("<option value=''></option>");

            // make an entry for each language in the drop down. 
            $.each(db.langsJSON[db.market], function (lang_code, lang_name) {
                var clone = option.clone();
                $(clone).text(lang_name);
                $(clone).attr("value", lang_code);
                $("#lang_select").append(clone);
            });

            var allclone = option.clone();
            $(allclone).text("All");
            $(allclone).attr("value", "all");
            $("#lang_select").prepend(allclone);
        }
    },
    search: {
        // this will get the GET parameter from the URL based on name
        _GET: function (name) {
            var result = decodeURI(
                (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [,
                    null
                ])[1]
            );

            //fixes all the + and makes them spaces
            return result.replace(/\+/g, " ");

        },
        //get variables from the URL using function directly above
        load: function () {
            var search_term = kdown.search._GET('search');
            if (search_term !== 'null') {
                $("#dl_search_box").val(unescape(search_term));
            } else {
                $("#dl_search_box").val("");
            }
        },
        bind: function () {
            $("#dl_search_box").keyup(function () {
                kdown.search.go();
            });

            $(".search_clear").click(function () {
                $("#dl_search_box").val("");
                kdown.search.go();
                $("#dl_search_box").focus();
            });

            $("#to_top").click(function () {
                $("html, body").animate({
                    scrollTop: 0
                }, "fast");
                return false;
            });
        },
        go: function () {
            klog("-----go-----");
            var searchtext = $("#dl_search_box").val();
            var json = kdown.db.filter(searchtext);
            klog(json);
            klog("----->table.load");
            kdown.table.load(json);
        }
    }
};


kdown.db.load();
