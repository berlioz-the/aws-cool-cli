const _ = require('the-lodash');
const Promise = require('the-promise');

module.exports = function(optionDefinitions, cb) {

    var context = {
        Promise,
        _,
        options: null,
    }

    return Promise.resolve()
        .then(() => {
            const ArgParser = require('../lib/args');
            context.options = ArgParser(optionDefinitions)
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