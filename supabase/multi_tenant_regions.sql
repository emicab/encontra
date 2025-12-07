-- Create regions table
CREATE TABLE IF NOT EXISTS public.regions (
    code text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add region_code to venues
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS region_code text REFERENCES public.regions(code);

-- Enable RLS on regions (optional, public read)
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regions are viewable by everyone" 
ON public.regions FOR SELECT 
USING (true);

-- Insert default regions
INSERT INTO public.regions (code, name) VALUES
('bue', 'Buenos Aires'),
('caba', 'Ciudad Autónoma de Buenos Aires'),
('cat', 'Catamarca'),
('cha', 'Chaco'),
('chu', 'Chubut'),
('cba', 'Córdoba'),
('cor', 'Corrientes'),
('ers', 'Entre Ríos'),
('for', 'Formosa'),
('juj', 'Jujuy'),
('lpa', 'La Pampa'),
('lar', 'La Rioja'),
('mdz', 'Mendoza'),
('mis', 'Misiones'),
('nqn', 'Neuquén'),
('rng', 'Río Negro'),
('sal', 'Salta'),
('sjn', 'San Juan'),
('sls', 'San Luis'),
('scz', 'Santa Cruz'),
('sfe', 'Santa Fe'),
('sde', 'Santiago del Estero'),
('tdf', 'Tierra del Fuego'),
('tuc', 'Tucumán')
ON CONFLICT (code) DO NOTHING;

-- Update existing venues to have a default region (e.g., 'tdf' or generic) if needed
-- UPDATE public.venues SET region_code = 'tdf' WHERE region_code IS NULL;
