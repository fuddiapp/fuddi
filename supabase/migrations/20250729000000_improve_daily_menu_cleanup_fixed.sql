-- Mejorar la limpieza automática de menús del día (VERSIÓN CORREGIDA)
-- Esta migración elimina las funciones existentes antes de crear las nuevas

-- 1. Eliminar funciones existentes primero
DROP FUNCTION IF EXISTS cleanup_expired_daily_menus();
DROP FUNCTION IF EXISTS get_daily_menus_cleanup_status();
DROP FUNCTION IF EXISTS manual_cleanup_daily_menus();
DROP FUNCTION IF EXISTS get_current_daily_menus(UUID);
DROP FUNCTION IF EXISTS get_current_menu_reservations(UUID);

-- 2. Mejorar la función principal de limpieza
CREATE OR REPLACE FUNCTION cleanup_expired_daily_menus()
RETURNS JSON AS $$
DECLARE
    deleted_menus_count INTEGER := 0;
    deleted_reservations_count INTEGER := 0;
    today_date DATE := CURRENT_DATE;
    result JSON;
BEGIN
    -- Log del inicio de la limpieza
    RAISE NOTICE 'Iniciando limpieza automática de menús del día para fecha: %', today_date;
    
    -- Eliminar menús del día que no son de la fecha actual
    DELETE FROM menus_dia 
    WHERE menu_date < today_date;
    
    GET DIAGNOSTICS deleted_menus_count = ROW_COUNT;
    
    -- Eliminar reservas asociadas a menús eliminados o reservas expiradas
    DELETE FROM menu_reservations 
    WHERE reservation_date < today_date;
    
    GET DIAGNOSTICS deleted_reservations_count = ROW_COUNT;
    
    -- Crear resultado JSON
    result := json_build_object(
        'success', true,
        'date', today_date,
        'deleted_menus', deleted_menus_count,
        'deleted_reservations', deleted_reservations_count,
        'timestamp', now()
    );
    
    -- Log del resultado
    RAISE NOTICE 'Limpieza completada: % menús y % reservas eliminadas', deleted_menus_count, deleted_reservations_count;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Función para verificar el estado de limpieza
CREATE OR REPLACE FUNCTION get_daily_menus_cleanup_status()
RETURNS JSON AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    current_menus_count INTEGER;
    expired_menus_count INTEGER;
    current_reservations_count INTEGER;
    expired_reservations_count INTEGER;
    result JSON;
BEGIN
    -- Contar menús vigentes
    SELECT COUNT(*) INTO current_menus_count
    FROM menus_dia 
    WHERE menu_date = today_date;
    
    -- Contar menús expirados
    SELECT COUNT(*) INTO expired_menus_count
    FROM menus_dia 
    WHERE menu_date < today_date;
    
    -- Contar reservas vigentes
    SELECT COUNT(*) INTO current_reservations_count
    FROM menu_reservations 
    WHERE reservation_date = today_date;
    
    -- Contar reservas expiradas
    SELECT COUNT(*) INTO expired_reservations_count
    FROM menu_reservations 
    WHERE reservation_date < today_date;
    
    -- Crear resultado JSON
    result := json_build_object(
        'date', today_date,
        'menus', json_build_object(
            'current', current_menus_count,
            'expired', expired_menus_count,
            'total', current_menus_count + expired_menus_count
        ),
        'reservations', json_build_object(
            'current', current_reservations_count,
            'expired', expired_reservations_count,
            'total', current_reservations_count + expired_reservations_count
        ),
        'needs_cleanup', expired_menus_count > 0 OR expired_reservations_count > 0,
        'timestamp', now()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función para limpiar manualmente (para uso desde el frontend)
CREATE OR REPLACE FUNCTION manual_cleanup_daily_menus()
RETURNS JSON AS $$
BEGIN
    -- Ejecutar la limpieza automática
    RETURN cleanup_expired_daily_menus();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para obtener solo menús vigentes (mejorada)
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

-- 6. Función para obtener solo reservas vigentes
CREATE OR REPLACE FUNCTION get_current_menu_reservations(business_id_param UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    menu_id UUID,
    client_id UUID,
    business_id UUID,
    client_name TEXT,
    menu_name TEXT,
    menu_price DECIMAL(10,2),
    reservation_date DATE,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mr.id,
        mr.menu_id,
        mr.client_id,
        mr.business_id,
        mr.client_name,
        mr.menu_name,
        mr.menu_price,
        mr.reservation_date,
        mr.status,
        mr.created_at,
        mr.updated_at
    FROM menu_reservations mr
    WHERE mr.reservation_date = CURRENT_DATE
    AND (business_id_param IS NULL OR mr.business_id = business_id_param)
    ORDER BY mr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear índices adicionales para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_menus_dia_date_business ON menus_dia(menu_date, business_id);
CREATE INDEX IF NOT EXISTS idx_menu_reservations_date_business ON menu_reservations(reservation_date, business_id);
CREATE INDEX IF NOT EXISTS idx_menus_dia_created_date ON menus_dia(created_at, menu_date);
CREATE INDEX IF NOT EXISTS idx_menu_reservations_created_date ON menu_reservations(created_at, reservation_date);

-- 8. Comentarios para documentar las funciones
COMMENT ON FUNCTION cleanup_expired_daily_menus() IS 'Elimina automáticamente los menús del día y reservas expiradas. Retorna estadísticas de la limpieza.';
COMMENT ON FUNCTION get_daily_menus_cleanup_status() IS 'Obtiene el estado actual de menús y reservas para determinar si se necesita limpieza.';
COMMENT ON FUNCTION manual_cleanup_daily_menus() IS 'Ejecuta limpieza manual de menús y reservas expiradas.';
COMMENT ON FUNCTION get_current_daily_menus(UUID) IS 'Obtiene solo los menús del día que están vigentes para la fecha actual.';
COMMENT ON FUNCTION get_current_menu_reservations(UUID) IS 'Obtiene solo las reservas de menús que están vigentes para la fecha actual.';

-- 9. Verificar que las funciones se crearon correctamente
DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada exitosamente';
    RAISE NOTICE '✅ Funciones creadas:';
    RAISE NOTICE '   - cleanup_expired_daily_menus()';
    RAISE NOTICE '   - get_daily_menus_cleanup_status()';
    RAISE NOTICE '   - manual_cleanup_daily_menus()';
    RAISE NOTICE '   - get_current_daily_menus(UUID)';
    RAISE NOTICE '   - get_current_menu_reservations(UUID)';
END $$; 