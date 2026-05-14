import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Transaction, Category } from '../types';

interface TransactionFilters {
  month?: string;
  category_id?: string;
  type?: string;
}

interface CreateTransactionPayload {
  account_id?: string;
  category_id?: string;
  amount: number;
  type: 'debit' | 'credit';
  merchant?: string;
  description?: string;
  comment?: string;
  transaction_date: string;
  source?: string;
  is_reimbursable?: boolean;
}

interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page_info: { limit: number; offset: number; has_more: boolean };
}

export function useTransactions(filters: TransactionFilters = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = (f: TransactionFilters) => {
    const params = new URLSearchParams();
    if (f.month) params.set('month', f.month);
    if (f.category_id) params.set('category_id', f.category_id);
    if (f.type) params.set('type', f.type);
    params.set('limit', '100');
    return params.toString();
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<TransactionListResponse>(
        `/api/transactions?${buildQuery(filters)}`,
      );
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.month, filters.category_id, filters.type]);

  useEffect(() => { fetch(); }, [fetch]);

  const createTransaction = useCallback(async (payload: CreateTransactionPayload) => {
    const res = await api.post<{ transaction: Transaction }>('/api/transactions', payload);
    setTransactions((prev) => [res.data.transaction, ...prev]);
    setTotal((t) => t + 1);
    return res.data.transaction;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await api.delete(`/api/transactions/${id}`);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setTotal((t) => t - 1);
  }, []);

  return { transactions, total, loading, error, refetch: fetch, createTransaction, deleteTransaction };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<{ categories: Category[] }>('/api/categories')
      .then((r) => setCategories(r.data.categories))
      .catch(() => {});
  }, []);

  return categories;
}
