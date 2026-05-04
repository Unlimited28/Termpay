import { useState, useRef, useEffect, type ClipboardEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Logo, Button, Input } from '../../components/ui'

const ParentLoginPage = () => {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const navigate = useNavigate()
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    let timer: number
    if (step === 'otp' && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, countdown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setStep('otp')
    setCountdown(60)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char
    })
    setOtp(newOtp)
    otpRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  const handleVerify = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('parentAuth', 'true')
    setIsLoading(false)
    navigate('/parent/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-8">
          <Logo className="text-2xl" />
        </div>

        {step === 'phone' ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-text-primary">Parent Payment Portal</h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter your phone number to view your child's payment status
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Phone Number"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button type="submit" className="w-full h-11" isLoading={isLoading}>
                Send OTP
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-surface-border">
              <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-navy hover:underline">
                Are you a school admin? Login here
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-text-primary">Enter Verification Code</h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter the 6-digit code sent to <span className="font-bold text-text-primary">{phone}</span>
              </p>
            </div>

            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-bold border border-surface-border rounded-xl focus:border-navy focus:ring-1 focus:ring-navy outline-none bg-white transition-all"
                />
              ))}
            </div>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-text-secondary">
                  Resend in <span className="font-medium text-text-primary">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={() => setCountdown(60)}
                  className="text-sm font-bold text-navy hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <Button
              className="w-full h-11"
              isLoading={isLoading}
              onClick={handleVerify}
              disabled={otp.some(d => !d)}
            >
              Verify & Login
            </Button>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-sm font-medium text-text-secondary hover:text-navy hover:underline"
            >
              Change Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParentLoginPage
