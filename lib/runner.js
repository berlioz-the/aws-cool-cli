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
            const ArgParser = require('../lib/args');
            context.options = ArgParser(optionDefinitions)
        })
        .then(() => {
            const AWSClient = require('../lib/aws-client');
            context.awsClient = new AWSClient(context.options);
        })
        .then(() => cb(context))
        .then(() => {

        })
        .catch(reason => {
            // console.error(reason);
            console.error(`ERROR: ${reason.message}`);
            process.exit(1);
        })
}