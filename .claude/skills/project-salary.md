# Skill: project-salary

## Owner
Node API

## Input
```typescript
{
  name: string,
  current_ctc: number,
  annual_raise_percent: number,
  promotion_month?: number,       // months from now
  promotion_hike_percent?: number,
  projection_years: number        // 1 | 2 | 3
}
```

## Output
```typescript
Array<{
  month: number,
  monthly_income: number,
  annual_ctc: number,
  cumulative_income: number
}>
```

## Used By
- WealthAgent
- GET /api/salary-projector

## Implementation Reference
docs/SALARY_PROJECTOR.md → "Projection Model" section
