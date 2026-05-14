# FinancePulse

Personal finance tracker and income growth engine — built as a PWA for iPhone users in India.

Tracks transactions, EMIs, credit cards, and investments. Provides a daily financial pulse, monthly health score, net worth tracking, and AI-powered investment recommendations. Also exposes an MCP server so you can query your finances conversationally via Claude.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Zustand |
| PWA | vite-plugin-pwa, Web Share Target API |
| Backend | Node.js 20, Express, TypeScript, JWT |
| Database | PostgreSQL 15 |
| ML Service | Python 3.11, FastAPI, scikit-learn, Prophet, Pandas *(Phase 4)* |
| AI | Claude API (claude-sonnet-4-20250514) *(Phase 2+)* |
| MCP | @modelcontextprotocol/sdk *(Phase 5)* |

---

## Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15
- Python 3.11+ *(Phase 4 only)*

### 1. Clone and install

```bash
git clone <repo-url>
cd financepulse-v2

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Create the database

```bash
createdb financepulse
```

Run migrations in order:

```bash
psql financepulse < server/db/migrations/001_create_users.sql
psql financepulse < server/db/migrations/002_create_accounts.sql
psql financepulse < server/db/migrations/003_create_categories.sql
psql financepulse < server/db/migrations/004_create_transactions.sql
psql financepulse < server/db/migrations/005_create_budgets.sql
```

### 3. Environment variables

**server/.env**
```
DATABASE_URL=postgresql://localhost:5432/financepulse
JWT_SECRET=your_jwt_secret_here
ANTHROPIC_API_KEY=your_claude_api_key        # Phase 2+
ML_SERVICE_URL=http://localhost:8001          # Phase 4
PORT=3001
```

**client/.env**
```
VITE_API_URL=http://localhost:3001
```

### 4. Run

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — React PWA
cd client && npm run dev
```

App is available at `http://localhost:5173`.

### 5. Python ML service *(Phase 4)*

```bash
cd ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

---

## Folder Structure

```
financepulse-v2/
├── client/                  # React PWA (Vite)
│   ├── public/              # manifest.json, service worker
│   └── src/
│       ├── components/      # UI, charts, layout
│       ├── hooks/           # Data-fetching hooks
│       ├── pages/           # Route-level pages
│       ├── services/        # Axios instance
│       ├── store/           # Zustand auth store
│       ├── types/           # TypeScript interfaces
│       └── utils/           # currency, date helpers
├── server/                  # Node.js + Express API
│   ├── controllers/         # HTTP request handlers
│   ├── db/
│   │   └── migrations/      # SQL migration files
│   ├── middleware/          # Auth, error handling
│   ├── routes/              # Express routers
│   └── services/            # Business logic + DB queries
├── ml/                      # Python FastAPI ML service (Phase 4)
├── mcp/                     # MCP server (Phase 5)
└── docs/                    # Spec files (requirements, API, data models)
```

---

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | Core Tracker — transactions, budgets, accounts, daily pulse | ✅ Complete |
| P2 | Smart Capture — Share Sheet, CSV import, EMIs, credit cards, alerts | 🔜 Upcoming |
| P3 | Score + Net Worth + Grow — health score, investments, recommendations | 🔜 Upcoming |
| P4 | ML Layer — NLP categorization, cash flow forecasting | 🔜 Upcoming |
| P5 | MCP Server — conversational finance queries via Claude | 🔜 Upcoming |

### P1 Acceptance Criteria

- [x] User can register, log in, and stay logged in (JWT persisted in localStorage)
- [x] User can add a transaction manually and see it in the list
- [x] User can set budgets per category and see utilization bars
- [x] PWA is installable on iPhone via "Add to Home Screen"
- [x] Home screen shows correct monthly summary (spend, budget, savings rate, forecast)

### P1 Known Gaps (carry into P2)

- Home screen does not yet show upcoming EMI/credit card dues (loans and credit cards tables not yet seeded with data — UI wiring is complete)
- Transactions page does not yet support category filter UI (query param supported by API)
- Share Target page is a placeholder (requires Phase 2 Claude Vision integration)

---

## API Overview

Base URL: `http://localhost:3001/api`

All routes except `/auth/*` require `Authorization: Bearer <jwt_token>`.

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register new user (seeds default categories) |
| POST | /auth/login | Login |
| PATCH | /auth/profile | Update monthly income + risk appetite |
| GET | /api/transactions | List transactions (month, category, type filters) |
| POST | /api/transactions | Create transaction |
| PATCH | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| GET | /api/accounts | List accounts |
| POST | /api/accounts | Create account |
| PATCH | /api/accounts/:id | Update account balance |
| GET | /api/budgets?month= | List budgets with spent + utilization |
| POST | /api/budgets | Create budget |
| PATCH | /api/budgets/:id | Update budget amount |
| GET | /api/categories | List user categories |
| GET | /api/dashboard/summary?month= | Monthly totals + category breakdown |
| GET | /api/dashboard/budget-status?month= | Spend vs budget per category |
| GET | /api/pulse/daily | Daily pulse — spend, forecast, dues, alerts |
