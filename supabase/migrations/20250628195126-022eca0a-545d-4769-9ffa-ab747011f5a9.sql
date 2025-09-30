
-- Create consumer_follows table to track which musicians consumers follow
CREATE TABLE public.consumer_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_id UUID NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES public.musicians(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(consumer_id, musician_id)
);

-- Create consumer_blocks table to track which musicians consumers have blocked
CREATE TABLE public.consumer_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_id UUID NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES public.musicians(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(consumer_id, musician_id)
);

-- Enable Row Level Security for both tables
ALTER TABLE public.consumer_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for consumer_follows
CREATE POLICY "Users can view their own follows" 
  ON public.consumer_follows 
  FOR SELECT 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can create their own follows" 
  ON public.consumer_follows 
  FOR INSERT 
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Users can delete their own follows" 
  ON public.consumer_follows 
  FOR DELETE 
  USING (auth.uid() = consumer_id);

-- RLS policies for consumer_blocks
CREATE POLICY "Users can view their own blocks" 
  ON public.consumer_blocks 
  FOR SELECT 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can create their own blocks" 
  ON public.consumer_blocks 
  FOR INSERT 
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Users can delete their own blocks" 
  ON public.consumer_blocks 
  FOR DELETE 
  USING (auth.uid() = consumer_id);