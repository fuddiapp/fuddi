-- Verificar si el usuario existe en la tabla businesses
SELECT 
  id, 
  email, 
  business_name, 
  category, 
  address,
  created_at
FROM businesses 
WHERE id = 'ee150668-ce44-4612-95ad-39ec3029ed91' 
   OR email = 'agustingalleguillosj@gmail.com';

-- Verificar si el usuario existe en la tabla clients
SELECT 
  id, 
  email, 
  created_at
FROM clients 
WHERE id = 'ee150668-ce44-4612-95ad-39ec3029ed91' 
   OR email = 'agustingalleguillosj@gmail.com';

-- Verificar todas las tablas que tienen RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('businesses', 'clients', 'promotions', 'menus_dia'); 