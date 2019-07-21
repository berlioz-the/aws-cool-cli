#!/usr/bin/env node

const optionDefinitions = [
    { name: 'bucket', type: String },
    { name: 'path', type: String }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _}) => {

    return awsClient.outputS3FileContents(options.bucket, options.path);

})
