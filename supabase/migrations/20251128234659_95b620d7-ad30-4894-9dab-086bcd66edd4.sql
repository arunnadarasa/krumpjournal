-- Drop the foreign key constraint on articles.author_id
-- This constraint is incompatible with the anonymous auth flow where user IDs change per session
-- RLS policy on articles already ensures data security via auth.uid() = author_id
ALTER TABLE articles DROP CONSTRAINT articles_author_id_fkey;