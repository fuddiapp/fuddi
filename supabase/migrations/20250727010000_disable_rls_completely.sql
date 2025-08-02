-- Deshabilitar RLS completamente para permitir registro de negocios
-- ================================================================

-- Deshabilitar RLS en las tablas principales
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert own business" ON businesses;
DROP POLICY IF EXISTS "Users can update own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete own business" ON businesses;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON businesses;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON businesses;
DROP POLICY IF EXISTS "Enable update for users based on id" ON businesses;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON businesses;

DROP POLICY IF EXISTS "Users can view own client profile" ON clients;
DROP POLICY IF EXISTS "Users can insert own client profile" ON clients;
DROP POLICY IF EXISTS "Users can update own client profile" ON clients;
DROP POLICY IF EXISTS "Users can delete own client profile" ON clients;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable update for users based on id" ON clients;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON clients;

-- Comentarios explicativos
COMMENT ON TABLE businesses IS 'Tabla de negocios - RLS deshabilitado completamente para permitir registro';
COMMENT ON TABLE clients IS 'Tabla de clientes - RLS deshabilitado completamente para permitir registro';

-- Verificar que las tablas existen y tienen la estructura correcta
DO $$
BEGIN
    -- Verificar que la tabla businesses existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'businesses') THEN
        RAISE EXCEPTION 'La tabla businesses no existe';
    END IF;
    
    -- Verificar que la tabla clients existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        RAISE EXCEPTION 'La tabla clients no existe';
    END IF;
    
    RAISE NOTICE 'Las tablas businesses y clients existen y RLS ha sido deshabilitado completamente';
END $$; 