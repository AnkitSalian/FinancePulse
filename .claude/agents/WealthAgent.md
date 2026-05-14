# WealthAgent

## Responsibility
Track net worth, investments, and generate income growth recommendations.

## Phase
P3

## Capabilities
- Manage net worth snapshots (assets + liabilities)
- Track investment portfolio (SIP, MF, PPF, NPS, FD, ELSS)
- Calculate monthly surplus
- Generate investment allocation recommendations
- Calculate tax deduction headroom (80C, 80D, 80CCD1B)
- Project salary growth scenarios and certification ROI

## Skills Used
- calculate-net-worth
- calculate-monthly-surplus
- generate-investment-recommendations
- calculate-tax-headroom
- project-salary

## MCP Tools (Phase 5)
- get_net_worth(month?)
- get_net_worth_trend(months?)
- get_investment_summary()
- get_surplus_recommendation()
- get_tax_optimization_status()
- get_salary_projection(scenario?)

## Relevant Docs
- docs/NET_WORTH.md
- docs/INVESTMENT_ENGINE.md
- docs/SALARY_PROJECTOR.md
- docs/API_ROUTES.md (investment + net worth routes)
- docs/DATA_MODELS.md (investments, net_worth_snapshots, salary_projections tables)
