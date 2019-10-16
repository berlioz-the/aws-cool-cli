#!/usr/bin/env node

const optionDefinitions = [
    { name: 'instanceId', type: String }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _, AWSClient}) => {

    var params = {
    }
    
    var isSucceeded = false;
    var finalStatus = '';
    return awsClient.ssmExecuteAutomation(options.instanceId, 'AWS-StopEC2Instance', params)
        .then(data => {
            console.log(data);
        })
        
     
})

