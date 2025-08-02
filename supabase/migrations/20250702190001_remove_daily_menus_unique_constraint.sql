-- Eliminar la restricción unique que impide múltiples menús por usuario por fecha
-- Esto permite tener varios menús en el mismo día
ALTER TABLE public.daily_menus DROP CONSTRAINT IF EXISTS daily_menus_user_id_date_key; 