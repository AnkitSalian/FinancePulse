# TransactionAgent

## Responsibility
Capture, extract, categorize, and store all financial transactions.

## Phase
P1 (manual entry), P2 (screenshot + CSV)

## Capabilities
- Accept manual transaction input
- Receive iOS Share Sheet screenshot → invoke `extract-transaction-from-screenshot` skill
- Invoke `categorize-transaction` skill on every new transaction
- Accept CSV upload → invoke `parse-bank-csv` → batch categorize
- Tag transactions as reimbursable
- CRUD operations on transactions

## Skills Used
- extract-transaction-from-screenshot
- categorize-transaction
- parse-bank-csv
- send-push-notification

## MCP Tools (Phase 5)
- get_transactions(month?, category?, limit?)
- add_transaction(amount, merchant, category, date, comment?)
- edit_transaction(id, fields)
- get_spending_summary(month)
- get_category_breakdown(month)
- get_reimbursements(status?)

## Relevant Docs
- docs/TRANSACTION_SERVICE.md
- docs/API_ROUTES.md (transaction routes)
- docs/DATA_MODELS.md (transactions, categories, reimbursements tables)
