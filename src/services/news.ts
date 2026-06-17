import { supabase } from '@/lib/supabaseClient';
import { NewsArticle } from '../types';

export const newsService = {
  getArticles: async (): Promise<NewsArticle[]> => {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('created', { ascending: false });
      
    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
    return data.map((d: any) => ({
      ...d,
      videoUrl: d.video_url,
      images: d.images || [],
      excerpt: d.excerpt,
      created: d.created ? new Date(d.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      published: d.published ? new Date(d.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
    })) as NewsArticle[];
  },
  
  getArticle: async (id: string): Promise<NewsArticle | undefined> => {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching article:', error);
      return undefined;
    }
    return {
      ...data,
      videoUrl: data.video_url,
      images: data.images || [],
      excerpt: data.excerpt,
      created: data.created ? new Date(data.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      published: data.published ? new Date(data.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
    } as NewsArticle;
  },
  
  createArticle: async (data: Partial<NewsArticle>): Promise<NewsArticle> => {
    // Map from JS object to DB columns
    const dbData = {
      ...data,
      video_url: data.videoUrl,
      images: data.images,
      excerpt: data.excerpt,
    };
    delete (dbData as any).videoUrl;

    const { data: newArticle, error } = await supabase
      .from('news_articles')
      .insert([dbData])
      .select()
      .single();
      
    if (error) throw error;
    return { ...newArticle, videoUrl: newArticle.video_url } as NewsArticle;
  },
  
  updateArticle: async (id: string, data: Partial<NewsArticle>): Promise<void> => {
    const dbData = {
      ...data,
      ...(data.videoUrl !== undefined && { video_url: data.videoUrl }),
    };
    delete (dbData as any).videoUrl;

    const { error } = await supabase
      .from('news_articles')
      .update(dbData)
      .eq('id', id);
      
    if (error) throw error;
  },
  
  deleteArticle: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
