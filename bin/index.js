const program = require('commander');

program.version(require('../package').version);

program.usage('<command> <args ...> [options]');

program
    .command('aladdin <old-version> <new-version> [destination]')
    .description('Use preset config')
    .option('-p, --pattern <pattern>', 'specify a different pattern', './**/dataModifier.ts')
    .action(async (oldVersion, newVersion, destination, args) => {
        await check(oldVersion, newVersion, args.pattern, {
            modules: {
                '@baidu/vui-utils': {
                    namespace: '\\',
                    required: true
                },
                'ts2php/types/php': {
                    required: true
                }
            },
            getNamespace(file) {
                return 'filename';
            },
            getModuleNamespace(name) {
                if (!/^\./.test(name)) {
                    return '\\';
                }
                return '\\' + name + '\\';
            }
        }, destination);
    });