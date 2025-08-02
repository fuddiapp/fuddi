-- Arreglar los tipos de datos de las columnas de tiempo en businesses
-- Primero convertir a text si hay datos existentes
ALTER TABLE businesses 
  ALTER COLUMN opening_time TYPE text USING opening_time::text,
  ALTER COLUMN closing_time TYPE text USING closing_time::text;

-- Luego convertir a time
ALTER TABLE businesses 
  ALTER COLUMN opening_time TYPE time USING opening_time::time,
  ALTER COLUMN closing_time TYPE time USING closing_time::time;

-- Asegurar que las columnas de ubicación existan
ALTER TABLE businesses 
  ADD COLUMN IF NOT EXISTS location_lat float,
  ADD COLUMN IF NOT EXISTS location_lng float; 