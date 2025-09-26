const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: '.env.local' });

console.log('Testing Snowflake connection with your credentials...');
console.log('Account:', process.env.SNOWFLAKE_ACCOUNT);

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  // Don't specify warehouse/database initially
});

connection.connect((err, conn) => {
  if (err) {
    console.error('❌ Unable to connect:', err.message);
    process.exit(1);
  }

  console.log('✅ Successfully connected!');
  console.log('Connection ID:', conn.getId());

  // Try a simple query
  connection.execute({
    sqlText: 'SELECT CURRENT_USER(), CURRENT_ROLE(), CURRENT_VERSION()',
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Query failed:', err.message);
      } else if (rows && rows.length > 0) {
        console.log('\n📊 Connection Details:');
        console.log('User:', rows[0]['CURRENT_USER()']);
        console.log('Role:', rows[0]['CURRENT_ROLE()']);
        console.log('Version:', rows[0]['CURRENT_VERSION()']);
      }

      // Close connection
      connection.destroy(() => {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
      });
    }
  });
});