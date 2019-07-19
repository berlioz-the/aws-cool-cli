#!/usr/bin/env node

const _ = require('the-lodash');
const Promise = require('the-promise');
const dateFormat = require('dateformat');

const optionDefinitions = [
    { name: 'region', type: String },
    { name: 'profile', type: String, optional: true },
    { name: 'instanceId', type: String },
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

var isSucceeded = false;
var finalStatus = '';
return awsClient.executeSSMShellCommand(options.instanceId, options.command, params)
    .then(data => {
        finalStatus = data.Status;
        if (finalStatus == 'Success') {
            isSucceeded = true;
        }

        // console.log(data);
        console.log(`Status: ${finalStatus}`);
        console.log(`------------- SHORT OUTPUT -------------`);
        for(var plugin of data.CommandPlugins)
        {
            console.log(plugin.Output);
        }

        if (options.s3Bucket) {

            return Promise.resolve()
                .then(() => fetchAndOutput('stdout', data.StandardOutputUrl))
                .then(() => fetchAndOutput('stderr', data.StandardErrorUrl))
                ;
        }
    })
    .then(() => {

        console.log(`Final Status: ${finalStatus}`);
        if (!isSucceeded) {
            process.exit(1);
        }
    })


function fetchAndOutput(name, url)
{
    if (!url) {
        return;
    }

    console.log();
    console.log(`------------- ${name.toUpperCase()} OUTPUT BEGIN -------------`);

    const regex = /^https:\/\/s3\.([\w-]+).amazonaws\.com\/([\w-_]+)\/(\S+)$/;
    var found = url.match(regex);
    // console.log(found);

    var s3Options = _.clone(options);
    s3Options.region = found[1];
    var awsS3Client = new AWSClient(s3Options);
    return awsS3Client.outputS3FileContents(found[2], found[3])
        .then(() => {
            console.log(`-------------- ${name.toUpperCase()} OUTPUT END --------------`);
            console.log();
        })
        .catch(reason => {
            if (reason.statusCode == 404) {
                console.log('Output Stream Not Present');
                return;
            }
            throw reason;
        })

}