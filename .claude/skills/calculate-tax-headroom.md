# Skill: calculate-tax-headroom

## Owner
Node API

## Input
```typescript
{ userId: string, financial_year: string } // e.g. "2025-26"
```

## Output
```typescript
{
  section_80c:      { limit: 150000, used: number, remaining: number },
  section_80d:      { limit: 25000,  used: number, remaining: number },
  section_80ccd1b:  { limit: 50000,  used: number, remaining: number }
}
```

## Used By
- WealthAgent
- generate-investment-recommendations

## Implementation Reference
docs/INVESTMENT_ENGINE.md → "Tax Headroom Calculation" section
