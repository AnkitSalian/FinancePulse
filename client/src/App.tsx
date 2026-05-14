import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import BottomNav from './components/layout/BottomNav';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Accounts from './pages/Accounts';
import ShareTarget from './pages/ShareTarget';
import HealthScore from './pages/HealthScore';
import NetWorth from './pages/NetWorth';
import Investments from './pages/Investments';
import Grow from './pages/Grow';
import CreditCards from './pages/CreditCards';
import Loans from './pages/Loans';
import Reimbursements from './pages/Reimbursements';
import More from './pages/More';
import Settings from './pages/Settings';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
        <Route path="/budget" element={<Protected><Budget /></Protected>} />
        <Route path="/accounts" element={<Protected><Accounts /></Protected>} />
        <Route path="/share-target" element={<Protected><ShareTarget /></Protected>} />
        <Route path="/health-score" element={<Protected><HealthScore /></Protected>} />
        <Route path="/net-worth" element={<Protected><NetWorth /></Protected>} />
        <Route path="/investments" element={<Protected><Investments /></Protected>} />
        <Route path="/grow" element={<Protected><Grow /></Protected>} />
        <Route path="/credit-cards" element={<Protected><CreditCards /></Protected>} />
        <Route path="/loans" element={<Protected><Loans /></Protected>} />
        <Route path="/reimbursements" element={<Protected><Reimbursements /></Protected>} />
        <Route path="/more" element={<Protected><More /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}
