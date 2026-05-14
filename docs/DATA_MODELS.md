# DATA_MODELS.md — FinancePulse

## Tables Overview
| Table | Purpose |
|-------|---------|
| users | Auth and profile |
| accounts | Bank accounts, wallets |
| transactions | All financial transactions |
| categories | Transaction categories |
| budgets | Monthly category budgets |
| loans | Loan/EMI definitions |
| credit_cards | Credit card definitions |
| investments | Investment definitions |
| net_worth_snapshots | Monthly net worth records |
| health_scores | Monthly health score records |
| reimbursements | Reimbursable transaction tracking |
| salary_projections | CTC and growth scenarios |

---

## Schema Definitions

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  monthly_income NUMERIC(12,2),
  risk_appetite VARCHAR(20) DEFAULT 'moderate', -- conservative | moderate | aggressive
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### accounts
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "HDFC Savings", "ICICI Salary"
  type VARCHAR(50) NOT NULL,            -- savings | salary | wallet | fd | ppf | nps
  bank VARCHAR(100),
  last_four VARCHAR(4),
  current_balance NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,            -- expense | income | transfer
  icon VARCHAR(50),
  color VARCHAR(7),                     -- hex color
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories seeded on user creation:
-- Food, Transport, Shopping, Health, Entertainment,
-- Utilities, Education, EMI, Investment, Credit Card Payment,
-- Home, Reimbursable, Salary, Other
```

### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  amount NUMERIC(12,2) NOT NULL,
  type VARCHAR(20) NOT NULL,            -- debit | credit
  merchant VARCHAR(255),
  description TEXT,
  comment TEXT,                         -- user-added comment (from Share Sheet)
  transaction_date DATE NOT NULL,
  transaction_time TIME,
  upi_ref VARCHAR(100),                 -- UPI reference number from screenshot
  source VARCHAR(20) DEFAULT 'manual', -- manual | screenshot | csv | auto
  screenshot_extracted JSONB,          -- raw extraction from Claude Vision (temp debug)
  is_reimbursable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(user_id, category_id);
```

### budgets
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  month DATE NOT NULL,                  -- first day of the month: 2025-06-01
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);
```

### loans
```sql
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "HDFC Home Loan"
  type VARCHAR(50) NOT NULL,            -- home | car | personal | education
  principal NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,  -- annual %
  tenure_months INTEGER NOT NULL,
  emi_amount NUMERIC(12,2) NOT NULL,
  start_date DATE NOT NULL,
  emi_due_day INTEGER NOT NULL,         -- day of month: 1-28
  outstanding_principal NUMERIC(12,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### credit_cards
```sql
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "HDFC Regalia"
  bank VARCHAR(100),
  last_four VARCHAR(4),
  credit_limit NUMERIC(12,2) NOT NULL,
  billing_cycle_day INTEGER NOT NULL,   -- statement generation day
  due_day INTEGER NOT NULL,             -- payment due day
  current_outstanding NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### investments
```sql
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "Axis Bluechip Fund SIP"
  type VARCHAR(50) NOT NULL,            -- sip | mf_lumpsum | ppf | nps | fd | elss
  amount NUMERIC(12,2) NOT NULL,        -- monthly SIP / lumpsum amount
  frequency VARCHAR(20),                -- monthly | quarterly | yearly | one_time
  start_date DATE NOT NULL,
  maturity_date DATE,
  current_value NUMERIC(12,2),          -- manually updated
  folio_number VARCHAR(100),
  is_80c_eligible BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### net_worth_snapshots
```sql
CREATE TABLE net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  snapshot_month DATE NOT NULL,         -- first day of month
  -- Assets
  savings_balance NUMERIC(12,2) DEFAULT 0,
  fd_value NUMERIC(12,2) DEFAULT 0,
  mf_value NUMERIC(12,2) DEFAULT 0,
  pf_balance NUMERIC(12,2) DEFAULT 0,
  ppf_balance NUMERIC(12,2) DEFAULT 0,
  nps_balance NUMERIC(12,2) DEFAULT 0,
  property_value NUMERIC(12,2) DEFAULT 0,
  other_assets NUMERIC(12,2) DEFAULT 0,
  total_assets NUMERIC(12,2) GENERATED ALWAYS AS (
    savings_balance + fd_value + mf_value + pf_balance +
    ppf_balance + nps_balance + property_value + other_assets
  ) STORED,
  -- Liabilities
  home_loan_outstanding NUMERIC(12,2) DEFAULT 0,
  personal_loan_outstanding NUMERIC(12,2) DEFAULT 0,
  credit_card_outstanding NUMERIC(12,2) DEFAULT 0,
  other_liabilities NUMERIC(12,2) DEFAULT 0,
  total_liabilities NUMERIC(12,2) GENERATED ALWAYS AS (
    home_loan_outstanding + personal_loan_outstanding +
    credit_card_outstanding + other_liabilities
  ) STORED,
  net_worth NUMERIC(12,2) GENERATED ALWAYS AS (
    (savings_balance + fd_value + mf_value + pf_balance +
     ppf_balance + nps_balance + property_value + other_assets) -
    (home_loan_outstanding + personal_loan_outstanding +
     credit_card_outstanding + other_liabilities)
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, snapshot_month)
);
```

### health_scores
```sql
CREATE TABLE health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score_month DATE NOT NULL,            -- first day of month
  total_score NUMERIC(5,2) NOT NULL,    -- 0-100
  -- Component scores (each 0-100 before weighting)
  savings_rate_score NUMERIC(5,2),
  budget_adherence_score NUMERIC(5,2),
  emi_ratio_score NUMERIC(5,2),
  sip_consistency_score NUMERIC(5,2),
  credit_card_score NUMERIC(5,2),
  -- Raw metrics
  savings_rate NUMERIC(5,2),           -- % of income saved
  emi_to_income_ratio NUMERIC(5,2),    -- % of income going to EMIs
  categories_over_budget INTEGER,
  sips_missed INTEGER,
  credit_cards_full_payment INTEGER,   -- count paid in full
  credit_cards_total INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_month)
);
```

### reimbursements
```sql
CREATE TABLE reimbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  payer_name VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending | settled
  settled_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### salary_projections
```sql
CREATE TABLE salary_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,           -- "Base Case", "With Promotion at 12 months"
  current_ctc NUMERIC(12,2) NOT NULL,
  annual_raise_percent NUMERIC(5,2),
  promotion_month INTEGER,              -- months from now
  promotion_hike_percent NUMERIC(5,2),
  projection_years INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
