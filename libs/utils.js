const AWS = require('aws-sdk');
const axios = require('axios');

const autoscaling = new AWS.AutoScaling();
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();

const getNextMessage = () => {
  return sqs.receiveMessage({
    QueueUrl: '',
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 10,
  }).promise();
};

const setScaleInProtection = (ProtectedFromScaleIn) => {
  return autoscaling.setInstanceProtection({ 
    AutoScalingGroupName: 'asd',
    InstanceIds: [ 'asd' ],
    ProtectedFromScaleIn,
  }).promise();
};

const getIsPendingTermination = async () => {
  try {
    const { data } = await axios.get('https://');
    return !!data;
  } catch (e) {
    return false;
  }
}

const postToProcessingLambda = async (Payload) => {
  return lambda.invoke({
    FunctionName: '',
    Payload,
  });
}

const sleep = (x) => new Promise((res) => setTimeout(res, x * 1000));

module.exports = {
  sleep,
  postToProcessingLambda,
  getIsPendingTermination,
  setScaleInProtection,
  getNextMessage,
}