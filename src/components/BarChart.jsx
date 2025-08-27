// src/components/BarChart.jsx
import React from 'react';

const BarChart = ({ data = [], width = 400, height = 160 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value || 0), 1);
  const rowH = height / data.length;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {data.map((d, i) => {
        const barWidth = (d.value / max) * (width - 120);
        return (
          <g key={i} transform={`translate(0, ${i * rowH + 6})`}>
            <text x={8} y={12} fontSize="12" fill="#333">{d.label}</text>
            <rect x={110} y="0" width={barWidth} height={rowH - 12} rx={6} ry={6} fill="#28a745" opacity="0.9" />
            <text x={110 + barWidth + 8} y={12} fontSize="12" fill="#333">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

export default BarChart;
