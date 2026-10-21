import React, { memo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { renderStatIcon } from '../constants/icons.jsx';

/**
 * Reusable Radar Chart Component for Multi-Metric Comparison
 *
 * Visualizes multi-metric benchmarking and comparisons across selected entities.
 * Supports interactive entity selection, hovering, custom axis ticks with icons,
 * and customizable radii/opacities.
 */
const DefaultRadarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#121212] border border-white/20 p-3 rounded-lg shadow-2xl min-w-[140px] animate-scale-in">
      <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2 border-b border-white/5 pb-1">
        {payload[0]?.payload?.subject || label || 'METRIC'}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.color }} />
              <span className="text-[9px] font-bold text-white uppercase">{entry.name}</span>
            </div>
            <span className="text-[9px] font-black text-zinc-300 tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RadarChartComparison = memo(({
  chartData = [],
  entities = [],
  selectedIdSet = new Set(),
  hoveredId = null,
  activeStats = [],
  onEntityClick = null,
  customTooltip = null,
  outerRadius = '80%',
  cx = '50%',
  cy = '50%',
  isAnimationActive = false,
  showPolarRadius = true,
  strokeWidthActive = 2.5,
  strokeWidthInactive = 1.2,
  fillOpacityActive = 0.4,
  fillOpacityInactive = 0.12,
  gridStroke = 'rgba(255, 255, 255, 0.06)',
  className = '',
}) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[10px] font-black uppercase text-zinc-600">
        No metric data available for comparison
      </div>
    );
  }

  // Identify visible entities to display
  const displayEntities = entities.filter(e => e.visible !== false);
  const hasSelection = selectedIdSet.size > 0;

  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RadarChart cx={cx} cy={cy} outerRadius={outerRadius} data={chartData}>
        <PolarGrid stroke={gridStroke} />

        <PolarAngleAxis
          dataKey="subject"
          tick={({ x, y, payload }) => {
            const stat = activeStats?.find(s => s.name === payload.value);
            return (
              <g transform={`translate(${x},${y})`}>
                <text dy={19} textAnchor="middle" fill="#8a8a8a" fontSize={9} fontWeight={900}>
                  {payload.value}
                </text>
                {stat && (
                  <foreignObject x="-8" y="-13" width="16" height="16">
                    <div className="flex items-center justify-center text-zinc-600">
                      {renderStatIcon(stat, 14)}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          }}
        />

        {showPolarRadius && (
          <PolarRadiusAxis
            angle={90}
            domain={['auto', 'auto']}
            tick={{ fill: '#e9e9e9', fontSize: 10, fontWeight: 700 }}
            axisLine={true}
          />
        )}

        <Tooltip content={customTooltip || <DefaultRadarTooltip />} />

        {displayEntities.map(entity => {
          const isSelected = selectedIdSet.has(entity.id);
          const isHovered = hoveredId === entity.id;

          // Compute dynamic opacities and widths based on selection and hover states
          let fillOpacity = fillOpacityInactive;
          let strokeWidth = strokeWidthInactive;

          if (isSelected) {
            fillOpacity = fillOpacityActive;
            strokeWidth = strokeWidthActive;
          } else if (isHovered) {
            fillOpacity = fillOpacityActive * 0.85;
            strokeWidth = strokeWidthActive * 0.8;
          } else if (hasSelection || hoveredId) {
            // De-emphasize non-selected entities when comparison focus is active
            fillOpacity = 0.04;
            strokeWidth = 0.8;
          }

          return (
            <Radar
              key={entity.id}
              name={entity.name}
              dataKey={entity.id}
              stroke={entity.color}
              fill={entity.color}
              isAnimationActive={isAnimationActive}
              fillOpacity={fillOpacity}
              strokeWidth={strokeWidth}
              className="cursor-pointer outline-none hover-brightness transition-all duration-200"
              onClick={() => onEntityClick && onEntityClick(entity.id)}
            />
          );
        })}
      </RadarChart>
    </ResponsiveContainer>
  );
});

RadarChartComparison.displayName = 'RadarChartComparison';
export default RadarChartComparison;
