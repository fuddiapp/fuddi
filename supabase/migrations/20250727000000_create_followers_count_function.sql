-- Función para obtener el conteo de seguidores de un negocio
-- Esta función es SECURITY DEFINER para que pueda acceder a los datos
CREATE OR REPLACE FUNCTION get_business_followers_count(business_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  followers_count INTEGER;
BEGIN
  -- Contar seguidores del negocio
  SELECT COUNT(*)::INTEGER 
  INTO followers_count
  FROM followed_businesses 
  WHERE business_id = business_uuid;
  
  RETURN COALESCE(followers_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario sobre la función
COMMENT ON FUNCTION get_business_followers_count(UUID) IS 
'Función para contar seguidores de un negocio. SECURITY DEFINER permite acceso a datos protegidos por RLS.'; 