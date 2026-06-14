"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Send, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionFormProps {
  type: "tikoma" | "abetuta";
}

export function SubmissionForm({ type }: SubmissionFormProps) {
  const isTikoma = type === "tikoma";

  // Labels based on type
  const pageTitle = isTikoma ? "ጥቆማ ማቅረቢያ" : "አቤቱታ ማቅረቢያ";
  const formTitle = isTikoma ? "የጥቆማ ማቅረቢያ ቅጽ" : "የአቤቱታ ማቅረቢያ ቅጽ";
  const submitterNameLabel = isTikoma ? "የጥቆማ አቅራቢው ሙሉ ስም" : "የአቤቱታ አቅራቢው ሙሉ ስም";
  const submissionTypeLabel = isTikoma ? "ጥቆማው የቀረበው" : "አቤቱታው የቀረበው";
  const institutionLabel = isTikoma
    ? "ጥቆማ የቀረበበት ተቋም / የሚመለከተው አካል ስም"
    : "አቤቱታ የቀረበበት ተቋም / የሚመለከተው አካል ስም";
  const mainSubjectLabel = isTikoma ? "የጥቆማው ዋና ጭብጥ" : "የአቤቱታው ዋና ጭብጥ";
  const submitButtonLabel = isTikoma ? "ጥቆማ አስገባ" : "አቤቱታ አስገባ";

  // Form State
  const [submissionType, setSubmissionType] = useState<"በግል" | "በቡድን">("በግል");

  return (
    <div className="container-site mx-auto max-w-4xl py-12 md:py-20">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
          {pageTitle}
        </h1>
        <p className="mt-4 text-base text-slate-600">
          እባክዎትን ይህንን ቅጽ ከመሙላትዎ በፊት{" "}
          <Link
            href="/docs/requirements.pdf"
            className="inline-flex items-center gap-1 font-semibold text-[#014BAA] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="size-4" />
            የአቤቱታ አቀራረብና አፈታት መመሪያ
          </Link>{" "}
          በጥንቃቄ ያንብቡ።
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-10">
        <h2 className="mb-8 border-b border-slate-100 pb-4 text-xl font-bold text-slate-800">
          {formTitle}
        </h2>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Personal Information Group */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              የግል መረጃ
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                  {submitterNameLabel} <span className="text-xs text-slate-400 font-normal">(ፈቃደኛ ከሆነ ብቻ)</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                  placeholder="ሙሉ ስምዎን ያስገቡ"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="age" className="text-sm font-medium text-slate-700">
                    እድሜ
                  </label>
                  <input
                    type="number"
                    id="age"
                    className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                    placeholder="እድሜ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">ጾታ</label>
                  <div className="flex h-[46px] items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="ወንድ"
                        className="text-[#014BAA] focus:ring-[#014BAA]"
                      />
                      <span className="text-sm text-slate-600">ወንድ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="ሴት"
                        className="text-[#014BAA] focus:ring-[#014BAA]"
                      />
                      <span className="text-sm text-slate-600">ሴት</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  ስልክ ቁጥር
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                  placeholder="+251 9..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-slate-700">
                  አድራሻ
                </label>
                <input
                  type="text"
                  id="address"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                  placeholder="የመኖሪያ አድራሻ"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Submission Details Group */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              ዝርዝር መረጃ
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {submissionTypeLabel}
                </label>
                <div className="flex gap-4">
                  <label
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                      submissionType === "በግል"
                        ? "border-[#014BAA] bg-[#014BAA]/5 text-[#014BAA]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="submissionType"
                      value="በግል"
                      className="hidden"
                      checked={submissionType === "በግል"}
                      onChange={(e) => setSubmissionType(e.target.value as any)}
                    />
                    በግል
                  </label>
                  <label
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                      submissionType === "በቡድን"
                        ? "border-[#014BAA] bg-[#014BAA]/5 text-[#014BAA]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="submissionType"
                      value="በቡድን"
                      className="hidden"
                      checked={submissionType === "በቡድን"}
                      onChange={(e) => setSubmissionType(e.target.value as any)}
                    />
                    በቡድን
                  </label>
                </div>
              </div>

              {submissionType === "በቡድን" && (
                <div className="space-y-2">
                  <label htmlFor="memberCount" className="text-sm font-medium text-slate-700">
                    የአባላት ብዛት
                  </label>
                  <input
                    type="number"
                    id="memberCount"
                    required
                    className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                    placeholder="ብዛት ያስገቡ"
                  />
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="institution" className="text-sm font-medium text-slate-700">
                  {institutionLabel}
                </label>
                <input
                  type="text"
                  id="institution"
                  required
                  className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                  placeholder="የተቋሙ ስም"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="mainSubject" className="text-sm font-medium text-slate-700">
                  {mainSubjectLabel}
                </label>
                <textarea
                  id="mainSubject"
                  required
                  rows={4}
                  className="block w-full resize-none rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                  placeholder="ዝርዝር ሁኔታውን ያስገቡ..."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="resolution" className="text-sm font-medium text-slate-700">
                  እንዲደረግለት / እንዲፈጸምለት የሚፈልገው መፍትሄ
                </label>
                <textarea
                  id="resolution"
                  required
                  rows={3}
                  className="block w-full resize-none rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#014BAA] focus:ring-[#014BAA] focus:bg-white transition-colors"
                  placeholder="የሚጠብቁትን መፍትሄ ያስገቡ..."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  ተያያዥ ማስረጃዎች (ካሉ)
                </label>
                <div className="flex w-full items-center justify-center">
                  <label
                    htmlFor="file-upload"
                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#014BAA]/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <UploadCloud className="mb-3 size-8 text-slate-400" />
                      <p className="mb-1 text-sm text-slate-500">
                        <span className="font-semibold text-[#014BAA]">ጫን</span> ወይም ፋይሉን እዚህ ይጎትቱ
                      </p>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG (ከ 10MB ያልበለጠ)</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" multiple />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#014BAA] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#014BAA]/20 transition-all hover:bg-[#014BAA]/90 hover:shadow-xl sm:w-auto sm:px-10"
            >
              <Send className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              {submitButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
