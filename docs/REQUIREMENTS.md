# REQUIREMENTS.md — FinancePulse

## Project Overview
FinancePulse is a personal finance tracker with proactive intelligence for salaried professionals in India. It tracks expenses, EMIs, credit cards, and investments while providing a daily financial pulse, monthly health score, net worth tracking, and income growth guidance.

---

## Functional Requirements

### REQ-001 — Transaction Management
- REQ-001.1: User can add a transaction manually (amount, merchant, category, date, comment)
- REQ-001.2: User can edit or delete any transaction
- REQ-001.3: User can share a GPay/HDFC screenshot via iOS Share Sheet to the PWA
- REQ-001.4: Claude Vision API extracts amount, merchant, date, type from screenshot
- REQ-001.5: User can add a comment to a screenshot before confirming
- REQ-001.6: Extracted transaction is shown in a pre-filled confirm form before saving
- REQ-001.7: User can upload a bank CSV statement for bulk import (HDFC, ICICI, SBI formats)
- REQ-001.8: Transactions can be tagged as reimbursable with a payer name
- REQ-001.9: Reimbursable transactions are tracked separately with pending/settled status

### REQ-002 — Auto Categorization
- REQ-002.1: Transactions are auto-categorized using an NLP classifier
- REQ-002.2: Categories: Food, Transport, Shopping, Health, Entertainment, Utilities, Education, EMI, Investment, Credit Card Payment, Home, Reimbursable, Other
- REQ-002.3: User can override the auto-assigned category
- REQ-002.4: Overrides are used to retrain/improve the classifier over time

### REQ-003 — EMI & Loan Tracking
- REQ-003.1: User can add a loan with principal, interest rate, tenure, start date, EMI amount
- REQ-003.2: App calculates and displays remaining principal, paid amount, and months left
- REQ-003.3: Monthly EMI is auto-logged as a transaction on the due date
- REQ-003.4: EMIs due in the next 7 days are surfaced on the daily pulse

### REQ-004 — Credit Card Tracking
- REQ-004.1: User can add a credit card with name, limit, billing cycle date, due date
- REQ-004.2: User can log credit card spends against a specific card
- REQ-004.3: App shows outstanding amount, minimum due, full due, and due date
- REQ-004.4: App flags if only minimum due was paid (negative health score impact)
- REQ-004.5: Credit utilization % is shown per card and in aggregate

### REQ-005 — Investment Tracking
- REQ-005.1: User can add investments: SIP, MF, PPF, NPS, FD, ELSS
- REQ-005.2: Each investment has name, type, amount, frequency, start date, maturity date
- REQ-005.3: Monthly SIP amounts are auto-logged as transactions
- REQ-005.4: User can update current value of MF/investments manually
- REQ-005.5: Total invested vs current value is shown with absolute and % returns

### REQ-006 — Budget Management
- REQ-006.1: User can set a monthly budget per category
- REQ-006.2: App shows budget utilization % per category in real time
- REQ-006.3: Alert is triggered when a category crosses 80% of budget
- REQ-006.4: Alert is triggered when a category is overspent
- REQ-006.5: User can set an overall monthly spend limit

### REQ-007 — Daily Pulse
- REQ-007.1: Home screen shows total spent vs monthly budget for current month
- REQ-007.2: Home screen shows days remaining in the month
- REQ-007.3: Home screen shows bills and EMIs due in the next 7 days
- REQ-007.4: Home screen shows mid-month forecast — projected month-end surplus/deficit
- REQ-007.5: Home screen shows current savings rate for the month
- REQ-007.6: App sends a push notification if no transaction logged in 3 days

### REQ-008 — Financial Health Score
- REQ-008.1: A monthly score (0–100) is calculated based on weighted metrics
- REQ-008.2: Score components: savings rate (30%), budget adherence (25%), EMI-to-income ratio (20%), SIP consistency (15%), credit card full payment (10%)
- REQ-008.3: Score is calculated on the last day of each month and stored as a snapshot
- REQ-008.4: Score trend (last 6 months) is shown as a line chart
- REQ-008.5: Breakdown shows what pulled the score up or down vs previous month

### REQ-009 — Net Worth Tracking
- REQ-009.1: User can add assets: savings account balance, FD, MF current value, PF balance, property value (manual)
- REQ-009.2: User can add liabilities: home loan outstanding, personal loan, credit card outstanding
- REQ-009.3: Net worth = total assets - total liabilities
- REQ-009.4: A monthly net worth snapshot is saved automatically
- REQ-009.5: Net worth trend is shown as a line chart over time

### REQ-010 — Investment Recommendation Engine
- REQ-010.1: App calculates monthly surplus (income - EMIs - expenses - existing SIPs)
- REQ-010.2: App suggests how to allocate surplus across MF, PPF, NPS, ELSS, emergency fund
- REQ-010.3: App shows remaining 80C, 80D, 80CCD(1B) tax deduction headroom
- REQ-010.4: Recommendations are rule-based in Phase 3, ML-enhanced in Phase 4
- REQ-010.5: User can set risk appetite: conservative, moderate, aggressive

### REQ-011 — Salary & Growth Projector
- REQ-011.1: User can input current CTC, expected annual raise %, and promotion timeline
- REQ-011.2: App projects income over 1, 2, 3 years under different scenarios
- REQ-011.3: User can log learning expenses (courses, certifications)
- REQ-011.4: App shows ROI of learning spend mapped against projected salary delta

### REQ-012 — MCP Server
- REQ-012.1: An MCP server exposes FinancePulse data as tools queryable by Claude
- REQ-012.2: Tools cover transactions, budget, health score, net worth, investments, EMIs
- REQ-012.3: MCP server runs on localhost, connects to the same PostgreSQL DB
- REQ-012.4: User can query their finances conversationally via Claude Desktop or Claude Code

---

## Non-Functional Requirements

### REQ-NF-001 — Platform
- App is a Progressive Web App (PWA) installable on iPhone via "Add to Home Screen"
- App appears in iOS Share Sheet after installation
- App works offline for viewing cached data

### REQ-NF-002 — Performance
- Transaction list loads in under 1 second for up to 1000 transactions
- Health score calculation completes within 3 seconds
- Screenshot extraction via Claude Vision returns within 5 seconds

### REQ-NF-003 — Security
- All API endpoints are protected with JWT authentication
- Screenshot data is never stored permanently — only the extracted transaction is saved
- MCP server is localhost-only, never exposed publicly

### REQ-NF-004 — Stack
- Frontend: React + Tailwind + Recharts (PWA)
- Backend: Node.js + Express
- ML Service: Python + FastAPI
- Database: PostgreSQL
- AI: Claude API (claude-sonnet-4-20250514) for Vision + Recommendations
- MCP: Node.js MCP server using @modelcontextprotocol/sdk

### REQ-NF-005 — Data
- All financial data is stored locally (self-hosted PostgreSQL)
- No third-party analytics or tracking
- CSV imports are processed server-side and raw files are deleted after parsing
