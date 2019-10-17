#!/usr/bin/env node

const optionDefinitions = [
    { name: 'command', type: String },
    { name: 'host', type: String },
    { name: 'pk', type: String },
    { name: 'user', type: String },
    { name: 'timeout', type: Number, optional: true }
]

const SSHClient = require('../lib/ssh-client');

require('../lib/raw-runner')(optionDefinitions, ({options }) => {

    var client = new SSHClient();
    return client.execute(options.command, options.host, options.user, options.pk);
})

