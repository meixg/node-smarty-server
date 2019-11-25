import url from 'url';
import express from 'express';
import path from 'path';
import * as php from './php-cgi';
import open from 'opn';
import chalk from 'chalk';
import fs from 'fs';



const writer = {
    error: chalk.bold.red
};
const port = process.env.PORT || 8080;
export function start(config: config) {
    let app = express();

    if (!config.routes) {
        console.log(writer.error('config.routes not found!'));
        return;
    }

    const pages = config.routes;

    // 将配置的路由转到 php 处理
    app.use((routes =>

        php.cgi({
            match: ({pathname}) => {
                for (let pattern of Object.keys(routes)) {
                    if (pattern === pathname) {
                        return routes[pattern];
                    }
                };
                return undefined;
            },
            serverFile: path.join(__dirname, './server.php'),
            templateRootPath: config.templateRootPath,
            pluginPaths: config.pluginPaths,
            mockData: config.mockData
        })

    )(pages));

    app.use('/startPage', async (req, res, next) => {
        let urlObj = url.parse(req.url);

        if (urlObj.pathname !== '/') {
            next();
            return;
        }

        res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Document</title>
            </head>
            <body style="margin: 0; line-height: 2">
                <ul style="padding-right: 20px; width: 100vw; box-sizing: border-box; word-wrap: break-word;">
                    ${Object.keys(pages).map(routePath => {
                        const item = pages[routePath];
                        return `<li><a href="${routePath}">${item.templatePath}</a><br>`;
                    }
                    ).join('\n')}
                </ul>
            </body>
            </html>
        `);

        next();
    });


    // static server
    app.use(express.static(config.staticRootPath));

    app.listen(port, () => {
        const url = `http://${getIP()}:${port}/startPage`;
        console.log(`server up: ${url}`);
        // open(url);
    });
}

function getIP() {
    const interfaces = require('os').networkInterfaces();
    const defaultAddress = '127.0.0.1';
    let ip = defaultAddress;

    /* eslint-disable no-loop-func */
    Object.keys(interfaces).forEach(dev => {
        if (interfaces[dev]) {
            interfaces[dev].forEach(details => {
                    if (ip === defaultAddress && details.family === 'IPv4') {
                        ip = details.address;
                    }
                }
            );
        }
    });
    return ip;
}

interface config {
    routes: {
        [routePath: string]: {
            templatePath: string;
        };
    };
    templateRootPath?: string;
    staticRootPath: string;
    smartyConfig?: {
        delimiters?: {
            left: string;
            right: string;
        }
    };
    pluginPaths?: string | string[];
    mockData?: {[key: string]: any};
}
