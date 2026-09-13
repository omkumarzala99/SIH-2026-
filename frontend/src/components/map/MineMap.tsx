import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MineMapProps {
  onZoneSelect?: (zoneId: string) => void;
  selectedZoneId?: string;
}

export const MineMap: React.FC<MineMapProps> = ({ onZoneSelect, selectedZoneId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [showBoundary, setShowBoundary] = useState(true);
  const [showPits, setShowPits] = useState(true);
  const [showReserves, setShowReserves] = useState(true);

  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const pitsLayerRef = useRef<L.GeoJSON | null>(null);
  const reservesLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [21.8129, 80.1835],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // Dark-themed tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Load GeoJSON Layers
    const loadLayers = async () => {
      try {
        // 1. Concession Boundary
        const bRes = await fetch('/data/mine_boundary.geojson');
        if (bRes.ok) {
          const bData = await bRes.json();
          boundaryLayerRef.current = L.geoJSON(bData, {
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
                  <strong style="color: #d97706;">${feature.properties.name}</strong><br/>
                  <b>Operator:</b> ${feature.properties.operator}<br/>
                  <b>Lease Validity:</b> ${feature.properties.lease_validity}
                </div>
              `);
            }
          }).addTo(map);
        }

        // 2. Mining Zones / Operational Pits
        const pRes = await fetch('/data/mining_zones.geojson');
        if (pRes.ok) {
          const pData = await pRes.json();
          pitsLayerRef.current = L.geoJSON(pData, {
            style: (feature) => ({
              color: feature?.properties.fill || '#3b82f6',
              weight: 2,
              fillColor: feature?.properties.fill || '#3b82f6',
              fillOpacity: 0.25
            }),
            onEachFeature: (feature, layer) => {
              layer.bindPopup(`
                <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                  <strong style="font-size: 13px;">${feature.properties.name}</strong><br/>
                  <b>Status:</b> ${feature.properties.status}<br/>
                  <b>Bench Level:</b> ${feature.properties.current_bench_level}<br/>
                  <b>Daily Target:</b> ${feature.properties.daily_target_tons} tons<br/>
                  <b>Active Units:</b> ${feature.properties.active_equipment_count} machines
                </div>
              `);
              layer.on('click', () => {
                if (onZoneSelect) onZoneSelect(feature.properties.zone_id);
              });
            }
          }).addTo(map);
        }

        // 3. Reserve Intelligence Heatmap Layer
        const rRes = await fetch('/data/reserve_zones.geojson');
        if (rRes.ok) {
          const rData = await rRes.json();
          reservesLayerRef.current = L.geoJSON(rData, {
            style: (feature) => {
              const cls = feature?.properties.classification;
              const color = cls === 'HIGH' ? '#10b981' : (cls === 'MEDIUM' ? '#eab308' : '#ef4444');
              return {
                color: color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.4
              };
            },
            onEachFeature: (feature, layer) => {
              const p = feature.properties;
              layer.bindPopup(`
                <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                  <strong style="color: #059669; font-size: 13px;">${p.name}</strong><br/>
                  <b>Reserve Potential:</b> <span style="font-weight: bold; color: ${p.classification === 'HIGH' ? '#059669' : '#d97706'}">${p.classification} (${(p.reserve_probability * 100).toFixed(0)}%)</span><br/>
                  <b>Estimated Reserve:</b> ${p.estimated_tonnage.toLocaleString()} tonnes<br/>
                  <b>Manganese Grade:</b> ${p.avg_mn_grade_pct}% Mn<br/>
                  <b>Host Rock:</b> ${p.primary_formation}<br/>
                  <b>Model Confidence:</b> ${(p.confidence * 100).toFixed(0)}%
                </div>
              `);
              layer.on('click', () => {
                if (onZoneSelect) onZoneSelect(p.zone_id);
              });
            }
          }).addTo(map);
        }
      } catch (err) {
        console.error('Error loading GeoJSON layers:', err);
      }
    };

    loadLayers();

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />

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
