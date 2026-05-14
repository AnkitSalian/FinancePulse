# FRONTEND_STRUCTURE.md — FinancePulse

## Stack
React 18 + Vite + TypeScript + Tailwind CSS + Recharts + Zustand

## PWA
Vite PWA plugin (`vite-plugin-pwa`) — handles manifest, service worker, and offline caching automatically.

---

## Folder Structure
```
client/src/
├── components/
│   ├── ui/                    # Base components: Button, Input, Card, Badge, Modal, BottomSheet
│   ├── charts/                # LineChart, DonutChart, BarChart, ProgressBar wrappers
│   ├── transaction/           # TransactionCard, TransactionList, AddTransactionForm, ConfirmExtractForm
│   ├── budget/                # BudgetBar, BudgetSummary, CategoryBudgetCard
│   ├── pulse/                 # DailyPulseCard, ForecastWidget, UpcomingDuesCard, AlertBanner
│   ├── score/                 # HealthScoreRing, ScoreBreakdown, ScoreTrendChart
│   ├── networth/              # NetWorthCard, AssetLiabilityForm, NetWorthTrendChart
│   ├── investments/           # InvestmentCard, RecommendationCard, TaxHeadroomCard
│   └── layout/                # BottomNav, PageHeader, LoadingSpinner, EmptyState
├── pages/
│   ├── Home.tsx               # Daily Pulse — main landing page
│   ├── Transactions.tsx       # Transaction list + filters
│   ├── AddTransaction.tsx     # Manual add form
│   ├── ShareTarget.tsx        # iOS Share Sheet landing page
│   ├── Budget.tsx             # Category budgets
│   ├── HealthScore.tsx        # Monthly score + trend
│   ├── NetWorth.tsx           # Net worth snapshot + trend
│   ├── Investments.tsx        # Investment list + recommendations
│   ├── Grow.tsx               # Salary projector + learning ROI
│   ├── Accounts.tsx           # Bank accounts + wallets
│   ├── CreditCards.tsx        # Credit card tracker
│   ├── Loans.tsx              # EMI + loan tracker
│   ├── Reimbursements.tsx     # Pending reimbursements
│   ├── Login.tsx
│   └── Register.tsx
├── hooks/
│   ├── useTransactions.ts
│   ├── useBudget.ts
│   ├── usePulse.ts
│   ├── useHealthScore.ts
│   ├── useNetWorth.ts
│   ├── useInvestments.ts
│   └── useAuth.ts
├── services/
│   ├── api.ts                 # Axios instance with JWT interceptor
│   ├── transactions.ts
│   ├── budget.ts
│   ├── pulse.ts
│   ├── healthScore.ts
│   ├── netWorth.ts
│   └── investments.ts
├── store/
│   └── authStore.ts           # Zustand: user, token, login, logout
├── utils/
│   ├── currency.ts            # formatINR(amount) → "₹1,23,456"
│   ├── date.ts                # formatMonth, getMonthRange, etc.
│   └── shareTarget.ts         # IndexedDB read/write for Share Target
└── types/
    └── index.ts               # All TypeScript interfaces
```

---

## Navigation
Bottom navigation bar (5 tabs):
```
🏠 Home    📋 Transactions    ➕ (FAB)    📊 Budget    ⋯ More
```

"More" tab opens a sheet with: Investments, Net Worth, Health Score, Loans, Credit Cards, Reimbursements, Grow, Accounts, Settings.

FAB (floating action button) → opens Add Transaction bottom sheet directly.

---

## Key Component Specs

### DailyPulseCard (Home page — above fold)
```
┌─────────────────────────────────────┐
│ June 2025 • 18 days elapsed         │
│                                     │
│ Spent: ₹87,400 / ₹1,50,000         │
│ ████████████░░░░░░ 58%              │
│                                     │
│ Savings Rate: 43% 🟢                │
│ Forecast: +₹18,200 surplus          │
└─────────────────────────────────────┘
```

### HealthScoreRing
- SVG circular progress ring
- Color changes by score range (see HEALTH_SCORE.md)
- Animated on mount
- Shows score number in center

### TransactionCard
```
[Icon] Swiggy                  -₹450
       Food & Dining · Jun 15   [Reimbursable badge]
       "Team dinner"
```

---

## Currency Formatting
```typescript
// utils/currency.ts
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}
// Output: ₹1,23,456
```

---

## PWA Manifest (key fields)
```json
{
  "name": "FinancePulse",
  "short_name": "FinancePulse",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "share_target": {
    "action": "/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [{ "name": "screenshot", "accept": ["image/*"] }]
    }
  }
}
```

---

## Design Tokens (Tailwind config)
```javascript
// Dark-first design — financial apps feel more premium in dark mode
colors: {
  background: '#0f172a',     // slate-900
  surface: '#1e293b',        // slate-800
  border: '#334155',         // slate-700
  primary: '#6366f1',        // indigo-500
  success: '#22c55e',        // green-500
  warning: '#eab308',        // yellow-500
  danger: '#ef4444',         // red-500
  muted: '#94a3b8'           // slate-400
}
```
