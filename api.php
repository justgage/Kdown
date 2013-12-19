<?php

$respond = array();

$market_lang = json_decode(file_get_contents("new_files.json"), true);

//sleep(1);

if ($market_lang === null) { // invalid json
    $respond = array(
        "error" => true,
        "mess" => "invalid JSON",
    );

} else {


    if ( isset($_POST["market"]) && $_POST["lang"] ) {

        if (isset($_POST["file_id"])) {
            // code...
        } else {

            // make sure it exists in the JSON
            if (isset($market_lang[ $_POST["market"] ][ $_POST["lang"] ])) {


                $respond['market'] = $_POST["market"];
                $respond['lang'] = $_POST["lang"];
                $respond['error'] = false;
                $respond['mess'] = "returning list of categorys in " . $_POST["market"] . " " . $_POST["lang"];

                $respond['cats'] = $market_lang[ $_POST["market"] ][ $_POST["lang"] ];

            } else { // invalid market / lang
            $respond = array(
                "error" => true,
                "mess" => "invalid market OR lang sent!",
                "market" => $_POST["market"],
                "lang" => $_POST["lang"],
                "makret_lang" => $market_lang
            );
        }

    }
    } else { // market OR lang not set
    $respond = array(
        "error" => true,
        "mess" => "no market OR lang sent!"
    );
}

}

echo json_encode($respond);
