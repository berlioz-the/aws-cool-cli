const _ = require('the-lodash');
const Promise = require('the-promise');

var AWS = require('aws-sdk');
AWS.config.setPromisesDependency(Promise);


class AwsClient
{
    constructor(options)
    {
        var credentials = new AWS.SharedIniFileCredentials({profile: options.profile});
        this._ssm = new AWS.SSM({credentials: credentials, region: options.region});
    }

    executeSSMShellCommand(instanceId, commandString, params)
    {
        return this.sendSSMShellCommand(instanceId, commandString, params)
            .then(command => {

                // console.log(command);
                return this.waitForCommand(command.CommandId)
            })
    }

    waitForCommand(commandId)
    {
        return this.guerySSMInvocation(commandId)
            .then(data => {
                if (!data) {
                    console.log(`Command ${commandId} not queryable`);
                    return Promise.timeout(1000)
                        .then(() => this.waitForCommand(commandId))
                }
                console.log(`Command ${commandId} status: ${data.Status}`);
                if (data.Status == 'InProgress') {
                    return Promise.timeout(2000)
                        .then(() => this.waitForCommand(commandId))
                }
                return data;
            })
            ;
    }

    sendSSMShellCommand(instanceId, commandString, params)
    {
        console.log(`Running Command: ${commandString}`);
        if (!params) {
            params = {};
        }
        params.DocumentName = 'AWS-RunShellScript';
        params.Parameters = {
            commands: [
                commandString
            ]
        };
        params.InstanceIds = [
            instanceId
        ]
        return this._ssm.sendCommand(params).promise()
            .then(data => {
                // console.log(data);
                return data.Command;
            })
            .then(command => {
                console.log(`Command ${command.CommandId} launched`);
                return command;
            })
    }

    guerySSMInvocation(id)
    {
        var params = {
            CommandId: id,
            Details: true
        }
        return this._ssm.listCommandInvocations(params).promise()
            .then(data => {
                return _.head(data.CommandInvocations);
            })
            .then(data => {
                return data;
            })
    }
}

module.exports = AwsClient;