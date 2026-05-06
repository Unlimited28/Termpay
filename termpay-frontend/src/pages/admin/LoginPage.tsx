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
      <div className="animate-in fade-in slide-up duration-400">
        <div>
          <h1 className="text-[32px] font-800 tracking-[-0.03em] font-black text-ink-primary">Welcome Back</h1>
          <p className="text-[15px] text-[#64748B] mt-2 mb-8">Sign in to your school dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@school.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="text-sm font-medium text-danger bg-danger/10 p-3 rounded-lg border border-danger/20 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center mt-6 space-y-6">
          <Link
            to="/forgot-password"
            className="block text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors"
          >
            Forgot password?
          </Link>

          {/* Demo Credentials Card */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-[10px] text-left">
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-muted">Bursar:</span>
                <span className="text-ink-secondary font-medium">bursar@yomfield.sch.ng</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-ink-muted">Proprietor:</span>
                <span className="text-ink-secondary font-medium">proprietor@yomfield.sch.ng</span>
              </div>
              <div className="flex justify-between text-[12px] pt-1.5 border-t border-white/[0.06] mt-1.5">
                <span className="text-ink-muted">Password:</span>
                <span className="text-ink-secondary font-medium">Demo1234!</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06]">
            <p className="text-sm text-ink-secondary">
              Are you a parent?{' '}
              <Link to="/parent/login" className="font-bold text-emerald hover:underline">
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
