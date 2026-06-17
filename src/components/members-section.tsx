"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { personnelService } from "@/services/personnel";
import { Personnel, COMMISSION_POSITIONS } from "@/types";

// @BACKEND: This section reads from the personnel service.
// Members are grouped by office tab, then by position row.
// Each position (ዋና ኮሚሽነር, etc.) gets its own horizontal row.

const OFFICE_TABS = [
  { id: 'main', label: 'ኮሚሽን ጽ/ቤት', labelEn: 'Main Office' },
  { id: 'branch', label: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', labelEn: 'Branch Office' },
];

export function MembersSection() {
  const [activeTab, setActiveTab] = useState(OFFICE_TABS[0].id);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personnelService.getPersonnel().then(data => {
      setPersonnel(data);
      setLoading(false);
    });
  }, []);

  const currentOffice = personnel.filter(p =>
    p.officeCategory === (activeTab === 'main' ? 'Main Office' : 'Branch Office')
  );

  const groupedByPosition = COMMISSION_POSITIONS
    .map(pos => ({
      ...pos,
      members: currentOffice.filter(m => m.positionAm === pos.nameAm),
    }))
    .filter(group => group.members.length > 0);

  return (
    <section
      id="members"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-white py-16"
      aria-labelledby="members-heading"
    >
      <div className="container-site relative z-10 flex h-full flex-col gap-10">
        {/* Top Row */}
        <div className="flex flex-col items-start gap-2">
          <div className="max-w-lg">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
              የኮሚሽኑ መዋቅር
            </p>
            <h2
              id="members-heading"
              className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
            >
              <span style={{ color: "#014BAA" }}>የአመራር </span>ሰራተኞች
            </h2>
            <div className="mt-5 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
          </div>
        </div>

        {/* Office Tabs */}
        <div role="tablist" aria-label="የኮሚሽን ቢሮዎች" className="flex items-center gap-2">
          {OFFICE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300"
                style={{
                  backgroundColor: isActive ? "#014BAA" : "white",
                  color: isActive ? "white" : "#64748b",
                  boxShadow: isActive ? "0 4px 16px rgba(1,75,170,0.25)" : "none",
                  border: isActive ? "2px solid #014BAA" : "2px solid #e2e8f0",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Position Rows */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">በመጫን ላይ...</div>
        ) : groupedByPosition.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">ምንም አባላት አልተገኙም።</div>
        ) : (
          <div className="flex flex-col gap-12 pb-8">
            {groupedByPosition.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
                  {group.nameAm}
                </h3>
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2">
                  {group.members.map((member) => (
                    <div key={member.id} className="shrink-0 snap-start w-[240px] sm:w-[260px]">
                      <div className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#014BAA]/20 hover:-translate-y-0.5">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                          {member.photo ? (
                            <Image
                              src={member.photo}
                              alt={member.nameAm || member.name}
                              fill
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 240px, 260px"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
                              <div className="flex size-16 items-center justify-center rounded-full bg-white/60">
                                <span className="text-2xl font-bold text-slate-400">
                                  {member.nameAm?.charAt(0) || member.name.charAt(0)}
                                </span>
                              </div>
                              <span className="mt-2 text-xs text-slate-400">{member.nameAm || member.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{member.nameAm || member.name}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">{member.positionAm}</p>
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            {member.officeCategoryAm}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
