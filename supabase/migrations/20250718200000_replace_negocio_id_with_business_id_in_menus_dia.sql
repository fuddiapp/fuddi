-- Eliminar la columna negocio_id si existe
ALTER TABLE menus_dia DROP COLUMN IF EXISTS negocio_id;

-- Agregar la columna business_id tipo uuid
ALTER TABLE menus_dia ADD COLUMN IF NOT EXISTS business_id uuid;

-- Agregar clave foránea a businesses(id)
ALTER TABLE menus_dia ADD CONSTRAINT fk_menusdia_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE; 