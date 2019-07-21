#!/usr/bin/env node

const optionDefinitions = [
    { name: 'instanceId', type: String },
    { name: 'wait', type: Boolean, optional: true }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _}) => {


    return awsClient.queryInstanceById(options.instanceId)
        .then(result => {
            console.log(`Current state: ${result.State.Name}`);
            return awsClient.startInstance(options.instanceId);
        })
        .then(result => {
            if (options.wait) {
                return awsClient.waitInstanceStabilize(options.instanceId);
            } else {
                return awsClient.queryInstanceById(options.instanceId);
            }
        })
        .then(result => {
            console.log(`Final State: ${result.State.Name}`);
        })

})


