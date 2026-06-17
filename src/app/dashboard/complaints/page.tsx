'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconBulb, IconAlertTriangle, IconSearch, IconCheck, IconX, IconFileText, IconPaperclip, IconSend, IconUpload, IconMessage, IconUser, IconPhone, IconMail } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { complaintService } from "@/services/complaints";
import { Complaint } from "@/types";

type ViewType = 'Suggestion' | 'Complaint';

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<ViewType>('Suggestion');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resolveModal, setResolveModal] = useState<Complaint | null>(null);
  const [resolveText, setResolveText] = useState('');
  const [resolveFile, setResolveFile] = useState<string | null>(null);

  useEffect(() => {
    complaintService.getComplaints().then(data => {
      setComplaints(data);
      setLoading(false);
    });
  }, []);

  const filtered = complaints.filter(c => {
    if (c.type !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.subject.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  const handleStatus = (id: string, status: string) => {
    complaintService.updateComplaintStatus(id, status);
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: status as Complaint['status'] } : c));
  };

  const handleResolve = () => {
    if (!resolveModal) return;
    complaintService.resolveComplaint(resolveModal.id, { message: resolveText, fileName: resolveFile || undefined });
    setComplaints(prev => prev.map(c => c.id === resolveModal.id ? {
      ...c, status: 'Resolved',
      resolution: { message: resolveText, attachedFile: resolveFile ? { id: `res-${Date.now()}`, filename: resolveFile, fileType: 'PDF', fileSize: '0 B' } : undefined, resolvedAt: 'ዛሬ', resolvedBy: 'አስተዳዳሪ' }
    } : c));
    setResolveModal(null);
    setResolveText('');
    setResolveFile(null);
  };

  const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
    New: { label: 'አዲስ', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    'Under Review': { label: 'በግምገማ ላይ', color: 'text-warning', bg: 'bg-warning/10' },
    Resolved: { label: 'የተፈታ', color: 'text-success', bg: 'bg-success/10' },
    Rejected: { label: 'ውድቅ የተደረገ', color: 'text-danger', bg: 'bg-danger/10' },
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">ጥቆማ እና አቤቱታ</h1>
            <p className="text-sm text-text-muted mt-1">የዜጎችን ጥቆማ እና አቤቱታ ያስተዳድሩ</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-1 w-8 bg-brand-blue rounded-full"></div>
              <div className="h-1 w-4 bg-brand-yellow rounded-full"></div>
            </div>
          </div>
          <div className="relative w-full sm:w-auto">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="ፈልግ..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64 bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-surface-primary/40 backdrop-blur-md p-1.5 rounded-2xl border border-border/20 w-fit">
          <button onClick={() => setActiveTab('Suggestion')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'Suggestion' ? 'bg-brand-blue text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'}`}>
            <IconBulb size={18} />
            ጥቆማ ({complaints.filter(c => c.type === 'Suggestion').length})
          </button>
          <button onClick={() => setActiveTab('Complaint')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'Complaint' ? 'bg-brand-yellow text-[#3D352E] shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'}`}>
            <IconAlertTriangle size={18} />
            አቤቱታ ({complaints.filter(c => c.type === 'Complaint').length})
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-text-muted">ምንም አልተገኘም</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((item) => {
              const status = statusMeta[item.status];
              return (
                <div key={item.id} className="bg-surface-primary/30 border border-border/20 rounded-2xl p-5 backdrop-blur-sm hover:bg-surface-primary/50 hover:border-border/40 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] font-medium text-text-muted">#{item.id}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
                        <span className="text-[10px] text-text-muted">{item.date}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary mt-2">{item.subject}</h3>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><IconUser size={11} />{item.name}</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><IconPhone size={11} />{item.phone}</span>
                        {item.email && <span className="flex items-center gap-1.5 text-[10px] text-text-muted"><IconMail size={11} />{item.email}</span>}
                        {item.attachments.length > 0 && (
                          <span className="flex items-center gap-1.5 text-[10px] text-brand-blue"><IconPaperclip size={11} />{item.attachments.length} ፋይል</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 lg:flex-col">
                      {item.status === 'New' && (
                        <button onClick={() => handleStatus(item.id, 'Under Review')} className="flex items-center gap-1.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105">
                          <IconCheck size={14} stroke={2} />
                          ተቀበል
                        </button>
                      )}
                      {item.status === 'Under Review' && (
                        <>
                          <button onClick={() => setResolveModal(item)} className="flex items-center gap-1.5 bg-success/10 hover:bg-success/20 text-success px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105">
                            <IconCheck size={14} stroke={2} />
                            ፍታ
                          </button>
                          <button onClick={() => handleStatus(item.id, 'Rejected')} className="flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105">
                            <IconX size={14} stroke={2} />
                            ውድቅ አድርግ
                          </button>
                        </>
                      )}
                      {item.resolution && (
                        <button onClick={() => setResolveModal(item)} className="flex items-center gap-1.5 bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary px-4 py-2.5 rounded-xl text-xs font-medium transition-all">
                          <IconMessage size={14} />
                          ምላሽ ተመልከት
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resolution (if resolved/rejected) */}
                  {item.resolution && (
                    <div className="mt-4 pt-4 border-t border-border/20 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                        <IconSend size={14} className="text-brand-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-primary">{item.resolution.resolvedBy}</span>
                          <span className="text-[10px] text-text-muted">{item.resolution.resolvedAt}</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">{item.resolution.message}</p>
                        {item.resolution.attachedFile && (
                          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-surface-primary/50 border border-border/20">
                            <IconFileText size={12} className="text-brand-blue" />
                            <span className="text-[10px] text-text-primary font-medium">{item.resolution.attachedFile.filename}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setResolveModal(null); setResolveText(''); setResolveFile(null); }}>
          <div className="bg-surface-primary rounded-2xl border border-border/30 max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-semibold text-text-primary">ምላሽ ላክ</h3>
              <p className="text-sm text-text-muted mt-1">ለ: {resolveModal.name} — {resolveModal.subject}</p>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">መልእክት</label>
                <textarea
                  value={resolveText}
                  onChange={(e) => setResolveText(e.target.value)}
                  placeholder="ምላሽዎን ያስገቡ..."
                  rows={5}
                  className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">ፋይል አያይዝ (አማራጭ)</label>
                <div className="w-full rounded-2xl border-2 border-dashed border-border/50 bg-surface-primary/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-surface-secondary/50 hover:border-brand-blue/30 transition-all group p-6">
                  {resolveFile ? (
                    <div className="flex items-center gap-2">
                      <IconFileText size={16} className="text-brand-blue" />
                      <span className="text-sm text-text-primary font-medium">{resolveFile}</span>
                      <button onClick={() => setResolveFile(null)} className="p-1 text-text-muted hover:text-danger transition-colors"><IconX size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors">
                        <IconUpload size={18} stroke={1.5} className="text-text-muted group-hover:text-brand-blue transition-colors" />
                      </div>
                      <span className="text-xs text-text-muted font-medium group-hover:text-brand-blue transition-colors">ፋይል ለማያያዝ ጠቅ ያድርጉ</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setResolveModal(null); setResolveText(''); setResolveFile(null); }} className="flex-1 py-3 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50">ሰርዝ</button>
                <button onClick={handleResolve} className="flex-1 py-3 px-4 bg-success hover:bg-success/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2">
                  <IconSend size={16} />
                  ላክ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
