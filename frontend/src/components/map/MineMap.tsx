import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { api } from '../../services/api';
import { MOIL_MINES, MoilMineInfo } from '../../data/constants';
import { Compass, Globe2, Layers, MapPin, Pickaxe, Flame, ChevronRight, ChevronLeft, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
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
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [selectedMineDrawer, setSelectedMineDrawer] = useState<MoilMineInfo | null>(null);

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

  const activeLoadIdRef = useRef<number>(0);
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
      activeLoadIdRef.current++;
      clearTimeout(timer);
      if (allMinesLayerGroupRef.current) {
        allMinesLayerGroupRef.current.clearLayers();
        allMinesLayerGroupRef.current = null;
      }
      if (firmsLayerGroupRef.current) {
        firmsLayerGroupRef.current.clearLayers();
        firmsLayerGroupRef.current = null;
      }
      boundaryLayerRef.current = null;
      pitsLayerRef.current = null;
      reservesLayerRef.current = null;
      tileLayerRef.current = null;
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

      marker.on('click', () => {
        setSelectedMineDrawer(mine);
      });

      marker.addTo(group);
    });
  }, [showAllMines, selectedMineId, onSelectMineId]);

  // Load and refresh GeoJSON layers whenever selectedMineId changes
  const loadLayersForMine = useCallback(async (mineId: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const loadId = ++activeLoadIdRef.current;
    setLoadingLayers(true);
    setLayerError(null);

    // 1. Remove previous polygon layers safely
    if (boundaryLayerRef.current) {
      if (map.hasLayer(boundaryLayerRef.current)) {
        map.removeLayer(boundaryLayerRef.current);
      }
      boundaryLayerRef.current = null;
    }
    if (pitsLayerRef.current) {
      if (map.hasLayer(pitsLayerRef.current)) {
        map.removeLayer(pitsLayerRef.current);
      }
      pitsLayerRef.current = null;
    }
    if (reservesLayerRef.current) {
      if (map.hasLayer(reservesLayerRef.current)) {
        map.removeLayer(reservesLayerRef.current);
      }
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
      if (activeLoadIdRef.current !== loadId || !mapInstanceRef.current) return;

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
        if (showBoundaryRef.current && mapInstanceRef.current) {
          bLayer.addTo(mapInstanceRef.current);
        }

        try {
          const bounds = bLayer.getBounds();
          if (bounds.isValid() && mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
          }
        } catch {
          // ignore fit error
        }
      }

      // 4. Mining Zones / Operational Pits
      const pData = await api.getGisGeoJson('mining_zones', mineId);
      if (activeLoadIdRef.current !== loadId || !mapInstanceRef.current) return;

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
        if (showPitsRef.current && mapInstanceRef.current) {
          pLayer.addTo(mapInstanceRef.current);
        }
      }

      // 5. Reserve Intelligence Heatmap Layer
      const rData = await api.getGisGeoJson('reserve_zones', mineId);
      if (activeLoadIdRef.current !== loadId || !mapInstanceRef.current) return;

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
        if (showReservesRef.current && mapInstanceRef.current) {
          rLayer.addTo(mapInstanceRef.current);
        }
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    } catch (err: any) {
      if (activeLoadIdRef.current === loadId) {
        console.error(`Error loading GeoJSON layers for ${mineId}:`, err);
        setLayerError(`Failed to load vector layers for ${mineId}`);
      }
    } finally {
      if (activeLoadIdRef.current === loadId) {
        setLoadingLayers(false);
      }
    }
  }, [onZoneSelect, centerLat, centerLng]);

  // Trigger layer load on mine change or initial load
  useEffect(() => {
    loadLayersForMine(selectedMineId);
  }, [selectedMineId, loadLayersForMine]);

  // Handle Layer Visibility Toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !boundaryLayerRef.current) return;
    if (showBoundary) {
      if (!map.hasLayer(boundaryLayerRef.current)) map.addLayer(boundaryLayerRef.current);
    } else {
      if (map.hasLayer(boundaryLayerRef.current)) map.removeLayer(boundaryLayerRef.current);
    }
  }, [showBoundary]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pitsLayerRef.current) return;
    if (showPits) {
      if (!map.hasLayer(pitsLayerRef.current)) map.addLayer(pitsLayerRef.current);
    } else {
      if (map.hasLayer(pitsLayerRef.current)) map.removeLayer(pitsLayerRef.current);
    }
  }, [showPits]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !reservesLayerRef.current) return;
    if (showReserves) {
      if (!map.hasLayer(reservesLayerRef.current)) map.addLayer(reservesLayerRef.current);
    } else {
      if (map.hasLayer(reservesLayerRef.current)) map.removeLayer(reservesLayerRef.current);
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
    <div className="relative isolate w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-[#DDE0DC] bg-[#FAFAF7] shadow-card flex flex-col">
      {/* Professional GIS Toolbar */}
      <div className="bg-[#F1F0EB] border-b border-[#DDE0DC] px-3 py-2 flex flex-wrap items-center justify-between gap-3 z-10 shrink-0 text-xs">
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
          {/* 1. Mine / Concession Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-[#18324A] flex items-center gap-1">
              <Pickaxe className="w-3.5 h-3.5 text-[#F2A900]" />
              Concession:
            </span>
            <select
              value={selectedMineId}
              onChange={(e) => {
                const id = e.target.value;
                onSelectMineId?.(id);
                const m = MOIL_MINES.find((item) => item.id === id);
                if (m) setSelectedMineDrawer(m);
              }}
              className="bg-[#FAFAF7] border border-[#DDE0DC] text-[#18324A] font-semibold rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#F2A900] cursor-pointer shadow-card"
            >
              {MOIL_MINES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.state === 'Madhya Pradesh' ? 'MP' : 'MH'})
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[#DDE0DC] hidden sm:block" />

          {/* 2. Layers Toggle */}
          <button
            type="button"
            onClick={() => setIsLayersOpen((prev) => !prev)}
            className={`px-2.5 py-1 rounded border text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-card ${
              isLayersOpen
                ? 'bg-[#FAFAF7] border-[#F2A900] text-[#18324A]'
                : 'bg-[#FAFAF7] border-[#DDE0DC] text-[#5F7487] hover:text-[#18324A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#F2A900]" />
            <span>Layers {isLayersOpen ? '▾' : '▸'}</span>
          </button>

          {/* 3. Basemap Selector */}
          <div className="flex items-center bg-[#FAFAF7] border border-[#DDE0DC] rounded p-0.5 shadow-card">
            <button
              type="button"
              onClick={() => setBasemapType('satellite')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                basemapType === 'satellite'
                  ? 'bg-[#F1F0EB] text-[#18324A] font-semibold'
                  : 'text-[#5F7487] hover:text-[#18324A]'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setBasemapType('streets')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                basemapType === 'streets'
                  ? 'bg-[#F1F0EB] text-[#18324A] font-semibold'
                  : 'text-[#5F7487] hover:text-[#18324A]'
              }`}
            >
              Streets
            </button>
          </div>
        </div>

        {/* 4. Fit All Mines */}
        <button
          type="button"
          onClick={handleFitAllMines}
          className="px-2.5 py-1 rounded bg-[#FAFAF7] hover:bg-[#F3F6F8] text-[#18324A] border border-[#DDE0DC] text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-card"
          title="Fit all 8 MOIL concessions in viewport"
        >
          <Globe2 className="w-3.5 h-3.5 text-[#F2A900]" />
          <span>Fit All Mines</span>
        </button>
      </div>

      {/* Map Display Container */}
      <div className="relative flex-1 w-full h-full min-h-[440px] overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Loading Status Indicator */}
        {loadingLayers && (
          <div className="absolute top-3 left-3 z-20 bg-[#FAFAF7] border border-[#DDE0DC] rounded-md px-3 py-1 shadow-card text-xs flex items-center space-x-2 text-[#C47A00]">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#C47A00]" />
            <span className="font-mono text-[11px]">Updating GIS layers for {activeMineObj.name}...</span>
          </div>
        )}

        {/* Layer Error Notification */}
        {layerError && (
          <div className="absolute top-3 left-3 z-20 bg-[#FAFAF7] border border-[#C94747] rounded-md px-3 py-1 shadow-card text-xs text-[#C94747] flex items-center space-x-2">
            <span>{layerError}</span>
          </div>
        )}

        {/* Left Floating Tools */}
        <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5">
          <button
            onClick={handleFitAllMines}
            className="p-1.5 rounded-md bg-[#FAFAF7] border border-[#DDE0DC] text-[#5B6875] hover:text-[#18324A] hover:bg-[#F3F5F7] shadow-card transition-colors"
            title="Fit All Mines"
          >
            <Compass className="w-4 h-4 text-[#C47A00]" />
          </button>
        </div>

        {/* Collapsible Layer Controls Panel (Positioned Top-Right) */}
        <div className="absolute top-3 right-3 z-20 pointer-events-auto">
          {isLayersOpen ? (
            <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-3 shadow-card text-xs space-y-2.5 w-52 animate-fadeIn">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F0EB]">
                <div className="text-[11px] font-bold text-[#18324A] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#C47A00]" />
                  <span>Map Layers</span>
                </div>
                <button
                  onClick={() => setIsLayersOpen(false)}
                  className="text-[#7B8792] hover:text-[#18324A] p-0.5 rounded hover:bg-[#F3F5F7]"
                  title="Collapse Panel"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 cursor-pointer hover:text-[#18324A] text-[#5B6875]">
                  <input
                    type="checkbox"
                    checked={showAllMines}
                    onChange={(e) => setShowAllMines(e.target.checked)}
                    className="rounded border-[#DDE0DC] text-[#F2A900] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Mine locations</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer hover:text-[#18324A] text-[#5B6875]">
                  <input
                    type="checkbox"
                    checked={showBoundary}
                    onChange={(e) => setShowBoundary(e.target.checked)}
                    className="rounded border-[#DDE0DC] text-[#F2A900] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Lease boundaries</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer hover:text-[#18324A] text-[#5B6875]">
                  <input
                    type="checkbox"
                    checked={showPits}
                    onChange={(e) => setShowPits(e.target.checked)}
                    className="rounded border-[#DDE0DC] text-[#F2A900] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Operational benches</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer hover:text-[#18324A] text-[#5B6875]">
                  <input
                    type="checkbox"
                    checked={showReserves}
                    onChange={(e) => setShowReserves(e.target.checked)}
                    className="rounded border-[#DDE0DC] text-[#F2A900] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Reserve classification</span>
                </label>

                <label className="flex items-start space-x-2 cursor-pointer hover:text-[#18324A] text-[#5B6875]">
                  <input
                    type="checkbox"
                    checked={showFirms}
                    onChange={(e) => setShowFirms(e.target.checked)}
                    className="rounded border-[#DDE0DC] text-[#F2A900] focus:ring-0 w-3.5 h-3.5 mt-0.5 cursor-pointer"
                  />
                  <div className="flex flex-col flex-1">
                    <span className="leading-tight">NASA thermal anomalies</span>
                    {firmsData?.hotspot_count && firmsData.hotspot_count > 0 ? (
                      <span className="text-[10px] text-[#C47A00] font-mono font-semibold">
                        {firmsData.hotspot_count} detected
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#7B8792]">
                        No active hotspots
                      </span>
                    )}
                  </div>
                </label>
              </div>

              {/* Basemap Switcher */}
              <div className="pt-2 border-t border-[#F1F0EB] space-y-1">
                <div className="text-[10px] font-semibold text-[#7B8792] uppercase tracking-wider">
                  Basemap Style
                </div>
                <div className="grid grid-cols-2 gap-1 bg-[#F1F0EB] p-0.5 rounded border border-[#DDE0DC]">
                  <button
                    type="button"
                    onClick={() => setBasemapType('satellite')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors text-center ${
                      basemapType === 'satellite'
                        ? 'bg-[#FAFAF7] text-[#18324A] font-semibold shadow-card'
                        : 'text-[#5B6875] hover:text-[#18324A]'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    type="button"
                    onClick={() => setBasemapType('streets')}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors text-center ${
                      basemapType === 'streets'
                        ? 'bg-[#FAFAF7] text-[#18324A] font-semibold shadow-card'
                        : 'text-[#5B6875] hover:text-[#18324A]'
                    }`}
                  >
                    Streets
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsLayersOpen(true)}
              className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-md px-2.5 py-1.5 shadow-card text-xs font-semibold text-[#18324A] flex items-center space-x-1.5 hover:bg-[#F3F5F7] transition-colors"
              title="Expand Layers Panel"
            >
              <Layers className="w-3.5 h-3.5 text-[#C47A00]" />
              <span>Layers</span>
            </button>
          )}
        </div>

        {/* Contextual Mine Detail Side Drawer */}
        {selectedMineDrawer && (
          <div className="absolute top-3 right-56 z-20 bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-4 shadow-[0_4px_12px_rgba(20,30,40,0.15)] text-xs w-72 space-y-3 pointer-events-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-2">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#C47A00]">
                  Concession Context
                </span>
                <h3 className="font-bold text-sm text-[#18324A]">{selectedMineDrawer.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMineDrawer(null)}
                className="text-[#7B8792] hover:text-[#18324A] p-1 rounded hover:bg-[#F1F0EB]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[#5B6875]">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-medium text-[#18324A]">{selectedMineDrawer.district}, {selectedMineDrawer.state}</span>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="font-mono text-[#18324A]">{selectedMineDrawer.lat.toFixed(4)}°N, {selectedMineDrawer.lon.toFixed(4)}°E</span>
              </div>
              <div className="flex justify-between">
                <span>Operation Type:</span>
                <span className="font-medium text-[#18324A]">{selectedMineDrawer.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Capacity:</span>
                <span className="font-medium text-[#18324A]">{selectedMineDrawer.annual_capacity}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-[#16866A]">● {selectedMineDrawer.status.split('—')[0].trim()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F0EB] flex items-center justify-end space-x-2">
              {onSelectMineId && (
                <button
                  onClick={() => {
                    onSelectMineId(selectedMineDrawer.id);
                    setSelectedMineDrawer(null);
                  }}
                  className="w-full py-1.5 rounded-md bg-[#F2A900] hover:bg-[#D99100] text-[#18324A] font-semibold text-xs transition-colors shadow-card"
                >
                  Set as Active Concession
                </button>
              )}
            </div>
          </div>
        )}

        {/* Legend (Positioned at Bottom-Left of Map Viewport) */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#FAFAF7] border border-[#DDE0DC] rounded-md px-3 py-1.5 shadow-card text-[11px] flex flex-wrap items-center gap-3 max-w-[calc(100%-24px)]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F2A900] inline-block"></span>
            <span className="text-[#5B6875]">MOIL Mine</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#16866A] inline-block"></span>
            <span className="text-[#5B6875]">High Grade (&gt;75%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C47A00] inline-block"></span>
            <span className="text-[#5B6875]">Medium Grade (50-75%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C94747] inline-block"></span>
            <span className="text-[#5B6875]">Low Grade (&lt;50%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C94747] inline-block"></span>
            <span className="text-[#5B6875]">NASA Thermal Anomaly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
