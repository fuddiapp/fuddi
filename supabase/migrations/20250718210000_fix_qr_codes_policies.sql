-- Eliminar políticas existentes de business_qr_codes
DROP POLICY IF EXISTS "Businesses can view their own QR codes" ON public.business_qr_codes;
DROP POLICY IF EXISTS "Businesses can create their own QR codes" ON public.business_qr_codes;
DROP POLICY IF EXISTS "Businesses can update their own QR codes" ON public.business_qr_codes;

-- Crear nuevas políticas para business_qr_codes
CREATE POLICY "Businesses can view their own QR codes" 
  ON public.business_qr_codes 
  FOR SELECT 
  USING (auth.uid()::text = business_id::text);

CREATE POLICY "Businesses can create their own QR codes" 
  ON public.business_qr_codes 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = business_id::text);

CREATE POLICY "Businesses can update their own QR codes" 
  ON public.business_qr_codes 
  FOR UPDATE 
  USING (auth.uid()::text = business_id::text);

-- Políticas para qr_code_interactions
DROP POLICY IF EXISTS "Allow public interaction creation" ON public.qr_code_interactions;
DROP POLICY IF EXISTS "Businesses can view interactions for their QR codes" ON public.qr_code_interactions;

CREATE POLICY "Allow public interaction creation" 
  ON public.qr_code_interactions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Businesses can view interactions for their QR codes" 
  ON public.qr_code_interactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.business_qr_codes 
      WHERE business_qr_codes.id = qr_code_interactions.qr_code_id 
      AND business_qr_codes.business_id::text = auth.uid()::text
    )
  ); 