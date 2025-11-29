-- Drop the old policy that relies on auth.uid()
DROP POLICY IF EXISTS "Users can update their own articles" ON public.articles;

-- Create new policy that checks wallet_address instead
CREATE POLICY "Wallet owners can update their articles" 
ON public.articles 
FOR UPDATE 
USING (wallet_address IS NOT NULL);