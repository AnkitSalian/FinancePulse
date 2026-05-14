import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAccounts } from '../hooks/useAccounts';
import { formatINR } from '../utils/currency';
import { Account } from '../types';

const ACCOUNT_ICONS: Record<Account['type'], string> = {
  savings: '🏦',
  salary: '💼',
  wallet: '👛',
  fd: '🔒',
  ppf: '📈',
  nps: '🏛️',
};

const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  savings: 'Savings Account',
  salary: 'Salary Account',
  wallet: 'Wallet',
  fd: 'Fixed Deposit',
  ppf: 'PPF',
  nps: 'NPS',
};

// ---------- AccountCard ----------
interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
}

function AccountCard({ account, onEdit }: AccountCardProps) {
  return (
    <button
      onClick={() => onEdit(account)}
      className="w-full bg-surface rounded-2xl p-4 text-left active:opacity-80"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            {ACCOUNT_ICONS[account.type]}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{account.name}</p>
            <p className="text-muted text-xs mt-0.5">
              {ACCOUNT_TYPE_LABELS[account.type]}
              {account.bank ? ` · ${account.bank}` : ''}
              {account.last_four ? ` ····${account.last_four}` : ''}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-semibold">{formatINR(account.current_balance)}</p>
        </div>
      </div>
    </button>
  );
}

// ---------- Add/Edit Sheet ----------
type SheetMode = 'add' | 'edit';

interface SheetProps {
  mode: SheetMode;
  initial?: Partial<Account>;
  onSave: (data: Partial<Account>) => Promise<void>;
  onClose: () => void;
}

function AccountSheet({ mode, initial = {}, onSave, onClose }: SheetProps) {
  const [name, setName] = useState(initial.name ?? '');
  const [type, setType] = useState<Account['type']>(initial.type ?? 'savings');
  const [bank, setBank] = useState(initial.bank ?? '');
  const [lastFour, setLastFour] = useState(initial.last_four ?? '');
  const [balance, setBalance] = useState(String(initial.current_balance ?? ''));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const accountTypes: Account['type'][] = ['savings', 'salary', 'wallet', 'fd', 'ppf', 'nps'];

  const handleSave = async () => {
    if (!name.trim()) { setErr('Account name is required'); return; }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        bank: bank.trim() || undefined,
        last_four: lastFour.trim() || undefined,
        current_balance: balance ? parseFloat(balance) : 0,
      });
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl px-4 pt-4 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <h2 className="text-white font-semibold text-base mb-4">
          {mode === 'add' ? 'Add Account' : 'Edit Account'}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Account Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HDFC Savings"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {accountTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                    type === t
                      ? 'bg-primary text-white'
                      : 'bg-background text-muted border border-border'
                  }`}
                >
                  {ACCOUNT_ICONS[t]} {ACCOUNT_TYPE_LABELS[t].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">Bank</label>
            <input
              type="text"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="e.g. HDFC"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">Last 4 digits</label>
            <input
              type="text"
              value={lastFour}
              onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted mb-1 block">Current Balance (₹)</label>
            <input
              type="number"
              inputMode="decimal"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {err && <p className="text-danger text-xs mt-2">{err}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {saving ? 'Saving…' : mode === 'add' ? 'Add Account' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}

// ---------- Accounts Page ----------
export default function Accounts() {
  const { accounts, loading, error, createAccount, updateAccount } = useAccounts();
  const [showAdd, setShowAdd] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance), 0);

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader
        title="Accounts"
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xl"
          >
            +
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Total balance */}
        <div className="bg-surface rounded-2xl p-5">
          <p className="text-xs text-muted mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-white">{formatINR(totalBalance)}</p>
          <p className="text-xs text-muted mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 text-danger text-sm">
            {error}
          </div>
        )}

        {!loading && accounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏦</p>
            <p className="text-white font-medium">No accounts yet</p>
            <p className="text-muted text-sm mt-1">Add your bank accounts to get started</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium"
            >
              Add Account
            </button>
          </div>
        )}

        {!loading && accounts.length > 0 && (
          <div className="space-y-3">
            {accounts.map((a) => (
              <AccountCard key={a.id} account={a} onEdit={setEditAccount} />
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AccountSheet
          mode="add"
          onSave={async (data) => { await createAccount(data as Parameters<typeof createAccount>[0]); }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editAccount && (
        <AccountSheet
          mode="edit"
          initial={editAccount}
          onSave={async (data) => {
            await updateAccount(editAccount.id, {
              name: data.name,
              type: data.type,
              bank: data.bank ?? undefined,
              last_four: data.last_four ?? undefined,
              current_balance: data.current_balance,
            });
          }}
          onClose={() => setEditAccount(null)}
        />
      )}
    </div>
  );
}
