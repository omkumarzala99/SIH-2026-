# Frontend Dashboard: PS-26009 MOIL Mining Intelligence Platform (Member 6 Ownership)

Executive mining decision support web application built with React 18, TypeScript, Vite, Tailwind CSS, and Leaflet GIS mapping.

## Key Capabilities
- **Executive Dashboard**: High-level KPIs (Reserves, Production, Shortfall, Risk Score), environmental sensors, and interactive Leaflet map.
- **Reserve Intelligence**: Surface (Sentinel-2 NDVI) and subsurface (lithology & borehole assays) reserve potential mapping with High/Medium/Low classifications.
- **Production Forecasting**: 14-day planned vs. actual vs. shortfall extraction tracking and constraint breakdowns.
- **Risk Monitoring**: Real-time 0-100 composite risk rating with Explainable AI (XAI) attribution.
- **AI Recommendations**: Decision support cards with Human-in-the-Loop review actions (`Approve`, `Reject`, `Modify`).
- **What-If Simulation**: Dynamic constraint sliders (equipment downtime, rainfall, blasting delays) with instant Before vs. After comparison.
- **Data Quality Audit**: Empirical validation scorecard across 5 data domains.
- **Resilient Offline Demo**: Seamless client-side mock fallback provider when backend is disconnected.

## Running Locally
```bash
npm install
npm run dev
```
Development Server: `http://localhost:5173`
Production Build: `npm run build`
