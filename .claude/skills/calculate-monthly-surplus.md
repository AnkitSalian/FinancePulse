# Skill: calculate-monthly-surplus

## Owner
Node API

## Input
```typescript
{ userId: string }
```

## Output
```typescript
{
  income: number,
  total_emis: number,
  total_sips: number,
  avg_variable_spend: number,  // 3-month rolling average
  surplus: number
}
```

## Behavior
surplus = income - total_emis - total_sips - avg_variable_spend
Returns 0 if surplus is negative (never negative)

## Used By
- WealthAgent
- PulseAgent
- generate-investment-recommendations

## Implementation Reference
docs/INVESTMENT_ENGINE.md → "Monthly Surplus Calculation" section
