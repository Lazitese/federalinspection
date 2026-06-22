'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeGenerator } from '@/components/assessment/QRCodeGenerator';
import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function PeriodQRPage() {
  const params = useParams();
  const periodId = params.id as string;
  const [joinUrl, setJoinUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate full URL based on current origin
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join?period_id=${periodId}`);
    }
  }, [periodId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!joinUrl) return null;

  return (
    <DashboardLayout>
      <div className="container-site section-padding max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full mb-8">
          <Link href="/dashboard/assessment" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> ወደ ዳሽቦርድ ተመለስ (Back to Dashboard)
          </Link>
          <h1 className="text-3xl font-heading text-text-primary mb-2 text-center">የመመዝገቢያ QR (Signup QR)</h1>
          <p className="text-text-secondary text-center">
            አባላት ይህንን QR ኮድ በሞባይል ስልካቸው ስካን በማድረግ እንዲመዘገቡ ይጠይቁ።
          </p>
        </div>

        <div className="bg-surface-primary p-8 rounded-3xl border border-border shadow-lg flex flex-col items-center w-full">
          <QRCodeGenerator url={joinUrl} size={300} />
          
          <div className="mt-8 w-full">
            <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2 text-center">
              ወይም ቀጥታ ሊንኩን ያጋሩ (Or share the direct link)
            </label>
            <div className="flex items-center bg-surface-secondary border border-border rounded-xl overflow-hidden">
              <input 
                type="text" 
                readOnly 
                value={joinUrl} 
                className="flex-grow bg-transparent px-4 py-3 text-sm text-text-primary focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="px-4 py-3 bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors flex items-center justify-center font-medium min-w-[100px]"
              >
                {copied ? <><Check className="w-4 h-4 mr-1" /> ኮፒ ሆኗል</> : <><Copy className="w-4 h-4 mr-1" /> ኮፒ</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
