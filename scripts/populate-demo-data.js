#!/usr/bin/env node

const snowflake = require('snowflake-sdk');
require('dotenv').config({ path: '.env.local' });

// Demo data
const demoAnalyses = [
  ['demo-001', 'entrance-video-1', 'Main Entrance Analysis', 120, 65, 78, 90, 85, 79],
  ['demo-002', 'lobby-video-2', 'Lobby Accessibility Check', 90, 45, 82, 88, 90, 76],
  ['demo-003', 'stairwell-video-3', 'Stairwell Compliance Review', 150, 35, 70, 85, 80, 67],
  ['demo-004', 'parking-video-4', 'Parking Area Assessment', 180, 72, 85, 92, 88, 84],
  ['demo-005', 'elevator-video-5', 'Elevator Accessibility Audit', 60, 90, 95, 88, 92, 91],
  ['demo-006', 'restroom-video-6', 'Restroom ADA Compliance', 100, 55, 75, 80, 78, 72],
  ['demo-007', 'ramp-video-7', 'Wheelchair Ramp Analysis', 45, 85, 90, 95, 90, 90],
  ['demo-008', 'signage-video-8', 'Signage and Wayfinding Review', 75, 70, 60, 85, 95, 77]
];

const demoMarkers = [
  ['demo-001', 'mark-001', 'missing_handrail', 15000, 18000, 0.92, '[0.3, 0.4, 0.2, 0.3]', null, 'Stairs without handrails detected'],
  ['demo-001', 'mark-002', 'narrow_doorway', 45000, 47000, 0.85, '[0.5, 0.2, 0.15, 0.6]', null, 'Door width below 32 inches'],
  ['demo-002', 'mark-003', 'poor_lighting', 10000, 15000, 0.78, null, null, 'Insufficient lighting in hallway'],
  ['demo-002', 'mark-004', 'obstacle_in_path', 30000, 32000, 0.88, '[0.4, 0.5, 0.1, 0.2]', null, 'Furniture blocking accessible route'],
  ['demo-003', 'mark-005', 'no_ramp', 5000, 8000, 0.95, '[0.1, 0.7, 0.3, 0.2]', null, 'No wheelchair ramp available'],
  ['demo-003', 'mark-006', 'steep_slope', 25000, 28000, 0.82, '[0.2, 0.6, 0.4, 0.3]', null, 'Ramp gradient exceeds 1:12 ratio'],
  ['demo-004', 'mark-007', 'no_accessible_parking', 0, 5000, 0.91, '[0.0, 0.0, 1.0, 0.5]', null, 'No designated accessible parking spaces'],
  ['demo-005', 'mark-008', 'elevator_controls_high', 15000, 17000, 0.76, '[0.7, 0.3, 0.1, 0.3]', null, 'Call buttons above 48 inch height'],
  ['demo-006', 'mark-009', 'door_hardware', 20000, 22000, 0.83, '[0.6, 0.4, 0.05, 0.15]', null, 'Non-compliant door handles'],
  ['demo-007', 'mark-010', 'missing_edge_protection', 10000, 12000, 0.89, '[0.15, 0.8, 0.7, 0.1]', null, 'Ramp lacks edge protection'],
  ['demo-008', 'mark-011', 'no_braille', 5000, 7000, 0.94, '[0.55, 0.25, 0.2, 0.3]', null, 'Signage missing Braille text']
];

const demoRecommendations = [
  ['demo-001', 'rec-001', 'Install handrails on both sides of stairs', 'high', 'low', 'ADA 505.2', 'Required for safe navigation'],
  ['demo-001', 'rec-002', 'Widen doorway to 32 inch minimum', 'high', 'high', 'ADA 404.2.3', 'Essential for wheelchair access'],
  ['demo-002', 'rec-003', 'Upgrade lighting to meet standards', 'medium', 'low', 'ANSI A117.1', 'Improves visibility and safety'],
  ['demo-002', 'rec-004', 'Relocate furniture from pathway', 'high', 'low', 'ADA 403.5', 'Clear 36 inch pathway required'],
  ['demo-003', 'rec-005', 'Install wheelchair ramp with proper slope', 'high', 'medium', 'ADA 405.2', 'Provides accessible route'],
  ['demo-004', 'rec-006', 'Create accessible parking spaces', 'high', 'medium', 'ADA 502', 'Required by law for parking facilities'],
  ['demo-005', 'rec-007', 'Lower elevator controls', 'medium', 'low', 'ADA 407.4.6', 'Controls must be 15-48 inches high'],
  ['demo-006', 'rec-008', 'Install lever handles on doors', 'medium', 'low', 'ADA 404.2.7', 'Easier operation for all users'],
  ['demo-007', 'rec-009', 'Add edge protection to ramp', 'high', 'low', 'ADA 405.9', 'Prevents wheelchairs from slipping off'],
  ['demo-008', 'rec-010', 'Add Braille to all signage', 'high', 'low', 'ADA 703.2', 'Required for vision accessibility']
];

async function populateDemoData() {
  console.log('🚀 Populating Snowflake with demo data...\n');

  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'ACCESSIBILIFY_WH',
    database: process.env.SNOWFLAKE_DATABASE || 'ACCESSIBILIFY',
    schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
    role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN'
  });

  return new Promise((resolve, reject) => {
    connection.connect(async (err, conn) => {
      if (err) {
        console.error('❌ Connection failed:', err.message);
        console.log('\n💡 Tip: Make sure you have run the setup script in Snowflake first');
        reject(err);
        return;
      }

      console.log('✅ Connected to Snowflake\n');

      // Clear existing demo data
      console.log('🧹 Clearing existing demo data...');
      await executeQuery(connection,
        "DELETE FROM MARKERS WHERE ANALYSIS_ID LIKE 'demo-%'"
      );
      await executeQuery(connection,
        "DELETE FROM RECOMMENDATIONS WHERE ANALYSIS_ID LIKE 'demo-%'"
      );
      await executeQuery(connection,
        "DELETE FROM ANALYSES WHERE ANALYSIS_ID LIKE 'demo-%'"
      );

      // Insert analyses
      console.log('📊 Inserting analyses...');
      for (const analysis of demoAnalyses) {
        const sql = `
          INSERT INTO ANALYSES (ANALYSIS_ID, VIDEO_ID, TITLE, DURATION_S,
                               MOBILITY, VISION, HEARING, COGNITION, TOTAL, CREATED_AT)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
        `;
        await executeQuery(connection, sql, analysis);
      }
      console.log(`   ✓ Inserted ${demoAnalyses.length} analyses`);

      // Insert markers
      console.log('🎯 Inserting violation markers...');
      for (const marker of demoMarkers) {
        const sql = `
          INSERT INTO MARKERS (ANALYSIS_ID, MARKER_ID, TYPE, TS_START_MS, TS_END_MS,
                              CONFIDENCE, BBOX, TEXT, NOTES)
          VALUES (?, ?, ?, ?, ?, ?, ${marker[6] ? `PARSE_JSON('${marker[6]}')` : 'NULL'},
                  ${marker[7] ? `PARSE_JSON('${marker[7]}')` : 'NULL'}, ?)
        `;
        const params = [...marker.slice(0, 6), marker[8]];
        await executeQuery(connection, sql, params);
      }
      console.log(`   ✓ Inserted ${demoMarkers.length} markers`);

      // Insert recommendations
      console.log('💡 Inserting recommendations...');
      for (const rec of demoRecommendations) {
        const sql = `
          INSERT INTO RECOMMENDATIONS (ANALYSIS_ID, REC_ID, TITLE, IMPACT, EFFORT, POLICY, RATIONALE)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await executeQuery(connection, sql, rec);
      }
      console.log(`   ✓ Inserted ${demoRecommendations.length} recommendations`);

      // Show summary
      console.log('\n📈 Verifying data...');
      const summary = await executeQuery(connection, `
        SELECT
          (SELECT COUNT(*) FROM ANALYSES WHERE ANALYSIS_ID LIKE 'demo-%') as analyses,
          (SELECT COUNT(*) FROM MARKERS WHERE ANALYSIS_ID LIKE 'demo-%') as markers,
          (SELECT COUNT(*) FROM RECOMMENDATIONS WHERE ANALYSIS_ID LIKE 'demo-%') as recommendations
      `);

      console.log('\n✅ Demo data successfully populated!');
      console.log('   Analyses:', summary[0].ANALYSES);
      console.log('   Markers:', summary[0].MARKERS);
      console.log('   Recommendations:', summary[0].RECOMMENDATIONS);

      // Show sample query
      console.log('\n🎯 Try this query in Snowflake:');
      console.log(`
SELECT
    'Total Buildings' as METRIC, COUNT(DISTINCT VIDEO_ID) as VALUE
FROM ANALYSES WHERE ANALYSIS_ID LIKE 'demo-%'
UNION ALL
SELECT 'Violations Found', COUNT(*) FROM MARKERS WHERE ANALYSIS_ID LIKE 'demo-%'
UNION ALL
SELECT 'Avg Compliance', ROUND(AVG(TOTAL)) FROM ANALYSES WHERE ANALYSIS_ID LIKE 'demo-%';
      `);

      connection.destroy(() => {
        console.log('\n👋 Connection closed');
        resolve();
      });
    });
  });
}

function executeQuery(connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      binds: params,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Query error:', err.message);
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    });
  });
}

// Run the script
populateDemoData()
  .then(() => {
    console.log('\n🎉 Success! Your Snowflake database is ready for the demo.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check your .env.local file has correct Snowflake credentials');
    console.log('2. Ensure the ACCESSIBILIFY_WH warehouse exists');
    console.log('3. Verify the ACCESSIBILIFY database and tables are created');
    console.log('4. Run the setup-snowflake.sql script first if needed');
    process.exit(1);
  });