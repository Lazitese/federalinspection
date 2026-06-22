'use client';

import { Trophy } from 'lucide-react';

export function FinalRevealView({ score }: { score: number }) {
  // Score is out of 100
  const percentage = (score / 100) * 100;

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center p-4">
      <div className="premium-card max-w-md w-full p-8 text-center relative overflow-hidden">
        {/* Confetti or decorative background could go here */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-surface-secondary border border-border flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Trophy className="w-12 h-12 text-brand-yellow" />
          </div>
          
          <h2 className="text-xl font-heading text-text-secondary uppercase tracking-widest mb-2">የመጨረሻ ውጤት (Final Score)</h2>
          
          <div className="text-6xl font-heading font-bold text-brand-blue mb-4 flex items-baseline justify-center">
            {Number(score).toFixed(1)}
            <span className="text-2xl text-text-muted font-normal ml-2">/ 100</span>
          </div>

          <div className="w-full bg-border rounded-full h-3 mb-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-yellow to-brand-blue h-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-text-secondary">
            ግምገማዎ በአመራር ቡድኑ ጸድቋል እና ተጠናቋል።
          </p>
        </div>
      </div>
    </div>
  );
}
