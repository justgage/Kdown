/**
 * This is my fancy filtering script for the downloads page 
 * written in javascript using JQUERY
 *
 * -Gage Peterson justgage@gmail.com
 */
$(function() {
    var searchtext = "";
    var numFound = 0;
    //$("#file-search").focus();

    //set total number of documents 
    function allDocsCount() {
        $(".category").each(function() {
            numFound = $(this).find(".download-item").length;
            $(this).find(".num-results").html( "(" + numFound + ")");

        });
    }

    allDocsCount();

    $("#market-select").change(function()
        {
            var market = $(this).val()

            //empty the list of items
            $('#downloads-list').html("<li>Loading...</li>");


            console.log(market);

            $.ajax({
                url:"download-api.php",
                data: {
                    market:"Europe"
                },
                type:"POST",
                dataType:"json",
                success: function( json ) {
                    console.log(json);

                    reload_downloads_list( json );

                    console.log(json.categorys[0].name)
                },
                error: function( xhr, status ) {
                    console.log("ajax failed");
                },
                complete: function( xhr, status ) {
                    //console.log("ajax complete");
                }


            });
        });

    function reload_downloads_list( json ) {


        var html = "";

        //go through each category
        for (var i = 0, l = json.categorys.length; i < l; i ++) {
            var cat = json.categorys[i];
            console.log("CAT:  " + cat.name);

            // add a category
            html = html + '<li class="category"> <a href="#i">' + cat.name + '<span class="num-results">(...)</span> </a>'
                + '<ul class="cat-list"> ';

            // go through each file
            for (var j = 0, ll = cat.files.length; j < ll; j ++) {
                var file = cat.files[j];
                console.log("   FILE: " + file.filename);

                //add an menu item
                html = html + '<li class="download-item">'
                    + '<a target="_blank" href="files/">' + file.filename + '</a>'
                    + '<input type="button" name="lang-button" class="lang-button" value="translate">'
                    + '<p class="file-info">'+ file.filetype + '</p>'
                    + '<br style="clear:both;">'
                    + '<ul class="lang-list">';

                //end lang list
                html = html + '</ul></li>';
                    

            }

            //close category
            html = html + '</ul>';
        }

        $('#downloads-list').html(html);

        bindClick();
        allDocsCount();
        

    }


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
    function bindClick(){
        $( ".category" ).on("click", "a", function(){
            console.log("clicked on a category");
            $(this).parent().children(".cat-list").slideToggle();
        });
    }

    bindClick();


    //this will get the input's value
    $("#file-search").keyup(function() {

        $(".cat-list").show();

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
