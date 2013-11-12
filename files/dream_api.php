<?php
$json = file_get_contents("flat_files.json");
$markets = json_decode($json, true);
echo json_encode($markets);
