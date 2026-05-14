# NET_WORTH.md — FinancePulse

## Overview
Tracks the user's total net worth (assets minus liabilities) with a monthly snapshot and trend chart. This is the single most motivating long-term view in the app.

---

## Asset Categories
| Asset | Input Method | Update Frequency |
|-------|-------------|-----------------|
| Savings account balance | Manual | Monthly |
| Fixed Deposits | Manual | On maturity/renewal |
| Mutual Fund current value | Manual | Monthly |
| Provident Fund (PF) balance | Manual | Quarterly |
| PPF balance | Manual | Yearly |
| NPS balance | Manual | Quarterly |
| Property value | Manual | Yearly |
| Other assets | Manual | As needed |

## Liability Categories
| Liability | Input Method | Auto-update |
|-----------|-------------|-------------|
| Home loan outstanding | Manual | Auto-decrements from loans table |
| Personal loan outstanding | Manual | Auto-decrements from loans table |
| Credit card outstanding | Auto from credit_cards table | Real-time |
| Other liabilities | Manual | As needed |

---

## Monthly Snapshot Flow
```
1. First day of each month → cron prompts user to update net worth
2. Push notification: "Time to update your net worth for June"
3. User opens Net Worth screen
4. Pre-filled form shows last month's values as starting point
5. User updates changed values (MF current value, PF balance, etc.)
6. Loan outstanding auto-populated from loans table
7. Credit card outstanding auto-populated from credit_cards table
8. User saves → snapshot stored in net_worth_snapshots
```

---

## Net Worth Trend Chart
- X-axis: Month (last 12 months)
- Y-axis: ₹ value
- Three lines: Total Assets, Total Liabilities, Net Worth
- Highlight the month where net worth crossed a milestone (e.g., first time > ₹10L, ₹25L, ₹50L)

---

## Display on Home Screen
A compact net worth widget on the Grow tab:
```
Net Worth
₹24,82,400  ↑ ₹1,23,000 from last month (+5.2%)

Assets:      ₹52,40,000
Liabilities: ₹27,57,600
```

---

## Auto-Population from Existing Data
```typescript
async function prefillNetWorthFromExistingData(userId: string) {
  // Get outstanding loan balances
  const loans = await getActiveLoans(userId);
  const homeLoanOutstanding = loans
    .filter(l => l.type === 'home')
    .reduce((sum, l) => sum + l.outstanding_principal, 0);

  // Get credit card outstanding
  const cards = await getActiveCreditCards(userId);
  const creditCardOutstanding = cards
    .reduce((sum, c) => sum + c.current_outstanding, 0);

  // Get investment current values
  const investments = await getActiveInvestments(userId);
  const mfValue = investments
    .filter(i => ['sip', 'mf_lumpsum', 'elss'].includes(i.type))
    .reduce((sum, i) => sum + (i.current_value || 0), 0);
  const ppfBalance = investments
    .filter(i => i.type === 'ppf')
    .reduce((sum, i) => sum + (i.current_value || 0), 0);
  const npsBalance = investments
    .filter(i => i.type === 'nps')
    .reduce((sum, i) => sum + (i.current_value || 0), 0);

  return {
    home_loan_outstanding: homeLoanOutstanding,
    credit_card_outstanding: creditCardOutstanding,
    mf_value: mfValue,
    ppf_balance: ppfBalance,
    nps_balance: npsBalance
  };
}
```
