const { Helper } = require('./helper');
const { createSchedule, getSchedules } = require('./db');

const userId = '2e2d69d4-b11f-4162-9aaf-dece541bccd7';

exports.getUserSchedule = async function (event) {
  return await getSchedules(userId);
}

exports.defaultHandler = async function (event) {
  console.log('request:', );
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `Hello! You've hit the default handler\n ${JSON.stringify(event, undefined, 2)}`
  };
}

exports.createSchedule = async function (event) {
  // Parse the request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return Helper.badRequestError('Invalid JSON');
  }
  // TODO: Validate time zone, and convert to UTC
  // TODO: Validate day
  // Validate the presence of required properties
  if (!body.day || !body.start_time || !body.end_time) {
    return Helper.badRequestError('Missing required properties');
  }

  // Validate the types of properties
  if (typeof body.day !== 'string' || typeof body.start_time !== 'string' || typeof body.end_time !== 'string') {
    return Helper.badRequestError('Invalid property types');
  }

  body.start_time = body.start_time.toUpperCase();
  body.end_time = body.end_time.toUpperCase();
  
  if (!Helper.validateTime(body.start_time)) {
    return Helper.badRequestError('Invalid time format for start time, example of time stamp: 12:01 PM, 01:00 AM etc');
  }

  if (!Helper.validateTime(body.end_time)) {
    return Helper.badRequestError('Invalid time format for end time, example of time stamp: 12:01 PM, 01:00 AM etc');
  }
  
  if(!Helper.validateTimeRange(body.start_time, body.end_time)) {
    return Helper.badRequestError('Invalid date range, start_time should be less than end_time');
  }

  return await createSchedule(userId, body);

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(body),
  // }
}

