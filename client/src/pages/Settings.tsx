import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { User, ApiError } from '../types';
import { AxiosError } from 'axios';
import { formatINR } from '../utils/currency';

const RISK_LABELS: Record<string, string> = {
  conservative: '🛡️ Conservative',
  moderate: '⚖️ Moderate',
  aggressive: '🚀 Aggressive',
};

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [editing, setEditing] = useState(false);
  const [income, setIncome] = useState(String(user?.monthly_income ?? ''));
  const [risk, setRisk] = useState<User['risk_appetite']>(user?.risk_appetite ?? 'moderate');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.patch<{ user: User }>('/api/auth/profile', {
        monthly_income: income ? parseFloat(income) : undefined,
        risk_appetite: risk,
      });
      updateUser(res.data.user);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      setError(e.response?.data?.error?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader
        title="Settings"
        right={
          <button onClick={() => navigate(-1)} className="text-muted text-sm">
            ← Back
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Profile card */}
        <div className="bg-surface rounded-2xl p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-white font-semibold text-base">{user?.name}</p>
              <p className="text-muted text-sm">{user?.email}</p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted text-sm">Monthly Income</span>
                  <span className="text-white font-medium text-sm">
                    {user?.monthly_income ? formatINR(user.monthly_income) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted text-sm">Risk Appetite</span>
                  <span className="text-white font-medium text-sm">
                    {user?.risk_appetite ? RISK_LABELS[user.risk_appetite] : '—'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="w-full mt-4 bg-background border border-border rounded-xl py-2.5 text-sm text-primary font-medium"
              >
                Edit Profile
              </button>
              {saved && <p className="text-success text-xs text-center mt-2">✓ Saved</p>}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted mb-1 block">Monthly Income (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted mb-2 block">Risk Appetite</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['conservative', 'moderate', 'aggressive'] as User['risk_appetite'][]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRisk(r)}
                      className={`py-2.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                        risk === r
                          ? 'bg-primary text-white'
                          : 'bg-background text-muted border border-border'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-danger text-xs">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-background border border-border rounded-xl py-2.5 text-sm text-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* App info */}
        <div className="bg-surface rounded-2xl p-4 space-y-2">
          <p className="text-xs text-muted font-medium uppercase tracking-wider mb-2">App</p>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted">Version</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted">Phase</span>
            <span className="text-white">P1 — Core</span>
          </div>
        </div>
      </div>
    </div>
  );
}
