<?php 
    include 'dl-functions.php';
    $json = file_get_contents("info.json");
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US">
<head>
<title>Gage's Kyäni > Downloads</title>

<meta http-equiv="Content-type" content="text/html;charset=UTF-8" />


<link rel="stylesheet" href="download-page.css"  type="text/css" />

</head>
<body>
<div id="main_content">
<h1>Downloads page</h1>

<h3>Market <?php market_dropdown($json); ?></h3>

<h3>Categorys</h3>
<div> 
    <form action="#" method="get" accept-charset="utf-8">
        
        Filter <input type="text" name="search" id="file-search" value="" />
    <input type="submit" name="submit" id="submit-button" />
            <a href="#"  id="clear-button" >clear</a>
</form>
</div>
<?php dl_list_display($json); ?>


<script type="text/javascript" src="/jquery.min.js" ></script>

<noscript>
<style type="text/css" media="all">
.lang-list {
    display:block;
}
</style>
</noscript>

<script type="text/javascript" charset="utf-8">
<?php include 'search.js' ?>
</script>
</body>


</html>
