-- Crear tabla de reservas de menús del día
CREATE TABLE IF NOT EXISTS menu_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id UUID NOT NULL REFERENCES menus_dia(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    menu_name TEXT NOT NULL,
    menu_price DECIMAL(10,2) NOT NULL,
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_menu_reservations_menu_id ON menu_reservations(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_reservations_client_id ON menu_reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_menu_reservations_business_id ON menu_reservations(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_reservations_date ON menu_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_menu_reservations_status ON menu_reservations(status);

-- Habilitar RLS
ALTER TABLE menu_reservations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Los clientes pueden ver sus propias reservas
CREATE POLICY "Users can view their own reservations" ON menu_reservations
    FOR SELECT USING (auth.uid() = client_id);

-- Los clientes pueden crear reservas
CREATE POLICY "Users can create reservations" ON menu_reservations
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Los clientes pueden actualizar sus propias reservas
CREATE POLICY "Users can update their own reservations" ON menu_reservations
    FOR UPDATE USING (auth.uid() = client_id);

-- Los negocios pueden ver las reservas de sus menús
CREATE POLICY "Businesses can view their menu reservations" ON menu_reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = menu_reservations.business_id 
            AND businesses.id = auth.uid()
        )
    );

-- Los negocios pueden actualizar el estado de las reservas de sus menús
CREATE POLICY "Businesses can update their menu reservations" ON menu_reservations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = menu_reservations.business_id 
            AND businesses.id = auth.uid()
        )
    );

-- Función para obtener el conteo de reservas por negocio y fecha
CREATE OR REPLACE FUNCTION get_business_reservations_count(business_uuid UUID, reservation_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM menu_reservations
        WHERE business_id = business_uuid 
        AND reservation_date = $2
        AND status IN ('pending', 'confirmed')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar reservas antiguas (se ejecutará automáticamente)
CREATE OR REPLACE FUNCTION cleanup_old_reservations()
RETURNS VOID AS $$
BEGIN
    DELETE FROM menu_reservations 
    WHERE reservation_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 