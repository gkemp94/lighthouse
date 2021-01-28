const { SQS } = require('aws-sdk');
const AWS = require('aws-sdk');
const axios = require('axios');

const autoscaling = new AWS.AutoScaling();
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();

const { INSTANCE_ID, SQSQUEUE, AUTOSCALINGGROUP } = process.env;

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

const getIsPendingTermination = async () => {
  try {
    const { data } = await axios.get('http://169.254.169.254/latest/meta-data/spot/instance-action');
    console.log('[TERMINATION]', data);
    return !!data;
  } catch (e) {
    console.log('[TERMINATION] err:', e);
    return false;
  }
}

const postToProcessingLambda = async (Payload) => {
  return lambda.invoke({
    FunctionName: '',
    Payload,
  });
}

const deleteMessage = async (ReceiptHandle) => {
  return sqs.deleteMessage({
    QueueUrl: SQSQUEUE,
    ReceiptHandle,
  })
}

const sleep = (x) => new Promise((res) => setTimeout(() => res(true), x * 1000));

module.exports = {
  sleep,
  postToProcessingLambda,
  getIsPendingTermination,
  setScaleInProtection,
  getNextMessage,
  deleteMessage,
}