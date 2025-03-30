var Discord = require('discord.io');

var config = require('../config.json');

var client = new Discord.Client({
    token: config.token,
    autorun: true
});

var discord24 = require('./24.js')(client);

client.on('ready', function() {
    console.log('Connected');
    console.log('username: ' + client.username);
    console.log('client id: ' + client.id);
});

client.on('disconnect', function(emsg, ecode) {
    console.log('Disconnected: ' + emsg);
    console.log('error code: %d\n', ecode);
    console.log('reconnecting...');
    client.connect();
});

client.on('message', discord24.start);
