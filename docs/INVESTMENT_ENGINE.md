# INVESTMENT_ENGINE.md — FinancePulse

## Overview
Recommends how the user should allocate their monthly surplus across investment vehicles, optimizing for tax savings and wealth creation. Rule-based in Phase 3, ML-enhanced in Phase 4.

---

## Monthly Surplus Calculation
```typescript
async function calculateMonthlySurplus(userId: string): Promise<number> {
  const user = await getUser(userId);
  const income = user.monthly_income;

  const currentMonth = format(new Date(), 'yyyy-MM');

  // Fixed commitments
  const totalEMIs = await getTotalMonthlyEMIs(userId);
  const totalSIPs = await getTotalMonthlySIPs(userId);

  // Variable spending (last 3 months average for stability)
  const avgVariableSpend = await getAvgVariableSpend(userId, 3);

  const surplus = income - totalEMIs - totalSIPs - avgVariableSpend;
  return Math.max(0, surplus);
}
```

---

## Tax Headroom Calculation
```typescript
interface TaxHeadroom {
  section_80c: { limit: number; used: number; remaining: number };
  section_80d: { limit: number; used: number; remaining: number };
  section_80ccd1b: { limit: number; used: number; remaining: number };
}

async function calculateTaxHeadroom(userId: string, financialYear: string): Promise<TaxHeadroom> {
  const investments = await getInvestmentsForFY(userId, financialYear);

  // 80C: PPF + ELSS + EPF employee contribution + home loan principal
  const used80C = investments
    .filter(i => i.is_80c_eligible)
    .reduce((sum, i) => sum + getAnnualAmount(i), 0);

  // 80CCD(1B): NPS contributions above 80C
  const usedNPS = investments
    .filter(i => i.type === 'nps')
    .reduce((sum, i) => sum + getAnnualAmount(i), 0);

  // 80D: Health insurance premiums (manual input required)
  const used80D = await getHealthInsurancePremiums(userId, financialYear);

  return {
    section_80c: { limit: 150000, used: Math.min(used80C, 150000), remaining: Math.max(0, 150000 - used80C) },
    section_80d: { limit: 25000, used: used80D, remaining: Math.max(0, 25000 - used80D) },
    section_80ccd1b: { limit: 50000, used: usedNPS, remaining: Math.max(0, 50000 - usedNPS) }
  };
}
```

---

## Allocation Rules (Phase 3 — Rule-Based)

Priority order for surplus allocation:

```typescript
function generateRecommendations(
  surplus: number,
  taxHeadroom: TaxHeadroom,
  riskAppetite: 'conservative' | 'moderate' | 'aggressive',
  hasEmergencyFund: boolean,
  emergencyFundTarget: number,
  currentEmergencyFund: number
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let remaining = surplus;

  // Priority 1: Emergency Fund (if below 6 months of expenses)
  if (!hasEmergencyFund) {
    const needed = emergencyFundTarget - currentEmergencyFund;
    const monthsToFill = 6;
    const amount = Math.min(remaining * 0.30, needed / monthsToFill);
    recommendations.push({
      type: 'Emergency Fund',
      amount,
      reason: `Build 6-month emergency fund (₹${needed.toLocaleString('en-IN')} remaining)`,
      vehicle: 'Liquid Fund or High-yield Savings'
    });
    remaining -= amount;
  }

  // Priority 2: NPS 80CCD(1B) — guaranteed tax saving
  if (taxHeadroom.section_80ccd1b.remaining > 0) {
    const monthly = Math.min(remaining * 0.15, taxHeadroom.section_80ccd1b.remaining / 12);
    recommendations.push({
      type: 'NPS',
      amount: Math.round(monthly),
      reason: `Save up to ₹${taxHeadroom.section_80ccd1b.remaining.toLocaleString('en-IN')} tax under 80CCD(1B)`,
      vehicle: 'NPS Tier 1 — Equity/Balanced mix'
    });
    remaining -= monthly;
  }

  // Priority 3: ELSS for 80C headroom
  if (taxHeadroom.section_80c.remaining > 0) {
    const monthly = Math.min(remaining * 0.20, taxHeadroom.section_80c.remaining / 12);
    recommendations.push({
      type: 'ELSS',
      amount: Math.round(monthly),
      reason: `Tax saving under 80C + equity growth (3-year lock-in)`,
      vehicle: 'ELSS Mutual Fund SIP'
    });
    remaining -= monthly;
  }

  // Priority 4: PPF for 80C + safe debt component
  if (taxHeadroom.section_80c.remaining > 0) {
    const monthly = Math.min(remaining * 0.15, 12500); // ₹1.5L annual limit / 12
    recommendations.push({
      type: 'PPF',
      amount: Math.round(monthly),
      reason: 'Tax-free returns + 80C benefit + safe debt allocation',
      vehicle: 'PPF Account'
    });
    remaining -= monthly;
  }

  // Priority 5: Equity index funds (wealth creation)
  const equityPercent = riskAppetite === 'aggressive' ? 0.70 :
                        riskAppetite === 'moderate' ? 0.50 : 0.30;
  const equityAmount = remaining * equityPercent;
  recommendations.push({
    type: 'Index Fund SIP',
    amount: Math.round(equityAmount),
    reason: 'Long-term wealth creation — low cost passive investing',
    vehicle: 'Nifty 50 + Nifty Next 50 Index Funds'
  });
  remaining -= equityAmount;

  // Priority 6: Debt component (remaining)
  if (remaining > 0) {
    recommendations.push({
      type: 'Debt Fund',
      amount: Math.round(remaining),
      reason: 'Stable returns, lower risk, portfolio balance',
      vehicle: 'Short Duration Debt Fund'
    });
  }

  return recommendations;
}
```

---

## Risk Appetite Allocation Templates

| Vehicle | Conservative | Moderate | Aggressive |
|---------|-------------|----------|-----------|
| Emergency Fund | Build first | Build first | Build first |
| NPS | 15% | 10% | 8% |
| ELSS | 15% | 20% | 25% |
| PPF | 20% | 15% | 10% |
| Index Funds | 20% | 35% | 50% |
| Debt Funds | 30% | 20% | 7% |

---

## Expected Returns Reference (for projection calculations)
| Vehicle | Expected Annual Return |
|---------|----------------------|
| PPF | 7.1% (current rate) |
| NPS (equity) | 10–12% (historical) |
| ELSS | 12–15% (historical) |
| Nifty 50 Index | 12% (long-term CAGR) |
| FD | 6.5–7.5% |
| Liquid Fund | 6.5–7% |
