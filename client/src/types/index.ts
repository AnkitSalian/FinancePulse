export interface User {
  id: string;
  email: string;
  name: string;
  monthly_income: number | null;
  risk_appetite: 'conservative' | 'moderate' | 'aggressive';
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'savings' | 'salary' | 'wallet' | 'fd' | 'ppf' | 'nps';
  bank: string | null;
  last_four: string | null;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'expense' | 'income' | 'transfer';
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  amount: number;
  type: 'debit' | 'credit';
  merchant: string | null;
  description: string | null;
  comment: string | null;
  transaction_date: string;
  transaction_time: string | null;
  upi_ref: string | null;
  source: 'manual' | 'screenshot' | 'csv' | 'auto';
  is_reimbursable: boolean;
  created_at: string;
  updated_at: string;
  // joined fields
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetStatus {
  category_id: string;
  category_name: string;
  icon: string | null;
  budgeted: number;
  spent: number;
  utilization_percent: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  budget: number | null;
  utilization: number | null;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expenses: number;
  savings: number;
  savings_rate: number;
  category_breakdown: CategoryBreakdown[];
}

export interface UpcomingDue {
  type: 'emi' | 'credit_card';
  name: string;
  amount: number;
  due_date: string;
}

export interface PulseAlert {
  type: 'budget_warning' | 'budget_exceeded';
  category: string;
  message: string;
}

export interface DailyPulse {
  month_budget: number;
  month_spent: number;
  days_elapsed: number;
  days_remaining: number;
  savings_rate: number;
  upcoming_dues: UpcomingDue[];
  forecast: {
    projected_surplus: number;
    confidence: 'low' | 'medium' | 'high';
  };
  alerts: PulseAlert[];
}

export interface HealthScoreComponents {
  savings_rate: { score: number; weight: number; value: string };
  budget_adherence: { score: number; weight: number; categories_over: number };
  emi_ratio: { score: number; weight: number; value: string };
  sip_consistency: { score: number; weight: number; missed: number };
  credit_card: { score: number; weight: number; paid_full: boolean };
}

export interface HealthScore {
  score: number;
  components: HealthScoreComponents;
  vs_last_month: number;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  snapshot_month: string;
  savings_balance: number;
  fd_value: number;
  mf_value: number;
  pf_balance: number;
  ppf_balance: number;
  nps_balance: number;
  property_value: number;
  other_assets: number;
  total_assets: number;
  home_loan_outstanding: number;
  personal_loan_outstanding: number;
  credit_card_outstanding: number;
  other_liabilities: number;
  total_liabilities: number;
  net_worth: number;
  created_at: string;
}

export interface NetWorth {
  snapshot: NetWorthSnapshot;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: 'sip' | 'mf_lumpsum' | 'ppf' | 'nps' | 'fd' | 'elss';
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time' | null;
  start_date: string;
  maturity_date: string | null;
  current_value: number | null;
  folio_number: string | null;
  is_80c_eligible: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed
  total_invested?: number;
  returns_percent?: number;
}

export interface Loan {
  id: string;
  user_id: string;
  name: string;
  type: 'home' | 'car' | 'personal' | 'education';
  principal: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  start_date: string;
  emi_due_day: number;
  outstanding_principal: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed
  remaining_months?: number;
  total_paid?: number;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  bank: string | null;
  last_four: string | null;
  credit_limit: number;
  billing_cycle_day: number;
  due_day: number;
  current_outstanding: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // computed
  utilization_percent?: number;
  days_until_due?: number;
}

export interface Reimbursement {
  id: string;
  user_id: string;
  transaction_id: string;
  payer_name: string;
  amount: number;
  status: 'pending' | 'settled';
  settled_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
