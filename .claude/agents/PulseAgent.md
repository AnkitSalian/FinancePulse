# PulseAgent

## Responsibility
Synthesize the daily financial snapshot shown on the home screen.

## Phase
P2

## Capabilities
- Aggregate data from TransactionAgent, BudgetAgent, ScoreAgent, WealthAgent
- Produce the daily pulse summary (spend vs budget, upcoming dues, forecast, alerts)
- Determine overall financial status for the day

## Skills Used
- calculate-budget-utilization
- forecast-month-end
- calculate-monthly-surplus

## MCP Tools (Phase 5)
- get_daily_pulse()
- get_monthly_summary(month?)

## Relevant Docs
- docs/BUDGET_ENGINE.md (pulse + forecast logic)
- docs/API_ROUTES.md (GET /pulse/daily, GET /pulse/forecast)
- docs/FRONTEND_STRUCTURE.md (DailyPulseCard component)
