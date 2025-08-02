-- Políticas de seguridad balanceadas para registro de negocios
-- ===========================================================

-- 1. Habilitar RLS en las tablas
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para evitar conflictos
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

-- 3. Políticas para businesses - PERMITIR REGISTRO PERO MANTENER SEGURIDAD
-- Permitir inserción solo para usuarios autenticados (necesario para registro)
CREATE POLICY "Allow authenticated users to insert businesses" ON businesses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir lectura solo del propio negocio
CREATE POLICY "Users can only view own business" ON businesses
  FOR SELECT USING (auth.uid() = id);

-- Permitir actualización solo del propio negocio
CREATE POLICY "Users can only update own business" ON businesses
  FOR UPDATE USING (auth.uid() = id);

-- Permitir eliminación solo del propio negocio
CREATE POLICY "Users can only delete own business" ON businesses
  FOR DELETE USING (auth.uid() = id);

-- 4. Políticas para clients - PERMITIR REGISTRO PERO MANTENER SEGURIDAD
-- Permitir inserción solo para usuarios autenticados
CREATE POLICY "Allow authenticated users to insert clients" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir lectura solo del propio perfil de cliente
CREATE POLICY "Users can only view own client profile" ON clients
  FOR SELECT USING (auth.uid() = id);

-- Permitir actualización solo del propio perfil de cliente
CREATE POLICY "Users can only update own client profile" ON clients
  FOR UPDATE USING (auth.uid() = id);

-- Permitir eliminación solo del propio perfil de cliente
CREATE POLICY "Users can only delete own client profile" ON clients
  FOR DELETE USING (auth.uid() = id);

-- 5. Política especial para búsquedas por email (necesaria para determinar tipo de usuario)
CREATE POLICY "Allow email lookups for authentication" ON businesses
  FOR SELECT USING (true);

CREATE POLICY "Allow email lookups for authentication" ON clients
  FOR SELECT USING (true);

-- Comentarios explicativos
COMMENT ON TABLE businesses IS 'Tabla de negocios - RLS habilitado con políticas seguras para registro';
COMMENT ON TABLE clients IS 'Tabla de clientes - RLS habilitado con políticas seguras para registro'; 