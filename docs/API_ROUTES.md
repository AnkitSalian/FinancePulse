# API_ROUTES.md — FinancePulse

## Base URL
`http://localhost:3001/api`

All routes except `/auth/*` require `Authorization: Bearer <jwt_token>` header.

---

## Auth

### POST /auth/register
```json
// Request
{ "name": "Ankit", "email": "ankit@example.com", "password": "secret123" }

// Response 201
{ "token": "jwt_token", "user": { "id": "uuid", "name": "Ankit", "email": "ankit@example.com" } }
```

### POST /auth/login
```json
// Request
{ "email": "ankit@example.com", "password": "secret123" }

// Response 200
{ "token": "jwt_token", "user": { "id": "uuid", "name": "Ankit", "email": "ankit@example.com" } }
```

### PATCH /auth/profile
```json
// Request
{ "monthly_income": 250000, "risk_appetite": "moderate" }

// Response 200
{ "user": { ...updated user } }
```

---

## Transactions

### GET /transactions
```
Query params: month (YYYY-MM), category_id, type (debit|credit), source, limit, offset
Response 200: { transactions: [...], total: number, page_info: {...} }
```

### POST /transactions
```json
// Request
{
  "account_id": "uuid",
  "category_id": "uuid",
  "amount": 450.00,
  "type": "debit",
  "merchant": "Swiggy",
  "description": "Dinner order",
  "comment": "Team dinner, reimbursable",
  "transaction_date": "2025-06-15",
  "is_reimbursable": true,
  "source": "manual"
}
// Response 201: { transaction: {...} }
```

### PATCH /transactions/:id
```json
// Request: any updatable fields
{ "category_id": "uuid", "comment": "updated comment" }
// Response 200: { transaction: {...} }
```

### DELETE /transactions/:id
```
Response 204: no content
```

### POST /transactions/extract
```json
// Request (multipart/form-data)
{ "screenshot": <image_file>, "comment": "optional user comment" }

// Response 200
{
  "extracted": {
    "amount": 450.00,
    "merchant": "Swiggy",
    "date": "2025-06-15",
    "type": "debit",
    "upi_ref": "123456789012"
  },
  "suggested_category_id": "uuid",
  "confidence": 0.87
}
```

### POST /transactions/csv-import
```json
// Request (multipart/form-data)
{ "file": <csv_file>, "bank": "hdfc" }

// Response 200
{
  "preview": [
    { "row": 1, "amount": 450, "merchant": "Swiggy", "date": "2025-06-15", "suggested_category": "Food", "confidence": 0.91 }
  ],
  "total_rows": 45,
  "import_id": "uuid"  // used to confirm import
}
```

### POST /transactions/csv-import/:import_id/confirm
```json
// Request
{ "rows": [{ "row": 1, "category_id": "uuid", "include": true }] }
// Response 201: { imported: number, skipped: number }
```

### POST /share-target
```
Handles iOS Share Sheet POST (multipart/form-data)
Redirects to /share-target?extracted=<base64_json> on client
```

---

## Accounts

### GET /accounts
```
Response 200: { accounts: [...] }
```

### POST /accounts
```json
{ "name": "HDFC Savings", "type": "savings", "bank": "HDFC", "last_four": "1234", "current_balance": 125000 }
// Response 201: { account: {...} }
```

### PATCH /accounts/:id
```json
{ "current_balance": 130000 }
// Response 200: { account: {...} }
```

---

## Budgets

### GET /budgets?month=2025-06
```
Response 200: { budgets: [{ category_id, category_name, budgeted, spent, utilization_percent }] }
```

### POST /budgets
```json
{ "category_id": "uuid", "month": "2025-06-01", "amount": 8000 }
// Response 201: { budget: {...} }
```

### PATCH /budgets/:id
```json
{ "amount": 10000 }
// Response 200: { budget: {...} }
```

---

## Loans

### GET /loans
```
Response 200: { loans: [{ ...loan, remaining_months, total_paid, outstanding_principal }] }
```

### POST /loans
```json
{
  "name": "HDFC Home Loan",
  "type": "home",
  "principal": 5000000,
  "interest_rate": 8.5,
  "tenure_months": 240,
  "emi_amount": 43391,
  "start_date": "2023-01-01",
  "emi_due_day": 5
}
// Response 201: { loan: {...} }
```

---

## Credit Cards

### GET /credit-cards
```
Response 200: { cards: [{ ...card, utilization_percent, days_until_due }] }
```

### POST /credit-cards
```json
{ "name": "HDFC Regalia", "bank": "HDFC", "last_four": "5678", "credit_limit": 500000, "billing_cycle_day": 25, "due_day": 15 }
// Response 201: { card: {...} }
```

### PATCH /credit-cards/:id/payment
```json
{ "amount": 45000, "payment_type": "full" }  // full | minimum | partial
// Response 200: { card: {...} }
```

---

## Investments

### GET /investments
```
Response 200: { investments: [{ ...investment, total_invested, current_value, returns_percent }] }
```

### POST /investments
```json
{
  "name": "Axis Bluechip SIP",
  "type": "sip",
  "amount": 5000,
  "frequency": "monthly",
  "start_date": "2024-01-01",
  "is_80c_eligible": false
}
// Response 201: { investment: {...} }
```

### PATCH /investments/:id/value
```json
{ "current_value": 125000 }
// Response 200: { investment: {...} }
```

---

## Dashboard & Pulse

### GET /dashboard/summary?month=2025-06
```json
// Response 200
{
  "month": "2025-06",
  "total_income": 250000,
  "total_expenses": 142000,
  "savings": 108000,
  "savings_rate": 43.2,
  "category_breakdown": [
    { "category": "Food", "amount": 12000, "budget": 15000, "utilization": 80 }
  ]
}
```

### GET /pulse/daily
```json
// Response 200
{
  "month_budget": 150000,
  "month_spent": 87400,
  "days_elapsed": 18,
  "days_remaining": 12,
  "savings_rate": 43.2,
  "upcoming_dues": [
    { "type": "emi", "name": "HDFC Home Loan", "amount": 43391, "due_date": "2025-06-20" }
  ],
  "forecast": { "projected_surplus": 18200, "confidence": "medium" },
  "alerts": [
    { "type": "budget_warning", "category": "Food", "message": "82% of food budget used" }
  ]
}
```

### GET /pulse/forecast
```
Response 200: { projected_surplus: number, projected_expenses: number, confidence: low|medium|high, daily_spend_rate: number }
```

---

## Health Score

### GET /health-score?month=2025-06
```json
// Response 200
{
  "score": 74,
  "components": {
    "savings_rate": { "score": 85, "weight": 0.30, "value": "43.2%" },
    "budget_adherence": { "score": 70, "weight": 0.25, "categories_over": 2 },
    "emi_ratio": { "score": 80, "weight": 0.20, "value": "17.4%" },
    "sip_consistency": { "score": 100, "weight": 0.15, "missed": 0 },
    "credit_card": { "score": 0, "weight": 0.10, "paid_full": false }
  },
  "vs_last_month": +4
}
```

### GET /health-score/trend
```
Response 200: { scores: [{ month, score }] }  // last 6 months
```

---

## Net Worth

### GET /net-worth/current
```
Response 200: { snapshot: { total_assets, total_liabilities, net_worth, ...breakdown } }
```

### POST /net-worth/snapshot
```json
// Request: full net worth breakdown
{ "savings_balance": 250000, "mf_value": 450000, "pf_balance": 380000, "home_loan_outstanding": 4700000, ... }
// Response 201: { snapshot: {...} }
```

### GET /net-worth/trend
```
Response 200: { snapshots: [{ month, net_worth, total_assets, total_liabilities }] }
```

---

## Investments — Recommendations

### GET /investments/recommendations
```json
// Response 200
{
  "monthly_surplus": 65000,
  "allocation": [
    { "type": "Emergency Fund", "amount": 10000, "reason": "Below 6-month target" },
    { "type": "PPF", "amount": 12500, "reason": "80C headroom remaining ₹75,000" },
    { "type": "ELSS", "amount": 15000, "reason": "Tax saving + equity growth" },
    { "type": "NPS", "amount": 4167, "reason": "80CCD(1B) ₹50K annual benefit" },
    { "type": "Index Fund SIP", "amount": 23333, "reason": "Wealth creation — long term" }
  ],
  "tax_headroom": {
    "80c_remaining": 75000,
    "80d_remaining": 25000,
    "nps_remaining": 50000
  }
}
```

---

## Reimbursements

### GET /reimbursements?status=pending
```
Response 200: { reimbursements: [...], total_pending: number }
```

### PATCH /reimbursements/:id/settle
```json
{ "settled_date": "2025-06-20" }
// Response 200: { reimbursement: {...} }
```

---

## Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "amount is required",
    "details": {}
  }
}
```

## Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
