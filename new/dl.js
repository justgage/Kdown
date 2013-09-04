$(function () {

    /***
     * download ui object
     *
     *
     * paramiters:
     *
     * (market_id, "dl_api.php) 
     *
     *  market_id
     *      This is the id of the market dropdown
     *      eg: "#market_dropdown
     *
     *  api_url
     *      this is the url that we download the information from
     */




    dl_ui = (function() {
        var info = {};

        /***
         * rebind after reload
         */
        info.bind = function() {

        }

        $("#market-select").change(function () {
            var market = $(this).val();

            //dl_ui.ajax_load(market);

            $.post();

        });


        return info;
    
    })();

});
