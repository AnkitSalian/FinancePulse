import { pool } from '../db';

interface TransactionFilters {
  month?: string;       // YYYY-MM
  category_id?: string;
  type?: string;        // debit | credit
  source?: string;
  limit?: number;
  offset?: number;
}

interface CreateTransactionData {
  account_id?: string;
  category_id?: string;
  amount: number;
  type: string;
  merchant?: string;
  description?: string;
  comment?: string;
  transaction_date: string;
  transaction_time?: string;
  upi_ref?: string;
  source?: string;
  is_reimbursable?: boolean;
}

interface UpdateTransactionData {
  category_id?: string;
  account_id?: string;
  amount?: number;
  type?: string;
  merchant?: string;
  description?: string;
  comment?: string;
  transaction_date?: string;
  transaction_time?: string;
  is_reimbursable?: boolean;
}

export async function getTransactions(
  userId: string,
  filters: TransactionFilters,
) {
  const conditions: string[] = ['t.user_id = $1'];
  const params: (string | number)[] = [userId];
  let idx = 2;

  if (filters.month) {
    const [year, month] = filters.month.split('-');
    const start = `${year}-${month}-01`;
    const end = new Date(Number(year), Number(month), 1).toISOString().split('T')[0];
    conditions.push(`t.transaction_date >= $${idx++} AND t.transaction_date < $${idx++}`);
    params.push(start, end);
  }

  if (filters.category_id) {
    conditions.push(`t.category_id = $${idx++}`);
    params.push(filters.category_id);
  }

  if (filters.type) {
    conditions.push(`t.type = $${idx++}`);
    params.push(filters.type);
  }

  if (filters.source) {
    conditions.push(`t.source = $${idx++}`);
    params.push(filters.source);
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM transactions t WHERE ${where}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const rows = await pool.query(
    `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE ${where}
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset],
  );

  return {
    transactions: rows.rows,
    total,
    page_info: { limit, offset, has_more: offset + limit < total },
  };
}

export async function createTransaction(userId: string, data: CreateTransactionData) {
  const result = await pool.query(
    `INSERT INTO transactions
       (user_id, account_id, category_id, amount, type, merchant, description,
        comment, transaction_date, transaction_time, upi_ref, source, is_reimbursable)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      userId,
      data.account_id ?? null,
      data.category_id ?? null,
      data.amount,
      data.type,
      data.merchant ?? null,
      data.description ?? null,
      data.comment ?? null,
      data.transaction_date,
      data.transaction_time ?? null,
      data.upi_ref ?? null,
      data.source ?? 'manual',
      data.is_reimbursable ?? false,
    ],
  );
  return result.rows[0];
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: UpdateTransactionData,
) {
  const UPDATABLE: (keyof UpdateTransactionData)[] = [
    'category_id',
    'account_id',
    'amount',
    'type',
    'merchant',
    'description',
    'comment',
    'transaction_date',
    'transaction_time',
    'is_reimbursable',
  ];

  const setClauses: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const field of UPDATABLE) {
    if (field in data && data[field] !== undefined) {
      setClauses.push(`${field} = $${idx++}`);
      params.push(data[field]);
    }
  }

  if (setClauses.length === 0) return null;

  setClauses.push(`updated_at = NOW()`);
  params.push(id, userId);

  const result = await pool.query(
    `UPDATE transactions
     SET ${setClauses.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx++}
     RETURNING *`,
    params,
  );
  return result.rows[0] ?? null;
}

export async function deleteTransaction(userId: string, id: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return (result.rowCount ?? 0) > 0;
}
