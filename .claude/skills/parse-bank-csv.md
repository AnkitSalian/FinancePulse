# Skill: parse-bank-csv

## Owner
Node API

## Input
```typescript
{ fileBuffer: Buffer, bank: 'hdfc' | 'icici' | 'sbi' }
```

## Output
```typescript
Array<{
  date: string,        // YYYY-MM-DD
  description: string,
  amount: number,
  type: 'debit' | 'credit',
  balance: number | null
}>
```

## Behavior
- Uses bank-specific column mappings (hdfc/icici/sbi)
- Skips header rows and empty rows
- Normalizes amount to positive number, sets type from debit/credit column

## Used By
- TransactionAgent
- POST /api/transactions/csv-import

## Implementation Reference
docs/TRANSACTION_SERVICE.md → "Supported Banks & Column Mappings" section
