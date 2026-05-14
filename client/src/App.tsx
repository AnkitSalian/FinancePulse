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

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Transactions />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Budget />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Accounts />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/share-target"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ShareTarget />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-score"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HealthScore />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/net-worth"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NetWorth />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/investments"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Investments />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/grow"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Grow />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/credit-cards"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreditCards />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Loans />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reimbursements"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Reimbursements />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
