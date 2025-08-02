-- Corregir la tabla menus_dia para desarrollo sin verificación de usuario
-- y agregar las columnas faltantes

-- Hacer user_id opcional (nullable) para desarrollo
ALTER TABLE menus_dia ALTER COLUMN user_id DROP NOT NULL;

-- Agregar columnas faltantes para el menú individual
ALTER TABLE menus_dia ADD COLUMN IF NOT EXISTS nombre_menu TEXT;
ALTER TABLE menus_dia ADD COLUMN IF NOT EXISTS descripcion_menu TEXT;
ALTER TABLE menus_dia ADD COLUMN IF NOT EXISTS precio_menu DECIMAL(10,2);

-- Actualizar las políticas RLS para permitir acceso sin usuario verificado
DROP POLICY IF EXISTS "Users can view their own daily menus" ON menus_dia;
DROP POLICY IF EXISTS "Users can insert their own daily menus" ON menus_dia;
DROP POLICY IF EXISTS "Users can update their own daily menus" ON menus_dia;
DROP POLICY IF EXISTS "Users can delete their own daily menus" ON menus_dia;

-- Políticas más permisivas para desarrollo
CREATE POLICY "Allow all operations for development" ON menus_dia
    FOR ALL USING (true) WITH CHECK (true);

-- Comentarios actualizados
COMMENT ON COLUMN menus_dia.nombre_menu IS 'Nombre del menú individual';
COMMENT ON COLUMN menus_dia.descripcion_menu IS 'Descripción detallada del menú';
COMMENT ON COLUMN menus_dia.precio_menu IS 'Precio del menú (opcional)'; 