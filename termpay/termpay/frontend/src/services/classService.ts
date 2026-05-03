import api from './api';

export interface Class {
  id: string;
  name: string;
}

export const classService = {
  getAll: async () => {
    const response = await api.get<Class[]>('/classes');
    return response.data;
  }
};
