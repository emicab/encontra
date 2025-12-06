-- Agregar columnas de dueño a la tabla de solicitudes de locales
ALTER TABLE public.venue_requests 
ADD COLUMN IF NOT EXISTS owner_name text,
ADD COLUMN IF NOT EXISTS owner_email text;
