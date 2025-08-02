-- Función para limpiar automáticamente los menús del día que ya no son vigentes
-- Esta función se ejecutará automáticamente todos los días a las 00:00

-- Función principal de limpieza
CREATE OR REPLACE FUNCTION cleanup_expired_daily_menus()
RETURNS VOID AS $$
DECLARE
    deleted_count INTEGER := 0;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Eliminar menús del día que no son de la fecha actual
    DELETE FROM menus_dia 
    WHERE menu_date < today_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de la limpieza (opcional, para debugging)
    RAISE NOTICE 'Limpieza automática completada: % menús eliminados', deleted_count;
    
    -- También limpiar reservas asociadas a menús eliminados
    DELETE FROM menu_reservations 
    WHERE reservation_date < today_date;
    
    RAISE NOTICE 'Reservas antiguas también eliminadas';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un menú está vigente (para uso en consultas)
CREATE OR REPLACE FUNCTION is_menu_current(menu_date_param DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN menu_date_param = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener solo menús vigentes
CREATE OR REPLACE FUNCTION get_current_daily_menus(business_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    dia TEXT,
    nombre_menu TEXT,
    descripcion_menu TEXT,
    precio_menu DECIMAL(10,2),
    business_id UUID,
    user_id UUID,
    created_at TIMESTAMPTZ,
    menu_date DATE,
    allow_reservations BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        md.id,
        md.dia,
        md.nombre_menu,
        md.descripcion_menu,
        md.precio_menu,
        md.business_id,
        md.user_id,
        md.created_at,
        md.menu_date,
        md.allow_reservations
    FROM menus_dia md
    WHERE md.menu_date = CURRENT_DATE
    AND (business_id_param IS NULL OR md.business_id = business_id_param)
    ORDER BY md.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear índices adicionales para mejorar el rendimiento de las consultas de limpieza
CREATE INDEX IF NOT EXISTS idx_menus_dia_date_created ON menus_dia(menu_date, created_at);
CREATE INDEX IF NOT EXISTS idx_menu_reservations_date_status ON menu_reservations(reservation_date, status);

-- Comentarios para documentar las nuevas funciones
COMMENT ON FUNCTION cleanup_expired_daily_menus() IS 'Elimina automáticamente los menús del día que ya no son vigentes (fecha anterior a hoy)';
COMMENT ON FUNCTION is_menu_current(DATE) IS 'Verifica si un menú está vigente para la fecha actual';
COMMENT ON FUNCTION get_current_daily_menus(UUID) IS 'Obtiene solo los menús del día que están vigentes para la fecha actual'; 