#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const server = require('../dist/server');

const write = {
    error: chalk.bold.red,
    info: chalk.bold.green,
    highlight: chalk.bold.yellow,
    normal: chalk.white
}

program.version(require('../package').version);

program.usage('<command> <args ...> [options]');

program
    .command('start')
    .description('Start smarty server')
    .requiredOption('-c, --config <config-path>', 'specify a config file, must be a js file like exports = {}')
    .action(async (args) => {
        if (!fs.existsSync(args.config)) {
            console.log(write.error('Can not find config file: ' + args.config));
        }

        const config = require(fs.realpathSync(args.config));
        server.start(config);
    });

program.parse(process.argv);

const commands = ['start'];
if (commands.indexOf(process.argv[2]) === -1) {
    console.log(write.error('Invalid command! Use -h to see help.'));
}