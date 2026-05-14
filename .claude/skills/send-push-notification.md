# Skill: send-push-notification

## Owner
Node API

## Input
```typescript
{
  userId: string,
  type: 'BUDGET_WARNING' | 'BUDGET_EXCEEDED' | 'OVERALL_WARNING' |
        'OVERALL_EXCEEDED' | 'INACTIVITY' | 'DUE_REMINDER' |
        'SIP_DUE' | 'SCORE_READY',
  message: string,
  data?: object
}
```

## Output
```typescript
{ success: boolean }
```

## Behavior
- Silently fails if user has not granted push permission
- Never throws
- Uses Web Push (vapid keys)

## Used By
- BudgetAgent (budget alerts)
- ScoreAgent (monthly score ready)
- Cron jobs (due reminders, inactivity nudge)

## Implementation Reference
docs/BUDGET_ENGINE.md → "Notification Cron Jobs" section
