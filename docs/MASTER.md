# MASTER.md — FinancePulse

## Project
**FinancePulse** — Personal finance tracker + income growth engine for iPhone users in India.
Built as a PWA with React + Node.js + Python ML + PostgreSQL + Claude API + MCP server.

**Developer:** Ankit (Software Engineer, BofA Mumbai)  
**Stack:** React 18, Vite, Tailwind, Node.js 20, Express, PostgreSQL 15, Python 3.11, FastAPI, Claude API

---

## Documentation Map
Read files in this order for full project context:

### Foundation (always read before coding)
| Order | File | What It Contains |
|-------|------|-----------------|
| 1 | `CLAUDE.md` | Project conventions, folder structure, tech stack, coding rules |
| 2 | `REQUIREMENTS.md` | All functional (REQ-001 to REQ-012) and non-functional requirements |
| 3 | `ARCHITECTURE.md` | System diagram, layer responsibilities, data flows, port map |
| 4 | `DATA_MODELS.md` | All PostgreSQL table schemas with exact column types |
| 5 | `PHASE_PLAN.md` | P1→P5 task checklist with acceptance criteria |

### Feature Docs (read when working on that feature)
| File | Feature Area |
|------|-------------|
| `API_ROUTES.md` | All REST endpoints with request/response shapes |
| `TRANSACTION_SERVICE.md` | Manual entry, iOS Share Sheet, CSV import, reimbursements |
| `BUDGET_ENGINE.md` | Budget tracking, alerts, mid-month forecast |
| `HEALTH_SCORE.md` | Monthly score formula, components, cron job |
| `NET_WORTH.md` | Assets/liabilities tracking, monthly snapshots |
| `INVESTMENT_ENGINE.md` | Surplus calculation, tax headroom, allocation rules |
| `SALARY_PROJECTOR.md` | CTC scenarios, certification ROI |
| `FRONTEND_STRUCTURE.md` | React component tree, pages, hooks, design tokens |

### AI Layer (read in Phases 4–5)
| File | Area |
|------|------|
| `SKILLS.md` | Reusable skill definitions with inputs/outputs |
| `AGENTS.md` | Agent roles, responsibilities, MCP tools per agent |
| `ML_SERVICE.md` | Python FastAPI ML service — categorizer + forecaster |
| `MCP_SERVER.md` | MCP server setup, all tool definitions, Claude Desktop config |

---

## Phase Summary
| Phase | What Gets Built | Key Learning |
|-------|----------------|-------------|
| P1 | Core tracker, manual transactions, budgets, basic dashboard, PWA install | React PWA, Node API, PostgreSQL |
| P2 | iOS Share Sheet, Claude Vision, CSV import, EMI/credit card, alerts | Webhooks, Claude API, push notifications |
| P3 | Health Score, Net Worth, Investments, Tax optimizer, Salary projector | System design, product thinking |
| P4 | ML categorizer, Prophet forecasting, ML recommendations | NLP, time-series, FastAPI |
| P5 | MCP server, conversational finance queries via Claude | MCP protocol, agent composition |

---

## How to Use This With Claude Code

### Folder Setup
Place all `.md` files inside a `docs/` folder at the project root:
```
financepulse/
├── docs/
│   ├── MASTER.md
│   ├── CLAUDE.md
│   ├── REQUIREMENTS.md
│   └── ... (all 18 .md files)
├── client/
├── server/
├── ml/
└── mcp/
```

### Starting a new session
```
CLAUDE.md is auto-loaded by Claude Code on every session start.
Always tell Claude Code which phase and feature you are working on.
Reference docs/ files explicitly in every prompt.
```

---

## Session Prompts by Task

### 🚀 First ever session — Scaffold + Migrations
```
Read docs/MASTER.md, docs/CLAUDE.md, docs/REQUIREMENTS.md, 
docs/ARCHITECTURE.md, docs/DATA_MODELS.md, and docs/PHASE_PLAN.md in that order.

We are building FinancePulse — a personal finance tracker PWA for iPhone users in India.
Current phase: P1.

Do the following in sequence:
1. Scaffold the full project folder structure with all empty placeholder files
   exactly as defined in docs/CLAUDE.md. Do not add extra folders.
2. Generate PostgreSQL migration files for all Phase 1 tables defined in docs/DATA_MODELS.md:
   users, accounts, categories, transactions, budgets.
   Place them in server/db/migrations/ named 001_create_users.sql through 005_create_budgets.sql.
3. Initialize a git repo, add all files, and make an initial commit: 
   "feat: scaffold project structure and P1 migrations"

Do not build any feature logic yet — structure and migrations only.
```

---

### P1 — Auth endpoints
```
Read docs/CLAUDE.md, docs/API_ROUTES.md, docs/DATA_MODELS.md.

Implement the Auth endpoints:
  POST /api/auth/register
  POST /api/auth/login
  PATCH /api/auth/profile

Follow the controller/service pattern from docs/CLAUDE.md.
Use exact request/response shapes from docs/API_ROUTES.md.
Seed default categories on user registration as defined in docs/TRANSACTION_SERVICE.md.
```

### P1 — Transaction CRUD
```
Read docs/API_ROUTES.md, docs/TRANSACTION_SERVICE.md, docs/DATA_MODELS.md.

Implement:
  GET /api/transactions
  POST /api/transactions
  PATCH /api/transactions/:id
  DELETE /api/transactions/:id

Use exact request/response shapes from docs/API_ROUTES.md.
Follow controller/service pattern from docs/CLAUDE.md.
```

### P1 — Dashboard + Budget endpoints
```
Read docs/API_ROUTES.md, docs/BUDGET_ENGINE.md, docs/DATA_MODELS.md.

Implement:
  GET /api/budgets
  POST /api/budgets
  PATCH /api/budgets/:id
  GET /api/dashboard/summary
  GET /api/dashboard/budget-status

Use the exact SQL query from docs/BUDGET_ENGINE.md for budget utilization.
```

### P1 — React PWA frontend scaffold
```
Read docs/CLAUDE.md, docs/FRONTEND_STRUCTURE.md, docs/PHASE_PLAN.md.

Set up the React PWA:
1. Vite + React + TypeScript + Tailwind CSS project in client/
2. Install and configure vite-plugin-pwa with manifest from docs/FRONTEND_STRUCTURE.md
3. Set up React Router with all page routes defined in docs/FRONTEND_STRUCTURE.md
4. Create bottom navigation component (Home, Transactions, FAB, Budget, More)
5. Create placeholder page components for all P1 pages
6. Set up Zustand auth store and Axios API service with JWT interceptor
```

---

### P2 — iOS Share Sheet + Claude Vision
```
Read docs/TRANSACTION_SERVICE.md, docs/API_ROUTES.md, docs/FRONTEND_STRUCTURE.md.

Implement the full iOS Share Sheet + screenshot extraction flow:
1. Add share_target to PWA manifest (docs/FRONTEND_STRUCTURE.md)
2. Implement service worker Share Target handler (docs/TRANSACTION_SERVICE.md)
3. Build ShareTarget.tsx page — image preview, comment input, extract button
4. Implement POST /api/transactions/extract using Claude Vision API
   (model: claude-sonnet-4-20250514, prompt as defined in docs/TRANSACTION_SERVICE.md)
5. Return pre-filled transaction object to confirm form
```

### P2 — CSV Import
```
Read docs/TRANSACTION_SERVICE.md, docs/API_ROUTES.md.

Implement:
  POST /api/transactions/csv-import (parse + preview)
  POST /api/transactions/csv-import/:import_id/confirm

Support HDFC, ICICI, SBI column mappings from docs/TRANSACTION_SERVICE.md.
Use papaparse for CSV parsing.
Call ML categorizer in batch for all rows.
```

### P2 — EMI + Credit Card tracking
```
Read docs/API_ROUTES.md, docs/DATA_MODELS.md.

Implement:
  POST/GET /api/loans
  POST/GET /api/credit-cards
  PATCH /api/credit-cards/:id/payment
  GET /api/pulse/daily

Include upcoming dues logic (next 7 days) in the daily pulse endpoint.
```

---

### P3 — Health Score
```
Read docs/HEALTH_SCORE.md, docs/DATA_MODELS.md, docs/SKILLS.md.

Implement:
1. health_scores migration
2. calculateHealthScore() service with all 5 components and weights
   exactly as defined in docs/HEALTH_SCORE.md
3. Monthly cron job (last day of month, 11 PM IST)
4. GET /api/health-score and GET /api/health-score/trend endpoints
5. HealthScore.tsx page with SVG score ring, breakdown, and 6-month trend chart
```

### P3 — Net Worth
```
Read docs/NET_WORTH.md, docs/DATA_MODELS.md, docs/API_ROUTES.md.

Implement:
1. net_worth_snapshots migration
2. Auto-prefill from loans and credit_cards tables
3. POST /api/net-worth/snapshot and GET /api/net-worth/trend
4. NetWorth.tsx page with assets/liabilities form and trend chart
```

### P3 — Investment Engine + Tax Optimizer
```
Read docs/INVESTMENT_ENGINE.md, docs/DATA_MODELS.md, docs/API_ROUTES.md, docs/SKILLS.md.

Implement:
1. investments migration
2. calculateMonthlySurplus() skill
3. calculateTaxHeadroom() skill (80C, 80D, 80CCD1B)
4. generateRecommendations() with rule-based priority order from docs/INVESTMENT_ENGINE.md
5. GET /api/investments/recommendations endpoint
6. Investments.tsx and Grow.tsx pages
```

---

### P4 — ML Service setup + Categorizer
```
Read docs/ML_SERVICE.md, docs/SKILLS.md.

Set up the Python FastAPI ML service in ml/:
1. Project structure and requirements.txt from docs/ML_SERVICE.md
2. TF-IDF + Logistic Regression categorizer pipeline
3. Seed training data for Indian transaction categories
4. POST /categorize and POST /categorize/batch endpoints
5. Joblib model serialization to ml/models/
6. Integrate into Node API: call ML service on every transaction save
```

### P4 — Prophet Forecaster
```
Read docs/ML_SERVICE.md, docs/BUDGET_ENGINE.md.

Replace the linear forecast in Node API with Prophet:
1. Implement POST /forecast in the ML service using Prophet
2. Update GET /api/pulse/forecast in Node API to call ML service
3. Update the forecast widget in Home.tsx
```

---

### P5 — MCP Server
```
Read docs/MCP_SERVER.md, docs/AGENTS.md, docs/SKILLS.md, docs/DATA_MODELS.md.

Implement the full MCP server in mcp/:
1. Node.js + TypeScript setup with @modelcontextprotocol/sdk
2. StdioServerTransport connection
3. All tool groups: transaction, budget, health score, net worth, investment tools
   with exact schemas from docs/MCP_SERVER.md
4. PostgreSQL read-only connection
5. Generate Claude Desktop config snippet (docs/MCP_SERVER.md)
6. Generate .claude/settings.json for Claude Code integration

Test by asking: "How much did I spend on food last month?"
```
