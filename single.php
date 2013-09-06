<?php 
$json = file_get_contents("files/info.json");
$markets = json_decode($json, true);
// this will return a flat list of the files 


$found = false;

foreach ($markets as $market => $inside) {
    if ($market != "cat-list" ) {
        foreach ($inside['cats'] as $cat) {
            foreach ($cat['files'] as $file) {
                if ($file["id"] == $_GET['id']) {
                    echo $file['filename'] . ":" . $file['id'];
                    $found = $file;
                }
            }
        }
    }
}







?>
<head>
<link rel="stylesheet" href="https://na.kyani.net/include/css/cool_blue.2.css" type="text/css" media="screen" />
<link rel="stylesheet" href="https://na.kyani.net/include/css/backoffice.css" type="text/css" media="screen" />
<link rel="stylesheet" href="dl.css" type="text/css" media="screen" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" >
</head>
<body>
<div class="center">
        <a name="top"></a> <!-- for the link to go back to the top -->
    <div id="lang_names" style="display:none;">
    </div>
    <div id="main_content">
        <h4>
            <a class="grey_callout" href="index.html">&larr; Back </a>
        </h4>
        <h1><?php echo $found['filename'] ?></h1>
        <table>
            <tbody>
                
            <tr>
                <td>Size</td>
                <td>2.63 MB</td>
            </tr>
            <tr>
                <td>Category</td>
                <td>Test</td>
            </tr>
            <tr>
                <td>Native</td>
                <td>English</td>
            </tr>
            <tr>
                <td>Version</td>
                <td>1.03</td>
            </tr>
            </tbody>
        </table>
        <br style="clear:both;"/>
        <br style="clear:both;"/>
        <button class="fancy light-blue medium submit-information" tabindex="12" id="ext-gen77">Download File</button>
        <hr>
        <h3>Other translations</h3>
        <table>
            <tbody>
                
            <tr>
                <td>English</td> <td>File_That_is_Diff.pdf</td>
            </tr>
            <tr>
                <td>Spanish</td> <td>Fileo_Thatoo_iso_Diffo.pdf</td>
            </tr>
            <tr>
                <td>Japanese (日本語)</td> <td>形容動詞あの山.pdf</td>
            </tr>
            </tbody>
        </table>

    </div>
</div>
<script type="text/javascript" src="files/jquery.min.js" ></script>
<script type="text/javascript" src="downloads.js" ></script>
</body>
</html>
