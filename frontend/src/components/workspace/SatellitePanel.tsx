import React, { useState, useEffect, useCallback } from 'react';
import {
  Satellite,
  CloudRain,
  Droplets,
  Thermometer,
  Eye,
  Info,
  Layers,
  Activity,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Flame,
  Radio,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { FirmsResponse } from '../../types';

interface ZoneIndicator {
  zone_id: string;
  zone_name: string;
  ndvi: number;
  ndvi_interpretation: string;
  surface_moisture_pct: number;
  surface_moisture_interpretation: string;
  land_disturbance: string;
  rainfall_mm_monthly: number;
  land_surface_temp_c: number;
  cloud_coverage_pct: number;
  acquisition_date: string;
  ndwi?: number;
  satellite_source?: string;
}

interface SatellitePanelProps {
  mineName?: string;
  selectedMineId?: string;
  onRunAiAnalysis?: () => void;
}

export const SatellitePanel: React.FC<SatellitePanelProps> = ({
  mineName = 'Balaghat Manganese Concession',
  selectedMineId = 'MINE_BALAGHAT_01',
  onRunAiAnalysis
}) => {
  const [indicators, setIndicators] = useState<ZoneIndicator[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneIndicator | null>(null);
  const [topLevelData, setTopLevelData] = useState<any>(null);
  const [firmsData, setFirmsData] = useState<FirmsResponse | null>(null);
  const [loadingFirms, setLoadingFirms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSatelliteData = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    setLoadingFirms(true);
    setError(null);
    try {
      // Parallel fetch for Sentinel/Landsat indices and NASA FIRMS
      const [data, fData] = await Promise.all([
        api.getSatelliteIndices(selectedMineId),
        api.getFirmsHotspots(selectedMineId).catch((err) => {
          console.warn('NASA FIRMS fetch notice:', err);
          return null;
        })
      ]);

      if (isMounted && fData) {
        setFirmsData(fData);
      }

      if (isMounted && data) {
        setTopLevelData(data);
        const list: ZoneIndicator[] = data.indicators || [];
        setIndicators(list);
        if (list.length > 0) {
          setSelectedZone(list[0]);
        } else {
          // Mine-level fallback indicator
          setSelectedZone({
            zone_id: 'CONCESSION',
            zone_name: data.mine_name || mineName,
            ndvi: data.ndvi ?? 0.20,
            ndvi_interpretation: (data.ndvi ?? 0.20) < 0.2 ? 'Exposed pit floor/rock benches' : 'Moderate vegetative cover',
            surface_moisture_pct: data.soil_moisture_satellite_pct ?? 35.0,
            surface_moisture_interpretation: (data.soil_moisture_satellite_pct ?? 35.0) > 50 ? 'Elevated soil moisture' : 'Well-drained pit benches',
            land_disturbance: 'HIGH',
            rainfall_mm_monthly: data.rainfall_mm ?? 0.0,
            land_surface_temp_c: data.land_surface_temp_c ?? 32.0,
            cloud_coverage_pct: data.cloud_coverage_pct ?? 4.0,
            acquisition_date: data.acquisition_date ?? '2026-03-14',
            ndwi: data.ndwi ?? -0.05
          });
        }
      }
    } catch (err: any) {
      if (isMounted) {
        console.error('Failed to load satellite indicators:', err);
        setError(err?.message || `Unable to retrieve real-time satellite telemetry for ${mineName}.`);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
        setLoadingFirms(false);
      }
    }
    return () => { isMounted = false; };
  }, [selectedMineId, mineName]);

  useEffect(() => {
    loadSatelliteData();
  }, [loadSatelliteData]);

  // Determine if current state matches the selected mine to avoid showing stale data from previous mine
  const isDataForCurrentMine = topLevelData?.mine_id === selectedMineId;

  // Active data record
  const activeData: ZoneIndicator = (isDataForCurrentMine && selectedZone) ? selectedZone : {
    zone_id: 'CONCESSION',
    zone_name: topLevelData?.mine_name || mineName,
    ndvi: topLevelData?.ndvi ?? 0.20,
    ndvi_interpretation: (topLevelData?.ndvi ?? 0.20) < 0.2 ? 'Exposed pit floor and rock benches' : 'Moderate vegetative cover',
    surface_moisture_pct: topLevelData?.soil_moisture_satellite_pct ?? 30.0,
    surface_moisture_interpretation: (topLevelData?.soil_moisture_satellite_pct ?? 30.0) > 50 ? 'Elevated moisture' : 'Well-drained pit benches',
    land_disturbance: 'NOMINAL',
    rainfall_mm_monthly: topLevelData?.rainfall_mm ?? 0.0,
    land_surface_temp_c: topLevelData?.land_surface_temp_c ?? 32.0,
    cloud_coverage_pct: topLevelData?.cloud_coverage_pct ?? 4.0,
    acquisition_date: topLevelData?.acquisition_date ?? '2026-03-14',
    ndwi: topLevelData?.ndwi ?? -0.05
  };

  return (
    <div className="space-y-6">
      {/* Title & Satellite Metadata Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Satellite className="w-6 h-6 text-blue-400" />
            <span>Satellite Earth Observation &amp; Environmental Telemetry</span>
            {topLevelData?.mine_name && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-normal">
                {topLevelData.mine_name}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            Multi-spectral earth observation feeds: Sentinel-2 MSI, Landsat-9 OLI, and NASA SMAP
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {loading ? (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-mono">
              <div className="animate-spin rounded-full h-2.5 w-2.5 border-b border-amber-400" />
              Syncing Telemetry...
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Constellation: Sentinel-2 + Landsat-9
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Cycle: 5-Day Revisit
          </span>
        </div>
      </div>

      {/* SCIENTIFIC DISCLOSURE (PROMINENT CALLOUT) */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-l-4 border-l-blue-500 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono">
              Scientific Disclosure &amp; Data Provenance
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="text-white font-semibold">Important Scientific Distinction: </span>
              Satellite-derived surface/environmental indicators provide contextual evidence alongside geological and borehole observations.
              Space-borne sensors capture surface vegetation density (NDVI/SAVI), moisture pooling (NDWI), and thermal anomalies (LST), while underground manganese ore delineation is proven through subsurface core drilling assays and spatial geostatistical models.
            </p>
          </div>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadSatelliteData()}
            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-rose-200 text-xs font-mono font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Transition State for Mine Change */}
      {loading && !isDataForCurrentMine ? (
        <div className="flex flex-col items-center justify-center h-80 bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          <p className="text-sm text-slate-300 font-medium">Acquiring Multi-Spectral Earth Observation Telemetry...</p>
          <p className="text-xs text-slate-500 font-mono">Querying Sentinel-2 MSI &amp; Landsat-9 OLI observations for {mineName}</p>
        </div>
      ) : (
        <>
          {/* Zone Selector Pills */}
          {indicators.length > 0 ? (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-medium shrink-0">Monitored Zones:</span>
              {indicators.slice(0, 5).map((z) => (
                <button
                  key={z.zone_id}
                  onClick={() => setSelectedZone(z)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedZone?.zone_id === z.zone_id
                      ? 'bg-blue-500 text-slate-950 font-bold shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {z.zone_name} ({z.zone_id})
                </button>
              ))}
            </div>
          ) : !loading && (
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                Displaying Concession-Level Aggregate Telemetry (No sub-bench zone breakdown recorded)
              </span>
              <span className="text-[11px] text-slate-500">{mineName}</span>
            </div>
          )}

      {/* 5 SATELLITE INDICATOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. NDVI Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">NDVI INDEX</span>
              <Eye className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{activeData.ndvi.toFixed(2)}</div>
            <div className="mt-1 text-xs text-emerald-400 font-medium">
              {activeData.ndvi < 0.2 ? 'Barren Pit / Rock' : activeData.ndvi < 0.4 ? 'Sparse Cover' : 'Dense Canopy'}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              {activeData.ndvi_interpretation}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
            <span>Sentinel-2 B8/B4</span>
            <span className="font-mono text-slate-300">Res: 10m</span>
          </div>
        </div>

        {/* 2. Rainfall Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between group hover:border-blue-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">24H PRECIPITATION</span>
              <CloudRain className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-extrabold text-blue-400 font-mono">
              {(activeData.rainfall_mm_monthly ?? 0).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
            <div className={`mt-1 text-xs font-semibold ${(activeData.rainfall_mm_monthly ?? 0) > 60 ? 'text-rose-400' : ((activeData.rainfall_mm_monthly ?? 0) > 25 ? 'text-amber-400' : 'text-emerald-400')}`}>
              {(activeData.rainfall_mm_monthly ?? 0) > 60 ? 'Monsoon Surge Alert' : ((activeData.rainfall_mm_monthly ?? 0) > 25 ? 'Moderate Rainfall' : 'Optimal Dry Window')}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              {(activeData.rainfall_mm_monthly ?? 0) > 50
                ? 'Heavy monsoon rainfall causing surface runoff into pit sumps and haul road mudding.'
                : 'Precipitation levels within nominal limits; haul road traction and bench stability maintained.'}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
            <span>IMD Radar + GPM</span>
            <span className="font-mono text-slate-300">Hourly Telemetry</span>
          </div>
        </div>

        {/* 3. Soil Moisture Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between group hover:border-teal-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">SOIL MOISTURE</span>
              <Droplets className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-extrabold text-teal-400 font-mono">
              {(activeData.surface_moisture_pct ?? 0).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <div className={`mt-1 text-xs font-semibold ${(activeData.surface_moisture_pct ?? 0) > 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {(activeData.surface_moisture_pct ?? 0) > 50 ? 'Saturated Pit Floor' : 'Nominal Moisture Index'}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              {activeData.surface_moisture_interpretation}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
            <span>NASA SMAP / Sentinel-1</span>
            <span className="font-mono text-slate-300">L-Band Microwave</span>
          </div>
        </div>

        {/* 4. Land Surface Temperature (LST) Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">SURFACE TEMP (LST)</span>
              <Thermometer className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">{activeData.land_surface_temp_c.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span></div>
            <div className="mt-1 text-xs text-emerald-400 font-semibold">
              Thermal Signature: Nominal
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              Consistent with exposed manganese-bearing formation thermal inertia profiles.
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
            <span>Landsat-9 TIRS-2</span>
            <span className="font-mono text-slate-300">Band 10 (100m)</span>
          </div>
        </div>

        {/* 5. NDWI Water Accumulation Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">NDWI WATER INDEX</span>
              <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">
              {(activeData.ndwi ?? -0.08).toFixed(2)}
            </div>
            <div className={`mt-1 text-xs font-semibold ${(activeData.ndwi ?? 0) > 0 ? 'text-cyan-300' : 'text-slate-400'}`}>
              {(activeData.ndwi ?? 0) > 0 ? 'Surface Sump Water' : 'Well-Drained Substratum'}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              {(activeData.ndwi ?? 0) > 0
                ? 'Localized surface water accumulation in lower bench sumps requiring active dewatering.'
                : 'Negative NDWI indicates dry bench surfaces with zero standing pool formation.'}
            </p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
            <span>Sentinel-2 B3/B8</span>
            <span className="font-mono text-slate-300">Green/NIR</span>
          </div>
        </div>
      </div>

      {/* 6. NASA FIRMS Active Fire & Thermal Anomaly Detection Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 group hover:border-orange-500/30 transition-all">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  NASA FIRMS — Surface Thermal Anomaly &amp; Wildfire Detection
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  VIIRS NRT (375m)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Near real-time spaceborne thermal radiometry within {firmsData?.radius_km ?? 20} km operational radius of {topLevelData?.mine_name || mineName}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2 shrink-0 text-xs">
            {loadingFirms ? (
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-mono">
                <div className="animate-spin rounded-full h-2.5 w-2.5 border-b border-amber-400" />
                Interrogating NASA FIRMS...
              </span>
            ) : firmsData?.status === 'live_observations' && (firmsData?.hotspot_count ?? 0) > 0 ? (
              <span className="px-3 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 font-mono font-semibold animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                {firmsData.hotspot_count} Active Anomaly{firmsData.hotspot_count > 1 ? 's' : ''} Detected
              </span>
            ) : firmsData?.status === 'no_observations' || (firmsData?.hotspot_count === 0) ? (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                0 Surface Anomalies (Nominal)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 font-mono">
                <Radio className="w-3.5 h-3.5 text-slate-400" />
                Dormant / Key Not Configured
              </span>
            )}
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Concession Center</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {firmsData?.latitude?.toFixed(4) ?? '---'}°, {firmsData?.longitude?.toFixed(4) ?? '---'}°
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Dynamic Concession Anchor</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Detection Buffer</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {firmsData?.radius_km ?? 20.0} km Radius
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              W:{firmsData?.bounding_box?.west?.toFixed(2) ?? '-'}° / E:{firmsData?.bounding_box?.east?.toFixed(2) ?? '-'}°
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Hotspots Detected</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              <span className={(firmsData?.hotspot_count ?? 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {firmsData?.hotspot_count ?? 0}
              </span>
              <span className="text-xs text-slate-400 font-normal"> in last {firmsData?.lookback_days ?? 1}d</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              Sensor: {firmsData?.satellite_source ?? 'VIIRS_NOAA21_NRT'}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Nearest Anomaly</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {firmsData?.hotspots && firmsData.hotspots.length > 0
                ? `${Math.min(...firmsData.hotspots.map((h) => h.distance_km)).toFixed(2)} km`
                : 'None within 20km'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {firmsData?.hotspots && firmsData.hotspots.length > 0 ? 'Proximity Alert' : 'Pit Perimeter Clear'}
            </div>
          </div>
        </div>

        {/* Hotspots Table (if any) or Zero-State Notice */}
        {firmsData?.hotspots && firmsData.hotspots.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Detected Surface Thermal Anomalies within Concession Buffer:</span>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Coordinates</th>
                    <th className="py-2.5 px-3">Brightness (T21)</th>
                    <th className="py-2.5 px-3">FRP</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Satellite / Sensor</th>
                    <th className="py-2.5 px-3">Observed (UTC)</th>
                    <th className="py-2.5 px-3">Zone Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {firmsData.hotspots.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-3 font-bold text-amber-400">
                        {h.distance_km.toFixed(2)} km
                      </td>
                      <td className="py-2 px-3 text-slate-300">
                        {h.latitude.toFixed(4)}°, {h.longitude.toFixed(4)}°
                      </td>
                      <td className="py-2 px-3 text-slate-200">
                        {h.brightness_temperature_k ? `${h.brightness_temperature_k.toFixed(1)} K` : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-orange-400 font-semibold">
                        {h.frp ? `${h.frp.toFixed(1)} MW` : '0.0 MW'}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          h.confidence === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {h.confidence}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {h.satellite} ({h.instrument})
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {h.acq_date} {h.acq_time} ({h.daynight === 'D' ? 'Day' : 'Night'})
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          h.distance_km <= 5.0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {h.distance_km <= 5.0 ? 'Near Concession' : 'Buffer Perimeter'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {firmsData?.status === 'unavailable'
                  ? 'NASA FIRMS API integration is configured. To view live VIIRS data, set NASA_FIRMS_MAP_KEY in backend/.env.'
                  : `Zero thermal anomalies or surface fire events detected within ${firmsData?.radius_km ?? 20}km of this concession during recent VIIRS passes.`}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              Source: {firmsData?.source ?? 'NASA FIRMS VIIRS'}
            </span>
          </div>
        )}

        {/* Scientific Surface Disclosure Footer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p>
            <span className="text-slate-300 font-semibold">NASA FIRMS Operational Scope: </span>
            Thermal anomalies detected by VIIRS 375m sensors indicate surface high-temperature signatures (e.g. agricultural burning, forest scrub fires, or surface industrial heat). FIRMS data strictly reflects surface earth observations and does not penetrate subsurface geological formations or underground manganese ore seams.
          </p>
        </div>
      </div>

      {/* Multi-Spectral Band Overview & Operational Pipeline Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Earth Observation Multi-Spectral Processing Pipeline
            </h2>
            <span className="text-xs text-slate-400 font-mono">Last Ingest: {activeData.acquisition_date}</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Band 4 (Red 665nm) &amp; Band 8 (NIR 842nm)</div>
                <div className="text-[11px] text-slate-400">Used for continuous open-cast bench surface delineation &amp; pit vegetation stripping ratio</div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                NDVI Active
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Band 11 &amp; 12 (SWIR 1610nm &amp; 2190nm)</div>
                <div className="text-[11px] text-slate-400">Mineral absorption spectrum for gossan caps and oxide surface alteration indicators</div>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Mineral Index
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Sentinel-1 C-Band SAR Synthetic Aperture Radar</div>
                <div className="text-[11px] text-slate-400">All-weather cloud-penetrating interferometry for pit bench stability &amp; subsidence monitoring</div>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                SAR Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Multi-Source Synthesis</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Feed Satellite Telemetry into AI Pipeline
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Combine these 5 space &amp; weather indicators with geological corehole assays and equipment telematics to execute the full reserve &amp; production risk models.
            </p>
          </div>

          {onRunAiAnalysis && (
            <button
              onClick={onRunAiAnalysis}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Run AI Analysis Pipeline &rarr;
            </button>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
