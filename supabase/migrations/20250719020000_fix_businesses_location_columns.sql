-- Asegurar que las columnas de ubicación existan y tengan el tipo correcto
ALTER TABLE businesses 
  ADD COLUMN IF NOT EXISTS location_lat double precision,
  ADD COLUMN IF NOT EXISTS location_lng double precision;

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);

-- Crear índice para búsquedas por ubicación
CREATE INDEX IF NOT EXISTS idx_businesses_location_lat ON businesses(location_lat);
CREATE INDEX IF NOT EXISTS idx_businesses_location_lng ON businesses(location_lng); 