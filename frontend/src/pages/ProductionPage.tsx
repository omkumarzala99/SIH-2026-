import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  CloudRain,
  Zap,
  Truck,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ProductionTrendData, EquipmentItem } from '../types';
import { apiService } from '../services/api';
import { ProductionChart } from '../components/charts/ProductionChart';

interface ProductionPageProps {
  selectedMineId?: string;
  selectedMineName?: string;
}

export const ProductionPage: React.FC<ProductionPageProps> = ({
  selectedMineId = 'MINE_BALAGHAT_01',
  selectedMineName = 'Balaghat Mine (Bharveli)'
}) => {
  const [prodData, setProdData] = useState<ProductionTrendData | null>(null);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<'trends' | 'forecast' | 'fleet' | 'factors'>('trends');

  // Dynamic prediction sandbox state
  const [downtimeInput, setDowntimeInput] = useState(6.5);
  const [rainfallInput, setRainfallInput] = useState(54.2);
  const [blastingInput, setBlastingInput] = useState(2.2);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [forecasting, setForecasting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [p, eq] = await Promise.all([
          apiService.getProduction(selectedMineId),
          apiService.getEquipment(selectedMineId)
        ]);
        setProdData(p);
        setEquipmentList(eq);
      } catch (err) {
        console.error('Error loading production analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMineId]);

  const handleRecalculateForecast = async () => {
    setForecasting(true);
    try {
      const planned = prodData?.current_target || (selectedMineId === 'MINE_BALAGHAT_01' ? 1000 : 660);
      const res = await apiService.forecastProduction({
        mine_id: selectedMineId,
        planned_production: planned,
        equipment_downtime_hours: downtimeInput,
        rainfall_mm: rainfallInput,
        blasting_delay_hours: blastingInput
      });

      setForecastResult({
        planned: res.planned_production || planned,
        predicted: res.predicted_production,
        shortfall: res.shortfall_tonnes !== undefined ? res.shortfall_tonnes : res.shortfall,
        shortfall_pct: res.shortfall_percentage,
        loss_downtime: res.contributing_factors?.equipment_downtime_loss_tons || Math.round(downtimeInput * 28.0),
        loss_weather: res.contributing_factors?.weather_rainfall_loss_tons || Math.round(Math.max(0, (rainfallInput - 15.0) * 1.8)),
        loss_blast: res.contributing_factors?.blasting_delay_loss_tons || Math.round(blastingInput * 35.0)
      });
    } catch (err) {
      console.error('Forecast recalculation failed:', err);
    } finally {
      setForecasting(false);
    }
  };

  if (loading || !prodData) {
    return (
      <div className="flex items-center justify-center h-96 text-[#5F7487]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2A900] mr-3"></div>
        <span className="text-sm font-medium">Loading Production Analytics &amp; Fleet Telematics...</span>
      </div>
    );
  }

  const optimalCount = equipmentList.filter((e) => e.status === 'OPTIMAL').length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fadeIn">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE0DC] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F1F0EB] text-[#2878A8] border border-[#DDE0DC] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#2878A8]" />
              PRODUCTION &amp; FORECAST
            </span>
            <span className="text-xs text-[#5F7487] font-mono">Shift Run Rate &bull; 14-Day ML Trajectory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#18324A] mt-1 flex items-center gap-2">
            Production Forecasting &amp; Shortfall Analytics
            <span className="text-xs px-2.5 py-0.5 rounded bg-[#FAFAF7] text-[#18324A] border border-[#DDE0DC] font-semibold">
              {selectedMineName}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5F7487] mt-0.5">
            Real-time daily extraction monitoring, scheduled run rate tracking, and machine-learning operational shortfall detection.
          </p>
        </div>

        {/* Shift and Cycle Indicator */}
        <div className="flex items-center space-x-2 text-xs self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-md bg-[#FAFAF7] text-[#18324A] border border-[#DDE0DC] flex items-center gap-1.5 shadow-card">
            <Calendar className="w-3.5 h-3.5 text-[#F2A900]" />
            <span className="font-semibold">3 Shifts / 24h Cycle</span>
          </span>
        </div>
      </div>

      {/* 2. PRIMARY 4 CORE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Planned Target */}
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card">
          <div className="text-[11px] font-semibold text-[#5F7487] uppercase tracking-wider mb-1">
            Planned Quota
          </div>
          <div className="text-2xl font-bold text-[#18324A] font-mono tabular-nums">
            {prodData.current_target}{' '}
            <span className="text-xs text-[#5F7487] font-sans font-normal">t/day</span>
          </div>
          <div className="mt-1 text-xs text-[#5F7487]">
            Scheduled benchmark across active benches
          </div>
        </div>

        {/* Metric 2: Predicted Extraction */}
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card">
          <div className="text-[11px] font-semibold text-[#5F7487] uppercase tracking-wider mb-1">
            Actual Extraction
          </div>
          <div className="text-2xl font-bold text-[#18324A] font-mono tabular-nums">
            {prodData.current_predicted}{' '}
            <span className="text-xs text-[#5F7487] font-sans font-normal">t/day</span>
          </div>
          <div className="mt-1 text-xs text-[#D99400] font-semibold">
            {((prodData.current_predicted / prodData.current_target) * 100).toFixed(1)}% of scheduled quota
          </div>
        </div>

        {/* Metric 3: Projected Shortfall */}
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] border-l-4 border-l-[#C94747] rounded-lg p-4 shadow-card">
          <div className="text-[11px] font-semibold text-[#5F7487] uppercase tracking-wider mb-1">
            Production Deficit
          </div>
          <div className="text-2xl font-bold text-[#C94747] font-mono tabular-nums">
            -{prodData.current_shortfall}{' '}
            <span className="text-xs text-[#5F7487] font-sans font-normal">t</span>
          </div>
          <div className="mt-1 text-xs text-[#C94747] font-semibold">
            -{prodData.shortfall_percentage}% daily shortfall
          </div>
        </div>

        {/* Metric 4: Fleet Availability */}
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-4 shadow-card">
          <div className="text-[11px] font-semibold text-[#5F7487] uppercase tracking-wider mb-1">
            Active Fleet Units
          </div>
          <div className="text-2xl font-bold text-[#16866A] font-mono tabular-nums">
            {optimalCount} / {equipmentList.length}{' '}
            <span className="text-xs text-[#5F7487] font-sans font-normal">Operational</span>
          </div>
          <div className="mt-1 text-xs text-[#5F7487]">
            {equipmentList.length - optimalCount} units under maintenance
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED CONTROL / TABS */}
      <div className="flex items-center space-x-1 border-b border-[#DDE0DC] pb-1">
        <button
          onClick={() => setActiveSegment('trends')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSegment === 'trends'
              ? 'bg-[#F1F0EB] text-[#18324A] border border-[#DDE0DC]'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#F2A900]" />
          <span>14-Day Trajectory</span>
        </button>

        <button
          onClick={() => setActiveSegment('factors')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSegment === 'factors'
              ? 'bg-[#F1F0EB] text-[#18324A] border border-[#DDE0DC]'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#C94747]" />
          <span>Shortfall Constraints</span>
        </button>

        <button
          onClick={() => setActiveSegment('fleet')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSegment === 'fleet'
              ? 'bg-[#F1F0EB] text-[#18324A] border border-[#DDE0DC]'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-[#2878A8]" />
          <span>Fleet Telematics ({equipmentList.length})</span>
        </button>

        <button
          onClick={() => setActiveSegment('forecast')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeSegment === 'forecast'
              ? 'bg-[#F1F0EB] text-[#18324A] border border-[#DDE0DC]'
              : 'text-[#5F7487] hover:text-[#18324A]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D99400]" />
          <span>Predictive Sandbox</span>
        </button>
      </div>

      {/* 4. MAIN CONTENT PANELS */}
      {/* Panel A: 14-Day Trajectory */}
      {activeSegment === 'trends' && (
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F0EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#18324A] uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#F2A900]" />
                14-Day Shift Extraction vs. Scheduled Run Rate
              </h2>
              <p className="text-xs text-[#5F7487] mt-0.5">
                Notice daily production shortfall spikes during monsoon storms and equipment maintenance down cycles.
              </p>
            </div>

            <div className="text-xs text-[#5F7487] font-mono">
              Model: <span className="font-semibold text-[#18324A]">GradientBoostingRegressor_14F</span>
            </div>
          </div>

          <div className="py-2">
            <ProductionChart data={prodData.history} height={320} />
          </div>

          <div className="bg-[#F6F6F2] border border-[#DDE0DC] rounded p-3 text-xs text-[#5F7487] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="text-[#18324A]">Analysis Summary:</strong> Daily actual tonnages remained steady at ~980–1,000 t/day through Mar 07, before rainfall (54.2mm) and hydraulic failure dropped output to 820 t/day (-18.0%).
            </div>
            <span className="font-mono text-[11px] text-[#2878A8] shrink-0 font-semibold">
              Authoritative Lag Feature Isolation: Verified
            </span>
          </div>
        </div>
      )}

      {/* Panel B: Contributing Constraints */}
      {activeSegment === 'factors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card space-y-4">
            <div className="border-b border-[#F1F0EB] pb-3">
              <h2 className="text-sm font-bold text-[#18324A] uppercase tracking-wide flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C94747]" />
                Shortfall Factor Attribution (180 Tonnes Total Deficit)
              </h2>
              <p className="text-xs text-[#5F7487] mt-0.5">
                Mathematical decomposition of factors causing today&apos;s extraction deficit.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Factor 1: Equipment */}
              <div className="p-3.5 rounded-md border border-[#DDE0DC] bg-[#F6F6F2] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#18324A]">1. Equipment Downtime &amp; Mechanical Halts</span>
                  <span className="font-mono font-bold text-[#C94747]">-112 tonnes (62.2%)</span>
                </div>
                <div className="w-full bg-[#DDE0DC] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#C94747] h-full rounded-full" style={{ width: '62%' }} />
                </div>
                <div className="text-[11px] text-[#5F7487]">
                  Primary Excavator EXC_CAT_349_01 suffered 6.5 hours hydraulic overheat, causing haul dumper idle time.
                </div>
              </div>

              {/* Factor 2: Weather */}
              <div className="p-3.5 rounded-md border border-[#DDE0DC] bg-[#F6F6F2] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#18324A]">2. Rainfall &amp; Haul Road Slickness</span>
                  <span className="font-mono font-bold text-[#D99400]">-48 tonnes (26.7%)</span>
                </div>
                <div className="w-full bg-[#DDE0DC] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D99400] h-full rounded-full" style={{ width: '27%' }} />
                </div>
                <div className="text-[11px] text-[#5F7487]">
                  54.2mm rainfall saturated Central Pit floor, forcing dumper speed limits from 28 km/h down to 14 km/h.
                </div>
              </div>

              {/* Factor 3: Blasting Delay */}
              <div className="p-3.5 rounded-md border border-[#DDE0DC] bg-[#F6F6F2] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#18324A]">3. Bench Blasting Window Deferral</span>
                  <span className="font-mono font-bold text-[#2878A8]">-20 tonnes (11.1%)</span>
                </div>
                <div className="w-full bg-[#DDE0DC] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2878A8] h-full rounded-full" style={{ width: '11%' }} />
                </div>
                <div className="text-[11px] text-[#5F7487]">
                  2.2h safety clearance window deferred shot-firing into Shift B; loader worked fragmented stock.
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card flex flex-col justify-between">
            <div>
              <div className="border-b border-[#F1F0EB] pb-3 mb-3">
                <h3 className="text-sm font-bold text-[#18324A] uppercase tracking-wide">
                  Accounted Loss Summary
                </h3>
                <p className="text-xs text-[#5F7487] mt-0.5">Empirical balance sheet</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F0EB]">
                  <span className="text-[#5F7487]">Scheduled Run Rate:</span>
                  <span className="font-mono font-bold text-[#18324A]">1,000 t</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F0EB]">
                  <span className="text-[#5F7487]">Actual Extraction:</span>
                  <span className="font-mono font-bold text-[#18324A]">820 t</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F1F0EB]">
                  <span className="text-[#5F7487]">Unrecovered Deficit:</span>
                  <span className="font-mono font-bold text-[#C94747]">-180 t</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#5F7487]">Expected HITL Recovery:</span>
                  <span className="font-mono font-bold text-[#16866A]">+110 t</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F0EB] mt-4">
              <div className="text-[11px] text-[#5F7487]">
                Dispatch intervention in <strong>Decision Support</strong> can recover +110 tonnes by re-allocating 2 dumpers to dry bench Pit A.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel C: Fleet Telematics Table */}
      {activeSegment === 'fleet' && (
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-[#F1F0EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#18324A] uppercase tracking-wide flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2878A8]" />
                Heavy Earthmoving Machinery (HEMM) Telematics
              </h2>
              <p className="text-xs text-[#5F7487] mt-0.5">
                Active excavators, dumpers, and drill rigs assigned to Balaghat extraction benches.
              </p>
            </div>
            <span className="text-xs font-mono text-[#5F7487]">
              {optimalCount} of {equipmentList.length} Units Online
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DDE0DC] text-[#5F7487] bg-[#F6F6F2]">
                  <th className="py-2.5 px-3 font-semibold">Equipment ID</th>
                  <th className="py-2.5 px-3 font-semibold">Category / Model</th>
                  <th className="py-2.5 px-3 font-semibold">Operating Zone</th>
                  <th className="py-2.5 px-3 font-semibold">Downtime</th>
                  <th className="py-2.5 px-3 font-semibold">Efficiency</th>
                  <th className="py-2.5 px-3 font-semibold">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F0EB]">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-[#F6F6F2]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#18324A] font-semibold">{eq.id}</td>
                    <td className="py-2.5 px-3 text-[#18324A]">{eq.name}</td>
                    <td className="py-2.5 px-3 text-[#5F7487]">{eq.zone}</td>
                    <td className="py-2.5 px-3 font-mono text-[#18324A]">{eq.downtime_h} h</td>
                    <td className="py-2.5 px-3 font-mono text-[#18324A]">{eq.efficiency}%</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          eq.status === 'OPTIMAL'
                            ? 'bg-[#F1F0EB] text-[#16866A] border-[#DDE0DC]'
                            : eq.status === 'WARNING'
                            ? 'bg-[#F1F0EB] text-[#D99400] border-[#DDE0DC]'
                            : 'bg-[#F1F0EB] text-[#C94747] border-[#DDE0DC]'
                        }`}
                      >
                        {eq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel D: Interactive Predictive Sandbox */}
      {activeSegment === 'forecast' && (
        <div className="bg-[#FAFAF7] border border-[#DDE0DC] rounded-lg p-5 shadow-card space-y-4">
          <div className="border-b border-[#F1F0EB] pb-3">
            <h2 className="text-sm font-bold text-[#18324A] uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F2A900]" />
              Interactive Forecast Recalculation Engine
            </h2>
            <p className="text-xs text-[#5F7487] mt-0.5">
              Simulate parameter shifts to re-evaluate the Gradient Boosting model in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-[#F6F6F2] rounded-md border border-[#DDE0DC] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#18324A]">Equipment Downtime:</span>
                <span className="font-mono text-[#F2A900] font-bold">{downtimeInput} hrs</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={downtimeInput}
                onChange={(e) => setDowntimeInput(parseFloat(e.target.value))}
                className="w-full accent-[#F2A900] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-[#F6F6F2] rounded-md border border-[#DDE0DC] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#18324A]">Rainfall Inflow:</span>
                <span className="font-mono text-[#2878A8] font-bold">{rainfallInput} mm</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={rainfallInput}
                onChange={(e) => setRainfallInput(parseFloat(e.target.value))}
                className="w-full accent-[#2878A8] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-[#F6F6F2] rounded-md border border-[#DDE0DC] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#18324A]">Blasting Delay:</span>
                <span className="font-mono text-[#D99400] font-bold">{blastingInput} hrs</span>
              </div>
              <input
                type="range"
                min={0}
                max={6}
                step={0.1}
                value={blastingInput}
                onChange={(e) => setBlastingInput(parseFloat(e.target.value))}
                className="w-full accent-[#D99400] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleRecalculateForecast}
              disabled={forecasting}
              className="px-4 py-2 rounded-md bg-[#F2A900] hover:bg-[#D99400] active:bg-[#B77300] text-[#18324A] font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-card"
            >
              {forecasting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{forecasting ? 'Recalculating...' : 'Recalculate Model Forecast'}</span>
            </button>

            {forecastResult && (
              <div className="text-xs text-[#18324A]">
                New Predicted Extraction:{' '}
                <strong className="font-mono text-sm text-[#16866A]">
                  {forecastResult.predicted.toFixed(1)} tons
                </strong>{' '}
                (Shortfall: {forecastResult.shortfall.toFixed(1)} tons /{' '}
                {forecastResult.shortfall_pct.toFixed(1)}%)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
