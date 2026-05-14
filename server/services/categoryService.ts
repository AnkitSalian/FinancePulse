import { pool } from '../db';

export async function getCategories(userId: string) {
  const result = await pool.query(
    `SELECT id, name, type, icon, color, is_default, created_at
     FROM categories
     WHERE user_id = $1
     ORDER BY is_default DESC, name ASC`,
    [userId],
  );
  return result.rows;
}
