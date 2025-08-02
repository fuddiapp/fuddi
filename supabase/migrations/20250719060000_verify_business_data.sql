-- Verificar si existe algún negocio con el ID del usuario
SELECT 
  id, 
  email, 
  business_name, 
  category, 
  address,
  created_at
FROM businesses 
WHERE id = 'ee150668-ce44-4612-95ad-39ec3029ed91';

-- Verificar si existe algún negocio con el email del usuario
SELECT 
  id, 
  email, 
  business_name, 
  category, 
  address,
  created_at
FROM businesses 
WHERE email = 'agustingalleguillosj@gmail.com';

-- Verificar todos los negocios en la tabla
SELECT 
  id, 
  email, 
  business_name, 
  category,
  created_at
FROM businesses 
ORDER BY created_at DESC 
LIMIT 10; 