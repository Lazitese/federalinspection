"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "purposes",
    label: "ዓላማዎች",
    sublabel: "Party Purposes",
    items: [
      { letter: "ሀ", text: "ጠንካራ፣ ዲሞክራሲያዊ፣ ቅቡልነት ያለው፣ ዘላቂ ሀገረ-መንግሥትና የፖለቲካ ሥርዓት መገንባት" },
      { letter: "ለ", text: "ፈጣንና ፍትሐዊ ተጠቃሚነትን የሚያረጋግጥ ሥር-ነቀል የኢኮኖሚ ሥርዓት መገንባት" },
      { letter: "ሐ", text: "ሁለንተናዊ ብልጽግናን የሚያስገኝ ማኅበራዊ ልማትን ማረጋገጥ" },
      { letter: "መ", text: "ሀገራዊ ክብርንና ጥቅምን ማዕከል ያደረገ የውጭ ግንኙነት ማካሄድ" },
    ],
  },
  {
    id: "principles",
    label: "መርሆዎች",
    sublabel: "Party Principles",
    items: [
      { letter: "ሀ", text: "ሕዝባዊነት" },
      { letter: "ለ", text: "ዲሞክራሲያዊነት" },
      { letter: "ሐ", text: "የሕግ የበላይነት" },
      { letter: "መ", text: "ልማትና ፍትሐዊ ተጠቃሚነት" },
      { letter: "ሠ", text: "ተግባራዊ ዕውቀት" },
      { letter: "ረ", text: "ሀገራዊ አንድነትና ህብረ-ብሔራዊነት" },
    ],
  },
  {
    id: "values",
    label: "ዕሴቶች",
    sublabel: "Party Values",
    items: [
      { letter: "ሀ", text: "የዜጎችና የሕዝቦች ክብር" },
      { letter: "ለ", text: "ነፃነት" },
      { letter: "ሐ", text: "ፍትሕ" },
      { letter: "መ", text: "ኅብረ-ብሔራዊ ወንድማማችነትና እህትማማችነት" },
      { letter: "ሠ", text: "ሀገራዊ መግባባት" },
      { letter: "ረ", text: "ታማኝነትና አገልጋይነት" },
      { letter: "ሰ", text: "ውጤታማነትና ተወዳዳሪነት" },
    ],
  },
] as const;

export function AboutMissionVisionSection() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === activeId)!;

  return (
    <section
      id="about"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-slate-50 py-16"
      aria-labelledby="ppv-heading"
    >
      <div className="container-site flex h-full flex-col gap-10 lg:flex-row lg:items-center lg:gap-20">

        {/* Left: Heading + Tab Switcher */}
        <div className="flex shrink-0 flex-col gap-8 lg:w-[320px] xl:w-[360px]">
          <div>
            <h2
              id="ppv-heading"
              className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl xl:text-5xl"
            >
              የፓርቲው{" "}
              <span style={{ color: "#014BAA" }}>ዓላማዎች፣</span>
              <br />
              <span className="text-slate-400">መርሆዎችና ዕሴቶች</span>
            </h2>
            <div className="mt-5 h-1 w-12 rounded-full" style={{ backgroundColor: "#FFB800" }} />
          </div>

          {/* Vertical Tab Buttons */}
          <div role="tablist" aria-label="Category" className="flex flex-row gap-2 lg:flex-col">
            {TABS.map((tab, i) => {
              const isActive = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveId(tab.id)}
                  className="group flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? "#014BAA" : "white",
                    boxShadow: isActive ? "0 8px 20px rgba(1,75,170,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors"
                    style={{
                      backgroundColor: isActive ? "rgba(255,184,0,0.2)" : "#f1f5f9",
                      color: isActive ? "#FFB800" : "#64748b",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p
                      className="text-base font-semibold leading-tight"
                      style={{ color: isActive ? "white" : "#1e293b" }}
                    >
                      {tab.label}
                    </p>
                    <p
                      className="mt-0.5 text-xs font-medium"
                      style={{ color: isActive ? "rgba(255,255,255,0.6)" : "#94a3b8" }}
                    >
                      {tab.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Items Grid */}
        <div className="flex-1 lg:min-h-[480px]" id={`panel-${activeTab.id}`} role="tabpanel">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
            {activeTab.sublabel} — {activeTab.items.length} items
          </p>
          <ul className="grid gap-3 sm:grid-cols-2" role="list">
            {activeTab.items.map((item, index) => (
              <li key={item.letter}>
                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(1,75,170,0.10)] hover:ring-[#014BAA]/20">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 transition-all duration-200 group-hover:text-white"
                    style={{
                      backgroundColor: "#f8fafc",
                      color: "#1e293b",
                      ringColor: "#e2e8f0",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = "#014BAA";
                      el.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = "#f8fafc";
                      el.style.color = "#1e293b";
                    }}
                  >
                    {item.letter}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-slate-600 transition-colors group-hover:text-slate-800">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
