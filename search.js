/**
 * This is my fancy filtering script for the downloads page 
 * written in javascript using JQUERY
 *
 * -Gage Peterson justgage@gmail.com
 */
$(function() {
        var searchtext = "";
        var numFound = 0;
        $("#file-search").focus();

        //set total number of documents 
        function allDocsCount() {
            $(".category").each(function() {
                numFound = $(this).find(".download-item").length;
                $(this).find(".num-results").html( "(" + numFound + ")");

            });
        }

        allDocsCount();

        //Show the translations when you click the button
        $(".lang-button").click(function(){
            $(this).parent().children(".lang-list").slideToggle();
            });

        //clear the search and put cursor in the box
        $("#clear-button").click(function(){
            $("#file-search").val('');
            $("#file-search").focus();
            allDocsCount();
            $(".download-item").show();
            $(".none-found").hide();
        });

        //this will toggle the category when clicked
        $(".category a").click(function(){
                $(this).parent().children(".cat-list").slideToggle();
            });



        //this will get the input's value
        $("#file-search").keyup(function() {

            var numFound = 0;

            // get users search term
            searchtext = $(this).val().toUpperCase();


            if (searchtext.length > 0) {
                $(".download-item").hide();


                $(".category").each(function() {
                    numFound = 0;
                    $(this).find(".download-item").each(function() {
                        // this will get an uppercase string to search in.
                        var haystack = $(this).find("a").text().toUpperCase();

                        var isFound = haystack.indexOf(searchtext);

                        if (isFound !== -1) {
                            numFound++;
                            $(this).show();
                        }

                    });

                    $(this).find(".num-results").html( "(" + numFound + ")");

                    if (numFound === 0) {
                        $(this).find(".none-found").show();
                    } else {
                        $(this).find(".none-found").hide();
                    }
                });


            }
            else
            {
                allDocsCount();
                $(".download-item").show();
                $(".none-found").hide();
            
            }

            });

});
