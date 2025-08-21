
-- Create table for tracking musician earnings/balance
CREATE TABLE public.musician_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  musician_id UUID NOT NULL REFERENCES public.musicians(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  source_type TEXT NOT NULL, -- 'tip', 'performance', etc.
  source_id UUID, -- reference to tip_id or other source
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.musician_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for musician_earnings
CREATE POLICY "Musicians can view their own earnings" 
  ON public.musician_earnings 
  FOR SELECT 
  USING (auth.uid() = musician_id);

CREATE POLICY "Musicians can create their own earnings" 
  ON public.musician_earnings 
  FOR INSERT 
  WITH CHECK (auth.uid() = musician_id);

-- Function to calculate total balance for a musician
CREATE OR REPLACE FUNCTION public.get_musician_balance(musician_uuid UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_balance DECIMAL(10,2) DEFAULT 0;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_balance
  FROM public.musician_earnings
  WHERE musician_id = musician_uuid;
  
  RETURN total_balance;
END;
$$;

-- Enable realtime for musician_earnings table
ALTER TABLE public.musician_earnings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.musician_earnings;