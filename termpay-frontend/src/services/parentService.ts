import { parentApiClient } from './apiClient'

export const parentService = {
  async getStatus() {
    const response = await parentApiClient.get('/api/parent/status')
    return response.data.data
  },

  async downloadReceipt(paymentId: string) {
    const response = await parentApiClient.get(
      `/api/parent/receipts/${paymentId}/download`
    )
    return response.data.data
  }
}
