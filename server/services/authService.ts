import { pool } from '../db';

interface User {
  id: string;
  email: string;
  name: string;
  monthly_income: number | null;
  risk_appetite: string;
  created_at: Date;
  updated_at: Date;
}

interface UserWithHash extends User {
  password_hash: string;
}

// Default categories seeded on user creation (from DATA_MODELS.md)
const DEFAULT_CATEGORIES = [
  { name: 'Food',                  type: 'expense', icon: '🍽️',  color: '#FF6B6B' },
  { name: 'Transport',             type: 'expense', icon: '🚗',  color: '#4ECDC4' },
  { name: 'Shopping',              type: 'expense', icon: '🛍️',  color: '#45B7D1' },
  { name: 'Health',                type: 'expense', icon: '💊',  color: '#96CEB4' },
  { name: 'Entertainment',         type: 'expense', icon: '🎬',  color: '#FFEAA7' },
  { name: 'Utilities',             type: 'expense', icon: '💡',  color: '#DDA0DD' },
  { name: 'Education',             type: 'expense', icon: '📚',  color: '#98D8C8' },
  { name: 'EMI',                   type: 'expense', icon: '🏦',  color: '#F7DC6F' },
  { name: 'Investment',            type: 'expense', icon: '📈',  color: '#82E0AA' },
  { name: 'Credit Card Payment',   type: 'expense', icon: '💳',  color: '#F1948A' },
  { name: 'Home',                  type: 'expense', icon: '🏠',  color: '#85C1E9' },
  { name: 'Reimbursable',          type: 'expense', icon: '🔄',  color: '#D7BDE2' },
  { name: 'Salary',                type: 'income',  icon: '💰',  color: '#A9DFBF' },
  { name: 'Other',                 type: 'expense', icon: '📦',  color: '#BDC3C7' },
];

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, monthly_income, risk_appetite, created_at, updated_at`,
    [name, email, passwordHash],
  );
  return result.rows[0];
}

export async function seedDefaultCategories(userId: string): Promise<void> {
  const values = DEFAULT_CATEGORIES.map((_, i) => {
    const base = i * 5;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, TRUE)`;
  }).join(', ');

  const params = DEFAULT_CATEGORIES.flatMap((c) => [userId, c.name, c.type, c.icon, c.color]);

  await pool.query(
    `INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES ${values}`,
    params,
  );
}

export async function findUserByEmail(email: string): Promise<UserWithHash | null> {
  const result = await pool.query<UserWithHash>(
    `SELECT id, email, name, monthly_income, risk_appetite, password_hash, created_at, updated_at
     FROM users WHERE email = $1`,
    [email],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    `SELECT id, email, name, monthly_income, risk_appetite, created_at, updated_at
     FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updateUserProfile(
  userId: string,
  fields: { monthly_income?: number; risk_appetite?: string },
): Promise<User> {
  const updates: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;

  if (fields.monthly_income !== undefined) {
    updates.push(`monthly_income = $${idx++}`);
    params.push(fields.monthly_income);
  }
  if (fields.risk_appetite !== undefined) {
    updates.push(`risk_appetite = $${idx++}`);
    params.push(fields.risk_appetite);
  }

  updates.push(`updated_at = NOW()`);
  params.push(userId);

  const result = await pool.query<User>(
    `UPDATE users SET ${updates.join(', ')}
     WHERE id = $${idx}
     RETURNING id, email, name, monthly_income, risk_appetite, created_at, updated_at`,
    params,
  );
  return result.rows[0];
}
