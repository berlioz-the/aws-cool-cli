const _ = require('the-lodash');
const Promise = require('the-promise');

module.exports = function(optionDefinitions, cb) {

    var context = {
        Promise,
        _,
        awsClient: null,
        options: null,
    }

    return Promise.resolve()
        .then(() => {

            if (!optionDefinitions) {
                optionDefinitions = [];
            }
        
            optionDefinitions.push({ name: 'region', type: String });
            optionDefinitions.push({ name: 'profile', type: String, optional: true });
            optionDefinitions.push({ name: 'key', type: String, optional: true });
            optionDefinitions.push({ name: 'secret', type: String, optional: true });

            const ArgParser = require('../lib/args');
            context.options = ArgParser(optionDefinitions)
        })
        .then(() => {
            const AWSClient = require('../lib/aws-client');
            context.AWSClient = AWSClient;
            context.awsClient = new AWSClient(context.options);
        })
        .then(() => cb(context))
        .then(() => {

        })
        .catch(reason => {
            console.error(`ERROR: ${reason.message}`);
            // console.error(reason);
            process.exit(1);
        })
}