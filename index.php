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
            <li id="(PAGE)_(CAT)" data-page="(PAGE)" data-cat="(CAT)" class="(PAGE)_link" ><a href="(HREF)">(TITLE)</a></li>
        </ul>
    </div>
    <div id="main_content">
        <div id="dl_search">
            <form id="dl_search_form" action="search.html" method="get" accept-charset="utf-8">

                <!-- <a href="search.html">Search</a> -->
                <div class="search_round">
                    <input type="text" placeholder="Search" name="dl_search" id="dl_search_box" value="" />
                    <!-- Translate the "SEARCH" below -->
                    <input id="search_go" type="submit" value="GO" />
                </div>
            </form>
        </div>
        <div id="dl_wrapper">
            <h1>Downloads</h1>

            <div id="dl_controls">
                <span>Market</span>
                <select name="market" id="market_select"> </select>

                <span>Languages</span>
                <select name="market" id="lang_select"> </select>
            </div>

            <div id="ajax_error" style="display:none;" >
                Sorry there was an error loading the page! 
                <a href="#reload" id="reload_img"> <img src="files/reload.png" alt="Reload" /> </a>
            </div>

            <div id="dl_loading" style="display:none;" >
                <img alt="" src="files/AjaxLoader.gif" />
                <!-- this can contain text for clarity -->
            </div>

            <div id="search_mess" style="display:none;">
                <h3>
                    Searching for 
                    "<span>...</span>" 
                        <a href="#">clear search</a> 
                </h3>
            </div>

            <div class="center_text" style="display:none;" id="none_found">
                <br /><br />
                <h3>
                    No files where found!
                </h3>
                <em>
                    Please try a different category, changing your options in the drop-downs, or doing a search above.
                </em>
                <br /><br />
            </div> 


            <div id="dl_table_all">
                <div id="dl_table_first" class="dl_table" >
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>File name</th>
                                <th>Languages</th>
                                <th>Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="display:none;" id="table_copy">
                                <td class="table_num">(NUM)</td>
                                <td class="table_name"><a href="#file_info">(NAME)</a></td>
                                <td class="table_lang">(LANG)</td>
                                <td class="table_dl_link"><a href="(DL_LINK)">Download</a></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="center_text" id="none_found_first" style="display:none;">
                    <br /><br />
                    <h3>
                        <em>
                            No files found in this search!
                        </em>
                    </h3>
                    <br />
                    <hr />
                </div> 


                <div id="other_options" class="center_text">
                    <h3>Didn't find it?</h3>
                    <p>Here's some more options...</p>

                    <p id="all_langs_link">
                        Change language to <a  href="#">ALL
                    </a> 
                </p>
                <p id="second_link">
                    <a href="#" id="second_link">
                        See <span>...</span> more results.
                    </a>
                </p>
                <hr />
            </div>
            <br />

            <div id="dl_table_second" class="dl_table" style="display:none;">
                <h3>Other Markets and Languages</h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>File name</th>
                            <th>Languages</th>
                            <th>Market</th>
                            <th>Download</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="display:none;" id="table_copy_second">
                            <td class="table_num">(NUM)</td>
                            <td class="table_name"><a href="(FILE_LINK)">(NAME)</a></td>
                            <td class="table_lang">(LANG)</td>
                            <td class="table_market">(MARKET)</td>
                            <td class="table_dl_link"><a href="(DL_LINK)">Download</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="center_text" style="display:none;" id="none_found_second">
                <br /><br />
                <h3>
                    <em>
                        No files found in this search!
                    </em>
                </h3>
                <br />
                <hr />
                <h3>
                    Sorry, no files where found in all other markets and languages
                </h3>
                <em>
                    Please try a different search.
                </em>
            </div> 

        </div>



        <h3 id="to_top">Back to top</h3>
    </div>
</div>
<br style="clear:both;" />
</div>
<div class="file_pane file_pane_hide">
    <h2>Becky_Bursell's_Kyani_Overview</h2>
    <h3>Description</h3>
    <p class="grey_callout">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
    <p>
        <button class="fancy light-blue medium submit-information" tabindex="12" id="ext-gen77">Download File</button>
    </p>
    <br />
    <hr />
    <h3>Other Translations</h3>
    <div class="grey_callout">
        <strong>USA / CANADA</strong>
        <ul>
            <li><a href="#">English</a></li>
            <li><a href="#">Japanese</a></li>
            <li><a href="#">Sweedish</a></li>
        </ul>
        <br />
        <strong>USA / CANADA</strong>
        <ul>
            <li><a href="#">English</a></li>
            <li><a href="#">Japanese</a></li>
            <li><a href="#">Sweedish</a></li>
        </ul>
        <strong>USA / CANADA</strong>
        <ul>
            <li><a href="#">English</a></li>
            <li><a href="#">Japanese</a></li>
            <li><a href="#">Sweedish</a></li>
        </ul>
        <strong>Japan</strong>
        <ul>
            <li><a href="#">Japanese</a></li>
        </ul>
    </div>
</div>

<script type="text/javascript" charset="utf-8">
    <?php 
    //combine all the js files;
    include 'files/jquery.min.js';
    include 'console_fix.js';
    ?>
</script>

<script src="bubpub/bubpub.js" type="text/javascript" charset="utf-8"> </script>
<script src="kdown.js" type="text/javascript" charset="utf-8"> </script>


</body>
</html>
