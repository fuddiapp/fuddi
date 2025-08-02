-- Tabla para menús del día
create table if not exists public.daily_menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date date not null,
  type text not null check (type in ('simple', 'detailed')),
  name text,
  price numeric not null,
  description text, -- solo para simple
  categories jsonb, -- solo para detallado
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now()),
  unique (user_id, date)
);

-- Índice para búsquedas rápidas por usuario y fecha
create index if not exists daily_menus_user_date_idx on public.daily_menus(user_id, date); 