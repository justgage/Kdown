<?php 

/************************************************************
* My testing downloads page API
*
* DESCRIPTION:  
*       This will load the info from the file "info.json" to test 
*       out my download page ajax calls. 
*
* SENDS AND RETURNS: 
*       json (post)
*
* USE:
*       if "market" and "category" is set it will return one category's
*       file list
*
*       if "category" is not set it will return all categorys under
*       a market
*
*       if "market" is not set it will return an error
*
*       if market is set to "all-list" it will return a flat list of
*       all files in all markets (for search methods)
*
 ***********************************************************/

// NOTE: this is just to show what it would be like over a slower internet connection
sleep(0.5);

$work = rand(1, 4);

// randomly fails 1/4th of the time
if ($work < 3) {
    return array("error" => true, "mess" => "Random Fail, this is code in the api.php, for testing, remove if annoying");
}

$json = file_get_contents("files/info.json");
$markets = json_decode($json, true);

$response = array();

if ( isset($_POST['search']) )
{

    $response = array("error" => false, "mess" => "All files for search", "list" => $markets);
} 
elseif( isset($_POST['market']) == true && isset($_POST['cat']) == false ) 
{
    // this will return a flat list of the files 
    if ($_POST['market'] == 'all-list') {

        $market_list = array();

        foreach ($markets as $market => $inside) {
            if ($market != "cat-list" ) {
                $list = array();
                foreach ($inside['cats'] as $cat) {
                    foreach ($cat['files'] as $file) {
                        if (isset($_POST['search'])) {
                            $place = strpos(strtoupper($file["filename"]),strtoupper($_POST['search']));
                            if ($place !== false) {
                                $list[] = $file;
                            }
                        }
                        else
                        {
                            $list[] = $file;
                        }
                        
                    }
                }

                $market_list[$market] = $list;
            }
        }

        $response = array("error" => false, "mess" => "Returning flat list of files", "list" => $market_list);

    } 
    else 
    {// a list in a market categorised in categories

        if ( isset( $markets[ $_POST['market'] ] ) ) 
        {
            $categories = array("market" => $markets[$_POST['market']]);
            $response = array_merge(array("error" => false , "mess" => "Returning Market's categories"), $categories );
        }
        else { $response = array("error" => true); }
    }

} //this will grab one category.
elseif( isset($_POST['market']) == true && isset($_POST['cat']) == true ) 
{

    $found = false;
    $langs = $markets[$_POST['market']]['langs'];

    foreach ($markets[$_POST['market']]['cats'] as $cat) {
        if ($cat["name"] == $_POST['cat'])
        {
            $found = $cat["files"];
            break;
        }
    }

    if ($found != false)
    { $response = array( "error" => false, "mess" => "Returning single category of market " . $_POST['market'], "langs" => $langs, "cat" => $found); }
    else
    { $response = array("error" => true, "mess" => "The category was not found"); }

}
else // if no input return list of categorys and list of markets
{
    $list = array();
    $cats = $markets["cat-list"];
    foreach ($markets as $market => $in) {
        if ($market != "cat-list") {
            $list[] = $market;
        }
    }
    $response = array("error" => false, "mess" => "Returning list of markets and categorys", "markets" => $list, "cats" => $cats);
}


// respond to the request. 
echo json_encode($response);

?>
