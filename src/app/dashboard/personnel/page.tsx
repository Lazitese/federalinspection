'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconUserPlus, IconSearch, IconEdit, IconTrash, IconBuilding } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { personnelService } from "@/services/personnel";
import { Personnel } from "@/types";

// @BACKEND: This page lists personnel from the mock service.
// Displayed as a photo card grid grouped by office category.
// Positions follow COMMISSION_POSITIONS hierarchy.

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    personnelService.getPersonnel().then(data => {
      setPersonnel(data);
      setLoading(false);
    });
  }, []);

  const deletePersonnel = async (id: string) => {
    if (confirm('እርግጠኛ ነዎት ይህን ሰራተኛ ማስወገድ ይፈልጋሉ?')) {
      await personnelService.deletePersonnel(id);
      setPersonnel(prev => prev.filter(p => p.id !== id));
    }
  };

  const filterFn = (p: Personnel) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.nameAm || '').includes(q) || p.positionAm.toLowerCase().includes(q);
  };

  const mainOffice = personnel.filter(p => p.officeCategory === 'Main Office' && filterFn(p));
  const branchOffice = personnel.filter(p => p.officeCategory === 'Branch Office' && filterFn(p));

  const renderCard = (member: Personnel) => (
    <div key={member.id} className="group bg-surface-primary border border-border/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-blue/20 hover:-translate-y-0.5">
      {/* Photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-secondary">
        {member.photo ? (
          <img src={member.photo} alt={member.nameAm || member.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-surface-secondary to-surface-tertiary">
            <div className="flex size-16 items-center justify-center rounded-full bg-surface-primary/60">
              <span className="text-2xl font-bold text-text-muted">
                {member.nameAm?.charAt(0) || member.name.charAt(0)}
              </span>
            </div>
            <span className="mt-2 text-xs text-text-muted">{member.nameAm || member.name}</span>
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${member.status === 'Active' ? 'bg-success/90 text-white' : 'bg-warning/90 text-white'}`}>
          {member.status === 'Active' ? 'ንቁ' : 'እንቅስቃሴ የለም'}
        </span>
      </div>
      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{member.nameAm || member.name}</h3>
        <p className="text-[11px] text-text-muted mt-0.5">{member.positionAm}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-medium text-text-secondary flex items-center gap-1">
            <IconBuilding size={12} />
            {member.officeCategoryAm}
          </span>
          <div className="flex items-center gap-1">
            <Link href={`/dashboard/personnel/${member.id}`} className="p-1.5 text-text-muted hover:text-brand-blue hover:bg-brand-blue/10 rounded-md transition-colors">
              <IconEdit size={14} />
            </Link>
            <button onClick={() => deletePersonnel(member.id)} className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors">
              <IconTrash size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">ሰራተኞች</h1>
            <p className="text-sm text-text-muted mt-1">የኮሚሽኑን አመራሮች እና ሰራተኞች ያስተዳድሩ።</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ሰራተኛ ይፈልጉ..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 w-64 transition-colors" />
            </div>
            <Link href="/dashboard/personnel/create" className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconUserPlus size={18} />
              አዲስ ሰራተኛ
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-text-muted">በመጫን ላይ...</div>
        ) : (
          <div className="flex flex-col gap-10 pb-10">
            {/* ኮሚሽን ጽ/ቤት */}
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <IconBuilding size={16} />
                ኮሚሽን ጽ/ቤት
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {mainOffice.length === 0 ? (
                  <p className="col-span-full text-sm text-text-muted py-8 text-center">ምንም ሰራተኞች አልተገኙም</p>
                ) : mainOffice.map(renderCard)}
              </div>
            </div>
            {/* ኮሚሽን ቅርንጫፍ ጽ/ቤት */}
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <IconBuilding size={16} />
                ኮሚሽን ቅርንጫፍ ጽ/ቤት
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {branchOffice.length === 0 ? (
                  <p className="col-span-full text-sm text-text-muted py-8 text-center">ምንም ሰራተኞች አልተገኙም</p>
                ) : branchOffice.map(renderCard)}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
