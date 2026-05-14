# CLAUDE.md — FinancePulse

## What This Project Is
FinancePulse is a personal finance tracker + income growth engine built as a PWA for iPhone users in India. It tracks transactions, EMIs, credit cards, and investments while providing a daily financial pulse, monthly health score, net worth tracking, and AI-powered investment recommendations. It also exposes an MCP server so the user can query their finances conversationally via Claude.

---

## Always Read First
Before generating any code, always read these files in order:
1. `REQUIREMENTS.md` — what the app must do
2. `ARCHITECTURE.md` — how the system is structured
3. `DATA_MODELS.md` — database schemas (never invent your own schemas)
4. `PHASE_PLAN.md` — what is in scope for the current phase

Then read the relevant feature doc for the task at hand.

---

## Project Structure
```
financepulse/
├── client/                  # React PWA (Vite)
│   ├── public/
│   │   ├── manifest.json    # PWA + Share Target config
│   │   └── sw.js            # Service worker
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API call functions
│   │   ├── store/           # State management (Zustand)
│   │   └── utils/           # Helpers
├── server/                  # Node.js + Express API
│   ├── routes/              # Express route handlers
│   ├── controllers/         # Business logic
│   ├── services/            # DB queries, external API calls
│   ├── middleware/          # Auth, error handling
│   ├── db/
│   │   └── migrations/      # PostgreSQL migration files
│   └── utils/
├── ml/                      # Python FastAPI ML service
│   ├── main.py
│   ├── categorizer/         # NLP transaction classifier
│   ├── forecaster/          # Prophet cash flow forecaster
│   └── recommender/         # Investment recommendation engine
├── mcp/                     # MCP server (Node.js)
│   ├── index.ts
│   └── tools/               # One file per tool group
└── docs/                    # All .md spec files live here
```

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Zustand |
| PWA | Vite PWA plugin, Web Share Target API |
| Backend | Node.js 20, Express, JWT |
| Database | PostgreSQL 15 |
| ML Service | Python 3.11, FastAPI, scikit-learn, Prophet, Pandas |
| AI | Claude API — claude-sonnet-4-20250514 |
| MCP | @modelcontextprotocol/sdk (Node.js) |

---

## Coding Conventions

### General
- Use TypeScript everywhere (client + server + mcp)
- Use async/await, never raw promises or callbacks
- Always handle errors with try/catch and return structured error responses
- Never hardcode secrets — use environment variables

### Node/Express
- Controllers handle HTTP request/response only
- Services handle all business logic and DB queries
- Use `pg` (node-postgres) directly — no ORM
- All DB queries are in `/server/services/` as named functions
- Routes follow REST conventions: `GET /api/transactions`, `POST /api/transactions`, etc.

### React
- Functional components only, no class components
- One component per file
- Custom hooks for all data fetching (`useTransactions`, `useBudget`, etc.)
- Tailwind for all styling — no inline styles, no separate CSS files
- Never use `<form>` tags — use `onClick` handlers

### Python
- FastAPI for all ML endpoints
- Pydantic models for all request/response schemas
- All ML models are serialized with joblib and stored in `/ml/models/`

### Database
- All schema changes via migration files in `/server/db/migrations/`
- Migration files named: `001_create_transactions.sql`, `002_create_accounts.sql`, etc.
- Never alter the DB directly — always via migrations
- Use snake_case for all table and column names

---

## Environment Variables
```
# Server
DATABASE_URL=postgresql://localhost:5432/financepulse
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_claude_api_key
ML_SERVICE_URL=http://localhost:8001
PORT=3001

# Client
VITE_API_URL=http://localhost:3001
```

---

## Current Phase
Always check `PHASE_PLAN.md` before starting any task. Do not build features outside the current phase scope even if they seem related.

---

## Key Behaviors for Claude Code
- When generating DB migrations, always check `DATA_MODELS.md` for the exact schema
- When generating API routes, always check `API_ROUTES.md` for the exact spec
- When generating ML code, always check `ML_SERVICE.md` and `SKILLS.md`
- When generating MCP tools, always check `MCP_SERVER.md` and `AGENTS.md`
- Always generate the migration file before the service that uses it
- Always generate types/interfaces before the components that use them
- If a requirement is ambiguous, implement the simpler interpretation and add a TODO comment
