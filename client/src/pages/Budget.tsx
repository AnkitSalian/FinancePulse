import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import ProgressBar from '../components/charts/ProgressBar';
import { useBudget } from '../hooks/useBudget';
import { formatINR } from '../utils/currency';
import { formatMonth, currentMonth, prevMonth, nextMonth } from '../utils/date';

// ---------- CategoryBudgetCard ----------
interface CardProps {
  categoryName: string;
  icon: string | null;
  budgeted: number;
  spent: number;
  utilization: number;
  onEdit: () => void;
}

function CategoryBudgetCard({ categoryName, icon, budgeted, spent, utilization, onEdit }: CardProps) {
  const isOver = utilization >= 100;

  return (
    <button
      onClick={onEdit}
      className="w-full bg-surface rounded-2xl p-4 text-left active:opacity-80"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon ?? '💰'}</span>
          <span className="text-white font-medium text-sm">{categoryName}</span>
          {isOver && (
            <span className="text-xs bg-danger/20 text-danger px-1.5 py-0.5 rounded-full font-medium">
              Over budget
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold ${isOver ? 'text-danger' : utilization >= 80 ? 'text-warning' : 'text-muted'}`}>
          {Math.round(utilization)}%
        </span>
      </div>

      <ProgressBar value={utilization} height={6} />

      <div className="flex justify-between mt-2 text-xs text-muted">
        <span>Spent <span className="text-white font-medium">{formatINR(spent)}</span></span>
        <span>Budget <span className="text-white font-medium">{formatINR(budgeted)}</span></span>
      </div>
    </button>
  );
}

// ---------- Budget Bottom Sheet ----------
interface SheetProps {
  categoryId: string;
  categoryName: string;
  existingId?: string;
  existingAmount?: number;
  month: string;
  onSave: (id: string | undefined, amount: number) => Promise<void>;
  onClose: () => void;
}

function BudgetSheet({ categoryName, existingAmount, onSave, onClose }: SheetProps) {
  const [amount, setAmount] = useState(String(existingAmount ?? ''));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setErr('Enter a valid amount'); return; }
    setSaving(true);
    try {
      await onSave(undefined, num);
      onClose();
    } catch {
      setErr('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl px-4 pt-4 pb-10">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <h2 className="text-white font-semibold text-base mb-4">
          {existingAmount ? 'Edit' : 'Set'} budget — {categoryName}
        </h2>
        <label className="text-xs text-muted mb-1 block">Monthly amount (₹)</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setErr(''); }}
          placeholder="e.g. 8000"
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-primary"
          autoFocus
        />
        {err && <p className="text-danger text-xs mt-1">{err}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Budget'}
        </button>
      </div>
    </>
  );
}

// ---------- Budget Page ----------
export default function Budget() {
  const [month, setMonth] = useState(currentMonth());
  const { budgets, loading, error, refetch, createBudget, updateBudget, copyFromLastMonth } =
    useBudget(month);

  const [editTarget, setEditTarget] = useState<{
    id: string;
    categoryId: string;
    categoryName: string;
    icon: string | null;
    existingId?: string;
    existingAmount?: number;
  } | null>(null);

  const [copying, setCopying] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.budgeted), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0);
  const overallUtil = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleCopy = async () => {
    setCopying(true);
    try {
      await copyFromLastMonth();
      await refetch();
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } finally {
      setCopying(false);
    }
  };

  const handleSave = async (_id: string | undefined, amount: number) => {
    if (!editTarget) return;
    if (editTarget.existingId) {
      await updateBudget(editTarget.existingId, amount);
    } else {
      await createBudget({
        category_id: editTarget.categoryId,
        month: `${month}-01`,
        amount,
      });
    }
    await refetch();
  };

  const isCurrentMonth = month === currentMonth();

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      {/* Header with month navigation */}
      <PageHeader
        title="Budget"
        subtitle={formatMonth(month)}
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => setMonth(prevMonth(month))} className="text-muted px-2 py-1 text-lg">‹</button>
            <button
              onClick={() => setMonth(nextMonth(month))}
              disabled={isCurrentMonth}
              className="text-muted px-2 py-1 text-lg disabled:opacity-30"
            >›</button>
          </div>
        }
      />

      <div className="px-4 space-y-4">
        {/* Overview card */}
        <div className="bg-surface rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-muted">Total Spent</p>
              <p className="text-2xl font-bold text-white">{formatINR(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Total Budgeted</p>
              <p className="text-lg font-semibold text-muted">{formatINR(totalBudgeted)}</p>
            </div>
          </div>
          <ProgressBar value={overallUtil} height={10} showLabel />
        </div>

        {/* Copy last month button */}
        {budgets.length === 0 && !loading && (
          <button
            onClick={handleCopy}
            disabled={copying}
            className="w-full bg-surface border border-border rounded-2xl py-3 text-sm text-primary font-medium disabled:opacity-50"
          >
            {copying ? 'Copying…' : copyDone ? '✓ Copied!' : '📋 Copy last month\'s budgets'}
          </button>
        )}

        {/* Loading / error states */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Category cards */}
        {!loading && budgets.length > 0 && (
          <div className="space-y-3">
            {budgets.map((b) => (
              <CategoryBudgetCard
                key={b.category_id}
                categoryName={b.category_name}
                icon={b.icon}
                budgeted={Number(b.budgeted)}
                spent={Number(b.spent)}
                utilization={Number(b.utilization_percent)}
                onEdit={() =>
                  setEditTarget({
                    id: b.id,
                    categoryId: b.category_id,
                    categoryName: b.category_name,
                    icon: b.icon,
                    existingId: b.id,
                    existingAmount: Number(b.budgeted),
                  })
                }
              />
            ))}
          </div>
        )}

        {/* Copy last month (secondary, when budgets already exist) */}
        {budgets.length > 0 && (
          <button
            onClick={handleCopy}
            disabled={copying}
            className="w-full text-xs text-muted py-2 disabled:opacity-50"
          >
            {copying ? 'Copying…' : copyDone ? '✓ Copied from last month' : '📋 Copy from last month'}
          </button>
        )}
      </div>

      {/* Bottom sheet */}
      {editTarget && (
        <BudgetSheet
          categoryId={editTarget.categoryId}
          categoryName={editTarget.categoryName}
          existingId={editTarget.existingId}
          existingAmount={editTarget.existingAmount}
          month={month}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
