import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { api } from '../../services/api';
import { MOIL_MINES, MoilMineInfo } from '../../data/constants';
import { Compass, Globe2, Layers, MapPin, Pickaxe, Flame } from 'lucide-react';
import { FirmsResponse } from '../../types';

interface MineMapProps {
  onZoneSelect?: (zoneId: string) => void;
  selectedZoneId?: string;
  selectedMineId?: string;
  center?: [number, number];
  onSelectMineId?: (mineId: string) => void;
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
  center,
  onSelectMineId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [showAllMines, setShowAllMines] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showPits, setShowPits] = useState(true);
  const [showReserves, setShowReserves] = useState(true);
  const [showFirms, setShowFirms] = useState(true);
  const [firmsData, setFirmsData] = useState<FirmsResponse | null>(null);
  const [basemapType, setBasemapType] = useState<'satellite' | 'streets'>('satellite');
  const [loadingLayers, setLoadingLayers] = useState(false);
  const [layerError, setLayerError] = useState<string | null>(null);

  const showAllMinesRef = useRef(showAllMines);
  showAllMinesRef.current = showAllMines;
  const showBoundaryRef = useRef(showBoundary);
  showBoundaryRef.current = showBoundary;
  const showPitsRef = useRef(showPits);
  showPitsRef.current = showPits;
  const showReservesRef = useRef(showReserves);
  showReservesRef.current = showReserves;
  const showFirmsRef = useRef(showFirms);
  showFirmsRef.current = showFirms;

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const pitsLayerRef = useRef<L.GeoJSON | null>(null);
  const reservesLayerRef = useRef<L.GeoJSON | null>(null);
  const allMinesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const firmsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Basemap Tile Providers
  const SATELLITE_TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const SATELLITE_ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; Esri &mdash; Earthstar Geographics';
  const STREETS_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const STREETS_ATTRIBUTION = '&copy; OpenStreetMap contributors';

  const centerLat = center?.[0];
  const centerLng = center?.[1];

  // Fit all MOIL mines across Central India
  const handleFitAllMines = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    // Bounding box encompassing Nagpur, Bhandara, and Balaghat concessions
    const allMinesBounds = L.latLngBounds(
      MOIL_MINES.map((m) => [m.lat, m.lon] as [number, number])
    );
    map.fitBounds(allMinesBounds, { padding: [50, 50], maxZoom: 12 });
  }, []);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = centerLat !== undefined && centerLng !== undefined
      ? [centerLat, centerLng]
      : (MINE_CENTERS[selectedMineId] || [21.8129, 80.1835]);

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    const initialTile = L.tileLayer(SATELLITE_TILE_URL, {
      maxZoom: 19,
      attribution: SATELLITE_ATTRIBUTION
    }).addTo(map);
    tileLayerRef.current = initialTile;

    // Create LayerGroup for all MOIL mines markers
    const allMinesGroup = L.layerGroup().addTo(map);
    allMinesLayerGroupRef.current = allMinesGroup;

    // Create LayerGroup for NASA FIRMS Thermal Anomalies
    const firmsGroup = L.layerGroup().addTo(map);
    firmsLayerGroupRef.current = firmsGroup;

    mapInstanceRef.current = map;

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

    if (boundaryLayerRef.current && showBoundaryRef.current) boundaryLayerRef.current.bringToFront();
    if (pitsLayerRef.current && showPitsRef.current) pitsLayerRef.current.bringToFront();
    if (reservesLayerRef.current && showReservesRef.current) reservesLayerRef.current.bringToFront();
  }, [basemapType]);

  // Render & update ALL MOIL Mines Markers on the map
  useEffect(() => {
    const group = allMinesLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!showAllMines) return;

    MOIL_MINES.forEach((mine) => {
      const isSelected = mine.id === selectedMineId;

      // Custom high-tech Leaflet DivIcon
      const markerHtml = `
        <div class="moil-mine-marker group" style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${isSelected ? '<div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(245, 158, 11, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 8px;
            background: ${isSelected ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #0284c7, #0369a1)'};
            border: 2px solid ${isSelected ? '#fef3c7' : '#e0f2fe'};
            box-shadow: 0 4px 12px ${isSelected ? 'rgba(245, 158, 11, 0.5)' : 'rgba(2, 132, 199, 0.4)'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0f172a;
            font-weight: 900;
            font-size: ${isSelected ? '14px' : '11px'};
            transition: transform 0.2s;
          ">
            ⛏️
          </div>
          <div style="
            margin-top: 4px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid ${isSelected ? '#f59e0b' : '#334155'};
            color: ${isSelected ? '#fbbf24' : '#e2e8f0'};
            font-size: 10px;
            font-weight: bold;
            font-family: sans-serif;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            letter-spacing: 0.3px;
          ">
            ${mine.name.replace(' Mine', '').replace(' Manganese Concession', '')}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'moil-custom-mine-pin',
        html: markerHtml,
        iconSize: [32, 48],
        iconAnchor: [16, 24],
        popupAnchor: [0, -26]
      });

      const marker = L.marker([mine.lat, mine.lon], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-family: monospace;">
              MOIL CONCESSION
            </span>
            <span style="font-size: 10px; font-weight: 600; color: #059669;">
              ● ${mine.status.split('—')[0].trim()}
            </span>
          </div>
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0f172a;">
            ${mine.name}
          </h3>
          <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 8px;">
            <div><b>Region:</b> ${mine.district}, ${mine.state}</div>
            <div><b>Concession ID:</b> <code style="background: #f1f5f9; padding: 1px 4px; border-radius: 3px; color: #0f172a;">${mine.id}</code></div>
            <div><b>Type:</b> ${mine.type}</div>
            <div><b>Annual Capacity:</b> ${mine.annual_capacity}</div>
            <div><b>Coordinates:</b> ${mine.lat.toFixed(4)}°N, ${mine.lon.toFixed(4)}°E</div>
          </div>
          <button
            id="popup-btn-select-${mine.id}"
            style="
              width: 100%;
              padding: 6px 12px;
              background: #f59e0b;
              color: #0f172a;
              border: none;
              border-radius: 6px;
              font-weight: 800;
              font-size: 11px;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              transition: background 0.15s;
            "
            onmouseover="this.style.background='#d97706'; this.style.color='#ffffff';"
            onmouseout="this.style.background='#f59e0b'; this.style.color='#0f172a';"
          >
            ${isSelected ? '✓ Current Active Concession' : 'Select & Focus Concession →'}
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-select-${mine.id}`);
        if (btn && onSelectMineId) {
          btn.onclick = () => {
            onSelectMineId(mine.id);
            marker.closePopup();
          };
        }
      });

      marker.addTo(group);
    });
  }, [showAllMines, selectedMineId, onSelectMineId]);

  // Load and refresh GeoJSON layers whenever selectedMineId changes
  const loadLayersForMine = useCallback(async (mineId: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setLoadingLayers(true);
    setLayerError(null);

    // 1. Remove previous polygon layers
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

  // Handle Layer Visibility Toggles
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

  // Fetch NASA FIRMS Hotspots for selected mine
  useEffect(() => {
    let isCancelled = false;
    const fetchFirms = async () => {
      try {
        const data = await api.getFirmsHotspots(selectedMineId);
        if (!isCancelled) {
          setFirmsData(data);
        }
      } catch (err) {
        console.warn('NASA FIRMS fetch notice:', err);
      }
    };
    fetchFirms();
    return () => {
      isCancelled = true;
    };
  }, [selectedMineId]);

  // Render NASA FIRMS Hotspot CircleMarkers
  useEffect(() => {
    const group = firmsLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (firmsData && firmsData.hotspots && firmsData.hotspots.length > 0) {
      firmsData.hotspots.forEach((h) => {
        const marker = L.circleMarker([h.latitude, h.longitude], {
          radius: 8,
          color: '#ea580c',
          fillColor: '#ef4444',
          fillOpacity: 0.85,
          weight: 2
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px; min-width: 190px;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="font-size: 14px;">🔥</span>
              <strong style="color: #dc2626; font-size: 13px;">NASA FIRMS Anomaly</strong>
            </div>
            <b>Distance to Mine:</b> ${h.distance_km.toFixed(2)} km<br/>
            <b>Brightness (T21):</b> ${h.brightness_temperature_k ? h.brightness_temperature_k.toFixed(1) + ' K' : 'N/A'}<br/>
            <b>FRP:</b> ${h.frp ? h.frp.toFixed(1) + ' MW' : 'N/A'}<br/>
            <b>Confidence:</b> <span style="text-transform: capitalize; font-weight: bold; color: ${h.confidence === 'high' ? '#dc2626' : '#ea580c'}">${h.confidence}</span><br/>
            <b>Satellite:</b> ${h.satellite || 'VIIRS'} (${h.instrument || 'VIIRS'})<br/>
            <b>Detected:</b> ${h.acq_date} ${h.acq_time} (${h.daynight === 'D' ? 'Day' : 'Night'})<br/>
            <div style="margin-top: 4px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 3px;">
              NASA FIRMS Surface Observation (${h.distance_km <= 5 ? 'Near Concession' : 'Regional'})
            </div>
          </div>
        `);
        marker.addTo(group);
      });
    }
  }, [firmsData]);

  // Handle NASA FIRMS Layer Visibility Toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !firmsLayerGroupRef.current) return;
    if (showFirms) {
      if (!mapInstanceRef.current.hasLayer(firmsLayerGroupRef.current)) {
        mapInstanceRef.current.addLayer(firmsLayerGroupRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(firmsLayerGroupRef.current)) {
        mapInstanceRef.current.removeLayer(firmsLayerGroupRef.current);
      }
    }
  }, [showFirms]);

  const activeMineObj = MOIL_MINES.find((m) => m.id === selectedMineId) || MOIL_MINES[0];

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex flex-col">
      {/* Top Concession Navigation Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto z-10 scrollbar-none">
        <div className="flex items-center space-x-1.5 shrink-0">
          <Pickaxe className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-white uppercase tracking-wider shrink-0">
            MOIL Mines ({MOIL_MINES.length}):
          </span>
        </div>

        {/* Quick Mine Selection Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          {MOIL_MINES.map((m) => {
            const isSel = m.id === selectedMineId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMineId?.(m.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
                  isSel
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span>{m.name.replace(' Mine', '').replace(' Manganese Concession', '')}</span>
                <span className={`text-[10px] ${isSel ? 'text-slate-900' : 'text-slate-400'}`}>
                  ({m.state === 'Madhya Pradesh' ? 'MP' : 'MH'})
                </span>
              </button>
            );
          })}
        </div>

        {/* Fit All Mines Button */}
        <button
          type="button"
          onClick={handleFitAllMines}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 text-xs font-bold whitespace-nowrap flex items-center space-x-1 shrink-0 transition-colors shadow"
          title="Fit all 10 MOIL mines across Madhya Pradesh and Maharashtra"
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Fit All Mines</span>
        </button>
      </div>

      {/* Map Display Container */}
      <div className="relative flex-1 w-full h-full min-h-[420px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Loading Status Indicator */}
        {loadingLayers && (
          <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur border border-amber-500/40 rounded-lg px-3 py-1.5 shadow-xl text-xs flex items-center space-x-2 text-amber-300">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-400" />
            <span className="font-mono text-[11px]">Updating GIS layers for {activeMineObj.name}...</span>
          </div>
        )}

        {/* Layer Error Notification */}
        {layerError && (
          <div className="absolute top-3 left-3 z-[1000] bg-rose-950/90 backdrop-blur border border-rose-700/80 rounded-lg px-3 py-1.5 shadow-xl text-xs text-rose-300 flex items-center space-x-2">
            <span>{layerError}</span>
          </div>
        )}

        {/* Floating Layer Controls */}
        <div className="absolute top-3 right-3 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-2 max-w-[200px]">
          <div className="font-bold text-white pb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              GIS Layers
            </span>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-amber-400 text-slate-200">
            <input
              type="checkbox"
              checked={showAllMines}
              onChange={(e) => setShowAllMines(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="font-medium">All MOIL Mines ({MOIL_MINES.length})</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-amber-400 text-slate-300">
            <input
              type="checkbox"
              checked={showBoundary}
              onChange={(e) => setShowBoundary(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-0"
            />
            <span>Mine Lease Boundary</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-blue-400 text-slate-300">
            <input
              type="checkbox"
              checked={showPits}
              onChange={(e) => setShowPits(e.target.checked)}
              className="rounded border-slate-700 text-blue-500 focus:ring-0"
            />
            <span>Operational Benches</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-emerald-400 text-slate-300">
            <input
              type="checkbox"
              checked={showReserves}
              onChange={(e) => setShowReserves(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>Reserve AI Heatmap</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-orange-400 text-slate-300">
            <input
              type="checkbox"
              checked={showFirms}
              onChange={(e) => setShowFirms(e.target.checked)}
              className="rounded border-slate-700 text-orange-500 focus:ring-0"
            />
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>NASA FIRMS Hotspots {firmsData?.hotspot_count !== undefined ? `(${firmsData.hotspot_count})` : ''}</span>
            </span>
          </label>

          {/* Basemap Style Switcher */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
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
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-3 py-2 shadow-xl text-[11px] flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 flex items-center justify-center text-[8px] text-slate-950 font-bold">⛏️</span>
            <span className="text-slate-300">MOIL Mine Location</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">High Grade Reserve (&gt;75%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
            <span className="text-slate-300">Medium Reserve (50-75%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
            <span className="text-slate-300">Low Reserve (&lt;50%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block border border-rose-500"></span>
            <span className="text-slate-300">NASA Thermal Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
