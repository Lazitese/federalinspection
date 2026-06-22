'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function CreatePeriodPage() {
  const router = useRouter();
  const [year, setYear] = useState('2016');
  const [periodHalf, setPeriodHalf] = useState('1st');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const periodName = `${year} ዓ.ም - ${periodHalf === '1st' ? '1ኛ መንፈቀ አመት' : '2ኛ መንፈቀ አመት'}`;

    try {
      const { data, error: insertError } = await supabase
        .from('assessment_periods')
        .insert({ name: periodName, year, period_half: periodHalf })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/dashboard/assessment/teams/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'የምዘና ጊዜ መፍጠር አልተሳካም። (Failed to create period)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container-site section-padding max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard/assessment" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> ወደ ዳሽቦርድ ተመለስ (Back to Dashboard)
          </Link>
          <h1 className="text-3xl font-heading text-text-primary mb-2">አዲስ የምዘና ጊዜ ፍጠር (Create Assessment Period)</h1>
          <p className="text-text-secondary">ለግምገማ እና የውጤት አሰጣጥ አዲስ የምዘና ጊዜ ያዘጋጁ።</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="premium-card p-6 md:p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-text-secondary mb-2">
                  ዓ.ም (Year)
                </label>
                <input
                  id="year"
                  type="text"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted transition-colors"
                  placeholder="2016"
                />
              </div>

              <div>
                <label htmlFor="periodHalf" className="block text-sm font-medium text-text-secondary mb-2">
                  መንፈቀ አመት (Period Half)
                </label>
                <select
                  id="periodHalf"
                  required
                  value={periodHalf}
                  onChange={(e) => setPeriodHalf(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary transition-colors"
                >
                  <option value="1st">1ኛ መንፈቀ አመት (1st Half)</option>
                  <option value="2nd">2ኛ መንፈቀ አመት (2nd Half)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/dashboard/assessment')}
                className="px-6 py-2.5 rounded-xl font-medium text-text-secondary hover:text-text-primary transition-colors mr-3"
              >
                ሰርዝ (Cancel)
              </button>
              <button
                type="submit"
                disabled={loading || !year}
                className="flex items-center justify-center bg-brand-blue text-white px-6 py-2.5 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                ፍጠር (Create Period)
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
