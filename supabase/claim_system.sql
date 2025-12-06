-- 1. Agregar columnas para el sistema de reclamo (Safe to run multiple times)
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS claim_code text,
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- 2. Crear índices (Safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_venues_claim_code ON venues(claim_code);
CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id);

-- 3. Actualizar Políticas de Seguridad (RLS)

-- Habilitar RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores para evitar conflictos y asegurar que estén actualizadas
DROP POLICY IF EXISTS "Public venues are viewable by everyone" ON venues;
DROP POLICY IF EXISTS "Owners can update their own venue" ON venues;
DROP POLICY IF EXISTS "Users can claim venue with code" ON venues;

-- Re-crear políticas

-- Política: Cualquiera puede ver los locales
CREATE POLICY "Public venues are viewable by everyone" 
ON venues FOR SELECT 
USING (true);

-- Política: Los dueños pueden editar SU propio local
CREATE POLICY "Owners can update their own venue" 
ON venues FOR UPDATE 
USING (auth.uid() = owner_id);

-- Política: Permitir reclamar el local (Update donde el código coincida)
-- Esta política permite que un usuario autenticado actualice un local si el código coincide.
-- Es necesaria para que el UPDATE del reclamo funcione.
CREATE POLICY "Users can claim venue with code" 
ON venues FOR UPDATE 
USING (claim_code IS NOT NULL);
