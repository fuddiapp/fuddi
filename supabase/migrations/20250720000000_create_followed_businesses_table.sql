-- Crear tabla para manejar negocios seguidos por clientes
CREATE TABLE IF NOT EXISTS followed_businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, business_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_followed_businesses_client_id ON followed_businesses(client_id);
CREATE INDEX IF NOT EXISTS idx_followed_businesses_business_id ON followed_businesses(business_id);
CREATE INDEX IF NOT EXISTS idx_followed_businesses_created_at ON followed_businesses(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE followed_businesses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para followed_businesses
-- Los usuarios solo pueden ver sus propios seguimientos
CREATE POLICY "Users can view their own followed businesses" ON followed_businesses
    FOR SELECT USING (auth.uid() = client_id);

-- Los usuarios solo pueden insertar sus propios seguimientos
CREATE POLICY "Users can insert their own followed businesses" ON followed_businesses
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Los usuarios solo pueden eliminar sus propios seguimientos
CREATE POLICY "Users can delete their own followed businesses" ON followed_businesses
    FOR DELETE USING (auth.uid() = client_id);

-- Función para obtener el conteo de seguimientos de un negocio
CREATE OR REPLACE FUNCTION get_business_followers_count(business_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM followed_businesses 
        WHERE business_id = business_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario sigue un negocio
CREATE OR REPLACE FUNCTION is_user_following_business(user_uuid UUID, business_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM followed_businesses 
        WHERE client_id = user_uuid AND business_id = business_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 