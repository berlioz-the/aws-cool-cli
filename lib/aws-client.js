const _ = require('the-lodash');
const Promise = require('the-promise');

var AWS = require('aws-sdk');
AWS.config.setPromisesDependency(Promise);


class AwsClient
{
    constructor(options)
    {
        var credentials = null;
        if (options.profile) {
            credentials = new AWS.SharedIniFileCredentials({profile: options.profile});
        } else if (options.key && options.secret) {
            credentials = new AWS.Credentials(options.key, options.secret);
        }
        var config = {credentials: credentials, region: options.region};
        this._ssm = new AWS.SSM(config);
        this._s3 = new AWS.S3(config);
        this._ec2 = new AWS.EC2(config);
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

    fetchS3FileContents(bucketName, filePath, streamerCb)
    {
        var params = {
            Bucket: bucketName,
            Key: filePath
        }
        return this._s3.getObject(params).promise()
            .then(data => {
                var contents = data.Body.toString();
                if (streamerCb) {
                    streamerCb(contents);
                }
                var result = {
                    parts: [contents]
                }
                return result;
            })
    }

    outputS3FileContents(bucketName, filePath)
    {
        return this.fetchS3FileContents(bucketName, filePath)
            .then(result => {
                for(var x of result.parts) {
                    console.log(x);
                }
            })
    }

    findInstancesByTag(tagFilters)
    {
        var params = {
            Filters: []    
        }
        if (tagFilters) {
            for(var k of _.keys(tagFilters))
            {
                params.Filters.push({
                    Name: 'tag:' + k,
                    Values: [tagFilters[k]]
                })
            }
        }

        params.Filters.push({
            Name: 'instance-state-name',
            Values: ['pending', 'running', 'shutting-down', 'stopping', 'stopped']
        })
        
        if (params.Filters.length == 0) {
            delete params.Filters;
        }
        return this._ec2.describeInstances(params).promise()
            .then(data => {
                var instances = data.Reservations.map(x => x.Instances);
                instances = _.flatten(instances);
                return instances;
            })
    }

    queryInstanceById(id)
    {
        if (!id) {
            throw new Error('InstanceID not provided');
        }
        var params = {
            InstanceIds: [
                id
            ]
        }
        return this._ec2.describeInstances(params).promise()
            .then(data => {
                var instances = data.Reservations.map(x => x.Instances);
                instances = _.flatten(instances);
                var instance = _.head(instances);
                if (!instance) {
                    throw new Error('Instance not found');
                }
                return instance;
            })
    }

    startInstance(id)
    {
        if (!id) {
            throw new Error('InstanceID not provided');
        }
        var params = {
            InstanceIds: [
                id
            ]
        }
        return this._ec2.startInstances(params).promise()
            .then(data => {
                var instances = data.StartingInstances;
                return instances;
            })
    }

    stopInstance(id)
    {
        if (!id) {
            throw new Error('InstanceID not provided');
        }
        var params = {
            InstanceIds: [
                id
            ]
        }
        return this._ec2.stopInstances(params).promise()
            .then(data => {
                var instances = data.StoppingInstances;
                return instances;
            })
    }

    waitInstanceStabilize(id)
    {
        return this.queryInstanceById(id)
            .then(instance => {
                if (!instance) {
                    return null;
                }
                if (instance.State.Name == 'pending' || 
                    instance.State.Name == 'shutting-down' || 
                    instance.State.Name == 'stopping')
                {
                    console.log(`Instance is ${instance.State.Name}. Pausing...`);

                    return Promise.timeout(2000)
                        .then(() => this.waitInstanceStabilize(id));
                }
                return instance;
            })
    }
}

module.exports = AwsClient;