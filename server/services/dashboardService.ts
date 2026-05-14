import { pool } from '../db';

export async function getMonthlySummary(userId: string, month: string) {
  // month: YYYY-MM
  const [year, mon] = month.split('-');
  const monthStart = `${year}-${mon}-01`;
  const monthEnd = new Date(Number(year), Number(mon), 1).toISOString().split('T')[0];

  const totalsResult = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) AS total_expenses
     FROM transactions
     WHERE user_id = $1
       AND transaction_date >= $2
       AND transaction_date < $3`,
    [userId, monthStart, monthEnd],
  );

  const { total_income, total_expenses } = totalsResult.rows[0];
  const savings = Number(total_income) - Number(total_expenses);
  const savings_rate =
    Number(total_income) > 0
      ? Math.round((savings / Number(total_income)) * 1000) / 10
      : 0;

  const breakdownResult = await pool.query(
    `SELECT
       c.name AS category,
       COALESCE(SUM(t.amount), 0) AS amount,
       b.amount AS budget,
       CASE
         WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.amount) * 100, 1)
         ELSE NULL
       END AS utilization
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     LEFT JOIN budgets b ON b.category_id = t.category_id AND b.user_id = $1 AND b.month = $2::date
     WHERE t.user_id = $1
       AND t.type = 'debit'
       AND t.transaction_date >= $3
       AND t.transaction_date < $4
     GROUP BY c.name, b.amount
     ORDER BY amount DESC`,
    [userId, monthStart, monthStart, monthEnd],
  );

  return {
    month,
    total_income: Number(total_income),
    total_expenses: Number(total_expenses),
    savings,
    savings_rate,
    category_breakdown: breakdownResult.rows,
  };
}

export async function getBudgetStatus(userId: string, month: string) {
  const monthParam = month.includes('-01') ? month : `${month}-01`;

  const result = await pool.query(
    `SELECT
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
     ORDER BY utilization_percent DESC`,
    [userId, monthParam],
  );
  return result.rows;
}

export async function getDailyPulse(userId: string) {
  const today = new Date();
  const daysElapsed = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const month = monthStart.slice(0, 7); // YYYY-MM

  // Total budgeted for the month
  const budgetTotalResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS month_budget
     FROM budgets
     WHERE user_id = $1 AND month = $2::date`,
    [userId, monthStart],
  );
  const month_budget = Number(budgetTotalResult.rows[0].month_budget);

  // Total spent so far this month (debits only)
  const spentResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS month_spent
     FROM transactions
     WHERE user_id = $1
       AND type = 'debit'
       AND DATE_TRUNC('month', transaction_date) = $2::date`,
    [userId, monthStart],
  );
  const month_spent = Number(spentResult.rows[0].month_spent);

  // User monthly income for savings rate
  const userResult = await pool.query(
    `SELECT monthly_income FROM users WHERE id = $1`,
    [userId],
  );
  const monthly_income = Number(userResult.rows[0]?.monthly_income ?? 0);
  const savings_rate =
    monthly_income > 0
      ? Math.round(((monthly_income - month_spent) / monthly_income) * 1000) / 10
      : 0;

  // Upcoming dues in the next 7 days: EMIs from loans + credit card due dates
  const upcomingStart = today.toISOString().split('T')[0];
  const upcomingEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const loanDuesResult = await pool.query(
    `SELECT
       'emi' AS type,
       name,
       emi_amount AS amount,
       DATE(DATE_TRUNC('month', NOW()) + (emi_due_day - 1) * INTERVAL '1 day') AS due_date
     FROM loans
     WHERE user_id = $1
       AND is_active = TRUE
       AND DATE(DATE_TRUNC('month', NOW()) + (emi_due_day - 1) * INTERVAL '1 day')
           BETWEEN $2 AND $3`,
    [userId, upcomingStart, upcomingEnd],
  );

  const cardDuesResult = await pool.query(
    `SELECT
       'credit_card' AS type,
       name,
       current_outstanding AS amount,
       DATE(DATE_TRUNC('month', NOW()) + (due_day - 1) * INTERVAL '1 day') AS due_date
     FROM credit_cards
     WHERE user_id = $1
       AND is_active = TRUE
       AND DATE(DATE_TRUNC('month', NOW()) + (due_day - 1) * INTERVAL '1 day')
           BETWEEN $2 AND $3`,
    [userId, upcomingStart, upcomingEnd],
  );

  const upcoming_dues = [
    ...loanDuesResult.rows,
    ...cardDuesResult.rows,
  ].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // Linear extrapolation forecast (from BUDGET_ENGINE.md)
  const dailyRate = daysElapsed > 0 ? month_spent / daysElapsed : 0;
  const projectedTotalSpend = month_spent + dailyRate * daysRemaining;

  // Fixed commitments remaining (loans + SIPs due this month after today)
  const fixedResult = await pool.query(
    `SELECT COALESCE(SUM(emi_amount), 0) AS total
     FROM loans
     WHERE user_id = $1
       AND is_active = TRUE
       AND DATE(DATE_TRUNC('month', NOW()) + (emi_due_day - 1) * INTERVAL '1 day') > NOW()`,
    [userId],
  );
  const fixedCommitmentsRemaining = Number(fixedResult.rows[0].total);

  const projectedSurplus = monthly_income - projectedTotalSpend - fixedCommitmentsRemaining;
  const confidence = daysElapsed < 7 ? 'low' : daysElapsed < 15 ? 'medium' : 'high';

  // Budget warnings (categories at ≥80%)
  const budgetRows = await getBudgetStatus(userId, month);
  const alerts = budgetRows
    .filter((r) => Number(r.utilization_percent) >= 80)
    .map((r) => ({
      type: Number(r.utilization_percent) >= 100 ? 'budget_exceeded' : 'budget_warning',
      category: r.category_name,
      message:
        Number(r.utilization_percent) >= 100
          ? `${r.category_name} budget exceeded`
          : `${r.utilization_percent}% of ${r.category_name} budget used`,
    }));

  return {
    month_budget,
    month_spent,
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
    savings_rate,
    upcoming_dues,
    forecast: {
      projected_surplus: Math.round(projectedSurplus),
      confidence,
    },
    alerts,
  };
}
