-- Add columns for IPA metadata, NFT metadata, and cover image
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS cover_image_ipfs TEXT,
ADD COLUMN IF NOT EXISTS ipa_metadata_uri TEXT,
ADD COLUMN IF NOT EXISTS ipa_metadata_hash TEXT,
ADD COLUMN IF NOT EXISTS nft_metadata_uri TEXT,
ADD COLUMN IF NOT EXISTS nft_metadata_hash TEXT;