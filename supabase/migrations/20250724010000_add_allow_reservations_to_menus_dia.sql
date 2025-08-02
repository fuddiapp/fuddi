-- Agregar campo allow_reservations a la tabla menus_dia
ALTER TABLE menus_dia 
ADD COLUMN IF NOT EXISTS allow_reservations BOOLEAN DEFAULT false;

-- Crear índice para mejorar el rendimiento de consultas por allow_reservations
CREATE INDEX IF NOT EXISTS idx_menus_dia_allow_reservations ON menus_dia(allow_reservations);

-- Actualizar registros existentes para que no permitan reservas por defecto
UPDATE menus_dia 
SET allow_reservations = false 
WHERE allow_reservations IS NULL; 