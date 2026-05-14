import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const MORE_ITEMS = [
  { label: 'Investments', path: '/investments' },
  { label: 'Net Worth', path: '/net-worth' },
  { label: 'Health Score', path: '/health-score' },
  { label: 'Loans', path: '/loans' },
  { label: 'Credit Cards', path: '/credit-cards' },
  { label: 'Reimbursements', path: '/reimbursements' },
  { label: 'Grow', path: '/grow' },
  { label: 'Accounts', path: '/accounts' },
];

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-muted'
    }`;

  return (
    <>
      {/* More sheet backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More bottom sheet */}
      {moreOpen && (
        <div className="fixed bottom-20 left-0 right-0 z-40 bg-surface rounded-t-2xl border-t border-border px-4 pt-4 pb-6">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="grid grid-cols-4 gap-3">
            {MORE_ITEMS.map((item) => (
              <button
                key={item.path}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-background text-muted text-xs font-medium"
                onClick={() => {
                  setMoreOpen(false);
                  navigate(item.path);
                }}
              >
                <span className="text-base">•</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-border pb-safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          <NavLink to="/" end className={navClass}>
            <span className="text-lg">🏠</span>
            <span>Home</span>
          </NavLink>

          <NavLink to="/transactions" className={navClass}>
            <span className="text-lg">📋</span>
            <span>Transactions</span>
          </NavLink>

          {/* FAB */}
          <button
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 -mt-5"
            onClick={() => navigate('/transactions?add=1')}
          >
            <span className="text-white text-2xl leading-none">+</span>
          </button>

          <NavLink to="/budget" className={navClass}>
            <span className="text-lg">📊</span>
            <span>Budget</span>
          </NavLink>

          <button
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              moreOpen ? 'text-primary' : 'text-muted'
            }`}
            onClick={() => setMoreOpen((o) => !o)}
          >
            <span className="text-lg">⋯</span>
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
