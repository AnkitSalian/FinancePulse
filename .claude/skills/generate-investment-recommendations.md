# Skill: generate-investment-recommendations

## Owner
Node API (P3 rule-based) → ML Service (P4 enhanced)

## Input
```typescript
{ userId: string }
```

## Output
```typescript
Array<{
  type: string,       // 'Emergency Fund' | 'NPS' | 'ELSS' | 'PPF' | 'Index Fund SIP' | 'Debt Fund'
  amount: number,
  reason: string,
  vehicle: string,
  priority: number
}>
```

## Behavior
Priority order: Emergency Fund → NPS (80CCD1B) → ELSS (80C) → PPF (80C) → Index Funds → Debt Funds
Allocation varies by risk_appetite: conservative | moderate | aggressive

## Dependencies
Internally calls:
- calculate-monthly-surplus
- calculate-tax-headroom

## Used By
- WealthAgent
- GET /api/investments/recommendations

## Implementation Reference
docs/INVESTMENT_ENGINE.md → full priority logic and allocation rules
