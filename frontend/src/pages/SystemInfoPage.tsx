import React from 'react';
import {
  Cpu,
  Layers,
  TrendingUp,
  AlertTriangle,
  Globe2,
  Database,
  ExternalLink,
  CheckCircle2,
  Server,
  Activity,
  ShieldCheck,
  Code2,
  FileCode
} from 'lucide-react';

export const SystemInfoPage: React.FC = () => {
  const subsystems = [
    {
      title: 'Subsurface Geological & Reserve Engine',
      category: 'AI / ML MODELS',
      icon: Layers,
      color: 'text-[#C47A00]',
      bgColor: 'bg-[#F1F0EB]',
      scope: 'ai_ml/reserve_prediction/, ai_ml/models/',
      description:
        'Random Forest classifier paired with spatial Ordinary Kriging on borehole assays (Mn%, Fe%, SiO2%, depth, lithology). Enforces strict exploratory isolation to prevent operational leakage.',
      endpoints: ['POST /api/reserves/predict', 'GET /api/reserves']
    },
    {
      title: 'Daily Extraction & Shortfall Forecaster',
      category: 'AI / ML MODELS',
      icon: TrendingUp,
      color: 'text-[#2878A8]',
      bgColor: 'bg-[#F1F0EB]',
      scope: 'ai_ml/production_prediction/',
      description:
        'Gradient Boosting regressor executing the 14 Canonical Feature Contract. Utilizes strictly shifted lag windows (t-1d, 7d-mean) to prevent temporal data leakage during extraction forecasting.',
      endpoints: ['POST /api/production/predict', 'GET /api/production/trend']
    },
    {
      title: 'Multi-Factor Risk & Transparent XAI Engine',
      category: 'DECISION ENGINE',
      icon: AlertTriangle,
      color: 'text-[#C94747]',
      bgColor: 'bg-[#F1F0EB]',
      scope: 'ai_ml/risk_prediction/, ai_ml/recommendation_engine/',
      description:
        'Domain-weighted composite risk evaluation across 4 operational pillars: Equipment Downtime (35%), Weather & Deluge (25%), Blasting Adherence (20%), and Production Deficit (20%) with mathematical factor attribution.',
      endpoints: ['POST /api/risk/predict', 'POST /api/recommendations/generate']
    },
    {
      title: 'GIS & Earth Observation Telemetry',
      category: 'SPATIAL INTELLIGENCE',
      icon: Globe2,
      color: 'text-[#16866A]',
      bgColor: 'bg-[#F1F0EB]',
      scope: 'gis/, data/geojson/, gis/satellite/',
      description:
        'Multi-mine concession boundary and pit bench vector layers across 8 MOIL mines. Ingests multispectral Sentinel-2 (NDVI, SAVI) and Landsat-9 (LST, mineral indices) telemetry for environmental context.',
      endpoints: ['GET /api/gis/layers', 'GET /api/gis/geojson/{layer}', 'GET /api/gis/satellite-indices']
    },
    {
      title: 'Backend API & Data Quality Audit Engine',
      category: 'DATA PIPELINE',
      icon: Database,
      color: 'text-[#2878A8]',
      bgColor: 'bg-[#F1F0EB]',
      scope: 'backend/app/, data_pipeline/, database/',
      description:
        'FastAPI asynchronous REST service with SQLAlchemy ORM (14 relational entities). Executes empirical quality audits measuring completeness, uniqueness, and temporal validity.',
      endpoints: ['GET /api/health', 'GET /api/dashboard', 'GET /api/data-quality', 'POST /api/pipeline/run']
    },
    {
      title: 'Visual Analytics & Governance Workspace',
      category: 'INFRASTRUCTURE',
      icon: Cpu,
      color: 'text-[#18324A]',
      bgColor: 'bg-[#F1F0EB]',
      scope: 'frontend/src/',
      description:
        'React 19 + TypeScript enterprise workspace featuring Leaflet spatial GIS, interactive SVG charts, What-If operational scenario simulator, and Human-in-the-Loop managerial review workflows.',
      endpoints: ['POST /api/recommendations/{id}/action', 'POST /api/simulation/run']
    }
  ];

  const systemSpecifications = [
    { label: 'Platform Core', value: 'FastAPI 0.115 + Python 3.11+' },
    { label: 'Frontend Engine', value: 'React 19 + TypeScript + Vite' },
    { label: 'Spatial Visualization', value: 'Leaflet 1.9 + GeoJSON Engine' },
    { label: 'Relational Database', value: 'PostgreSQL Staging / SQLite Embedded' },
    { label: 'Machine Learning', value: 'Scikit-Learn + Joblib Persistence' },
    { label: 'Earth Observation', value: 'Sentinel-2 MSI + Landsat-9 TIRS' },
    { label: 'Governance & Security', value: 'Manager Audit Logging & HITL' },
    { label: 'Deployment Strategy', value: 'Docker Multi-Stage & Cloud Blueprint' }
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE0DC] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F0EB] text-[#5F7487] border border-[#DDE0DC] flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#5F7487]" />
              SYSTEM ARCHITECTURE
            </span>
            <span className="text-xs text-[#5F7487]">Platform Infrastructure &amp; Technical Reference</span>
          </div>
          <h1 className="text-xl font-bold text-[#18324A] mt-1 flex items-center gap-2">
            <span>Platform Architecture &amp; Subsystem Specifications</span>
          </h1>
          <p className="text-xs text-[#5F7487] mt-0.5">
            Modular subsystem architecture, end-to-end data pipeline flow, AI/ML models, and enterprise API specifications.
          </p>
        </div>

        <a
          href="http://localhost:8000/api/docs"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-md bg-[#F2A900] hover:bg-[#D99400] text-[#18324A] font-semibold text-xs flex items-center space-x-1.5 shadow-card transition-colors self-start sm:self-auto"
        >
          <span>OpenAPI Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Visual End-to-End Architecture Flow */}
      <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-2">
          <h2 className="text-xs font-bold text-[#18324A] uppercase tracking-wider">
            End-to-End Architecture Data Flow
          </h2>
          <span className="text-[11px] text-[#16866A] font-mono font-semibold">Verified Operational Flow</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
          {/* Node 1 */}
          <div className="bg-[#F6F6F2] p-3 rounded border border-[#DDE0DC] text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#2878A8] uppercase block">1. Data Sources</span>
            <div className="text-xs font-bold text-[#18324A]">Sensors &amp; Logs</div>
            <div className="text-[10px] text-[#5F7487] leading-tight">Boreholes, HEMM, IMD Weather, Sentinel-2, FIRMS</div>
          </div>

          {/* Node 2 */}
          <div className="bg-[#F6F6F2] p-3 rounded border border-[#DDE0DC] text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#2878A8] uppercase block">2. Data Platform</span>
            <div className="text-xs font-bold text-[#18324A]">FastAPI Pipeline</div>
            <div className="text-[10px] text-[#5F7487] leading-tight">SQLAlchemy ORM, Quality Audit &amp; ETL Ingestion</div>
          </div>

          {/* Node 3 */}
          <div className="bg-[#F6F6F2] p-3 rounded border border-[#DDE0DC] text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#F2A900] uppercase block">3. AI / ML Engines</span>
            <div className="text-xs font-bold text-[#18324A]">Inference Chains</div>
            <div className="text-[10px] text-[#5F7487] leading-tight">RandomForest, GradientBoosting_14F, Kriging</div>
          </div>

          {/* Node 4 */}
          <div className="bg-[#F6F6F2] p-3 rounded border border-[#DDE0DC] text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#F2A900] uppercase block">4. Intelligence</span>
            <div className="text-xs font-bold text-[#18324A]">Analytical Insights</div>
            <div className="text-[10px] text-[#5F7487] leading-tight">Reserves (Mt), Shortfall (-180t), 4-Pillar Risk Score</div>
          </div>

          {/* Node 5 */}
          <div className="bg-[#F6F6F2] p-3 rounded border border-[#DDE0DC] text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#D99400] uppercase block">5. Decision Support</span>
            <div className="text-xs font-bold text-[#18324A]">HITL Prescriptions</div>
            <div className="text-[10px] text-[#5F7487] leading-tight">Action Protocols, Sandbox Simulations, Recovery Est.</div>
          </div>

          {/* Node 6 */}
          <div className="bg-[#F6F6F2] p-3 rounded border border-[#16866A] text-center space-y-1 bg-[#16866A]/5">
            <span className="text-[10px] font-mono font-bold text-[#16866A] uppercase block">6. Operator</span>
            <div className="text-xs font-bold text-[#18324A]">Mine Governance</div>
            <div className="text-[10px] text-[#5F7487] leading-tight">Shift Managers, Dispatchers &amp; Audit Trail</div>
          </div>
        </div>
      </div>

      {/* Subsystems Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub, i) => {
          const Icon = sub.icon;
          return (
            <div
              key={i}
              className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-4 shadow-card space-y-3 hover:border-[#8293A3] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-[#5F7487] px-1.5 py-0.5 rounded bg-[#F6F6F2] border border-[#DDE0DC]">
                    {sub.category}
                  </span>
                  <div className={`p-1 rounded ${sub.bgColor}`}>
                    <Icon className={`w-3.5 h-3.5 ${sub.color}`} />
                  </div>
                </div>
                <h3 className="font-bold text-xs text-[#18324A]">{sub.title}</h3>
                <p className="text-xs text-[#5F7487] mt-1 leading-relaxed">{sub.description}</p>
              </div>

              <div className="pt-2.5 border-t border-[#F1F0EB] space-y-1.5">
                <div className="text-[11px]">
                  <span className="text-[#8293A3] font-medium">Scope: </span>
                  <code className="text-[#18324A] font-mono text-[10px] bg-[#F6F6F2] px-1 py-0.5 rounded border border-[#DDE0DC]">
                    {sub.scope}
                  </code>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sub.endpoints.map((ep, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F6F6F2] text-[#5F7487] border border-[#DDE0DC]"
                    >
                      {ep}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infrastructure & Technical Stack Specifications */}
      <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-2.5">
          <h2 className="text-xs font-bold text-[#18324A] uppercase tracking-wider flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#16866A]" />
            Production Infrastructure &amp; Technical Baseline
          </h2>
          <span className="text-[11px] text-[#16866A] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A]" />
            Verified Environment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {systemSpecifications.map((spec, i) => (
            <div key={i} className="bg-[#F6F6F2] p-2.5 rounded border border-[#DDE0DC] space-y-0.5">
              <div className="text-[10px] text-[#8293A3] font-semibold uppercase">{spec.label}</div>
              <div className="text-xs font-semibold text-[#18324A] font-mono">{spec.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
