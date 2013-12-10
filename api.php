<?php
sleep(1);
$json = file_get_contents("files/flat_files.json");
$markets = json_decode($json, true);
echo json_encode($markets);
