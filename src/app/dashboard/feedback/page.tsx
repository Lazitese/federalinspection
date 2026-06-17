'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  IconMessageStar,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconStar,
  IconStarFilled,
  IconLoader2
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { getFeedbacks } from "@/app/actions/feedback";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type RatingId = "excellent" | "good" | "bad" | "very-bad";

interface FeedbackItem {
  id: string;
  rating: RatingId;
  review: string;
  sentiment: string;
  created_at: string;
}

const RATING_LABELS: Record<RatingId, string> = {
  excellent: "በጣም ጥሩ",
  good: "ጥሩ",
  bad: "መጥፎ",
  "very-bad": "በጣም መጥፎ",
};

const RATING_COLORS: Record<RatingId, string> = {
  excellent: "text-success bg-success/10",
  good: "text-brand-blue/80 bg-brand-blue/5",
  bad: "text-warning bg-warning/10",
  "very-bad": "text-danger bg-danger/10",
};

const ratingFilters: { id: RatingId | "all"; label: string }[] = [
  { id: "all", label: "ሁሉም" },
  { id: "excellent", label: RATING_LABELS.excellent },
  { id: "good", label: RATING_LABELS.good },
  { id: "bad", label: RATING_LABELS.bad },
  { id: "very-bad", label: RATING_LABELS["very-bad"] },
];

function RatingStars({ rating }: { rating: RatingId }) {
  const positive = rating === "excellent" || rating === "good";
  const count = rating === "excellent" ? 5 : rating === "good" ? 3 : rating === "bad" ? 2 : 1;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < count ? (
          <IconStarFilled key={i} size={12} className={positive ? "text-brand-yellow" : "text-danger/60"} />
        ) : (
          <IconStar key={i} size={12} className="text-text-muted/30" />
        )
      )}
    </div>
  );
}

export default function FeedbackPage() {
  const [activeFilter, setActiveFilter] = useState<RatingId | "all">("all");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getFeedbacks();
        setFeedbacks(data as FeedbackItem[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered =
    activeFilter === "all"
      ? feedbacks
      : feedbacks.filter((f) => f.rating === activeFilter);

  const counts = {
    all: feedbacks.length,
    excellent: feedbacks.filter((f) => f.rating === "excellent").length,
    good: feedbacks.filter((f) => f.rating === "good").length,
    bad: feedbacks.filter((f) => f.rating === "bad").length,
    "very-bad": feedbacks.filter((f) => f.rating === "very-bad").length,
  };

  // Prepare chart data
  const sentimentCounts = feedbacks.reduce(
    (acc, f) => {
      acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 } as Record<string, number>
  );

  const pieData = [
    { name: 'Positive', value: sentimentCounts.positive, color: '#10b981' },
    { name: 'Neutral', value: sentimentCounts.neutral, color: '#3b82f6' },
    { name: 'Negative', value: sentimentCounts.negative, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Excellent', count: counts.excellent },
    { name: 'Good', count: counts.good },
    { name: 'Bad', count: counts.bad },
    { name: 'Very Bad', count: counts["very-bad"] },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አስተያየት መቀበያ</h1>
            <p className="text-sm text-text-muted mt-1">
              ከድረ-ገጹ የሚቀበሉ የአገልግሎት ግምገማዎች እና አስተያየቶች።
            </p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="ግምገማዎችን ይፈልጉ..."
                className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 w-64 transition-colors"
              />
            </div>
            <button className="flex items-center justify-center p-2.5 rounded-full border border-border/30 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
              <IconAdjustmentsHorizontal size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <IconLoader2 className="animate-spin text-brand-blue" size={32} />
          </div>
        ) : (
          <>
            {/* Charts Section */}
            {feedbacks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border border-border/20 rounded-2xl bg-surface-primary/30 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-text-secondary mb-4 w-full text-left">የስሜት ትንተና (Sentiment Analysis)</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-4 mt-2">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 border border-border/20 rounded-2xl bg-surface-primary/30 flex flex-col">
                  <h3 className="text-sm font-semibold text-text-secondary mb-4">የግምገማ ስርጭት (Ratings Distribution)</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="count" fill="#014BAA" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {ratingFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 transition-all ${
                    activeFilter === filter.id
                      ? "border-brand-blue/30 bg-brand-blue/5 shadow-sm"
                      : "border-border/20 bg-surface-primary/30 hover:bg-surface-primary/50"
                  }`}
                >
                  <span className="text-2xl font-light text-text-primary tabular-nums">
                    {counts[filter.id]}
                  </span>
                  <span className="text-[11px] font-semibold text-text-muted leading-tight">{filter.label}</span>
                </button>
              ))}
            </div>

            {/* Feedback list */}
            <div className="flex flex-col gap-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-[2rem] border border-border/20 bg-surface-primary/20">
                  <IconMessageStar size={32} className="text-text-muted" stroke={1.5} />
                  <p className="text-sm text-text-muted">በዚህ ደረጃ ምንም አስተያየት የለም።</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-primary/30 border border-border/20 rounded-2xl p-5 backdrop-blur-sm hover:bg-surface-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold text-text-muted truncate max-w-24">#{item.id.split('-')[0]}</span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${RATING_COLORS[item.rating]}`}
                          >
                            {RATING_LABELS[item.rating]}
                          </span>
                          <RatingStars rating={item.rating} />
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            item.sentiment === 'positive' ? 'bg-success/10 text-success' :
                            item.sentiment === 'negative' ? 'bg-danger/10 text-danger' :
                            'bg-brand-blue/10 text-brand-blue'
                          }`}>
                            {item.sentiment}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-text-primary leading-relaxed">{item.review}</p>
                      </div>
                      <span className="text-[11px] text-text-muted shrink-0 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('am-ET', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
