const { Helper } = require('./helper');
const { 
  createSchedule,
  getSchedules,
  getScheduleByDay,
  getScheduleById,
  updateSchedule, 
  deleteSchedule 
} = require('./db');

const userId = '2e2d69d4-b11f-4162-9aaf-dece541bccd7';
const userTimeZone = 'America/New_York';

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
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return Helper.badRequestError('Invalid JSON');
  }

  // Validate the presence of required properties
  if (!body.day || !body.start_time || !body.end_time) {
    return Helper.badRequestError('Missing required properties');
  }

  // Validate the types of properties
  if (typeof body.day !== 'string' || typeof body.start_time !== 'string' || typeof body.end_time !== 'string') {
    return Helper.badRequestError('Invalid property types');
  }

  // TODO: Validate day
  if (!Helper.validateDay(body.day)) {
    return Helper.badRequestError('Invalid day format, example of day is monday, tuesday etc');
  }

  body.start_time = body.start_time.toUpperCase();
  body.end_time = body.end_time.toUpperCase();
  body.day = body.day.toLowerCase();
  
  const { isValid, message } = Helper.validateTimeFormatAndRange(body);
  if (!isValid) {
    return Helper.badRequestError(message);
  }
  // if (!Helper.validateTime(body.start_time)) {
  //   return Helper.badRequestError('Invalid time format for start time, example of time stamp: 12:01 PM, 01:00 AM etc');
  // }

  // if (!Helper.validateTime(body.end_time)) {
  //   return Helper.badRequestError('Invalid time format for end time, example of time stamp: 12:01 PM, 01:00 AM etc');
  // }
  
  // if(!Helper.validateTimeRange(body.start_time, body.end_time)) {
  //   return Helper.badRequestError('Invalid date range, start_time should be less than end_time');
  // }

  // check for overlap
  let overlapFound = false;
  let overlap = {};
  const existingSchedules = await getScheduleByDay(userId, body.day);
  for (let i = 0; i <  existingSchedules.length; i++ ) {
    if (Helper.checkForOverLap({ start_time: body.start_time, end_time: body.end_time }, existingSchedules[i])) {
      overlapFound = true;
      overlap = existingSchedules[i];
      break;
    }
  }
  if (overlapFound) {
    return Helper.badRequestError(`Invalid time range, an overlap exist, between ${overlap.start_time} and ${overlap.end_time}`);
  }
  return await createSchedule(userId, body);
}

exports.updateSchedule = async function (event) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return Helper.badRequestError('Invalid JSON');
  }

  // Validate the presence of required properties
  if (!body.id || !body.start_time || !body.end_time) {
    return Helper.badRequestError('Missing required properties');
  }

  // Validate the types of properties
  if (typeof body.id !== 'number' || typeof body.start_time !== 'string' || typeof body.end_time !== 'string') {
    return Helper.badRequestError('Invalid property types');
  }

  body.start_time = body.start_time.toUpperCase();
  body.end_time = body.end_time.toUpperCase();

  const { isValid, message } = Helper.validateTimeFormatAndRange(body);
  if (!isValid) {
    return Helper.badRequestError(message);
  }

  const schedule = await getScheduleById(userId, body.id);
  if (!schedule) {
    return Helper.badRequestError('Invalid schedule ID');
  }
  // check for possible overlap after update
  let overlapFound = false;
  let overlap = {};
  const existingSchedules = await getScheduleByDay(userId, schedule.day);
  for (let i = 0; i <  existingSchedules.length; i++ ) {
    if (existingSchedules[i].id === body.id) continue;
    if (Helper.checkForOverLap({ start_time: body.start_time, end_time: body.end_time }, existingSchedules[i])) {
      overlapFound = true;
      overlap = existingSchedules[i];
      break;
    }
  }
  if (overlapFound) {
    return Helper.badRequestError(`Invalid time range, update will introduce an overlap, between ${overlap.start_time} and ${overlap.end_time}`);
  }
  await updateSchedule(body.start_time, body.end_time, body.id);
  return {
    statusCode: 200,
    body: JSON.stringify({message: 'update operation successful'}),
  }
}

exports.deleteSchedule = async function (event) {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return Helper.badRequestError('Invalid JSON');
  }

  // Validate the presence of required properties
  if (!body.id) {
    return Helper.badRequestError('Missing required properties');
  }

  const schedule = await getScheduleById(userId, body.id);
  if (!schedule) {
    return Helper.badRequestError('Invalid schedule ID');
  }

  await deleteSchedule(userId, body.id);
  return {
    statusCode: 200,
    body: JSON.stringify({message: 'delete operation successful'}),
  }
}

