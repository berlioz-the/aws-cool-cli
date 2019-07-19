#!/usr/bin/env node

const _ = require('the-lodash');
const Promise = require('the-promise');

const optionDefinitions = [
    { name: 'region', type: String },
    { name: 'profile', type: String, optional: true },
    { name: 'bucket', type: String },
    { name: 'path', type: String }
]

const ArgParser = require('../lib/args');
const options = ArgParser(optionDefinitions)

var AWSClient = require('../lib/aws-client');
var awsClient = new AWSClient(options);

return awsClient.outputS3FileContents(options.bucket, options.path)