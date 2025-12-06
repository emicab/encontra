-- Tabla para solicitudes de reclamo de locales
CREATE TABLE public.claim_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  UNIQUE(user_id, venue_id) -- Un usuario solo puede solicitar un local una vez
);

-- Habilitar RLS
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

-- Políticas
-- El usuario puede ver sus propias solicitudes
CREATE POLICY "Users can view own claim requests" 
ON public.claim_requests FOR SELECT 
USING (auth.uid() = user_id);

-- El usuario puede crear solicitudes
CREATE POLICY "Users can create claim requests" 
ON public.claim_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver todas (esto requiere que el admin tenga un rol especial o bypass RLS, 
-- pero por ahora asumimos que el admin usará el dashboard que implementaremos luego)
-- Para simplificar, permitimos lectura pública si es necesario, o mejor, restringimos a admin en el futuro.
-- Por ahora, dejemos que el usuario solo vea las suyas.
