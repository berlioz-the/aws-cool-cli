const commandLineArgs = require('command-line-args')

module.exports = function(optionDefinitions) {

    if (!optionDefinitions) {
        optionDefinitions = [];
    }

    optionDefinitions.push({ name: 'region', type: String });
    optionDefinitions.push({ name: 'profile', type: String, optional: true });
    optionDefinitions.push({ name: 'key', type: String, optional: true });
    optionDefinitions.push({ name: 'secret', type: String, optional: true });

    var requiredDefs = optionDefinitions.filter(x => !x.optional);
    const options = commandLineArgs(optionDefinitions)
    for(var optionDef of requiredDefs) 
    {
        if (!options[optionDef.name]) {
            throw new Error(`Argument ${optionDef.name} is not specified`);
        }
    }
    // console.log(options);
    return options;
}