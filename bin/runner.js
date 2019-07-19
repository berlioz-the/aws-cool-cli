const _ = require('the-lodash');
const Promise = require('the-promise');
const dateFormat = require('dateformat');

const optionDefinitions = [
    { name: 'instanceId', type: String },
    { name: 'region', type: String },
    { name: 'profile', type: String },
    { name: 'command', type: String },
    { name: 's3Bucket', type: String, optional: true },
    { name: 'task', type: String, optional: true }
]

const ArgParser = require('../lib/args');
const options = ArgParser(optionDefinitions)

var AWSClient = require('../lib/aws-client');
var awsClient = new AWSClient(options);

var params = {

}

if (options.s3Bucket) {
    params.OutputS3BucketName = options.s3Bucket;
    params.OutputS3KeyPrefix = dateFormat(new Date, "yyyy-mm-dd");
    if (options.task) {
        params.OutputS3KeyPrefix = params.OutputS3KeyPrefix + '/' + options.task;
    }
}
if (options.task) {
    params.Comment = options.task;
}
console.log(options);
return awsClient.executeSSMShellCommand(options.instanceId, options.command, params)
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