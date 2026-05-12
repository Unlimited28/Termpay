import { apiClient } from './apiClient'

export interface StudentFilters {
  search?: string
  classId?: string
  status?: string
  page?: number
  limit?: number
}

export const studentsService = {
  async listStudents(filters: StudentFilters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.classId) params.append('classId', filters.classId)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`/api/students?${params.toString()}`)
    return response.data
  },

  async getStudent(id: string) {
    const response = await apiClient.get(`/api/students/${id}`)
    return response.data.data
  },

  async createStudent(data: {
    fullName: string
    classId: string
    parentName: string
    parentPhone: string
    parentEmail?: string
  }) {
    const response = await apiClient.post('/api/students', data)
    return response.data.data
  },

  async updateStudent(id: string, data: Partial<{
    fullName: string
    classId: string
    parentName: string
    parentPhone: string
    parentEmail: string
  }>) {
    const response = await apiClient.put(`/api/students/${id}`, data)
    return response.data.data
  },

  async getClasses() {
    const response = await apiClient.get('/api/students/classes')
    return response.data.data
  }
}
