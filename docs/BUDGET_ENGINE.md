# BUDGET_ENGINE.md — FinancePulse

## Overview
Manages monthly category budgets, real-time utilization tracking, mid-month forecasting, and alert triggers.

---

## Budget Structure
- Budgets are set per category per month
- User can copy last month's budgets as a starting point
- An overall monthly spend limit can optionally be set (separate from category budgets)

---

## Utilization Calculation
```typescript
// Called in real-time on dashboard load
async function getBudgetStatus(userId: string, month: string) {
  const query = `
    SELECT
      c.id as category_id,
      c.name as category_name,
      c.icon,
      b.amount as budgeted,
      COALESCE(SUM(t.amount), 0) as spent,
      ROUND((COALESCE(SUM(t.amount), 0) / b.amount) * 100, 1) as utilization_percent
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t ON
      t.category_id = b.category_id AND
      t.user_id = $1 AND
      DATE_TRUNC('month', t.transaction_date) = $2::date AND
      t.type = 'debit'
    WHERE b.user_id = $1 AND b.month = $2::date
    GROUP BY c.id, c.name, c.icon, b.amount
    ORDER BY utilization_percent DESC
  `;
  return db.query(query, [userId, month + '-01']);
}
```

---

## Alert Triggers

### Alert Types
```typescript
type AlertType =
  | 'BUDGET_WARNING'    // category at 80% of budget
  | 'BUDGET_EXCEEDED'   // category over 100%
  | 'OVERALL_WARNING'   // total spend at 80% of monthly limit
  | 'OVERALL_EXCEEDED'  // total spend over monthly limit
  | 'INACTIVITY'        // no transactions in 3 days
  | 'DUE_REMINDER'      // EMI or credit card due in 5 days
  | 'SIP_DUE'           // SIP due tomorrow
```

### Alert Check — runs on every transaction save
```typescript
async function checkBudgetAlerts(userId: string, categoryId: string, month: string) {
  const status = await getCategoryBudgetStatus(userId, categoryId, month);
  const alerts = [];

  if (status.utilization_percent >= 100) {
    alerts.push({
      type: 'BUDGET_EXCEEDED',
      message: `${status.category_name} budget exceeded by ₹${Math.abs(status.budgeted - status.spent).toLocaleString('en-IN')}`
    });
  } else if (status.utilization_percent >= 80) {
    alerts.push({
      type: 'BUDGET_WARNING',
      message: `${status.category_name} is at ${status.utilization_percent}% of budget`
    });
  }

  // Send push notification for each alert
  for (const alert of alerts) {
    await sendPushNotification(userId, alert);
  }
}
```

---

## Mid-Month Forecast

### Simple Linear Extrapolation (Phase 2)
```typescript
async function getMidMonthForecast(userId: string): Promise<Forecast> {
  const today = new Date();
  const daysElapsed = today.getDate();
  const daysInMonth = getDaysInMonth(today);
  const daysRemaining = daysInMonth - daysElapsed;

  const monthStart = startOfMonth(today).toISOString().split('T')[0];
  const totalSpentSoFar = await getMonthTotalSpend(userId, monthStart);
  const dailyRate = totalSpentSoFar / daysElapsed;
  const projectedTotalSpend = totalSpentSoFar + (dailyRate * daysRemaining);

  const income = await getUserMonthlyIncome(userId);
  const fixedCommitments = await getFixedCommitmentsRemaining(userId); // EMIs, SIPs due
  const projectedSurplus = income - projectedTotalSpend - fixedCommitments;

  const confidence = daysElapsed < 7 ? 'low' : daysElapsed < 15 ? 'medium' : 'high';

  return { projectedSurplus, projectedTotalSpend, dailyRate, confidence };
}
```

### ML Forecasting (Phase 4)
Replaced by Prophet time-series model trained on 3+ months of user history.
See `ML_SERVICE.md` for implementation.

---

## Notification Cron Jobs

```
Daily at 9:00 AM IST:
  - Check all users for EMIs/dues in next 5 days → send reminders
  - Check all SIPs due next day → send reminder

Daily at 8:00 PM IST:
  - Check inactivity (no transaction in 3 days) → send nudge

Real-time (on transaction save):
  - Check budget alerts for affected category
  - Check overall spend limit alert
```
