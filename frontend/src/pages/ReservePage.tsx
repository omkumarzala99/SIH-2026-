import React, { useEffect, useState } from 'react';
import { Layers, Search, Sparkles, Filter, Database, Satellite, CheckCircle, Info } from 'lucide-react';
import { ReserveZone, BoreholeRecord } from '../types';
import { apiService } from '../services/api';
import { MineMap } from '../components/map/MineMap';

export const ReservePage: React.FC = () => {
  const [zones, setZones] = useState<ReserveZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ZONE_NORTH_A');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [evaluating, setEvaluating] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const list = await apiService.getReserves();
      setZones(list);
    };
    load();
  }, []);

  const selectedZone = zones.find(z => z.zone_id === selectedZoneId) || zones[0];

  const filteredZones = filterClass === 'ALL'
    ? zones
    : zones.filter(z => z.classification === filterClass);

  const handleRunInference = async () => {
    if (!selectedZone) return;
    setEvaluating(true);
    try {
      const res = await apiService.predictReserve({
        zone_id: selectedZone.zone_id,
        mn_grade_pct: selectedZone.estimated_mn_grade,
        fe_grade_pct: 6.2,
        sio2_pct: 12.5,
        depth_meters: 65.0,
        ndvi: selectedZone.ndvi_index
      });
      setPredictionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            Reserve Intelligence & Spatial Mapping
          </h1>
          <p className="text-sm text-slate-400">
            Surface and sub-surface manganese reserve classification powered by borehole lithology and Sentinel-2 satellite indices
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterClass === cls
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Top Split: Interactive Map & Zone Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaflet GIS Map */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Balaghat Manganese Concession Map</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                5 Geological Blocks
              </span>
            </div>
            <span className="text-xs text-slate-400">Click any zone polygon to inspect indicators</span>
          </div>

          <div className="h-[420px] w-full">
            <MineMap
              selectedZoneId={selectedZoneId}
              onZoneSelect={(zid) => setSelectedZoneId(zid)}
            />
          </div>
        </div>

        {/* Right Col: Zone List & Classification Cards */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Operational Mining Zones</h2>
            <span className="text-xs text-slate-400 font-mono">{filteredZones.length} Zones Listed</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {filteredZones.map((z) => {
              const isSelected = z.zone_id === selectedZoneId;
              const badgeBg =
                z.classification === 'HIGH'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : z.classification === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

              return (
                <div
                  key={z.zone_id}
                  onClick={() => setSelectedZoneId(z.zone_id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{z.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeBg}`}>
                      {z.classification}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-400">
                    <div>
                      Reserve Prob:{' '}
                      <span className="font-bold text-slate-200 font-mono">{(z.reserve_probability * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      Mn Grade: <span className="font-bold text-slate-200 font-mono">{z.estimated_mn_grade}% Mn</span>
                    </div>
                    <div>
                      Estimated:{' '}
                      <span className="font-bold text-slate-200 font-mono">{(z.estimated_tonnage / 1000).toFixed(0)}k t</span>
                    </div>
                    <div>
                      Confidence:{' '}
                      <span className="font-bold text-slate-200 font-mono">{(z.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRunInference}
            disabled={evaluating}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{evaluating ? 'Running AI Model Inference...' : `Re-evaluate ${selectedZone?.name || 'Zone'}`}</span>
          </button>
        </div>
      </div>

      {/* Selected Zone Deep Dive: Surface Indicators vs Sub-Surface Boreholes */}
      {selectedZone && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
            <div>
              <span className="text-xs font-mono text-amber-400 font-bold">{selectedZone.zone_id}</span>
              <h2 className="text-lg font-bold text-white">{selectedZone.name} — Geological & Remote Sensing Profile</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                Model: Reserve_ML_v1.0
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {selectedZone.classification} POTENTIAL
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subsurface Lithology */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Lithological Formation
              </div>
              <div className="text-base font-bold text-white">{selectedZone.formation}</div>
              <div className="text-xs text-slate-400 mt-2">
                Primary manganese lode associated with gondite & quartzite contact horizons.
              </div>
            </div>

            {/* Assay Grade Estimation */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                Assay Grade & Purity
              </div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {selectedZone.estimated_mn_grade}% Mn
              </div>
              <div className="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Fe Grade: 6.2%</span>
                <span>SiO2: 12.5%</span>
              </div>
            </div>

            {/* Satellite Space Indicators */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Satellite className="w-3.5 h-3.5 text-blue-400" />
                Sentinel-2 Space Indices
              </div>
              <div className="text-xl font-extrabold text-blue-400 font-mono">
                NDVI: {selectedZone.ndvi_index}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Exposed pit bench reflectance indicative of stripped manganese reef.
              </div>
            </div>

            {/* Reserve Tonnage Estimation */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                Estimated Reserve Volume
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                {selectedZone.estimated_tonnage.toLocaleString()} tonnes
              </div>
              <div className="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Confidence: {(selectedZone.confidence * 100).toFixed(0)}%</span>
                <span className="text-amber-400">High Reliability</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
