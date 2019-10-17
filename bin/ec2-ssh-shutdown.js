#!/usr/bin/env node

const optionDefinitions = [
    { name: 'instanceId', type: String },
    { name: 'pk', type: String },
    { name: 'user', type: String },
    { name: 'timeout', type: Number, optional: true }
]

const SSHClient = require('../lib/ssh-client');

require('../lib/runner')(optionDefinitions, ({awsClient, options}) => {

    return awsClient.queryInstancePublicAddress(options.instanceId)
        .then(host => {
            var client = new SSHClient();
            var command;
            if (options.user == "root") {
                command = "shutdown now";
            } else {
                command = "sudo shutdown now";
            }
            return client.execute(command, host, options.user, options.pk, true)
        });
     
})

