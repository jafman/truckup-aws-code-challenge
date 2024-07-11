const SDK = require('aws-sdk');
const RDS = new SDK.RDSDataService();

exports.getUserSchedule = async function (event) {
  console.log("request:", );
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello! You've hit ${event.path}\n ${JSON.stringify(event, undefined, 2)}`
  };
}

exports.defaultHandler = async function (event) {
  console.log("request:", );
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello! You've hit the default handler\n ${JSON.stringify(event, undefined, 2)}`
  };
}
