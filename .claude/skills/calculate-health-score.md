# Skill: calculate-health-score

## Owner
Node API

## Input
```typescript
{ userId: string, month: string } // month: YYYY-MM
```

## Output
Full health score object:
```typescript
{
  total_score: number,           // 0–100
  savings_rate_score: number,
  budget_adherence_score: number,
  emi_ratio_score: number,
  sip_consistency_score: number,
  credit_card_score: number,
  savings_rate: number,
  emi_to_income_ratio: number,
  categories_over_budget: number,
  sips_missed: number
}
```

## Weights
savings_rate (30%) + budget_adherence (25%) + emi_ratio (20%) + sip_consistency (15%) + credit_card (10%)

## Used By
- ScoreAgent
- Monthly cron job

## Implementation Reference
docs/HEALTH_SCORE.md → full scoring logic and thresholds
