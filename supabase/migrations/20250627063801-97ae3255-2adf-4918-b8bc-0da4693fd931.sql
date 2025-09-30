
-- Create table for consumer check-ins to musician events
CREATE TABLE public.consumer_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_id UUID NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES public.musicians(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_start_time TIME NOT NULL,
  event_end_time TIME NOT NULL,
  location TEXT NOT NULL,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for consumer tips to musicians
CREATE TABLE public.consumer_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_id UUID NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES public.musicians(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  checkin_id UUID REFERENCES public.consumer_checkins(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for consumer reviews of musicians
CREATE TABLE public.consumer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consumer_id UUID NOT NULL REFERENCES public.consumers(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES public.musicians(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  checkin_id UUID REFERENCES public.consumer_checkins(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.consumer_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consumer_checkins
CREATE POLICY "Users can view their own checkins" 
  ON public.consumer_checkins 
  FOR SELECT 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can create their own checkins" 
  ON public.consumer_checkins 
  FOR INSERT 
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Users can update their own checkins" 
  ON public.consumer_checkins 
  FOR UPDATE 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can delete their own checkins" 
  ON public.consumer_checkins 
  FOR DELETE 
  USING (auth.uid() = consumer_id);

-- RLS Policies for consumer_tips
CREATE POLICY "Users can view their own tips" 
  ON public.consumer_tips 
  FOR SELECT 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can create their own tips" 
  ON public.consumer_tips 
  FOR INSERT 
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Users can update their own tips" 
  ON public.consumer_tips 
  FOR UPDATE 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can delete their own tips" 
  ON public.consumer_tips 
  FOR DELETE 
  USING (auth.uid() = consumer_id);

-- RLS Policies for consumer_reviews
CREATE POLICY "Users can view their own reviews" 
  ON public.consumer_reviews 
  FOR SELECT 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can create their own reviews" 
  ON public.consumer_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = consumer_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.consumer_reviews 
  FOR UPDATE 
  USING (auth.uid() = consumer_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.consumer_reviews 
  FOR DELETE 
  USING (auth.uid() = consumer_id);