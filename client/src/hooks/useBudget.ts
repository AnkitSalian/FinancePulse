import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { BudgetStatus } from '../types';
import { currentMonth, prevMonth } from '../utils/date';

interface BudgetRow extends BudgetStatus {
  id: string;
}

interface CreateBudgetPayload {
  category_id: string;
  month: string; // YYYY-MM-DD
  amount: number;
}

export function useBudget(month: string = currentMonth()) {
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ budgets: BudgetRow[] }>(`/api/budgets?month=${month}`);
      setBudgets(res.data.budgets);
    } catch {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetch(); }, [fetch]);

  const createBudget = useCallback(async (payload: CreateBudgetPayload) => {
    const res = await api.post<{ budget: BudgetRow }>('/api/budgets', payload);
    setBudgets((prev) => [...prev, res.data.budget]);
    return res.data.budget;
  }, []);

  const updateBudget = useCallback(async (id: string, amount: number) => {
    const res = await api.patch<{ budget: BudgetRow }>(`/api/budgets/${id}`, { amount });
    setBudgets((prev) => prev.map((b) => (b.id === id ? res.data.budget : b)));
    return res.data.budget;
  }, []);

  const copyFromLastMonth = useCallback(async () => {
    const lastMonth = prevMonth(month);
    const res = await api.get<{ budgets: BudgetRow[] }>(`/api/budgets?month=${lastMonth}`);
    const lastBudgets = res.data.budgets;
    const monthFirstDay = `${month}-01`;

    const existingCategoryIds = new Set(budgets.map((b) => b.category_id));
    const toCreate = lastBudgets.filter((b) => !existingCategoryIds.has(b.category_id));

    await Promise.all(
      toCreate.map((b) =>
        createBudget({ category_id: b.category_id, month: monthFirstDay, amount: Number(b.budgeted) }),
      ),
    );
  }, [month, budgets, createBudget]);

  return { budgets, loading, error, refetch: fetch, createBudget, updateBudget, copyFromLastMonth };
}
