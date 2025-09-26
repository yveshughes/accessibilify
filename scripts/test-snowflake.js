const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: '.env.local' });

// Test Snowflake connection
async function testConnection() {
  console.log('Testing Snowflake connection...');
  console.log('Account:', process.env.SNOWFLAKE_ACCOUNT);
  console.log('Username:', process.env.SNOWFLAKE_USERNAME);
  console.log('Warehouse:', process.env.SNOWFLAKE_WAREHOUSE);
  console.log('Database:', process.env.SNOWFLAKE_DATABASE);

  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    role: process.env.SNOWFLAKE_ROLE
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) {
        console.error('❌ Unable to connect:', err.message);
        reject(err);
      } else {
        console.log('✅ Successfully connected to Snowflake!');
        console.log('Connection ID:', conn.getId());

        // Test query
        connection.execute({
          sqlText: 'SELECT CURRENT_VERSION() as VERSION, CURRENT_WAREHOUSE() as WAREHOUSE, CURRENT_DATABASE() as DATABASE',
          complete: (err, stmt, rows) => {
            if (err) {
              console.error('Query error:', err);
            } else {
              console.log('Snowflake Version:', rows[0].VERSION);
              console.log('Current Warehouse:', rows[0].WAREHOUSE);
              console.log('Current Database:', rows[0].DATABASE);
            }
            connection.destroy(() => {
              console.log('Connection closed.');
              resolve();
            });
          }
        });
      }
    });
  });
}

testConnection().catch(console.error);