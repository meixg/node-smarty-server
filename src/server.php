<?php

//显示除去 E_NOTICE 之外的所有错误信息

require_once(__DIR__.'/init_php.php');

$root = __DIR__ . "/..";
$request = $_SERVER['REQUEST_URI'];

$templatePath = $argv[1];
$pluginPaths = $argv[2];
$mockDataStr = $argv[3];
if (isset($pluginPaths)) {
    $pluginPaths = json_decode($pluginPaths);
}

if (empty($templatePath)) {
    return false;
}

$smarty = init_smarty($mockDataStr, $pluginPaths);

echo $smarty->fetch($templatePath);
