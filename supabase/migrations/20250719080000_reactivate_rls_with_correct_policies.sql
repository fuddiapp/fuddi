-- Reactivar RLS con políticas correctas
-- ======================================

-- 1. Reactivar RLS en todas las tablas
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para businesses
-- Permitir a los usuarios ver solo su propio negocio
DROP POLICY IF EXISTS "Users can view own business" ON businesses;
CREATE POLICY "Users can view own business" ON businesses
  FOR SELECT USING (auth.uid() = id);

-- Permitir a los usuarios insertar su propio negocio
DROP POLICY IF EXISTS "Users can insert own business" ON businesses;
CREATE POLICY "Users can insert own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir a los usuarios actualizar su propio negocio
DROP POLICY IF EXISTS "Users can update own business" ON businesses;
CREATE POLICY "Users can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = id);

-- Permitir a los usuarios eliminar su propio negocio
DROP POLICY IF EXISTS "Users can delete own business" ON businesses;
CREATE POLICY "Users can delete own business" ON businesses
  FOR DELETE USING (auth.uid() = id);

-- 3. Políticas para clients
-- Permitir a los usuarios ver solo su propio perfil de cliente
DROP POLICY IF EXISTS "Users can view own client profile" ON clients;
CREATE POLICY "Users can view own client profile" ON clients
  FOR SELECT USING (auth.uid() = id);

-- Permitir a los usuarios insertar su propio perfil de cliente
DROP POLICY IF EXISTS "Users can insert own client profile" ON clients;
CREATE POLICY "Users can insert own client profile" ON clients
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir a los usuarios actualizar su propio perfil de cliente
DROP POLICY IF EXISTS "Users can update own client profile" ON clients;
CREATE POLICY "Users can update own client profile" ON clients
  FOR UPDATE USING (auth.uid() = id);

-- Permitir a los usuarios eliminar su propio perfil de cliente
DROP POLICY IF EXISTS "Users can delete own client profile" ON clients;
CREATE POLICY "Users can delete own client profile" ON clients
  FOR DELETE USING (auth.uid() = id);

-- 4. Políticas para promotions
-- Permitir a los negocios ver sus propias promociones
DROP POLICY IF EXISTS "Businesses can view own promotions" ON promotions;
CREATE POLICY "Businesses can view own promotions" ON promotions
  FOR SELECT USING (auth.uid() = business_id);

-- Permitir a los negocios insertar sus propias promociones
DROP POLICY IF EXISTS "Businesses can insert own promotions" ON promotions;
CREATE POLICY "Businesses can insert own promotions" ON promotions
  FOR INSERT WITH CHECK (auth.uid() = business_id);

-- Permitir a los negocios actualizar sus propias promociones
DROP POLICY IF EXISTS "Businesses can update own promotions" ON promotions;
CREATE POLICY "Businesses can update own promotions" ON promotions
  FOR UPDATE USING (auth.uid() = business_id);

-- Permitir a los negocios eliminar sus propias promociones
DROP POLICY IF EXISTS "Businesses can delete own promotions" ON promotions;
CREATE POLICY "Businesses can delete own promotions" ON promotions
  FOR DELETE USING (auth.uid() = business_id);

-- Permitir a los clientes ver todas las promociones activas
DROP POLICY IF EXISTS "Clients can view active promotions" ON promotions;
CREATE POLICY "Clients can view active promotions" ON promotions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE clients.id = auth.uid()
    )
  );

-- 5. Políticas para menus_dia
-- Permitir a los negocios ver sus propios menús del día
DROP POLICY IF EXISTS "Businesses can view own daily menus" ON menus_dia;
CREATE POLICY "Businesses can view own daily menus" ON menus_dia
  FOR SELECT USING (auth.uid() = business_id);

-- Permitir a los negocios insertar sus propios menús del día
DROP POLICY IF EXISTS "Businesses can insert own daily menus" ON menus_dia;
CREATE POLICY "Businesses can insert own daily menus" ON menus_dia
  FOR INSERT WITH CHECK (auth.uid() = business_id);

-- Permitir a los negocios actualizar sus propios menús del día
DROP POLICY IF EXISTS "Businesses can update own daily menus" ON menus_dia;
CREATE POLICY "Businesses can update own daily menus" ON menus_dia
  FOR UPDATE USING (auth.uid() = business_id);

-- Permitir a los negocios eliminar sus propios menús del día
DROP POLICY IF EXISTS "Businesses can delete own daily menus" ON menus_dia;
CREATE POLICY "Businesses can delete own daily menus" ON menus_dia
  FOR DELETE USING (auth.uid() = business_id);

-- Permitir a los clientes ver todos los menús del día
DROP POLICY IF EXISTS "Clients can view daily menus" ON menus_dia;
CREATE POLICY "Clients can view daily menus" ON menus_dia
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE clients.id = auth.uid()
    )
  );

-- 6. Políticas para products
-- Permitir a los negocios ver sus propios productos
DROP POLICY IF EXISTS "Businesses can view own products" ON products;
CREATE POLICY "Businesses can view own products" ON products
  FOR SELECT USING (auth.uid() = business_id);

-- Permitir a los negocios insertar sus propios productos
DROP POLICY IF EXISTS "Businesses can insert own products" ON products;
CREATE POLICY "Businesses can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = business_id);

-- Permitir a los negocios actualizar sus propios productos
DROP POLICY IF EXISTS "Businesses can update own products" ON products;
CREATE POLICY "Businesses can update own products" ON products
  FOR UPDATE USING (auth.uid() = business_id);

-- Permitir a los negocios eliminar sus propios productos
DROP POLICY IF EXISTS "Businesses can delete own products" ON products;
CREATE POLICY "Businesses can delete own products" ON products
  FOR DELETE USING (auth.uid() = business_id);

-- Permitir a los clientes ver todos los productos
DROP POLICY IF EXISTS "Clients can view products" ON products;
CREATE POLICY "Clients can view products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE clients.id = auth.uid()
    )
  ); 