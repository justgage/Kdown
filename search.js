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

            }, "json" );

        },
    },
    search : {

    },
    marketDD : {
        // this will populate the market drop down
        load : function () {
            var app = kdown.db;
            var option = $("<option value=''></option>");

            for (var market in app.list) {

                var clone = option.clone();

                $(clone).text( market );
                $(clone).attr("value", market );

                $("#market_select").append(clone);

                app.market = $("#market_select").val();
            }
        }
    },
    langDD : {
        load : function () {

            var app = kdown.db;

            $("#lang_select").html("");

            var option = $("<option value=''></option>");

            for ( var code in app.list[app.market].langs ) {

                var clone = option.clone();
                $(clone).text( app.list[app.market].langs[code] );
                $(clone).attr("value", code );
                $("#lang_select").append(clone);

            }

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
            var row = $("#table_copy").clone();

            $(row).removeAttr('id');
            $(row).attr('class', 'table_row' );
            $(row).show();

            // go through each category
            for (i = 0, l = db[app.market].cats.length; i < l; i ++) {

                var cat = db[app.market].cats[i];
                // each file
                for (var j = 0, ll = cat.files.length; j < ll; j ++) {
                    var file = cat.files[j];

                    var newRow = row.clone();
                    $("#dl_table_first table").append(newRow);

                    //Put the files information into the new row in the table
                    $(newRow).find(".table_star").text( "*" );
                    $(newRow).find(".table_name a").text( file.filename ).attr("href",
                           "single.php?id=" + encodeURIComponent( file.id ));
                    $(newRow).find(".table_lang").text(file.native_lang);
                    $(newRow).find(".table_dl_link a").attr("href", file.href);

                }
            }

        }
    }
};


kdown.db.load();


