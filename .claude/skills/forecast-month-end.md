# Skill: forecast-month-end

## Owner
Node API (P2 linear) → Python ML Service (P4 Prophet)

## Input
```typescript
{ userId: string }
```

## Output
```typescript
{
  projected_surplus: number,
  projected_total_spend: number,
  daily_spend_rate: number,
  confidence: 'low' | 'medium' | 'high'
}
```

## Behavior
- Phase 2: linear extrapolation (daily_rate × days_remaining)
- Phase 4: Prophet time-series model via ML service
- confidence: low if day < 7, medium if day < 15, high if day >= 15

## Used By
- BudgetAgent
- PulseAgent
- GET /api/pulse/forecast

## Implementation Reference
- docs/BUDGET_ENGINE.md → "Mid-Month Forecast" section
- docs/ML_SERVICE.md → "Endpoint 2 — Forecast Month-End Balance"
