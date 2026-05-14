# HEALTH_SCORE.md — FinancePulse

## Overview
A monthly Financial Health Score (0–100) that gives the user a single number to understand how well they managed their finances that month.

---

## Score Components & Weights

| Component | Weight | What It Measures |
|-----------|--------|-----------------|
| Savings Rate | 30% | % of income saved this month |
| Budget Adherence | 25% | How many categories stayed within budget |
| EMI-to-Income Ratio | 20% | Total EMIs as % of monthly income |
| SIP Consistency | 15% | Did all SIPs go through this month |
| Credit Card Payment | 10% | Did user pay full outstanding or just minimum |

---

## Scoring Logic

### 1. Savings Rate (weight: 0.30)
```
savings = income - total_expenses
savings_rate = (savings / income) * 100

score:
  >= 30%  → 100
  20-29%  → 80
  10-19%  → 60
  0-9%    → 30
  negative → 0
```

### 2. Budget Adherence (weight: 0.25)
```
total_categories = count of categories with a budget set
over_budget = count of categories that exceeded budget

adherence_rate = ((total_categories - over_budget) / total_categories) * 100

score:
  100%    → 100
  80-99%  → 80
  60-79%  → 60
  40-59%  → 40
  < 40%   → 20
```

### 3. EMI-to-Income Ratio (weight: 0.20)
```
emi_ratio = (total_monthly_emis / monthly_income) * 100

score:
  <= 20%  → 100
  21-30%  → 80
  31-40%  → 60
  41-50%  → 40
  > 50%   → 0

(RBI guideline: keep EMIs under 40% of income)
```

### 4. SIP Consistency (weight: 0.15)
```
total_sips = count of active SIPs
missed_sips = count of SIPs not logged as transactions this month

score:
  0 missed  → 100
  1 missed  → 50
  2+ missed → 0
```

### 5. Credit Card Payment (weight: 0.10)
```
For each credit card:
  full_payment → 100
  partial (> minimum) → 50
  minimum only → 0
  not paid → 0

score = average across all cards
```

---

## Final Score Calculation
```typescript
function calculateHealthScore(components: ScoreComponents): number {
  const weighted =
    components.savings_rate_score * 0.30 +
    components.budget_adherence_score * 0.25 +
    components.emi_ratio_score * 0.20 +
    components.sip_consistency_score * 0.15 +
    components.credit_card_score * 0.10;

  return Math.round(weighted);
}
```

---

## Score Labels
| Range | Label | Color |
|-------|-------|-------|
| 85–100 | Excellent | #22c55e (green) |
| 70–84 | Good | #84cc16 (lime) |
| 55–69 | Average | #eab308 (yellow) |
| 40–54 | Needs Attention | #f97316 (orange) |
| 0–39 | Critical | #ef4444 (red) |

---

## Cron Job
```
Schedule: Last day of month at 11:00 PM IST
Action:
  1. Fetch all users
  2. For each user, calculate score for the closing month
  3. Save to health_scores table
  4. Send push notification: "Your June score is 74 🟡 — up 4 from May"
```

---

## Score Breakdown Display
Show the user what moved their score:
```
📈 What went well:
  - Savings rate: 43% — excellent
  - All SIPs consistent

📉 What pulled you down:
  - 2 categories over budget (Food, Shopping)
  - Credit card not paid in full (-9 points)

💡 To improve next month:
  - Pay credit card in full (+10 points available)
  - Keep food spend under ₹15,000
```
