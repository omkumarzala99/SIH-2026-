import React from 'react';
import {
  Users,
  GitBranch,
  Terminal,
  Server,
  Layers,
  CheckCircle2,
  ExternalLink,
  Code2,
  BookOpen
} from 'lucide-react';

export const SystemInfoPage: React.FC = () => {
  const teamMembers = [
    {
      role: 'MEMBER 1: Project Lead & Integration Architect',
      branch: 'develop, release/*',
      folders: 'docs/, scripts/, tests/integration/, docker-compose.yml',
      responsibilities: 'Coordinates system architecture, git branch merging, CI/CD pipeline, and end-to-end hackathon demonstration flow.',
      tag: 'LEAD'
    },
    {
      role: 'MEMBER 2: Reserve Identification AI/ML Specialist',
      branch: 'feature/reserve-ml',
      folders: 'ai_ml/reserve_prediction/, ai_ml/models/',
      responsibilities: 'Develops sub-surface borehole classification models, grade estimation, and fusion with surface space indicators.',
      tag: 'AI/ML'
    },
    {
      role: 'MEMBER 3: Production & Risk AI/ML Specialist',
      branch: 'feature/production-risk',
      folders: 'ai_ml/production_prediction/, ai_ml/risk_prediction/, ai_ml/recommendation_engine/',
      responsibilities: 'Builds daily extraction regression forecasting, transparent multi-factor risk scoring, and prescriptive recommendation rules.',
      tag: 'AI/ML'
    },
    {
      role: 'MEMBER 4: GIS & Satellite / Space Specialist',
      branch: 'feature/gis',
      folders: 'gis/, data/geojson/, gis/satellite/',
      responsibilities: 'Processes GeoJSON concessions, active pit benches, Sentinel-2 NDVI / LST layers, and coordinates map layer queries.',
      tag: 'GIS'
    },
    {
      role: 'MEMBER 5: Backend & Data Pipeline Engineer',
      branch: 'feature/backend, feature/data-pipeline',
      folders: 'backend/, data_pipeline/, database/, data/',
      responsibilities: 'Constructs FastAPI REST routers, SQLAlchemy database models, data ingestion, cleaning, and quality audit engines.',
      tag: 'BACKEND'
    },
    {
      role: 'MEMBER 6: Frontend & UI/UX Designer',
      branch: 'feature/frontend',
      folders: 'frontend/',
      responsibilities: 'Builds React 18 TypeScript dashboard, Leaflet GIS map, interactive charts, and offline-resilient demo state.',
      tag: 'FRONTEND'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            6-Developer Parallel Workstream & Architecture Hub
          </h1>
          <p className="text-sm text-slate-400">
            Ownership boundaries, folder mapping, and Git branching rules for autonomous team execution
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

      {/* 6 Developer Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((m, i) => (
          <div
            key={i}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 hover:border-amber-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-mono font-bold text-amber-400">{m.tag}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {m.branch}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">{m.role}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.responsibilities}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400">Folder Scope: </span>
              <code className="text-amber-300 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">
                {m.folders}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Git Workflow Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            Standardized Git Branching & Merge Playbook
          </h2>
          <span className="text-xs text-slate-400 font-mono">develop &rarr; PR &rarr; main</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono text-[11px]">1</span>
              Create Feature Branch
            </div>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-amber-300 overflow-x-auto">
              git checkout develop{'\n'}
              git pull origin develop{'\n'}
              git checkout -b feature/your-module
            </pre>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[11px]">2</span>
              Commit & Verify Tests
            </div>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-amber-300 overflow-x-auto">
              python scripts/run_tests.py{'\n'}
              git commit -m &quot;feat: your change&quot;{'\n'}
              git push origin feature/your-module
            </pre>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[11px]">3</span>
              Pull Request & Integration
            </div>
            <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-amber-300 overflow-x-auto">
              Open PR &rarr; develop{'\n'}
              Review contract consistency{'\n'}
              Merge & auto-deploy
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
