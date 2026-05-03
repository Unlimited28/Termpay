import api from './api';

export interface Student {
  id: string;
  full_name: string;
  class_name: string;
  parent_name: string;
  parent_phone: string;
  status: 'paid' | 'partial' | 'unpaid';
  admission_number?: string;
  fee_bill?: {
    status: 'paid' | 'partial' | 'unpaid';
    total_amount: number;
    amount_paid: number;
    balance: number;
  };
}

export const studentService = {
  getAll: async () => {
    const response = await api.get<{ students: Student[] }>('/students');
    return response.data.students;
  },

  getById: async (id: string) => {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  create: async (data: {
    full_name: string;
    class_id: string;
    parent_name: string;
    parent_phone: string;
  }) => {
    const response = await api.post<Student>('/students', data);
    return response.data;
  }
};
