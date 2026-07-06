"use client";

import { useState, useEffect } from "react";
import { FormTableRenderer, FormSchema } from "./FormTableRenderer";
import { IconSend, IconDeviceFloppy, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { saveReportFormAction, submitReportAction } from "@/app/actions/reports";
import formsSchemaData from "@/data/forms-schema.json";
import { ReportPeriod } from "@/lib/et-calendar";

interface FormsRepViewProps {
  userProfile: any;
  initialReport: any;
}

export function FormsRepView({ userProfile, initialReport }: FormsRepViewProps) {
  const [schemas] = useState<FormSchema[]>(formsSchemaData as FormSchema[]);
  const [formData, setFormData] = useState<any>(initialReport?.forms_data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // For testing, hardcoding period. Ideally, calculate from current Ethiopian date.
  const currentYear = 2016; 
  const currentPeriod: ReportPeriod = "Q3";

  const handleFormChange = (formId: string, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [formId]: data
    }));
  };

  const calculateCompletion = () => {
    let completed = 0;
    schemas.forEach(schema => {
      const formAns = formData[schema.id];
      if (formAns && Object.keys(formAns).length > 0) {
        // basic check if at least one field is filled
        completed++;
      }
    });
    return Math.round((completed / schemas.length) * 100);
  };

  const progress = calculateCompletion();
  const isReadOnly = initialReport?.status === 'submitted' || initialReport?.status === 'reviewed';

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const result = await saveReportFormAction(
      userProfile.user_id,
      userProfile.region,
      currentYear,
      currentPeriod,
      formData
    );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("በተሳካ ሁኔታ ተቀምጧል (Draft Saved)");
    }
    setIsSaving(false);
  };

  const handleSubmit = async () => {
    if (!window.confirm("እርግጠኛ ነዎት ይህን ሪፖርት መላክ ይፈልጋሉ? አንዴ ከተላከ ማስተካከል አይቻልም።")) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await submitReportAction(
      userProfile.user_id,
      userProfile.region,
      currentYear,
      currentPeriod,
      formData
    );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("ሪፖርቱ በተሳካ ሁኔታ ተልኳል! (Report Submitted)");
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-border-light shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">የክልል ሪፖርት ማቅረቢያ</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {userProfile.region}
            </span>
            <span className="text-sm text-text-secondary">
              {currentYear} በጀት ዓመት - {currentPeriod === 'Q3' ? 'የዘጠኝ ወራት' : currentPeriod}
            </span>
          </div>
        </div>
        
        {/* Progress Circle or Bar */}
        <div className="flex items-center gap-4 bg-bg-secondary px-4 py-3 rounded-xl border border-border-light w-full md:w-auto">
          <div className="flex-1 md:w-32">
            <div className="flex justify-between text-xs font-medium mb-1.5 text-text-secondary">
              <span>የተሞላው</span>
              <span className={progress === 100 ? "text-status-success" : ""}>{progress}%</span>
            </div>
            <div className="h-2 bg-border-medium rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-status-success' : 'bg-brand-blue'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {isReadOnly && (
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 flex items-start gap-3">
          <IconAlertCircle className="text-brand-blue shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-brand-blue">ይህ ሪፖርት ተልኳል (Submitted)</h3>
            <p className="text-sm text-text-secondary mt-1">የተላከ ሪፖርት ላይ ማስተካከያ ማድረግ አይቻልም። እባክዎ ለበለጠ መረጃ አስተዳዳሪውን ያነጋግሩ።</p>
          </div>
        </div>
      )}

      {initialReport?.admin_feedback && (
        <div className="bg-status-warning/10 border border-status-warning/20 rounded-xl p-4">
          <h3 className="font-semibold text-status-warning text-sm uppercase tracking-wider mb-2">የአስተዳዳሪ ግብረ መልስ (Admin Feedback)</h3>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{initialReport.admin_feedback}</p>
        </div>
      )}

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 rounded-xl p-4 text-status-error text-sm font-medium flex gap-2">
          <IconAlertCircle size={20} className="shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-status-success/10 border border-status-success/20 rounded-xl p-4 text-status-success text-sm font-medium">
          {success}
        </div>
      )}

      {/* Forms List */}
      <div className="space-y-4">
        {schemas.map(schema => {
          const isCompleted = formData[schema.id] && Object.keys(formData[schema.id]).length > 0;
          return (
            <div key={schema.id} className={isReadOnly ? "opacity-90 pointer-events-none" : ""}>
              <FormTableRenderer 
                schema={schema}
                initialData={formData[schema.id] || {}}
                onChange={(data) => handleFormChange(schema.id, data)}
                isCompleted={isCompleted}
              />
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-4 z-10">
          <div className="flex-1" />
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isSubmitting}
            className="px-6 py-3 bg-bg-primary border border-border-medium hover:border-brand-blue hover:text-brand-blue text-text-secondary font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? <IconLoader2 size={20} className="animate-spin" /> : <IconDeviceFloppy size={20} />}
            አስቀምጥ (Save Draft)
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || isSubmitting || progress === 0}
            className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <IconLoader2 size={20} className="animate-spin" /> : <IconSend size={20} />}
            ሪፖርት ላክ (Send Report)
          </button>
        </div>
      )}
    </div>
  );
}
