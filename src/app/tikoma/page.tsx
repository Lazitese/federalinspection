import { SubmissionForm } from "@/components/submission-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ጥቆማ | Federal Inspection Commission",
  description: "የጥቆማ ማቅረቢያ ቅጽ",
};

export default function TikomaPage() {
  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <SubmissionForm type="tikoma" />
    </div>
  );
}
