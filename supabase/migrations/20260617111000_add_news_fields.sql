-- Add missing fields to news_articles to match frontend NewsItem format
ALTER TABLE public.news_articles ADD COLUMN description TEXT;
ALTER TABLE public.news_articles ADD COLUMN image TEXT;
