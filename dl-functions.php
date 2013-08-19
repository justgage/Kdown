<?php


function dl_list_display($json)
{

    $info = json_decode($json, true);

    //display a category list
    echo '<h2>Categorys</h2>';
    echo '<ul>';

    $i = 0; //used to index the categorys

    foreach ($info as $cat => $list) {
        $i++;
        echo "<li><a href='#$i'>$cat</a></li>";
    }
    echo '</ul>';
   
    //display the main list of files

    echo '<ul id="downloads-list">';

    $i = 0;  //used to index the categorys

    foreach ($info as $cat => $list) {

        $i++;
        echo '<ul>';
        echo "<li class='category'><a name='$i'>$cat</a></li>";

        foreach ($list as $item) {
            dl_item($item);
        }

        echo '</ul>';
    }
    echo '<ul>';
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

