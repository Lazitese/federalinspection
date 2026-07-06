'use client';

import { Trophy, FileText, Download, CheckCircle2, UserCircle2 } from 'lucide-react';
import { SELF_ASSESSMENT_QUESTIONS } from '@/lib/assessment-data';
import React, { useState } from 'react';

export function FinalRevealView({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');
  
  if (!data || !data.details) {
    return <div className="p-8 text-center text-text-muted">No data available</div>;
  }

  const score = data.final_score_100 || 0;
  const percentage = (score / 100) * 100;
  const { self, evals, appr, user, period } = data.details;
  
  const profile = user?.user_profiles?.[0] || {};
  
  const getClassification = (s: number) => {
    if (s > 95) return { label: 'በጣም ከፍተኛ', subLabel: '(Very High)', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };
    if (s >= 85) return { label: 'ከፍተኛ', subLabel: '(High)', color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/30' };
    if (s >= 65) return { label: 'መካከለኛ', subLabel: '(Medium)', color: 'text-brand-yellow', bg: 'bg-brand-yellow/10', border: 'border-brand-yellow/30' };
    if (s >= 50) return { label: 'ዝቅተኛ', subLabel: '(Low)', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    return { label: 'በጣም ዝቅተኛ', subLabel: '(Very Low)', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' };
  };

  const classification = getClassification(score);

  // Safely extract evals
  const ev1 = evals && evals.length > 0 ? evals[0] : null;
  const ev2 = evals && evals.length > 1 ? evals[1] : null;
  const ev3 = evals && evals.length > 2 ? evals[2] : null;

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('am-ET');
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      
      {/* Header Profile Section */}
      <div className="premium-card p-6 border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center overflow-hidden shadow-sm">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={user?.full_name} className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-8 h-8 text-text-muted" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-primary">{user?.full_name}</h1>
            <div className="flex gap-3 text-sm text-text-secondary mt-1">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> {profile.system_role || 'Member'}</span>
              <span>•</span>
              <span>{period?.name}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-brand-blue text-white' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>
            ማጠቃለያ (Summary)
          </button>
          <button onClick={() => setActiveTab('details')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-brand-blue text-white' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>
            ዝርዝር ሪፖርት (Detailed Report)
          </button>
        </div>
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trophy Card */}
          <div className="premium-card md:col-span-1 p-8 text-center relative overflow-hidden shadow-xl border border-border/50 flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 w-full">
              <div className={`w-20 h-20 rounded-2xl ${classification.bg} ${classification.border} border flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                <Trophy className={`w-10 h-10 ${classification.color}`} />
              </div>
              
              <h2 className="text-xl font-heading text-text-secondary uppercase tracking-widest mb-2">የመጨረሻ ውጤት</h2>
              
              <div className="text-6xl font-heading font-bold text-text-primary mb-3 flex items-baseline justify-center">
                {Number(score).toFixed(1)}
                <span className="text-2xl text-text-muted font-normal ml-2">/ 100</span>
              </div>

              <div className={`inline-flex flex-col items-center justify-center px-6 py-3 rounded-xl ${classification.bg} ${classification.border} border mb-6`}>
                <span className={`text-xl font-bold font-heading ${classification.color}`}>{classification.label}</span>
                <span className={`text-sm font-medium ${classification.color} opacity-80 mt-0.5`}>{classification.subLabel}</span>
              </div>

              <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-yellow to-brand-blue h-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">ውጤት ዝርዝር (Score Breakdown)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-secondary border border-border p-5 rounded-2xl">
                <p className="text-sm text-text-secondary font-medium mb-1">የራስ ግምገማ (Self)</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-text-primary">{Number(self?.score_10 || 0).toFixed(1)}</span>
                  <span className="text-sm text-text-muted mb-1">/ 10</span>
                </div>
              </div>
              <div className="bg-surface-secondary border border-border p-5 rounded-2xl">
                <p className="text-sm text-text-secondary font-medium mb-1">አቻ ገምጋሚዎች (Peers - Avg)</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-brand-blue">{Number(evals?.reduce((a:number,c:any)=>a+Number(c.score_20), 0) / (evals?.length || 1) || 0).toFixed(1)}</span>
                  <span className="text-sm text-text-muted mb-1">/ 20</span>
                </div>
                <p className="text-xs text-text-muted mt-2">{evals?.length || 0} ገምጋሚዎች (Evaluators)</p>
              </div>
              <div className="bg-surface-secondary border border-border p-5 rounded-2xl">
                <p className="text-sm text-text-secondary font-medium mb-1">የበላይ ኃላፊ (Approver)</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-brand-yellow">{Number(appr?.score_70 || 0).toFixed(1)}</span>
                  <span className="text-sm text-text-muted mb-1">/ 70</span>
                </div>
                {appr?.approver?.full_name && <p className="text-xs text-text-muted mt-2">በ {appr.approver.full_name}</p>}
              </div>
            </div>

            <div className="premium-card p-6 border border-border mt-2 bg-surface-primary/50">
              <h4 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-blue" />
                የበላይ ኃላፊ አስተያየት (Approver Feedback)
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed italic border-l-4 border-brand-yellow pl-4 py-1">
                {appr?.feedback || "ምንም አስተያየት አልተሰጠም (No feedback provided)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="premium-card overflow-hidden border border-border shadow-md">
          <div className="bg-surface-secondary px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-heading font-semibold text-text-primary">ዝርዝር የአፈጻጸም ግምገማ ቅጽ</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline bg-brand-blue/10 px-3 py-1.5 rounded-lg">
              <Download className="w-4 h-4" /> ፒዲኤፍ አውርድ (Export PDF)
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-primary border-b border-border text-xs uppercase text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-semibold">ተ.ቁ</th>
                  <th className="px-4 py-3 font-semibold min-w-[300px]">የግምገማ መስፈርቶች (Criteria)</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">ክብደት</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">የራስ ግምገማ<br/><span className="text-[10px] font-normal text-text-muted">(Self)</span></th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">ገምጋሚ 1<br/><span className="text-[10px] font-normal text-text-muted truncate block max-w-[80px]">{ev1?.evaluator?.full_name || '-'}</span></th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">ገምጋሚ 2<br/><span className="text-[10px] font-normal text-text-muted truncate block max-w-[80px]">{ev2?.evaluator?.full_name || '-'}</span></th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">ገምጋሚ 3<br/><span className="text-[10px] font-normal text-text-muted truncate block max-w-[80px]">{ev3?.evaluator?.full_name || '-'}</span></th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-center bg-brand-blue/5">በላይ ኃላፊ<br/><span className="text-[10px] font-normal text-text-muted truncate block max-w-[80px]">{appr?.approver?.full_name || '-'}</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {SELF_ASSESSMENT_QUESTIONS.map((category, cIdx) => (
                  <React.Fragment key={category.category_id}>
                    <tr className="bg-surface-secondary/50">
                      <td className="px-4 py-2 font-bold text-brand-blue">{category.category_id}</td>
                      <td colSpan={7} className="px-4 py-2 font-bold text-brand-blue">{category.category_name}</td>
                    </tr>
                    {category.questions.map((q) => {
                      const selfScore = self?.responses?.[q.question_id] || '-';
                      const e1Score = ev1?.responses?.[q.question_id] || '-';
                      const e2Score = ev2?.responses?.[q.question_id] || '-';
                      const e3Score = ev3?.responses?.[q.question_id] || '-';
                      const apprScore = appr?.responses?.[q.question_id] || '-';

                      return (
                        <tr key={q.question_id} className="hover:bg-surface-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-text-muted font-medium">{q.question_id}</td>
                          <td className="px-4 py-3 text-text-primary leading-relaxed">{q.criteria}</td>
                          <td className="px-4 py-3 text-center text-text-secondary font-medium">{q.weight}</td>
                          <td className="px-4 py-3 text-center font-semibold">{selfScore}</td>
                          <td className="px-4 py-3 text-center font-semibold text-text-secondary">{e1Score}</td>
                          <td className="px-4 py-3 text-center font-semibold text-text-secondary">{e2Score}</td>
                          <td className="px-4 py-3 text-center font-semibold text-text-secondary">{e3Score}</td>
                          <td className="px-4 py-3 text-center font-bold text-brand-blue bg-brand-blue/5">{apprScore}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
