-- Habilitar RLS en las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla clients
CREATE POLICY "Users can view their own client data" ON clients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own client data" ON clients
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own client data" ON clients
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own client data" ON clients
  FOR DELETE USING (auth.uid() = id);

-- Políticas para la tabla businesses
CREATE POLICY "Users can view their own business data" ON businesses
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own business data" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own business data" ON businesses
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own business data" ON businesses
  FOR DELETE USING (auth.uid() = id);

-- Políticas para permitir búsquedas por email (necesario para determinar tipo de usuario)
CREATE POLICY "Allow email lookups for authentication" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Allow email lookups for authentication" ON businesses
  FOR SELECT USING (true); 