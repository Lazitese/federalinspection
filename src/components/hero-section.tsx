"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText } from "lucide-react";

const LINE_1 = "የፌዴራል ብልፅግና";
const LINE_2 = "የኢንስፔክሽንና የስነ ምግባር ኮሚሽን";
const FULL_TEXT = LINE_1 + "\n" + LINE_2;
const TYPING_SPEED = 80; // ms per character

export function HeroSection() {
  const [charCount, setCharCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Type characters one by one
  useEffect(() => {
    if (charCount < FULL_TEXT.length) {
      const timeout = setTimeout(() => {
        setCharCount((c) => c + 1);
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    }
  }, [charCount]);

  // Blink cursor after typing is done
  useEffect(() => {
    if (charCount >= FULL_TEXT.length) {
      const interval = setInterval(() => {
        setShowCursor((v) => !v);
      }, 530);
      return () => clearInterval(interval);
    }
  }, [charCount]);

  const typed = FULL_TEXT.slice(0, charCount);
  const line1Typed = typed.slice(0, Math.min(charCount, LINE_1.length));
  const line2Typed = charCount > LINE_1.length + 1 ? typed.slice(LINE_1.length + 1) : "";
  const cursorOnLine1 = charCount <= LINE_1.length;
  const isDone = charCount >= FULL_TEXT.length;

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute -right-[10%] -top-[20%] h-[80%] w-[60%] rounded-full opacity-[0.04] blur-[100px]" 
          style={{ backgroundColor: "#014BAA" }} 
        />
        <div 
          className="absolute -bottom-[20%] -left-[10%] h-[60%] w-[50%] rounded-full opacity-[0.06] blur-[100px]" 
          style={{ backgroundColor: "#FFB800" }} 
        />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #014BAA 1px, transparent 1px), linear-gradient(to bottom, #014BAA 1px, transparent 1px)`,
            backgroundSize: '64px 64px' 
          }} 
        />
      </div>

      <div className="container-site relative z-10 flex flex-col items-center px-4 py-32 text-center">
        
        {/* Logo */}
        <div className="mb-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative size-28 overflow-hidden rounded-full bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-slate-900/5 sm:size-32">
            <div className="absolute inset-2">
              <Image
                src="/logo.jpg"
                alt="PP Inspection Commission Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Main Title with Typing Animation — 2 rows */}
        <h1
          id="hero-heading"
          className="font-heading flex flex-col gap-1 sm:gap-2 text-[2.25rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem]"
        >
          <span className="text-slate-900">
            {line1Typed}
            {cursorOnLine1 && (
              <span
                className="ml-0.5 inline-block h-[0.85em] w-[4px] translate-y-[0.05em] rounded-sm"
                style={{ backgroundColor: "#FFB800", opacity: isDone && !showCursor ? 0 : 1 }}
              />
            )}
          </span>
          <span style={{ color: "#014BAA" }}>
            {line2Typed}
            {!cursorOnLine1 && (
              <span
                className="ml-0.5 inline-block h-[0.85em] w-[4px] translate-y-[0.05em] rounded-sm"
                style={{ backgroundColor: "#FFB800", opacity: isDone && !showCursor ? 0 : 1 }}
              />
            )}
          </span>
        </h1>

        {/* Motto */}
        <div
          className="mt-8 mb-12 flex flex-col items-center gap-4 transition-opacity duration-700"
          style={{ opacity: isDone ? 1 : 0.3 }}
        >
          <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: "#FFB800" }} />
          <p className="text-xl font-bold text-slate-700 sm:text-2xl">
            ጠንካራ ኢንስፔክሽን ለጠንካራ ፓርቲ!
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center transition-opacity duration-700"
          style={{ opacity: isDone ? 1 : 0.3 }}
        >
          <Link
            href="/tikoma"
            className="group flex h-14 items-center justify-center gap-3 rounded-2xl px-10 text-base font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-6px_rgba(1,75,170,0.5)]"
            style={{ backgroundColor: "#014BAA" }}
          >
            ጥቆማ
            <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/abetuta"
            className="group flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-10 text-base font-bold shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-md"
            style={{ color: "#014BAA" }}
          >
            <FileText className="size-5 text-slate-400 group-hover:text-[#014BAA] transition-colors" />
            አቤቱታ
          </Link>
        </div>
      </div>
    </section>
  );
}
