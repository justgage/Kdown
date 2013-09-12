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
            }, "json" );
        },
    },
    search : {

    },
    marketDD : {

    },
    table : {
        load : function () {
            "use strict";

        }
    }
};


kdown.db.load();


