-- Crear tabla para productos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_business_id ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_categories ON public.products USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Habilitar Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según autenticación)
CREATE POLICY "Businesses can view their own products"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Businesses can create their own products"
  ON public.products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Businesses can update their own products"
  ON public.products
  FOR UPDATE
  USING (true);

CREATE POLICY "Businesses can delete their own products"
  ON public.products
  FOR DELETE
  USING (true);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 