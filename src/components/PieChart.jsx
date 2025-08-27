// src/components/PieChart.jsx
import React from 'react';

const PieChart = ({ data = [], size = 140 }) => {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  let angle = 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  const slices = data.map((d, i) => {
    const value = d.value || 0;
    const frac = value / total;
    const start = angle;
    const end = angle + frac * 2 * Math.PI;
    angle = end;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const colors = ['#28a745', '#0d6efd', '#ffc107', '#dc3545', '#6c757d', '#20c997'];
    return <path d={path} key={i} fill={colors[i % colors.length]} stroke="#fff" strokeWidth="0.5" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
    </svg>
  );
};

export default PieChart;
