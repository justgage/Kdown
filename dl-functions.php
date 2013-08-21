<?php



function market_dropdown($json) {
    $markets = json_decode($json, true);

    //TODO make this select the local market
    echo "<select name='market' option='USA / CANADA' id='market-select'>";
        
    foreach ($markets as $market => $inside) {
        $url=urlencode($market);
        echo "<option value='$market'><a href='index.php?market=$url'>$market</a></option>";
    }

    echo "</select>";
}

function dl_list_display($json)
{

    $markets = json_decode($json, true);

    if ($markets == null) {
        echo "JSON is invalid";
    } else {

        $info;

        if (isset($_GET['market']) &&  isset($markets[$_GET['market']])) {
            $info = $markets[$_GET['market']];

        }
        else {
            $info = $markets['USA / CANADA'];
        }

        //display the main list of files

        echo '<ul id="downloads-list">';

        $i = 0;  //used to index the categorys

        foreach ( $info as $cat ) {

            $i++;
            echo "<li class='category'><a href='#i'>{$cat['name']} <span class='num-results'>(...)</span> </a>";

            echo "<ul class='cat-list'>";

            foreach ($cat['files'] as $item) {
                dl_item($item);
            }
            echo "<li class='none-found'> No Search Results <a href='#'  class='clear-button' >clear</a> </li>";
            echo "</ul>
                </li>";

        }
        echo '</ul>';
    }
}

function dl_item($item) {
?>
            <li class="download-item">
                <a target="_blank" href="<?=$item['href']?>"><?=$item['filename']?></a>
                <p class="lang-button">Translations</p>
                <p class="file-info"><?=$item['filetype']?></p>
                <br style="clear:both;" />
                <ul class="lang-list">
                    <?php 
                        foreach ( $item['languages'] as $lang  ) {
                            
                           echo "<li><a href='{$lang['url']}'>{$lang['name']}</a></li>";

                        }
                    ?>
                    <br style="clear:both;" />
                </ul>
            </li>
<?php

}

