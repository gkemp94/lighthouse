# Lighthouse as a Service

Lighthouse as a service is designed to be used to

## Installation
### Pre-Reqs
- AWS CLI Installed
- Permissions to create all required resources (see below for resources that are created)

### Steps
Clone this repo then run the following command. 
```
npm run deploy
```

This will create the following stack, clone this repo onto spot instances and run the worker script to audit pages. 

## What is included
Running `./scripts/deploy.sh` will do the following. 

1. Creates a new VPC in `us-east-1`.
2. Creates two subnets in different availability zones within the VPC.
3. Creates and attaches an internet gateway to the VPC.
4. Creates and attaches route table with a route to the internet gateway to the subnets allowing internet access from the two subnets.
5. Creates policies to be assumed by a launch template.
6. Creates a launch template defining an instance type of `m5.large` with an `Amazon Linux 2 AMI` image, assuming a policy that enables it to interact with autoscaling, sqs and lambda. The launch template is also provided with a start up script that installs required tools to run lighthouse tests. 
7. Creates an SQS Queue for audits.
8. Creates an autoscaling group of spot instances with a desired capacity of `1` and min capcity of `0` and a max capacity of `1`. 
9. Creates an autoscaling policy acting upon the autoscaling group where the desired state is the Audit Queue to have 0 messages.

## Scripts
### `deploy.sh`
Updates the Cloudformation Stack

### `start.sh`
Used as part of the instance start up script, it installs dependencies and starts the worker node script.

## How it Works
Add to the SQS Queue the following. 
```json
{
  "domain": "https://hubspot.com",
  "callback": "<your_application_url>"
}
```
Once the audit is complete, a POST request will be sent to your callback url with the url of your report. Reports are kept for 7 days before being deleted.