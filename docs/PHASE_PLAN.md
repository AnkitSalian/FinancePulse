# PHASE_PLAN.md — FinancePulse

## Current Phase: P1

---

## Phase 1 — Core Tracker (Weeks 1–4)
**Goal:** Working app where you can add, view, and categorize transactions with a basic dashboard.

### Backend
- [ ] Project setup: Node.js + Express + TypeScript + PostgreSQL
- [ ] DB migrations: users, accounts, categories, transactions, budgets
- [ ] Auth: register, login, JWT middleware
- [ ] Seed default categories on user creation
- [ ] CRUD: transactions (manual entry)
- [ ] CRUD: accounts
- [ ] CRUD: budgets (monthly, per category)
- [ ] GET /api/dashboard/summary — monthly totals, category breakdown
- [ ] GET /api/dashboard/budget-status — spend vs budget per category

### Frontend (PWA)
- [ ] Vite + React + TypeScript + Tailwind setup
- [ ] PWA manifest + service worker (Vite PWA plugin)
- [ ] Auth screens: Login, Register
- [ ] Bottom nav: Home, Transactions, Budget, Accounts, More
- [ ] Home screen: Daily Pulse (spend vs budget, days left, savings rate)
- [ ] Transactions screen: list, filter by month/category
- [ ] Add Transaction screen: manual entry form
- [ ] Budget screen: category budgets with utilization bars
- [ ] Accounts screen: account list with balances

### Acceptance Criteria P1
- User can register, login, and stay logged in (JWT persisted)
- User can add a transaction manually and see it in the list
- User can set budgets and see utilization on the dashboard
- PWA is installable on iPhone via "Add to Home Screen"
- Home screen shows correct monthly summary

---

## Phase 2 — Smart Capture + Alerts (Weeks 5–7)
**Goal:** iPhone Share Sheet integration, CSV import, EMI/credit card tracking, push alerts.

### Backend
- [ ] POST /api/transactions/extract — Claude Vision screenshot extraction
- [ ] POST /api/share-target — Web Share Target handler
- [ ] POST /api/transactions/csv-import — CSV upload + parse (HDFC, ICICI, SBI)
- [ ] CRUD: loans/EMIs
- [ ] CRUD: credit cards
- [ ] Auto-log monthly EMI transactions (cron)
- [ ] GET /api/pulse/upcoming-dues — EMIs + bills due in 7 days
- [ ] Budget alert logic (80% + overspend triggers)
- [ ] Push notification setup (Web Push)
- [ ] Cron: 3-day inactivity nudge

### Frontend
- [ ] Web Share Target registration in manifest
- [ ] Share Target landing page: image preview + comment + confirm form
- [ ] CSV upload screen with preview table
- [ ] EMI tracker screen
- [ ] Credit card tracker screen
- [ ] Reimbursement tracking in transaction detail
- [ ] Push notification permission prompt
- [ ] Due this week widget on Home screen

### Acceptance Criteria P2
- User can share a GPay screenshot → FinancePulse appears in iOS Share Sheet
- Screenshot is parsed by Claude Vision → pre-filled confirm form
- User can upload HDFC CSV → transactions appear with auto-categories
- EMIs and credit card dues appear on home screen pulse
- Budget alerts fire at 80% and 100% of category budget

---

## Phase 3 — Score + Net Worth + Grow (Weeks 8–11)
**Goal:** Financial Health Score, Net Worth tracker, investment tracking, recommendation engine.

### Backend
- [ ] DB migrations: investments, net_worth_snapshots, health_scores, reimbursements, salary_projections
- [ ] CRUD: investments
- [ ] Health score calculation service
- [ ] Cron: monthly score calculation (last day of month)
- [ ] CRUD: net worth snapshots (manual monthly update)
- [ ] GET /api/net-worth/trend — 12-month net worth chart data
- [ ] Investment recommendation engine (rule-based)
- [ ] Tax optimization: 80C/80D/NPS headroom calculation
- [ ] Salary projector: CTC scenarios over 3 years

### Frontend
- [ ] Health Score screen: current score, breakdown, 6-month trend
- [ ] Net Worth screen: assets/liabilities form + trend chart
- [ ] Investments screen: SIP/MF/PPF list + returns summary
- [ ] Grow screen: investment recommendations + tax headroom
- [ ] Salary Projector screen: CTC scenarios + projection chart

### Acceptance Criteria P3
- Health score is calculated and saved at month end
- Net worth can be updated monthly and trend is visible
- Investment recommendations show surplus allocation suggestions
- Tax deduction headroom is accurately calculated
- Salary projector shows 3-year income scenarios

---

## Phase 4 — ML Layer (Weeks 12–17)
**Goal:** NLP auto-categorization, cash flow forecasting, ML-enhanced recommendations.

### ML Service Setup
- [ ] Python FastAPI project setup
- [ ] Train NLP categorizer on Indian transaction data
- [ ] Integrate categorizer into transaction save flow (Node → ML service)
- [ ] Build Prophet cash flow forecaster
- [ ] GET /api/pulse/forecast — mid-month surplus/deficit prediction
- [ ] ML-enhanced investment recommendations using user history
- [ ] Model retraining pipeline using user category overrides

### Frontend
- [ ] Mid-month forecast widget on Home screen
- [ ] Category confidence indicator on transaction confirm form
- [ ] Forecast detail screen: spend velocity + projection chart

### Acceptance Criteria P4
- New transactions are auto-categorized with >80% accuracy
- Mid-month forecast is shown on home screen by day 10 of month
- Forecast updates daily based on spending velocity

---

## Phase 5 — MCP Server (Weeks 18–20)
**Goal:** Expose FinancePulse as an MCP server for conversational queries via Claude.

### MCP Server
- [ ] Node.js MCP server setup (@modelcontextprotocol/sdk)
- [ ] Implement all tool groups (see MCP_SERVER.md)
- [ ] Connect to PostgreSQL (read-only queries)
- [ ] Test locally with Claude Desktop
- [ ] Test with Claude Code

### Acceptance Criteria P5
- Claude Desktop can answer: "How much did I spend on food last month?"
- Claude Desktop can answer: "What is my current net worth?"
- Claude Desktop can answer: "Am I on track for my savings goal this month?"
- MCP server runs on localhost only, never exposed publicly
