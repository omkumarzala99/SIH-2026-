import React, { useState } from 'react';
import { ProductionHistoryItem } from '../../types';

interface ProductionChartProps {
  data: ProductionHistoryItem[];
  height?: number;
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ data, height = 240 }) => {
  const [hoveredItem, setHoveredItem] = useState<ProductionHistoryItem | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-xs text-center py-8">No production trend data available</div>;
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.planned, d.actual, 1200)));
  const chartHeight = height - 40;

  return (
    <div className="w-full relative">
      {/* Tooltip Overlay */}
      {hoveredItem && (
        <div className="absolute top-0 right-2 z-20 bg-slate-900/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-xl pointer-events-none transition-all">
          <div className="font-semibold text-amber-400 border-b border-slate-800 pb-1 mb-1">
            {hoveredItem.date}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-slate-400">Planned:</span>
            <span className="text-slate-200 font-mono text-right">{hoveredItem.planned} t</span>
            <span className="text-slate-400">Actual:</span>
            <span className="text-emerald-400 font-mono text-right">{hoveredItem.actual} t</span>
            <span className="text-slate-400">Shortfall:</span>
            <span className="text-rose-400 font-mono text-right">{hoveredItem.shortfall} t</span>
            {hoveredItem.blasting_delay_h > 0 && (
              <>
                <span className="text-slate-400">Blast Delay:</span>
                <span className="text-orange-400 font-mono text-right">{hoveredItem.blasting_delay_h} h</span>
              </>
            )}
            {hoveredItem.rainfall_mm > 0 && (
              <>
                <span className="text-slate-400">Rainfall:</span>
                <span className="text-blue-400 font-mono text-right">{hoveredItem.rainfall_mm} mm</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* SVG Bar & Line Chart */}
      <svg className="w-full overflow-visible" height={height} viewBox={`0 0 ${data.length * 50 + 40} ${height}`}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((fraction, i) => {
          const y = chartHeight - (chartHeight * fraction);
          const val = Math.round(maxVal * fraction);
          return (
            <g key={i}>
              <line x1="30" y1={y} x2={data.length * 50 + 30} y2={y} stroke="#1e293b" strokeDasharray="3,3" />
              <text x="25" y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = 40 + idx * 50;
          const actualH = (item.actual / maxVal) * chartHeight;
          const actualY = chartHeight - actualH;
          const plannedH = (item.planned / maxVal) * chartHeight;
          const plannedY = chartHeight - plannedH;
          const hasShortfall = item.shortfall > 50;

          return (
            <g
              key={idx}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Planned Target Marker Line */}
              <line
                x1={x - 4}
                y1={plannedY}
                x2={x + 28}
                y2={plannedY}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="2,2"
              />

              {/* Background Column hover track */}
              <rect
                x={x - 6}
                y="0"
                width="36"
                height={chartHeight}
                fill="transparent"
                className="group-hover:fill-slate-800/40 transition-colors"
              />

              {/* Actual Tonnage Bar */}
              <rect
                x={x}
                y={actualY}
                width="24"
                height={actualH}
                rx="3"
                fill={hasShortfall ? '#f97316' : '#10b981'}
                className="transition-all duration-200 group-hover:brightness-110"
              />

              {/* Shortfall Cap if prominent */}
              {item.shortfall > 0 && (
                <rect
                  x={x}
                  y={plannedY}
                  width="24"
                  height={Math.max(2, actualY - plannedY)}
                  rx="2"
                  fill="#ef4444"
                  fillOpacity="0.4"
                  stroke="#ef4444"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}

              {/* Date label */}
              <text
                x={x + 12}
                y={chartHeight + 16}
                textAnchor="middle"
                fill={hoveredItem?.date === item.date ? '#f59e0b' : '#94a3b8'}
                fontSize="9"
                fontWeight={hoveredItem?.date === item.date ? 'bold' : 'normal'}
                fontFamily="monospace"
              >
                {item.date.includes(' ') ? item.date.split(' ')[0] : item.date}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Chart Legend */}
      <div className="flex items-center justify-end space-x-4 text-[11px] text-slate-400 mt-2 px-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
          <span>Actual (On Target)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block"></span>
          <span>Actual (Under Target)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded border border-rose-500 bg-rose-500/40 inline-block"></span>
          <span>Shortfall Deficit</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-0.5 border-b-2 border-amber-500 border-dashed inline-block"></span>
          <span>Planned Target</span>
        </div>
      </div>
    </div>
  );
};
