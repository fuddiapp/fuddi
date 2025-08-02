-- Asegurar que la columna categories existe en daily_menus para menús detallados
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_menus' 
        AND column_name = 'categories'
    ) THEN
        ALTER TABLE public.daily_menus ADD COLUMN categories jsonb;
    END IF;
END $$; 