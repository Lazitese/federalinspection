'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { newsService } from "@/services/news";
import { NewsArticle } from "@/types";
import { useRouter } from "next/navigation";

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [lang, setLang] = useState('English');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Draft');
  const [articleType, setArticleType] = useState<'News' | 'Message'>('News');
  const [body, setBody] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    newsService.getArticle(id).then(data => {
      if (data) {
        setArticle(data);
        setTitle(data.title);
        setLang(data.lang);
        setStatus(data.status);
        setArticleType(data.article_type || 'News');
        setBody(data.content || data.body || data.excerpt || '');
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    try {
      await newsService.updateArticle(id, {
        title,
        lang,
        status,
        article_type: articleType,
        content: body, // Map back to content for the backend
      });
      router.push(`/dashboard/news/${id}`);
    } catch (error) {
      console.error('Failed to update article', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center p-10">Loading...</div></DashboardLayout>;
  if (!article) return <DashboardLayout><div className="flex justify-center p-10">Article not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> Back to {articleType === 'Message' ? 'Messages' : 'News'}
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Edit {articleType === 'Message' ? 'Message' : 'News Article'}</h1>
            <p className="text-sm text-text-muted mt-1">Updating {articleType === 'Message' ? 'message' : 'article'} #{id.slice(0,8)}</p>
          </div>
          <div className="flex gap-4">
            <Link href={`/dashboard/news/${id}`} className="flex items-center gap-2 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-border/50">
              Cancel
            </Link>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 disabled:opacity-50 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconDeviceFloppy size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">{articleType === 'Message' ? 'Message Title' : 'Article Title'}</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Language</label>
              <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option value="English">English</option>
                <option value="Amharic">Amharic</option>
                <option value="Afaan Oromo">Afaan Oromo</option>
                <option value="Somali">Somali</option>
                <option value="Tigrinya">Tigrinya</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Type</label>
              <select value={articleType} onChange={e => setArticleType(e.target.value as any)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option value="News">News</option>
                <option value="Message">Message</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">{articleType === 'Message' ? 'Message Body' : 'Article Body'}</label>
            <div className="w-full h-64 bg-surface-primary border border-border/50 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-3">
                <div className="flex items-center gap-1">
                  <button className="px-2 text-sm font-bold text-text-secondary hover:text-text-primary">B</button>
                  <button className="px-2 text-sm italic text-text-secondary hover:text-text-primary">I</button>
                  <button className="px-2 text-sm underline text-text-secondary hover:text-text-primary">U</button>
                </div>
                <div className="w-[1px] h-4 bg-border/50 mx-2"></div>
                <button className="text-xs font-medium text-text-secondary hover:text-text-primary">Add Link</button>
              </div>
              <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-sm text-text-primary leading-relaxed"></textarea>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
