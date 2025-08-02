-- Configurar políticas de storage para el bucket de promociones
-- Esta migración debe ejecutarse después de crear el bucket manualmente en el dashboard de Supabase

-- Política para permitir subir archivos al bucket de promociones
CREATE POLICY "Allow public uploads to promotions bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'promotions');

-- Política para permitir ver archivos del bucket de promociones
CREATE POLICY "Allow public viewing of promotions bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'promotions');

-- Política para permitir actualizar archivos del bucket de promociones
CREATE POLICY "Allow public updates to promotions bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'promotions');

-- Política para permitir eliminar archivos del bucket de promociones
CREATE POLICY "Allow public deletion from promotions bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'promotions');



-- Nota: El bucket 'promotions' debe crearse manualmente en el dashboard de Supabase
-- con las siguientes configuraciones:
-- - Public: true
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- - File size limit: 5MB 