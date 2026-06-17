'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconShieldCheck, IconShieldHalf, IconShield } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminSchema } from "@/lib/validations";
import { provisionAdmin } from "@/app/actions/admin-provisioning";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { PERMISSION_GROUPS, ALL_MODULES, Admin } from "@/types";

type AdminFormValues = z.infer<typeof adminSchema>;

const ACCESS_OPTIONS = [
  {
    value: 'all' as const,
    label: 'ሙሉ መዳረሻ',
    desc: 'ሁሉንም ሞጁሎች እና ቅንብሮች ማስተዳደር ይችላል።',
    icon: IconShieldCheck,
    color: 'text-success',
    border: 'border-success/30',
    bg: 'bg-success/5',
  },
  {
    value: 'specific' as const,
    label: 'የተወሰነ መዳረሻ',
    desc: 'እያንዳንዱን ሞጁል በተናጠል ይምረጡ።',
    icon: IconShield,
    color: 'text-warning',
    border: 'border-warning/30',
    bg: 'bg-warning/5',
  },
];

export default function CreateAdminPage() {
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      accessLevel: 'specific',
      groups: [],
      modules: [],
      status: 'Active',
    },
  });

  const accessLevel = watch('accessLevel');
  const selectedGroups = watch('groups') || [];
  const selectedModules = watch('modules') || [];

  const toggleGroup = (groupId: string) => {
    const current = [...selectedGroups];
    const idx = current.indexOf(groupId);
    if (idx > -1) { current.splice(idx, 1); }
    else { current.push(groupId); }
    setValue('groups', current, { shouldValidate: true });
  };

  const toggleModule = (moduleId: string) => {
    const current = [...selectedModules];
    const idx = current.indexOf(moduleId);
    if (idx > -1) { current.splice(idx, 1); }
    else { current.push(moduleId); }
    setValue('modules', current, { shouldValidate: true });
  };

  const onSubmit = async (data: AdminFormValues) => {
    try {
      if (data.accessLevel === 'all') { data.groups = []; data.modules = []; }
      else if (data.accessLevel === 'group') { data.modules = []; }
      
      const res = await provisionAdmin(data);
      if (!res.success) {
        console.error(res.error);
        alert(res.error);
        return;
      }
      
      router.push('/dashboard/admins');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/admins" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ አስተዳዳሪዎች ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አዲስ አስተዳዳሪ</h1>
            <p className="text-sm text-text-muted mt-1">የስርዓት መዳረሻ ፍቃድ ይስጡ።</p>
          </div>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
            <IconDeviceFloppy size={18} />
            {isSubmitting ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}
          </button>
        </div>

        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የአስተዳዳሪ መረጃ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሙሉ ስም</label>
                <input {...register('name')} type="text" placeholder="ለምሳሌ፦ ዶ/ር ታደሰ ወርቁ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ኢሜይል</label>
                <input {...register('email')} type="email" placeholder="admin@commission.gov" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ስልክ</label>
                <input {...register('phone')} type="tel" placeholder="+251-911-123-456" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.phone && <span className="text-xs text-danger">{errors.phone.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሁኔታ</label>
                <select {...register('status')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option value="Active">ንቁ</option>
                  <option value="Inactive">እንቅስቃሴ የለም</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሚና እና መዳረሻ</h3>
            <p className="text-xs text-text-muted -mt-4">ይህ አስተዳዳሪ ምን ማግኘት እንደሚችል ይምረጡ።</p>

            <div className="grid grid-cols-2 gap-4">
              {ACCESS_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = accessLevel === opt.value;
                return (
                  <label key={opt.value} className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? `${opt.border} ${opt.bg}` : 'border-border/30 hover:border-border/60 bg-surface-primary/50'}`}>
                    <input type="radio" {...register('accessLevel')} value={opt.value} className="sr-only" />
                    <div className={`${opt.color} ${isSelected ? 'opacity-100' : 'opacity-40'}`}>
                      <Icon size={28} stroke={1.5} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{opt.label}</div>
                      <div className="text-[11px] text-text-muted mt-1 leading-relaxed">{opt.desc}</div>
                    </div>
                    {isSelected && (
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${opt.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {accessLevel === 'specific' && (
            <>
              <div className="w-full h-[1px] bg-border/20" />
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሞጁሎችን ይምረጡ</h4>
                <p className="text-xs text-text-muted -mt-2">ይህ አስተዳዳሪ ማግኘት የሚችላቸውን የተናጠል ተግባራት ይምረጡ።</p>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_MODULES.map(mod => {
                    const isSelected = selectedModules.includes(mod.id);
                    return (
                      <button key={mod.id} type="button" onClick={() => toggleModule(mod.id)} className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${isSelected ? 'bg-warning/5 border-warning/30' : 'bg-surface-primary border-border/30 hover:border-border/60'}`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-warning border-warning' : 'border-border/50'}`}>
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{mod.labelAm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="w-full h-[1px] bg-border/20" />
          <div className="flex items-center gap-3 bg-surface-secondary/30 rounded-xl p-4">
            <IconShieldCheck size={18} className="text-text-muted shrink-0" />
            <div className="text-xs text-text-muted">
              {accessLevel === 'all' && 'ይህ አስተዳዳሪ ሁሉንም ሞጁሎች ሙሉ በሙሉ ማግኘት ይችላል።'}
              {accessLevel === 'specific' && (<>የተመረጡ ሞጁሎች፦ {selectedModules.length > 0 ? selectedModules.map(m => ALL_MODULES.find(mod => mod.id === m)?.labelAm).join(', ') : 'እስካሁን አልተመረጡም።'}</>)}
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
