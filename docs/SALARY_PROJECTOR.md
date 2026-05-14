# SALARY_PROJECTOR.md — FinancePulse

## Overview
Models income trajectory over 1–3 years under different scenarios: base case, with promotion, with market correction. Also tracks ROI on learning investments.

---

## Projection Model
```typescript
interface ProjectionScenario {
  name: string;                    // "Base Case", "With VP Promotion at 12 months"
  current_ctc: number;             // annual CTC in ₹
  annual_raise_percent: number;    // e.g. 8 for 8%
  promotion_month?: number;        // months from now, e.g. 12
  promotion_hike_percent?: number; // e.g. 20 for 20% hike at promotion
  projection_years: number;        // 1, 2, or 3
}

function projectIncome(scenario: ProjectionScenario): MonthlyProjection[] {
  const projections: MonthlyProjection[] = [];
  let currentCTC = scenario.current_ctc;
  const monthlyBase = currentCTC / 12;

  for (let month = 1; month <= scenario.projection_years * 12; month++) {
    // Apply annual raise at 12-month intervals
    if (month > 1 && month % 12 === 1) {
      currentCTC = currentCTC * (1 + scenario.annual_raise_percent / 100);
    }

    // Apply promotion hike at specified month
    if (scenario.promotion_month && month === scenario.promotion_month) {
      currentCTC = currentCTC * (1 + (scenario.promotion_hike_percent || 0) / 100);
    }

    projections.push({
      month,
      monthly_income: currentCTC / 12,
      annual_ctc: currentCTC,
      cumulative_income: projections.reduce((s, p) => s + p.monthly_income, 0) + currentCTC / 12
    });
  }

  return projections;
}
```

---

## Certification ROI Tracker
```typescript
interface LearningInvestment {
  name: string;              // "IIIT Bangalore AI/ML PG"
  total_cost: number;        // total fees paid
  monthly_cost: number;      // EMI or monthly cost
  completion_month: number;  // months from now
  expected_salary_delta: number; // expected CTC increase post-completion
}

function calculateLearningROI(investment: LearningInvestment): ROIAnalysis {
  const breakEvenMonths = investment.total_cost / (investment.expected_salary_delta / 12);
  const threeYearReturn = (investment.expected_salary_delta * 3) - investment.total_cost;
  const roiPercent = (threeYearReturn / investment.total_cost) * 100;

  return {
    break_even_months: Math.ceil(breakEvenMonths),
    three_year_net_gain: threeYearReturn,
    roi_percent: roiPercent,
    monthly_cost: investment.monthly_cost
  };
}
```

---

## Display — Salary Projector Screen
- Toggle between scenarios (tabs or segmented control)
- Line chart: monthly income over 36 months, one line per scenario
- Summary card: "With VP promotion at month 12, you earn ₹14.2L more over 3 years"
- Learning ROI card per course/certification
