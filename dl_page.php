<?php
    include 'dl_functions.php';
    $json = file_get_contents("info.json");
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US">
<head>
<title>Gage's Kyäni > Downloads</title>

<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />

<link rel="stylesheet" href="https://na.kyani.net/include/css/cool_blue.2.css" type="text/css" media="screen" />
<link rel="stylesheet" href="https://na.kyani.net/include/css/backoffice.css" type="text/css" media="screen" />
<link rel="stylesheet" href="dl_style.css" type="text/css" media="screen" />

</head>
<body class="ext-gecko ext-gecko3 ext-mac">
<div id="content_wrap" class="gradient">


<div id="dl_ui_translate">
    <p translate="Downloads Page">Downlodo¨</p>
    <p translate="Market">Marketos</p>
    <p translate="Categorys">Categoros</p>
    <p translate="clear">clearo</p>
    <p translate="hide / show all">hideo / showo all</p>
    <p translate="Translations">Translationoes˚</p>
    <p translate="Quick Find">Quicko Findo</p>
    <p translate="no files found">Sorryo no Findo</p>
    <p translate="Loading">Loading-o</p>
    <p translate="loading error">Sorry there was a error, please refresh the page.</p>
</div>


    <div class="center">
        <div id="vertical_nav">
            <ul><li class="current_page_item"><a href="#" title="Applications">Downloads Page</a></li>
            </ul>
        </div>

        <div id="main_content">
            <h1 dl_ui="downloads_page"><span id="t_downloads">Downloads page</span></h1>

            <h2><span id="t_market">Market</span> <?php market_dropdown($json); ?></h2>

            <h3><span id="t_cat">Categorys</span></h3>
            <div id="dl-filter">
                <p>
                <span id="t_quick_find">Quick Find</span> <input type="text" name="search" id="file-search" value="" />
                <a href="#"  class="clear-button" ><span id="t_clear">clear</span></a>
                <a href="#"  id="hide-all-button" ><span id="t_show_all">hide/show all</span></a>
                </p>
            </div>
            <ul id="downloads-list"> </ul>
            <div class="dl-footer"> </div>
        </div>
    </div>
    <script type="text/javascript" src="jquery.min.js" ></script>
    <script type="text/javascript" charset="utf-8">
<?php include 'dl_ui.js' ?>
    </script>
</div>
</body>
</html>
