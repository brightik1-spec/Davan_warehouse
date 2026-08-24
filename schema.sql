-- OMBORXONA HISOBI — Supabase sxemasi
-- Buni Supabase Dashboard > SQL Editor ichida to'liq nusxalab ishga tushiring (Run)

-- 1) Profillar jadvali (har bir auth foydalanuvchisi uchun ism va rol)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null default 'hodim' check (role in ('admin', 'hodim')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Har kim o'z profilini va boshqalarnikini o'qiy oladi"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Faqat admin profil rolini o'zgartira oladi"
  on profiles for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Yangi auth foydalanuvchi yaratilganda avtomatik profil qatori yaratish
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'hodim');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Mahsulotlar jadvali
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  unit text not null default 'dona',
  quantity numeric not null default 0,
  min_stock numeric not null default 0,
  price numeric not null default 0,
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "Hamma (login qilgan) mahsulotlarni ko'radi"
  on products for select using (auth.role() = 'authenticated');

create policy "Faqat admin mahsulot qo'sha oladi"
  on products for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Faqat admin mahsulotni o'chira oladi"
  on products for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Login qilgan har kim qoldiqni yangilay oladi (kirim-chiqim)"
  on products for update using (auth.role() = 'authenticated');

-- 3) Amaliyotlar (kirim-chiqim) jadvali
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  type text not null check (type in ('kirim', 'chiqim')),
  qty numeric not null,
  note text,
  by_name text,
  by_user uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table transactions enable row level security;

create policy "Login qilgan hamma amaliyotlarni ko'radi"
  on transactions for select using (auth.role() = 'authenticated');

create policy "Login qilgan hamma amaliyot qo'sha oladi"
  on transactions for insert with check (auth.role() = 'authenticated');

-- 4) Namuna mahsulotlar (ixtiyoriy — sinash uchun)
insert into products (name, category, unit, quantity, min_stock, price) values
  ('Sement (50kg)', 'Qurilish', 'qop', 120, 30, 45000),
  ('Armatura 12mm', 'Metall', 'dona', 8, 20, 62000),
  ('Bo''yoq (oq, 3L)', 'Bo''yoq', 'banka', 45, 10, 98000),
  ('Elektr kabeli 2.5mm', 'Elektr', 'metr', 300, 100, 6500),
  ('G''isht (qizil)', 'Qurilish', 'dona', 15, 500, 900)
on conflict do nothing;
