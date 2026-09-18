import React from 'react';
import {
  Pickaxe,
  ArrowRight,
  ShieldCheck,
  Brain,
  Map,
  Satellite,
  Lightbulb,
  Layers,
  TrendingUp,
  Compass,
  Activity,
  ChevronDown,
  Database,
  Cpu,
  CheckCircle2,
  FileSpreadsheet,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onEnterPlatform: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterPlatform,
  onSignIn
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2F4] text-[#172B3A] flex flex-col font-sans selection:bg-[#EFA900] selection:text-[#172B3A] relative overflow-x-hidden">
      
      {/* ── 1. LANDING HEADER ── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#CBD6DE] sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFA900] flex items-center justify-center text-[#172B3A] shadow-xs">
              <Pickaxe className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-bold text-[#172B3A] tracking-tight text-sm flex items-center gap-2">
                MOIL LIMITED
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#EEF2F4] text-[#5F7180] font-medium border border-[#CBD6DE]">
                  Govt. of India
                </span>
              </div>
              <div className="text-[11px] text-[#5F7180] font-mono hidden sm:block">Manganese Ore India Limited</div>
            </div>
          </div>

          {/* Right Header Navigation & CTAs */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs font-medium">
            <button
              onClick={() => scrollToSection('capabilities')}
              className="text-[#5F7180] hover:text-[#172B3A] transition-colors hidden md:inline-block"
            >
              Capabilities
            </button>
            <button
              onClick={() => scrollToSection('data-flow')}
              className="text-[#5F7180] hover:text-[#172B3A] transition-colors hidden md:inline-block"
            >
              Data Architecture
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className="text-[#5F7180] hover:text-[#172B3A] transition-colors hidden md:inline-block"
            >
              Technology
            </button>

            <div className="h-4 w-px bg-[#CBD6DE] hidden md:block" />

            <button
              onClick={onSignIn}
              className="px-3.5 py-1.5 rounded-lg bg-[#E5EBEF] hover:bg-[#CBD6DE] text-[#172B3A] font-semibold transition-colors border border-[#CBD6DE]"
            >
              Sign In
            </button>

            <button
              onClick={onEnterPlatform}
              className="px-4 py-1.5 rounded-lg bg-[#EFA900] hover:bg-[#D99600] active:bg-[#BF7F00] text-[#172B3A] font-bold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>Enter Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION ── */}
      <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        
        {/* Subtle Topo Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden -z-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="landing-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#172B3A" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-grid)" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2878A8]/10 text-[#2878A8] text-xs font-semibold border border-[#2878A8]/20">
              <span className="w-2 h-2 rounded-full bg-[#16866A] animate-pulse" />
              <span>MOIL LIMITED &bull; GOVERNMENT OF INDIA ENTERPRISE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#172B3A] tracking-tight leading-[1.12]">
              AI-Driven Intelligence<br />
              <span className="text-[#2878A8]">for Smarter Mining Operations.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5F7180] leading-relaxed max-w-2xl">
              Unifying geological data, production analytics, spatial intelligence, satellite observations, and operational decision support into one integrated mining intelligence workspace.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onEnterPlatform}
                className="px-6 py-3 rounded-lg bg-[#EFA900] hover:bg-[#D99600] active:bg-[#BF7F00] text-[#172B3A] font-bold text-sm shadow-md transition-all flex items-center space-x-2 group cursor-pointer"
              >
                <span>Enter Intelligence Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection('capabilities')}
                className="px-5 py-3 rounded-lg bg-white hover:bg-[#E5EBEF] text-[#172B3A] font-semibold text-sm border border-[#CBD6DE] shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Explore Platform</span>
                <ChevronDown className="w-4 h-4 text-[#5F7180]" />
              </button>
            </div>

            {/* Supporting Micro Labels */}
            <div className="pt-4 border-t border-[#CBD6DE]/80 text-xs text-[#5F7180] font-mono flex items-center gap-2 flex-wrap">
              <span>Integrated:</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD6DE] font-sans font-semibold text-[#172B3A]">AI / ML</span>
              <span>&bull;</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD6DE] font-sans font-semibold text-[#172B3A]">Spatial GIS</span>
              <span>&bull;</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD6DE] font-sans font-semibold text-[#172B3A]">Satellite Telemetry</span>
              <span>&bull;</span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#CBD6DE] font-sans font-semibold text-[#172B3A]">Decision Support</span>
            </div>
          </div>

          {/* Right Hero Visualization Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white border border-[#CBD6DE] rounded-2xl p-6 shadow-[0_8px_30px_rgba(23,43,58,0.08)] space-y-4 relative overflow-hidden">
              
              {/* Card Header Badge */}
              <div className="flex items-center justify-between border-b border-[#E5EBEF] pb-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16866A] animate-ping" />
                  <span className="font-bold text-[#172B3A] font-mono uppercase text-[11px]">Real-Time Concession Telemetry</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E5EBEF] text-[#5F7180] border border-[#CBD6DE]">
                  Balaghat Concession
                </span>
              </div>

              {/* Vector Mining Bench Topography Diagram */}
              <div className="relative h-56 bg-[#EEF2F4] rounded-xl border border-[#CBD6DE] p-4 flex flex-col justify-between overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  {/* Bench contour lines */}
                  <path d="M 0 40 Q 120 20 240 60 T 480 30" fill="none" stroke="#2878A8" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d="M 0 90 Q 150 70 300 110 T 480 80" fill="none" stroke="#172B3A" strokeWidth="1.5" />
                  <path d="M 0 140 Q 180 120 360 160 T 480 130" fill="none" stroke="#EFA900" strokeWidth="1.5" />
                  <path d="M 0 190 Q 100 170 280 210 T 480 180" fill="none" stroke="#16866A" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* GIS marker dots */}
                  <circle cx="140" cy="50" r="4" fill="#2878A8" />
                  <circle cx="280" cy="100" r="4" fill="#EFA900" />
                  <circle cx="380" cy="150" r="4" fill="#16866A" />
                </svg>

                {/* Overlay Metric Floating Chips */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-white/90 backdrop-blur-xs border border-[#CBD6DE] px-3 py-1.5 rounded-lg text-[11px] shadow-xs">
                    <span className="text-[#5F7180] block text-[9px] uppercase font-mono">Proven Reserve Grade</span>
                    <span className="font-bold text-[#172B3A] font-mono">41.8% Mn</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xs border border-[#CBD6DE] px-3 py-1.5 rounded-lg text-[11px] shadow-xs text-right">
                    <span className="text-[#5F7F80] block text-[9px] uppercase font-mono">14-Day Forecast</span>
                    <span className="font-bold text-[#16866A] font-mono">820 t/day</span>
                  </div>
                </div>

                <div className="relative z-10 bg-white/95 backdrop-blur-xs border border-[#CBD6DE] p-3 rounded-lg text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-[#2878A8]" />
                    <div>
                      <div className="font-bold text-[#172B3A] text-[11px]">AI Model Inference</div>
                      <div className="text-[10px] text-[#5F7180]">GradientBoosting Forecaster &bull; 87% Conf.</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#16866A] bg-[#16866A]/10 px-2 py-0.5 rounded border border-[#16866A]/20">
                    NOMINAL
                  </span>
                </div>
              </div>

              {/* Quick Status Bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#EEF2F4] p-2.5 rounded-lg border border-[#CBD6DE]">
                  <span className="text-[10px] uppercase font-mono text-[#5F7180]">GIS Vectors</span>
                  <div className="font-bold text-[#172B3A] font-mono text-xs mt-0.5">8 Mines</div>
                </div>
                <div className="bg-[#EEF2F4] p-2.5 rounded-lg border border-[#CBD6DE]">
                  <span className="text-[10px] uppercase font-mono text-[#5F7180]">Satellite Pass</span>
                  <div className="font-bold text-[#2878A8] font-mono text-xs mt-0.5">Sentinel-2</div>
                </div>
                <div className="bg-[#EEF2F4] p-2.5 rounded-lg border border-[#CBD6DE]">
                  <span className="text-[10px] uppercase font-mono text-[#5F7180]">Audit Status</span>
                  <div className="font-bold text-[#16866A] font-mono text-xs mt-0.5">95.1% Verified</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. PLATFORM CAPABILITIES SECTION ── */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#CBD6DE]">
        <div className="max-w-[1440px] mx-auto space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono uppercase font-bold text-[#2878A8] tracking-wider">
              System Architecture &bull; Operational Domains
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] tracking-tight">
              One Platform. Multiple Intelligence Layers.
            </h2>
            <p className="text-xs sm:text-sm text-[#5F7180]">
              Unified data pipelines transforming multi-source earth observations and operational logs into actionable shift guidance.
            </p>
          </div>

          {/* 6 Capability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Card 01 */}
            <div className="bg-[#EEF2F4] border border-[#CBD6DE] rounded-xl p-5 shadow-xs space-y-3 hover:border-[#2878A8] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-white text-[#2878A8] flex items-center justify-center border border-[#CBD6DE] font-bold text-xs">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#5F7180]">01</span>
              </div>
              <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#2878A8] transition-colors">
                Geological Intelligence
              </h3>
              <p className="text-xs text-[#5F7180] leading-relaxed">
                Subsurface manganese orebody modeling, borehole assay Kriging spatial interpolation, and leakage-free reserve potential classification.
              </p>
            </div>

            {/* Card 02 */}
            <div className="bg-[#EEF2F4] border border-[#CBD6DE] rounded-xl p-5 shadow-xs space-y-3 hover:border-[#EFA900] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-white text-[#D99600] flex items-center justify-center border border-[#CBD6DE] font-bold text-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#5F7180]">02</span>
              </div>
              <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#D99600] transition-colors">
                Production &amp; Forecasting
              </h3>
              <p className="text-xs text-[#5F7180] leading-relaxed">
                Gradient Boosting 14-day shift extraction forecaster with mathematical loss attribution across equipment, weather, and blasting delays.
              </p>
            </div>

            {/* Card 03 */}
            <div className="bg-[#EEF2F4] border border-[#CBD6DE] rounded-xl p-5 shadow-xs space-y-3 hover:border-[#2878A8] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-white text-[#2878A8] flex items-center justify-center border border-[#CBD6DE] font-bold text-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#5F7180]">03</span>
              </div>
              <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#2878A8] transition-colors">
                Spatial GIS
              </h3>
              <p className="text-xs text-[#5F7180] leading-relaxed">
                Interactive geospatial concession lease boundaries, mine bench extraction vectors, and multi-mine spatial query tools.
              </p>
            </div>

            {/* Card 04 */}
            <div className="bg-[#EEF2F4] border border-[#CBD6DE] rounded-xl p-5 shadow-xs space-y-3 hover:border-[#16866A] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-white text-[#16866A] flex items-center justify-center border border-[#CBD6DE] font-bold text-xs">
                  <Satellite className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#5F7180]">04</span>
              </div>
              <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#16866A] transition-colors">
                Satellite &amp; Environment
              </h3>
              <p className="text-xs text-[#5F7180] leading-relaxed">
                Spaceborne earth observation telemetry integrating Sentinel-2 MSI (NDVI/NDWI), Landsat-9 LST surface temp, and NASA FIRMS thermal radiometry.
              </p>
            </div>

            {/* Card 05 */}
            <div className="bg-[#EEF2F4] border border-[#CBD6DE] rounded-xl p-5 shadow-xs space-y-3 hover:border-[#C94B4B] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-white text-[#C94B4B] flex items-center justify-center border border-[#CBD6DE] font-bold text-xs">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#5F7180]">05</span>
              </div>
              <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#C94B4B] transition-colors">
                AI Risk Intelligence
              </h3>
              <p className="text-xs text-[#5F7180] leading-relaxed">
                Multi-factor risk evaluation engine scoring operational vulnerability (0–100) across fleet health, precipitation, and shift deficit.
              </p>
            </div>

            {/* Card 06 */}
            <div className="bg-[#EEF2F4] border border-[#CBD6DE] rounded-xl p-5 shadow-xs space-y-3 hover:border-[#EFA900] transition-colors group">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-white text-[#D99600] flex items-center justify-center border border-[#CBD6DE] font-bold text-xs">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#5F7180]">06</span>
              </div>
              <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#D99600] transition-colors">
                Decision Support
              </h3>
              <p className="text-xs text-[#5F7180] leading-relaxed">
                Human-in-the-loop governance queue providing prescriptive shift mitigation protocols, expected recovery tonnages, and managerial audit notes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. OPERATIONAL DATA-FLOW SECTION ── */}
      <section id="data-flow" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        <div className="space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono uppercase font-bold text-[#2878A8] tracking-wider">
              Data Pipeline &bull; Operational Execution
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] tracking-tight">
              End-to-End Operational Intelligence Flow
            </h2>
            <p className="text-xs sm:text-sm text-[#5F7180]">
              From raw telemetry ingestion to prescriptive shift manager authorization.
            </p>
          </div>

          {/* Horizontal Pipeline Steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="bg-white border border-[#CBD6DE] rounded-xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-[10px] font-mono text-[#2878A8] font-bold block">STEP 1</span>
              <div className="text-xs font-bold text-[#172B3A]">Mining Data</div>
              <div className="text-[10px] text-[#5F7180]">Sensors, HEMM, IMD Weather</div>
            </div>

            <div className="bg-white border border-[#CBD6DE] rounded-xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-[10px] font-mono text-[#2878A8] font-bold block">STEP 2</span>
              <div className="text-xs font-bold text-[#172B3A]">Data Fusion</div>
              <div className="text-[10px] text-[#5F7180]">FastAPI ETL &amp; Quality Audit</div>
            </div>

            <div className="bg-white border border-[#CBD6DE] rounded-xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-[10px] font-mono text-[#D99600] font-bold block">STEP 3</span>
              <div className="text-xs font-bold text-[#172B3A]">AI / ML Models</div>
              <div className="text-[10px] text-[#5F7180]">GradientBoosting &amp; Kriging</div>
            </div>

            <div className="bg-white border border-[#CBD6DE] rounded-xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-[10px] font-mono text-[#C94B4B] font-bold block">STEP 4</span>
              <div className="text-xs font-bold text-[#172B3A]">Risk Intelligence</div>
              <div className="text-[10px] text-[#5F7180]">4-Factor Weighted Engine</div>
            </div>

            <div className="bg-white border border-[#CBD6DE] rounded-xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-[10px] font-mono text-[#16866A] font-bold block">STEP 5</span>
              <div className="text-xs font-bold text-[#172B3A]">Decision Support</div>
              <div className="text-[10px] text-[#5F7180]">Prescriptive Protocols</div>
            </div>

            <div className="bg-white border border-[#CBD6DE] rounded-xl p-3.5 text-center space-y-1 shadow-xs">
              <span className="text-[10px] font-mono text-[#172B3A] font-bold block">STEP 6</span>
              <div className="text-xs font-bold text-[#172B3A]">Mine Operations</div>
              <div className="text-[10px] text-[#5F7180]">Shift Authorization</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. PLATFORM METRICS SNAPSHOT STRIP ── */}
      <section className="py-10 bg-white border-y border-[#CBD6DE]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1 border-r border-[#CBD6DE]/60 last:border-0">
              <div className="text-3xl sm:text-4xl font-bold text-[#172B3A] font-mono">8</div>
              <div className="text-xs font-semibold text-[#5F7180]">MOIL Concessions Monitored</div>
              <div className="text-[10px] text-[#5F7180] font-mono">Madhya Pradesh &amp; Maharashtra</div>
            </div>

            <div className="space-y-1 border-r border-[#CBD6DE]/60 last:border-0">
              <div className="text-3xl sm:text-4xl font-bold text-[#2878A8] font-mono">37</div>
              <div className="text-xs font-semibold text-[#5F7180]">Extraction &amp; Geological Zones</div>
              <div className="text-[10px] text-[#5F7180] font-mono">Open-Pit &amp; Underground Benches</div>
            </div>

            <div className="space-y-1 border-r border-[#CBD6DE]/60 last:border-0">
              <div className="text-3xl sm:text-4xl font-bold text-[#16866A] font-mono">1,204</div>
              <div className="text-xs font-semibold text-[#5F7180]">Borehole Geological Logs</div>
              <div className="text-[10px] text-[#5F7180] font-mono">Assay Records Verified</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold text-[#D99600] font-mono">2,290</div>
              <div className="text-xs font-semibold text-[#5F7180]">Shift Production Records</div>
              <div className="text-[10px] text-[#5F7180] font-mono">Empirical Extraction Database</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. TECHNOLOGY & TRUST SECTION ── */}
      <section id="technology" className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        <div className="space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono uppercase font-bold text-[#2878A8] tracking-wider">
              Technical Specification
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] tracking-tight">
              Built for Integrated Mining Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-[#5F7180]">
              Combining spatial algorithms, machine learning models, and real-time telemetry into a unified enterprise workstation.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#CBD6DE] text-center space-y-1 shadow-xs">
              <Brain className="w-5 h-5 text-[#2878A8] mx-auto mb-1" />
              <div className="font-bold text-[#172B3A]">AI / ML Models</div>
              <div className="text-[10px] text-[#5F7180]">RandomForest &amp; GradientBoosting</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#CBD6DE] text-center space-y-1 shadow-xs">
              <Compass className="w-5 h-5 text-[#D99600] mx-auto mb-1" />
              <div className="font-bold text-[#172B3A]">Spatial GIS</div>
              <div className="text-[10px] text-[#5F7180]">Leaflet GeoJSON &amp; Vector Layers</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#CBD6DE] text-center space-y-1 shadow-xs">
              <Satellite className="w-5 h-5 text-[#16866A] mx-auto mb-1" />
              <div className="font-bold text-[#172B3A]">Satellite Sensors</div>
              <div className="text-[10px] text-[#5F7180]">Sentinel-2 &bull; Landsat-9 &bull; NASA FIRMS</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#CBD6DE] text-center space-y-1 shadow-xs">
              <TrendingUp className="w-5 h-5 text-[#2878A8] mx-auto mb-1" />
              <div className="font-bold text-[#172B3A]">Production Forecast</div>
              <div className="text-[10px] text-[#5F7180]">14-Day Trajectory Engine</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#CBD6DE] text-center space-y-1 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#C94B4B] mx-auto mb-1" />
              <div className="font-bold text-[#172B3A]">Operational Risk</div>
              <div className="text-[10px] text-[#5F7180]">4-Factor Vulnerability Scoring</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#CBD6DE] text-center space-y-1 shadow-xs">
              <Lightbulb className="w-5 h-5 text-[#D99600] mx-auto mb-1" />
              <div className="font-bold text-[#172B3A]">HITL Support</div>
              <div className="text-[10px] text-[#5F7180]">Shift Manager Authorization</div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 7. LANDING FOOTER ── */}
      <footer className="bg-white border-t border-[#CBD6DE] py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-[#5F7180]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-[#EFA900] flex items-center justify-center text-[#172B3A] font-bold">
              <Pickaxe className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-[#172B3A] tracking-tight">MOIL LIMITED</div>
              <div className="text-[10px]">Manganese Ore India Limited &bull; Govt. of India Enterprise</div>
            </div>
          </div>

          <div className="text-center sm:text-left text-[11px]">
            <span className="font-bold text-[#172B3A]">MOIL Mining Intelligence Platform</span>
            <span className="mx-2 font-mono">&bull;</span>
            <span>AI &bull; GIS &bull; Satellite &bull; Operations</span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <button onClick={() => scrollToSection('capabilities')} className="hover:text-[#172B3A] transition-colors">
              Capabilities
            </button>
            <button onClick={() => scrollToSection('technology')} className="hover:text-[#172B3A] transition-colors">
              Technology
            </button>
            <button onClick={onSignIn} className="text-[#2878A8] hover:underline">
              Sign In
            </button>
            <button onClick={onEnterPlatform} className="text-[#D99600] hover:underline font-bold">
              Enter Platform →
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
};
