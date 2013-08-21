<?php 

$response = array();

if( isset($_POST['market']) ) 
{
    $json = file_get_contents("info.json");
    $markets = json_decode($json, true);

    if ( isset( $markets[ $_POST['market'] ] ) ) {

        $categorys = array("categorys" => $markets[$_POST['market']]);

        $response = array_merge(array("error" => false) , $categorys );
    }
    else {
        $response = array("error" => true);
    }
} 
else { // if the data was sent wrong
    $response = array("error" => true);
}


echo json_encode($response);

?>
