import React from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('am-ET', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const RecentActivity = async () => {
  // Fetch latest documents
  const { data: latestDocs } = await supabaseAdmin
    .from('documents')
    .select('id, title, created_at, uploaded_by')
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch latest news
  const { data: latestNews } = await supabaseAdmin
    .from('news_articles')
    .select('id, title, created, author')
    .order('created', { ascending: false })
    .limit(3);

  // Fetch latest complaints
  const { data: latestComplaints } = await supabaseAdmin
    .from('complaints')
    .select('id, subject, created_at, name')
    .order('created_at', { ascending: false })
    .limit(3);

  // Combine and sort
  const combinedActivities = [
    ...(latestDocs || []).map(doc => ({
      id: `#DOC-${doc.id.substring(0, 4)}`,
      rawDate: new Date(doc.created_at).getTime(),
      date: formatDate(doc.created_at),
      user: doc.uploaded_by || 'ስርዓት',
      type: 'ማስገባ',
      module: 'ሰነዶች',
      target: doc.title,
      message: `${doc.title} ሰነድ ወደ ሲስተሙ ገብቷል።`
    })),
    ...(latestNews || []).map(news => ({
      id: `#NWS-${news.id.substring(0, 4)}`,
      rawDate: new Date(news.created || new Date()).getTime(),
      date: formatDate(news.created || new Date().toISOString()),
      user: news.author || 'አስተዳዳሪ',
      type: 'ህትመት',
      module: 'ዜና',
      target: news.title,
      message: `${news.title} በሚዲያ መድረክ ታትሟል።`
    })),
    ...(latestComplaints || []).map(comp => ({
      id: `#CMP-${comp.id.substring(0, 4)}`,
      rawDate: new Date(comp.created_at).getTime(),
      date: formatDate(comp.created_at),
      user: comp.name || 'ያልታወቀ',
      type: 'ማስገባ',
      module: 'ጥቆማ',
      target: comp.subject,
      message: `አዲስ ጥቆማ: ${comp.subject} ተቀብሏል።`
    }))
  ];

  // Sort by date descending and take top 4
  const activities = combinedActivities
    .sort((a, b) => b.rawDate - a.rawDate)
    .slice(0, 4);

  return (
    <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 overflow-hidden backdrop-blur-md mb-8">
      <div className="p-8 pb-6 flex justify-between items-end">
        <div className="flex flex-col">
          <h2 className="text-xl font-light text-text-primary tracking-tight">የቅርብ ጊዜ እንቅስቃሴ</h2>
        </div>
        <button className="text-xs font-semibold text-text-primary bg-surface-secondary/50 hover:bg-surface-secondary px-5 py-2.5 rounded-full transition-colors border border-border/30">ሁሉንም ይመልከቱ</button>
      </div>
      
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-text-muted/60 text-[10px] uppercase tracking-widest border-b border-border/10">
              <th className="font-semibold py-4 px-4 pl-6">መለያ እና ተጠቃሚ</th>
              <th className="font-semibold py-4 px-4">እርምጃ</th>
              <th className="font-semibold py-4 px-4">ዒላማ</th>
              <th className="font-semibold py-4 px-4 pr-6">ዝርዝር</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {activities.length > 0 ? activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-surface-secondary/20 transition-colors group cursor-default">
                <td className="py-5 px-4 pl-6 align-top w-40">
                  <div className="text-sm font-medium text-text-primary group-hover:text-brand-blue transition-colors">{activity.id}</div>
                  <div className="text-[11px] text-text-muted mt-1">{activity.user}</div>
                </td>
                <td className="py-5 px-4 align-top w-40">
                  <div className="text-[11px] font-bold text-text-primary tracking-wider uppercase">{activity.type}</div>
                  <div className="text-[11px] text-text-muted mt-1">{activity.module}</div>
                </td>
                <td className="py-5 px-4 align-top w-48">
                  <div className="text-sm font-medium text-text-secondary">{activity.target}</div>
                </td>
                <td className="py-5 px-4 pr-6 align-top">
                  <div className="text-sm text-text-muted group-hover:text-text-secondary transition-colors leading-relaxed">
                    {activity.message}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-text-muted">ምንም እንቅስቃሴ የለም</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
