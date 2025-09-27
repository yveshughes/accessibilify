# Answer to Judge's Question: Snowflake Model and Determinism

## Short Answer
**We are NOT using any ML models within Snowflake itself.** Snowflake serves purely as our **data warehouse** for storing structured analysis results. The AI/ML processing happens entirely in **AWS Rekognition** before data reaches Snowflake. All data stored in Snowflake is **100% deterministic** - it's historical analysis results, not predictions.

## Detailed Explanation

### What We Use Snowflake For:
1. **Data Storage Only** - Snowflake is our cloud data warehouse
2. **Structured Tables** - We store analyses, markers, and recommendations
3. **SQL Analytics** - Traditional SQL queries for reporting and dashboards
4. **No ML Models** - Zero machine learning happens within Snowflake

### Where the AI/ML Actually Happens:
```
AWS Rekognition (Computer Vision AI)
         ↓
   Detects objects, labels, text
         ↓
   Returns confidence scores
         ↓
We process and structure this data
         ↓
   Store results in Snowflake
```

### Why Our Snowflake Data IS Deterministic:

1. **Historical Records**: Every row represents a completed analysis
   - Analysis ID: `uuid-12345`
   - Timestamp: `2025-01-26 14:30:00`
   - Violation Found: `Missing handrail`
   - Confidence: `92%`

2. **No Predictions in Snowflake**:
   - We don't run predictive models in Snowflake
   - We don't use Snowflake ML functions
   - We don't generate forecasts

3. **Immutable Data**:
   - Once stored, analysis results don't change
   - Same query always returns same results
   - Perfect for compliance documentation

### The Non-Deterministic Part (AWS Rekognition):
- **AWS Rekognition** uses deep learning models (non-deterministic)
- Same video analyzed twice might have slight variations (±2-3% confidence)
- But once results are stored in Snowflake, they're fixed forever

### Architecture Diagram:
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Video Upload   │────▶│ AWS Rekognition  │────▶│   Snowflake     │
│  (Frontend)     │     │  (AI Analysis)   │     │ (Data Storage)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              ↑                           ↑
                              │                           │
                     NON-DETERMINISTIC              DETERMINISTIC
                      (ML Processing)              (Fixed Records)
```

## Key Points for Judge:

1. **Snowflake = Database, Not AI**
   - Think of it like PostgreSQL or MySQL in the cloud
   - We use it for storage and SQL queries only

2. **Deterministic Queries**:
   ```sql
   SELECT COUNT(*) FROM MARKERS
   WHERE TYPE = 'missing_handrail'
   AND CONFIDENCE > 90
   -- Always returns the same count
   ```

3. **AI Happens Before Snowflake**:
   - AWS Rekognition does the "smart" analysis
   - We store the results (deterministic data)
   - Snowflake never "thinks" or "predicts"

4. **Audit Trail Benefits**:
   - Every analysis is timestamped and immutable
   - Perfect for legal compliance documentation
   - Can prove what was detected and when

## Common Misconception:
Judges often hear "Snowflake" and think of **Snowflake Cortex** (their ML platform) or **Snowpark ML**. We use **neither**. We use Snowflake purely as a cloud SQL database for structured data storage.

## In Legal Terms:
- **Evidence**: Our Snowflake data is like a filing cabinet of completed reports
- **Not Speculation**: We don't use Snowflake to predict future violations
- **Reproducible**: Same SQL query = same results every time
- **Admissible**: Historical records with timestamps and confidence scores

## The Bottom Line:
**Snowflake in our system = Deterministic data storage**
**AWS Rekognition = Non-deterministic AI analysis** (but happens before storage)

Once data enters Snowflake, it's frozen in time - completely deterministic and legally defensible.