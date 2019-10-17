#!/usr/bin/env node

const optionDefinitions = [
    { name: 'instanceId', type: String },
    { name: 'command', type: String },
    { name: 'pk', type: String },
    { name: 'user', type: String },
    { name: 'timeout', type: Number, optional: true }
]

const SSHClient = require('../lib/ssh-client');

require('../lib/runner')(optionDefinitions, ({awsClient, options}) => {

    return awsClient.queryInstancePublicAddress(options.instanceId)
        .then(host => {
            var client = new SSHClient();
            return client.execute(options.command, host, options.user, options.pk)
        });
     
})

