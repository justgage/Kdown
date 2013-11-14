<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<link rel="stylesheet" href="https://na.kyani.net/include/css/cool_blue.2.css" type="text/css" media="screen" />
<link rel="stylesheet" href="https://na.kyani.net/include/css/backoffice.css" type="text/css" media="screen" />
<link rel="stylesheet" href="dl.css" type="text/css" media="screen" />
</head>
<body>
<center><img alt="header image" src="files/header.png" /></center>
<div class="center">
    <!-- <a name="top"></a> -->
    <!-- for the link to go back to the top -->

    <div id="lang_names" style="display:none;">
    </div>

    <div id="vertical_nav">
            <ul id="copy-cat" style="display:none;">
                <li id="cat_(CAT)" data-cat="(CAT)" class="cat_link" ><a href="(HREF)">(TITLE)</a></li>
            </ul>
        <ul>
            <li id="" class="" style=""><a href="#search">Search</a></li>
        </ul>
    </div>
    <div id="main_content">
        <div id="dl_search">
            <form action="search.html" method="get" accept-charset="utf-8">

                <!-- <a href="search.html">Search</a> -->
                <div class="search_round">
                    <input type="text" name="dl_search" id="dl_search_box" value="" />
                    <!-- Translate the "SEARCH" below -->
                    <input id="search_go" type="submit" value="SEARCH" />
                </div>
            </form>
        </div>
        <div id="dl_wrapper">
            <h1>Downloads</h1>

            <div id="dl_controls">

                <span>Market</span>
                <select name="market" id="market_select"> </select>

                <span>Translations</span>
                <select name="market" id="lang_select"> </select>

            </div>

            <div id="ajax_error" style="display:none;" >
                Sorry there was an error loading the page! click a category to your left or refresh the page. 
<a href="#reload" id="reload_img"> <img src="files/reload.png" alt="Reload" /> </a>

            </div>
            <div id="dl_loading" style="display:none;" >
                <img alt="" src="files/AjaxLoader.gif" />
                <!-- this can contain text for clarity -->
            </div>
            <h3 style="display:none; text-align:center;" id="none_found">Sorry, no files where found.</h3>
            <div id="dl_table_first" class="dl_table" >
                <table>
                    <thead>
                        <tr>
                            <th>Fav</th>
                            <th>File name</th>
                            <th>Languages</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <!-- this is a template for the table, it will be changed on execution -->
                    <tbody>
                    <tr style="display:none;" id="table_copy">
                        <td class="table_fav"><a href="(HEART_URL)"></a></td>
                        <td class="table_name"><a href="(FILE_LINK)">(NAME)</a></td>
                        <td class="table_lang">(LANG)</td>
                        <td class="table_dl_link"><a href="(DL_LINK)">Download</a></td>
                    </tr>
                    </tbody>
                </table>
                <h3><a id="to_top">Back to top</a></h3>
            </div>


        </div>
    </div>
    <br style="clear:both;" />
</div>

<script type="text/javascript" charset="utf-8">
<?php 
    //combine all the js files;
   include 'files/jquery.min.js';
?>
</script>

<script src="bubpub/bubpub.js" type="text/javascript" charset="utf-8"> </script>
<script src="dream_kdown.js" type="text/javascript" charset="utf-8"> </script>
   

</body>
</html>
