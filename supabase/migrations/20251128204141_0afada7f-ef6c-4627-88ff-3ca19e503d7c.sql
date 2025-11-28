-- Create enum for publication types
CREATE TYPE publication_type AS ENUM ('research_article', 'review', 'perspective', 'preprint');

-- Create enum for network types
CREATE TYPE network_type AS ENUM ('testnet', 'mainnet');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE NOT NULL,
  orcid_id TEXT UNIQUE,
  orcid_name TEXT,
  orcid_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create World ID verifications table
CREATE TABLE public.world_id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nullifier_hash TEXT UNIQUE NOT NULL,
  merkle_root TEXT NOT NULL,
  proof TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, nullifier_hash)
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Article metadata
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  publication_type publication_type NOT NULL,
  license TEXT DEFAULT 'CC BY 4.0',
  
  -- IPFS data
  ipfs_hash TEXT NOT NULL,
  ipfs_gateway_url TEXT NOT NULL,
  
  -- Story Protocol data
  network network_type NOT NULL DEFAULT 'testnet',
  ip_asset_id TEXT,
  transaction_hash TEXT,
  spg_contract_address TEXT,
  
  -- DOI (simulated)
  doi TEXT UNIQUE,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  minted_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, minting, minted, failed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create article authors junction table (for multiple authors)
CREATE TABLE public.article_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  orcid_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, orcid_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_id_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_authors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for world_id_verifications
CREATE POLICY "Users can view their own verifications"
  ON public.world_id_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
  ON public.world_id_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for articles
CREATE POLICY "Articles are viewable by everyone"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own articles"
  ON public.articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own articles"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id);

-- RLS Policies for article_authors
CREATE POLICY "Article authors are viewable by everyone"
  ON public.article_authors FOR SELECT
  USING (true);

CREATE POLICY "Article authors can be added by article owner"
  ON public.article_authors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE id = article_id AND author_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_articles_author_id ON public.articles(author_id);
CREATE INDEX idx_articles_network ON public.articles(network);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX idx_article_authors_article_id ON public.article_authors(article_id);
CREATE INDEX idx_world_id_nullifier ON public.world_id_verifications(nullifier_hash);