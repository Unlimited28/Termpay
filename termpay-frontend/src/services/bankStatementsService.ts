import { apiClient } from './apiClient'

export const bankStatementsService = {
  async listUploads() {
    const response = await apiClient.get('/api/bank-statements')
    return response.data.data
  },

  async uploadStatement(file: File, onProgress?: (percent: number) => void) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/api/bank-statements/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      }
    })
    return response.data.data
  },

  async getTransactions(uploadId: string, tab?: string) {
    const params = tab ? `?tab=${tab}` : ''
    const response = await apiClient.get(
      `/api/bank-statements/${uploadId}/transactions${params}`
    )
    return response.data.data
  },

  async runMatching(uploadId: string) {
    const response = await apiClient.post(`/api/bank-statements/${uploadId}/match`)
    return response.data.data
  },

  async confirmMatch(uploadId: string, transactionId: string) {
    const response = await apiClient.put(
      `/api/bank-statements/${uploadId}/transactions/${transactionId}/confirm`
    )
    return response.data.data
  },

  async confirmAllHigh(uploadId: string) {
    const response = await apiClient.post(
      `/api/bank-statements/${uploadId}/confirm-all-high`
    )
    return response.data.data
  },

  async overrideMatch(uploadId: string, transactionId: string, studentId: string) {
    const response = await apiClient.put(
      `/api/bank-statements/${uploadId}/transactions/${transactionId}/override`,
      { studentId }
    )
    return response.data.data
  },

  async dismissTransaction(uploadId: string, transactionId: string) {
    const response = await apiClient.put(
      `/api/bank-statements/${uploadId}/transactions/${transactionId}/dismiss`
    )
    return response.data
  }
}
