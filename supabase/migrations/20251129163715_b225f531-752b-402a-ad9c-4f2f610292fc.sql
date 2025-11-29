-- Add world_id_verified column to articles table
ALTER TABLE articles ADD COLUMN world_id_verified boolean DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN articles.world_id_verified IS 'Indicates if the article author was verified using World ID at submission time';