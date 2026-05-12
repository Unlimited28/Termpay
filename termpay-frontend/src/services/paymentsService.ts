import { apiClient } from './apiClient'

export interface PaymentFilters {
  search?: string
  classId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export const paymentsService = {
  async listPayments(filters: PaymentFilters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.classId) params.append('classId', filters.classId)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await apiClient.get(`/api/payments?${params.toString()}`)
    return response.data
  },

  async getPayment(id: string) {
    const response = await apiClient.get(`/api/payments/${id}`)
    return response.data.data
  },

  async recordManualPayment(data: {
    studentId: string
    amount: number
    paymentDate: string
    paymentMethod: string
    note?: string
  }) {
    const response = await apiClient.post('/api/payments/manual', data)
    return response.data.data
  },

  async resendNotification(paymentId: string) {
    const response = await apiClient.post(`/api/payments/${paymentId}/resend`)
    return response.data
  },

  async downloadReceipt(paymentId: string) {
    const response = await apiClient.get(`/api/receipts/${paymentId}/download`)
    return response.data.data
  }
}
