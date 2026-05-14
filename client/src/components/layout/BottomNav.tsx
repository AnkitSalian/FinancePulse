import { NavLink, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-muted'
    }`;

  return (
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

        <NavLink to="/more" className={navClass}>
          <span className="text-lg">⋯</span>
          <span>More</span>
        </NavLink>
      </div>
    </nav>
  );
}
