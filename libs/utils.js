const AWS = require('aws-sdk');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

AWS.config.update({ region: 'us-east-1' });

const autoscaling = new AWS.AutoScaling();
const sqs = new AWS.SQS();
const meta = new AWS.MetadataService();
const s3 = new AWS.S3();

const { INSTANCE_ID, SQSQUEUE, AUTOSCALINGGROUP, REPORTBUCKET } = process.env;

const getNextMessage = () => {
  return sqs.receiveMessage({
    QueueUrl: SQSQUEUE,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 10,
  }).promise();
};

const setScaleInProtection = (ProtectedFromScaleIn) => {
  return autoscaling.setInstanceProtection({ 
    AutoScalingGroupName: AUTOSCALINGGROUP,
    InstanceIds: [ INSTANCE_ID ],
    ProtectedFromScaleIn,
  }).promise();
};

const getIsPendingTermination = () => new Promise((res, rej) => {
  meta.request('/latest/meta-data/spot/instance-action', (err) => {
    if (err) {
      return res(false);
    } else {
      return res(true);
    }
  })
});

const deleteMessage = async (ReceiptHandle) => {
  return sqs.deleteMessage({
    QueueUrl: SQSQUEUE,
    ReceiptHandle,
  }).promise();
}

const runLighthouse = async (domain) => {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless', '--no-sandbox'] });
  const { report } = await lighthouse(domain, {
    logLevel: 'error',
    chromeFlags: ['--headless --no-sandbox'],
    skipAudits: ['full-page-screenshot', 'screenshot-thumbnails', 'final-screenshot'],
    port: chrome.port,
  });
  await chrome.kill();
  return JSON.parse(report);
}

const uploadReport = async (MessageId, report) => {
  console.log(REPORTBUCKET);
  await s3.putObject({
    Bucket: REPORTBUCKET,
    Key: `${MessageId}.json`,
    Body: JSON.stringify(report),
    ContentType: "application/json"
  }).promise();
  return `https://${REPORTBUCKET}.s3.us-east-1.amazonaws.com/${MessageId}.json`;
}

const sleep = (x) => new Promise((res) => setTimeout(() => res(true), x * 1000));

module.exports = {
  sleep,
  getIsPendingTermination,
  setScaleInProtection,
  getNextMessage,
  deleteMessage,
  runLighthouse,
  uploadReport,
};