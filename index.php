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
            "filename":"New Enrollment Form",
            "href":"files/",
            "languages":{ "Dansk":"#", "Deutsch":"#", "Eesti":"#", "English":"#", "Hrvatski":"#", "Magyar":"#", "Norsk":"#", "Polski":"#", "Pусский":"#", "Română":"#", "Slovenský":"#", "Slovensko":"#", "Srpski":"#", "Suomi":"#", "Svenska":"#", "Türkçe":"#", "Українська":"#" }
            
        }, 
        {
            "filename":"Order Form",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Change of Genealogy Request Form",
            "href":"files/",
            "languages":{ "Dansk":"#", "Deutsch":"#", "Eesti":"#", "English":"#", "Hrvatski":"#", "Magyar":"#", "Norsk":"#", "Polski":"#", "Pусский":"#", "Română":"#", "Slovenský":"#", "Slovensko":"#", "Srpski":"#", "Suomi":"#", "Svenska":"#", "Türkçe":"#", "Українська":"#" }
        }, 
        {
            "filename":"Direct Deposit Form",
            "href":"files/",
            "languages":{ "english":"#"}
        }, 
        {
            "filename":"Product Exchange or Replenishment Form",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Return Product Form",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Personal Information Update",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Credit Card Payment Details and Authorization",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Distributor Cancellation",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Kyäni Policies and Procedures",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Kyäni Policies and Procedures",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"Paygate Minimum Calculator",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        }, 
        {
            "filename":"This is a file.pdf",
            "href":"files/",
            "languages":{ "english":"#", "spanish":"#" }
        },
        {
            "filename":"New Enrollment Form",
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

        //this will toggle the category when clicked
        $(".category a").click(function(){
                console.log('click');
                $(this).parent().children(".cat-list").slideToggle();
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


                $(".category").each(function() {
                    numFound = 0;
                    console.log(numFound);
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
                $(this).find(".num-results").html("");
                $(".download-item").show();
                $(".none-found").hide();
            
            }

            });

});
</script>
</body>


</html>
