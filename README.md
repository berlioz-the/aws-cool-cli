# AWS COOL CLI
Provides easy to use AWS access.

## Installation
```
sudo npm install aws-cool-cli -g
```

## Common Arguments
| Argument | Description   |
|----------|---------------|
| region   | The AWS region  |
| profile  | Shared AWS credentials profile. Optional. Cannot be used with **key** and **secret**. |
| key      | AWS credentials key. Optional. Should be used with **secret** if provided. Cannot be used with **profile**.  |
| secret   | AWS credentials secret. Optional. Should be used with **key** if provided. Cannot be used with **profile**.  |


## Searching for EC2 Instances by Name
Usage:
```sh
aws-cool-cli-ec2-find-by-name --region <region> --name <name>
```

## Starting EC2 Instance
Usage:
```sh
aws-cool-cli-ec2-start --instanceId <id> --region <region> [--wait]
```

## Stopping EC2 Instance
Usage:
```sh
aws-cool-cli-ec2-stop --instanceId <id> --region <region> [--wait]
```

## Getting EC2 Instance State
Usage:
```sh
aws-cool-cli-ec2-state --instanceId <id> --region <region>
```

## Waiting SSM Agent Ready
Usage:
```sh
aws-cool-cli-ssm-wait-ready --instanceId <instance-id> --region <region>
```

## Running SSM Commands on AWS EC2 Instances
Usage:
```sh
aws-cool-cli-ec2-run-command --command <command> --instanceId <instance-id> --region <region> --s3Bucket [log-output-s3-bucket] --task [task-name] --timeout [execution-timeout-seconds]
```

## Fetching S3 File Contents
Usage:
```sh
aws-cool-cli-s3-fetch --region <region> --bucket <bucket-name> --path <path>
```

## Running SSH Commands on AWS EC2 Instances using SSH
Usage:
```sh
aws-cool-cli-ec2-ssh-command --command <command> --user <user> --pk <path-to-pk-pem-file> --instanceId <instance-id> --region <region>
```

## Shutdown AWS EC2 Instances using SSH
Usage:
```sh
aws-cool-cli-ec2-ssh-shutdown --user <user> --pk <path-to-pk-pem-file> --instanceId <instance-id> --region <region>
```

## Running SSH Commands on Remote Host using SSH
Usage:
```sh
aws-cool-cli-ssh-command --command <command> --user <user> --host <host> --pk <path-to-pk-pem-file>
```
