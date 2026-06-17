// @BACKEND: API contract for admins:
//   GET    /admins          → Admin[]
//   GET    /admins/:id      → Admin
//   POST   /admins          → Admin (JSON body with Omit<Admin, 'id' | 'createdAt' | 'lastLogin'>)
//   PUT    /admins/:id      → Admin (JSON body with Partial<Admin>)
//   DELETE /admins/:id      → void
// All endpoints prefix with BASE_URL (default http://localhost:3001/api)

// @BACKEND: The permission model is defined in types/index.ts (PERMISSION_GROUPS, ALL_MODULES).
// Backend should store group IDs and module IDs as string arrays, not the full objects.

import { apiClient } from '../lib/api-client';
import { Admin } from '../types';

// @BACKEND: Remove mock data — this is placeholder until the NestJS API is ready
const mockAdmins: Admin[] = [
  {
    id: '1',
    name: 'Dr. Tadesse W.',
    email: 'tadesse@commission.gov',
    phone: '+251-911-123-456',
    accessLevel: 'all',
    groups: [],
    modules: [],
    status: 'Active',
    lastLogin: 'ጥቅምት 15, 2026 08:30 AM',
    createdAt: 'መስከረም 1, 2025',
  },
  {
    id: '2',
    name: 'W/ro Helene T.',
    email: 'helene@commission.gov',
    phone: '+251-922-234-567',
    accessLevel: 'group',
    groups: ['content', 'communications'],
    modules: [],
    status: 'Active',
    lastLogin: 'ጥቅምት 14, 2026 02:15 PM',
    createdAt: 'ጥር 10, 2026',
  },
  {
    id: '3',
    name: 'Ato Daniel M.',
    email: 'daniel@commission.gov',
    phone: '+251-933-345-678',
    accessLevel: 'specific',
    groups: [],
    modules: ['news', 'documents'],
    status: 'Active',
    lastLogin: 'ጥቅምት 13, 2026 11:00 AM',
    createdAt: 'ሚያዝያ 20, 2026',
  },
  {
    id: '4',
    name: 'W/ro Almaz G.',
    email: 'almaz@commission.gov',
    phone: '+251-944-456-789',
    accessLevel: 'specific',
    groups: [],
    modules: ['complaints'],
    status: 'Inactive',
    lastLogin: 'መስከረም 30, 2026 09:45 AM',
    createdAt: 'ነሐሴ 5, 2025',
  },
];

export const adminService = {
  // @BACKEND: Replace mock return with real API call — response matches Admin[]
  getAdmins: async (): Promise<Admin[]> => {
    await apiClient.get('/admins');
    return mockAdmins;
  },

  // @BACKEND: Replace mock return with real API call — response matches Admin
  getAdminById: async (id: string): Promise<Admin | undefined> => {
    await apiClient.get(`/admins/${id}`);
    return mockAdmins.find(a => a.id === id);
  },

  // @BACKEND: Replace mock — real API should persist and return created Admin
  createAdmin: async (data: Omit<Admin, 'id' | 'createdAt' | 'lastLogin'>): Promise<Admin> => {
    await apiClient.post('/admins', data);
    const newAdmin: Admin = {
      ...data,
      id: Date.now().toString(),
      createdAt: 'ዛሬ',
      lastLogin: '-',
    };
    mockAdmins.push(newAdmin);
    return newAdmin;
  },

  // @BACKEND: Replace mock — real API should persist changes and return updated Admin
  updateAdmin: async (id: string, data: Partial<Admin>): Promise<void> => {
    await apiClient.put(`/admins/${id}`, data);
    const index = mockAdmins.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAdmins[index] = { ...mockAdmins[index], ...data };
    }
  },

  // @BACKEND: Replace mock — real API should delete from database
  deleteAdmin: async (id: string): Promise<void> => {
    await apiClient.delete(`/admins/${id}`);
    const index = mockAdmins.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAdmins.splice(index, 1);
    }
  },
};
