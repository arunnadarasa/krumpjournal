-- Normalize all existing wallet addresses to lowercase
UPDATE articles 
SET wallet_address = LOWER(wallet_address) 
WHERE wallet_address IS NOT NULL;