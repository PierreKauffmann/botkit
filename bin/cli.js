#!/usr/bin/env node
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const prompts = require('prompts');
const chalk = require('chalk');
var exec = require('child_process').exec
var fs = require('fs');
var PKG_VERSION = require('../package.json').version;


// https://github.com/75lb/command-line-args/wiki/Implement-command-parsing-(git-style)
const firstPass = commandLineArgs([
    { name: 'command', defaultOption: true },
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'help', alias: 'h', type: Boolean }
], { stopAtFirstUnknown: true })

const argv = firstPass._unknown || [];

if (firstPass.version) {
    console.log(PKG_VERSION);
} else {

    switch (firstPass.command) {
        case 'version':
            console.log(PKG_VERSION);
            break;
        case 'new':
            if (firstPass.help) {
                showUsageForNew();
            } else {
                const params = commandLineArgs([
                    {
                        name: 'name',
                        alias: 'n',
                        type: String,
                    },
                    {
                        name: 'platform',
                        alias: 'p',
                        type: String,
                    },
                    {
                        name: 'help',
                        alias: 'h',
                        type: Boolean
                    }

                ], { argv });
                
                buildBotkit(params);
            }
            break;
        default: 
            showUsage();
    }

}

function showUsage() {
    console.log(commandLineUsage(
        [
            {
                header: 'Botkit CLI',
                content: 'Building blocks for building bots\n\nGet started: {underline https://botkit.ai/getstarted.html}\nDocs: {underline https://botkit.ai/docs}'
            },
            {
                    header: 'Example:',
                    content: '$ botkit new\n$ botkit new --name marvin --platform web'
            },
            {
                header: 'Command List',
                content: [
                    {
                        name: 'new',
                        summary: 'Create a new Botkit Bot'
                    },
                    {
                        name: 'help',
                        summary: 'Display this help information',
                    },
                    {
                        name: 'version',
                        summary: 'Display version of Botkit cli'
                    }
                ]
            }
        ]
    ));
}

function showUsageForNew() {
    console.log(commandLineUsage(
        [
            {
                header: 'Create a new bot:',
                optionList: [
                    {
                        name: 'name',
                        alias: 'n',
                        description: 'Name for the new bot',
                    },
                    {
                        name: 'platform',
                        alias: 'p',
                        description: 'Platform adapter selection',
                    },
                ]
            },
            {
                header: 'Example:',
                content: '$ botkit new --name marvin --platform web -k <token>'
        },

        ]
    ));
}

async function buildBotkit(options) {

    options.name = await getBotName(options);
    options.platform = await getBotPlatform(options);

    return installBot(options);
}

async function getBotName(options) {
    if (options.name) {
        return options.name;
    } else {
        const response = await prompts([{
            type: 'text',
            name: 'name',
            message: 'Name your bot:',
            validate: value => value ? true : 'All bots have names!'
        }]);

        if (response.name === undefined) {
            process.exit();
        } else {
            return response.name;
        }
    }
}

async function getBotPlatform(options) {
    if (options.platform) {
        options.platform = options.platform.toLowerCase();
        if (platforms.map(platform => platform.platform).indexOf(options.platform) >= 0) {
            return options.platform;
        }
    }
    
    const response = await prompts([{
        type: 'select',
        name: 'platform',
        message: 'Choose platform:',
        choices: platforms.filter(platform => platform.display != false).map((platform) => { return {title: platform.platform, value: platform.platform} }),
    }]);

    if (response.platform === undefined) {
        process.exit();
    } else {
        return response.platform;
    }
}


function say(args) {
    console.log(args);
}


var bot_vars;
var platforms = [{
        platform: 'web',
        artifact: 'https://github.com/howdyai/botkit-starter-web.git',
        directory: 'botkit-starter-web'
    },
    {
        platform: 'facebook',
        artifact: 'https://github.com/howdyai/botkit-starter-facebook.git',
        directory: 'botkit-starter-facebook'
    }
];

function makeDirname(name) {

    var dirname = name.toLowerCase().replace(/\s+/g, '_');
    return dirname;
}

async function installBot(bot_vars) {
    if (fs.existsSync(bot_vars.name)) {
        say('A bot called ' + bot_vars.name + ' already exist in this directory. Please try again with a different name.');
    } else {
        say('Installing Botkit...')
        var target = platforms.filter(function(p) {
            return p.platform === bot_vars.platform;
        });
        if (target.length > 0) {
            var folder_name = makeDirname(bot_vars.name);
            var action = 'git clone ' + target[0].artifact + ' ' + folder_name + '&& cd ' + folder_name + ' && npm install'
            exec(action, function(err, stdout, stderr) {
                if (err) {
                    say('An error occurred. You may already have that starter kit installed.');
                    say('Error:' + err);
                } else {
                    say(chalk.bold('Installation complete! To start your bot, type:'));
                    say('cd ' + folder_name + ' && node .');
                }
            });
        } else {
            say('Please try again with a valid platform.');
        }
    }
}