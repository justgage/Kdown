<html>
<head>
<link rel="stylesheet" href="https://na.kyani.net/include/css/cool_blue.2.css" type="text/css" media="screen" />
<link rel="stylesheet" href="https://na.kyani.net/include/css/backoffice.css" type="text/css" media="screen" />
<style type="text/css" media="all">
#dl_search {
    float:right;
}

#dl_table table td {
    border-bottom:solid lightgrey 1px;
    padding:0 5px;
}

#dl_table table {
    width:600px;
    border:solid lightgrey 1px;
}
</style>
</head>
<body>
<div class="center">
    <div id="vertical_nav">
        <ul>
            <li class="current_page_item"><a href="#">Category</a></li>
            <li><a href="#">Category</a></li>
        </ul>
    </div>
    <div id="main_content">
        <div id="dl_search">
            <span>Search all files</span>
            <input type="text" name="dl_search" id="dl_search_box" value="" />
            <input type="button" value="Go" />
        </div>
        <div id="dl_table">
            <h2>Downloads</h2>

            <span>Market</span>
            <select name="market" id="dl_market">
                <option value="USA / CANNADA">USA / CANADA</option>
            </select>

            <span>Translations</span>
            <select name="market" id="dl_market">
                <option value="en">English</option>
                <option value="es">Spanish</option>
            </select>

            <table>
                <tr>
                    <th>star</th>
                    <th>File name</th>
                    <th>Language</th>
                    <th>Download</th>
                </tr>
                <tr>
                    <td>*star*</td>
                    <td>This is an item</td>
                    <td>English</td>
                    <td><a href="#">Download</a></td>
                </tr>
                <tr>
                    <td>*star*</td>
                    <td>This is an item</td>
                    <td>English</td>
                    <td><a href="#">Download</a></td>
                </tr>
                <tr>
                    <td>*star*</td>
                    <td>This is an item</td>
                    <td>English</td>
                    <td><a href="#">Download</a></td>
                </tr>
            </table>
        </div>
    </div>
</div>
</div>
<script type="text/javascript" src="jquery.min.js" ></script>
<script type="text/javascript" src="dl_ui.js" ></script>
</body>
</html>
