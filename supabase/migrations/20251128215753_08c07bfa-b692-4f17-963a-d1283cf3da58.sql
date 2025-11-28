-- Create article_drafts table for saving work-in-progress
CREATE TABLE public.article_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  title TEXT,
  content JSONB,
  metadata JSONB,
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_drafts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own drafts
CREATE POLICY "Users can manage own drafts"
  ON public.article_drafts
  FOR ALL
  USING (auth.uid() = author_id);

-- Update articles table to store PDF IPFS hash and Zenodo DOI
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS pdf_ipfs_hash TEXT,
  ADD COLUMN IF NOT EXISTS zenodo_doi TEXT;