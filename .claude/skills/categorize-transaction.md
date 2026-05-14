# Skill: categorize-transaction

## Owner
Python ML Service (FastAPI)

## Input
```typescript
{ merchant: string, description: string, amount: number }
```

## Output
```typescript
{ category_name: string, category_id: string, confidence: number }
```

## Behavior
- Falls back to "Other" if confidence < 0.5
- User overrides are stored and used for model retraining
- Batch version available for CSV import (POST /categorize/batch)

## Used By
- TransactionAgent (on every transaction save)
- CSVImportService (batch on CSV upload)

## Implementation Reference
docs/ML_SERVICE.md → "Endpoint 1 — Categorize Transaction"
