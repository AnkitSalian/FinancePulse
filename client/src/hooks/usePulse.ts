import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { DailyPulse } from '../types';

export function usePulse() {
  const [pulse, setPulse] = useState<DailyPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DailyPulse>('/api/pulse/daily');
      setPulse(res.data);
    } catch {
      setError('Failed to load pulse data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { pulse, loading, error, refetch: fetch };
}
