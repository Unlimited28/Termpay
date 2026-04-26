import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const features = [
    "Auto-match bank transfers to students",
    "Instant WhatsApp receipts to parents",
    "Real-time payment dashboard"
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center font-bold text-xl">T</div>
            <span className="text-2xl font-bold tracking-tight">TermPay</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-8">
              Smart payment tracking for Nigerian schools
            </h1>

            <ul className="space-y-6">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 bg-brand-blue/20 p-1 rounded-full text-brand-blue shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-lg text-slate-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">
            Trusted by Nigerian private schools
          </p>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-surface-bg lg:bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center font-bold text-white">T</div>
              <span className="text-xl font-bold text-navy">TermPay</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
