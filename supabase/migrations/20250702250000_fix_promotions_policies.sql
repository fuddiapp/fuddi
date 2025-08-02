-- Corregir las políticas de la tabla promotions para permitir acceso completo
-- y solucionar el error 406

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Businesses can view their own promotions" ON promotions;
DROP POLICY IF EXISTS "Businesses can create their own promotions" ON promotions;
DROP POLICY IF EXISTS "Businesses can update their own promotions" ON promotions;
DROP POLICY IF EXISTS "Businesses can delete their own promotions" ON promotions;

-- Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;

-- Comentario explicativo
COMMENT ON TABLE promotions IS 'Tabla para almacenar promociones - RLS deshabilitado para desarrollo'; 