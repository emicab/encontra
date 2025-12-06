-- Política para que los admins puedan ver TODAS las solicitudes
-- Asumiendo que usamos la tabla 'profiles' para determinar si es admin

CREATE POLICY "Admins can view all claim requests" 
ON public.claim_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Política para que los admins puedan actualizar solicitudes (aprobar/rechazar)
CREATE POLICY "Admins can update claim requests" 
ON public.claim_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);
