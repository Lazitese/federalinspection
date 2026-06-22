'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LEADERSHIP_EVALUATION_QUESTIONS_20 } from '@/lib/assessment-data';

export function LeadershipEvaluationView({ periodId, members, evaluations }: { periodId: string, members: any[], evaluations: any[] }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // responses: Record<target_user_id, Record<question_id, rating_1_to_5>>
  const [responses, setResponses] = useState<Record<string, Record<string, number>>>({});

  const handleScoreChange = (userId: string, qId: string, score: number) => {
    setResponses(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [qId]: score
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < members.length - 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentMember = members[currentIndex];
  const isLast = currentIndex === members.length - 1;
  const currentResponses = currentMember ? (responses[currentMember.user_id] || {}) : {};

  // Compute total score for current member
  let currentTotalScore = 0;
  let currentTotalAnswered = 0;
  let totalQuestions = 0;

  LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(category => {
    category.questions.forEach(q => {
      totalQuestions++;
      if (currentResponses[q.question_id] !== undefined) {
        currentTotalAnswered++;
        currentTotalScore += (currentResponses[q.question_id] / 5) * q.weight;
      }
    });
  });

  const displayScore = currentTotalScore.toFixed(2);
  const isCurrentComplete = currentTotalAnswered === totalQuestions;

  // Check if all members are fully evaluated
  const allMembersEvaluated = members.every(m => {
    const memResp = responses[m.user_id] || {};
    return Object.keys(memResp).length === totalQuestions;
  });

  const handleSubmitAll = async () => {
    if (!window.confirm('ሁሉንም ግምገማዎች መላክ እንደሚፈልጉ እርግጠኛ ነዎት? አንዴ ከተላከ በኋላ መቀየር አይቻልም። (Are you sure you want to submit all evaluations?)')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const payload = members.map(m => {
        const memResp = responses[m.user_id] || {};
        let score_20 = 0;
        LEADERSHIP_EVALUATION_QUESTIONS_20.forEach(cat => {
          cat.questions.forEach(q => {
            if (memResp[q.question_id] !== undefined) {
              score_20 += (memResp[q.question_id] / 5) * q.weight;
            }
          });
        });

        return {
          period_id: periodId,
          evaluator_id: session.user.id,
          target_user_id: m.user_id,
          score_20: parseFloat(score_20.toFixed(2)),
          is_locked: true,
        };
      });

      const { error: upsertError } = await supabase
        .from('evaluations')
        .upsert(payload, { onConflict: 'period_id, evaluator_id, target_user_id' });

      if (upsertError) throw upsertError;

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'ግምገማዎችን መላክ አልተሳካም። (Failed to submit evaluations)');
    } finally {
      setLoading(false);
    }
  };

  if (members.length === 0) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
        <div className="premium-card max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-heading text-text-primary mb-2">ምንም አባል የለም (No Members)</h2>
          <p className="text-text-secondary text-sm">በዚህ ቡድን ውስጥ የሚገመገም ሌላ አባል የለም።</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background py-8 px-4 flex flex-col items-center">
      <div className="max-w-4xl w-full flex-grow flex flex-col">
        <div className="mb-8 sticky top-0 bg-background/95 backdrop-blur-md py-4 z-20 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-heading text-text-primary">የአመራር ግምገማ (Leadership Evaluation)</h1>
            <span className="text-sm font-medium text-text-muted">
              {currentIndex + 1} / {members.length}
            </span>
          </div>
          <div className="w-full bg-surface-secondary rounded-full h-2 mb-4">
            <div 
              className="bg-brand-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / members.length) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center bg-surface-primary border border-border p-3 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue text-lg font-heading uppercase mr-4 shrink-0">
              {currentMember.users?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                {currentMember.users?.full_name}
              </h2>
              <p className="text-xs text-text-secondary">{currentMember.title || 'የቡድን አባል (Team Member)'}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-2xl font-heading font-bold text-brand-blue">{displayScore}</span>
              <span className="text-sm text-text-muted ml-1">/ 20</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-8 mb-8">
          {LEADERSHIP_EVALUATION_QUESTIONS_20.map((category) => (
            <div key={category.category_id} className="premium-card overflow-hidden border border-border shadow-sm">
              <div className="bg-surface-secondary px-6 py-4 border-b border-border">
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  {category.category_id}. {category.category_name}
                </h2>
                <p className="text-sm text-text-secondary mt-1">ክብደት (Weight): {category.total_weight}</p>
              </div>
              <div className="divide-y divide-border/50">
                {category.questions.map((q) => (
                  <div key={q.question_id} className="p-6">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <p className="text-sm font-medium text-text-primary leading-relaxed flex-1">
                        <span className="text-text-muted mr-2">{q.question_id}</span>
                        {q.criteria}
                      </p>
                      <span className="text-xs font-medium text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-md shrink-0">
                        ክብደት: {q.weight}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleScoreChange(currentMember.user_id, q.question_id, score)}
                          className={`flex-1 min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                            currentResponses[q.question_id] === score
                              ? 'bg-brand-blue text-white shadow-md'
                              : 'bg-surface-secondary text-text-secondary hover:bg-border border border-border/50'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="premium-card p-4 sticky bottom-4 shadow-xl border-brand-yellow/30 border z-10 flex gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 max-w-[120px] py-3 flex items-center justify-center rounded-xl bg-surface-secondary text-text-primary disabled:opacity-50 hover:bg-border transition-colors border border-border"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            ወደኋላ
          </button>
          
          {isLast ? (
            <button
              onClick={handleSubmitAll}
              disabled={loading || !allMembersEvaluated}
              className="flex-[2] flex items-center justify-center rounded-xl bg-brand-yellow text-text-primary font-medium disabled:opacity-50 hover:bg-brand-yellow/90 transition-colors shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'ሁሉንም ግምገማዎች ላክ (Submit All)'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isCurrentComplete}
              className="flex-[2] flex items-center justify-center rounded-xl bg-brand-blue text-white font-medium hover:bg-brand-blue/90 transition-colors shadow-sm disabled:opacity-50"
            >
              ቀጣይ አባል (Next Member)
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
        {!allMembersEvaluated && isLast && (
          <p className="text-xs text-danger text-center mt-2 mb-8 font-medium bg-danger/10 py-2 rounded-lg">
            ለመላክ የሁሉንም አባላት ግምገማ ማጠናቀቅ አለብዎት። (You must complete evaluating everyone before submitting).
          </p>
        )}
      </div>
    </div>
  );
}
