const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: '.env.local' });

async function initializeSnowflake() {
  console.log('🚀 Initializing Snowflake schema for Accessibilify...\n');

  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD
  });

  return new Promise((resolve, reject) => {
    connection.connect(async (err, conn) => {
      if (err) {
        console.error('❌ Connection failed:', err.message);
        reject(err);
        return;
      }

      console.log('✅ Connected to Snowflake\n');

      const queries = [
        {
          name: 'Create Warehouse',
          sql: `CREATE WAREHOUSE IF NOT EXISTS ACCESSIBILIFY_WH
                WITH WAREHOUSE_SIZE = 'XSMALL'
                AUTO_SUSPEND = 60
                AUTO_RESUME = TRUE`
        },
        {
          name: 'Use Warehouse',
          sql: `USE WAREHOUSE ACCESSIBILIFY_WH`
        },
        {
          name: 'Create Database',
          sql: `CREATE DATABASE IF NOT EXISTS ACCESSIBILIFY`
        },
        {
          name: 'Use Database',
          sql: `USE DATABASE ACCESSIBILIFY`
        },
        {
          name: 'Create Schema',
          sql: `CREATE SCHEMA IF NOT EXISTS PUBLIC`
        },
        {
          name: 'Use Schema',
          sql: `USE SCHEMA PUBLIC`
        },
        {
          name: 'Create ANALYSES Table',
          sql: `CREATE TABLE IF NOT EXISTS ANALYSES (
                  ANALYSIS_ID   STRING PRIMARY KEY,
                  VIDEO_ID      STRING NOT NULL,
                  TITLE         STRING,
                  DURATION_S    NUMBER,
                  MOBILITY      NUMBER DEFAULT 0,
                  VISION        NUMBER DEFAULT 0,
                  HEARING       NUMBER DEFAULT 0,
                  COGNITION     NUMBER DEFAULT 0,
                  TOTAL         NUMBER DEFAULT 0,
                  CREATED_AT    TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
                )`
        },
        {
          name: 'Create MARKERS Table',
          sql: `CREATE TABLE IF NOT EXISTS MARKERS (
                  ANALYSIS_ID   STRING NOT NULL,
                  MARKER_ID     STRING PRIMARY KEY,
                  TYPE          STRING,
                  TS_START_MS   NUMBER,
                  TS_END_MS     NUMBER,
                  CONFIDENCE    FLOAT,
                  BBOX          VARIANT,
                  TEXT          VARIANT,
                  NOTES         STRING
                )`
        },
        {
          name: 'Create RECOMMENDATIONS Table',
          sql: `CREATE TABLE IF NOT EXISTS RECOMMENDATIONS (
                  ANALYSIS_ID   STRING NOT NULL,
                  REC_ID        STRING PRIMARY KEY,
                  TITLE         STRING,
                  IMPACT        STRING,
                  EFFORT        STRING,
                  POLICY        STRING,
                  RATIONALE     STRING
                )`
        }
      ];

      for (const query of queries) {
        await new Promise((resolve) => {
          console.log(`⏳ ${query.name}...`);
          connection.execute({
            sqlText: query.sql,
            complete: (err, stmt, rows) => {
              if (err) {
                console.error(`❌ Failed: ${err.message}`);
              } else {
                console.log(`✅ ${query.name} - Success`);
              }
              resolve();
            }
          });
        });
      }

      console.log('\n🎉 Snowflake setup completed successfully!');

      connection.destroy(() => {
        console.log('Connection closed.');
        resolve();
      });
    });
  });
}

initializeSnowflake().catch(console.error);