import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { useTransactions, useCategories } from '../hooks/useTransactions';
import { Transaction } from '../types';
import { formatINR } from '../utils/currency';
import { currentMonth, prevMonth, nextMonth, formatMonth } from '../utils/date';

// ---------- TransactionCard ----------
function TransactionCard({
  tx,
  onDelete,
}: {
  tx: Transaction;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-surface rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-lg shrink-0">
        {tx.category_icon ?? (tx.type === 'credit' ? '💰' : '💸')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{tx.merchant ?? tx.description ?? 'Transaction'}</p>
        <p className="text-muted text-xs mt-0.5">
          {tx.category_name ?? 'Uncategorised'} ·{' '}
          {new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          {tx.is_reimbursable && (
            <span className="ml-1 bg-primary/20 text-primary px-1 py-0.5 rounded text-xs">Reimb.</span>
          )}
        </p>
        {tx.comment && <p className="text-muted text-xs italic truncate">"{tx.comment}"</p>}
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-success' : 'text-white'}`}>
          {tx.type === 'credit' ? '+' : '-'}{formatINR(tx.amount)}
        </p>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-muted text-xs mt-1 hover:text-danger"
          >
            Delete
          </button>
        ) : (
          <button
            onClick={() => onDelete(tx.id)}
            className="text-danger text-xs mt-1 font-medium"
          >
            Confirm?
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Add Transaction Bottom Sheet ----------
interface AddSheetProps {
  onSave: (data: {
    amount: number;
    type: 'debit' | 'credit';
    merchant: string;
    category_id: string;
    transaction_date: string;
    comment: string;
    is_reimbursable: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

function AddTransactionSheet({ onSave, onClose }: AddSheetProps) {
  const categories = useCategories();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');
  const [reimbursable, setReimbursable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const visibleCategories = type === 'debit' ? expenseCategories : incomeCategories;

  const handleSave = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setErr('Enter a valid amount'); return; }
    if (!categoryId) { setErr('Select a category'); return; }
    setSaving(true);
    try {
      await onSave({ amount: num, type, merchant, category_id: categoryId, transaction_date: date, comment, is_reimbursable: reimbursable });
      onClose();
    } catch {
      setErr('Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl px-4 pt-4 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <h2 className="text-white font-semibold text-base mb-4">Add Transaction</h2>

        <div className="space-y-3">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(['debit', 'credit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setCategoryId(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  type === t
                    ? t === 'debit' ? 'bg-danger text-white' : 'bg-success text-white'
                    : 'bg-background text-muted border border-border'
                }`}
              >
                {t === 'debit' ? '⬆️ Expense' : '⬇️ Income'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-muted mb-1 block">Amount (₹) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-xl focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {/* Merchant */}
          <div>
            <label className="text-xs text-muted mb-1 block">Merchant / Description</label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Swiggy"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-muted mb-1 block">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {visibleCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    categoryId === c.id
                      ? 'bg-primary text-white'
                      : 'bg-background text-muted border border-border'
                  }`}
                >
                  <span className="text-base">{c.icon ?? '📦'}</span>
                  <span className="leading-tight text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-muted mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs text-muted mb-1 block">Comment (optional)</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Team dinner"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Reimbursable */}
          {type === 'debit' && (
            <button
              onClick={() => setReimbursable((r) => !r)}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition-colors ${
                reimbursable ? 'border-primary text-primary' : 'border-border text-muted'
              }`}
            >
              <span>{reimbursable ? '✅' : '⬜'}</span> Reimbursable
            </button>
          )}
        </div>

        {err && <p className="text-danger text-xs mt-2">{err}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Add Transaction'}
        </button>
      </div>
    </>
  );
}

// ---------- Transactions Page ----------
export default function Transactions() {
  const [searchParams] = useSearchParams();
  const [month, setMonth] = useState(currentMonth());
  const [showAdd, setShowAdd] = useState(searchParams.get('add') === '1');

  const { transactions, loading, error, createTransaction, deleteTransaction } =
    useTransactions({ month });

  useEffect(() => {
    if (searchParams.get('add') === '1') setShowAdd(true);
  }, [searchParams]);

  const totalIncome = transactions
    .filter((t) => t.type === 'credit')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'debit')
    .reduce((s, t) => s + Number(t.amount), 0);

  const isCurrentMonth = month === currentMonth();

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader
        title="Transactions"
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
        {/* Monthly totals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl p-4">
            <p className="text-xs text-muted mb-1">Income</p>
            <p className="text-lg font-bold text-success">{formatINR(totalIncome)}</p>
          </div>
          <div className="bg-surface rounded-2xl p-4">
            <p className="text-xs text-muted mb-1">Expenses</p>
            <p className="text-lg font-bold text-white">{formatINR(totalExpense)}</p>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl text-sm"
        >
          + Add Transaction
        </button>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 text-danger text-sm">
            {error}
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-white font-medium">No transactions</p>
            <p className="text-muted text-sm mt-1">Add your first transaction for {formatMonth(month)}</p>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <TransactionCard key={tx.id} tx={tx} onDelete={deleteTransaction} />
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddTransactionSheet
          onSave={async (data) => { await createTransaction(data); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
