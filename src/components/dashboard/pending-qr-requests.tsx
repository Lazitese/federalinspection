'use client';

import { useState } from 'react';
import { IconCheck, IconX, IconDeviceMobile } from '@tabler/icons-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export function PendingQRRequests({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const router = useRouter();

  const handleAction = async (id: string, action: 'Approved' | 'Denied') => {
    // Optimistic update
    setRequests(prev => prev.filter(req => req.id !== id));
    
    await supabase
      .from('scan_requests')
      .update({ status: action, resolved_at: new Date().toISOString() })
      .eq('id', id);
      
    router.refresh();
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-6 text-text-muted bg-surface-primary/30 border border-border/20 rounded-2xl backdrop-blur-sm">
        ምንም ጥያቄዎች የሉም
      </div>
    );
  }

  return (
    <>
      {requests.map(req => (
        <div key={req.id} className="bg-surface-primary/30 border border-border/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-surface-primary/50 transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-warning/50"></div>
          <div className="flex items-center justify-between pl-3">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-surface-secondary flex items-center justify-center text-text-muted">
                <IconDeviceMobile size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{req.device}</span>
                  <span className="text-[10px] text-text-muted">• {req.time}</span>
                </div>
                <span className="text-xs text-brand-blue font-medium">{req.file}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => handleAction(req.id, 'Approved')} className="flex items-center gap-1 bg-success/10 hover:bg-success/20 text-success px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                <IconCheck size={12} stroke={3} /> አጽድቅ
              </button>
              <button onClick={() => handleAction(req.id, 'Denied')} className="flex items-center gap-1 bg-danger/10 hover:bg-danger/20 text-danger px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors">
                <IconX size={12} stroke={3} /> አትቀበል
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
