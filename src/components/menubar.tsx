"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Globe } from "lucide-react";

import { navLinks } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Menubar() {
  const pathname = usePathname() || "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        isScrolled ? "pt-4 px-4" : "pt-6 px-4 sm:px-8"
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-500",
          isScrolled 
            ? "h-16 max-w-5xl rounded-full border border-slate-200/60 bg-white/70 px-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/60"
            : "h-20 max-w-7xl rounded-2xl bg-transparent px-2 sm:px-0"
        )}
      >
        {/* Logo Left */}
        <Link
          href="/"
          onClick={handleNavClick}
          className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
          aria-label="Home"
        >
          <div className="relative size-12 overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="PP Inspection Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="hidden text-base font-bold tracking-tight text-slate-900 sm:block">
            PP Inspection
          </span>
        </Link>

        {/* Desktop: centered nav with elegant pill styles */}
        <nav className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <ul className="flex items-center gap-1 rounded-full border border-transparent bg-slate-50/50 p-1 backdrop-blur-sm transition-all hover:bg-slate-50/80" role="list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "relative z-10 block rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300",
                      isActive
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                  {isActive && (
                    <div className="absolute inset-0 z-0 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-all" />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden gap-2 rounded-full font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:flex">
            <Globe className="size-4" />
            <span className="text-xs tracking-wider">EN ↔ AM</span>
          </Button>
          
          <Link
            href="/dashboard"
            className="hidden items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] md:flex"
          >
            Dashboard
          </Link>

          {/* Mobile: hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-slate-100 md:hidden text-slate-900 hover:bg-slate-200"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)] border-l-0 p-0 sm:max-w-sm">
              <div className="border-b border-slate-100 bg-white px-6 py-8">
                <SheetHeader>
                  <SheetTitle className="text-left text-2xl font-bold tracking-tight text-slate-900">
                    Navigation
                  </SheetTitle>
                </SheetHeader>
              </div>
              <ul className="flex flex-col gap-2 p-6" role="list">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleNavClick}
                        className={cn(
                          "block rounded-2xl px-5 py-4 text-base font-semibold transition-all duration-300",
                          isActive
                            ? "bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-8 border-t border-slate-100 pt-8 flex flex-col gap-4">
                  <Button variant="outline" className="h-14 w-full justify-center rounded-2xl border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                    <Globe className="mr-2 size-5" />
                    English ↔ Amharic
                  </Button>
                  <Link
                    href="/dashboard"
                    onClick={handleNavClick}
                    className="flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-slate-800 hover:shadow-lg"
                  >
                    Go to Dashboard
                  </Link>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
