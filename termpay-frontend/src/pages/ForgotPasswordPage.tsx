import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo, Button, Input } from '../components/ui'
import { CheckCircle } from 'lucide-react'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSent(true)
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-8">
          <Logo className="text-2xl" />
        </div>

        {!isSent ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-text-primary">Reset your password</h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter your email and we'll send you a reset link
              </p>
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
              <Button type="submit" className="w-full h-11" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>

            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-brand-blue hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-brand-green">
                <CheckCircle size={32} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Check your email</h1>
              <p className="text-sm text-text-secondary mt-2">
                We've sent a password reset link to <span className="font-bold text-text-primary">{email}</span>
              </p>
            </div>

            <div className="pt-4">
              <Button variant="secondary" className="w-full" onClick={() => setIsSent(false)}>
                Resend Email
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-medium text-brand-blue hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
