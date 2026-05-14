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
