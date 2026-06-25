"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Monitor, Link as LinkIcon, FileText, ArrowUpRight, ArrowDownRight, Smartphone, Tablet, Laptop, BarChart3, Calendar, Clock, Loader2, Activity, Users } from "lucide-react";

interface AnalyticsData {
  total_views: number;
  unique_visitors: number;
  bounce_rate: number;
  session_duration: string;
  time_series: { date: string; views: number; unique: number; bounce_rate: number; duration_seconds: number }[];
  top_pages: { path: string; views: number }[];
  entry_pages: { path: string; views: number }[];
  exit_pages: { path: string; views: number }[];
  top_referrers: { referrer: string; views: number }[];
  devices: { device_type: string; views: number }[];
  locations: { country: string; views: number }[];
}

export default function DashboardUI({ initialData, currentRange }: { initialData: AnalyticsData, currentRange: string }) {
  const router = useRouter();
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [pagesTab, setPagesTab] = useState<"Pages" | "Entry" | "Exit">("Pages");
  const [activeMetric, setActiveMetric] = useState<"views" | "unique" | "bounce" | "duration">("views");
  const [liveVisitors, setLiveVisitors] = useState(0);

  useEffect(() => {
    const fetchLiveVisitors = async () => {
      try {
        const res = await fetch('/api/analytics/live');
        const data = await res.json();
        if (data && typeof data.live === 'number') {
          setLiveVisitors(data.live);
        }
      } catch (err) {
        console.error("Failed to fetch live visitors", err);
      }
    };
    
    // Fetch immediately and then poll every 10 seconds
    fetchLiveVisitors();
    const interval = setInterval(fetchLiveVisitors, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRangeChange = (value: string) => {
    router.push(`/dashboard/analytics?range=${value}`);
  };

  const chartData = useMemo(() => {
    if (!initialData.time_series) return [];
    return initialData.time_series.map((item) => {
      const dateObj = new Date(item.date);
      const label = currentRange === "24h" 
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        ...item,
        label
      };
    });
  }, [initialData.time_series, currentRange]);

  const calculateMax = (items: { views: number }[]) => {
    return items.length > 0 ? Math.max(...items.map(i => i.views)) : 1;
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'Desktop') return <Monitor className="w-3.5 h-3.5 mr-2 text-text-muted shrink-0" />;
    if (deviceType === 'Mobile') return <Smartphone className="w-3.5 h-3.5 mr-2 text-text-muted shrink-0" />;
    if (deviceType === 'Tablet') return <Tablet className="w-3.5 h-3.5 mr-2 text-text-muted shrink-0" />;
    return <Laptop className="w-3.5 h-3.5 mr-2 text-text-muted shrink-0" />;
  };

  const ListWidget = ({ title, items, max, labelKey, colorClass, showIconFor }: { title: string, items: any[], max: number, labelKey: string, colorClass: string, showIconFor?: "device" | "country" }) => (
    <div className="premium-card bg-surface-primary/60 border border-border/40 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between bg-surface-secondary/20">
        <h3 className="text-sm font-semibold text-text-primary tracking-wide">{title}</h3>
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto max-h-[320px] p-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-[13px] text-text-muted">ምንም መረጃ የለም (No data)</div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((item, i) => {
              const percentage = Math.max((item.views / max) * 100, 1);
              return (
                <li key={i} className="group relative flex flex-col justify-center px-3 py-2 text-[13px] hover:bg-surface-secondary/40 rounded-xl transition-colors cursor-default">
                  <div className="flex items-center justify-between z-10 relative mb-2">
                    <div className="flex items-center truncate pr-4 text-text-secondary group-hover:text-text-primary transition-colors">
                      {showIconFor === "device" && getDeviceIcon(item[labelKey])}
                      {showIconFor === "country" && <Globe className="w-3.5 h-3.5 mr-2 text-text-muted shrink-0" />}
                      <span className="truncate font-medium">{item[labelKey] || "Unknown"}</span>
                    </div>
                    <span className="text-text-primary font-bold font-mono text-[12px]">{item.views.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-secondary/60 rounded-full overflow-hidden relative z-0">
                    <div 
                      className={`absolute left-0 top-0 bottom-0 rounded-full ${colorClass}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  const PagesWidget = () => {
    const dataMap = {
      Pages: initialData.top_pages || [],
      Entry: initialData.entry_pages || [],
      Exit: initialData.exit_pages || []
    };
    const items = dataMap[pagesTab];
    const max = calculateMax(items);

    return (
      <div className="premium-card bg-surface-primary/60 border border-border/40 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between bg-surface-secondary/20">
          <div className="flex items-center gap-5 text-sm font-semibold">
            <button onClick={() => setPagesTab("Pages")} className={`transition-colors relative pb-1 ${pagesTab === "Pages" ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}>
              ገጾች
              {pagesTab === "Pages" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />}
            </button>
            <button onClick={() => setPagesTab("Entry")} className={`transition-colors relative pb-1 ${pagesTab === "Entry" ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}>
              መግቢያ
              {pagesTab === "Entry" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />}
            </button>
            <button onClick={() => setPagesTab("Exit")} className={`transition-colors relative pb-1 ${pagesTab === "Exit" ? "text-text-primary" : "text-text-muted hover:text-text-secondary"}`}>
              መውጫ
              {pagesTab === "Exit" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />}
            </button>
          </div>
          <button className="text-text-muted hover:text-text-primary transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto max-h-[320px] p-3 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-[13px] text-text-muted">ምንም መረጃ የለም (No data)</div>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {items.map((item, i) => {
                const percentage = Math.max((item.views / max) * 100, 1);
                return (
                  <li key={i} className="group relative flex flex-col justify-center px-3 py-2 text-[13px] hover:bg-surface-secondary/40 rounded-xl transition-colors cursor-default">
                    <div className="flex items-center justify-between z-10 relative mb-2">
                      <div className="flex items-center truncate pr-4 text-text-secondary group-hover:text-text-primary transition-colors">
                        <FileText className="w-3.5 h-3.5 mr-2 text-text-muted shrink-0" />
                        <span className="truncate font-medium">{item.path || "/"}</span>
                      </div>
                      <span className="text-text-primary font-bold font-mono text-[12px]">{item.views.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-secondary/60 rounded-full overflow-hidden relative z-0">
                      <div className="absolute left-0 top-0 bottom-0 rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };

  const getChartConfig = () => {
    switch (activeMetric) {
      case "views": return { key: "views", color: "#3b82f6", bg: "bg-blue-500", name: "የገጽ ዕይታዎች (Views)", format: (v: number) => v.toLocaleString() };
      case "unique": return { key: "unique", color: "#10b981", bg: "bg-emerald-500", name: "ልዩ ጎብኚዎች (Unique)", format: (v: number) => v.toLocaleString() };
      case "bounce": return { key: "bounce_rate", color: "#f43f5e", bg: "bg-rose-500", name: "የመመለስ መጠን (Bounce)", format: (v: number) => `${v}%` };
      case "duration": return { key: "duration_seconds", color: "#8b5cf6", bg: "bg-purple-500", name: "የቆይታ ጊዜ (Duration)", format: (v: number) => `${Math.floor(v / 60)}m ${Math.round(v % 60)}s` };
    }
  };
  const chartConfig = getChartConfig();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto font-sans pb-12 pt-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-light text-text-primary flex items-center gap-3">
            <span className="text-brand-blue drop-shadow-md">📊</span> 
            ትንታኔ <span className="text-lg text-text-muted font-normal">(Analytics)</span>
          </h1>
          <p className="text-text-secondary text-sm">የስርዓት አጠቃቀም መረጃ እና ትንታኔ።</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center p-1 bg-surface-secondary/40 border border-border/30 rounded-[14px] backdrop-blur-sm relative h-10 w-[200px]">
            <div 
              className="absolute top-1 bottom-1 w-[94px] bg-surface-primary rounded-[10px] shadow-sm transition-all duration-300 ease-out border border-border/50" 
              style={{ left: chartType === 'area' ? '4px' : '102px' }}
            />
            <button 
              onClick={() => setChartType("area")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 h-full rounded-[10px] text-xs font-semibold transition-colors ${chartType === 'area' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <Activity className="w-3.5 h-3.5" /> Area
            </button>
            <button 
              onClick={() => setChartType("bar")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 h-full rounded-[10px] text-xs font-semibold transition-colors ${chartType === 'bar' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Bar
            </button>
          </div>

          <Select value={currentRange} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[160px] bg-surface-primary/60 border-border/40 rounded-xl shadow-sm h-10 text-sm font-medium text-text-primary backdrop-blur-sm">
              <Calendar className="w-4 h-4 mr-2 text-text-muted" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 shadow-xl bg-surface-primary">
              <SelectItem value="24h">ዛሬ (Today)</SelectItem>
              <SelectItem value="7d">ባለፉት 7 ቀናት (7d)</SelectItem>
              <SelectItem value="30d">ባለፉት 30 ቀናት (30d)</SelectItem>
              <SelectItem value="90d">ባለፉት 90 ቀናት (90d)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Live Visitors Banner */}
      <div className="premium-card bg-surface-primary/60 border border-border/40 rounded-2xl p-5 flex items-center justify-between backdrop-blur-md relative overflow-hidden group hover:bg-surface-primary/80 transition-colors">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-brand-blue" />
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 bg-brand-blue pointer-events-none" />
        
        <div className="flex items-center gap-5 pl-2 z-10">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
            <Users size={24} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-success rounded-full border-2 border-surface-primary animate-pulse"></span>
          </div>
          <div>
            <h3 className="text-text-primary font-light text-2xl flex items-center gap-3 tracking-tight">
              {liveVisitors}
              <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">በአሁኑ ጊዜ ያሉ ጎብኚዎች (Live)</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">ሰዎች አሁን ስርዓቱን እየተጠቀሙ ነው</p>
          </div>
        </div>
      </div>

      {/* Unified Metrics & Chart Card */}
      <div className="premium-card bg-surface-primary/60 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-sm relative">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-full h-40 bg-brand-blue/5 blur-[50px] pointer-events-none" />
        
        {/* Metrics Header Tabs */}
        <div className="flex flex-wrap items-center border-b border-border/30 bg-surface-secondary/20">
          <div 
            onClick={() => setActiveMetric("unique")}
            className={`flex-1 min-w-[140px] p-6 border-r border-border/30 transition-all cursor-pointer relative overflow-hidden group ${activeMetric === 'unique' ? 'bg-surface-secondary/50' : 'hover:bg-surface-secondary/30'}`}
          >
            {activeMetric === 'unique' && <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
            <div className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-text-secondary transition-colors">
              ልዩ ጎብኚዎች (Unique)
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-light tracking-tight text-text-primary">
                {initialData.unique_visitors.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-success flex items-center bg-success/10 px-2 py-0.5 rounded-full border border-success/20 uppercase">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
              </span>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveMetric("views")}
            className={`flex-1 min-w-[140px] p-6 border-r border-border/30 transition-all cursor-pointer relative overflow-hidden group ${activeMetric === 'views' ? 'bg-surface-secondary/50' : 'hover:bg-surface-secondary/30'}`}
          >
            {activeMetric === 'views' && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
            <div className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-text-secondary transition-colors">
              የገጽ ዕይታዎች (Views)
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-light tracking-tight text-text-primary">
                {initialData.total_views.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-success flex items-center bg-success/10 px-2 py-0.5 rounded-full border border-success/20 uppercase">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> 5%
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveMetric("bounce")}
            className={`flex-1 min-w-[140px] p-6 border-r border-border/30 transition-all cursor-pointer relative overflow-hidden group ${activeMetric === 'bounce' ? 'bg-surface-secondary/50' : 'hover:bg-surface-secondary/30'}`}
          >
            {activeMetric === 'bounce' && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
            <div className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-text-secondary transition-colors">
              የመመለስ መጠን (Bounce)
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-light tracking-tight text-text-primary">
                {initialData.bounce_rate}%
              </span>
              <span className="text-[10px] font-bold text-danger flex items-center bg-danger/10 px-2 py-0.5 rounded-full border border-danger/20 uppercase">
                <ArrowDownRight className="w-3 h-3 mr-0.5" /> 2%
              </span>
            </div>
          </div>

          <div 
            onClick={() => setActiveMetric("duration")}
            className={`flex-1 min-w-[140px] p-6 transition-all cursor-pointer relative overflow-hidden group ${activeMetric === 'duration' ? 'bg-surface-secondary/50' : 'hover:bg-surface-secondary/30'}`}
          >
            {activeMetric === 'duration' && <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
            <div className="text-xs font-semibold text-text-muted mb-3 flex items-center gap-1.5 uppercase tracking-wider group-hover:text-text-secondary transition-colors">
              የቆይታ ጊዜ (Duration) <Clock className="w-3.5 h-3.5 ml-1 opacity-50" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-light tracking-tight text-text-primary">
                {initialData.session_duration || '0m 0s'}
              </span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="p-6">
          <div className="h-[320px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barSize={32}>
                  <XAxis 
                    dataKey="label" 
                    axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} 
                    dy={12} 
                    minTickGap={30}
                  />
                  <YAxis hide={true} domain={['auto', 'auto']} />
                  <Tooltip 
                    cursor={{ fill: 'var(--surface-secondary)', opacity: 0.4 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length && payload[0].payload) {
                        const fullDate = payload[0].payload.date ? new Date(payload[0].payload.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : label;
                        return (
                          <div className="bg-surface-primary/90 backdrop-blur-md border border-border/40 p-4 rounded-xl shadow-xl">
                            <p className="text-xs font-semibold text-text-muted mb-3">{fullDate}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-8">
                                <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                  <div className={`w-2.5 h-2.5 rounded-full ${chartConfig.bg}`} /> {chartConfig.name}
                                </span>
                                <span className="font-mono text-sm font-bold text-text-primary">{chartConfig.format(payload[0].value as number)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey={chartConfig.key} fill={chartConfig.color} fillOpacity={0.8} radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }} 
                    dy={12} 
                    minTickGap={30}
                  />
                  <YAxis hide={true} domain={['auto', 'auto']} />
                  <Tooltip 
                    cursor={{ stroke: 'var(--text-muted)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length && payload[0].payload) {
                        const fullDate = payload[0].payload.date ? new Date(payload[0].payload.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : label;
                        return (
                          <div className="bg-surface-primary/90 backdrop-blur-md border border-border/40 p-4 rounded-xl shadow-xl">
                            <p className="text-xs font-semibold text-text-muted mb-3">{fullDate}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-8">
                                <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                  <div className={`w-2.5 h-2.5 rounded-full ${chartConfig.bg}`} /> {chartConfig.name}
                                </span>
                                <span className="font-mono text-sm font-bold text-text-primary">{chartConfig.format(payload[0].value as number)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={chartConfig.key}
                    stroke={chartConfig.color}
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--surface-primary)', fill: chartConfig.color }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Layout for details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PagesWidget />
        <ListWidget 
          title="አቅጣጫ ጠቋሚዎች (Referrers)" 
          items={initialData.top_referrers || []} 
          max={calculateMax(initialData.top_referrers || [])} 
          labelKey="referrer"
          colorClass="bg-blue-500" 
        />
        <ListWidget 
          title="ሀገራት (Countries)" 
          items={initialData.locations || []} 
          max={calculateMax(initialData.locations || [])} 
          labelKey="country"
          colorClass="bg-rose-500" 
          showIconFor="country"
        />
        <ListWidget 
          title="መሳሪያዎች (Devices)" 
          items={initialData.devices || []} 
          max={calculateMax(initialData.devices || [])} 
          labelKey="device_type"
          colorClass="bg-purple-500" 
          showIconFor="device"
        />
      </div>

    </div>
  );
}
