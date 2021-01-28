#!/bin/bash

WORKING_DIR=/root/lighthouse

## Updating Packages
yum update -y

## Install & Launch Logs
yum install awslogs -y
cp -av $WORKING_DIR/scripts/awslogs.conf /etc/awslogs/
sed -i "s|us-east-1|$REGION|g" /etc/awslogs/awscli.conf
sed -i "s|%CLOUDWATCHLOGSGROUP%|$CLOUDWATCHLOGSGROUP|g" /etc/awslogs/awslogs.conf
systemctl start awslogsd

## Install Chrome
curl https://intoli.com/install-google-chrome.sh | bash

## Install Node
curl --silent --location https://rpm.nodesource.com/setup_14.x | sudo bash -
yum install -y nodejs
node -v

## Move to Worker Directory
cd $WORKING_DIR

## Install Dependencies
npm install

## Start Worker
npm run start

