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
    padding:2px 5px;
}


.table_star, .table_lang, .table_dl_link {
    text-align:center;
}

#dl_table table {
    width:690px;
    /* border:solid lightgrey 1px; */
    border-collapse:collapse;
    margin-bottom:1em;
}

#dl_table th {
    background-color:#E0E0E0;

height:35px;
}

#dl_wrapper {
    font-size:14px;
}

#dl_controls {
    padding:20px;
    font-size:1.5em;
}

#dl_controls span {
    margin-left:20px;
}

.table_row_even {
    background:#F5F5F5;
}

</style>
</head>
<body>
<div class="center">
<a name="top"></a> <!-- for the link to go back to the top -->
    <div id="vertical_nav">
        <ul>
            <li><a href="#">Category</a></li>
        </ul>
    </div>
    <div id="main_content">
        <div style="display:none;" id="dl_ui_translate">
            <p translate="Downloads Page">Download Page</p>
            <p translate="Market">Market</p>
            <p translate="Categorys">Categorys</p>
            <p translate="Translations">Translations</p>
            <p translate="Search">Search</p>
            <p translate="no files found">Sorry no files found!</p>
            <p translate="Loading">Loading</p>
            <p translate="loading error">Sorry there was an error loading the list</p>
        </div>
        <div id="dl_search">
            <span>Search</span>
            <input type="text" name="dl_search" id="dl_search_box" value="" />
            <input type="button" value="Go" />
        </div>
        <div id="dl_wrapper">
            <h1>Downloads</h1>

            <div id="dl_controls">

                <span>Market</span>
                <select name="market" id="market_select">
                    <option value="USA / CANADA">USA / CANADA</option>
                    <option value="Europe">Europe</option>
                </select>

                <span>Translations</span>
                <select name="market" id="lang_select">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                </select>

            </div>
            <div id="dl_table">
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
</div>
<script type="text/javascript" src="files/jquery.min.js" ></script>
<script type="text/javascript" src="downloads.js" ></script>
</body>
</html>
