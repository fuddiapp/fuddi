
-- Create table for business QR codes
CREATE TABLE IF NOT EXISTS public.business_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL,
  qr_code_data TEXT NOT NULL,
  four_digit_code VARCHAR(4) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_qr_codes_business_id ON public.business_qr_codes(business_id);
CREATE INDEX IF NOT EXISTS idx_business_qr_codes_four_digit_code ON public.business_qr_codes(four_digit_code);
CREATE INDEX IF NOT EXISTS idx_business_qr_codes_status ON public.business_qr_codes(status);

-- Create table for tracking QR code interactions
CREATE TABLE IF NOT EXISTS public.qr_code_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.business_qr_codes(id) ON DELETE CASCADE,
  user_identifier TEXT, -- Could be user ID, device ID, or anonymous identifier
  interaction_type TEXT NOT NULL DEFAULT 'scan' CHECK (interaction_type IN ('scan', 'manual_entry')),
  interaction_data JSONB, -- Store additional data about the interaction
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for interactions
CREATE INDEX IF NOT EXISTS idx_qr_interactions_qr_code_id ON public.qr_code_interactions(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_interactions_created_at ON public.qr_code_interactions(created_at);

-- Enable Row Level Security
ALTER TABLE public.business_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for business_qr_codes (businesses can manage their own codes)
CREATE POLICY "Businesses can view their own QR codes" 
  ON public.business_qr_codes 
  FOR SELECT 
  USING (true); -- For now, allow viewing - we'll add proper business auth later

CREATE POLICY "Businesses can create their own QR codes" 
  ON public.business_qr_codes 
  FOR INSERT 
  WITH CHECK (true); -- For now, allow creation - we'll add proper business auth later

CREATE POLICY "Businesses can update their own QR codes" 
  ON public.business_qr_codes 
  FOR UPDATE 
  USING (true); -- For now, allow updates - we'll add proper business auth later

-- Create policies for qr_code_interactions (public read for analytics, restricted write)
CREATE POLICY "Allow public interaction creation" 
  ON public.qr_code_interactions 
  FOR INSERT 
  WITH CHECK (true); -- Allow anyone to create interactions

CREATE POLICY "Businesses can view interactions for their QR codes" 
  ON public.qr_code_interactions 
  FOR SELECT 
  USING (true); -- For now, allow viewing - we'll add proper business auth later
