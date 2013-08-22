<?php 

$response = array();

if( isset($_POST['market']) ) 
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



    } else {// a list in a market categorised in categories

        if ( isset( $markets[ $_POST['market'] ] ) ) {

            $categories = array("categories" => $markets[$_POST['market']]);

            $response = array_merge(array("error" => false) , $categories );
        }
        else {
            $response = array("error" => true);
        }
    }
} 
else { // if the data was sent wrong
    $response = array("error" => true);
}


echo json_encode($response);

?>
