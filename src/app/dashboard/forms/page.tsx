import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FormsAdminView } from "@/components/dashboard/FormsAdminView";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function FormsPage() {
  // Admin data fetching
  const { data: fetchedReps } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id, region, system_role, users:user_id(full_name, phone_number)')
    .eq('system_role', 'representative');

  const { data: fetchedReports } = await supabaseAdmin
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <FormsAdminView initialRepresentatives={fetchedReps || []} initialReports={fetchedReports || []} />
    </DashboardLayout>
  );
}
