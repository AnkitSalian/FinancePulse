import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Investments', icon: '📈', path: '/investments', description: 'SIPs, MF, PPF, NPS' },
  { label: 'Net Worth', icon: '💎', path: '/net-worth', description: 'Assets & liabilities' },
  { label: 'Health Score', icon: '🏆', path: '/health-score', description: 'Monthly financial score' },
  { label: 'Loans & EMIs', icon: '🏠', path: '/loans', description: 'Home, car, personal loans' },
  { label: 'Credit Cards', icon: '💳', path: '/credit-cards', description: 'Card tracker & dues' },
  { label: 'Reimbursements', icon: '💸', path: '/reimbursements', description: 'Pending recoveries' },
  { label: 'Grow', icon: '🚀', path: '/grow', description: 'Salary projector & learning ROI' },
  { label: 'Accounts', icon: '🏦', path: '/accounts', description: 'Bank accounts & wallets' },
  { label: 'Settings', icon: '⚙️', path: '/settings', description: 'Profile & preferences' },
];

export default function More() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      {/* User banner */}
      <div className="px-4 pt-14 pb-4">
        <div className="bg-surface rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-muted text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 space-y-1">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full bg-surface rounded-2xl p-4 flex items-center gap-4 active:opacity-80 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-xl shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{item.label}</p>
              <p className="text-muted text-xs mt-0.5">{item.description}</p>
            </div>
            <span className="text-muted text-lg">›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-surface rounded-2xl py-4 text-danger font-medium text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
