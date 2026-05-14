import { useNavigate } from 'react-router-dom';
import { usePulse } from '../hooks/usePulse';
import { useAuthStore } from '../store/authStore';
import ProgressBar from '../components/charts/ProgressBar';
import { formatINR } from '../utils/currency';
import { formatMonth, currentMonth } from '../utils/date';

function SavingsRateBadge({ rate }: { rate: number }) {
  const color = rate >= 30 ? 'text-success' : rate >= 15 ? 'text-warning' : 'text-danger';
  const icon = rate >= 30 ? '🟢' : rate >= 15 ? '🟡' : '🔴';
  return <span className={`font-semibold ${color}`}>{icon} {rate.toFixed(1)}%</span>;
}

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const { pulse, loading, error } = usePulse();
  const navigate = useNavigate();
  const month = currentMonth();

  const budgetUtil = pulse && pulse.month_budget > 0
    ? (pulse.month_spent / pulse.month_budget) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background text-white pb-28">
      {/* Header */}
      <div className="px-4 pt-14 pb-2 flex items-center justify-between">
        <div>
          <p className="text-muted text-sm">Good day,</p>
          <h1 className="text-xl font-bold text-white">{user?.name?.split(' ')[0] ?? 'there'} 👋</h1>
        </div>
        <button onClick={() => navigate('/settings')} className="text-muted text-sm">
          ⚙️
        </button>
      </div>

      <div className="px-4 space-y-4">
        {/* Daily Pulse card */}
        <div className="bg-surface rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted text-xs">{formatMonth(month)}</p>
              {pulse && (
                <p className="text-xs text-muted mt-0.5">
                  {pulse.days_elapsed} days elapsed · {pulse.days_remaining} left
                </p>
              )}
            </div>
            {pulse && (
              <div className="text-right">
                <p className="text-xs text-muted">Savings Rate</p>
                <SavingsRateBadge rate={pulse.savings_rate} />
              </div>
            )}
          </div>

          {loading && (
            <div className="space-y-3">
              <div className="h-5 bg-border rounded-full animate-pulse w-3/4" />
              <div className="h-3 bg-border rounded-full animate-pulse" />
            </div>
          )}

          {error && <p className="text-danger text-sm">{error}</p>}

          {pulse && (
            <>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs text-muted">Spent</p>
                  <p className="text-2xl font-bold text-white">{formatINR(pulse.month_spent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Budget</p>
                  <p className="text-base font-semibold text-muted">{formatINR(pulse.month_budget)}</p>
                </div>
              </div>
              <ProgressBar value={budgetUtil} height={10} showLabel />

              {/* Forecast */}
              {pulse.forecast && (
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <p className="text-xs text-muted">Projected surplus</p>
                  <p className={`text-sm font-semibold ${pulse.forecast.projected_surplus >= 0 ? 'text-success' : 'text-danger'}`}>
                    {pulse.forecast.projected_surplus >= 0 ? '+' : ''}{formatINR(pulse.forecast.projected_surplus)}
                    <span className="text-muted font-normal ml-1 text-xs">({pulse.forecast.confidence})</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Alerts */}
        {pulse && pulse.alerts.length > 0 && (
          <div className="space-y-2">
            {pulse.alerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-xl px-4 py-3 text-sm ${
                  alert.type === 'budget_exceeded'
                    ? 'bg-danger/10 border border-danger/30 text-danger'
                    : 'bg-warning/10 border border-warning/30 text-warning'
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* Upcoming dues */}
        {pulse && pulse.upcoming_dues.length > 0 && (
          <div className="bg-surface rounded-2xl p-4">
            <p className="text-xs text-muted font-medium uppercase tracking-wider mb-3">Due This Week</p>
            <div className="space-y-3">
              {pulse.upcoming_dues.map((due, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{due.type === 'emi' ? '🏠' : '💳'}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{due.name}</p>
                      <p className="text-muted text-xs">{new Date(due.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <p className="text-white font-semibold text-sm">{formatINR(due.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/transactions?add=1')}
            className="bg-primary rounded-2xl p-4 text-left"
          >
            <span className="text-2xl">➕</span>
            <p className="text-white font-semibold text-sm mt-2">Add Transaction</p>
            <p className="text-primary/70 text-xs">Manual entry</p>
          </button>
          <button
            onClick={() => navigate('/budget')}
            className="bg-surface rounded-2xl p-4 text-left"
          >
            <span className="text-2xl">📊</span>
            <p className="text-white font-semibold text-sm mt-2">View Budget</p>
            <p className="text-muted text-xs">Category breakdown</p>
          </button>
        </div>
      </div>
    </div>
  );
}
