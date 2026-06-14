import { Quote } from "lucide-react";

export function ChairmanMessageSection() {
  return (
    <section
      id="chairman-message"
      className="relative overflow-hidden bg-slate-50 py-24 sm:py-32"
      aria-labelledby="chairman-heading"
    >
      {/* Subtle background accent */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.03]"
        style={{
          background: "radial-gradient(ellipse at top right, #014BAA 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* ── Left: Photo ── */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="relative">
              {/* Yellow accent block behind photo */}
              <div
                className="absolute -bottom-4 -left-4 h-full w-full rounded-3xl"
                style={{ backgroundColor: "#FFB800", opacity: 0.15 }}
                aria-hidden="true"
              />
              {/* Blue accent block behind photo */}
              <div
                className="absolute -top-4 -right-4 h-full w-full rounded-3xl"
                style={{ backgroundColor: "#014BAA", opacity: 0.08 }}
                aria-hidden="true"
              />

              {/* Photo placeholder — replace src with actual leader photo */}
              <div className="relative h-[460px] w-[340px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 shadow-2xl ring-1 ring-slate-200 sm:h-[520px] sm:w-[380px]">
                {/* Placeholder silhouette when no photo is available */}
                <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                  <div className="flex size-28 items-center justify-center rounded-full bg-slate-200">
                    <svg
                      className="size-16 text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-400">የሃላፊ ፎቶ</p>
                </div>

                {/* Name plate overlay at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-6 py-5"
                  style={{ background: "linear-gradient(to top, rgba(1,75,170,0.95) 0%, transparent 100%)" }}
                >
                  <p className="text-lg font-bold text-white">ዋና ኮሚሽነሩ</p>
                  <p className="mt-0.5 text-sm font-medium text-white/70">
                    የፌዴራል ብልፅግና ኢንስፔክሽን ኮሚሽን
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Message ── */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              የሃላፊ መልዕክት
            </p>

            {/* Section heading */}
            <h2
              id="chairman-heading"
              className="font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl xl:text-5xl"
            >
              ለዜጎቻችን{" "}
              <span style={{ color: "#014BAA" }}>የምናቀርበው</span>
              <br />
              <span className="text-slate-400">ቃልኪዳን</span>
            </h2>

            {/* Yellow accent */}
            <div
              className="mt-6 mb-8 h-1.5 w-14 rounded-full"
              style={{ backgroundColor: "#FFB800" }}
              aria-hidden="true"
            />

            {/* Quote icon */}
            <Quote
              className="mb-4 size-8 rotate-180 opacity-20"
              style={{ color: "#014BAA" }}
              aria-hidden="true"
            />

            {/* Message body */}
            <blockquote className="space-y-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              <p>
                የፌዴራሉ ብልፅግና ኢንስፔክሽን ኮሚሽን — ፓርቲያችን ያወጣቸውን ሕጎች፣ ደንቦችና መምሪያዎች
                በሥራ ላይ ስለመዋላቸው ቁጥጥርና ክትትል ያደርጋል።
              </p>
              <p>
                ኮሚሽናችን ሙሳና ብልሹ አሠራርን ለመዋጋት፣ የፓርቲው ሥነ-ምግባርና ዲሲፕሊን ጥቅም ላይ
                ስለመዋሉ የቀጣይ ክትትልና ምርምራ ያካሄዳል።
              </p>
              <p>
                ጠንካራ ኢንስፔክሽን ለጠንካራ ፓርቲ — ይህ ያልተናወጸ ቁርጠኝነታችን ነው።
              </p>
            </blockquote>

            <Quote
              className="mt-4 self-end size-8 opacity-20"
              style={{ color: "#014BAA" }}
              aria-hidden="true"
            />

            {/* Signature line */}
            <div className="mt-10 flex items-center gap-5 border-t border-slate-200 pt-8">
              <div
                className="h-12 w-1 rounded-full"
                style={{ backgroundColor: "#014BAA" }}
                aria-hidden="true"
              />
              <div>
                <p className="text-base font-bold text-slate-900">ዋና ኮሚሽነሩ</p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">
                  የፌዴራሉ ብልፅግና ኢንስፔክሽን ኮሚሽን
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
