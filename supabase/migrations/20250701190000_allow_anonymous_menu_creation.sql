-- Permitir inserciones de menús con user_id null para pruebas
CREATE POLICY "Allow anonymous menu creation" ON daily_menus
FOR INSERT WITH CHECK (user_id IS NULL);

-- Permitir lectura de menús con user_id null
CREATE POLICY "Allow anonymous menu reading" ON daily_menus
FOR SELECT USING (user_id IS NULL); 