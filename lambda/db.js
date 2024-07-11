exports.seed = async function (event) {
  const sqlStatement = `
    CREATE TABLE IF NOT EXISTS schedule (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      day VARCHAR(20) CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
      start_time VARCHAR(8) NOT NULL,
      end_time VARCHAR(8) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_user_id ON schedule (user_id);
  `;

  const DBSecretsStoreArn = process.env.DB_SECRETS_STORE_ARN;
  const DBAuroraClusterArn = process.env.DB_AURORA_CLUSTER_ARN;
  const DatabaseName = process.env.DATABASE_NAME;

  const params = {
    secretArn: DBSecretsStoreArn,
    resourceArn: DBAuroraClusterArn,
    sql: sqlStatement,
    database: DatabaseName
  }
  try {
    await RDS.executeStatement(params).promise();
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