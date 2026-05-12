import { apiClient } from './apiClient'

export const dashboardService = {
  async getStats() {
    const response = await apiClient.get('/api/dashboard/stats')
    return response.data.data
  },

  async getRecentPayments(limit = 10) {
    const response = await apiClient.get(`/api/dashboard/recent-payments?limit=${limit}`)
    return response.data.data
  },

  async getUnpaidStudents() {
    const response = await apiClient.get('/api/dashboard/unpaid-students')
    return response.data.data
  },

  async getClassBreakdown() {
    const response = await apiClient.get('/api/dashboard/class-breakdown')
    return response.data.data
  },

  async sendReminder(studentId: string) {
    const response = await apiClient.post(`/api/dashboard/reminders/${studentId}`)
    return response.data
  },

  async sendBulkReminders() {
    const response = await apiClient.post('/api/dashboard/reminders/bulk')
    return response.data
  }
}
