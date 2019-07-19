# AWS COOL CLI
Provides easy to use AWS access.

## Installation
```
sudo npm install aws-cool-cli -g
```

## Running SSM Commands on AWS EC2 Instances
Usage:
```sh
aws-cool-cli-ec2-run-command --command <command> --instanceId <instance-id> --region <region> --profile [aws-profile] --s3Bucket [log-output-s3-bucket] --task <task-name>
```

## Fetching S3 File Contents
Usage:
```sh
aws-cool-cli-s3-fetch --region <region> --profile [aws-profile] --bucket <bucket-name> --path <path>
```