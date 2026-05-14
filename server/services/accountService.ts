import { pool } from '../db';

interface CreateAccountData {
  name: string;
  type: string;
  bank?: string;
  last_four?: string;
  current_balance?: number;
}

interface UpdateAccountData {
  name?: string;
  type?: string;
  bank?: string;
  last_four?: string;
  current_balance?: number;
  is_active?: boolean;
}

export async function getAccounts(userId: string) {
  const result = await pool.query(
    `SELECT * FROM accounts WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at ASC`,
    [userId],
  );
  return result.rows;
}

export async function createAccount(userId: string, data: CreateAccountData) {
  const result = await pool.query(
    `INSERT INTO accounts (user_id, name, type, bank, last_four, current_balance)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      data.name,
      data.type,
      data.bank ?? null,
      data.last_four ?? null,
      data.current_balance ?? 0,
    ],
  );
  return result.rows[0];
}

export async function updateAccount(
  userId: string,
  id: string,
  data: UpdateAccountData,
) {
  const UPDATABLE: (keyof UpdateAccountData)[] = [
    'name',
    'type',
    'bank',
    'last_four',
    'current_balance',
    'is_active',
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
    `UPDATE accounts
     SET ${setClauses.join(', ')}
     WHERE id = $${idx++} AND user_id = $${idx++}
     RETURNING *`,
    params,
  );
  return result.rows[0] ?? null;
}
