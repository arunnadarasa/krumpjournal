-- Add wallet_address column to articles for reliable ownership tracking
ALTER TABLE articles ADD COLUMN wallet_address text;

-- Backfill existing article with the known wallet address
UPDATE articles 
SET wallet_address = '0x0CacCB6da44D90d923f28Ab7bdf3Ad8DF8B0634F' 
WHERE id = 'c484b860-2650-46b8-8dd6-f758269f659d';