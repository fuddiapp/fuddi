-- Agregar campo max_promotions a la tabla businesses
-- ================================================

-- Agregar columna para límite de promociones
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS max_promotions INTEGER DEFAULT 25;

-- Crear índice para consultas por límite de promociones
CREATE INDEX IF NOT EXISTS idx_businesses_max_promotions ON businesses(max_promotions);

-- Comentario para documentar el campo
COMMENT ON COLUMN businesses.max_promotions IS 'Número máximo de promociones que puede crear el negocio (por defecto 25)';

-- Actualizar negocios existentes con un límite alto para no afectar funcionalidad actual
-- Los negocios que ya tienen más de 25 promociones mantendrán su límite alto
UPDATE businesses 
SET max_promotions = GREATEST(25, (
  SELECT COALESCE(COUNT(*), 0) 
  FROM promotions 
  WHERE promotions.business_id = businesses.id
) + 10)
WHERE max_promotions IS NULL;

