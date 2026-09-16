# Responsive UI/UX Quality Assurance & Cross-Device Report
**MOIL AI Mining Intelligence Platform**
**Organization:** MOIL Limited / Ministry of Steel

---

## 1. Viewport & Device Compatibility Matrix

The MOIL Mining Intelligence Platform frontend is built using **Tailwind CSS**, designed with mobile-first responsive utilities (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`), and verified across standard industry screen viewports:

| Device Category | Target Resolution | CSS Breakpoint | Layout Adaptation | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Phone** | $375 \times 667\text{ px}$ (iPhone SE) | `< 640px` | Single-column stacked cards; collapsible sidebar to hamburger overlay; compact KPI grid ($1 \times 4$). | ✅ **PASS** |
| **Large Mobile** | $414 \times 896\text{ px}$ (iPhone 11/14) | `< 640px` | Single-column layout; scrollable table rows; full-width Leaflet map viewport ($300\text{px}$ height). | ✅ **PASS** |
| **Tablet Portrait** | $768 \times 1024\text{ px}$ (iPad) | `md: (768px)` | Two-column card grid; collapsed sidebar with iconography; side-by-side satellite indices. | ✅ **PASS** |
| **Tablet Landscape** | $1024 \times 768\text{ px}$ (iPad Pro) | `lg: (1024px)` | Expanded persistent sidebar; $2 \times 2$ dashboard grid; full-height Leaflet GIS workspace. | ✅ **PASS** |
| **Standard Laptop** | $1440 \times 900\text{ px}$ (MacBook/PC) | `xl: (1280px)` | Four-column executive KPI row; side-by-side GIS map + satellite telemetry panel. | ✅ **PASS** |
| **Ultra-Wide Desktop**| $1920 \times 1080\text{ px}$ (FHD / 4K) | `2xl: (1536px)` | Max-width centered container (`max-w-7xl`); balanced whitespace; high-density chart rendering. | ✅ **PASS** |

---

## 2. Core View & Page Verification

### 2.1 Executive Dashboard (`DashboardPage.tsx`)
- **KPI Summary Cards:** 4 primary metrics (Estimated Reserves, Planned Target, Predicted Extraction, Operational Shortfall) adapt from a $1 \times 4$ column stack on mobile to a $4 \times 1$ row on desktop.
- **Environmental Badge Row:** Live rainfall, moisture, temperature, and flood risk badges flex-wrap cleanly on narrow viewports without clipping.
- **Alert Feed:** Scrollable alerts with severity badges (`CRITICAL`, `HIGH`, `MEDIUM`) maintain legible typography down to 375px.

### 2.2 Spatial GIS Mapping (`MineMap.tsx` & `SatellitePanel.tsx`)
- **Leaflet Map Container:** Automatically resizes on container resize events (`invalidateSize()`).
- **Touch Gestures:** Two-finger pinch-to-zoom and pan enabled on touch displays.
- **Layer Toggle Toolbar:** Positioned cleanly with touch-friendly targets ($\ge 44 \times 44\text{ px}$).
- **Satellite Telemetry:** 8 indices presented in responsive 2-column cards on tablet and 4-column cards on desktop. Mandatory scientific disclaimer displayed prominently.

### 2.3 Production Forecasting (`ProductionPage.tsx`)
- **14-Day Trajectory SVG Chart:** Fully responsive SVG container with dynamic viewBox; scales smoothly without horizontal scrollbars on mobile.
- **HEMM Availability Table:** Uses CSS `overflow-x-auto` to provide smooth horizontal swipe on mobile viewports while preserving tabular column alignment.

### 2.4 Multi-Factor Risk & Explainability (`RiskPage.tsx`)
- **Risk Score Gauge:** Centered SVG radial meter displaying the 0–100 score and tier badge.
- **4-Pillar Breakdown:** Equipment (35%), Weather (25%), Blasting (20%), and Production (20%) rendered with progress bars and SHAP weight badges.

### 2.5 Prescriptive Recommendations (`RecommendationsPage.tsx`)
- **Governance Action Cards:** Human-in-the-Loop **Approve**, **Reject**, and **Modify** buttons styled with high-contrast, accessible touch targets.
- **Status Badges:** Color-coded indicators (`PENDING` in amber, `APPROVED` in emerald, `REJECTED` in rose).

### 2.6 What-If Scenario Simulator (`SimulationPage.tsx`)
- **Interactive Sliders:** Form controls for adjusting rainfall (0–120mm), equipment downtime (0–12h), and blasting delays (0–6h) operate smoothly via mouse and touch.
- **Instant Delta Recalculation:** Real-time feedback displaying predicted shortfall delta and risk shift.

---

## 3. UI State Lifecycle Handling

Every visual component implements robust 4-state lifecycle handling:

```text
[ INITIALIZE ] ────> [ LOADING SKELETON ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
    [ SUCCESS / ACTIVE ]              [ ERROR BOUNDARY ]
            │                                 │
    (if dataset empty)                        ▼
            ▼                        [ DEMO FALLBACK ]
     [ EMPTY STATE ]
```

1. **Loading Skeleton State:** Animated pulse skeletons (`animate-pulse`) prevent layout shift while waiting for API responses.
2. **Active Operational State:** Populated with live relational data and real-time ML inferences.
3. **Empty State:** If a newly created mine has zero records, informative empty-state cards display: *"No records found for the selected concession. Click 'Run Analysis' to initialize."*
4. **Error & Fallback State:** Network failures or backend restarts trigger an amber banner informing the user that **Demo Mode** is active, maintaining full UI functionality without breaking.

---

## 4. Accessibility & Contrast Standards

- **Theme:** Professional industrial dark theme engineered with slate hues (`#0f172a`, `#1e293b`, `#334155`) for reduced eye fatigue during extended control-room monitoring shifts.
- **Color Contrast:** All body text (`#f8fafc` and `#94a3b8`) adheres to WCAG AA contrast standards ($\ge 4.5:1$).
- **Colorblind Redundancy:** Severity levels are conveyed using both distinct colors (Emerald, Amber, Rose) and descriptive text labels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
