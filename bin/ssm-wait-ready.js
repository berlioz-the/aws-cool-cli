#!/usr/bin/env node

const optionDefinitions = [
    { name: 'instanceId', type: String },
    { name: 'wait', type: Boolean, optional: true }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _}) => {

    return awsClient.waitInstanceSSMStabilize(options.instanceId);

})
