-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- SCHOOLS
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  email text,
  bank_name text,
  bank_account_number text,
  bank_account_name text,
  school_prefix text default 'SCH',
  logo_url text,
  created_at timestamptz default now()
);

-- ADMINS
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  full_name text,
  role text default 'bursar',
  phone text,
  created_at timestamptz default now()
);

-- CLASSES
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- STUDENTS
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  class_id uuid references classes(id),
  full_name text not null,
  admission_number text,
  parent_name text,
  parent_phone text not null,
  parent_email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- TERMS
create table if not exists terms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null,
  session text not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- FEE ITEMS
create table if not exists fee_items (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  term_id uuid references terms(id) on delete cascade,
  class_id uuid references classes(id),
  name text not null,
  amount numeric(12,2) not null,
  is_compulsory boolean default true,
  applies_to_all boolean default true,
  created_at timestamptz default now()
);

-- FEE BILLS
create table if not exists fee_bills (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  term_id uuid references terms(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  total_amount numeric(12,2) not null,
  amount_paid numeric(12,2) default 0,
  status text default 'unpaid',
  payment_reference text unique,
  created_at timestamptz default now()
);

-- BANK STATEMENT UPLOADS
create table if not exists bank_statement_uploads (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  file_name text,
  file_url text,
  upload_date timestamptz default now(),
  total_transactions int default 0,
  matched_count int default 0,
  unmatched_count int default 0,
  status text default 'processing'
);

-- BANK TRANSACTIONS
create table if not exists bank_transactions (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid references bank_statement_uploads(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  transaction_date date,
  sender_name text,
  amount numeric(12,2) not null,
  narration text,
  is_matched boolean default false,
  match_confidence text,
  matched_student_id uuid references students(id),
  matched_bill_id uuid references fee_bills(id),
  created_at timestamptz default now()
);

-- PAYMENTS
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  bill_id uuid references fee_bills(id) on delete cascade,
  transaction_id uuid references bank_transactions(id),
  term_id uuid references terms(id),
  amount numeric(12,2) not null,
  payment_date date not null,
  receipt_number text unique,
  receipt_url text,
  whatsapp_sent boolean default false,
  created_at timestamptz default now()
);

-- NOTIFICATION LOG
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  payment_id uuid references payments(id),
  student_id uuid references students(id),
  parent_phone text,
  channel text,
  message text,
  status text,
  sent_at timestamptz default now()
);

-- OTPs (for parent login)
create table if not exists otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_students_school on students(school_id);
create index if not exists idx_students_phone on students(parent_phone);
create index if not exists idx_fee_bills_student on fee_bills(student_id, term_id);
create index if not exists idx_fee_bills_reference on fee_bills(payment_reference);
create index if not exists idx_bank_transactions_upload on bank_transactions(upload_id);
create index if not exists idx_bank_transactions_matched on bank_transactions(school_id, is_matched);
create index if not exists idx_payments_school on payments(school_id, term_id);
create index if not exists idx_otps_phone on otps(phone);

-- ROW LEVEL SECURITY
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
