-- Quitar restricción de foreign key y NOT NULL en user_id de daily_menus para pruebas
alter table public.daily_menus drop constraint if exists daily_menus_user_id_fkey;
alter table public.daily_menus alter column user_id drop not null; 