-- Crear tabla para canjes de promociones
CREATE TABLE IF NOT EXISTS promotion_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  redemption_method TEXT NOT NULL CHECK (redemption_method IN ('code', 'qr')),
  code_used TEXT NOT NULL,
  redemption_amount DECIMAL(10,2) NOT NULL,
  redemption_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_promotion_id ON promotion_redemptions(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_client_id ON promotion_redemptions(client_id);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_business_id ON promotion_redemptions(business_id);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_redemption_date ON promotion_redemptions(redemption_date);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_created_at ON promotion_redemptions(created_at);

-- Habilitar RLS
ALTER TABLE promotion_redemptions ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Clients can view their own redemptions" ON promotion_redemptions;
DROP POLICY IF EXISTS "Clients can create redemptions" ON promotion_redemptions;
DROP POLICY IF EXISTS "Businesses can view redemptions of their promotions" ON promotion_redemptions;

-- Políticas RLS para promotion_redemptions

-- Los clientes pueden ver sus propios canjes
CREATE POLICY "Clients can view their own redemptions" ON promotion_redemptions
  FOR SELECT USING (client_id = auth.uid());

-- Los clientes pueden crear canjes
CREATE POLICY "Clients can create redemptions" ON promotion_redemptions
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Los negocios pueden ver canjes de sus promociones
CREATE POLICY "Businesses can view redemptions of their promotions" ON promotion_redemptions
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE id = auth.uid()
    )
  );

-- Política para permitir lectura anónima (para validación de códigos)
CREATE POLICY "Allow anonymous read for code validation" ON promotion_redemptions
  FOR SELECT USING (true);

-- Trigger para actualizar contadores en la tabla promotions
CREATE OR REPLACE FUNCTION update_promotion_redemption_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar el contador de redenciones en la tabla promotions
  UPDATE promotions 
  SET redemptions = COALESCE(redemptions, 0) + 1
  WHERE id = NEW.promotion_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_promotion_redemption_count
  AFTER INSERT ON promotion_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_redemption_count(); 