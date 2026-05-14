# TRANSACTION_SERVICE.md — FinancePulse

## Responsibilities
Handles all transaction creation flows: manual entry, iOS Share Sheet screenshot, and CSV import. Also manages reimbursement tagging.

---

## Flow 1 — Manual Entry
Simple CRUD. User fills the Add Transaction form → POST /api/transactions.
No special processing — category can be manually selected or left for ML to suggest.

---

## Flow 2 — iOS Share Sheet (Primary daily-use flow)

### PWA Manifest Config
```json
{
  "share_target": {
    "action": "/share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "files": [{ "name": "screenshot", "accept": ["image/*"] }]
    }
  }
}
```

### Service Worker Handler
```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/share-target') && event.request.method === 'POST') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const screenshot = formData.get('screenshot');
      // Store in IndexedDB temporarily
      const db = await openDB();
      await db.put('pending-shares', { screenshot, timestamp: Date.now() }, 'latest');
      // Redirect to the share processing page
      return Response.redirect('/app/share-target', 303);
    })());
  }
});
```

### Share Target Page Flow
```
/app/share-target
  1. Read screenshot from IndexedDB
  2. Show image preview to user
  3. Show "Add a comment (optional)" text field
  4. Show "Extract Details" button
  5. On click → POST /api/transactions/extract { screenshot, comment }
  6. Show extracted data in pre-filled form:
     - Amount (editable)
     - Merchant (editable)
     - Date (editable)
     - Category (editable dropdown, pre-selected by ML)
     - Comment (pre-filled from step 3)
  7. User confirms → POST /api/transactions
  8. Success → redirect to /app/transactions
```

### Claude Vision Extraction (Node API)
```typescript
// server/services/visionService.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function extractTransactionFromScreenshot(
  imageBase64: string,
  comment?: string
): Promise<ExtractedTransaction> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
        },
        {
          type: 'text',
          text: `Extract the transaction details from this payment screenshot.
          Return ONLY a JSON object with these fields:
          {
            "amount": number,
            "merchant": string,
            "date": "YYYY-MM-DD",
            "time": "HH:MM" or null,
            "type": "debit" or "credit",
            "upi_ref": string or null,
            "bank": string or null,
            "account_last_four": string or null
          }
          If a field cannot be determined, use null.
          Return only the JSON object, no other text.`
        }
      ]
    }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}
```

---

## Flow 3 — CSV Import

### Supported Banks & Column Mappings
```typescript
const BANK_COLUMN_MAPS = {
  hdfc: {
    date: 'Date',
    description: 'Narration',
    debit: 'Withdrawal Amt.',
    credit: 'Deposit Amt.',
    balance: 'Closing Balance'
  },
  icici: {
    date: 'Transaction Date',
    description: 'Transaction Remarks',
    debit: 'Withdrawal Amount (INR )',
    credit: 'Deposit Amount (INR )',
    balance: 'Balance (INR )'
  },
  sbi: {
    date: 'Txn Date',
    description: 'Description',
    debit: 'Debit',
    credit: 'Credit',
    balance: 'Balance'
  }
};
```

### CSV Parse Flow
```
1. User uploads CSV + selects bank
2. Node API parses with papaparse
3. Normalize each row to standard transaction shape
4. Send merchant/description strings to ML categorizer in batch
5. Return preview array (max 100 rows visible at once)
6. Store raw parsed data in Redis/memory with import_id (TTL: 30 min)
7. User reviews, edits categories in preview table
8. POST /transactions/csv-import/:import_id/confirm
9. Save all included rows to DB
10. Delete import data from memory
```

---

## Reimbursement Tagging

Any transaction can be flagged as reimbursable:
- At creation time (manual or screenshot) via `is_reimbursable: true`
- After creation via PATCH /transactions/:id

When `is_reimbursable` is true, a reimbursements record is created automatically with status `pending`.

Reimbursements appear in:
- Transaction detail screen (badge: "Reimbursable — ₹450 pending from [payer]")
- Dedicated Reimbursements screen under "More" tab
- Monthly summary ("₹3,200 pending reimbursements")

---

## Transaction Categories — Default Seed
```sql
INSERT INTO categories (user_id, name, type, icon, is_default) VALUES
  ($1, 'Food & Dining', 'expense', '🍽️', true),
  ($1, 'Transport', 'expense', '🚗', true),
  ($1, 'Shopping', 'expense', '🛒', true),
  ($1, 'Health', 'expense', '🏥', true),
  ($1, 'Entertainment', 'expense', '🎬', true),
  ($1, 'Utilities', 'expense', '💡', true),
  ($1, 'Education', 'expense', '📚', true),
  ($1, 'EMI', 'expense', '🏠', true),
  ($1, 'Investment', 'expense', '📈', true),
  ($1, 'Credit Card Payment', 'expense', '💳', true),
  ($1, 'Home & Interiors', 'expense', '🛋️', true),
  ($1, 'Reimbursable', 'expense', '↩️', true),
  ($1, 'Salary', 'income', '💰', true),
  ($1, 'Other', 'expense', '📦', true);
```
