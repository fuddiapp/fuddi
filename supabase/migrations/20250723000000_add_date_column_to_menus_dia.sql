-- Agregar columna de fecha a la tabla menus_dia para filtrar por fecha actual
-- Esta columna permitirá mostrar solo los menús del día actual

-- Agregar columna de fecha
ALTER TABLE menus_dia ADD COLUMN IF NOT EXISTS menu_date DATE DEFAULT CURRENT_DATE;

-- Crear índice para mejorar el rendimiento de consultas por fecha
CREATE INDEX IF NOT EXISTS idx_menus_dia_menu_date ON menus_dia(menu_date);

-- Crear índice compuesto para consultas por negocio y fecha
CREATE INDEX IF NOT EXISTS idx_menus_dia_business_date ON menus_dia(business_id, menu_date);

-- Actualizar registros existentes para que tengan la fecha actual
-- (esto es temporal, los nuevos registros tendrán la fecha correcta)
UPDATE menus_dia SET menu_date = CURRENT_DATE WHERE menu_date IS NULL;

-- Hacer la columna NOT NULL después de actualizar los datos existentes
ALTER TABLE menus_dia ALTER COLUMN menu_date SET NOT NULL;

-- Comentarios para documentar la nueva columna
COMMENT ON COLUMN menus_dia.menu_date IS 'Fecha del menú (YYYY-MM-DD). Solo se muestran menús de la fecha actual.'; 