import React from 'react';
import { StudentCompetency } from '../../types';

interface RadarChartProps {
  competencies: StudentCompetency[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ competencies, size = 260 }) => {
  const center = size / 2;
  const radius = center - 36;
  const total = competencies.length;

  // Compute polygon points for concentric rings (levels 25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Student data points
  const points = competencies.map((c, i) => {
    const ratio = c.score / c.maxScore;
    const { x, y } = getCoordinates(i, ratio);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg width={size} height={size} className="overflow-visible">
        {/* Concentric Web Polygons */}
        {levels.map((level, lvlIdx) => {
          const polyPoints = competencies.map((_, i) => {
            const { x, y } = getCoordinates(i, level);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={lvlIdx}
              points={polyPoints}
              fill={lvlIdx === levels.length - 1 ? '#f8faff' : 'none'}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvlIdx < levels.length - 1 ? '3 3' : 'none'}
            />
          );
        })}

        {/* Radial Axis Lines */}
        {competencies.map((_, i) => {
          const { x, y } = getCoordinates(i, 1);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Student Value Polygon */}
        <polygon
          points={points}
          fill="rgba(0, 40, 142, 0.18)"
          stroke="#00288e"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Vertex Dots & Score Tooltips */}
        {competencies.map((c, i) => {
          const ratio = c.score / c.maxScore;
          const { x, y } = getCoordinates(i, ratio);
          return (
            <g key={i} className="cursor-pointer group">
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#00288e"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-transform group-hover:scale-150"
              />
            </g>
          );
        })}

        {/* Competency Labels */}
        {competencies.map((c, i) => {
          const labelCoords = getCoordinates(i, 1.22);
          return (
            <text
              key={i}
              x={labelCoords.x}
              y={labelCoords.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-bold fill-slate-600 select-none font-cairo"
            >
              {c.name} ({c.score}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
};
