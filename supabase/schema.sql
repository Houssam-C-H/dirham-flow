-- =====================================================================
-- 🇲🇦 DirhamFlow (فلوسي) - Hardened Production Database Schema
-- Run this script in the Supabase SQL Editor (https://database.new)
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  language text default 'fr' check (language in ('fr', 'ar_darija', 'en')),
  currency text default 'MAD' check (currency in ('MAD', 'DH')),
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 2. ACCOUNTS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null check (length(trim(name)) > 0),
  type text not null check (type in ('bank', 'cash', 'savings', 'credit', 'ewallet')),
  balance numeric(12,2) default 0.00 not null,
  currency text default 'MAD' not null check (currency in ('MAD', 'DH')),
  bank_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 3. TRANSACTIONS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  category text not null check (length(trim(category)) > 0),
  amount numeric(12,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense', 'transfer')),
  description text,
  date date default CURRENT_DATE not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 4. RECURRING TRANSACTIONS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.recurring_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  frequency text not null check (frequency in ('monthly', 'weekly', 'yearly')),
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  description text,
  next_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 5. BUDGETS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month integer not null check (month >= 1 and month <= 12),
  year integer not null check (year >= 2020 and year <= 2100),
  total_income numeric(12,2) default 0.00 not null check (total_income >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month, year)
);

-- ---------------------------------------------------------------------
-- 6. BUDGET ITEMS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.budget_items (
  id uuid default gen_random_uuid() primary key,
  budget_id uuid references public.budgets(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  allocated_amount numeric(12,2) default 0.00 not null check (allocated_amount >= 0),
  spent_amount numeric(12,2) default 0.00 not null check (spent_amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 7. BILLS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.bills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null check (length(trim(name)) > 0),
  amount numeric(12,2) not null check (amount > 0),
  due_day integer not null check (due_day >= 1 and due_day <= 31),
  is_paid boolean default false not null,
  category text default 'Fixe' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 8. SAVINGS GOALS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null check (length(trim(title)) > 0),
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) default 0.00 not null check (current_amount >= 0),
  target_date date,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 9. GOAL CONTRIBUTIONS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.goal_contributions (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.savings_goals(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null check (amount > 0),
  note text,
  date date default CURRENT_DATE not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 10. PORTFOLIO POSITIONS TABLE (Casablanca Bourse - BVC)
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_positions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text not null check (length(trim(symbol)) > 0),
  company_name text not null,
  quantity numeric(12,4) not null check (quantity > 0),
  avg_buy_price numeric(12,2) not null check (avg_buy_price > 0),
  current_price numeric(12,2) check (current_price > 0),
  sector text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, symbol)
);

-- ---------------------------------------------------------------------
-- 11. PORTFOLIO TRANSACTIONS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_transactions (
  id uuid default gen_random_uuid() primary key,
  position_id uuid references public.portfolio_positions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('buy', 'sell')),
  quantity numeric(12,4) not null check (quantity > 0),
  price numeric(12,2) not null check (price > 0),
  date date default CURRENT_DATE not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 12. AUDIT LOGS TABLE
-- ---------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
create index if not exists idx_transactions_user_date on public.transactions (user_id, date desc);
create index if not exists idx_accounts_user on public.accounts (user_id);
create index if not exists idx_budget_items_user_budget on public.budget_items (user_id, budget_id);
create index if not exists idx_bills_user_paid on public.bills (user_id, is_paid);
create index if not exists idx_portfolio_user_symbol on public.portfolio_positions (user_id, symbol);
create index if not exists idx_audit_logs_user_date on public.audit_logs (user_id, created_at desc);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
alter table public.bills enable row level security;
alter table public.savings_goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.portfolio_positions enable row level security;
alter table public.portfolio_transactions enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles RLS
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Standard User Tables RLS
create policy "Users can view own accounts" on public.accounts for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own accounts" on public.accounts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own recurring_transactions" on public.recurring_transactions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own recurring_transactions" on public.recurring_transactions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own recurring_transactions" on public.recurring_transactions for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own recurring_transactions" on public.recurring_transactions for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own budgets" on public.budgets for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own budgets" on public.budgets for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own budgets" on public.budgets for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own budgets" on public.budgets for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own budget_items" on public.budget_items for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own budget_items" on public.budget_items for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own budget_items" on public.budget_items for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own budget_items" on public.budget_items for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own bills" on public.bills for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own bills" on public.bills for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own bills" on public.bills for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own bills" on public.bills for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own savings_goals" on public.savings_goals for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own savings_goals" on public.savings_goals for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own savings_goals" on public.savings_goals for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own savings_goals" on public.savings_goals for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own goal_contributions" on public.goal_contributions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own goal_contributions" on public.goal_contributions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own goal_contributions" on public.goal_contributions for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own goal_contributions" on public.goal_contributions for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own portfolio_positions" on public.portfolio_positions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own portfolio_positions" on public.portfolio_positions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own portfolio_positions" on public.portfolio_positions for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own portfolio_positions" on public.portfolio_positions for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own portfolio_transactions" on public.portfolio_transactions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own portfolio_transactions" on public.portfolio_transactions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own portfolio_transactions" on public.portfolio_transactions for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own portfolio_transactions" on public.portfolio_transactions for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own audit_logs" on public.audit_logs for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own audit_logs" on public.audit_logs for insert to authenticated with check (auth.uid() = user_id);

-- =====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, language, currency, onboarding_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'fr',
    'MAD',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
