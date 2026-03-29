-- Crennect Portfolio Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  client_name VARCHAR(255),
  project_date DATE,
  challenge_content TEXT NOT NULL,
  strategy_content TEXT NOT NULL,
  closing_content TEXT,
  featured_image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio-Tags junction table
CREATE TABLE IF NOT EXISTS portfolio_tags (
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (portfolio_id, tag_id)
);

-- Portfolio Media table
CREATE TABLE IF NOT EXISTS portfolio_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video', 'embed', 'text')),
  content_url VARCHAR(500),
  content_text TEXT,
  title VARCHAR(255),
  caption TEXT,
  alt_text VARCHAR(255),
  embed_code TEXT,
  sort_order INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_published_at ON portfolios(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_media_portfolio ON portfolio_media(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_media_sort ON portfolio_media(portfolio_id, sort_order);

-- Row Level Security (RLS)
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

-- Public read access for published portfolios
CREATE POLICY "Public can read published portfolios"
  ON portfolios FOR SELECT
  USING (status = 'published');

-- Authenticated users can manage portfolios
CREATE POLICY "Authenticated users can manage portfolios"
  ON portfolios FOR ALL
  USING (auth.role() = 'authenticated');

-- Public read access for tags
CREATE POLICY "Public can read tags"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage tags
CREATE POLICY "Authenticated users can manage tags"
  ON tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Public read access for portfolio_tags
CREATE POLICY "Public can read portfolio_tags"
  ON portfolio_tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage portfolio_tags
CREATE POLICY "Authenticated users can manage portfolio_tags"
  ON portfolio_tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Public read access for portfolio_media
CREATE POLICY "Public can read portfolio_media"
  ON portfolio_media FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage portfolio_media
CREATE POLICY "Authenticated users can manage portfolio_media"
  ON portfolio_media FOR ALL
  USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default tags
INSERT INTO tags (name, slug) VALUES
  ('Brand Strategy', 'brand-strategy'),
  ('Visual Identity', 'visual-identity'),
  ('Digital Marketing', 'digital-marketing'),
  ('Social Media', 'social-media'),
  ('Web Design', 'web-design'),
  ('AI Solutions', 'ai-solutions'),
  ('Content Strategy', 'content-strategy'),
  ('Campaign', 'campaign')
ON CONFLICT (slug) DO NOTHING;
