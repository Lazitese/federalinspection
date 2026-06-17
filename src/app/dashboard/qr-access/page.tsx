'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconCheck, IconX, IconDeviceMobile, IconFileText, IconKey, IconCopy, IconRefresh, IconFolder, IconFiles } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/services/documents";
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from "@/lib/supabaseClient";

type AccessType = 'file' | 'main' | 'sub';

const documents = [
  'የ2017 የስራ ሂደት መመሪያ',
  'የአደረጃጀት መመሪያ ቁጥር 1/2014',
  'የሩብ ዓመት ሪፖርት Q3 2026',
  'የ2016 በጀት ዓመት ዕቅድ',
  'የሱፐርቪዥን ቼክ ሊስት 2026',
];

const accessTypes: { value: AccessType; label: string; icon: typeof IconFolder }[] = [
  { value: 'file', label: 'ሰነድ', icon: IconFileText },
  { value: 'main', label: 'ዋና ምድብ', icon: IconFolder },
  { value: 'sub', label: 'ንኡስ ምድብ', icon: IconFiles },
];

export default function QRAccessPage() {
  const [accessType, setAccessType] = useState<AccessType>('file');
  const [selectedDoc, setSelectedDoc] = useState(documents[0]);
  const [selectedMain, setSelectedMain] = useState(MAIN_CATEGORIES[0].code);
  const [selectedSub, setSelectedSub] = useState(SUB_CATEGORIES[MAIN_CATEGORIES[0].code]?.[0]?.code || '');
  const [generatedCode, setGeneratedCode] = useState('847291');
  
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial pending requests
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('scan_requests')
        .select('*')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false });

      if (data) {
        setPendingRequests(data);
      }
    };

    fetchRequests();

    // Subscribe to new requests
    const subscription = supabase
      .channel('public:scan_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_requests' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.status === 'Pending') {
          setPendingRequests(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status !== 'Pending') {
            setPendingRequests(prev => prev.filter(req => req.id !== payload.new.id));
          } else {
            setPendingRequests(prev => prev.map(req => req.id === payload.new.id ? payload.new : req));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('scan_requests')
      .update({ status: 'Approved', resolved_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  const handleDeny = async (id: string) => {
    const { error } = await supabase
      .from('scan_requests')
      .update({ status: 'Denied', resolved_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    }
  };

  const currentSubs = SUB_CATEGORIES[selectedMain] || [];
  const AccessIcon = accessTypes.find(t => t.value === accessType)?.icon || IconFileText;

  let targetName = '';
  if (accessType === 'file') targetName = selectedDoc;
  if (accessType === 'main') targetName = `${selectedMain} - ${MAIN_CATEGORIES.find(c => c.code === selectedMain)?.name}`;
  if (accessType === 'sub') targetName = `${selectedMain}.${selectedSub} - ${currentSubs.find(s => s.code === selectedSub)?.name}`;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/request-access?targetType=${accessType}&target=${encodeURIComponent(targetName)}`;

  // Use the ID or a short hash for display code if needed, but for now we'll just keep the random 6 digit code
  // as the access PIN for the admin.
  
  const generateNewQR = () => {
    setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString());
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">QR መዳረሻ</h1>
            <p className="text-sm text-text-muted mt-1">QR ኮድ በመጠቀም የሰነድ መዳረሻ ያስተዳድሩ</p>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: QR Generator */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">QR ኮድ ማመንጫ</h2>
            <div className="bg-surface-primary/30 rounded-2xl border border-border/20 p-6 backdrop-blur-md flex flex-col items-center gap-5">
              
              {/* Real QR Visual */}
              <div className="w-48 h-48 rounded-2xl bg-white border border-border/30 flex items-center justify-center p-4 shadow-sm">
                <QRCodeSVG value={qrUrl} size={160} fgColor="#1a1a2e" />
              </div>

              {/* Access Code */}
              <div className="w-full bg-surface-primary/50 border border-border/20 rounded-xl p-4">
                <div className="text-[10px] text-text-muted uppercase tracking-wider text-center mb-2">የመዳረሻ ኮድ / ፒን</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-[0.3em] text-text-primary">{generatedCode}</span>
                  <button className="p-2 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors" title="ቅዳ">
                    <IconCopy size={16} stroke={1.5} />
                  </button>
                </div>
              </div>

              {/* Access Type Tabs */}
              <div className="w-full flex gap-1 bg-surface-secondary/50 rounded-xl p-1">
                {accessTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = accessType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setAccessType(type.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive ? 'bg-surface-primary shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      <Icon size={14} />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Target Select */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">የመዳረሻ ዒላማ</label>

                {accessType === 'file' && (
                  <select
                    value={selectedDoc}
                    onChange={(e) => setSelectedDoc(e.target.value)}
                    className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
                  >
                    {documents.map((doc) => <option key={doc} value={doc}>{doc}</option>)}
                  </select>
                )}

                {accessType === 'main' && (
                  <select
                    value={selectedMain}
                    onChange={(e) => setSelectedMain(e.target.value)}
                    className="w-full bg-surface-primary border border-border/50 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
                  >
                    {MAIN_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>{cat.code} - {cat.name}</option>
                    ))}
                  </select>
                )}

                {accessType === 'sub' && (
                  <div className="flex flex-col gap-2">
                    <select
                      value={selectedMain}
                      onChange={(e) => { setSelectedMain(e.target.value); setSelectedSub(SUB_CATEGORIES[e.target.value]?.[0]?.code || ''); }}
                      className="w-full bg-surface-primary border border-border/50 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
                    >
                      {MAIN_CATEGORIES.map((cat) => (
                        <option key={cat.code} value={cat.code}>{cat.code} - {cat.name}</option>
                      ))}
                    </select>
                    <select
                      value={selectedSub}
                      onChange={(e) => setSelectedSub(e.target.value)}
                      className="w-full bg-surface-primary border border-border/50 rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer"
                    >
                      {currentSubs.map((sub) => (
                        <option key={sub.code} value={sub.code}>{sub.code} - {sub.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Selected Target Summary */}
              <div className="w-full bg-surface-primary/50 border border-border/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <AccessIcon size={16} className="text-brand-blue shrink-0" />
                <span className="text-xs text-text-primary font-medium truncate">
                  {targetName}
                </span>
              </div>

              <button
                onClick={generateNewQR}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                <IconRefresh size={16} />
                QR ኮድ አመንጭ
              </button>
            </div>
          </div>

          {/* Right: Pending Requests */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                የመዳረሻ ጥያቄዎች
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {pendingRequests.map((req) => {
                // Determine icon based on target Type (optional logic here, using generic file for now)
                return (
                  <div key={req.id} className="bg-surface-primary/30 border border-border/20 rounded-2xl backdrop-blur-sm overflow-hidden group hover:bg-surface-primary/50 hover:border-warning/30 transition-all">
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                            <IconDeviceMobile size={20} className="text-warning" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-text-primary truncate">{req.requester_device || 'Unknown Device'}</span>
                              <span className="text-[10px] text-text-muted shrink-0">• {new Date(req.created_at).toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <IconFileText size={11} className="text-text-muted shrink-0" />
                              <span className="text-xs text-brand-blue font-medium truncate">{req.file_name}</span>
                            </div>
                          </div>
                        </div>

                        {req.ip_address && (
                          <div className="hidden lg:flex items-center gap-2 bg-surface-primary/60 border border-border/20 rounded-xl px-4 py-2 shrink-0">
                            <IconKey size={14} className="text-brand-blue" />
                            <span className="font-mono text-xs font-bold text-text-primary tracking-wider">{req.ip_address}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleApprove(req.id)} className="flex items-center gap-1.5 bg-success/10 hover:bg-success/20 text-success px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105">
                            <IconCheck size={14} stroke={3} />
                            ፍቀድ
                          </button>
                          <button onClick={() => handleDeny(req.id)} className="flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105">
                            <IconX size={14} stroke={3} />
                            ከልክል
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pendingRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 border-2 border-dashed border-border/40 rounded-2xl bg-surface-primary/10">
                  <IconFileText size={32} className="text-text-muted/40" />
                  <div className="text-sm text-text-muted font-medium">ምንም አዲስ ጥያቄ የለም</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
