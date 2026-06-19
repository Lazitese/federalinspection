'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personnelSchema } from "@/lib/validations";
import { personnelService } from "@/services/personnel";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { COMMISSION_POSITIONS, OFFICE_CATEGORIES, Personnel } from "@/types";

// @BACKEND: Extended validation schema for personnel creation.
const createPersonnelSchema = personnelSchema.extend({
  positionId: z.string().min(1, 'ሹመት ያስፈልጋል።'),
  officeId: z.string().min(1, 'ምድብ ያስፈልጋል።'),
  fullName: z.string().min(1, 'ሙሉ ስም ያስፈልጋል።'),
  gender: z.string().min(1, 'ፆታ ያስፈልጋል።'),
  age: z.coerce.number().min(18, 'ዕድሜ ያስፈልጋል።'),
  ethnicity: z.string().optional(),
  educationLevel: z.string().optional(),
  educationType: z.string().optional(),
  expProfessional: z.string().optional(),
  expLeadership: z.string().optional(),
  workplace: z.string().optional(),
  membershipYears: z.string().optional(),
  responsibility: z.string().optional(),
  commissionTenure: z.string().optional(),
  phone: z.string().optional(),
});

type CreatePersonnelFormValues = z.infer<typeof createPersonnelSchema>;

export default function CreatePersonnelPage() {
  const router = useRouter();
  // @BACKEND: Photo upload not needed for this form — remove if not required

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePersonnelFormValues>({
    resolver: zodResolver(createPersonnelSchema),
    defaultValues: {
      positionId: '',
      officeId: '',
      fullName: '',
      gender: '',
      age: undefined,
      ethnicity: '',
      educationLevel: '',
      educationType: '',
      expProfessional: '',
      expLeadership: '',
      workplace: '',
      membershipYears: '',
      responsibility: '',
      commissionTenure: '',
      phone: '',
    },
  });

  // @BACKEND: Replace with real API call — payload fields must match backend schema
  const onSubmit = async (formData: CreatePersonnelFormValues) => {
    try {
      const pos = COMMISSION_POSITIONS.find(p => p.id === formData.positionId);
      const off = OFFICE_CATEGORIES.find(o => o.id === formData.officeId);
      if (!pos || !off) return;

      const payload = {
        name: formData.fullName,
        position: pos.nameEn,
        positionAm: pos.nameAm,
        officeCategory: off.nameEn,
        officeCategoryAm: off.nameAm,
        department: formData.educationType || '',
        email: '',
        phone: formData.phone || '',
        photo: '',
        status: 'Active' as const,
      };
      await personnelService.createPersonnel(payload as unknown as Personnel);
      router.push('/dashboard/personnel');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/personnel" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ ዝርዝር ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">የአመራር አካላት</h1>
            <p className="text-sm text-text-muted mt-1">የአመራር አባልን ሙሉ መረጃ ያስገቡ።</p>
          </div>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
            <IconDeviceFloppy size={18} />
            {isSubmitting ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}
          </button>
        </div>

        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          {/* ሹመት እና ምድብ */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሹመት እና ምድብ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሹመት</label>
                <select {...register('positionId')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option value="">ሹመት ይምረጡ...</option>
                  {COMMISSION_POSITIONS.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.nameAm}</option>
                  ))}
                </select>
                {errors.positionId && <span className="text-xs text-danger">{errors.positionId.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ምድብ</label>
                <select {...register('officeId')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option value="">ምድብ ይምረጡ...</option>
                  {OFFICE_CATEGORIES.map(off => (
                    <option key={off.id} value={off.id}>{off.nameAm}</option>
                  ))}
                </select>
                {errors.officeId && <span className="text-xs text-danger">{errors.officeId.message}</span>}
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* የግል መረጃ */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የግል መረጃ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የአባሉ ሙሉ ስም</label>
                <input {...register('fullName')} type="text" placeholder="የአባሉ ሙሉ ስም" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.fullName && <span className="text-xs text-danger">{errors.fullName.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ፆታ</label>
                <select {...register('gender')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option value="">ፆታ ይምረጡ...</option>
                  <option value="male">ወንድ</option>
                  <option value="female">ሴት</option>
                </select>
                {errors.gender && <span className="text-xs text-danger">{errors.gender.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ዕድሜ</label>
                <input {...register('age')} type="number" placeholder="ዕድሜ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.age && <span className="text-xs text-danger">{errors.age.message}</span>}
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ብሔር</label>
                <input {...register('ethnicity')} type="text" placeholder="ብሔር" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* የትምህርት ሁኔታ */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የትምህርት ሁኔታ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ደረጃ</label>
                <input {...register('educationLevel')} type="text" placeholder="ለምሳሌ፦ ዶክትሬት፣ ማስተርስ፣ ዲግሪ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">አይነት</label>
                <input {...register('educationType')} type="text" placeholder="ለምሳሌ፦ ህግ፣ ኢንጂነሪንግ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* የስራ ልምድ */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የስራ ልምድ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">በባለሙያ</label>
                <input {...register('expProfessional')} type="text" placeholder="የባለሙያ ልምድ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">በአመራር</label>
                <input {...register('expLeadership')} type="text" placeholder="የአመራር ልምድ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* የኮሚሽን መረጃ */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የኮሚሽን መረጃ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የስራ ቦታ</label>
                <input {...register('workplace')} type="text" placeholder="የስራ ቦታ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የአባልነት ዘመን</label>
                <input {...register('membershipYears')} type="text" placeholder="ለምሳሌ፦ 2015 ዓ.ም" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">በኮሚሽኑ ያለው ሀላፊነት</label>
                <input {...register('responsibility')} type="text" placeholder="ሀላፊነት" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">በኮሚሽን ያለው ቆይታ</label>
                <input {...register('commissionTenure')} type="text" placeholder="ለምሳሌ፦ 3 ዓመት" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ስልክ ቁጥር</label>
                <input {...register('phone')} type="tel" placeholder="+251 911 123 456" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
