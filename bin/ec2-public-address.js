#!/usr/bin/env node

const dateFormat = require('dateformat');

const optionDefinitions = [
    { name: 'instanceId', type: String }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _}) => {

    return awsClient.queryInstancePublicAddress(options.instanceId)
        .then(host => {
            console.log(host);
        });
     
})

