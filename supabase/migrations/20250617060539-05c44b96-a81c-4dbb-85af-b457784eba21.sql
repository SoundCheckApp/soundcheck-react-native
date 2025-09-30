
-- Remove race and sex columns from the musicians table
ALTER TABLE public.musicians DROP COLUMN IF EXISTS race;
ALTER TABLE public.musicians DROP COLUMN IF EXISTS sex;

-- Remove race and sex columns from the consumers table
ALTER TABLE public.consumers DROP COLUMN IF EXISTS race;
ALTER TABLE public.consumers DROP COLUMN IF EXISTS sex;