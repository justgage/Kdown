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
        lang: "all", // language we are searching for

        //  this will load the whole file list into db.marketsJSON
        load: function () {
            "use strict";
            $.post("api.php", {
                "search": ""
            }, function (json) {
                //TODO: make it so this is included in the table?
                klog(json);
                var cat_list = json.list["cat-list"];
                delete json.list["cat-list"];

                var temp = json.list;

                var list = {};

                var lang_list = {};

                // crawl the json the take out categories and make them
                // a item of file. 
                $.each(temp, function (market_name, inside) {
                    list[market_name] = [];

                    //this will add the objects together containing language names. 
                    $.extend(lang_list, inside.langs);

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


                kdown.db.marketsJSON = list;
                kdown.db.langsJSON = lang_list;

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
        html_row : "<tr class='table_row (ROW_CLASS)'>" + $(".table_copy").html() + "</tr>",
        load: function (json) {
            "use strict";
            if (typeof json === "undefined") {
                json = kdown.db.marketsJSON;
            }

            $("#dl_loading").show();

            var db = kdown.db;
            var langDD = kdown.langDD;
            var table_yours = $("#dl_table_first table");
            var table_other = $("#dl_table_second table");
            var html_tbody_yours = "";
            var html_tbody_other = "";
            var html_row = kdown.table.html_row;
            var row = "";
            var list = [];


            time.start("file_list");
            $.each(json, function (market, files) {
                $.each(files, function (i, file) {
                    list = [];
                    row = html_row;

                    

                    if (db.lang === "all") {
                        klog("All IS selected");
                        $("#lang_label").hide();
                        $.each( file.langs, function (locale, info) {
                            if ( typeof langDD.lang_list[locale] === "undefined" ) {
                                langDD.lang_list[locale] = 1;
                            }
                            else {
                                langDD.lang_list[locale] += 1 ;
                            }
                            list.push(locale);
                        });
                    } else {
                        $("#lang_label").show();
                        $("#lang_label_name").html(db.langsJSON[db.lang]);

                        klog("All is not selected");
                        if (typeof file.langs[db.lang] === "undefined") {
                            klog("file doesn't have lang");
                            return true; // same as a continue statement
                        } else {
                            klog("This has the language!");
                            klog(file.langs);
                            klog(db.lang);
                            $.each( file.langs, function (locale, info) {
                                if ( typeof langDD.lang_list[locale] === "undefined" ) {
                                    langDD.lang_list[locale] = 1;
                                }
                                else {
                                    langDD.lang_list[locale] += 1 ;
                                }
                                list.push(locale);
                            });
                        }
                    }
                    
                    time.start("highlight");
                    //highlight the table
                    if ( (i % 2) === 0) {
                        row = row.replace("(ROW_CLASS)", "");
                    } else {
                        row = row.replace("(ROW_CLASS)", "table_row_odd");
                    }
                    time.stop("highlight");

                    row = row.replace("(NAME)", file.filename);
                    row = row.replace("(FILE_LINK)", "single.php?id=" + encodeURIComponent(file.id));
                    row = row.replace("(LANG)", list.join(", "));
                    row = row.replace("(MARKET)", market);
                    row = row.replace("(DL_LINK)", file.href);

                    //if market equal to the selected one in the drop down. 
                    if (market === db.market) {
                        html_tbody_yours += row;
                    } else {
                        html_tbody_other += row;
                    }
                });
            });
            time.stop("file_list");

            time.start("first_populate");
            table_yours.find("tbody").html(html_tbody_yours);
            time.stop("first_populate");

            time.start("2nd_populate");
            table_other.find("tbody").html(html_tbody_other);
            time.stop("2nd_populate");

            $("#dl_loading").hide();
        }
    },
    marketDD: {
        // this will populate the market drop down

        sel : $("#market_select"),
        label : $("#market_label"),
        load: function () {
            var db = kdown.db;
            var market_sel = kdown.marketDD.sel;
            var market_label = kdown.marketDD.label;
            var option = $("<option value=''></option>");

            $.each(db.marketsJSON, function (market, inside) {

                var clone = option.clone();

                $(clone).text(market);
                $(clone).attr("value", market);

                market_sel.append(clone);

            });
            db.market = market_sel.val();

            market_label.text(market_sel.val());
        }
    },
    langDD: {
        sel: $("#lang_select"),
        lang_list : {},
        load: function () {
 
            var db = kdown.db;
 
            $("#lang_select").html("");
 
             var option = $("<option value=''></option>");
 
            // make an entry for each language in the drop down. 
             $.each(db.langsJSON, function (lang_code, lang_name) {
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
                //helps it not hang (as much) in IE. 
                window.setTimeout(function () {kdown.search.go(); }, 100);
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
            var searchtext = $("#dl_search_box").val();
            var json = kdown.db.filter(searchtext);
            kdown.table.load(json);
        }
    }
};

$(kdown.marketDD.sel).change(function () {
    kdown.db.market = $(this).val();
    kdown.marketDD.label.text($(this).val());
    kdown.table.load();
});

$(kdown.langDD.sel).change(function () {
    kdown.db.lang = $(this).val();
    //kdown.marketDD.label.text($(this).val());
    kdown.table.load();
});

kdown.db.load();
