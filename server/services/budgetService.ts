import { pool } from '../db';

interface CreateBudgetData {
  category_id: string;
  month: string; // YYYY-MM-DD (first of month)
  amount: number;
}

interface UpdateBudgetData {
  amount?: number;
}

export async function getBudgets(userId: string, month: string) {
  // month expected as YYYY-MM; append -01 for the query
  const monthParam = month.includes('-01') ? month : `${month}-01`;

  const result = await pool.query(
    `SELECT
       c.id as category_id,
       c.name as category_name,
       c.icon,
       b.id,
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
     GROUP BY c.id, c.name, c.icon, b.id, b.amount
     ORDER BY utilization_percent DESC`,
    [userId, monthParam],
  );
  return result.rows;
}

export async function createBudget(userId: string, data: CreateBudgetData) {
  const result = await pool.query(
    `INSERT INTO budgets (user_id, category_id, month, amount)
     VALUES ($1, $2, $3::date, $4)
     RETURNING *`,
    [userId, data.category_id, data.month, data.amount],
  );
  return result.rows[0];
}

export async function updateBudget(
  userId: string,
  id: string,
  data: UpdateBudgetData,
) {
  if (!data.amount) return null;

  const result = await pool.query(
    `UPDATE budgets
     SET amount = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [data.amount, id, userId],
  );
  return result.rows[0] ?? null;
}
