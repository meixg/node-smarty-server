<?php
function init_smarty($mockDataStr = null, $pluginPaths = null, $delimiters = null) {
    $smarty = new Smarty;

    // $smarty->setTemplateDir(__DIR__ . '/../smarty/templates/');
    $smarty->setTemplateDir('/home/meixg/work/baidu/hpbfe/superlanding/output/template');
    $smarty->setCompileDir(__DIR__ . '/../smarty/templates_c/');
    $smarty->setConfigDir(__DIR__ . '/../smarty/configs/');
    $smarty->setCacheDir(__DIR__ . '/../smarty/cache/');

    // add plugins
    if (isset($pluginPaths)) {
        if (is_array($pluginPaths)) {
            foreach ($pluginPaths as $path) {
                $smarty->addPluginsDir($path);
            }
        }
        else {
            $smarty->addPluginsDir($pluginPaths);
        }

    }

    // if (isset($delimiters)) {
    //     $smarty->left_delimiter = $delimiters['left'];
    //     $smarty->right_delimiter = $delimiters['right'];
    // }
    // else {
        $smarty->left_delimiter = "{%"; //左定界符
        $smarty->right_delimiter = "%}"; //右定界符
    // }

    $smarty->caching = false;
    $smarty->debugging = true;

    // 初始化 mock 数据
    if (isset($mockDataStr)) {
        $mockData = json_decode($mockDataStr, true);
        foreach( $mockData as $key => $value) {
            $smarty->assign($key, $value);
        }
    }

    return $smarty;
}
