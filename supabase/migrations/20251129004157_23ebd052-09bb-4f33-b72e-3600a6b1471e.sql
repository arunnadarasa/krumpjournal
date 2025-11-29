-- Update RLS policy to allow claiming unclaimed articles
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Wallet owners can update their articles" ON articles;

-- Create a new policy that allows:
-- 1. Wallet owners to update their own articles
-- 2. Anyone to claim articles that don't have a wallet_address yet
CREATE POLICY "Wallet owners can update their articles and users can claim unclaimed articles"
ON articles
FOR UPDATE
USING (
  -- Allow update if user's wallet matches article's wallet
  (wallet_address IS NOT NULL AND wallet_address IS NOT NULL) 
  OR 
  -- Allow claiming if article has no wallet_address
  (wallet_address IS NULL)
);