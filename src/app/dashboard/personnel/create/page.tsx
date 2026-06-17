'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconCamera } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personnelSchema } from "@/lib/validations";
import { personnelService } from "@/services/personnel";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import * as z from "zod";
import { COMMISSION_POSITIONS, OFFICE_CATEGORIES, Personnel } from "@/types";

// @BACKEND: Extended validation schema for personnel creation.
// Photo is handled as a base64 data URL on frontend for preview;
// backend should accept file upload (multipart) and return a URL.

const createPersonnelSchema = personnelSchema.extend({
  positionId: z.string().min(1, 'ሹመት ያስፈልጋል።'),
  officeId: z.string().min(1, 'ቢሮ ያስፈልጋል።'),
});

type CreatePersonnelFormValues = z.infer<typeof createPersonnelSchema>;

export default function CreatePersonnelPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePersonnelFormValues>({
    resolver: zodResolver(createPersonnelSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      positionId: '',
      officeId: '',
      department: '',
    },
  });

  // @BACKEND: Replace with real file upload — this just stores a base64 preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: CreatePersonnelFormValues) => {
    try {
      const pos = COMMISSION_POSITIONS.find(p => p.id === formData.positionId);
      const off = OFFICE_CATEGORIES.find(o => o.id === formData.officeId);
      if (!pos || !off) return;

      // @BACKEND: Remove this mapping — backend should handle position/office resolution
      const payload = {
        name: formData.name,
        position: pos.nameEn,
        positionAm: pos.nameAm,
        officeCategory: off.nameEn,
        officeCategoryAm: off.nameAm,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
        photo: photoPreview || '',
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
              <IconArrowLeft size={14} stroke={2} /> ወደ ሰራተኞች ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አዲስ ሰራተኛ</h1>
            <p className="text-sm text-text-muted mt-1">የኮሚሽኑን የሰራተኛ መረጃ ያስገቡ።</p>
          </div>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
            <IconDeviceFloppy size={18} />
            {isSubmitting ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}
          </button>
        </div>

        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          {/* Photo Upload */}
          <div className="flex items-center gap-8">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-28 h-28 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all ${photoPreview ? 'border-border/50' : 'border-dashed border-border/50 bg-surface-secondary group-hover:border-brand-blue/50'}`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <IconCamera size={32} stroke={1.5} className="text-text-muted group-hover:text-brand-blue transition-colors" />
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                  {photoPreview ? 'ቀይር' : 'ስቀል'}
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-text-primary">ፎቶ</h3>
              <p className="text-xs text-text-muted">የሰራተኛውን ፎቶ ያስገቡ። JPG ወይም PNG፣ ከ2MB ያልበለጠ።</p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Personal Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የግል መረጃ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሙሉ ስም</label>
                <input {...register('name')} type="text" placeholder="ለምሳሌ፦ ዶ/ር አበበ በቀለ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ክፍል</label>
                <input {...register('department')} type="text" placeholder="ለምሳሌ፦ ማኔጅመንት" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.department && <span className="text-xs text-danger">{errors.department.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ኢሜይል</label>
                <input {...register('email')} type="email" placeholder="abebe@commission.gov" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ስልክ</label>
                <input {...register('phone')} type="tel" placeholder="+251 911 123 456" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.phone && <span className="text-xs text-danger">{errors.phone.message}</span>}
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Role & Hierarchy */}
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
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ቢሮ</label>
                <select {...register('officeId')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option value="">ቢሮ ይምረጡ...</option>
                  {OFFICE_CATEGORIES.map(off => (
                    <option key={off.id} value={off.id}>{off.nameAm}</option>
                  ))}
                </select>
                {errors.officeId && <span className="text-xs text-danger">{errors.officeId.message}</span>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
