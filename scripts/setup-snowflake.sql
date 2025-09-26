-- Snowflake Setup Script for Accessibilify
-- Run this script in your Snowflake account to set up the database schema

-- Create warehouse with auto-suspend for cost optimization
CREATE WAREHOUSE IF NOT EXISTS ACCESSIBILIFY_WH
  WITH WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE
  COMMENT = 'Warehouse for Accessibilify ADA compliance analysis';

-- Create database
CREATE DATABASE IF NOT EXISTS ACCESSIBILIFY
  COMMENT = 'Database for ADA compliance video analysis data';

-- Use the database
USE DATABASE ACCESSIBILIFY;

-- Create schema
CREATE SCHEMA IF NOT EXISTS PUBLIC;
USE SCHEMA PUBLIC;

-- Create analyses table for storing video analysis results
CREATE OR REPLACE TABLE ANALYSES (
  ANALYSIS_ID   STRING PRIMARY KEY,
  VIDEO_ID      STRING NOT NULL,
  TITLE         STRING,
  DURATION_S    NUMBER,
  MOBILITY      NUMBER DEFAULT 0,      -- Mobility accessibility score (0-100)
  VISION        NUMBER DEFAULT 0,      -- Vision accessibility score (0-100)
  HEARING       NUMBER DEFAULT 0,      -- Hearing accessibility score (0-100)
  COGNITION     NUMBER DEFAULT 0,      -- Cognitive accessibility score (0-100)
  TOTAL         NUMBER DEFAULT 0,      -- Overall accessibility score (0-100)
  CREATED_AT    TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
)
COMMENT = 'Main table for ADA compliance analysis results';

-- Create markers table for timeline markers and detected issues
CREATE OR REPLACE TABLE MARKERS (
  ANALYSIS_ID   STRING NOT NULL,
  MARKER_ID     STRING PRIMARY KEY,
  TYPE          STRING,                   -- e.g., 'stairs_no_handrail', 'door_width', 'lighting'
  TS_START_MS   NUMBER,                   -- Start timestamp in milliseconds
  TS_END_MS     NUMBER,                   -- End timestamp in milliseconds
  CONFIDENCE    FLOAT,                    -- AI confidence score (0-1)
  BBOX          VARIANT,                  -- Bounding box [x,y,w,h] normalized 0..1
  TEXT          VARIANT,                  -- OCR text array if applicable
  NOTES         STRING,                   -- Additional notes or description
  CONSTRAINT FK_MARKERS_ANALYSIS FOREIGN KEY (ANALYSIS_ID) REFERENCES ANALYSES(ANALYSIS_ID)
)
COMMENT = 'Timeline markers for detected accessibility issues';

-- Create recommendations table for suggested improvements
CREATE OR REPLACE TABLE RECOMMENDATIONS (
  ANALYSIS_ID   STRING NOT NULL,
  REC_ID        STRING PRIMARY KEY,
  TITLE         STRING,                   -- e.g., "Install handrails on both sides"
  IMPACT        STRING,                   -- 'high' | 'medium' | 'low'
  EFFORT        STRING,                   -- 'high' | 'medium' | 'low'
  POLICY        STRING,                   -- ADA policy reference
  RATIONALE     STRING,                   -- Explanation of why this is needed
  CONSTRAINT FK_RECOMMENDATIONS_ANALYSIS FOREIGN KEY (ANALYSIS_ID) REFERENCES ANALYSES(ANALYSIS_ID)
)
COMMENT = 'Recommended improvements based on detected issues';

-- Create views for reporting
CREATE OR REPLACE VIEW V_ANALYSIS_SUMMARY AS
SELECT
  a.ANALYSIS_ID,
  a.VIDEO_ID,
  a.TITLE,
  a.DURATION_S,
  a.MOBILITY,
  a.VISION,
  a.HEARING,
  a.COGNITION,
  a.TOTAL,
  COUNT(DISTINCT m.MARKER_ID) as ISSUE_COUNT,
  COUNT(DISTINCT r.REC_ID) as RECOMMENDATION_COUNT,
  a.CREATED_AT
FROM ANALYSES a
LEFT JOIN MARKERS m ON a.ANALYSIS_ID = m.ANALYSIS_ID
LEFT JOIN RECOMMENDATIONS r ON a.ANALYSIS_ID = r.ANALYSIS_ID
GROUP BY
  a.ANALYSIS_ID, a.VIDEO_ID, a.TITLE, a.DURATION_S,
  a.MOBILITY, a.VISION, a.HEARING, a.COGNITION, a.TOTAL, a.CREATED_AT;

-- Create view for high-priority issues
CREATE OR REPLACE VIEW V_HIGH_PRIORITY_ISSUES AS
SELECT
  a.TITLE as VIDEO_TITLE,
  m.TYPE as ISSUE_TYPE,
  m.TS_START_MS / 1000.0 as TIME_SECONDS,
  m.CONFIDENCE,
  m.NOTES,
  r.TITLE as RECOMMENDATION,
  r.POLICY as ADA_REFERENCE
FROM ANALYSES a
JOIN MARKERS m ON a.ANALYSIS_ID = m.ANALYSIS_ID
LEFT JOIN RECOMMENDATIONS r ON a.ANALYSIS_ID = r.ANALYSIS_ID
WHERE m.CONFIDENCE > 0.7
  AND r.IMPACT = 'high'
ORDER BY a.CREATED_AT DESC, m.TS_START_MS;

-- Grant permissions (adjust role as needed)
GRANT USAGE ON WAREHOUSE ACCESSIBILIFY_WH TO ROLE PUBLIC;
GRANT USAGE ON DATABASE ACCESSIBILIFY TO ROLE PUBLIC;
GRANT USAGE ON SCHEMA ACCESSIBILIFY.PUBLIC TO ROLE PUBLIC;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA ACCESSIBILIFY.PUBLIC TO ROLE PUBLIC;
GRANT SELECT ON ALL VIEWS IN SCHEMA ACCESSIBILIFY.PUBLIC TO ROLE PUBLIC;

-- Sample query to verify setup
SELECT 'Snowflake setup completed successfully!' as MESSAGE;