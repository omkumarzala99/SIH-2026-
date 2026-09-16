import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { api } from '../../services/api';

interface MineMapProps {
  onZoneSelect?: (zoneId: string) => void;
  selectedZoneId?: string;
  selectedMineId?: string;
  center?: [number, number];
}

const MINE_CENTERS: Record<string, [number, number]> = {
  MINE_BALAGHAT_01: [21.8129, 80.1835],
  MINE_GUMGAON_02: [21.3854, 78.9812],
  MINE_TIRODI_03: [21.6836, 79.7247],
  MINE_DONGRI_04: [21.5500, 79.6833],
  MINE_KANDRI_05: [21.4167, 79.2667],
  MINE_MANSAR_06: [21.4000, 79.2833],
  MINE_CHIKLA_07: [21.5667, 79.7667],
  MINE_UKWA_08: [21.9667, 80.4667]
};

export const MineMap: React.FC<MineMapProps> = ({
  onZoneSelect,
  selectedZoneId,
  selectedMineId = 'MINE_BALAGHAT_01',
  center
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [showBoundary, setShowBoundary] = useState(true);
  const [showPits, setShowPits] = useState(true);
  const [showReserves, setShowReserves] = useState(true);
  const [basemapType, setBasemapType] = useState<'satellite' | 'streets'>('satellite');
  const [loadingLayers, setLoadingLayers] = useState(false);
  const [layerError, setLayerError] = useState<string | null>(null);

  const showBoundaryRef = useRef(showBoundary);
  showBoundaryRef.current = showBoundary;
  const showPitsRef = useRef(showPits);
  showPitsRef.current = showPits;
  const showReservesRef = useRef(showReserves);
  showReservesRef.current = showReserves;

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const pitsLayerRef = useRef<L.GeoJSON | null>(null);
  const reservesLayerRef = useRef<L.GeoJSON | null>(null);

  // Basemap Tile Providers (Watermark-free public & configurable)
  const SATELLITE_TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const SATELLITE_ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; Esri &mdash; Earthstar Geographics';
  const STREETS_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const STREETS_ATTRIBUTION = '&copy; OpenStreetMap contributors';

  // Center coordinate primitives to avoid re-renders on new array references
  const centerLat = center?.[0];
  const centerLng = center?.[1];

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = centerLat !== undefined && centerLng !== undefined
      ? [centerLat, centerLng]
      : (MINE_CENTERS[selectedMineId] || [21.8129, 80.1835]);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    const initialTile = L.tileLayer(SATELLITE_TILE_URL, {
      maxZoom: 19,
      attribution: SATELLITE_ATTRIBUTION
    }).addTo(map);
    tileLayerRef.current = initialTile;

    mapInstanceRef.current = map;

    // Trigger invalidateSize to ensure correct tile rendering once mounted
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Basemap dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const isSat = basemapType === 'satellite';
    const tileUrl = isSat ? SATELLITE_TILE_URL : STREETS_TILE_URL;
    const tileAttr = isSat ? SATELLITE_ATTRIBUTION : STREETS_ATTRIBUTION;
    const newTile = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: tileAttr
    }).addTo(map);
    tileLayerRef.current = newTile;

    // Bring vector layers to front
    if (boundaryLayerRef.current && showBoundaryRef.current) boundaryLayerRef.current.bringToFront();
    if (pitsLayerRef.current && showPitsRef.current) pitsLayerRef.current.bringToFront();
    if (reservesLayerRef.current && showReservesRef.current) reservesLayerRef.current.bringToFront();
  }, [basemapType]);

  // Load and refresh GeoJSON layers whenever selectedMineId changes
  const loadLayersForMine = useCallback(async (mineId: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setLoadingLayers(true);
    setLayerError(null);

    // 1. Remove previous layers
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }
    if (pitsLayerRef.current) {
      map.removeLayer(pitsLayerRef.current);
      pitsLayerRef.current = null;
    }
    if (reservesLayerRef.current) {
      map.removeLayer(reservesLayerRef.current);
      reservesLayerRef.current = null;
    }

    // 2. Adjust map center to the active mine
    const targetCenter: [number, number] = centerLat !== undefined && centerLng !== undefined
      ? [centerLat, centerLng]
      : (MINE_CENTERS[mineId] || [21.8129, 80.1835]);
    map.setView(targetCenter, 14);

    try {
      // 3. Concession Boundary Layer
      const bData = await api.getGisGeoJson('mine_boundary', mineId);
      if (bData && bData.features && bData.features.length > 0) {
        const bLayer = L.geoJSON(bData, {
          style: {
            color: '#f59e0b',
            weight: 2.5,
            dashArray: '5, 5',
            fillColor: '#f59e0b',
            fillOpacity: 0.05
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                <strong style="color: #d97706;">${feature.properties?.name || 'Mine Concession Boundary'}</strong><br/>
                <b>Operator:</b> ${feature.properties?.operator || 'MOIL Limited'}<br/>
                <b>Lease Validity:</b> ${feature.properties?.lease_validity || '2045-12-31'}
              </div>
            `);
          }
        });
        boundaryLayerRef.current = bLayer;
        if (showBoundaryRef.current) bLayer.addTo(map);

        // Auto-fit bounds to boundary if valid
        try {
          const bounds = bLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
          }
        } catch {
          // ignore fit error
        }
      }

      // 4. Mining Zones / Operational Pits
      const pData = await api.getGisGeoJson('mining_zones', mineId);
      if (pData && pData.features && pData.features.length > 0) {
        const pLayer = L.geoJSON(pData, {
          style: (feature) => ({
            color: feature?.properties?.fill || '#3b82f6',
            weight: 2,
            fillColor: feature?.properties?.fill || '#3b82f6',
            fillOpacity: 0.25
          }),
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            layer.bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                <strong style="font-size: 13px;">${p.name || 'Mining Bench'}</strong><br/>
                <b>Status:</b> ${p.status || 'ACTIVE'}<br/>
                <b>Bench Level:</b> ${p.current_bench_level || 'N/A'}<br/>
                <b>Daily Target:</b> ${p.daily_target_tons || 0} tons<br/>
                <b>Active Units:</b> ${p.active_equipment_count || 0} machines
              </div>
            `);
            layer.on('click', () => {
              if (onZoneSelect && p.zone_id) onZoneSelect(p.zone_id);
            });
          }
        });
        pitsLayerRef.current = pLayer;
        if (showPitsRef.current) pLayer.addTo(map);
      }

      // 5. Reserve Intelligence Heatmap Layer
      const rData = await api.getGisGeoJson('reserve_zones', mineId);
      if (rData && rData.features && rData.features.length > 0) {
        const rLayer = L.geoJSON(rData, {
          style: (feature) => {
            const cls = feature?.properties?.classification;
            const color = cls === 'HIGH' ? '#10b981' : (cls === 'MEDIUM' ? '#eab308' : '#ef4444');
            return {
              color: color,
              weight: 2,
              fillColor: color,
              fillOpacity: 0.4
            };
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties || {};
            const prob = typeof p.reserve_probability === 'number' ? (p.reserve_probability * 100).toFixed(0) : '85';
            const conf = typeof p.confidence === 'number' ? (p.confidence * 100).toFixed(0) : '85';
            layer.bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                <strong style="color: #059669; font-size: 13px;">${p.name || 'Reserve Block'}</strong><br/>
                <b>Reserve Potential:</b> <span style="font-weight: bold; color: ${p.classification === 'HIGH' ? '#059669' : '#d97706'}">${p.classification || 'HIGH'} (${prob}%)</span><br/>
                <b>Estimated Reserve:</b> ${(p.estimated_tonnage || 0).toLocaleString()} tonnes<br/>
                <b>Manganese Grade:</b> ${p.avg_mn_grade_pct || 40.0}% Mn<br/>
                <b>Host Rock:</b> ${p.primary_formation || 'Sausar Group Gondite'}<br/>
                <b>Model Confidence:</b> ${conf}%
              </div>
            `);
            layer.on('click', () => {
              if (onZoneSelect && p.zone_id) onZoneSelect(p.zone_id);
            });
          }
        });
        reservesLayerRef.current = rLayer;
        if (showReservesRef.current) rLayer.addTo(map);
      }

      // Invalidate size once layers are fitted
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    } catch (err: any) {
      console.error(`Error loading GeoJSON layers for ${mineId}:`, err);
      setLayerError(`Failed to load vector layers for ${mineId}`);
    } finally {
      setLoadingLayers(false);
    }
  }, [onZoneSelect, centerLat, centerLng]);

  // Trigger layer load on mine change or initial load
  useEffect(() => {
    loadLayersForMine(selectedMineId);
  }, [selectedMineId, loadLayersForMine]);

  // Handle Layer Visibility Toggles (Instantaneous Leaflet toggle with zero re-fetching)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (boundaryLayerRef.current) {
      if (showBoundary) mapInstanceRef.current.addLayer(boundaryLayerRef.current);
      else mapInstanceRef.current.removeLayer(boundaryLayerRef.current);
    }
  }, [showBoundary]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (pitsLayerRef.current) {
      if (showPits) mapInstanceRef.current.addLayer(pitsLayerRef.current);
      else mapInstanceRef.current.removeLayer(pitsLayerRef.current);
    }
  }, [showPits]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (reservesLayerRef.current) {
      if (showReserves) mapInstanceRef.current.addLayer(reservesLayerRef.current);
      else mapInstanceRef.current.removeLayer(reservesLayerRef.current);
    }
  }, [showReserves]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading Status Indicator */}
      {loadingLayers && (
        <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur border border-amber-500/40 rounded-lg px-3 py-1.5 shadow-xl text-xs flex items-center space-x-2 text-amber-300">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-400" />
          <span className="font-mono text-[11px]">Updating GIS layers...</span>
        </div>
      )}

      {/* Layer Error Notification */}
      {layerError && (
        <div className="absolute top-3 left-3 z-[1000] bg-rose-950/90 backdrop-blur border border-rose-700/80 rounded-lg px-3 py-1.5 shadow-xl text-xs text-rose-300 flex items-center space-x-2">
          <span>{layerError}</span>
        </div>
      )}

      {/* Floating Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs space-y-1.5">
        <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">GIS Layer Controls</div>
        <label className="flex items-center space-x-2 cursor-pointer hover:text-amber-400 text-slate-300">
          <input
            type="checkbox"
            checked={showBoundary}
            onChange={(e) => setShowBoundary(e.target.checked)}
            className="rounded border-slate-700 text-amber-500 focus:ring-0"
          />
          <span>Mine Boundary</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer hover:text-blue-400 text-slate-300">
          <input
            type="checkbox"
            checked={showPits}
            onChange={(e) => setShowPits(e.target.checked)}
            className="rounded border-slate-700 text-blue-500 focus:ring-0"
          />
          <span>Operational Pits</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer hover:text-emerald-400 text-slate-300">
          <input
            type="checkbox"
            checked={showReserves}
            onChange={(e) => setShowReserves(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0"
          />
          <span>AI Reserve Heatmap</span>
        </label>

        {/* Basemap Style Switcher */}
        <div className="pt-2 mt-1 border-t border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Basemap View</div>
          <div className="grid grid-cols-2 gap-1 bg-slate-950/70 p-0.5 rounded border border-slate-800">
            <button
              type="button"
              onClick={() => setBasemapType('satellite')}
              className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                basemapType === 'satellite'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              type="button"
              onClick={() => setBasemapType('streets')}
              className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                basemapType === 'streets'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ Streets
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-3 py-2 shadow-xl text-[11px] flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
          <span className="text-slate-300">High Reserve (&gt;75%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
          <span className="text-slate-300">Medium (50-75%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
          <span className="text-slate-300">Low (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
};
