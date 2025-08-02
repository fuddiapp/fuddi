-- Cambiar tipo de horario a time
ALTER TABLE businesses
  ALTER COLUMN opening_time TYPE time USING opening_time::time,
  ALTER COLUMN closing_time TYPE time USING closing_time::time;

-- Agregar columnas de ubicación
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS location_lat float,
  ADD COLUMN IF NOT EXISTS location_lng float; 