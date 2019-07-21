#!/usr/bin/env node

const optionDefinitions = [
    { name: 'instanceId', type: String }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _}) => {
    
    return awsClient.queryInstanceById(options.instanceId)
        .then(result => {
            console.log(result.State.Name);
        });

})


