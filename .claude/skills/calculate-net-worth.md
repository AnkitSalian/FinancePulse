# Skill: calculate-net-worth

## Owner
Node API

## Input
```typescript
{
  userId: string,
  snapshotData?: NetWorthInput  // if provided, calculates from input; else uses latest snapshot
}
```

## Output
```typescript
{
  total_assets: number,
  total_liabilities: number,
  net_worth: number,
  breakdown: {
    savings_balance: number,
    fd_value: number,
    mf_value: number,
    pf_balance: number,
    ppf_balance: number,
    nps_balance: number,
    property_value: number,
    home_loan_outstanding: number,
    credit_card_outstanding: number,
    personal_loan_outstanding: number
  }
}
```

## Used By
- WealthAgent
- GET /api/net-worth/current

## Implementation Reference
docs/NET_WORTH.md → "Auto-Population from Existing Data" section
