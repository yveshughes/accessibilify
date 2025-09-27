#!/bin/bash

# Load environment variables
source .env.local

# Snowflake SQL API endpoint
ACCOUNT="awb80672.us-west-2.aws"
API_URL="https://${ACCOUNT}.snowflakecomputing.com/api/v2/statements"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Populating Snowflake with demo data via SQL API${NC}\n"

# SQL queries to execute
QUERIES=(
"CREATE WAREHOUSE IF NOT EXISTS ACCESSIBILIFY_WH WITH WAREHOUSE_SIZE = 'XSMALL' AUTO_SUSPEND = 60 AUTO_RESUME = TRUE"

"CREATE DATABASE IF NOT EXISTS ACCESSIBILIFY"

"USE DATABASE ACCESSIBILIFY"

"CREATE SCHEMA IF NOT EXISTS PUBLIC"

"USE SCHEMA PUBLIC"

"CREATE TABLE IF NOT EXISTS ANALYSES (
  ANALYSIS_ID STRING PRIMARY KEY,
  VIDEO_ID STRING NOT NULL,
  TITLE STRING,
  DURATION_S NUMBER,
  MOBILITY NUMBER DEFAULT 0,
  VISION NUMBER DEFAULT 0,
  HEARING NUMBER DEFAULT 0,
  COGNITION NUMBER DEFAULT 0,
  TOTAL NUMBER DEFAULT 0,
  CREATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
)"

"CREATE TABLE IF NOT EXISTS MARKERS (
  ANALYSIS_ID STRING NOT NULL,
  MARKER_ID STRING PRIMARY KEY,
  TYPE STRING,
  TS_START_MS NUMBER,
  TS_END_MS NUMBER,
  CONFIDENCE FLOAT,
  BBOX VARIANT,
  TEXT VARIANT,
  NOTES STRING
)"

"CREATE TABLE IF NOT EXISTS RECOMMENDATIONS (
  ANALYSIS_ID STRING NOT NULL,
  REC_ID STRING PRIMARY KEY,
  TITLE STRING,
  IMPACT STRING,
  EFFORT STRING,
  POLICY STRING,
  RATIONALE STRING
)"

"DELETE FROM MARKERS WHERE ANALYSIS_ID LIKE 'demo-%'"
"DELETE FROM RECOMMENDATIONS WHERE ANALYSIS_ID LIKE 'demo-%'"
"DELETE FROM ANALYSES WHERE ANALYSIS_ID LIKE 'demo-%'"

"INSERT INTO ANALYSES VALUES
('demo-001', 'entrance-video-1', 'Main Entrance Analysis', 120, 65, 78, 90, 85, 79, CURRENT_TIMESTAMP()),
('demo-002', 'lobby-video-2', 'Lobby Accessibility Check', 90, 45, 82, 88, 90, 76, CURRENT_TIMESTAMP()),
('demo-003', 'stairwell-video-3', 'Stairwell Compliance Review', 150, 35, 70, 85, 80, 67, CURRENT_TIMESTAMP()),
('demo-004', 'parking-video-4', 'Parking Area Assessment', 180, 72, 85, 92, 88, 84, CURRENT_TIMESTAMP()),
('demo-005', 'elevator-video-5', 'Elevator Accessibility Audit', 60, 90, 95, 88, 92, 91, CURRENT_TIMESTAMP()),
('demo-006', 'restroom-video-6', 'Restroom ADA Compliance', 100, 55, 75, 80, 78, 72, CURRENT_TIMESTAMP()),
('demo-007', 'ramp-video-7', 'Wheelchair Ramp Analysis', 45, 85, 90, 95, 90, 90, CURRENT_TIMESTAMP()),
('demo-008', 'signage-video-8', 'Signage and Wayfinding Review', 75, 70, 60, 85, 95, 77, CURRENT_TIMESTAMP())"

"INSERT INTO MARKERS VALUES
('demo-001', 'mark-001', 'missing_handrail', 15000, 18000, 0.92, PARSE_JSON('[0.3, 0.4, 0.2, 0.3]'), NULL, 'Stairs without handrails detected'),
('demo-001', 'mark-002', 'narrow_doorway', 45000, 47000, 0.85, PARSE_JSON('[0.5, 0.2, 0.15, 0.6]'), NULL, 'Door width below 32 inches'),
('demo-002', 'mark-003', 'poor_lighting', 10000, 15000, 0.78, NULL, NULL, 'Insufficient lighting in hallway'),
('demo-002', 'mark-004', 'obstacle_in_path', 30000, 32000, 0.88, PARSE_JSON('[0.4, 0.5, 0.1, 0.2]'), NULL, 'Furniture blocking accessible route'),
('demo-003', 'mark-005', 'no_ramp', 5000, 8000, 0.95, PARSE_JSON('[0.1, 0.7, 0.3, 0.2]'), NULL, 'No wheelchair ramp available'),
('demo-003', 'mark-006', 'steep_slope', 25000, 28000, 0.82, PARSE_JSON('[0.2, 0.6, 0.4, 0.3]'), NULL, 'Ramp gradient exceeds 1:12 ratio'),
('demo-004', 'mark-007', 'no_accessible_parking', 0, 5000, 0.91, PARSE_JSON('[0.0, 0.0, 1.0, 0.5]'), NULL, 'No designated accessible parking spaces'),
('demo-005', 'mark-008', 'elevator_controls_high', 15000, 17000, 0.76, PARSE_JSON('[0.7, 0.3, 0.1, 0.3]'), NULL, 'Call buttons above 48 inch height'),
('demo-006', 'mark-009', 'door_hardware', 20000, 22000, 0.83, PARSE_JSON('[0.6, 0.4, 0.05, 0.15]'), NULL, 'Non-compliant door handles'),
('demo-007', 'mark-010', 'missing_edge_protection', 10000, 12000, 0.89, PARSE_JSON('[0.15, 0.8, 0.7, 0.1]'), NULL, 'Ramp lacks edge protection'),
('demo-008', 'mark-011', 'no_braille', 5000, 7000, 0.94, PARSE_JSON('[0.55, 0.25, 0.2, 0.3]'), NULL, 'Signage missing Braille text')"

"INSERT INTO RECOMMENDATIONS VALUES
('demo-001', 'rec-001', 'Install handrails on both sides of stairs', 'high', 'low', 'ADA 505.2', 'Required for safe navigation'),
('demo-001', 'rec-002', 'Widen doorway to 32 inch minimum', 'high', 'high', 'ADA 404.2.3', 'Essential for wheelchair access'),
('demo-002', 'rec-003', 'Upgrade lighting to meet standards', 'medium', 'low', 'ANSI A117.1', 'Improves visibility and safety'),
('demo-002', 'rec-004', 'Relocate furniture from pathway', 'high', 'low', 'ADA 403.5', 'Clear 36 inch pathway required'),
('demo-003', 'rec-005', 'Install wheelchair ramp with proper slope', 'high', 'medium', 'ADA 405.2', 'Provides accessible route'),
('demo-004', 'rec-006', 'Create accessible parking spaces', 'high', 'medium', 'ADA 502', 'Required by law for parking facilities'),
('demo-005', 'rec-007', 'Lower elevator controls', 'medium', 'low', 'ADA 407.4.6', 'Controls must be 15-48 inches high'),
('demo-006', 'rec-008', 'Install lever handles on doors', 'medium', 'low', 'ADA 404.2.7', 'Easier operation for all users'),
('demo-007', 'rec-009', 'Add edge protection to ramp', 'high', 'low', 'ADA 405.9', 'Prevents wheelchairs from slipping off'),
('demo-008', 'rec-010', 'Add Braille to all signage', 'high', 'low', 'ADA 703.2', 'Required for vision accessibility')"
)

echo -e "${YELLOW}📝 Instructions:${NC}"
echo -e "Since the Node.js SDK is hanging, please run these queries directly in Snowflake:"
echo -e "1. Go to https://app.snowflake.com"
echo -e "2. Run each query below in the worksheet:\n"

# Output all queries for manual execution
for i in "${!QUERIES[@]}"; do
  echo -e "${GREEN}-- Query $((i+1))${NC}"
  echo "${QUERIES[$i]};"
  echo ""
done

echo -e "${GREEN}✅ Copy and paste these queries into Snowflake to populate demo data!${NC}"
echo -e "${YELLOW}💡 Alternatively, run this query to verify the setup:${NC}\n"

cat << 'EOF'
-- Executive Summary Query
SELECT
    'Total Buildings' as METRIC, COUNT(DISTINCT VIDEO_ID) as VALUE
FROM ACCESSIBILIFY.PUBLIC.ANALYSES
WHERE ANALYSIS_ID LIKE 'demo-%'
UNION ALL
SELECT 'Violations Found', COUNT(*)
FROM ACCESSIBILIFY.PUBLIC.MARKERS
WHERE ANALYSIS_ID LIKE 'demo-%'
UNION ALL
SELECT 'Avg Compliance', ROUND(AVG(TOTAL))
FROM ACCESSIBILIFY.PUBLIC.ANALYSES
WHERE ANALYSIS_ID LIKE 'demo-%'
UNION ALL
SELECT 'High Priority Fixes', COUNT(*)
FROM ACCESSIBILIFY.PUBLIC.RECOMMENDATIONS
WHERE ANALYSIS_ID LIKE 'demo-%' AND IMPACT = 'high';
EOF