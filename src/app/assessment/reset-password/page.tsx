'use client';

import { useState } from 'react';
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { resetPasswordAction } from '@/app/actions/auth';
import Link from 'next/link';

export default function AssessmentResetPasswordPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await resetPasswordAction(phone);
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      setSuccess(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="premium-card max-w-md w-full p-8 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-heading font-semibold text-text-primary mb-2">
                የይለፍ ቃል ተቀይሯል!
              </h1>
              <p className="text-sm text-text-secondary mb-6">
                (Password Reset Successful). አዲሱ የይለፍ ቃል በፅሁፍ መልዕክት (SMS) ተልኳል።
              </p>
              <Link 
                href="/assessment/login"
                className="w-full inline-flex items-center justify-center bg-surface-secondary text-text-primary px-4 py-3 rounded-xl font-medium transition-colors hover:bg-border border border-border"
              >
                ወደ መግቢያ ይመለሱ (Back to Login)
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-surface-secondary border border-border rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <KeyRound className="w-8 h-8 text-brand-yellow" />
                </div>
                <h1 className="text-2xl font-heading font-semibold text-text-primary mb-2">
                  የይለፍ ቃል መቀየር
                </h1>
                <p className="text-sm text-text-secondary">
                  (Reset Password)
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">
                    ስልክ ቁጥር ያስገቡ (Enter Phone Number)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-primary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-text-primary placeholder:text-text-muted"
                    placeholder="0911223344"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg text-center">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full flex items-center justify-center bg-brand-yellow text-text-primary px-4 py-3 rounded-xl font-medium transition-colors hover:bg-brand-yellow/90 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'አዲስ የይለፍ ቃል ላክ (Send New Password)'}
                </button>

                <div className="text-center mt-6">
                  <Link href="/assessment/login" className="text-sm text-text-secondary hover:text-text-primary hover:underline transition-colors">
                    ወደ መግቢያ ይመለሱ (Back to Login)
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
