-- =====================================================
-- ACCESSIBILIFY DEMO QUERIES FOR HACKATHON
-- =====================================================

-- 1. SHOW REAL-TIME ANALYSIS DATA
-- Display the latest ADA compliance analyses
SELECT
    ANALYSIS_ID,
    VIDEO_ID,
    TITLE,
    DURATION_S as DURATION_SECONDS,
    MOBILITY as MOBILITY_SCORE,
    VISION as VISION_SCORE,
    HEARING as HEARING_SCORE,
    COGNITION as COGNITION_SCORE,
    TOTAL as OVERALL_SCORE,
    CREATED_AT
FROM ACCESSIBILIFY.PUBLIC.ANALYSES
ORDER BY CREATED_AT DESC
LIMIT 10;

-- 2. SHOW DETECTED VIOLATIONS
-- Display specific ADA violations found in videos
SELECT
    m.TYPE as VIOLATION_TYPE,
    m.TS_START_MS / 1000.0 as TIME_IN_VIDEO,
    m.CONFIDENCE as AI_CONFIDENCE,
    m.NOTES as DESCRIPTION,
    a.TITLE as VIDEO_NAME
FROM ACCESSIBILIFY.PUBLIC.MARKERS m
JOIN ACCESSIBILIFY.PUBLIC.ANALYSES a ON m.ANALYSIS_ID = a.ANALYSIS_ID
WHERE m.CONFIDENCE > 0.7
ORDER BY m.TS_START_MS;

-- 3. AGGREGATE COMPLIANCE METRICS
-- Show average compliance scores across all analyses
SELECT
    COUNT(DISTINCT ANALYSIS_ID) as TOTAL_ANALYSES,
    AVG(MOBILITY) as AVG_MOBILITY_SCORE,
    AVG(VISION) as AVG_VISION_SCORE,
    AVG(HEARING) as AVG_HEARING_SCORE,
    AVG(TOTAL) as AVG_OVERALL_SCORE,
    MIN(TOTAL) as WORST_SCORE,
    MAX(TOTAL) as BEST_SCORE
FROM ACCESSIBILIFY.PUBLIC.ANALYSES;

-- 4. TOP VIOLATIONS DASHBOARD
-- Most common accessibility issues detected
SELECT
    TYPE as ISSUE_TYPE,
    COUNT(*) as OCCURRENCE_COUNT,
    AVG(CONFIDENCE) as AVG_CONFIDENCE,
    COUNT(DISTINCT ANALYSIS_ID) as VIDEOS_AFFECTED
FROM ACCESSIBILIFY.PUBLIC.MARKERS
GROUP BY TYPE
ORDER BY OCCURRENCE_COUNT DESC
LIMIT 10;

-- 5. RECOMMENDATIONS IMPACT MATRIX
-- Show high-impact, low-effort improvements
SELECT
    r.TITLE as RECOMMENDATION,
    r.IMPACT,
    r.EFFORT,
    r.POLICY as ADA_REFERENCE,
    COUNT(DISTINCT r.ANALYSIS_ID) as BUILDINGS_AFFECTED
FROM ACCESSIBILIFY.PUBLIC.RECOMMENDATIONS r
WHERE r.IMPACT = 'high' AND r.EFFORT IN ('low', 'medium')
GROUP BY r.TITLE, r.IMPACT, r.EFFORT, r.POLICY
ORDER BY BUILDINGS_AFFECTED DESC;

-- 6. TIME-SERIES ANALYSIS
-- Show compliance trends over time
SELECT
    DATE_TRUNC('hour', CREATED_AT) as ANALYSIS_HOUR,
    COUNT(*) as ANALYSES_COUNT,
    AVG(TOTAL) as AVG_COMPLIANCE_SCORE
FROM ACCESSIBILIFY.PUBLIC.ANALYSES
GROUP BY ANALYSIS_HOUR
ORDER BY ANALYSIS_HOUR DESC;

-- 7. CRITICAL VIOLATIONS ALERT
-- Identify videos with critical ADA violations
SELECT
    a.TITLE,
    a.VIDEO_ID,
    COUNT(m.MARKER_ID) as VIOLATION_COUNT,
    a.TOTAL as COMPLIANCE_SCORE,
    STRING_AGG(DISTINCT m.TYPE, ', ') as VIOLATION_TYPES
FROM ACCESSIBILIFY.PUBLIC.ANALYSES a
JOIN ACCESSIBILIFY.PUBLIC.MARKERS m ON a.ANALYSIS_ID = m.ANALYSIS_ID
WHERE a.TOTAL < 70  -- Poor compliance threshold
GROUP BY a.TITLE, a.VIDEO_ID, a.TOTAL
ORDER BY a.TOTAL ASC;

-- 8. SAMPLE DATA INSERT (for demo purposes)
-- Run this to populate sample data if needed
INSERT INTO ACCESSIBILIFY.PUBLIC.ANALYSES
VALUES
    ('demo-001', 'entrance-video-1', 'Main Entrance Analysis', 120, 65, 78, 90, 85, 79, CURRENT_TIMESTAMP()),
    ('demo-002', 'lobby-video-2', 'Lobby Accessibility Check', 90, 45, 82, 88, 90, 76, CURRENT_TIMESTAMP()),
    ('demo-003', 'stairwell-video-3', 'Stairwell Compliance Review', 150, 35, 70, 85, 80, 67, CURRENT_TIMESTAMP());

INSERT INTO ACCESSIBILIFY.PUBLIC.MARKERS
VALUES
    ('demo-001', 'mark-001', 'missing_handrail', 15000, 18000, 0.92, PARSE_JSON('[0.3, 0.4, 0.2, 0.3]'), NULL, 'Stairs without handrails detected'),
    ('demo-001', 'mark-002', 'narrow_doorway', 45000, 47000, 0.85, PARSE_JSON('[0.5, 0.2, 0.15, 0.6]'), NULL, 'Door width below 32 inches'),
    ('demo-002', 'mark-003', 'poor_lighting', 10000, 15000, 0.78, NULL, NULL, 'Insufficient lighting in hallway'),
    ('demo-003', 'mark-004', 'no_ramp', 5000, 8000, 0.95, PARSE_JSON('[0.1, 0.7, 0.3, 0.2]'), NULL, 'No wheelchair ramp available');

INSERT INTO ACCESSIBILIFY.PUBLIC.RECOMMENDATIONS
VALUES
    ('demo-001', 'rec-001', 'Install handrails on both sides of stairs', 'high', 'low', 'ADA 505.2', 'Required for safe navigation'),
    ('demo-001', 'rec-002', 'Widen doorway to 32 inch minimum', 'high', 'high', 'ADA 404.2.3', 'Essential for wheelchair access'),
    ('demo-002', 'rec-003', 'Upgrade lighting to meet standards', 'medium', 'low', 'ANSI A117.1', 'Improves visibility and safety'),
    ('demo-003', 'rec-004', 'Install wheelchair ramp with 1:12 slope', 'high', 'medium', 'ADA 405.2', 'Provides accessible route');

-- 9. DASHBOARD VIEW - EXECUTIVE SUMMARY
SELECT
    'Total Buildings Analyzed' as METRIC,
    COUNT(DISTINCT VIDEO_ID) as VALUE
FROM ACCESSIBILIFY.PUBLIC.ANALYSES
UNION ALL
SELECT
    'Total Violations Detected',
    COUNT(*)
FROM ACCESSIBILIFY.PUBLIC.MARKERS
UNION ALL
SELECT
    'Average Compliance Score',
    ROUND(AVG(TOTAL))
FROM ACCESSIBILIFY.PUBLIC.ANALYSES
UNION ALL
SELECT
    'High Priority Fixes',
    COUNT(*)
FROM ACCESSIBILIFY.PUBLIC.RECOMMENDATIONS
WHERE IMPACT = 'high';

-- 10. COST-BENEFIT ANALYSIS
-- Show ROI of accessibility improvements
WITH violation_costs AS (
    SELECT
        r.TITLE,
        r.IMPACT,
        r.EFFORT,
        CASE
            WHEN r.EFFORT = 'low' THEN 1000
            WHEN r.EFFORT = 'medium' THEN 5000
            WHEN r.EFFORT = 'high' THEN 20000
        END as ESTIMATED_COST,
        CASE
            WHEN r.IMPACT = 'high' THEN 50000  -- Potential lawsuit avoidance
            WHEN r.IMPACT = 'medium' THEN 20000
            WHEN r.IMPACT = 'low' THEN 5000
        END as RISK_MITIGATION_VALUE
    FROM ACCESSIBILIFY.PUBLIC.RECOMMENDATIONS r
)
SELECT
    TITLE as IMPROVEMENT,
    IMPACT,
    EFFORT,
    ESTIMATED_COST,
    RISK_MITIGATION_VALUE,
    (RISK_MITIGATION_VALUE - ESTIMATED_COST) as NET_BENEFIT,
    ROUND((RISK_MITIGATION_VALUE::FLOAT / ESTIMATED_COST) * 100) as ROI_PERCENTAGE
FROM violation_costs
ORDER BY NET_BENEFIT DESC;