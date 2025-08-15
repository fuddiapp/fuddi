-- Actualizar límite de promociones de 8 a 10
-- ===========================================

-- Actualizar todos los negocios que tengan exactamente 8 promociones como límite
UPDATE businesses 
SET max_promotions = 10
WHERE max_promotions = 8;

-- También actualizar el valor por defecto para futuros negocios
-- (Esto no afecta a los negocios existentes, solo a los nuevos)
ALTER TABLE businesses 
ALTER COLUMN max_promotions SET DEFAULT 10;

-- Comentario para documentar el cambio
COMMENT ON COLUMN businesses.max_promotions IS 'Número máximo de promociones que puede crear el negocio (por defecto 10)';

-- Verificar cuántos negocios fueron actualizados
-- SELECT COUNT(*) as negocios_actualizados FROM businesses WHERE max_promotions = 10;
