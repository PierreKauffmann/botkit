var CoreBot = require(__dirname + '/CoreBot.js');
var Facebookbot = require(__dirname + '/Facebook.js');
var BotFrameworkBot = require(__dirname + '/BotFramework.js');
var ConsoleBot = require(__dirname + '/ConsoleBot.js');
var WebBot = require(__dirname + '/Web.js');

module.exports = {
    core: CoreBot,
    facebookbot: Facebookbot,
    botframeworkbot: BotFrameworkBot,
    consolebot: ConsoleBot,
    socketbot: WebBot,
    anywhere: WebBot
};
