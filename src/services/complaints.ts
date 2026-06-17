import { supabase } from '../lib/supabaseClient';
import { Complaint } from '../types';

export const complaintService = {
  getComplaints: async (): Promise<Complaint[]> => {
    const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching complaints:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      email: item.email || '',
      type: item.type,
      subject: item.subject,
      message: item.message,
      attachments: item.attachments || [],
      date: new Date(item.created_at).toLocaleDateString(),
      status: item.status,
      resolution: item.resolution,
    }));
  },
  updateComplaintStatus: async (id: string, status: string): Promise<void> => {
    const { error } = await supabase.from('complaints').update({ status }).eq('id', id);
    if (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }
};
