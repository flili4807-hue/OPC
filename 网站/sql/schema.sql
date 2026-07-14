create extension if not exists "uuid-ossp";

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  contact jsonb not null,
  dsi_answers jsonb,
  dsi_result jsonb,
  cmmi_answers jsonb,
  cmmi_result jsonb,
  purchase_status text not null default '未购买',
  sales_status text not null default '新客户',
  payment_amount integer,
  notes jsonb not null default '[]'::jsonb
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_sales_status_idx on leads (sales_status);
create index if not exists leads_purchase_status_idx on leads (purchase_status);

create table if not exists payment_orders (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete set null,
  provider text not null,
  amount integer not null,
  status text not null default 'pending',
  provider_order_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists report_files (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade,
  file_name text not null,
  storage_path text,
  created_at timestamptz not null default now()
);
