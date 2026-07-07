'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { IconLoader2, IconKey } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/representative/login');
      } else if (!session.user.user_metadata?.requires_password_change) {
        router.push('/representative/dashboard');
      }
    }
    checkAuth();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('የይለፍ ቃል አይመሳሰልም (Passwords do not match)');
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg('የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Password must be at least 6 characters)');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: { requires_password_change: false }
      });

      if (error) throw error;
      
      // Successfully updated password, navigate to dashboard
      router.push('/representative/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="bg-bg-primary border border-border-light max-w-md w-full p-8 relative overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-bg-secondary border border-border-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <IconKey className="w-8 h-8 text-brand-blue" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
              የይለፍ ቃል ይቀይሩ
            </h1>
            <p className="text-sm text-text-secondary">
              ለደህንነትዎ ሲባል መጀመሪያ ሲገቡ የይለፍ ቃልዎን መቀየር አለብዎት (You must change your password on your first login)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                አዲስ የይለፍ ቃል (New Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-text-primary placeholder:text-text-muted transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                የይለፍ ቃል ያረጋግጡ (Confirm Password)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-secondary border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue text-text-primary placeholder:text-text-muted transition-all"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-status-error/10 border border-status-error/20 text-status-error text-sm font-medium rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full flex items-center justify-center bg-brand-blue text-white px-4 py-3 rounded-xl font-medium transition-colors hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-sm"
            >
              {loading ? <IconLoader2 className="w-5 h-5 animate-spin mr-2" /> : 'ቀይር እና ግባ (Change & Sign In)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
