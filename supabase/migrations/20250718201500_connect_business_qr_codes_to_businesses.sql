-- Eliminar registros con business_id no válido en business_qr_codes
DELETE FROM business_qr_codes WHERE business_id IS NULL OR business_id !~* '^[0-9a-fA-F-]{36}$';

-- Cambiar tipo de business_id a uuid
ALTER TABLE business_qr_codes ALTER COLUMN business_id TYPE uuid USING business_id::uuid;

-- Agregar clave foránea a businesses(id)
ALTER TABLE business_qr_codes ADD CONSTRAINT fk_qr_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE; 