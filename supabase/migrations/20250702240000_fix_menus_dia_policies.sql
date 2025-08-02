-- Corregir las políticas de la tabla menus_dia para permitir acceso completo
-- y solucionar el error 406

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own daily menus" ON menus_dia;
DROP POLICY IF EXISTS "Users can insert their own daily menus" ON menus_dia;
DROP POLICY IF EXISTS "Users can update their own daily menus" ON menus_dia;
DROP POLICY IF EXISTS "Users can delete their own daily menus" ON menus_dia;
DROP POLICY IF EXISTS "Allow all operations for development" ON menus_dia;

-- Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE menus_dia DISABLE ROW LEVEL SECURITY;

-- Comentario explicativo
COMMENT ON TABLE menus_dia IS 'Tabla para almacenar los menús del día - RLS deshabilitado para desarrollo'; 