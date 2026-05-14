# ARCHITECTURE.md — FinancePulse

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    iPhone (User)                     │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  PWA (React) │  │  iOS Share   │  │   CSV     │ │
│  │  Home Screen │  │    Sheet     │  │  Upload   │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
└─────────┼────────────────┼────────────────┼─────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
┌─────────────────────────────────────────────────────┐
│              Node.js / Express API (Port 3001)       │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Transaction │  │   Budget &   │  │   Auth    │ │
│  │   Service    │  │  Score Svc   │  │  (JWT)    │ │
│  ├──────────────┤  ├──────────────┤  └───────────┘ │
│  │  Investment  │  │  Net Worth   │                  │
│  │   Service    │  │   Service    │                  │
│  ├──────────────┤  ├──────────────┤                  │
│  │  EMI/Loan    │  │  Credit Card │                  │
│  │   Service    │  │   Service    │                  │
│  └──────┬───────┘  └──────┬───────┘                  │
└─────────┼────────────────┼─────────────────────────┘
          │                │
    ┌─────┘                └──────┐
    ▼                             ▼
┌──────────┐              ┌──────────────────────────┐
│PostgreSQL│              │  Claude API              │
│  Port    │              │  (claude-sonnet-          │
│  5432    │              │   4-20250514)             │
└──────────┘              │  - Vision (screenshots)  │
                          │  - Recommendations       │
                          └──────────────────────────┘
          │
    ┌─────▼──────────────────────────┐
    │  Python FastAPI ML (Port 8001) │
    │  - NLP Categorizer             │
    │  - Cash Flow Forecaster        │
    │  - Investment Recommender      │
    └────────────────────────────────┘
          │
    ┌─────▼──────────────────────────┐
    │  MCP Server (Port 3002)        │
    │  - Exposes finance tools       │
    │  - Connects to PostgreSQL      │
    │  - Used by Claude Desktop/Code │
    └────────────────────────────────┘
```

---

## Layer Responsibilities

### Client (React PWA)
- All UI rendering and user interactions
- Installed on iPhone Home Screen via PWA
- Registered as Share Target — receives screenshots from iOS Share Sheet
- Offline support via service worker (read-only cached views)
- Communicates only with Node API — never directly with ML service or Claude API

### Node.js API
- Single entry point for all client requests
- Handles JWT authentication on all protected routes
- Calls Claude API for screenshot vision extraction
- Calls ML service for categorization and forecasting
- Handles CSV parsing and normalization
- Runs cron jobs for monthly score calculation, due date alerts

### PostgreSQL
- Single source of truth for all financial data
- All schema changes via numbered migration files
- No ORM — raw SQL via `pg` (node-postgres)

### Python ML Service
- Separate process, called internally by Node API only
- Never exposed to client directly
- Hosts trained NLP categorizer model
- Hosts Prophet time-series forecasting model
- Hosts rule-based + ML investment recommendation engine

### Claude API
- Called by Node API for two purposes only:
  1. Screenshot vision extraction (GPay, HDFC screenshots)
  2. Investment recommendation narrative generation (Phase 3+)
- Model: `claude-sonnet-4-20250514`
- Images are never stored — processed in memory, only extracted data is saved

### MCP Server
- Separate Node.js process (Phase 5)
- Connects directly to PostgreSQL
- Exposes finance data as MCP tools
- Runs on localhost only — never publicly exposed
- Used via Claude Desktop or Claude Code for conversational finance queries

---

## Data Flow — Screenshot Transaction

```
1. User takes GPay screenshot on iPhone
2. Taps Share → selects FinancePulse from Share Sheet
3. PWA opens at /share-target with image in memory
4. User adds optional comment
5. Client POSTs image (base64) + comment to POST /api/transactions/extract
6. Node API sends image to Claude Vision API
7. Claude returns: { amount, merchant, date, type, upi_ref }
8. Node API sends merchant + description to ML categorizer
9. ML returns: { category, confidence }
10. Node API returns pre-filled transaction object to client
11. User reviews, edits if needed, confirms
12. Client POSTs confirmed transaction to POST /api/transactions
13. Saved to PostgreSQL
```

## Data Flow — CSV Import

```
1. User downloads statement from HDFC/ICICI NetBanking
2. Uploads CSV via PWA
3. Node API parses CSV, normalizes rows to transaction shape
4. Each row sent to ML categorizer in batch
5. User sees preview table with categories
6. User confirms (bulk) or edits individual rows
7. All confirmed transactions saved to PostgreSQL
```

## Data Flow — Monthly Health Score

```
1. Cron job triggers on last day of month at 11 PM
2. Score service fetches month's transactions, EMI payments, SIP consistency
3. Calculates 5 component scores
4. Weighted average = final score (0-100)
5. Score snapshot saved to health_scores table
6. Push notification sent to user with score summary
```

---

## Port Map
| Service | Port |
|---------|------|
| React PWA (dev) | 5173 |
| Node API | 3001 |
| Python ML | 8001 |
| MCP Server | 3002 |
| PostgreSQL | 5432 |

---

## Key Architectural Decisions

### Why no ORM?
Raw SQL gives full control over query performance, especially for date-range aggregations needed for health score and forecasting. With financial data, query predictability matters more than convenience.

### Why separate ML service?
Python has the best ML ecosystem. Keeping it separate means the ML models can be updated and redeployed independently without touching the Node API.

### Why Claude API for screenshots instead of a dedicated OCR?
Claude Vision handles the wide variety of GPay and bank screenshot layouts out of the box without training. A dedicated OCR would need significant fine-tuning for Indian bank formats.

### Why PWA instead of React Native?
Stack alignment — Ankit already knows React. PWA covers 90% of the use case (daily entry, dashboard viewing). React Native can be a future upgrade path.
