<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US">
<head>
<title>This is a jquery downloads page</title>

<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />
 

<link rel="stylesheet" href="download-page.css"  type="text/css" />

</head>
<body>
    <div id="main_content">
        <h1>Downloads page</h1>
        <div> Search <input type="text" name="search" id="file-search" value="" /> </div>
<?php

include 'dl-functions.php';

$json = '{ 
    "Applications & Forms":[
        {
            "filename":"Customer Application.pdf",
            "href":"files/",
            "languages":{ "english":"files/Customer_USA.pdf", "spanish":"r" }
        }, 

        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        } 
    ],

    "Business Library":[
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        } 
    ] 
}';


dl_list_display($json);
?>
    

<script type="text/javascript" src="/jquery.min.js" ></script>

<noscript>
<style type="text/css" media="all">
.lang-list {
    display:block;
}
</style>
</noscript>

<script type="text/javascript" charset="utf-8">
$(function() {

        //Show the translations when you click the button
        $(".lang-button").click(function(){
            $(this).parent().children(".lang-list").slideToggle();
            });

        var searchtext = "";

        $("#file-search").focus();

        //this will get the input's value
        $("#file-search").keyup(function() {

            var numFound = 0;

            // get users search term
            searchtext = $(this).val().toUpperCase();

            if (searchtext.length > 0) {
                $(".download-item").hide();


                $(".download-item").each(function() {


                    // this will get an uppercase string to search in.
                    var haystack = $(this).find("a").text().toUpperCase();

                    var isFound = haystack.indexOf(searchtext);

                    if (isFound > -1) {
                        numFound++;
                        $(this).show();
                    }

                });


            }
            else
            {
                $(".download-item").show();
            
            }

            });

});
</script>
</body>


</html>
