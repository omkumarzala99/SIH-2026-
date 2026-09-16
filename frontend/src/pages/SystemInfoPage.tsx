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
  Code2
} from 'lucide-react';

export const SystemInfoPage: React.FC = () => {
  const subsystems = [
    {
      title: 'Subsurface Geological & Reserve Engine',
      category: 'AI / ML CORE',
      icon: Layers,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      scope: 'ai_ml/reserve_prediction/, ai_ml/models/',
      description:
        'Random Forest classifier paired with spatial Ordinary Kriging on subsurface borehole assays (Mn%, Fe%, SiO2%, depth, lithology). Enforces strict exploratory isolation to prevent operational leakage.',
      endpoints: ['POST /api/reserves/predict', 'GET /api/reserves']
    },
    {
      title: 'Daily Extraction & Shortfall Forecaster',
      category: 'AI / ML CORE',
      icon: TrendingUp,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30',
      scope: 'ai_ml/production_prediction/',
      description:
        'Gradient Boosting regressor executing the 14 Canonical Feature Contract. Utilizes strictly shifted lag windows (t-1d, 7d-mean) to prevent temporal data leakage during extraction forecasting.',
      endpoints: ['POST /api/production/predict', 'GET /api/production/trend']
    },
    {
      title: 'Multi-Factor Risk & Transparent XAI Engine',
      category: 'DECISION ENGINE',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      scope: 'ai_ml/risk_prediction/, ai_ml/recommendation_engine/',
      description:
        'Domain-weighted composite risk evaluation across 4 operational pillars: Equipment Downtime (35%), Weather & Deluge (25%), Blasting Adherence (20%), and Production Deficit (20%) with mathematical factor attribution.',
      endpoints: ['POST /api/risk/predict', 'POST /api/recommendations/generate']
    },
    {
      title: 'GIS & Earth Observation Telemetry',
      category: 'SPATIAL INTELLIGENCE',
      icon: Globe2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      scope: 'gis/, data/geojson/, gis/satellite/',
      description:
        'Multi-mine concession boundary and pit bench vector layers across 8 MOIL mines. Ingests multispectral Sentinel-2 (NDVI, SAVI) and Landsat-9 (LST, mineral indices) telemetry for environmental context.',
      endpoints: ['GET /api/gis/layers', 'GET /api/gis/geojson/{layer}', 'GET /api/gis/satellite-indices']
    },
    {
      title: 'Backend API & Data Quality Audit Engine',
      category: 'DATA INFRASTRUCTURE',
      icon: Database,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      scope: 'backend/app/, data_pipeline/, database/',
      description:
        'FastAPI asynchronous REST service with SQLAlchemy ORM (14 relational entities). Executes non-fabricated empirical quality audits measuring completeness, uniqueness, and temporal validity.',
      endpoints: ['GET /api/health', 'GET /api/dashboard', 'GET /api/data-quality', 'POST /api/pipeline/run']
    },
    {
      title: 'Visual Analytics & Governance Workspace',
      category: 'FRONTEND / UX',
      icon: Cpu,
      color: 'text-amber-300',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      scope: 'frontend/src/',
      description:
        'React 19 + TypeScript workspace featuring Leaflet spatial GIS, interactive SVG charts, What-If operational scenario simulator, and Human-in-the-Loop managerial review workflows.',
      endpoints: ['POST /api/recommendations/{id}/action', 'POST /api/simulation/run']
    }
  ];

  const systemSpecifications = [
    { label: 'Platform Core', value: 'FastAPI 0.115 + Python 3.11+' },
    { label: 'Frontend Engine', value: 'React 19 + TypeScript + Vite' },
    { label: 'Spatial Visualization', value: 'Leaflet 1.9 + GeoJSON Vector Engine' },
    { label: 'Relational Database', value: 'PostgreSQL Staging / SQLite Embedded' },
    { label: 'Machine Learning', value: 'Scikit-Learn + Joblib Persistence' },
    { label: 'Earth Observation', value: 'Sentinel-2 MSI + Landsat-9 TIRS' },
    { label: 'Security & Audit', value: 'Audit Logging & Human-in-the-Loop Governance' },
    { label: 'Deployment Strategy', value: 'Docker Multi-Stage & Cloud Blueprint' }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            System Architecture &amp; Subsystem Specifications
          </h1>
          <p className="text-sm text-slate-400">
            Modular subsystem architecture, AI/ML intelligence pipeline, and enterprise data contracts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="http://localhost:8000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition-colors"
          >
            <span>OpenAPI Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Subsystems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub, i) => {
          const Icon = sub.icon;
          return (
            <div
              key={i}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-800">
                    {sub.category}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${sub.bgColor}`}>
                    <Icon className={`w-4 h-4 ${sub.color}`} />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-white">{sub.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{sub.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px]">
                  <span className="text-slate-400">Scope: </span>
                  <code className="text-amber-300 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">
                    {sub.scope}
                  </code>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sub.endpoints.map((ep, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
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

      {/* Architecture Specifications */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            Platform Infrastructure &amp; Technical Stack
          </h2>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {systemSpecifications.map((spec, i) => (
            <div key={i} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">{spec.label}</div>
              <div className="text-xs font-semibold text-white font-mono">{spec.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
