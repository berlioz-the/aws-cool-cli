#!/usr/bin/env node

const _ = require('the-lodash');
const Promise = require('the-promise');

const optionDefinitions = [
    { name: 'region', type: String },
    { name: 'profile', type: String, optional: true },
    { name: 'name', type: String }
]

const ArgParser = require('../lib/args');
const options = ArgParser(optionDefinitions)

var AWSClient = require('../lib/aws-client');
var awsClient = new AWSClient(options);

var tagFilter = {};
if (options.name) {
    tagFilter['Name'] = options.name;
}

return awsClient.findInstancesByTag(tagFilter)
    .then(result => {
        var instanceIds = result.map(x => x.InstanceId);
        for(var x of instanceIds) {
            console.log(x);
        }
    });