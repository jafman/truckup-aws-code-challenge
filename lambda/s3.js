const SDK = require('aws-sdk');
const SQS = new SDK.SQS();
const S3 = new SDK.S3();

exports.handler = async function (event) {
  // s3 handler
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    // Process each SQS record
    const records = event.Records;
    for (const record of records) {
      const body = JSON.parse(record.body);
      console.log('Processing message:', body);
      await uploadToS3(body);
      await deleteMessage(record.receiptHandle);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

async function deleteMessage(receiptHandle) {
  const params = {
      QueueUrl: process.env.QUEUE_URL,
      ReceiptHandle: receiptHandle
  };

  try {
      await SQS.deleteMessage(params).promise();
      console.log('Message deleted from the queue');
  } catch (error) {
      console.error('Error deleting message from the queue:', error);
      throw error;
  }
}

async function uploadToS3(body) {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${body.userId}-${Date.now()}.json`,
    Body: JSON.stringify(body),
    ContentType: 'text/plain',
  }

  try {
    await S3.putObject(params).promise();
    console.log('Object successfully added to bucket');
  } catch (error) {
    console.error('Error while adding object to S3:', error);
    throw error;
  }
}