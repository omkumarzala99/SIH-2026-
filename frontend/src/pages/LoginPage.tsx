import React, { useState } from 'react';
import {
  Pickaxe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Brain,
  Map,
  Satellite,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Compass
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (redirectPath?: string) => void;
  onEnterDemo: () => void;
  initialRedirect?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onEnterDemo,
  initialRedirect
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Email or username is required.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsSubmitting(true);

    // Simulate authentication check
    setTimeout(() => {
      // In prototype mode, allow valid format or standard demo credentials
      setIsSubmitting(false);
      setIsTransitioning(true);
      setTimeout(() => {
        onLoginSuccess(initialRedirect);
      }, 700);
    }, 600);
  };

  const handleDemoClick = () => {
    setErrorMessage(null);
    setIsDemoSubmitting(true);
    setTimeout(() => {
      setIsDemoSubmitting(false);
      setIsTransitioning(true);
      setTimeout(() => {
        onEnterDemo();
      }, 700);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#EEF2F4] text-[#172B3A] flex flex-col font-sans selection:bg-[#EFA900] selection:text-[#172B3A] relative overflow-x-hidden">
      
      {/* Loading Overlay during transition */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-[#172B3A]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 animate-fadeIn">
          <div className="w-10 h-10 rounded-lg bg-[#EFA900] flex items-center justify-center text-[#172B3A] shadow-lg animate-bounce">
            <Pickaxe className="w-6 h-6" />
          </div>
          <div className="text-base font-bold tracking-wide">Loading MOIL Intelligence Workspace...</div>
          <div className="text-xs text-[#CBD6DE]">Initializing AI models &amp; spatial GIS vectors</div>
          <Loader2 className="w-5 h-5 text-[#EFA900] animate-spin mt-1" />
        </div>
      )}

      {/* Main Split Grid Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-[1440px] w-full mx-auto min-h-screen">
        
        {/* ── LEFT SIDE: BRAND & PLATFORM AREA (55-60% on desktop) ── */}
        <div className="lg:col-span-7 xl:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden bg-[#E5EBEF]/60 border-r border-[#CBD6DE]">
          
          {/* Faint Vector Topo / GIS Grid Background Pattern */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172B3A" strokeWidth="1" />
                  <circle cx="40" cy="40" r="1.5" fill="#172B3A" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              {/* Abstract contour lines */}
              <path d="M -100 200 Q 200 100 500 400 T 1100 200" fill="none" stroke="#172B3A" strokeWidth="1.5" />
              <path d="M -100 300 Q 200 200 500 500 T 1100 300" fill="none" stroke="#172B3A" strokeWidth="1.5" />
              <path d="M -100 400 Q 200 300 500 600 T 1100 400" fill="none" stroke="#172B3A" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFA900] flex items-center justify-center text-[#172B3A] shadow-xs">
                <Pickaxe className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#172B3A] tracking-tight text-sm flex items-center gap-2">
                  MOIL LIMITED
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#EEF2F4] text-[#5F7180] font-medium border border-[#CBD6DE]">
                    Govt. of India
                  </span>
                </div>
                <div className="text-[11px] text-[#5F7180] font-mono">Miniratna Category-I PSU</div>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-[#5F7180] font-mono bg-[#EEF2F4] px-2.5 py-1 rounded-md border border-[#CBD6DE]">
              <span className="w-2 h-2 rounded-full bg-[#16866A]" />
              <span>Concession Network Active</span>
            </div>
          </div>

          {/* Main Hero & Capability Section */}
          <div className="my-10 lg:my-0 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2878A8]/10 text-[#2878A8] text-xs font-semibold border border-[#2878A8]/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2878A8]" />
              <span>ENTERPRISE OPERATIONAL PORTAL</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172B3A] tracking-tight leading-[1.15]">
              Mining Intelligence,<br />
              <span className="text-[#2878A8]">Built for Smarter Operations.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5F7180] mt-4 leading-relaxed max-w-xl">
              Integrated AI, geospatial intelligence, satellite telemetry, and operational analytics for modern manganese ore mining across MOIL central Indian concessions.
            </p>

            {/* 4 Compact Capability Indicator Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              <div className="bg-white/80 backdrop-blur-xs border border-[#CBD6DE] rounded-xl p-3.5 shadow-xs flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[#2878A8]/10 text-[#2878A8] flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172B3A]">AI / ML Intelligence</div>
                  <div className="text-[11px] text-[#5F7180] mt-0.5">Inference &amp; 14-day shortfall forecaster</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs border border-[#CBD6DE] rounded-xl p-3.5 shadow-xs flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[#EFA900]/15 text-[#D99600] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172B3A]">Spatial GIS</div>
                  <div className="text-[11px] text-[#5F7180] mt-0.5">8 Concession lease boundaries &amp; benches</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs border border-[#CBD6DE] rounded-xl p-3.5 shadow-xs flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[#16866A]/10 text-[#16866A] flex items-center justify-center shrink-0 mt-0.5">
                  <Satellite className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172B3A]">Satellite &amp; Telemetry</div>
                  <div className="text-[11px] text-[#5F7180] mt-0.5">Sentinel-2 MSI &bull; Landsat-9 &bull; NASA FIRMS</div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs border border-[#CBD6DE] rounded-xl p-3.5 shadow-xs flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[#2878A8]/10 text-[#2878A8] flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172B3A]">Decision Support</div>
                  <div className="text-[11px] text-[#5F7180] mt-0.5">Prescriptive human-in-the-loop governance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Left PSU Context Footer */}
          <div className="relative z-10 pt-6 border-t border-[#CBD6DE] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#5F7180] gap-2">
            <div>Public Sector Undertaking (PSU) under Ministry of Steel, Govt. of India</div>
            <div className="font-mono text-[10px]">Balaghat &bull; Dongri Buzurg &bull; Tirodi &bull; Chikla</div>
          </div>
        </div>

        {/* ── RIGHT SIDE: AUTHENTICATION CARD AREA (40-45% on desktop) ── */}
        <div className="lg:col-span-5 xl:col-span-5 p-6 sm:p-10 flex flex-col justify-center items-center relative bg-[#EEF2F4]">
          
          <div className="w-full max-w-[440px] bg-white border border-[#CBD6DE] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(23,43,58,0.06)] space-y-6">
            
            {/* Card Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#172B3A] tracking-tight">Welcome back</h2>
              <p className="text-xs sm:text-sm text-[#5F7180] mt-1">
                Sign in to access the MOIL Mining Intelligence Platform.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="bg-[#C94B4B]/10 border border-[#C94B4B]/30 text-[#C94B4B] p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Field 1: Work Email / Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-[11px] font-bold text-[#172B3A] uppercase tracking-wider block">
                  Work Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F7180]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your official email or username"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#EEF2F4]/50 border border-[#CBD6DE] rounded-lg text-xs text-[#172B3A] placeholder-[#5F7180]/60 focus:outline-none focus:border-[#EFA900] focus:ring-1 focus:ring-[#EFA900] transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <label htmlFor="password font-bold" className="text-[11px] font-bold text-[#172B3A] uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5F7180]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#EEF2F4]/50 border border-[#CBD6DE] rounded-lg text-xs text-[#172B3A] placeholder-[#5F7180]/60 focus:outline-none focus:border-[#EFA900] focus:ring-1 focus:ring-[#EFA900] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5F7180] hover:text-[#172B3A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-[#5F7180]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#CBD6DE] text-[#EFA900] focus:ring-[#EFA900]"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => setErrorMessage('For password reset, please contact MOIL Enterprise IT Helpdesk.')}
                  className="text-[#2878A8] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary CTA: Sign In */}
              <button
                type="submit"
                disabled={isSubmitting || isDemoSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#EFA900] hover:bg-[#D99600] active:bg-[#BF7F00] text-[#172B3A] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Authorized Personnel Security Context Indicator */}
            <div className="p-3 bg-[#EEF2F4]/60 rounded-xl border border-[#CBD6DE] text-center text-xs space-y-0.5">
              <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-[#172B3A]">
                <span className="w-2 h-2 rounded-full bg-[#16866A] inline-block animate-pulse"></span>
                <span>Authorized MOIL Personnel</span>
              </div>
              <p className="text-[10px] text-[#5F7180] leading-normal">
                Access is monitored and governed according to organizational security policies.
              </p>
            </div>

            {/* DEMO / PROTOTYPE ACCESS SECTION */}
            <div className="pt-2 border-t border-[#CBD6DE] text-center space-y-2">
              <div className="text-[10px] font-mono text-[#5F7180] uppercase tracking-wider">
                Prototype Access &bull; Demonstration Mode
              </div>
              <button
                type="button"
                onClick={handleDemoClick}
                disabled={isSubmitting || isDemoSubmitting}
                className="w-full py-2 px-3 rounded-lg bg-[#E5EBEF] hover:bg-[#CBD6DE] text-[#172B3A] font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 border border-[#CBD6DE] cursor-pointer"
              >
                {isDemoSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Entering Demo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#EFA900]" />
                    <span>Enter Demo Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5F7180]" />
                  </>
                )}
              </button>
            </div>

            {/* Subtle Footer */}
            <div className="pt-2 text-center text-[10px] text-[#5F7180] space-y-0.5 border-t border-[#CBD6DE]/60">
              <div className="font-semibold text-[#172B3A]">MOIL Mining Intelligence Platform</div>
              <div>AI &bull; GIS &bull; Satellite &bull; Operations</div>
              <div className="font-mono text-[9px] text-[#5F7180]">Prototype v1.0 &bull; Govt. of India</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
