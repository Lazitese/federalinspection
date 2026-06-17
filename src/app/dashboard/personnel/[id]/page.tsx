'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconTrash, IconCamera } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personnelSchema } from "@/lib/validations";
import { personnelService } from "@/services/personnel";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import * as z from "zod";
import { Personnel, COMMISSION_POSITIONS, OFFICE_CATEGORIES } from "@/types";

// @BACKEND: Extended validation schema for personnel editing.

const editPersonnelSchema = personnelSchema.extend({
  positionId: z.string().min(1, 'ሹመት ያስፈልጋል።'),
  officeId: z.string().min(1, 'ቢሮ ያስፈልጋል።'),
});

type EditPersonnelFormValues = z.infer<typeof editPersonnelSchema>;

export default function EditPersonnelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [person, setPerson] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EditPersonnelFormValues>({
    resolver: zodResolver(editPersonnelSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      positionId: '',
      officeId: '',
      department: '',
    },
  });

  useEffect(() => {
    personnelService.getPersonnelById(id).then(data => {
      if (data) {
        setPerson(data);
        setPhotoPreview(data.photo || null);
        setValue('name', data.name);
        setValue('email', data.email);
        setValue('phone', data.phone);
        setValue('department', data.department);

        const pos = COMMISSION_POSITIONS.find(p => p.nameAm === data.positionAm || p.nameEn === data.position);
        if (pos) setValue('positionId', pos.id);

        const off = OFFICE_CATEGORIES.find(o => o.nameEn === data.officeCategory || o.nameAm === data.officeCategoryAm);
        if (off) setValue('officeId', off.id);
      }
      setLoading(false);
    });
  }, [id, setValue]);

  // @BACKEND: Replace with real file upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData: EditPersonnelFormValues) => {
    try {
      const pos = COMMISSION_POSITIONS.find(p => p.id === formData.positionId);
      const off = OFFICE_CATEGORIES.find(o => o.id === formData.officeId);
      if (!pos || !off) return;

      await personnelService.updatePersonnel(id, {
        name: formData.name,
        position: pos.nameEn,
        positionAm: pos.nameAm,
        officeCategory: off.nameEn,
        officeCategoryAm: off.nameAm,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
        photo: photoPreview || '',
      });
      router.push('/dashboard/personnel');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (confirm('እርግጠኛ ነዎት ይህን ሰራተኛ ማስወገድ ይፈልጋሉ?')) {
      await personnelService.deletePersonnel(id);
      router.push('/dashboard/personnel');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-48 text-text-muted">በመጫን ላይ...</div>
      </DashboardLayout>
    );
  }

  if (!person) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-text-muted">
          <p className="text-sm">ሰራተኛ አልተገኘም።</p>
          <Link href="/dashboard/personnel" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline">
            ወደ ሰራተኞች ተመለስ
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/personnel" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ ሰራተኞች ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">ሰራተኛ አስተካክል</h1>
            <p className="text-sm text-text-muted mt-1">{person.nameAm || person.name}</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleDelete} className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border border-danger/20">
              <IconTrash size={18} />
              አስወግድ
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
              <IconDeviceFloppy size={18} />
              {isSubmitting ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}
            </button>
          </div>
        </div>

        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          {/* Photo */}
          <div className="flex items-center gap-8">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={`w-28 h-28 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all ${photoPreview ? 'border-border/50' : 'border-dashed border-border/50 bg-surface-secondary'}`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-surface-secondary to-surface-primary flex items-center justify-center font-bold text-text-primary text-3xl">
                    {person.name.charAt(0)}{person.name.split(' ')[1]?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <IconCamera size={24} className="text-brand-blue" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-text-primary">{person.nameAm || person.name}</h3>
              <p className="text-xs text-text-muted">{person.positionAm} • {person.officeCategoryAm}</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-brand-blue hover:underline mt-2 w-fit font-medium">
                ፎቶ ቀይር
              </button>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Personal Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የግል መረጃ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሙሉ ስም</label>
                <input {...register('name')} type="text" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ክፍል</label>
                <input {...register('department')} type="text" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.department && <span className="text-xs text-danger">{errors.department.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ኢሜይል</label>
                <input {...register('email')} type="email" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ስልክ</label>
                <input {...register('phone')} type="tel" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
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
