-- Agregar campos de contacto a la tabla businesses
-- ================================================

-- Agregar columnas para información de contacto
ALTER TABLE businesses 
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS website text;

-- Crear índices para búsquedas por redes sociales (opcional)
CREATE INDEX IF NOT EXISTS idx_businesses_instagram ON businesses(instagram) WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_facebook ON businesses(facebook) WHERE facebook IS NOT NULL;

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN businesses.phone IS 'Número de teléfono del negocio (opcional)';
COMMENT ON COLUMN businesses.instagram IS 'Usuario de Instagram del negocio (opcional)';
COMMENT ON COLUMN businesses.facebook IS 'Usuario de Facebook del negocio (opcional)';
COMMENT ON COLUMN businesses.website IS 'Sitio web del negocio (opcional)'; 