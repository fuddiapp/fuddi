-- Crear tabla para almacenar los menús del día
CREATE TABLE IF NOT EXISTS menus_dia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dia TEXT NOT NULL,
    menus JSONB NOT NULL DEFAULT '[]'::jsonb,
    negocio_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_menus_dia_dia ON menus_dia(dia);
CREATE INDEX IF NOT EXISTS idx_menus_dia_negocio_id ON menus_dia(negocio_id);
CREATE INDEX IF NOT EXISTS idx_menus_dia_user_id ON menus_dia(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_dia_created_at ON menus_dia(created_at);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE menus_dia ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios menús del día
CREATE POLICY "Users can view their own daily menus" ON menus_dia
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios solo inserten sus propios menús del día
CREATE POLICY "Users can insert their own daily menus" ON menus_dia
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo actualicen sus propios menús del día
CREATE POLICY "Users can update their own daily menus" ON menus_dia
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios solo eliminen sus propios menús del día
CREATE POLICY "Users can delete their own daily menus" ON menus_dia
    FOR DELETE USING (auth.uid() = user_id);

-- Comentarios para documentar la tabla
COMMENT ON TABLE menus_dia IS 'Tabla para almacenar los menús del día creados por los negocios';
COMMENT ON COLUMN menus_dia.id IS 'Identificador único del registro';
COMMENT ON COLUMN menus_dia.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN menus_dia.dia IS 'Día de la semana (Ej: "Miércoles")';
COMMENT ON COLUMN menus_dia.menus IS 'Array de objetos JSON con los menús del día';
COMMENT ON COLUMN menus_dia.negocio_id IS 'ID del negocio asociado (opcional)';
COMMENT ON COLUMN menus_dia.user_id IS 'ID del usuario que creó el menú'; 