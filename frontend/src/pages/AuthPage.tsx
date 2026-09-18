import React, { useState } from 'react';
import {
  Pickaxe,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onReturnToLanding: () => void;
  targetMineName?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  onReturnToLanding,
  targetMineName = 'Balaghat Mine (Bharveli)'
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'granted' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFillDemoCredentials = () => {
    setEmployeeId('MOIL-DEMO');
    setPassword('MOIL@2026');
    setErrorMessage(null);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!employeeId.trim()) {
      setErrorMessage('Employee ID is required.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('verifying');

    // Verification check (accepts demo credentials or valid format)
    setTimeout(() => {
      const cleanEmpId = employeeId.trim().toUpperCase();
      const cleanPass = password.trim();

      // Demo or standard engineer credentials check
      const isValid =
        cleanEmpId === 'MOIL-DEMO' ||
        cleanEmpId === 'MOIL-ENG-2026' ||
        cleanEmpId.startsWith('MOIL') ||
        cleanEmpId.length >= 4;

      if (isValid && cleanPass.length >= 4) {
        setVerificationStatus('granted');
        setTimeout(() => {
          onAuthSuccess();
        }, 800);
      } else {
        setIsVerifying(false);
        setVerificationStatus('failed');
        setErrorMessage('Verification failed. Please check your Employee ID and password.');
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#EEF2F5] text-[#18324A] flex flex-col font-sans selection:bg-[#F2A900] selection:text-[#18324A] relative overflow-x-hidden">
      
      {/* Top Header Roster */}
      <header className="w-full bg-[#F8FAFC] border-b border-[#D3DDE5] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-[#F2A900] flex items-center justify-center text-[#18324A] shadow-xs font-bold">
            <Pickaxe className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#18324A] tracking-tight text-xs sm:text-sm flex items-center gap-2">
              MOIL LIMITED
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#E7EDF2] text-[#5F7487] font-medium border border-[#D3DDE5]">
                Govt. of India
              </span>
            </div>
            <div className="text-[11px] text-[#5F7487] font-mono hidden sm:block">
              Ministry of Steel &bull; A Miniratna Category-I CPSE
            </div>
          </div>
        </div>

        <button
          onClick={onReturnToLanding}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#E7EDF2] hover:bg-[#D3DDE5] text-[#5F7487] hover:text-[#18324A] border border-[#D3DDE5] text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Landing</span>
        </button>
      </header>

      {/* Verification Overlay when Granted */}
      {verificationStatus === 'granted' && (
        <div className="fixed inset-0 z-50 bg-[#18324A]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-xl bg-[#16866A] flex items-center justify-center text-white shadow-lg animate-bounce">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="text-lg font-bold tracking-wide">IDENTITY VERIFIED &bull; ACCESS GRANTED</div>
          <div className="text-xs text-[#8293A3] font-mono">Loading MOIL Mining Intelligence Workspace...</div>
          <Loader2 className="w-5 h-5 text-[#F2A900] animate-spin mt-1" />
        </div>
      )}

      {/* Main Centered Engineer Verification Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        
        {/* Subtle Background Topography & GIS Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18324A" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
            <path d="M -100 200 Q 200 100 500 400 T 1100 200" fill="none" stroke="#18324A" strokeWidth="1.5" />
            <path d="M -100 350 Q 250 250 600 500 T 1200 350" fill="none" stroke="#18324A" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Header Heading Area */}
        <div className="text-center max-w-lg mb-6 space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#16866A]/10 text-[#16866A] text-xs font-mono font-semibold border border-[#16866A]/20">
            <span className="w-2 h-2 rounded-full bg-[#16866A] animate-pulse" />
            <span>SECURE ENGINEER ACCESS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#18324A] tracking-tight">
            Mining Intelligence Access
          </h1>

          <p className="text-xs sm:text-sm text-[#5F7487] leading-relaxed">
            Verify your authorized credentials to access the MOIL Mining Intelligence Platform.
          </p>
        </div>

        {/* ENGINEER VERIFICATION CARD */}
        <div className="w-full max-w-[440px] bg-[#F7F9FB] border border-[#D3DDE5] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(24,50,71,0.06)] space-y-5 relative z-10">
          
          {/* Card Title Label */}
          <div className="flex items-center justify-between border-b border-[#E7EDF2] pb-3 text-xs">
            <div className="flex items-center space-x-2 text-[#18324A] font-bold uppercase tracking-wider font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#2878A8]" />
              <span>Engineer Verification</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E7EDF2] text-[#5F7487] border border-[#D3DDE5]">
              {targetMineName}
            </span>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="bg-[#FAEAEA] border border-[#C94747]/30 text-[#C94747] p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            
            {/* Field 1: Employee ID */}
            <div className="space-y-1.5">
              <label htmlFor="employeeId" className="text-[11px] font-bold text-[#18324A] uppercase tracking-wider block">
                1. Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F7487]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ID"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D3DDE5] rounded-lg text-xs text-[#18324A] placeholder-[#8293A3] focus:outline-none focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] transition-colors"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] font-bold text-[#18324A] uppercase tracking-wider block">
                2. Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F7487]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#D3DDE5] rounded-lg text-xs text-[#18324A] placeholder-[#8293A3] focus:outline-none focus:border-[#F2A900] focus:ring-1 focus:ring-[#F2A900] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5F7487] hover:text-[#18324A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer text-[#5F7487]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D3DDE5] text-[#F2A900] focus:ring-[#F2A900]"
                />
                <span className="text-[11px]">Remember this device</span>
              </label>
              <span className="text-[11px] font-mono text-[#8293A3]">Operational Gate</span>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-lg bg-[#F2A900] hover:bg-[#D99400] active:bg-[#BF7F00] text-[#18324A] font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-card disabled:opacity-50 cursor-pointer mt-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>VERIFYING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <span>VERIFY &amp; ENTER PLATFORM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Hint for SIH Hackathon Evaluation */}
          <div className="p-3 bg-[#E7EDF2] rounded-xl border border-[#D3DDE5] text-center space-y-1.5">
            <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-[#18324A]">
              <Sparkles className="w-3.5 h-3.5 text-[#F2A900]" />
              <span>SIH Hackathon Demo Verification</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="px-3 py-1 bg-white hover:bg-[#F8FAFC] text-[#2878A8] border border-[#D3DDE5] rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-[#2878A8]" />
              <span>Autofill Demo (MOIL-DEMO / MOIL@2026)</span>
            </button>
          </div>

          {/* Security Context Micro Text */}
          <div className="text-center text-[10px] text-[#5F7487] space-y-0.5 border-t border-[#E7EDF2] pt-3">
            <div className="font-semibold text-[#18324A] uppercase tracking-wider font-mono text-[9px]">
              Authorized personnel only
            </div>
            <p>Access is monitored and logged for operational security.</p>
          </div>

        </div>

        {/* Footer Return Link */}
        <div className="mt-6 text-center text-xs relative z-10">
          <button
            onClick={onReturnToLanding}
            className="text-[#5F7487] hover:text-[#18324A] font-semibold inline-flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </button>
        </div>

      </main>
    </div>
  );
};
