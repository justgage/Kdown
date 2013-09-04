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

$response = array();

// this will grab the whole market. 
if( isset($_POST['market'])== true ||  isset($_POST['category']) == false ) 
{
    $json = file_get_contents("info.json");
    $markets = json_decode($json, true);

    // this will return a flat list of the files 
    if ($_POST['market'] == 'all-list') {

        $list = array();
        foreach ($markets as $market => $cat) {
            foreach ($cat['files'] as $file) {
                $list[] = $file;
            }
        }

        $response = array_merge(array("error" => false, $list));

    } 
    else 
    {// a list in a market categorised in categories

        if ( isset( $markets[ $_POST['market'] ] ) ) 
        {

            $categories = array("cats" => $markets[$_POST['market']]);

            $response = array_merge(array("error" => false) , $categories );
        }
        else { $response = array("error" => true); }
    }
} //this will grab one category.
elseif( isset($_POST['market']) == true ||  isset($_POST['category']) == true ) 
{
    $json = file_get_contents("info.json");
    $markets = json_decode($json, true);

    $list = array( "cat" => $markets[ $_POST['category'] ] );

    $response = array_merge(array("error" => false, $list));

}
else { $response = array("error" => true); /* if the data was sent wrong */ }


// respond to the request. 
echo json_encode($response);

?>
