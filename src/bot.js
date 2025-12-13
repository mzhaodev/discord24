
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../config.json');
const game = require('./game.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.substring(0, 3) == "24/") {
        const solution = message.content.substring(3).trim();
        const command = solution.substring(0, 4);
        const user = message.author;
        const uid = user.id;
        const cid = message.channel.id;

        switch (command) {
            case 'help':
                message.channel.send('`24/show` to show the current problem. `24/skip` to skip a problem. `24/ANSWER` to submit a solution (replace ANSWER with your answer). Use rpn <https://en.wikipedia.org/wiki/Reverse_Polish_notation>. `24/calc EXPR` to calculate EXPR. `24/solv["A",2,3,4]` to solve 24 with 1, 2, 3, 4. `A = 1, X = 10, J = 11, Q = 12, K = 13.`');
                return;
            case 'calc':
                message.channel.send(`<@!${uid}> \`${game.pcalc(solution.substring(4).trim(), false)}\``);
                return;
            case 'show':
                message.channel.send('Set: `' + JSON.stringify(game.currentSet.sort((a,b)=>(game.cardset.indexOf(a)-game.cardset.indexOf(b)))) + '`');
                return;
            case 'skip':
                const ans = game.solve(game.currentSet);
                game.newSet();
                message.channel.send(`Skipped! Solution was: \`${ans}\`. New set: \`${JSON.stringify(game.currentSet.sort((a,b)=>(game.cardset.indexOf(a)-game.cardset.indexOf(b))))}\``);
                return;
            case 'solv':
                const expr = solution.substring(4).trim();
                message.channel.send(`<@!${uid}> \`${(game.validJSON(expr) ? game.solve(JSON.parse(expr)) : 'Invalid format. Please use 24/solv["A","2","3","4"] (the quotes are optional for the arabic numerals).')}\``);
                return;
            case 'scor':
                 message.channel.send('```' + Object.keys(game.scores.count).map(uid=>game.scores.count[uid]).sort((a,b)=>(b.points-a.points)).map(a=>(a.nick+': '+a.points)).join('\n') + '```');
                return;
        }

        if (game.valid(solution) && Math.abs(game.pcalc(solution, true) - 24) < Math.pow(10, -8)) {
            if (game.scores.count[uid] != undefined) {
                game.scores.count[uid].nick = user.username;
                ++game.scores.count[uid].points;
            } else {
                game.scores.count[uid] = {
                    nick: user.username,
                    points: 1
                };
            }
            game.savescores();
            game.newSet();
            message.channel.send(`<@!${uid}> is correct! Points: ${game.scores.count[uid].points}. New set: \`${JSON.stringify(game.currentSet.sort((a,b)=>(game.cardset.indexOf(a)-game.cardset.indexOf(b))))}\``);
        }
    }
});

client.login(config.token);
