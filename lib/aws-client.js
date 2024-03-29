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
        if (!params.Parameters) {
            params.Parameters = {};
        }
        params.Parameters.commands = [ commandString ];
        params.InstanceIds = [ instanceId ];
        if (params.Parameters.executionTimeout) {
            console.log(`Execution Timeout: ${params.Parameters.executionTimeout}s`);
        }
        // console.log(params);
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
        if (!id) {
            throw new Error('CommandID not provided');
        }
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
    
    querySSMInstanceStatus(instanceId)
    {
        if (!instanceId) {
            throw new Error('InstanceID not provided');
        }
        var params = {
            InstanceId: instanceId
        }
        return this._ssm.describeInstanceAssociationsStatus(params).promise()
            .then(data => {
                var status = _.head(data.InstanceAssociationStatusInfos);
                if (!status) {
                    return null;                    
                }
                return status;
            });
    }

    ssmExecuteAutomation(instanceId, documentName, parameters)
    {
        console.log(`SSM Automation: ${documentName}`);
        var params = {};
        params.DocumentName = documentName;
        if (!params.Parameters) {
            params.Parameters = {};
        } else {
            params.Parameters = _.clone(parameters);
        }
        params.Parameters.InstanceId = [ instanceId ] ;
        return this._ssm.startAutomationExecution(params).promise()
            .then(data => {
                console.log(data);
                return data;
            })
    }


    waitInstanceSSMStabilize(instanceId)
    {
        return this.querySSMInstanceStatus(instanceId)
            .then(status => {
                var statusStr = 'unknown';
                if (status) {
                    statusStr = status.Status;
                }
                if (statusStr != 'Success')
                {
                    console.log(`Instance SSM is ${statusStr}. Pausing...`);
                    return Promise.timeout(1000)
                        .then(() => this.waitInstanceSSMStabilize(instanceId));
                }
                else
                {
                    console.log(`Instance SSM is ${statusStr}.`);
                }
                return status;
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

    queryInstancePublicAddress(id)
    {
        return this.queryInstanceById(id)
            .then(result => {
                var host = result.PublicDnsName;
                if (!host) {
                    host = result.PublicIpAddress;
                }
                if (!host) {
                    throw new Error(`Could not get instance public address: ${id}`);
                }
                return host;
            });
    }
}

module.exports = AwsClient;