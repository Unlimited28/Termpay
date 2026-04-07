-- OTPs table for parent login
create table otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- Index for fast lookup
create index on otps(phone, code);
