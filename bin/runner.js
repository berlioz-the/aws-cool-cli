const _ = require('the-lodash');
const Promise = require('the-promise');

const optionDefinitions = [
    { name: 'instanceId', type: String },
    { name: 'region', type: String },
    { name: 'profile', type: String },
    { name: 'command', type: String },
    { name: 'comment', type: String, optional: true }
]

const ArgParser = require('../lib/args');
const options = ArgParser(optionDefinitions)

var AWSClient = require('../lib/aws-client');
var awsClient = new AWSClient(options);

return awsClient.executeSSMShellCommand(options.instanceId, options.command, options.comment)
    .then(data => {
        // console.log(data);
        console.log(`Status: ${data.Status}`);
        for(var plugin of data.CommandPlugins)
        {
            console.log(plugin.Output);
        }
        console.log(`Final Status: ${data.Status}`);

        if (data.Status != 'Success') {
            process.exit(1);
        }
    })