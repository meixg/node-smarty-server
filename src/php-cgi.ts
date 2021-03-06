/**
 * @file run php script through php-cgi
 */

import URL from 'url';
import child from 'child_process';
import path from 'path';
import fs from 'fs';
import {RequestHandler, Request, Response} from 'express';

function defaultMatch(url: {pathname: string}) {
    if (/\.php($|\?)/.test(url.pathname)) {
        return {
            templatePath: url.pathname 
        };
    }
    return undefined;
}

export function cgi({
    templateRootPath = '',
    match = defaultMatch,
    serverFile,
    pluginPaths,
    mockData
}: config): RequestHandler {
    return async (req, res, next) => {

        // stop stream until child-process is opened
        req.pause();

        let url = URL.parse(req.url);

        const matchedRoute = match(url);
        if (!matchedRoute) {
            next();
            return;
        }

        let data;
        if (typeof mockData === 'function') {
            data = mockData(url);
        }
        else {
            data = mockData;
        }

        const templatePath = path.join(templateRootPath, matchedRoute.templatePath);

        if (serverFile && fs.existsSync(serverFile)) {
            execute(req, res, next, url, serverFile, templatePath, data);
            return;
        }

        let phpScript = path.join(templateRootPath, url.pathname);

        if (fs.existsSync(phpScript)) {
            execute(req, res, next, url, phpScript, templatePath, data);
            return;
        }

        next();

    };

    function execute(req: Request, res: Response, next, url: URL.UrlWithStringQuery, serverFile: string, templatePath: string, data: any) {

        let i = req.url.indexOf('.php');
        let pathinfo = i > 0 ? url.pathname.substring(i + 4) : url.pathname
    
        let env = {
    
            SERVER_SIGNATURE: 'NodeJS server at localhost',
    
            // The extra path information, as given in the requested URL. In fact, scripts can be accessed by their virtual path, followed by extra information at the end of this path. The extra information is sent in PATH_INFO.
            PATH_INFO: pathinfo,
    
            // The virtual-to-real mapped version of PATH_INFO.
            PATH_TRANSLATED: '',
    
            // The virtual path of the script being executed.
            SCRIPT_NAME: url.pathname,
    
            SCRIPT_FILENAME: serverFile,
    
            // The real path of the script being executed.
            REQUEST_FILENAME: serverFile,
    
            // The full URL to the current object requested by the client.
            SCRIPT_URI: req.url,
    
            // The full URI of the current request. It is made of the concatenation of SCRIPT_NAME and PATH_INFO (if available.)
            URL: req.url,
    
            SCRIPT_URL: req.url,
    
            // The original request URI sent by the client.
            REQUEST_URI: req.url,
    
            // The method used by the current request; usually set to GET or POST.
            REQUEST_METHOD: req.method,
    
            // The information which follows the ? character in the requested URL.
            QUERY_STRING: url.query || '',
    
            // 'multipart/form-data', //'application/x-www-form-urlencoded', //The MIME type of the request body; set only for POST or PUT requests.
            CONTENT_TYPE: req.get('Content-Type') || '',
    
            // The length in bytes of the request body; set only for POST or PUT requests.
            CONTENT_LENGTH: req.get('Content-Length') || '0',
    
            // The authentication type if the client has authenticated itself to access the script.
            AUTH_TYPE: '',
    
            AUTH_USER: '',
    
            // The name of the user as issued by the client when authenticating itself to access the script.
            REMOTE_USER: '',
    
            // All HTTP headers sent by the client.
            // Headers are separated by carriage return characters (ASCII 13 - \n)
            // and each header name is prefixed by HTTP_,
            // transformed to upper cases, and - characters it contains are replaced by _ characters.
            ALL_HTTP: Object.keys(req.headers)
                .map(x => `HTTP_${x.toUpperCase().replace('-', '_')}: ${req.headers[x]}`)
                .reduce((a, b) => (a + b + '\n'), ''),
    
            // All HTTP headers as sent by the client in raw form. No transformation on the header names is applied.
            ALL_RAW: Object.keys(req.headers)
                .map(x => (`${x}: ${req.headers[x]}`))
                .reduce((a, b) => (a + b + '\n'), ''),
    
            // The web server's software identity.
            SERVER_SOFTWARE: 'NodeJS',
    
            // The host name or the IP address of the computer running the web server as given in the requested URL.
            SERVER_NAME: 'localhost',
    
            // The IP address of the computer running the web server.
            SERVER_ADDR: '127.0.0.1',
    
            // The port to which the request was sent.
            SERVER_PORT: '8011',
    
            // The CGI Specification version supported by the web server; always set to CGI/1.1.
            GATEWAY_INTERFACE: 'CGI/1.1',
    
            // The HTTP protocol version used by the current request.
            SERVER_PROTOCOL: '',
    
            // The IP address of the computer that sent the request.
            REMOTE_ADDR: req.ip || '',
    
            // The port from which the request was sent.
            REMOTE_PORT: '',
    
            // The absolute path of the web site files. It has the same value as Documents Path.
            DOCUMENT_ROOT: '',
    
            // The numerical identifier of the host which served the request. On Abyss Web Server X1, it is always set to 1 since there is only a single host.
            INSTANCE_ID: '',
    
            // The virtual path of the deepest alias which contains the request URI. If no alias contains the request URI, the letiable is set to /.
            APPL_MD_PATH: '',
    
            // The real path of the deepest alias which contains the request URI. If no alias contains the request URI, the letiable is set to the same value as DOCUMENT_ROOT.
            APPL_PHYSICAL_PATH: '',
    
            // It is set to true if the current request is a subrequest, i.e. a request not directly invoked by a client. Otherwise, it is set to true. Subrequests are generated by the server for internal processing. XSSI includes for example result in subrequests.
            IS_SUBREQ: '',
    
            REDIRECT_STATUS: '1',
    
            // pass down the PATH to child process find `php-cgi`
            PATH: process.env.PATH
        };
    
        Object.keys(req.headers).forEach(x => {
            let headerName = `HTTP_${x.toUpperCase().replace('-', '_')}`;
            env[headerName] = req.headers[x];
            return env;
        });
    
        if (!/.*?\.php$/.test(serverFile)) {
            res.sendFile(serverFile);
            return;
        }
    
        let result = '';
        let err = '';
    
        let php = child.spawn(
            'php',
            [
                path.resolve(__dirname, './server.php'),
                templatePath,
                pluginPaths ? JSON.stringify(pluginPaths) : '',
                typeof data === 'string' ? data : JSON.stringify(data),
                templateRootPath
            ],
            {
                env: env
            }
        );
    
        // pipe request stream directly into the php process
        req.pipe(php.stdin);
        req.resume();
    
        php.stdout.on('data', function(data) {
            result += data.toString();
        });
    
        php.stderr.on('data', function(data) {
            err += data.toString();
        });
    
        php.on('error', function(err) {
            console.error(err);
        });
    
        php.on('exit', function() {
            // extract headers
            php.stdin.end();
    
            // if (err) {
            //     res.status(res.statusCode).send(err);
            //     res.end();
            //     return;
            // }
    
            // let lines = result.split('\r\n');
            // let line = 0;
            // let html = '';
            // if (lines.length > 1) {
            //     do {
            //         let m = lines[line].split(': ');
            //         if (m[0] === '') {
            //             break;
            //         }
    
            //         if (m[0] == 'Status') {
            //             res.statusCode = parseInt(m[1]);
            //         }
    
            //         if (m.length == 2) {
            //             res.setHeader(m[0], m[1]);
            //         }
    
            //         line++;
    
            //     } while (lines[line] !== '');
    
            //     html = lines.splice(line + 1).join('\n');
    
            // }
            // else {
            //     html = result;
            // }
            // res.status(res.statusCode).send(html);
            res.status(res.statusCode).send(result);
            res.end();
        });
    
    }
};

interface config {
    templateRootPath?: string;
    match: (url: {pathname: string;}) => {
        templatePath: string;
    };
    serverFile: string;
    pluginPaths: string | string[];
    mockData?: {[key: string]: any};
}
