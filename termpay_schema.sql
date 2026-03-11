-- ============================================
-- TERMPAY — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================

-- 1. SCHOOLS
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  email text,
  bank_name text,
  bank_account_number text,
  logo_url text,
  created_at timestamptz default now()
);

-- 2. ADMIN USERS (linked to a school)
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  full_name text,
  role text default 'bursar', -- 'proprietor' | 'bursar' | 'admin'
  phone text,
  created_at timestamptz default now()
);

-- 3. CLASSES
create table classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null, -- e.g. "Primary 1A", "Nursery 2"
  created_at timestamptz default now()
);

-- 4. STUDENTS
create table students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  class_id uuid references classes(id),
  full_name text not null,
  admission_number text,
  parent_name text,
  parent_phone text not null, -- used for WhatsApp receipts
  parent_email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. TERMS
create table terms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null, -- e.g. "First Term 2025/2026"
  session text not null, -- e.g. "2025/2026"
  start_date date,
  end_date date,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- 6. FEE ITEMS (what makes up a full term fee)
create table fee_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  term_id uuid references terms(id) on delete cascade,
  name text not null, -- e.g. "Tuition", "Feeding", "PTA Levy"
  amount numeric(12,2) not null,
  is_compulsory boolean default true,
  created_at timestamptz default now()
);

-- 7. STUDENT FEE BILLS (total owed per student per term)
create table fee_bills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  term_id uuid references terms(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  total_amount numeric(12,2) not null,
  amount_paid numeric(12,2) default 0,
  balance numeric(12,2) generated always as (total_amount - amount_paid) stored,
  status text default 'unpaid', -- 'unpaid' | 'partial' | 'paid'
  payment_reference text unique, -- auto-generated code e.g. "YOM-2026-0042"
  created_at timestamptz default now(),
  unique(student_id, term_id)
);

-- 8. BANK STATEMENT UPLOADS
create table bank_statement_uploads (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  uploaded_by uuid references admins(id),
  file_name text,
  file_url text,
  upload_date timestamptz default now(),
  total_transactions int default 0,
  matched_count int default 0,
  unmatched_count int default 0,
  status text default 'processing' -- 'processing' | 'done'
);

-- 9. BANK TRANSACTIONS (parsed from uploaded statement)
create table bank_transactions (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid references bank_statement_uploads(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  transaction_date date,
  sender_name text, -- as it appears on bank statement
  amount numeric(12,2) not null,
  reference text,
  narration text,
  is_matched boolean default false,
  match_confidence text, -- 'high' | 'medium' | 'manual'
  matched_student_id uuid references students(id),
  matched_bill_id uuid references fee_bills(id),
  created_at timestamptz default now()
);

-- 10. PAYMENTS (confirmed, after matching)
create table payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  bill_id uuid references fee_bills(id) on delete cascade,
  transaction_id uuid references bank_transactions(id),
  term_id uuid references terms(id),
  amount numeric(12,2) not null,
  payment_date date not null,
  confirmed_by uuid references admins(id),
  receipt_number text unique, -- e.g. "RCT-20260310-0001"
  receipt_url text, -- link to generated PDF
  whatsapp_sent boolean default false,
  sms_sent boolean default false,
  created_at timestamptz default now()
);

-- 11. NOTIFICATION LOG
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  payment_id uuid references payments(id),
  student_id uuid references students(id),
  parent_phone text,
  channel text, -- 'whatsapp' | 'sms'
  message text,
  status text, -- 'sent' | 'failed' | 'pending'
  sent_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table schools enable row level security;
alter table admins enable row level security;
alter table classes enable row level security;
alter table students enable row level security;
alter table terms enable row level security;
alter table fee_items enable row level security;
alter table fee_bills enable row level security;
alter table bank_statement_uploads enable row level security;
alter table bank_transactions enable row level security;
alter table payments enable row level security;
alter table notification_log enable row level security;

-- Admins can only see their own school's data
create policy "school_isolation" on students
  for all using (
    school_id = (select school_id from admins where id = auth.uid())
  );

create policy "school_isolation" on classes
  for all using (
    school_id = (select school_id from admins where id = auth.uid())
  );

create policy "school_isolation" on fee_bills
  for all using (
    school_id = (select school_id from admins where id = auth.uid())
  );

create policy "school_isolation" on payments
  for all using (
    school_id = (select school_id from admins where id = auth.uid())
  );

create policy "school_isolation" on bank_transactions
  for all using (
    school_id = (select school_id from admins where id = auth.uid())
  );

-- ============================================
-- USEFUL INDEXES
-- ============================================

create index on students(school_id);
create index on students(parent_phone);
create index on fee_bills(student_id, term_id);
create index on fee_bills(payment_reference);
create index on bank_transactions(school_id, is_matched);
create index on payments(school_id, term_id);

-- ============================================
-- AUTO-GENERATE PAYMENT REFERENCE
-- Format: YOM-2026-0001 (school prefix + year + sequence)
-- ============================================

create or replace function generate_payment_reference(school_prefix text, bill_id uuid)
returns text as $$
declare
  seq int;
  ref text;
begin
  select count(*) + 1 into seq
  from fee_bills
  where payment_reference is not null
    and payment_reference like school_prefix || '-' || extract(year from now())::text || '-%';
  
  ref := school_prefix || '-' || extract(year from now())::text || '-' || lpad(seq::text, 4, '0');
  return ref;
end;
$$ language plpgsql;

-- ============================================
-- AUTO-GENERATE RECEIPT NUMBER
-- ============================================

create or replace function generate_receipt_number()
returns text as $$
declare
  today text;
  seq int;
begin
  today := to_char(now(), 'YYYYMMDD');
  select count(*) + 1 into seq
  from payments
  where receipt_number like 'RCT-' || today || '-%';
  
  return 'RCT-' || today || '-' || lpad(seq::text, 4, '0');
end;
$$ language plpgsql;

-- ============================================
-- UPDATE fee_bills status automatically
-- ============================================

create or replace function update_bill_status()
returns trigger as $$
begin
  update fee_bills
  set 
    amount_paid = (
      select coalesce(sum(amount), 0)
      from payments
      where bill_id = new.bill_id
    ),
    status = case
      when (select coalesce(sum(amount), 0) from payments where bill_id = new.bill_id) = 0 then 'unpaid'
      when (select coalesce(sum(amount), 0) from payments where bill_id = new.bill_id) >= total_amount then 'paid'
      else 'partial'
    end
  where id = new.bill_id;
  return new;
end;
$$ language plpgsql;

create trigger after_payment_insert
after insert on payments
for each row execute function update_bill_status();

-- ============================================
-- SAMPLE SEED DATA (for demo / testing)
-- ============================================

-- Insert a demo school
insert into schools (id, name, address, phone, bank_name, bank_account_number)
values (
  '00000000-0000-0000-0000-000000000001',
  'Yomfield Nursery & Primary School',
  'Abeokuta, Ogun State, Nigeria',
  '08012345678',
  'GTBank',
  '0123456789'
);

-- Insert demo term
insert into terms (id, school_id, name, session, is_active)
values (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Second Term',
  '2025/2026',
  true
);

-- Insert demo classes
insert into classes (id, school_id, name) values
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Nursery 1'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Nursery 2'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Primary 1'),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Primary 2'),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Primary 3');

-- Insert demo fee items
insert into fee_items (school_id, term_id, name, amount) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Tuition Fee', 45000),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Feeding', 25000),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'PTA Levy', 5000),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Development Levy', 10000);
