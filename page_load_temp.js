page_load: function(page) {
    /***
     * populate the table when there's files
     */
    function table_populate() {
        ajax_load_table(function () {
            if (worked === true) {
                view.table.populate();
                view.langs_DD.populate();
                view.market_DD.update();
                view.errors.clear();
            } else  {
                view.errors.table_ajax();
            }
        });
    };

    if (model.page_setup() === true) {

        switch (page) {
            case "cat":
                table_populate();
                break;
        }

    } else { // page needs to be loaded

        // load API data into the model
        Ajax_load_lists(function(worked) {
            if (worked === true) {
                view.market_DD.populate();
                view.pages.populate();
            } else {
                view.error.page_load();
            }
        });

    }
}

hash_load = function () {
    router.get_hash();
};
