# Skill: calculate-budget-utilization

## Owner
Node API

## Input
```typescript
{ userId: string, month: string } // month: YYYY-MM
```

## Output
```typescript
Array<{
  category_id: string,
  category_name: string,
  budgeted: number,
  spent: number,
  utilization_percent: number,
  status: 'on_track' | 'warning' | 'exceeded'
}>
```

## Behavior
- warning = utilization >= 80%
- exceeded = utilization >= 100%
- Categories without a budget set are excluded

## Used By
- BudgetAgent
- PulseAgent
- GET /api/dashboard/budget-status

## Implementation Reference
docs/BUDGET_ENGINE.md → "Utilization Calculation" section
