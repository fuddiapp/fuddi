-- Eliminar registros con business_id no válido en products
DELETE FROM products WHERE business_id IS NULL OR business_id !~* '^[0-9a-fA-F-]{36}$';

-- Cambiar tipo y agregar foreign key en products
ALTER TABLE products
  ALTER COLUMN business_id TYPE uuid USING business_id::uuid,
  ADD CONSTRAINT fk_products_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- Eliminar registros con business_id no válido en promotions
DELETE FROM promotions WHERE business_id IS NULL OR business_id !~* '^[0-9a-fA-F-]{36}$';

-- Cambiar tipo y agregar foreign key en promotions
ALTER TABLE promotions
  ALTER COLUMN business_id TYPE uuid USING business_id::uuid,
  ADD CONSTRAINT fk_promotions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- (Eliminado bloque conflictivo de menus_dia) 