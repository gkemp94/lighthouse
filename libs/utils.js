const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const autoscaling = new AWS.AutoScaling();
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();
const meta = new AWS.MetadataService();

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

const getIsPendingTermination = () => new Promise((res, rej) => {
  meta.request('/latest/meta-data/spot/instance-action', (err) => {
    if (err) {
      return res(false);
    } else {
      return res(true);
    }
  })
});

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