const commandLineArgs = require('command-line-args')

module.exports = function(optionDefinitions) {

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