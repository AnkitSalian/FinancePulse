# Skill: extract-transaction-from-screenshot

## Owner
Node API → Claude Vision API

## Input
```typescript
{ imageBase64: string }
```

## Output
```typescript
{
  amount: number,
  merchant: string,
  date: string,        // YYYY-MM-DD
  time: string | null, // HH:MM
  type: 'debit' | 'credit',
  upi_ref: string | null,
  bank: string | null,
  account_last_four: string | null
}
```

## Error Output
```typescript
{ error: string }
```

## Behavior
- Uses claude-sonnet-4-20250514 with vision
- Returns null for any field that cannot be determined
- Never throws — always returns error object on failure
- Image is processed in memory only, never stored

## Used By
- TransactionAgent
- POST /api/transactions/extract

## Implementation Reference
docs/TRANSACTION_SERVICE.md → "Claude Vision Extraction" section
