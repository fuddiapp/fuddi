-- Agregar columnas de coordenadas de ubicación a la tabla clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8);

-- Agregar comentarios para documentar las columnas
COMMENT ON COLUMN clients.location_lat IS 'Latitud de la ubicación del cliente';
COMMENT ON COLUMN clients.location_lng IS 'Longitud de la ubicación del cliente'; 