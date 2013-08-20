<?php


function dl_list_display($json)
{

    $info = json_decode($json, true);

    if ($info == null) {
        echo "JSON is invalid";
    } else {

        //display the main list of files

        echo '<ul id="downloads-list">';

        $i = 0;  //used to index the categorys

        foreach ($info as $cat => $list) {

            $i++;
            echo "<li class='category'><a href='#i'>$cat <span class='num-results'></span> </a>";

            echo "<ul class='cat-list'>";

            foreach ($list as $item) {
                dl_item($item);
            }
            echo "<li class='none-found'>None Fould</li>";
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
                <input type="button" name="lang-button" class="lang-button"  value="translate" />
                <p class="file-info">pdf</p>
                <br style="clear:both;" />
                <ul class="lang-list">
                    <?php 
                        foreach ( $item['languages'] as $name => $url ) {
                            
                           echo "<li><a href='$url'>$name</a></li>";
                        }
                    ?>
                    <br style="clear:both;" />
                </ul>
            </li>
<?php

}

