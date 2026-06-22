'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// Force webpack rebuild to pick up the .tsx extension
import { AdminProvider, useAdmin } from '@/lib/hooks/useAdmin';
import { supabase } from '@/lib/supabaseClient';

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecking, setAuthChecking] = useState(true);

  const lastActivityRef = useRef<number>(Date.now());
  const inactivityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading || authChecking || !profile) return;

    // Update last activity timestamp on any user action
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity, { passive: true }));

    // Check every 10 seconds if 5 minutes have passed since last activity
    inactivityIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= 300000) { // 5 minutes
        clearInterval(inactivityIntervalRef.current!);
        supabase.auth.signOut().then(() => {
          router.push('/auth/login?reason=inactivity');
        });
      }
    }, 10000);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      if (inactivityIntervalRef.current) {
        clearInterval(inactivityIntervalRef.current);
      }
    };
  }, [loading, authChecking, profile, router]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setAuthChecking(false);
      }
    });
  }, [router]);

  if (loading || authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="animate-pulse text-slate-500">Loading Admin Portal...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="text-center p-8 bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">You do not have an active admin profile associated with this account.</p>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-sm border border-red-100"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Check module access based on pathname
  if (profile.access_level === 'specific' && profile.role !== 'super_admin' && pathname !== '/dashboard') {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2 && segments[0] === 'dashboard') {
      const moduleName = segments[1];
      // special cases if moduleName doesn't exactly match id
      // Since all our IDs match the routes (news, documents, complaints, feedback, personnel, qr-access, statistics, assessment, admins, settings)
      if (moduleName && !profile.modules?.includes(moduleName)) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
            <div className="text-center p-8 bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/50 max-w-md">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-500 mb-2">Restricted Area</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Your administrator profile does not have permission to access the <strong>{moduleName}</strong> module. If you believe this is an error, please contact a super admin.</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl transition-colors font-semibold text-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </AdminProvider>
  );
}
