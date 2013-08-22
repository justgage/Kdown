<?php
    include 'dl-functions.php';
    $json = file_get_contents("info.json");
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US">
<head>
<title>Gage's Kyäni > Downloads</title>

<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />

<link rel="stylesheet" href="https://na.kyani.net/include/css/cool_blue.2.css" type="text/css" media="screen" />
<link rel="stylesheet" href="https://na.kyani.net/include/css/backoffice.css" type="text/css" media="screen" />
<link rel="stylesheet" href="new.css" type="text/css" media="screen" />



</head>
<body class="ext-gecko ext-gecko3 ext-mac">
<div id="content_wrap" class="gradient">
    <div class="center">
        <div id="vertical_nav">
            <ul><li class="current_page_item"><a href="#" title="Applications">Downloads Page</a></li>
            </ul>
        </div>

        <div id="main_content">
            <h1>Downloads page</h1>

            <h2>Market <?php market_dropdown($json); ?></h2>

            <h3>Categorys</h3>
            <div id="dl-filter">
                <p>
                Quick Find &#10093; <input type="text" name="search" id="file-search" value="" />
                <a href="#"  class="clear-button" >clear</a>
                <a href="#"  id="hide-all-button" >hide/show all</a>
                </p>
            </div>
            <ul id="downloads-list"> </ul>
            <div class="dl-footer"> </div>
        </div>
    </div>
    <script type="text/javascript" src="/jquery.min.js" ></script>
    <script type="text/javascript" charset="utf-8">
<?php include 'search.js' ?>
    </script>
</div>
</body>
</html>
