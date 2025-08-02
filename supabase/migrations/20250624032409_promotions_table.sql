-- Create table for promotions
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  original_price INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  category TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  views INTEGER NOT NULL DEFAULT 0,
  redemptions INTEGER NOT NULL DEFAULT 0,
  is_indefinite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promotions_business_id ON public.promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_promotions_start_date ON public.promotions(start_date);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON public.promotions(end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON public.promotions(category);
CREATE INDEX IF NOT EXISTS idx_promotions_is_indefinite ON public.promotions(is_indefinite);
CREATE INDEX IF NOT EXISTS idx_promotions_created_at ON public.promotions(created_at);

-- Enable Row Level Security
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Create policies for promotions (businesses can manage their own promotions)
CREATE POLICY "Businesses can view their own promotions" 
  ON public.promotions 
  FOR SELECT 
  USING (true); -- For now, allow viewing - we'll add proper business auth later

CREATE POLICY "Businesses can create their own promotions" 
  ON public.promotions 
  FOR INSERT 
  WITH CHECK (true); -- For now, allow creation - we'll add proper business auth later

CREATE POLICY "Businesses can update their own promotions" 
  ON public.promotions 
  FOR UPDATE 
  USING (true); -- For now, allow updates - we'll add proper business auth later

CREATE POLICY "Businesses can delete their own promotions" 
  ON public.promotions 
  FOR DELETE 
  USING (true); -- For now, allow deletion - we'll add proper business auth later

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_promotions_updated_at 
    BEFORE UPDATE ON public.promotions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 