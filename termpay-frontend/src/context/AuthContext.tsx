import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { authService } from '../services/authService'
import { getErrorMessage } from '../services/apiClient'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'super_admin' | 'proprietor' | 'bursar' | 'teacher'
  schoolId: string
  schoolName: string
  schoolPrefix?: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('termpay_token')
    const savedUser = localStorage.getItem('termpay_user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('termpay_token')
        localStorage.removeItem('termpay_user')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      const data = await authService.login(email, password)

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role as AuthUser['role'],
        schoolId: data.user.schoolId,
        schoolName: data.user.schoolName,
        schoolPrefix: data.user.schoolPrefix
      }

      // Persist to localStorage
      localStorage.setItem('termpay_token', data.token)
      localStorage.setItem('termpay_user', JSON.stringify(authUser))

      setUser(authUser)
      return true

    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('termpay_token')
    localStorage.removeItem('termpay_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
