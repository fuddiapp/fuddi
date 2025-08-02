-- Insertar un negocio de prueba para el usuario
INSERT INTO businesses (
  id,
  email,
  business_name,
  category,
  description,
  address,
  opening_time,
  closing_time,
  location_lat,
  location_lng,
  created_at
) VALUES (
  'ee150668-ce44-4612-95ad-39ec3029ed91',
  'agustingalleguillosj@gmail.com',
  'Mi Restaurante de Prueba',
  'Restaurante',
  'Un restaurante de prueba para verificar el dashboard',
  'Av. Providencia 1234, Santiago',
  '08:00:00',
  '22:00:00',
  -33.4489,
  -70.6693,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  address = EXCLUDED.address,
  opening_time = EXCLUDED.opening_time,
  closing_time = EXCLUDED.closing_time,
  location_lat = EXCLUDED.location_lat,
  location_lng = EXCLUDED.location_lng; 