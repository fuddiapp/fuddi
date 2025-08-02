-- Tabla de clientes
create table if not exists clients (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text not null,
  last_name text not null,
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de negocios
create table if not exists businesses (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  business_name text not null,
  category text not null,
  description text,
  address text not null,
  opening_time text not null,
  closing_time text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Nota: El tipo de cuenta (cliente o negocio) se guardará en el user_metadata de auth.users al momento del registro.

