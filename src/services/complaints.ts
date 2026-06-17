// @BACKEND: API contract for complaints:
//   GET    /complaints        → Complaint[]
//   GET    /complaints/:id    → Complaint
//   PUT    /complaints/:id/status  → { status: string }
//   PUT    /complaints/:id/resolve → { message: string; fileName?: string }
// All endpoints prefix with BASE_URL (default http://localhost:3001/api)

import { apiClient } from '../lib/api-client';
import { Complaint } from '../types';

// @BACKEND: Remove mock data — this is placeholder until the NestJS API is ready
const mockComplaints: Complaint[] = [
  {
    id: '1', name: 'አኖኒመስ', phone: '0911-123456',
    type: 'Complaint', subject: 'በቅርንጫፍ 4 የአገልግሎት መዘግየት',
    message: 'በቅርንጫፍ ቢሮ ቁጥር 4 የአገልግሎት አሰጣጥ ላይ ከፍተኛ መዘግየት እያጋጠመኝ ነው። እባክዎን መፍትሄ ይስጡ።',
    attachments: [
      { id: 'a1', filename: 'ማስረጃ.pdf', fileType: 'PDF', fileSize: '1.2 MB' },
    ],
    date: 'ጥቅምት 14, 2026', status: 'New',
  },
  {
    id: '2', name: 'ካሳ ተስፋዬ', phone: '0922-654321', email: 'kassa@email.com',
    type: 'Suggestion', subject: 'የኦንላይን ማመልከቻ ፖርታል መሻሻል',
    message: 'የኦንላይን ማመልከቻ ፖርታሉን ለማሻሻል አንዳንድ ሀሳቦች አሉኝ። በተለይ የፋይል መጫን አቅሙ የተሻለ መሆን አለበት።',
    attachments: [],
    date: 'ጥቅምት 13, 2026', status: 'Under Review',
  },
  {
    id: '3', name: 'አለሙ በቀለ', phone: '0933-987654',
    type: 'Complaint', subject: 'የሰራተኛ አያያዝ ቅሬታ',
    message: 'በዋና ጽ/ቤት ውስጥ የሰራተኛ አያያዝ ላይ ቅሬታ አለኝ። እባክዎን ምርመራ እንዲደረግ እጠይቃለሁ።',
    attachments: [
      { id: 'a2', filename: 'ማስረጃ_1.jpg', fileType: 'PDF', fileSize: '3.4 MB' },
      { id: 'a3', filename: 'ማስረጃ_2.docx', fileType: 'DOCX', fileSize: '856 KB' },
    ],
    date: 'ጥቅምት 12, 2026', status: 'Resolved',
    resolution: {
      message: 'ምርመራ ተደርጓል። ተገቢው እርምጃ መወሰዱን እናሳውቃለን። ለትብብርዎ እናመሰግናለን።',
      attachedFile: { id: 'a4', filename: 'ምላሽ_ማስረጃ.pdf', fileType: 'PDF', fileSize: '512 KB' },
      resolvedAt: 'ጥቅምት 14, 2026', resolvedBy: 'ዶ/ር አበበ',
    },
  },
  {
    id: '4', name: 'ማርታ ደሳለኝ', phone: '0944-456789',
    type: 'Suggestion', subject: 'የስልጠና ፕሮግራም ማሻሻያ',
    message: 'የስልጠና ፕሮግራሞች በየሩብ ዓመቱ ቢዘመኑ የተሻለ ነው። በተለይ የአይቲ ስልጠና ላይ ትኩረት ሊሰጠው ይገባል።',
    attachments: [],
    date: 'ጥቅምት 11, 2026', status: 'Rejected',
    resolution: {
      message: 'ሀሳብዎ ግምት ውስጥ ገብቷል። ነገር ግን በዚህ ዓመት በጀት እጥረት ምክንያት ለማስተናገድ አልተቻለም። ለሚቀጥለው ዓመት ታሳቢ ይደረጋል።',
      resolvedAt: 'ጥቅምት 13, 2026', resolvedBy: 'ሄለን ተስፋዬ',
    },
  },
  {
    id: '5', name: 'ብርሃነ ገብረእግዚአብሄር', phone: '0955-112233',
    type: 'Complaint', subject: 'የመንገድ ጥገና ሥራ መጓተት',
    message: 'ከ3 ወራት በፊት የተጀመረው የመንገድ ጥገና ሥራ ሳይጠናቀቅ ቆሟል። ይህ የከተማውን የትራፊክ እንቅስቃሴ እያስተጓጎለ ነው።',
    attachments: [
      { id: 'a5', filename: 'የመንገድ_ፎቶ.jpg', fileType: 'PDF', fileSize: '2.1 MB' },
    ],
    date: 'ጥቅምት 10, 2026', status: 'Under Review',
  },
];

export const complaintService = {
  // @BACKEND: Replace mock return with real API call — response matches Complaint[]
  getComplaints: async (): Promise<Complaint[]> => {
    await apiClient.get('/complaints');
    return mockComplaints;
  },
  // @BACKEND: Replace mock return with real API call — response matches Complaint
  getComplaintById: async (id: string): Promise<Complaint | undefined> => {
    await apiClient.get(`/complaints/${id}`);
    return mockComplaints.find(c => c.id === id);
  },
  // @BACKEND: Real API should return updated Complaint or void
  updateComplaintStatus: async (id: string, status: string): Promise<void> => {
    await apiClient.put(`/complaints/${id}/status`, { status });
    const complaint = mockComplaints.find(c => c.id === id);
    if (complaint) complaint.status = status as Complaint['status'];
  },
  // @BACKEND: Real API should store resolution and return updated Complaint
  resolveComplaint: async (id: string, resolution: { message: string; fileName?: string }): Promise<void> => {
    await apiClient.put(`/complaints/${id}/resolve`, resolution);
    const complaint = mockComplaints.find(c => c.id === id);
    if (complaint) {
      complaint.status = 'Resolved';
      complaint.resolution = {
        message: resolution.message,
        attachedFile: resolution.fileName
          ? { id: `res-${Date.now()}`, filename: resolution.fileName, fileType: 'PDF', fileSize: '0 B' }
          : undefined,
        resolvedAt: 'ዛሬ',
        resolvedBy: 'አስተዳዳሪ',
      };
    }
  },
};
