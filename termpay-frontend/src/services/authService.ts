import { apiClient } from './apiClient'

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    fullName: string
    role: string
    schoolId: string
    schoolName: string
    schoolPrefix: string
  }
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data.data
  },

  async getCurrentUser() {
    const response = await apiClient.get('/api/auth/me')
    return response.data.data
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email })
  },

  async requestParentOTP(phone: string): Promise<{ debugOtp?: string }> {
    const response = await apiClient.post('/api/auth/parent/request-otp', { phone })
    return response.data
  },

  async verifyParentOTP(phone: string, code: string): Promise<{ token: string; students: any[] }> {
    const response = await apiClient.post('/api/auth/parent/verify-otp', { phone, code })
    return response.data.data
  }
}
