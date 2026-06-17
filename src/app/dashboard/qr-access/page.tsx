'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconCheck, IconX, IconDeviceMobile, IconFileText, IconKey, IconCopy, IconRefresh, IconFolder, IconFiles } from "@tabler/icons-react";
import { useState } from "react";
import { MAIN_CATEGORIES, SUB_CATEGORIES } from "@/services/documents";

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

  const pendingRequests = [
    { id: 1, code: '847291', device: 'iPhone 13', target: 'ሰነድ: የ2017 የስራ ሂደት መመሪያ', time: 'ከ10 ደቂቃ በፊት' },
    { id: 2, code: '516304', device: 'Chrome/Windows', target: 'ዋና ምድብ: 200 - የኮሚሽን መመሪያዎች', time: 'ከ1 ሰዓት በፊት' },
    { id: 3, code: '932758', device: 'Samsung S24', target: 'ንኡስ ምድብ: 710 - የአቅም ግንባታ ስልጠና ሰነድ', time: 'ከ3 ሰዓታት በፊት' },
  ];

  const currentSubs = SUB_CATEGORIES[selectedMain] || [];
  const AccessIcon = accessTypes.find(t => t.value === accessType)?.icon || IconFileText;

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
              {/* QR Visual */}
              <div className="w-40 h-40 rounded-2xl bg-white border border-border/30 flex items-center justify-center p-4 shadow-sm">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-[2px]">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`rounded-[2px] ${
                      [0,1,2,5,6,7,8,15,16,23,24,31,32,39,40,47,48,55,56,57,58,61,62,63,
                       14,9,10,17,22,25,30,33,38,41,46,49,54,53,
                       3,4,11,12,13,19,20,21,26,27,28,29,34,35,36,37,42,43,44,45,50,51,52,59,60].includes(i)
                        ? 'bg-[#1a1a2e]' : 'bg-transparent'
                    }`} />
                  ))}
                </div>
              </div>

              {/* Access Code */}
              <div className="w-full bg-surface-primary/50 border border-border/20 rounded-xl p-4">
                <div className="text-[10px] text-text-muted uppercase tracking-wider text-center mb-2">የመዳረሻ ኮድ</div>
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
                  {accessType === 'file' && selectedDoc}
                  {accessType === 'main' && `${selectedMain} - ${MAIN_CATEGORIES.find(c => c.code === selectedMain)?.name}`}
                  {accessType === 'sub' && `${selectedMain}.${selectedSub} - ${currentSubs.find(s => s.code === selectedSub)?.name}`}
                </span>
              </div>

              <button
                onClick={() => setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString())}
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
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-surface-primary/30 border border-border/20 rounded-2xl backdrop-blur-sm overflow-hidden group hover:bg-surface-primary/50 hover:border-warning/30 transition-all">
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                          <IconDeviceMobile size={20} className="text-warning" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary truncate">{req.device}</span>
                            <span className="text-[10px] text-text-muted shrink-0">• {req.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <IconFileText size={11} className="text-text-muted shrink-0" />
                            <span className="text-xs text-brand-blue font-medium truncate">{req.target}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-surface-primary/60 border border-border/20 rounded-xl px-4 py-2 shrink-0">
                        <IconKey size={14} className="text-brand-blue" />
                        <span className="font-mono font-bold text-text-primary tracking-wider">{req.code}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button className="flex items-center gap-1.5 bg-success/10 hover:bg-success/20 text-success px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105">
                          <IconCheck size={14} stroke={3} />
                          ፍቀድ
                        </button>
                        <button className="flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105">
                          <IconX size={14} stroke={3} />
                          ከልክል
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
                <div className="flex items-center justify-center h-32 text-sm text-text-muted">ምንም ጥያቄ የለም</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
