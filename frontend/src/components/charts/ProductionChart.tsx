import React, { useState } from 'react';
import { ProductionHistoryItem } from '../../types';

interface ProductionChartProps {
  data: ProductionHistoryItem[];
  height?: number;
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ data, height = 240 }) => {
  const [hoveredItem, setHoveredItem] = useState<ProductionHistoryItem | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-[#8293A3] text-xs text-center py-8">No production trend data available</div>;
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.planned, d.actual, 1200)));
  const chartHeight = height - 40;

  const formatAxisDate = (d: string) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = parseInt(parts[1], 10);
      const day = parts[2].split(' ')[0];
      return `${day} ${months[m - 1] || parts[1]}`;
    }
    return d.includes(' ') ? d.split(' ')[0] : d;
  };

  return (
    <div className="w-full relative select-none">
      {/* Tooltip Overlay */}
      {hoveredItem && (
        <div className="absolute top-0 right-2 z-20 bg-[#FAFAF7] border border-[#DDE0DC] rounded-md p-3 text-xs shadow-[0_2px_8px_rgba(20,30,40,0.12)] pointer-events-none transition-all min-w-[190px]">
          <div className="font-semibold text-[#18324A] border-b border-[#F1F0EB] pb-1 mb-1.5 flex items-center justify-between">
            <span>{hoveredItem.date}</span>
            <span className="text-[10px] text-[#8293A3] uppercase font-mono">Shift Log</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <span className="text-[#5F7487]">Planned Target:</span>
            <span className="text-[#18324A] font-mono font-medium text-right">{hoveredItem.planned} t</span>
            <span className="text-[#5F7487]">Actual Output:</span>
            <span className="text-[#16866A] font-mono font-semibold text-right">{hoveredItem.actual} t</span>
            <span className="text-[#5F7487]">Variance:</span>
            <span className={`font-mono text-right font-semibold ${hoveredItem.shortfall > 0 ? 'text-[#C94747]' : 'text-[#16866A]'}`}>
              {hoveredItem.shortfall > 0 ? `-${hoveredItem.shortfall} t` : '0 t'}
            </span>
            {hoveredItem.blasting_delay_h > 0 && (
              <>
                <span className="text-[#5F7487]">Blast Delay:</span>
                <span className="text-[#C47A00] font-mono text-right">{hoveredItem.blasting_delay_h} h</span>
              </>
            )}
            {hoveredItem.rainfall_mm > 0 && (
              <>
                <span className="text-[#5F7487]">Rainfall:</span>
                <span className="text-[#2878A8] font-mono text-right">{hoveredItem.rainfall_mm} mm</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* SVG Bar & Line Chart */}
      <svg className="w-full overflow-visible" height={height} viewBox={`0 0 ${data.length * 52 + 50} ${height}`}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((fraction, i) => {
          const y = chartHeight - (chartHeight * fraction);
          const val = Math.round(maxVal * fraction);
          return (
            <g key={i}>
              <line
                x1={40}
                y1={y}
                x2={data.length * 52 + 40}
                y2={y}
                stroke="#F1F0EB"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={32}
                y={y + 3}
                fill="#8293A3"
                fontSize={10}
                fontFamily="ui-monospace, monospace"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Baseline at y = 0 */}
        <line
          x1={40}
          y1={chartHeight}
          x2={data.length * 52 + 40}
          y2={chartHeight}
          stroke="#DDE0DC"
          strokeWidth={1}
        />

        {/* Bars and Target markers */}
        {data.map((item, index) => {
          const x = 50 + index * 52;
          const actualHeight = Math.max(4, (item.actual / maxVal) * chartHeight);
          const actualY = chartHeight - actualHeight;
          const plannedY = chartHeight - (item.planned / maxVal) * chartHeight;
          const shortfallHeight = Math.max(0, (item.shortfall / maxVal) * chartHeight);
          const shortfallY = chartHeight - ((item.actual + item.shortfall) / maxVal) * chartHeight;

          const isDeficit = item.shortfall > 0;
          const barColor = isDeficit ? '#C47A00' : '#16866A'; // Amber if under, Green if on target

          return (
            <g
              key={index}
              className="cursor-pointer transition-opacity hover:opacity-85"
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Shortfall Deficit (hollow striped or light red cap) */}
              {isDeficit && (
                <rect
                  x={x}
                  y={shortfallY}
                  width={20}
                  height={shortfallHeight}
                  fill="#C94747"
                  fillOpacity={0.12}
                  stroke="#C94747"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  rx={3}
                />
              )}

              {/* Actual Extraction Solid Bar */}
              <rect
                x={x}
                y={actualY}
                width={20}
                height={actualHeight}
                fill={barColor}
                rx={3}
              />

              {/* Planned Target Dash Line Indicator */}
              <line
                x1={x - 3}
                y1={plannedY}
                x2={x + 23}
                y2={plannedY}
                stroke="#18324A"
                strokeWidth={1.5}
                strokeDasharray="3 2"
              />

              {/* Date label at bottom */}
              <text
                x={x + 10}
                y={chartHeight + 16}
                fill="#8293A3"
                fontSize={10}
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {formatAxisDate(item.date)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Clean Industrial Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-[#5F7487] pt-3 border-t border-[#F1F0EB] mt-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#16866A]"></span>
            <span>Actual (On Target)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#C47A00]"></span>
            <span>Actual (Under Target)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm border border-[#C94747] bg-[#C94747]/10"></span>
            <span>Shortfall Deficit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-[#18324A]"></span>
            <span>Daily Planned Target</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#8293A3]">
          Target Run Rate: 1,000 t/day
        </div>
      </div>
    </div>
  );
};
