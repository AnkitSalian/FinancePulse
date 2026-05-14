import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Account } from '../types';

interface CreateAccountPayload {
  name: string;
  type: Account['type'];
  bank?: string;
  last_four?: string;
  current_balance?: number;
}

interface UpdateAccountPayload {
  name?: string;
  type?: Account['type'];
  bank?: string;
  last_four?: string;
  current_balance?: number;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ accounts: Account[] }>('/api/accounts');
      setAccounts(res.data.accounts);
    } catch {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createAccount = useCallback(async (payload: CreateAccountPayload) => {
    const res = await api.post<{ account: Account }>('/api/accounts', payload);
    setAccounts((prev) => [...prev, res.data.account]);
    return res.data.account;
  }, []);

  const updateAccount = useCallback(async (id: string, payload: UpdateAccountPayload) => {
    const res = await api.patch<{ account: Account }>(`/api/accounts/${id}`, payload);
    setAccounts((prev) => prev.map((a) => (a.id === id ? res.data.account : a)));
    return res.data.account;
  }, []);

  return { accounts, loading, error, refetch: fetch, createAccount, updateAccount };
}
