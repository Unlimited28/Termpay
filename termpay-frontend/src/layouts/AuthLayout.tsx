import { type ReactNode } from 'react'
import { Logo } from '../components/ui'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden md:flex md:w-[45%] bg-navy p-12 flex-col justify-between text-white relative overflow-hidden">
        <div>
          <Logo variant="white" className="text-2xl" />
          <div className="mt-20">
            <h2 className="text-4xl font-bold leading-tight">
              Smart payment tracking for Nigerian schools
            </h2>

            <div className="mt-12 space-y-6">
              {[
                "Auto-match bank transfers to students",
                "Instant WhatsApp receipts to parents",
                "Real-time payment dashboard"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4CAF50]/20 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.33333 8.33333L11 1.66667" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-lg text-slate-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs tracking-[0.2em] text-slate-400 font-bold uppercase">
            Trusted by Nigerian Private Schools
          </p>
        </div>

        {/* Background Decorative Element */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[55%] bg-white flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Logo className="text-2xl" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
