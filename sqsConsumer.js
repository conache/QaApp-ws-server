const AWS = require('aws-sdk');
const {Consumer} = require('sqs-consumer');
const socketHandler = require("./socketHandler");
const queueUrl = "https://sqs.us-east-2.amazonaws.com/741022728687/qaSQS2";

AWS.config.loadFromPath("secrets/aws-config.json");

const sqsConsumer = Consumer.create({
  queueUrl,
  handleMessage: async (message) => {
    console.log("Got message from queue:");
    console.log(message.Body);
    socketHandler.sendNotification(JSON.parse(message.Body));
  },
  sqs: new AWS.SQS()
});

// treat sqs consumer errors
sqsConsumer.on('error', (err) => {
  console.log("[SQS Consumer] Error:");
  console.error(err.message);
});

sqsConsumer.on('processing_error', (err) => {
  console.log("[SQS Consumer] Processing error:");
  console.error(err.message);
});


init = function() {
  sqsConsumer.start();
}

module.exports = {
  init
}