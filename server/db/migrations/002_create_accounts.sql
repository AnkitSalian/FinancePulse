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
