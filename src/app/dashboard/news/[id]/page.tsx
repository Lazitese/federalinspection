'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconEdit, IconTrash, IconCalendar, IconUser, IconX, IconPhoto } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { newsService } from "@/services/news";
import { NewsArticle } from "@/types";
import Image from "next/image";

export default function ViewNewsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    newsService.getArticle(params.id).then(data => {
      if (data) {
        setArticle(data);
      }
      setLoading(false);
    });
  }, [params.id]);

  const handleDelete = async () => {
    if (article) {
      await newsService.deleteArticle(article.id);
      router.push('/dashboard/news');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
            <span className="text-sm text-text-muted">በመጫን ላይ...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="text-text-muted">ዜና አልተገኘም</div>
          <Link href="/dashboard/news" className="text-brand-blue text-sm font-medium hover:underline">
            ወደ ዜና ይመለሱ
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const allPhotos = article.images && article.images.length > 0 ? article.images : article.image ? [article.image] : [];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ ዜና ይመለሱ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                article.status === 'Published' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-brand-yellow/10 text-brand-yellow'
              }`}>
                {article.status === 'Published' ? 'የታተመ' : 'ረቂቅ'}
              </span>
              <span className="text-xs text-text-muted">{article.lang}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setDeleteModal(true)}
              className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
            >
              <IconTrash size={18} />
              ሰርዝ
            </button>
            <Link 
              href={`/dashboard/news/${params.id}/edit`} 
              className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm"
            >
              <IconEdit size={18} />
              አስተካክል
            </Link>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 backdrop-blur-md overflow-hidden">
          {allPhotos.length > 0 && (
            <div>
              <div className="relative h-64 sm:h-80 w-full">
                <Image
                  src={allPhotos[0]}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                {article.videoUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <div className="w-0 h-0 border-l-[20px] border-l-brand-blue border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                )}
              </div>

              {allPhotos.length > 1 && (
                <div className="px-8 py-4 border-b border-border/20">
                  <div className="flex items-center gap-2 mb-3">
                    <IconPhoto size={16} className="text-text-muted" />
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ፎቶ ጋለሪ ({allPhotos.length})</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhoto(photo)}
                        className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-border/30 hover:border-brand-blue/50 transition-colors"
                      >
                        <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-8 border-b border-border/20">
            <div className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                  <IconUser size={14} className="text-brand-blue" />
                </div>
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                  <IconCalendar size={14} className="text-brand-yellow" />
                </div>
                የተፈጠረ: {article.created}
              </span>
              {article.published !== '-' && (
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <IconCalendar size={14} className="text-success" />
                  </div>
                  የታተመ: {article.published}
                </span>
              )}
            </div>
          </div>

          {article.videoUrl && (
            <div className="p-8 border-b border-border/20">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">ቪዲዮ</h3>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/30">
                <iframe
                  src={article.videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="p-8">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">የዜና ይዘት</h3>
            <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {article.body || article.content || 'ምንም ይዘት የለም።'}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={e => e.stopPropagation()}>
            <Image src={selectedPhoto} alt="Photo" fill className="object-contain" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-primary rounded-2xl border border-border/30 p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">ዜና ሰርዝ</h3>
              <button 
                onClick={() => setDeleteModal(false)}
                className="p-1 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <IconX size={20} className="text-text-muted" />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              &quot;{article.title}&quot; ን መሰረዝ ይፈልጋሉ? ይህ ድርጊት ሊቀለበስ አይችልም።
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal(false)}
                className="flex-1 py-2.5 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50"
              >
                ሰርዝ
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 bg-danger hover:bg-danger/90 text-white rounded-xl text-sm font-medium transition-colors"
              >
                አጽድቅ
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
