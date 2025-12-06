-- Create Venues Table
create table venues (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name jsonb not null, -- Stores {en: "...", es: "..."}
  description jsonb not null,
  category text not null check (category in ('restaurant', 'cafe', 'shop', 'entertainment')),
  image text,
  rating numeric default 0,
  review_count integer default 0,
  open_time text,
  close_time text,
  is_open boolean default true,
  is_featured boolean default false,
  is_new boolean default true,
  address text,
  coordinates jsonb, -- Stores {lat: 123, lng: 123}
  whatsapp text,
  subscription_plan text default 'free' check (subscription_plan in ('free', 'basic', 'premium')),
  subscription_status text default 'active' check (subscription_status in ('active', 'inactive'))
);

-- Create Coupons Table
create table coupons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  venue_id uuid references venues(id) on delete cascade,
  code text not null,
  discount text not null,
  type text default 'percent' check (type in ('percent', 'fixed')),
  description jsonb not null,
  valid_until date,
  image text
);

-- Enable Row Level Security (RLS)
alter table venues enable row level security;
alter table coupons enable row level security;

-- Create policies (Public Read, Admin Write)
-- Note: For simplicity, we are allowing public read. Write policies depend on auth setup.
create policy "Public venues are viewable by everyone" on venues
  for select using (true);

create policy "Public coupons are viewable by everyone" on coupons
  for select using (true);
