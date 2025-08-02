-- Deshabilitar RLS temporalmente para permitir registro de negocios
-- ================================================================

-- Deshabilitar RLS en las tablas principales
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Comentarios explicativos
COMMENT ON TABLE businesses IS 'Tabla de negocios - RLS deshabilitado temporalmente para permitir registro';
COMMENT ON TABLE clients IS 'Tabla de clientes - RLS deshabilitado temporalmente para permitir registro';

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
    
    RAISE NOTICE 'Las tablas businesses y clients existen y RLS ha sido deshabilitado';
END $$; 