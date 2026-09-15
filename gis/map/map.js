/**
 * MOIL Mining Intelligence — GIS Map Controller
 * ================================================
 * Standalone Leaflet.js map for visualizing MOIL manganese mining operations.
 *
 * Architecture:
 *   GeoJSON files (gis/data/)  →  fetch()  →  Leaflet layers  →  Interactive map
 *
 * Future integration:
 *   Replace fetch('/data/...') calls with backend API endpoints.
 *   The loadLayer() function accepts any URL or API response.
 */

(function () {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const CONFIG = {
    // Data paths — change to API endpoints for backend integration
    dataBasePath: '../data',
    dataPaths: {
      mines: 'moil_mines.geojson',
      boundaries: 'mine_boundaries.geojson',
      miningZones: 'mining_zones.geojson',
      reserves: 'reserve_zones.geojson',
      risk: 'risk_zones.geojson',
      satellite: 'satellite_indicators.json',
    },

    // Default map view — centered on MOIL mining region (MH + MP)
    defaultCenter: [21.55, 79.85],
    defaultZoom: 7,

    // Zoom presets
    zoomPresets: {
      india: { center: [22.0, 79.0], zoom: 5 },
      region: { center: [21.55, 79.85], zoom: 7 },
      maharashtra: { center: [21.45, 79.35], zoom: 9 },
      madhyaPradesh: { center: [21.85, 80.23], zoom: 9 },
    },

    // Tile layer — OpenStreetMap (dark-filtered via CSS)
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

    // Style configs
    colors: {
      reserve: { HIGH: '#22c55e', MEDIUM: '#eab308', LOW: '#ef4444' },
      risk: { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' },
      boundary: '#f59e0b',
      miningZone: '#3b82f6',
      satellite: '#8b5cf6',
    },
  };

  // ============================================================
  // STATE
  // ============================================================

  const state = {
    map: null,
    layers: {
      mines: null,
      boundaries: null,
      miningZones: null,
      reserves: null,
      risk: null,
      satellite: null,
    },
    data: {
      mines: null,
      boundaries: null,
      miningZones: null,
      reserves: null,
      risk: null,
      satellite: null,
    },
    layerVisibility: {
      mines: true,
      boundaries: true,
      miningZones: true,
      reserves: true,
      risk: true,
      satellite: false,
    },
    selectedMine: null,
    satelliteOverlays: [],
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    initMap();
    initEventListeners();
    await loadAllData();
    renderAllLayers();
    updateMineCounts();
    hideLoading();
  }

  function initMap() {
    state.map = L.map('map', {
      center: CONFIG.defaultCenter,
      zoom: CONFIG.defaultZoom,
      zoomControl: false,
      attributionControl: true,
    });

    // OpenStreetMap tile layer (dark-filtered via CSS)
    L.tileLayer(CONFIG.tileUrl, {
      attribution: CONFIG.tileAttribution,
      maxZoom: 19,
    }).addTo(state.map);

    // Zoom control (top-right)
    L.control.zoom({ position: 'topright' }).addTo(state.map);

    // Mouse coordinate display
    state.map.on('mousemove', (e) => {
      const coordEl = document.getElementById('coord-display');
      if (coordEl) {
        coordEl.textContent = `${e.latlng.lat.toFixed(5)}°N, ${e.latlng.lng.toFixed(5)}°E`;
      }
    });

    // Zoom level display
    state.map.on('zoomend', () => {
      const zoomEl = document.getElementById('zoom-indicator');
      if (zoomEl) {
        zoomEl.textContent = `Zoom: ${state.map.getZoom()}`;
      }
    });
  }

  // ============================================================
  // DATA LOADING
  // ============================================================

  async function loadAllData() {
    const basePath = CONFIG.dataBasePath;

    const loadJSON = async (filename) => {
      try {
        const response = await fetch(`${basePath}/${filename}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        console.warn(`[GIS] Failed to load ${filename}:`, err.message);
        return null;
      }
    };

    // Load all data in parallel
    const [mines, boundaries, miningZones, reserves, risk, satellite] =
      await Promise.all([
        loadJSON(CONFIG.dataPaths.mines),
        loadJSON(CONFIG.dataPaths.boundaries),
        loadJSON(CONFIG.dataPaths.miningZones),
        loadJSON(CONFIG.dataPaths.reserves),
        loadJSON(CONFIG.dataPaths.risk),
        loadJSON(CONFIG.dataPaths.satellite),
      ]);

    state.data.mines = mines;
    state.data.boundaries = boundaries;
    state.data.miningZones = miningZones;
    state.data.reserves = reserves;
    state.data.risk = risk;
    state.data.satellite = satellite;

    console.log('[GIS] All data loaded successfully');
  }

  /**
   * Public API: Replace a data layer with new data (for future API integration).
   * @param {string} layerName - One of: mines, boundaries, miningZones, reserves, risk, satellite
   * @param {object} data - GeoJSON FeatureCollection or satellite JSON
   */
  window.updateGISLayer = function (layerName, data) {
    if (!state.data.hasOwnProperty(layerName)) {
      console.error(`[GIS] Unknown layer: ${layerName}`);
      return;
    }
    state.data[layerName] = data;
    renderLayer(layerName);
    console.log(`[GIS] Layer "${layerName}" updated via API`);
  };

  // ============================================================
  // LAYER RENDERING
  // ============================================================

  function renderAllLayers() {
    renderLayer('boundaries');
    renderLayer('miningZones');
    renderLayer('reserves');
    renderLayer('risk');
    renderLayer('satellite');
    renderLayer('mines'); // mines on top
    populateMineList();
  }

  function renderLayer(layerName) {
    // Remove existing layer
    if (state.layers[layerName]) {
      state.map.removeLayer(state.layers[layerName]);
      state.layers[layerName] = null;
    }

    // Remove satellite overlays
    if (layerName === 'satellite') {
      state.satelliteOverlays.forEach((o) => state.map.removeLayer(o));
      state.satelliteOverlays = [];
    }

    const data = state.data[layerName];
    if (!data) return;

    switch (layerName) {
      case 'mines':
        state.layers.mines = renderMines(data);
        break;
      case 'boundaries':
        state.layers.boundaries = renderBoundaries(data);
        break;
      case 'miningZones':
        state.layers.miningZones = renderMiningZones(data);
        break;
      case 'reserves':
        state.layers.reserves = renderReserves(data);
        break;
      case 'risk':
        state.layers.risk = renderRisk(data);
        break;
      case 'satellite':
        renderSatelliteOverlays(data);
        break;
    }

    // Apply visibility
    applyLayerVisibility(layerName);
  }

  // --- Mine Markers ---
  function renderMines(geojson) {
    const layer = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => {
        const props = feature.properties;
        const isOpencast = props.mine_type === 'Opencast';
        const markerHtml = `
          <div class="mine-marker ${isOpencast ? 'opencast' : ''}">
          </div>
        `;
        const icon = L.divIcon({
          html: markerHtml,
          className: 'mine-marker-container',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const accuracyBadge =
          p.coordinate_accuracy === 'APPROXIMATE'
            ? '<span class="popup-badge risk-medium">⚠ APPROXIMATE COORDS</span>'
            : '<span class="popup-badge high">✓ REFERENCED</span>';

        const popup = `
          <div class="popup-content">
            <div class="popup-header">
              <div class="popup-icon mine">⛏️</div>
              <div>
                <div class="popup-title">${p.name}</div>
                <div class="popup-subtitle">${p.district}, ${p.state}</div>
              </div>
            </div>
            <div class="popup-grid">
              <div class="popup-stat">
                <div class="popup-stat-label">Mine ID</div>
                <div class="popup-stat-value">${p.mine_id}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Type</div>
                <div class="popup-stat-value">${p.mine_type}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Commodity</div>
                <div class="popup-stat-value">${p.commodity}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Status</div>
                <div class="popup-stat-value high">${p.status}</div>
              </div>
            </div>
            <div class="popup-row">
              <span class="popup-row-label">Operator</span>
              <span class="popup-row-value">${p.operator}</span>
            </div>
            <div class="popup-row">
              <span class="popup-row-label">Coords</span>
              ${accuracyBadge}
            </div>
            <div style="margin-top:8px;font-size:12px;color:var(--text-secondary);">
              ${p.description}
            </div>
            <div class="popup-demo-notice">
              📋 Source: ${p.source}
            </div>
          </div>
        `;
        layer.bindPopup(popup, { maxWidth: 340 });
        layer.bindTooltip(p.name, {
          permanent: false,
          direction: 'top',
          offset: [0, -16],
        });

        // Click handler — highlight in mine list
        layer.on('click', () => {
          selectMine(p.mine_id);
        });
      },
    });

    layer.addTo(state.map);
    return layer;
  }

  // --- Mine Boundaries ---
  function renderBoundaries(geojson) {
    const layer = L.geoJSON(geojson, {
      style: (feature) => ({
        color: feature.properties.stroke || CONFIG.colors.boundary,
        weight: feature.properties['stroke-width'] || 2.5,
        fillColor: feature.properties.fill || CONFIG.colors.boundary,
        fillOpacity: feature.properties['fill-opacity'] || 0.06,
        dashArray: '8, 5',
      }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const popup = `
          <div class="popup-content">
            <div class="popup-header">
              <div class="popup-icon mine">🗺️</div>
              <div>
                <div class="popup-title">${p.name}</div>
                <div class="popup-subtitle">${p.district}, ${p.state}</div>
              </div>
            </div>
            <div class="popup-grid">
              <div class="popup-stat">
                <div class="popup-stat-label">Area</div>
                <div class="popup-stat-value">${p.area_sq_km} km²</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Operator</div>
                <div class="popup-stat-value" style="font-size:11px">MOIL Ltd</div>
              </div>
            </div>
            ${p.lease_validity ? `<div class="popup-row"><span class="popup-row-label">Lease Valid Till</span><span class="popup-row-value">${p.lease_validity}</span></div>` : ''}
            <div class="popup-demo-notice">
              ⚠ ${p.data_type === 'APPROXIMATE' ? 'Boundary from existing GeoJSON data' : 'Demo approximate boundary — not survey-grade'}
            </div>
          </div>
        `;
        layer.bindPopup(popup, { maxWidth: 320 });
      },
    });

    layer.addTo(state.map);
    return layer;
  }

  // --- Mining Zones ---
  function renderMiningZones(geojson) {
    const statusColors = {
      ACTIVE_EXTRACTION: '#3b82f6',
      HIGH_EXTRACTION: '#10b981',
      DEVELOPMENT_BENCH: '#f59e0b',
      GEOLOGICAL_PROSPECTING: '#8b5cf6',
      WASTE_STABILIZATION: '#64748b',
    };

    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const status = feature.properties.status;
        return {
          color: statusColors[status] || CONFIG.colors.miningZone,
          weight: 2,
          fillColor: statusColors[status] || CONFIG.colors.miningZone,
          fillOpacity: 0.25,
        };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const statusLabel = p.status.replace(/_/g, ' ');
        const popup = `
          <div class="popup-content">
            <div class="popup-header">
              <div class="popup-icon mine">🏗️</div>
              <div>
                <div class="popup-title">${p.name}</div>
                <div class="popup-subtitle">${p.mine_name} — Zone ${p.zone_id}</div>
              </div>
            </div>
            <div class="popup-grid">
              <div class="popup-stat">
                <div class="popup-stat-label">Status</div>
                <div class="popup-stat-value" style="font-size:11px">${statusLabel}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Bench Level</div>
                <div class="popup-stat-value" style="font-size:11px">${p.current_bench_level}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Equipment</div>
                <div class="popup-stat-value">${p.active_equipment_count}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Daily Target</div>
                <div class="popup-stat-value">${p.daily_target_tons}t</div>
              </div>
            </div>
            <div class="popup-row">
              <span class="popup-row-label">Safety</span>
              <span class="popup-badge ${p.safety_clearance === 'APPROVED' ? 'high' : 'risk-medium'}">${p.safety_clearance.replace(/_/g, ' ')}</span>
            </div>
            <div class="popup-demo-notice">
              ⚠ Demo data — zone geometry and operational values are synthetic
            </div>
          </div>
        `;
        layer.bindPopup(popup, { maxWidth: 340 });

        layer.on('click', () => {
          showInfoPanel('Mining Zone', p);
        });
      },
    });

    layer.addTo(state.map);
    return layer;
  }

  // --- Reserve Zones ---
  function renderReserves(geojson) {
    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const level = feature.properties.reserve_level;
        return {
          color: CONFIG.colors.reserve[level] || '#888',
          weight: 2.5,
          fillColor: CONFIG.colors.reserve[level] || '#888',
          fillOpacity: 0.3,
        };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const levelClass = p.reserve_level.toLowerCase();
        const popup = `
          <div class="popup-content">
            <div class="popup-header">
              <div class="popup-icon reserve">💎</div>
              <div>
                <div class="popup-title">${p.name}</div>
                <div class="popup-subtitle">${p.mine_name} — Zone ${p.zone_id}</div>
              </div>
            </div>
            <div style="margin-bottom:10px;">
              <span class="popup-badge ${levelClass}">● ${p.reserve_level} RESERVE</span>
            </div>
            <div class="popup-grid">
              <div class="popup-stat">
                <div class="popup-stat-label">Reserve Score</div>
                <div class="popup-stat-value ${levelClass}">${p.reserve_score.toFixed(2)}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Confidence</div>
                <div class="popup-stat-value">${(p.confidence * 100).toFixed(0)}%</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Est. Tonnage</div>
                <div class="popup-stat-value">${p.estimated_tonnage_kt}kt</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Mn Grade</div>
                <div class="popup-stat-value">${p.avg_mn_grade_pct}%</div>
              </div>
            </div>
            <div class="popup-row">
              <span class="popup-row-label">Fe Grade</span>
              <span class="popup-row-value">${p.avg_fe_grade_pct}%</span>
            </div>
            <div class="popup-row">
              <span class="popup-row-label">Formation</span>
              <span class="popup-row-value" style="font-family:var(--font-primary);font-size:11px">${p.primary_formation}</span>
            </div>
            <div class="popup-demo-notice">
              ⚠ DEMO — Reserve scores are synthetic. Replace with ML model output.
            </div>
          </div>
        `;
        layer.bindPopup(popup, { maxWidth: 340 });

        layer.on('click', () => {
          showInfoPanel('Reserve Zone', p);
        });
      },
    });

    layer.addTo(state.map);
    return layer;
  }

  // --- Risk Zones ---
  function renderRisk(geojson) {
    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const level = feature.properties.risk_level;
        return {
          color: CONFIG.colors.risk[level] || '#888',
          weight: 2,
          fillColor: CONFIG.colors.risk[level] || '#888',
          fillOpacity: 0.2,
          dashArray: level === 'HIGH' ? '5, 3' : null,
        };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const levelClass = 'risk-' + p.risk_level.toLowerCase();
        const factorsHtml = (p.risk_factors || [])
          .map((f) => `<li>${f}</li>`)
          .join('');

        const popup = `
          <div class="popup-content">
            <div class="popup-header">
              <div class="popup-icon risk">⚠️</div>
              <div>
                <div class="popup-title">${p.name}</div>
                <div class="popup-subtitle">${p.mine_name} — Zone ${p.zone_id}</div>
              </div>
            </div>
            <div style="margin-bottom:10px;">
              <span class="popup-badge ${levelClass}">● ${p.risk_level} RISK</span>
            </div>
            <div class="popup-grid">
              <div class="popup-stat">
                <div class="popup-stat-label">Risk Score</div>
                <div class="popup-stat-value ${levelClass}">${p.risk_score.toFixed(2)}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-label">Mitigation</div>
                <div class="popup-stat-value" style="font-size:10px">${(p.mitigation_status || 'N/A').replace(/_/g, ' ')}</div>
              </div>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);font-weight:600;margin-top:4px;">Contributing Factors:</div>
            <ul class="popup-list">${factorsHtml}</ul>
            <div class="popup-demo-notice">
              ⚠ DEMO — Risk scores and factors are synthetic. Replace with risk engine output.
            </div>
          </div>
        `;
        layer.bindPopup(popup, { maxWidth: 340 });

        layer.on('click', () => {
          showInfoPanel('Risk Zone', p);
        });
      },
    });

    layer.addTo(state.map);
    return layer;
  }

  // --- Satellite Overlays ---
  function renderSatelliteOverlays(satData) {
    if (!satData || !satData.indicators) return;

    // We need zone geometries to place the indicators
    const zoneGeojson = state.data.miningZones;
    if (!zoneGeojson) return;

    satData.indicators.forEach((indicator) => {
      // Find the matching zone feature to get its centroid
      const zoneFeature = zoneGeojson.features.find(
        (f) => f.properties.zone_id === indicator.zone_id
      );
      if (!zoneFeature) return;

      // Calculate centroid of the zone polygon
      const coords = zoneFeature.geometry.coordinates[0];
      let lat = 0, lng = 0;
      coords.forEach((c) => {
        lng += c[0];
        lat += c[1];
      });
      lat /= coords.length;
      lng /= coords.length;

      // Create a label marker for satellite indicators
      const labelHtml = `
        <div class="sat-overlay-label">
          NDVI: ${indicator.ndvi.toFixed(2)} | 💧${indicator.surface_moisture_pct}% | 🌡️${indicator.land_surface_temp_c}°C
        </div>
      `;
      const labelIcon = L.divIcon({
        html: labelHtml,
        className: 'sat-overlay-container',
        iconSize: [200, 30],
        iconAnchor: [100, 15],
      });
      const marker = L.marker([lat, lng], { icon: labelIcon, interactive: true });

      // Popup on click
      const disturbanceClass = indicator.land_disturbance === 'HIGH' ? 'risk-high'
        : indicator.land_disturbance === 'MEDIUM' ? 'risk-medium' : 'risk-low';
      const popup = `
        <div class="popup-content">
          <div class="popup-header">
            <div class="popup-icon satellite">🛰️</div>
            <div>
              <div class="popup-title">${indicator.zone_name}</div>
              <div class="popup-subtitle">${indicator.mine_name} — ${indicator.zone_id}</div>
            </div>
          </div>
          <div class="popup-grid">
            <div class="popup-stat">
              <div class="popup-stat-label">NDVI</div>
              <div class="popup-stat-value">${indicator.ndvi.toFixed(2)}</div>
            </div>
            <div class="popup-stat">
              <div class="popup-stat-label">Moisture</div>
              <div class="popup-stat-value">${indicator.surface_moisture_pct}%</div>
            </div>
            <div class="popup-stat">
              <div class="popup-stat-label">Land Temp</div>
              <div class="popup-stat-value">${indicator.land_surface_temp_c}°C</div>
            </div>
            <div class="popup-stat">
              <div class="popup-stat-label">Disturbance</div>
              <div class="popup-stat-value ${disturbanceClass}">${indicator.land_disturbance}</div>
            </div>
          </div>
          <div class="popup-row">
            <span class="popup-row-label">NDVI Detail</span>
            <span class="popup-row-value" style="font-family:var(--font-primary);font-size:10px;max-width:160px;text-align:right">${indicator.ndvi_interpretation}</span>
          </div>
          <div class="popup-row">
            <span class="popup-row-label">Veg. Stress</span>
            <span class="popup-row-value" style="font-family:var(--font-primary);font-size:11px">${indicator.vegetation_stress}</span>
          </div>
          <div class="popup-row">
            <span class="popup-row-label">Rainfall (Monthly)</span>
            <span class="popup-row-value">${indicator.rainfall_mm_monthly}mm</span>
          </div>
          <div class="popup-row">
            <span class="popup-row-label">Cloud Cover</span>
            <span class="popup-row-value">${indicator.cloud_coverage_pct}%</span>
          </div>
          <div class="popup-row">
            <span class="popup-row-label">Acquisition</span>
            <span class="popup-row-value">${indicator.acquisition_date}</span>
          </div>
          <div class="popup-demo-notice">
            ⚠ DEMO — All satellite values are synthetic. Connect real Sentinel-2/Landsat-9 API for actual observations.
          </div>
        </div>
      `;
      marker.bindPopup(popup, { maxWidth: 360 });

      state.satelliteOverlays.push(marker);

      if (state.layerVisibility.satellite) {
        marker.addTo(state.map);
      }
    });
  }

  // ============================================================
  // LAYER VISIBILITY
  // ============================================================

  function applyLayerVisibility(layerName) {
    const isVisible = state.layerVisibility[layerName];

    if (layerName === 'satellite') {
      state.satelliteOverlays.forEach((o) => {
        if (isVisible) {
          o.addTo(state.map);
        } else {
          state.map.removeLayer(o);
        }
      });
      return;
    }

    const layer = state.layers[layerName];
    if (!layer) return;

    if (isVisible) {
      layer.addTo(state.map);
    } else {
      state.map.removeLayer(layer);
    }
  }

  function toggleLayer(layerName) {
    state.layerVisibility[layerName] = !state.layerVisibility[layerName];
    applyLayerVisibility(layerName);

    // Update checkbox
    const checkbox = document.getElementById(`layer-${layerName}`);
    if (checkbox) {
      checkbox.checked = state.layerVisibility[layerName];
    }
  }

  // ============================================================
  // MINE LIST & SELECTION
  // ============================================================

  function populateMineList() {
    const container = document.getElementById('mine-list');
    if (!container || !state.data.mines) return;

    container.innerHTML = '';

    state.data.mines.features.forEach((feature) => {
      const p = feature.properties;
      const isOpencast = p.mine_type === 'Opencast';
      const item = document.createElement('div');
      item.className = 'mine-list-item';
      item.dataset.mineId = p.mine_id;
      item.innerHTML = `
        <div class="mine-list-marker ${isOpencast ? 'opencast' : ''}"></div>
        <span class="mine-list-name">${p.name}</span>
        <span class="mine-list-state">${p.state === 'Maharashtra' ? 'MH' : 'MP'}</span>
      `;
      item.addEventListener('click', () => {
        flyToMine(p.mine_id);
      });
      container.appendChild(item);
    });
  }

  function flyToMine(mineId) {
    if (!state.data.mines) return;

    const feature = state.data.mines.features.find(
      (f) => f.properties.mine_id === mineId
    );
    if (!feature) return;

    const coords = feature.geometry.coordinates;
    state.map.flyTo([coords[1], coords[0]], 14, {
      duration: 1.2,
    });

    selectMine(mineId);
  }

  function selectMine(mineId) {
    state.selectedMine = mineId;

    // Update mine list highlighting
    document.querySelectorAll('.mine-list-item').forEach((el) => {
      el.classList.toggle('selected', el.dataset.mineId === mineId);
    });
  }

  // ============================================================
  // INFO PANEL
  // ============================================================

  function showInfoPanel(title, properties) {
    const panel = document.getElementById('info-panel');
    const panelTitle = document.getElementById('info-panel-title');
    const panelBody = document.getElementById('info-panel-body');

    if (!panel || !panelTitle || !panelBody) return;

    panelTitle.textContent = title;

    let html = '';
    const skipKeys = [
      'fill',
      'fill-opacity',
      'stroke',
      'stroke-width',
      'data_type',
    ];

    for (const [key, value] of Object.entries(properties)) {
      if (skipKeys.includes(key)) continue;

      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      if (Array.isArray(value)) {
        html += `<div class="popup-row">
          <span class="popup-row-label">${label}</span>
          <span class="popup-row-value" style="font-family:var(--font-primary);font-size:11px">${value.join(', ')}</span>
        </div>`;
      } else {
        html += `<div class="popup-row">
          <span class="popup-row-label">${label}</span>
          <span class="popup-row-value">${value}</span>
        </div>`;
      }
    }

    if (properties.data_type === 'DEMO') {
      html += `<div class="popup-demo-notice">⚠ Demo/synthetic data</div>`;
    }

    panelBody.innerHTML = html;
    panel.classList.add('visible');
  }

  function hideInfoPanel() {
    const panel = document.getElementById('info-panel');
    if (panel) panel.classList.remove('visible');
  }

  // ============================================================
  // MINE COUNTS
  // ============================================================

  function updateMineCounts() {
    const countEl = document.getElementById('mine-count');
    if (countEl && state.data.mines) {
      countEl.textContent = state.data.mines.features.length;
    }

    const zoneCountEl = document.getElementById('zone-count');
    if (zoneCountEl && state.data.miningZones) {
      zoneCountEl.textContent = state.data.miningZones.features.length;
    }

    const reserveCountEl = document.getElementById('reserve-count');
    if (reserveCountEl && state.data.reserves) {
      reserveCountEl.textContent = state.data.reserves.features.length;
    }

    const riskCountEl = document.getElementById('risk-count');
    if (riskCountEl && state.data.risk) {
      riskCountEl.textContent = state.data.risk.features.length;
    }
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  function initEventListeners() {
    // Layer checkboxes
    document.querySelectorAll('.layer-checkbox').forEach((cb) => {
      cb.addEventListener('change', () => {
        toggleLayer(cb.dataset.layer);
      });
    });

    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset && CONFIG.zoomPresets[preset]) {
          const p = CONFIG.zoomPresets[preset];
          state.map.flyTo(p.center, p.zoom, { duration: 1.2 });
        }

        // Update active state
        document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Info panel close
    const closeBtn = document.getElementById('info-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideInfoPanel);
    }

    // Sidebar toggle (mobile)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Close sidebar on map click (mobile)
    state.map.on('click', () => {
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
      }
    });
  }

  // ============================================================
  // LOADING
  // ============================================================

  function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 600);
    }
  }
})();
