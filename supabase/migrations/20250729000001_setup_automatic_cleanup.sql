-- Configuración de limpieza automática de menús del día
-- Esta migración configura la limpieza automática que se ejecuta cada día a las 00:00

-- Crear tabla de logs de limpieza
CREATE TABLE IF NOT EXISTS public.cleanup_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_cleanup_logs_action_date 
ON public.cleanup_logs(action, executed_at);

-- Política RLS para logs (solo administradores pueden ver)
ALTER TABLE public.cleanup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access to cleanup logs" ON public.cleanup_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Crear función de limpieza automática
CREATE OR REPLACE FUNCTION auto_cleanup_daily_menus()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ejecutar limpieza automática
  PERFORM cleanup_expired_daily_menus();
  
  -- Log de la ejecución
  INSERT INTO public.cleanup_logs (
    action,
    executed_at,
    status,
    details
  ) VALUES (
    'auto_cleanup_daily_menus',
    NOW(),
    'success',
    'Limpieza automática ejecutada exitosamente'
  );
  
  RAISE NOTICE 'Limpieza automática de menús del día ejecutada: %', NOW();
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error
    INSERT INTO public.cleanup_logs (
      action,
      executed_at,
      status,
      details
    ) VALUES (
      'auto_cleanup_daily_menus',
      NOW(),
      'error',
      SQLERRM
    );
    
    RAISE EXCEPTION 'Error en limpieza automática: %', SQLERRM;
END;
$$;

-- Crear función para el trigger de limpieza automática
CREATE OR REPLACE FUNCTION trigger_daily_cleanup()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si es medianoche (00:00) y no se ha ejecutado hoy
  IF EXTRACT(HOUR FROM NOW()) = 0 AND EXTRACT(MINUTE FROM NOW()) < 5 THEN
    -- Verificar si ya se ejecutó hoy
    IF NOT EXISTS (
      SELECT 1 FROM public.cleanup_logs 
      WHERE action = 'auto_cleanup_daily_menus' 
      AND DATE(executed_at) = CURRENT_DATE
      AND status = 'success'
    ) THEN
      -- Ejecutar limpieza automática
      PERFORM auto_cleanup_daily_menus();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger que se ejecute en cambios de menús
DROP TRIGGER IF EXISTS daily_cleanup_trigger ON public.menus_dia;

CREATE TRIGGER daily_cleanup_trigger
  AFTER INSERT OR UPDATE ON public.menus_dia
  FOR EACH ROW
  EXECUTE FUNCTION trigger_daily_cleanup();

-- Crear trigger adicional en reservas para mayor seguridad
DROP TRIGGER IF EXISTS daily_cleanup_reservations_trigger ON public.menu_reservations;

CREATE TRIGGER daily_cleanup_reservations_trigger
  AFTER INSERT OR UPDATE ON public.menu_reservations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_daily_cleanup();

-- Comentario de confirmación
DO $$ 
BEGIN
  RAISE NOTICE '✅ Configuración de limpieza automática completada exitosamente';
  RAISE NOTICE '📋 La limpieza se ejecutará automáticamente cada día a las 00:00';
  RAISE NOTICE '📊 Los logs se guardarán en la tabla cleanup_logs';
END $$; 