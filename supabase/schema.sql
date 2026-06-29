-- ============================================================
-- SoundAura Pro — Database Schema
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================

-- ── 1. profiles ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- Tự động tạo profile khi user đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. newsletter ────────────────────────────────────────────
create table if not exists public.newsletter (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  name        text,
  created_at  timestamptz not null default now()
);

-- ── 3. wishlist ──────────────────────────────────────────────
create table if not exists public.wishlist (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  product_id  text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ── 4. cart ──────────────────────────────────────────────────
create table if not exists public.cart (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  product_id  text not null,
  quantity    int  not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- RLS — Row Level Security
-- ============================================================

alter table public.profiles  enable row level security;
alter table public.newsletter enable row level security;
alter table public.wishlist   enable row level security;
alter table public.cart       enable row level security;

-- ── profiles ─────────────────────────────────────────────────
create policy "Xem profile của mình"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Cập nhật profile của mình"
  on public.profiles for update
  using (auth.uid() = id);

-- ── newsletter ───────────────────────────────────────────────
-- Ai cũng có thể đăng ký (không cần đăng nhập)
create policy "Đăng ký newsletter"
  on public.newsletter for insert
  with check (true);

-- Chỉ xem email của chính mình
create policy "Xem đăng ký của mình"
  on public.newsletter for select
  using (email = (
    select email from auth.users where id = auth.uid()
  ));

-- ── wishlist ─────────────────────────────────────────────────
create policy "Xem wishlist của mình"
  on public.wishlist for select
  using (auth.uid() = user_id);

create policy "Thêm vào wishlist"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

create policy "Xóa khỏi wishlist"
  on public.wishlist for delete
  using (auth.uid() = user_id);

-- ── cart ─────────────────────────────────────────────────────
create policy "Xem giỏ hàng của mình"
  on public.cart for select
  using (auth.uid() = user_id);

create policy "Thêm vào giỏ hàng"
  on public.cart for insert
  with check (auth.uid() = user_id);

create policy "Cập nhật giỏ hàng của mình"
  on public.cart for update
  using (auth.uid() = user_id);

create policy "Xóa khỏi giỏ hàng"
  on public.cart for delete
  using (auth.uid() = user_id);
