const SDK = require('aws-sdk');
const RDS = new SDK.RDSDataService();

const DBSecretsStoreArn = process.env.DB_SECRETS_STORE_ARN;
const DBAuroraClusterArn = process.env.DB_AURORA_CLUSTER_ARN;
const DatabaseName = process.env.DATABASE_NAME;

const params = {
  secretArn: DBSecretsStoreArn,
  resourceArn: DBAuroraClusterArn,
  database: DatabaseName
}

exports.seed = async function (event) {
  const sql = `
    CREATE TABLE IF NOT EXISTS schedule (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      day VARCHAR(20) CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
      start_time VARCHAR(8) NOT NULL,
      end_time VARCHAR(8) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_user_id ON schedule (user_id);
  `;
  
  try {
    await RDS.executeStatement({...params, sql}).promise();
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Hello! Seed process completed.`
    }
  } catch (error) {
      console.log(error)
    return error
  }
}

exports.createSchedule = async function (userId, schedule) {
  const { day, start_time, end_time } = schedule;
  const sql = `
    INSERT INTO schedule (user_id, day, start_time, end_time)
    VALUES ('${userId}', '${day}', '${start_time}', '${end_time}');
  `
  try {
    await RDS.executeStatement({...params, sql}).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hurray! schedule created'}),
    }
  } catch (error) {
      console.log(error)
    return error
  }
}

exports.getSchedules = async function (userId) {
  const sql = `
    SELECT * FROM schedule 
    WHERE user_id = '${userId}';
  `
  try {
    const data = await RDS.executeStatement({...params, sql}).promise();
    const itemCount = data?.records?.length;
    
    let schedule = {};

    if (itemCount && itemCount > 0) {
      
      for (const item of data.records) {
        const [ 
          { longValue: id },
          { stringValue: user_id },
          { stringValue: day },
          { stringValue: start_time },
          { stringValue: end_time }
        ] = item;

        if (!(day in schedule)) {
          schedule[day] = [];
        } 
        schedule[day].push({id, start_time, end_time});
      }
      
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ userId, schedule }),
    }
  } catch (error) {
      console.log(error)
    return error
  }
}

exports.getScheduleByDay = async function (userId, day) {
  const sql = `
    SELECT * FROM schedule 
    WHERE user_id = '${userId}'
    AND day = '${day}';
  `
  try {
    const data = await RDS.executeStatement({...params, sql}).promise();
    const itemCount = data?.records?.length;
    
    let schedule = [];

    if (itemCount && itemCount > 0) {
      
      for (const item of data.records) {
        const [ 
          { longValue: id },
          { stringValue: user_id },
          { stringValue: day },
          { stringValue: start_time },
          { stringValue: end_time }
        ] = item;

        schedule.push({id, start_time, end_time});
      }
      
    }

    return schedule;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

exports.getScheduleById = async function (userId, id) {
  const sql = `
    SELECT * FROM schedule 
    WHERE id = '${id}'
    AND user_id = '${userId}';
  `
  try {
    const data = await RDS.executeStatement({...params, sql}).promise();
    const itemCount = data?.records?.length;
    
    let schedule = null;

    if (itemCount && itemCount > 0) {
      
      for (const item of data.records) {
        const [ 
          { longValue: id },
          { stringValue: user_id },
          { stringValue: day },
          { stringValue: start_time },
          { stringValue: end_time }
        ] = item;

        schedule = {id, start_time, end_time, day};
      }
      
    }

    return schedule;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

exports.updateSchedule = async function (start_time, end_time, id) {
  const sql = `
    UPDATE schedule
    SET start_time = '${start_time}',
    end_time = '${end_time}'
    WHERE id = '${id}';
  `
  try {
    await RDS.executeStatement({...params, sql}).promise();
  } catch (error) {
    console.log(error)
    throw error;
  }
}

exports.deleteSchedule = async function (userId, id) {
  const sql = `
    DELETE FROM schedule
    WHERE id = '${id}'
    AND user_id = '${userId}';
  `
  try {
    await RDS.executeStatement({...params, sql}).promise();
  } catch (error) {
    console.log(error)
    throw error;
  }
}