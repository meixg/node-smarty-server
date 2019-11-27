# node-smarty-server

Render smarty template in local for quick development.

![Language](https://img.shields.io/badge/-TypeScript-blue.svg)
[![Build Status](https://travis-ci.com/meixg/node-smarty-server.svg?branch=master)](https://travis-ci.org/meixg/node-smarty-server)
[![npm package](https://img.shields.io/npm/v/smarty-server.svg)](https://www.npmjs.org/package/smarty-server)
[![npm downloads](http://img.shields.io/npm/dm/smarty-server.svg)](https://www.npmjs.org/package/smarty-server)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/meixg/node-smarty-server)

## install

```sh
npm i [-g] smarty-server
```

## usage

1. config file

    make a config file like this:

    ```javascript
    const fs = require('fs');
    const path = require('path');

    module.exports = {
        routes: {
            '/': {
                templatePath: '/path/to/index.tpl'
            },
            '/page': {
                templatePath: '/path/to/another/page.tpl'
            }
        },

        // smarty will find template based on this path
        templateRootPath: path.resolve(__dirname, '../output/template'),

        // will start a static file server on this path
        staticRootPath: path.resolve(__dirname, '../output'),

        smartyConfig: {
            delimiters: {
                left: '{%',
                right: '%}'
            }
        },

        // will load smarty plugins in these paths, can be a string or string[]
        pluginPaths: path.resolve(__dirname, '../tool/plugins'),

        // will use this function's return as data to render template
        mockData(url) {
            return fs.readFileSync(path.resolve(__dirname, './mock.json'), {encoding: 'utf8'});
        }
    };
    ```
2. run

    ```sh
    smarty-server start -c path/to/config.js 
    ```