'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconSearch, IconUpload, IconDownload, IconX, IconFile, IconFileText, IconTable, IconCsv, IconFolder, IconChevronLeft, IconCalendar, IconUser, IconBuilding, IconBuildingEstate } from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { documentService, MAIN_CATEGORIES, SUB_CATEGORIES } from "@/services/documents";
import { Document, OFFICES } from "@/types";

const fileTypeMeta: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PDF: { icon: <IconFileText size={18} stroke={1.8} />, color: 'text-danger', bg: 'bg-danger/10' },
  DOCX: { icon: <IconFileText size={18} stroke={1.8} />, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  XLSX: { icon: <IconTable size={18} stroke={1.8} />, color: 'text-success', bg: 'bg-success/10' },
  CSV: { icon: <IconCsv size={18} stroke={1.8} />, color: 'text-success', bg: 'bg-success/10' },
};
const defaultFileIcon = { icon: <IconFile size={18} stroke={1.8} />, color: 'text-text-muted', bg: 'bg-surface-secondary' };

type ViewLevel = 'office' | 'main' | 'sub' | 'docs';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('office');
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  
  // Upload State
  const [uploadOffice, setUploadOffice] = useState<string>('main');
  const [uploadMainCat, setUploadMainCat] = useState('000');
  const [uploadSubCat, setUploadSubCat] = useState('010');
  const [uploadYear, setUploadYear] = useState('2026');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showQRForFile, setShowQRForFile] = useState<string | null>(null);

  const fetchDocuments = () => {
    documentService.getDocuments().then(data => {
      setDocuments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filtered = documents.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || (d.description?.toLowerCase().includes(q) ?? false);
  });

  const officeName = OFFICES.find(o => o.code === selectedOffice)?.name || '';
  const mainCategory = MAIN_CATEGORIES.find(m => m.code === selectedMain);
  const subs = selectedMain ? (SUB_CATEGORIES[selectedMain] || []) : [];
  const subCategory = subs.find(s => s.code === selectedSub);

  const docsInOffice = selectedOffice ? filtered.filter(d => d.office === selectedOffice) : [];
  const docsInMain = docsInOffice.filter(d => d.mainCategory === selectedMain);
  const docsInSub = docsInMain.filter(d => d.subCategory === selectedSub);
  const yearsInSub = [...new Set(docsInSub.map(d => d.year))].sort((a, b) => b.localeCompare(a));

  const totalSubs = (mainCode: string) => (SUB_CATEGORIES[mainCode] || []).length;
  const totalDocsInMain = (mainCode: string) => docsInOffice.filter(d => d.mainCategory === mainCode).length;
  const totalFiles = () => documents.reduce((acc, d) => acc + d.files.length, 0);

  const navigateTo = (level: ViewLevel, office?: string, main?: string, sub?: string) => {
    if (office !== undefined) setSelectedOffice(office);
    if (main !== undefined) setSelectedMain(main);
    if (sub !== undefined) setSelectedSub(sub);
    setViewLevel(level);
  };

  const handleBack = () => {
    if (viewLevel === 'main') { setSelectedOffice(null); setViewLevel('office'); }
    else if (viewLevel === 'sub') { setSelectedMain(null); setViewLevel('main'); }
    else if (viewLevel === 'docs') { setSelectedSub(null); setViewLevel('sub'); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return alert('እባክዎ ፋይል ይምረጡ');
    
    setIsUploading(true);
    try {
      const docData = {
        title: selectedFiles[0].name,
        description: '',
        office: uploadOffice,
        mainCategory: uploadMainCat,
        subCategory: uploadSubCat,
        year: uploadYear,
      };

      for (const file of selectedFiles) {
        await documentService.uploadDocument(docData, file);
      }
      
      setUploadModal(false);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('ፋይል መጫን አልተሳካም።');
    } finally {
      setIsUploading(false);
    }
  };

  const getPageTitle = () => {
    if (viewLevel === 'office') return 'የሰነዶች ማከማቻ';
    if (viewLevel === 'main') return officeName;
    if (viewLevel === 'sub') return `${officeName} › ${mainCategory?.name}`;
    return `${officeName} › ${mainCategory?.name} › ${subCategory?.name}`;
  };

  const getPageDesc = () => {
    if (viewLevel === 'office') return 'ሰነዶችን በቢሮ እና ምድብ ይመልከቱ እና ያስተዳድሩ';
    if (viewLevel === 'main') return `${OFFICES.find(o => o.code === selectedOffice)?.name} - ሁሉም ዋና ምድቦች`;
    if (viewLevel === 'sub') return `${mainCategory?.code} - ${totalSubs(selectedMain!)} ንኡስ ምድቦች`;
    return `${subCategory?.code} - ${docsInSub.length} ሰነዶች`;
  };

  const pageTitle = getPageTitle();
  const pageDesc = getPageDesc();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2">
              {viewLevel !== 'office' && (
                <button onClick={handleBack} className="p-1.5 hover:bg-surface-secondary rounded-xl transition-colors">
                  <IconChevronLeft size={20} className="text-text-muted" />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-light text-text-primary tracking-tight">{pageTitle}</h1>
                <p className="text-sm text-text-muted mt-1">{pageDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-1 w-8 bg-brand-blue rounded-full"></div>
              <div className="h-1 w-4 bg-brand-yellow rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="ሰነድ ፈልግ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64 bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
            </div>
            <button onClick={() => setUploadModal(true)} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
              <IconUpload size={18} />
              ሰነድ ጫን
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center"><IconFileText size={20} className="text-brand-blue" /></div>
              <div><div className="text-2xl font-light text-text-primary">{documents.length}</div><div className="text-xs text-text-muted">ጠቅላላ ሰነዶች</div></div>
            </div>
          </div>
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center"><IconFolder size={20} className="text-brand-yellow" /></div>
              <div><div className="text-2xl font-light text-text-primary">{totalFiles()}</div><div className="text-xs text-text-muted">ጠቅላላ ፋይሎች</div></div>
            </div>
          </div>
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><IconBuilding size={20} className="text-success" /></div>
              <div><div className="text-2xl font-light text-text-primary">{OFFICES.length}</div><div className="text-xs text-text-muted">ቢሮዎች</div></div>
            </div>
          </div>
          <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><IconTable size={20} className="text-purple-500" /></div>
              <div><div className="text-2xl font-light text-text-primary">{Object.values(SUB_CATEGORIES).reduce((acc, subs) => acc + subs.length, 0)}</div><div className="text-xs text-text-muted">ንኡስ ምድቦች</div></div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
              <span className="text-sm text-text-muted">በመጫን ላይ...</span>
            </div>
          </div>
        )}

        {/* Level 1: Offices */}
        {!loading && viewLevel === 'office' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
            {OFFICES.map((office) => {
              const docCount = documents.filter(d => d.office === office.code).length;
              const officeIcon = office.code === 'main' ? IconBuilding : IconBuildingEstate;
              const Icon = officeIcon;
              const mainCount = [...new Set(documents.filter(d => d.office === office.code).map(d => d.mainCategory))].length;
              return (
                <button key={office.code} onClick={() => navigateTo('main', office.code)} className="group bg-surface-primary/30 rounded-3xl border border-border/20 backdrop-blur-md p-8 hover:border-brand-blue/30 hover:shadow-md transition-all duration-200 text-left relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex flex-col items-center text-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-blue/15 to-brand-yellow/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={36} stroke={1.5} className="text-brand-blue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary group-hover:text-brand-blue transition-colors">{office.name}</h2>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="text-sm text-text-muted">{docCount} ሰነዶች</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-sm text-text-muted">{mainCount} ምድቦች</span>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted group-hover:text-brand-blue/60 transition-colors flex items-center gap-1">
                      ይመልከቱ <IconChevronLeft size={14} className="rotate-180" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Level 2: Main Categories */}
        {!loading && viewLevel === 'main' && selectedOffice && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {MAIN_CATEGORIES.map((cat) => {
              const docCount = totalDocsInMain(cat.code);
              const subCount = totalSubs(cat.code);
              return (
                <button key={cat.code} onClick={() => navigateTo('sub', selectedOffice, cat.code)} className="group bg-surface-primary/30 rounded-2xl border border-border/20 backdrop-blur-md p-6 hover:border-brand-blue/30 hover:shadow-sm transition-all duration-200 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-yellow/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="text-2xl font-bold bg-gradient-to-br from-brand-blue to-brand-yellow bg-clip-text text-transparent">{cat.code}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-blue transition-colors leading-snug">{cat.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-text-muted">{docCount} ሰነዶች</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-xs text-text-muted">{subCount} ንኡስ</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Level 3: Sub Categories */}
        {!loading && viewLevel === 'sub' && selectedMain && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subs.map((sub) => {
              const docCount = docsInOffice.filter(d => d.mainCategory === selectedMain && d.subCategory === sub.code).length;
              return (
                <button key={sub.code} onClick={() => navigateTo('docs', selectedOffice, selectedMain, sub.code)} className="group bg-surface-primary/30 rounded-2xl border border-border/20 backdrop-blur-md p-5 hover:border-brand-blue/30 hover:shadow-sm transition-all duration-200 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-yellow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="text-sm font-bold text-text-secondary">{sub.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-blue transition-colors truncate">{sub.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted">{docCount} ሰነዶች</span>
                        {docCount > 0 && <><span className="w-1 h-1 rounded-full bg-border" /><IconChevronLeft size={12} className="text-text-muted rotate-180" /></>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Level 4: Documents */}
        {!loading && viewLevel === 'docs' && selectedMain && selectedSub && (
          <div className="flex flex-col gap-6">
            {yearsInSub.length === 0 && (
              <div className="flex items-center justify-center h-48">
                <div className="text-center"><IconFile size={32} className="text-text-muted/40 mx-auto mb-2" stroke={1} /><div className="text-text-muted text-sm">ምንም ሰነድ አልተገኘም</div></div>
              </div>
            )}
            {yearsInSub.map(year => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center"><IconCalendar size={20} className="text-brand-blue" /></div>
                  <h2 className="text-lg font-semibold text-text-primary">{year}</h2>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {docsInSub.filter(d => d.year === year).map((doc) => (
                    <div key={doc.id} className="group bg-surface-primary/30 rounded-2xl border border-border/20 backdrop-blur-md p-5 hover:border-brand-blue/30 hover:shadow-sm transition-all duration-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0 mt-0.5"><IconFileText size={20} className="text-text-secondary" stroke={1.5} /></div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-blue transition-colors truncate">{doc.title}</h3>
                              {doc.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{doc.description}</p>}
                              <div className="flex items-center gap-2 mt-2">
                                <IconUser size={12} className="text-text-muted" />
                                <span className="text-[10px] text-text-muted">{doc.uploadedBy}</span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="text-[10px] text-text-muted">{doc.uploadDate}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setPreviewDoc(doc)} className="p-2 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0" title="ዝርዝር ይመልከቱ"><IconFileText size={18} stroke={1.5} /></button>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-border/20">
                          {doc.files.map((file) => {
                            const meta = fileTypeMeta[file.fileType] || defaultFileIcon;
                            return (
                              <div key={file.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-primary/50 hover:bg-surface-secondary/50 transition-colors group/file">
                                <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}><span className={meta.color}>{meta.icon}</span></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-text-primary truncate">{file.name}</div>
                                  <div className="text-[10px] text-text-muted">{file.fileType} • {file.fileSize}</div>
                                </div>
                                <button className="p-1.5 text-text-muted hover:text-success hover:bg-success/10 rounded-lg transition-all opacity-0 group-hover/file:opacity-100"><IconDownload size={16} stroke={1.5} /></button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setUploadModal(false)}>
          <div className="bg-surface-primary rounded-2xl border border-border/30 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">አዲስ ሰነድ ጫን</h3>
                <p className="text-sm text-text-muted mt-1">የሰነድ መረጃ ይሙሉ እና ፋይሎችን ይምረጡ።</p>
              </div>
              <button onClick={() => setUploadModal(false)} className="p-2 hover:bg-surface-secondary rounded-xl transition-colors"><IconX size={20} className="text-text-muted" /></button>
            </div>
            <div className="px-8 pb-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">ቢሮ</label>
                <select value={uploadOffice} onChange={(e) => setUploadOffice(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  {OFFICES.map(o => <option key={o.code} value={o.code}>{o.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">ዋና ምድብ</label>
                <select value={uploadMainCat} onChange={(e) => { setUploadMainCat(e.target.value); setUploadSubCat((SUB_CATEGORIES[e.target.value] || [])[0]?.code || ''); }} className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  {MAIN_CATEGORIES.map(cat => <option key={cat.code} value={cat.code}>{cat.code} - {cat.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">ንኡስ ምድብ</label>
                <select value={uploadSubCat} onChange={(e) => setUploadSubCat(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  {(SUB_CATEGORIES[uploadMainCat] || []).map(sub => <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">ዓመት</label>
                <select value={uploadYear} onChange={(e) => setUploadYear(e.target.value)} className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  {['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">ፋይሎች (በርካታ መምረጥ ይቻላል)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-border/50 bg-surface-primary/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-secondary/50 hover:border-brand-blue/30 transition-all group p-8"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors"><IconUpload size={22} stroke={1.5} className="text-text-muted group-hover:text-brand-blue transition-colors" /></div>
                  <span className="text-sm text-text-muted font-medium group-hover:text-brand-blue transition-colors">ፋይሎችን ለመምረጥ ጠቅ ያድርጉ</span>
                  <span className="text-[10px] text-text-muted">PDF, DOCX, XLSX, CSV እስከ 20MB በአንድ ፋይል</span>
                </div>
                <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="text-xs text-brand-blue flex items-center gap-2">
                        <IconFileText size={14} />
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setUploadModal(false)} className="flex-1 py-3 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50">ሰርዝ</button>
                <button onClick={handleUpload} disabled={isUploading} className="flex-1 py-3 px-4 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  <IconUpload size={16} className="inline mr-1.5" />
                  {isUploading ? 'በመጫን ላይ...' : 'ጫን'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-surface-primary rounded-2xl border border-border/30 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between px-8 pt-8 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-brand-blue/10 text-brand-blue">{previewDoc.mainCategory}.{previewDoc.subCategory}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-brand-yellow/10 text-brand-yellow">{OFFICES.find(o => o.code === previewDoc.office)?.name}</span>
                  <span className="text-[10px] text-text-muted">{previewDoc.year}</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{previewDoc.title}</h3>
                {previewDoc.description && <p className="text-sm text-text-muted mt-1">{previewDoc.description}</p>}
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-surface-secondary rounded-xl transition-colors shrink-0"><IconX size={20} className="text-text-muted" /></button>
            </div>
            <div className="px-8 pb-8 flex flex-col gap-5">
              <div className="p-5 bg-surface-primary/50 rounded-2xl border border-border/20">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'ቢሮ', value: OFFICES.find(o => o.code === previewDoc.office)?.name || '' },
                    { label: 'ዋና ምድብ', value: `${previewDoc.mainCategory} - ${MAIN_CATEGORIES.find(m => m.code === previewDoc.mainCategory)?.name || ''}` },
                    { label: 'ንኡስ ምድብ', value: `${previewDoc.subCategory} - ${SUB_CATEGORIES[previewDoc.mainCategory]?.find(s => s.code === previewDoc.subCategory)?.name || ''}` },
                    { label: 'ዓመት', value: previewDoc.year },
                    { label: 'ያወጣው', value: previewDoc.uploadedBy },
                    { label: 'የተለቀቀበት ቀን', value: previewDoc.uploadDate },
                    { label: 'የፋይሎች ብዛት', value: `${previewDoc.files.length} ፋይሎች` },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-medium text-text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">የተያያዙ ፋይሎች</h4>
                <div className="flex flex-col gap-2">
                  {previewDoc.files.map((file) => {
                    const meta = fileTypeMeta[file.fileType] || defaultFileIcon;
                    return (
                      <div key={file.id} className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-primary/50 border border-border/20 hover:border-brand-blue/30 transition-all">
                          <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}><span className={meta.color}>{meta.icon}</span></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{file.name}</div>
                            <div className="text-xs text-text-muted">{file.fileType} • {file.fileSize}</div>
                          </div>
                          <button 
                            onClick={() => setShowQRForFile(showQRForFile === file.name ? null : file.name)}
                            className="flex items-center gap-2 px-3 py-2 bg-surface-secondary hover:bg-border/50 text-text-primary rounded-xl text-xs font-semibold transition-colors shrink-0"
                          >
                            QR ኮድ
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"><IconDownload size={14} />አውርድ</button>
                        </div>
                        {showQRForFile === file.name && (
                          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-border/30">
                            <QRCodeSVG 
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/request-access?targetType=file&target=${encodeURIComponent(file.name)}`} 
                              size={160} 
                              fgColor="#1a1a2e" 
                            />
                            <span className="text-[10px] text-text-muted mt-2">መዳረሻ ለመጠየቅ ይህንን ኮድ ይቃኙ</span>
                          </div>
                        )}
                      </div>
                    );
                })}
              </div>
            </div>
            <button onClick={() => { setPreviewDoc(null); setShowQRForFile(null); }} className="w-full py-3 px-4 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary rounded-xl text-sm font-medium transition-colors border border-border/50">ዝጋ</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
