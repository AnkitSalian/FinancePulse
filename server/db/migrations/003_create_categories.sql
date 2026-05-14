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
