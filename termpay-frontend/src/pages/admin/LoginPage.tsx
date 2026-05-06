import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthLayout } from '../../layouts'
import { Button, Input } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (_err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-[32px]">
        <div>
          <h1 className="text-[32px] font-800 tracking-[-0.03em] font-bold text-[#0F172A]">Welcome Back</h1>
          <p className="text-[15px] text-[#64748B] mt-[8px]">Sign in to your school dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div className="space-y-[8px]">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[48px] rounded-[10px] border-[1.5px] border-[#E2E8F0] focus:border-[#1565C0]"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-[48px] rounded-[10px] border-[1.5px] border-[#E2E8F0] focus:border-[#1565C0]"
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-brand-red bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-[48px] rounded-[10px] text-[15px] font-semibold"
            style={{ background: 'linear-gradient(135deg, #0D2137 0%, #1B3A5C 100%)' }}
            isLoading={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center space-y-[20px]">
          <Link
            to="/forgot-password"
            className="block text-sm font-medium text-brand-blue hover:underline"
          >
            Forgot password?
          </Link>

          <div className="pt-6 border-t border-surface-border">
            <p className="text-sm text-text-secondary">
              Are you a parent?{' '}
              <Link to="/parent/login" className="font-bold text-navy hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
