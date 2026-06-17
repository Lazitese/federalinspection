// @BACKEND: API contract for personnel:
//   GET    /personnel       → Personnel[]
//   GET    /personnel/:id   → Personnel
//   POST   /personnel       → Personnel (JSON body with Omit<Personnel, 'id'>)
//   PUT    /personnel/:id   → Personnel (JSON body with Partial<Personnel>)
//   DELETE /personnel/:id   → void
// All endpoints prefix with BASE_URL (default http://localhost:3001/api)

// @BACKEND: Personnel positions and office categories are defined in types/index.ts
// (COMMISSION_POSITIONS, OFFICE_CATEGORIES). Backend should store position IDs, not full strings.

import { apiClient } from '../lib/api-client';
import { Personnel } from '../types';

// @BACKEND: Remove mock data — this is placeholder until the NestJS API is ready
const mockPersonnel: Personnel[] = [
  // --- ኮሚሽን ጽ/ቤት (Main Office) ---
  { id: '1', name: 'Dr. Tadesse Worku', nameAm: 'ዶ/ር ታደሰ ወርቁ', position: 'Chief Commissioner', positionAm: 'ዋና ኮሚሽነር', officeCategory: 'Main Office', officeCategoryAm: 'ኮሚሽን ጽ/ቤት', department: 'Executive', email: 'tadesse@commission.gov', phone: '+251-911-123-456', photo: '', status: 'Active' },
  { id: '2', name: 'W/ro Helene Tesfaye', nameAm: 'ወ/ሮ ሄለን ተስፋዬ', position: 'Deputy Commissioner', positionAm: 'ምክትል ኮሚሽነር', officeCategory: 'Main Office', officeCategoryAm: 'ኮሚሽን ጽ/ቤት', department: 'Operations', email: 'helene@commission.gov', phone: '+251-922-234-567', photo: '', status: 'Active' },
  { id: '3', name: 'Ato Daniel Mekonnen', nameAm: 'አቶ ዳንኤል መኮንን', position: 'Secretary & Office Head', positionAm: 'ጸሃፊና ጽህፈት ቤት ሃላፊ', officeCategory: 'Main Office', officeCategoryAm: 'ኮሚሽን ጽ/ቤት', department: 'Administration', email: 'daniel@commission.gov', phone: '+251-933-345-678', photo: '', status: 'Active' },
  { id: '4', name: 'W/ro Almaz G.', nameAm: 'ወ/ሮ አልማዝ ገ/ህይወት', position: 'Commission Committee Members', positionAm: 'ኮሚሽን ኮሚቴ አባላት', officeCategory: 'Main Office', officeCategoryAm: 'ኮሚሽን ጽ/ቤት', department: 'Committee', email: 'almaz@commission.gov', phone: '+251-944-456-789', photo: '', status: 'Active' },
  { id: '5', name: 'Ato Berhanu G.', nameAm: 'አቶ ብርሃኑ ገብሬ', position: 'Commission Committee Members', positionAm: 'ኮሚሽን ኮሚቴ አባላት', officeCategory: 'Main Office', officeCategoryAm: 'ኮሚሽን ጽ/ቤት', department: 'Committee', email: 'berhanu@commission.gov', phone: '+251-955-567-890', photo: '', status: 'Active' },
  { id: '6', name: 'Dr. Abebech A.', nameAm: 'ዶ/ር አበበች አሰፋ', position: 'Work Management Committee Members', positionAm: 'ስራ አመራር ኮሚቴ አባላት', officeCategory: 'Main Office', officeCategoryAm: 'ኮሚሽን ጽ/ቤት', department: 'Planning', email: 'abebech@commission.gov', phone: '+251-966-678-901', photo: '', status: 'Active' },
  { id: '7', name: 'Ato Samuel K.', nameAm: 'አቶ ሳሙኤል ካሳሁን', position: 'Commission Management Members', positionAm: 'ኮሚሽን ማኔጅመንት አባላት', officeCategory: 'Main Office', officeCategoryAm: 'ኮሚሽን ጽ/ቤት', department: 'Management', email: 'samuel@commission.gov', phone: '+251-977-789-012', photo: '', status: 'Active' },
  // --- ኮሚሽን ቅርንጫፍ ጽ/ቤት (Branch Office) ---
  { id: '8', name: 'Ato Tekle H.', nameAm: 'አቶ ተክለ ሀይለማርያም', position: 'Chief Commissioner', positionAm: 'ዋና ኮሚሽነር', officeCategory: 'Branch Office', officeCategoryAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', department: 'Executive', email: 'tekle@commission.gov', phone: '+251-988-890-123', photo: '', status: 'Active' },
  { id: '9', name: 'W/ro Meseret D.', nameAm: 'ወ/ሮ ሜሰረት ደሳለኝ', position: 'Deputy Commissioner', positionAm: 'ምክትል ኮሚሽነር', officeCategory: 'Branch Office', officeCategoryAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', department: 'Field Operations', email: 'meseret@commission.gov', phone: '+251-999-901-234', photo: '', status: 'Active' },
  { id: '10', name: 'Ato Hailu B.', nameAm: 'አቶ ሀይሉ በቀለ', position: 'Secretary & Office Head', positionAm: 'ጸሃፊና ጽህፈት ቤት ሃላፊ', officeCategory: 'Branch Office', officeCategoryAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', department: 'Admin', email: 'hailu@commission.gov', phone: '+251-910-012-345', photo: '', status: 'Active' },
  { id: '11', name: 'W/ro Tsehay A.', nameAm: 'ወ/ሮ ፀሀይ አለሙ', position: 'Commission Committee Members', positionAm: 'ኮሚሽን ኮሚቴ አባላት', officeCategory: 'Branch Office', officeCategoryAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', department: 'Committee', email: 'tsehay@commission.gov', phone: '+251-911-123-456', photo: '', status: 'Active' },
  { id: '12', name: 'Ato Girma W.', nameAm: 'አቶ ግርማ ወልደ', position: 'Work Management Committee Members', positionAm: 'ስራ አመራር ኮሚቴ አባላት', officeCategory: 'Branch Office', officeCategoryAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', department: 'Planning', email: 'girma@commission.gov', phone: '+251-922-234-567', photo: '', status: 'Active' },
  { id: '13', name: 'Ato Mulualem S.', nameAm: 'አቶ ሙሉዓለም ስለሺ', position: 'Commission Management Members', positionAm: 'ኮሚሽን ማኔጅመንት አባላት', officeCategory: 'Branch Office', officeCategoryAm: 'ኮሚሽን ቅርንጫፍ ጽ/ቤት', department: 'Management', email: 'mulualem@commission.gov', phone: '+251-933-345-678', photo: '', status: 'Active' },
];

export const personnelService = {
  // @BACKEND: Replace mock return with real API call — response matches Personnel[]
  getPersonnel: async (): Promise<Personnel[]> => {
    await apiClient.get('/personnel');
    return mockPersonnel;
  },

  // @BACKEND: Replace mock return with real API call — response matches Personnel
  getPersonnelById: async (id: string): Promise<Personnel | undefined> => {
    await apiClient.get(`/personnel/${id}`);
    return mockPersonnel.find(p => p.id === id);
  },

  // @BACKEND: Replace mock — real API should persist and return created Personnel
  createPersonnel: async (data: Omit<Personnel, 'id'>): Promise<Personnel> => {
    await apiClient.post('/personnel', data);
    const newMember: Personnel = { ...data, id: Date.now().toString() };
    mockPersonnel.push(newMember);
    return newMember;
  },

  // @BACKEND: Replace mock — real API should persist changes and return updated Personnel
  updatePersonnel: async (id: string, data: Partial<Personnel>): Promise<void> => {
    await apiClient.put(`/personnel/${id}`, data);
    const index = mockPersonnel.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPersonnel[index] = { ...mockPersonnel[index], ...data };
    }
  },

  // @BACKEND: Replace mock — real API should delete from database
  deletePersonnel: async (id: string): Promise<void> => {
    await apiClient.delete(`/personnel/${id}`);
    const index = mockPersonnel.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPersonnel.splice(index, 1);
    }
  },
};
