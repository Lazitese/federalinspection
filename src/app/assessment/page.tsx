'use client';

import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SelfAssessmentView } from '@/components/assessment/SelfAssessmentView';
import { LeadershipEvaluationView } from '@/components/assessment/LeadershipEvaluationView';
import { ApproverDashboardView } from '@/components/assessment/ApproverDashboardView';
import { FinalRevealView } from '@/components/assessment/FinalRevealView';
import { Loader2 } from 'lucide-react';

export default function AssessmentModulePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [period, setPeriod] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [selfAssessment, setSelfAssessment] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<any>(null);
  
  // Evaluator / Approver state
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchState() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        router.push('/assessment/login');
        return;
      }
      setSession(currentSession);

      // 1. Get user's membership (latest active period)
      const { data: memberships, error: memErr } = await supabase
        .from('period_members')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log("Memberships query:", memberships, memErr);

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      const mem = memberships[0];

      // Fetch the period separately to avoid PostgREST RLS join issues
      const { data: periodData, error: periodErr } = await supabase
        .from('assessment_periods')
        .select('*')
        .eq('id', mem.period_id)
        .single();
        
      console.log("Period query:", periodData, periodErr);

      setMembership(mem);
      setPeriod(periodData);
      
      const activePeriod = periodData;

      // State 4: The Reveal (If finalized)
      if (activePeriod.status === 'finalized') {
        const { data: fScore } = await supabase
          .from('final_scores')
          .select('*')
          .eq('period_id', activePeriod.id)
          .eq('user_id', currentSession.user.id)
          .single();
        
        if (fScore) setFinalScore(fScore);
        setLoading(false);
        return;
      }

      // State 1: Self-Assessment (10 pts)
      const { data: sAssessment } = await supabase
        .from('self_assessments')
        .select('*')
        .eq('period_id', activePeriod.id)
        .eq('user_id', currentSession.user.id)
        .single();
      
      setSelfAssessment(sAssessment);

      // If locked, load evaluator/approver data
      if (sAssessment?.is_locked) {
        if (mem.role === 'evaluator' || mem.role === 'approver') {
          // Fetch all members to evaluate
          const { data: membersList } = await supabase
            .from('period_members')
            .select('*, users(full_name)')
            .eq('period_id', activePeriod.id)
            .neq('user_id', currentSession.user.id);

          setAllMembers(membersList || []);

          // Fetch current 20-point evaluations
          const { data: evals } = await supabase
            .from('evaluations')
            .select('*')
            .eq('period_id', activePeriod.id)
            .eq('evaluator_id', currentSession.user.id);

          setEvaluations(evals || []);
        }
      }

      setLoading(false);
    }

    fetchState();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-text-secondary mt-4">የግምገማ ሞጁል በመጫን ላይ... (Loading assessment module...)</p>
      </div>
    );
  }

  if (!membership || !period) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="premium-card max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-heading text-text-primary mb-2">ምንም ንቁ የምዘና ጊዜ የለም (No Active Period)</h2>
          <p className="text-text-secondary text-sm">
            አሁን ላይ ምንም ዓይነት የምዘና ጊዜ ውስጥ አልተመደቡም። እባክዎን ከአስተዳዳሪዎ የ QR መጋበዣ ይጠይቁ።
          </p>
        </div>
      </div>
    );
  }

  if (period.status === 'finalized') {
    return <FinalRevealView score={finalScore?.final_score_100 || 0} />;
  }

  // Everyone must complete their self assessment first
  if (!selfAssessment?.is_locked) {
    return <SelfAssessmentView periodId={period.id} existingData={selfAssessment} />;
  }

  if (membership.role === 'evaluator') {
    return (
      <LeadershipEvaluationView 
        periodId={period.id} 
        members={allMembers} 
        evaluations={evaluations} 
      />
    );
  }

  if (membership.role === 'approver') {
    return (
      <ApproverDashboardView 
        periodId={period.id} 
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="premium-card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-heading text-text-primary mb-2">የራስ ግምገማ ተቆልፏል (Assessment Locked)</h2>
        <p className="text-text-secondary text-sm">
          የራስዎ ግምገማ በተሳካ ሁኔታ ተልኳል። በአሁን ሰዓት የአመራር ግምገማዎች በሂደት ላይ ናቸው። (Your self-assessment is submitted. Leadership evaluations are currently in progress.)
        </p>
      </div>
    </div>
  );
}
