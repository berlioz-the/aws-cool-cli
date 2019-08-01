#!/usr/bin/env node

const optionDefinitions = [
    { name: 'instanceId', type: String },
    { name: 'wait', type: Boolean, optional: true }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _}) => {

    return awsClient.waitInstanceStabilize(options.instanceId)
        .then(result => {
            console.log(`Initial State: ${result.State.Name}`);
            if (result.State.Name == 'running')
            {
                return awsClient.stopInstance(options.instanceId)
                    .then(() => {
                        if (options.wait) {
                            return awsClient.waitInstanceStabilize(options.instanceId);
                        } else {
                            return awsClient.queryInstanceById(options.instanceId);
                        }
                    });
            } 
            else 
            {
                return result;
            }
        })
        .then(result => {
            console.log(`Final State: ${result.State.Name}`);
        })
        ;

})


