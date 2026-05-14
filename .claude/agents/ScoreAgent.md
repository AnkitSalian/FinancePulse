# ScoreAgent

## Responsibility
Calculate and track the monthly financial health score.

## Phase
P3

## Capabilities
- Calculate all 5 score components (savings rate, budget adherence, EMI ratio, SIP consistency, credit card payment)
- Compute weighted final score (0–100)
- Store monthly score snapshot
- Generate score breakdown narrative (what went well / what pulled you down)
- Track 6-month score trend

## Skills Used
- calculate-health-score
- send-push-notification

## MCP Tools (Phase 5)
- get_health_score(month?)
- get_health_score_trend(months?)
- get_score_breakdown(month?)

## Relevant Docs
- docs/HEALTH_SCORE.md
- docs/API_ROUTES.md (health score routes)
- docs/DATA_MODELS.md (health_scores table)
