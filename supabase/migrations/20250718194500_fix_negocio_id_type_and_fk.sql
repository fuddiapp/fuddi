-- Si negocio_id es text, eliminar datos no válidos y cambiar a uuid
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menus_dia' AND column_name = 'negocio_id' AND data_type = 'text'
  ) THEN
    DELETE FROM menus_dia WHERE negocio_id IS NULL OR negocio_id !~* '^[0-9a-fA-F-]{36}$';
    ALTER TABLE menus_dia ALTER COLUMN negocio_id TYPE uuid USING negocio_id::uuid;
  END IF;
END $$;

-- Agregar clave foránea si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'menus_dia' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fk_menusdia_business'
  ) THEN
    ALTER TABLE menus_dia ADD CONSTRAINT fk_menusdia_business FOREIGN KEY (negocio_id) REFERENCES businesses(id) ON DELETE CASCADE;
  END IF;
END $$; 