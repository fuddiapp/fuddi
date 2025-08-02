-- Permitir eliminaciones de menús con user_id null
CREATE POLICY "Allow anonymous menu deletion" ON daily_menus
FOR DELETE USING (user_id IS NULL); 