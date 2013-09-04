 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US">
<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Ky&auml;ni : [*menutitle*]</title>
<link rel="stylesheet" href="/include/css/ext/css/ext-all.css" type="text/css"/>
<link rel="stylesheet" href="/include/css/[*main_css*]" type="text/css" media="screen" />
<link rel="stylesheet" href="/include/css/backoffice.css" type="text/css" media="screen" />
<script type="text/javascript" src="/include/js/ext/ext.base.js"></script>
<script type="text/javascript" src="/include/js/ext/ext.all.js"></script>
<script type="text/javascript" src="/include/js/ext/ext.ux.grid.js"></script>
<!--[if IE 7]><link href="/include/css/ie7.css" rel="stylesheet" type="text/css" /><![endif]-->
<!--[if IE 8]><link href="/include/css/ie8.css" rel="stylesheet" type="text/css" /><![endif]-->
<!--[if IE 6]><script type="text/javascript" src="/include/js/warning.js"></script><![endif]-->
<script type="text/javascript" src="/include/js/[*compiled_js*]"></script>
[*analytics*]
</head>
<body>
[!GetResources?
  &sets=`get.announce|[*announcement*], get.footer|[*footer*]`
!]
<div id="header">
   <span class="horz_lang">[*rep_name*] ([*rep_number*])</span>
</div>
<div id="header_b">
  <div class="center relative">

    <div id="nav_main">
      [!Wayfinder? &startId=`[*nav_root*]` &hereClass=`current_page_item` &outerClass=`sf-menu` &level=`2`!]
    </div>
    <span class="language">
      [+get.announce+]
    </span>
    <div class="buy_now">
        [*rep_rank*][*buy_now*]
    </div>
    <!-- end nav_main -->
  </div>
  <!-- end center -->
</div>
<!-- end header -->
<div id="content_wrap" class="gradient">
    <div class="center">
        <div id="dl_ui_translate">
            <p translate="Downloads Page">Download Page</p>
            <p translate="Market">Market</p>
            <p translate="Categorys">Categorys</p>
            <p translate="clear">clear</p>
            <p translate="hide / show all">hide / show all</p>
            <p translate="Translations">Translations</p>
            <p translate="Search">Search</p>
            <p translate="no files found">Sorry no files found!</p>
            <p translate="Loading">Loading</p>
            <p translate="loading error">Sorry there was an error loading the list</p>
        </div>
        <div id="vertical_nav">
            [!Wayfiander? &startId=`[*sub_nav*]` &hereClass=`current_page_item` &level=`2`!]
        </div>
       <div id="main_content">
            [*content*]
       </div>
    </div>
</div>
[+get.footer+]
[!FreedomKeepAlive!]
</body>
</html>
