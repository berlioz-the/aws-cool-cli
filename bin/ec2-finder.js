#!/usr/bin/env node

const optionDefinitions = [
    { name: 'name', type: String }
]

require('../lib/runner')(optionDefinitions, ({awsClient, options, Promise, _}) => {

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

})

