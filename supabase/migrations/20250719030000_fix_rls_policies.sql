-- Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Users can view their own business data" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business data" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business data" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own business data" ON businesses;
DROP POLICY IF EXISTS "Allow email lookups for authentication" ON businesses;

DROP POLICY IF EXISTS "Users can view their own client data" ON clients;
DROP POLICY IF EXISTS "Users can insert their own client data" ON clients;
DROP POLICY IF EXISTS "Users can update their own client data" ON clients;
DROP POLICY IF EXISTS "Users can delete their own client data" ON clients;
DROP POLICY IF EXISTS "Allow email lookups for authentication" ON clients;

-- Crear nuevas políticas más permisivas para businesses
CREATE POLICY "Enable read access for authenticated users" ON businesses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON businesses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON businesses
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id" ON businesses
  FOR DELETE USING (auth.uid() = id);

-- Crear nuevas políticas más permisivas para clients
CREATE POLICY "Enable read access for authenticated users" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id" ON clients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id" ON clients
  FOR DELETE USING (auth.uid() = id);

-- Políticas para promotions
CREATE POLICY "Enable read access for authenticated users" ON promotions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON promotions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on business_id" ON promotions
  FOR UPDATE USING (auth.uid()::uuid = business_id::uuid);

CREATE POLICY "Enable delete for users based on business_id" ON promotions
  FOR DELETE USING (auth.uid()::uuid = business_id::uuid);

-- Políticas para menus_dia
CREATE POLICY "Enable read access for authenticated users" ON menus_dia
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON menus_dia
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on business_id" ON menus_dia
  FOR UPDATE USING (auth.uid()::uuid = business_id::uuid);

CREATE POLICY "Enable delete for users based on business_id" ON menus_dia
  FOR DELETE USING (auth.uid()::uuid = business_id::uuid); 