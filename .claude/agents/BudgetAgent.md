# BudgetAgent

## Responsibility
Track budget utilization, generate alerts, and forecast month-end balance.

## Phase
P1 (budgets + utilization), P2 (alerts + forecast)

## Capabilities
- Calculate real-time budget utilization per category
- Trigger alerts at 80% and 100% budget consumption
- Calculate mid-month surplus/deficit forecast
- Send push notifications for budget events
- Run daily cron jobs for due date reminders and inactivity nudges

## Skills Used
- calculate-budget-utilization
- forecast-month-end
- send-push-notification

## MCP Tools (Phase 5)
- get_budget_status(month?)
- get_overspent_categories(month?)
- get_mid_month_forecast()
- get_upcoming_dues(days?)

## Relevant Docs
- docs/BUDGET_ENGINE.md
- docs/API_ROUTES.md (budget + pulse routes)
- docs/DATA_MODELS.md (budgets table)
