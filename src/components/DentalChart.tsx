'use client';

import { useState } from 'react';

type ChartEntry = {
  id: string;
  tooth: number;
  condition: string;
  notes: string | null;
};

type DentalChartProps = {
  entries: ChartEntry[];
  onToothClick: (tooth: number) => void;
  readOnly?: boolean;
};

const conditionColors: Record<string, string> = {
  HEALTHY: '#22c55e',
  DECAYED: '#ef4444',
  FILLED: '#3b82f6',
  CROWN: '#8b5cf6',
  MISSING: '#9ca3af',
  EXTRACTED: '#4b5563',
  ROOT_CANAL: '#f97316',
  IMPLANT: '#14b8a6',
  BRIDGE: '#6366f1',
  CRACKED: '#eab308',
  ABSCESS: '#dc2626',
  WEAR: '#a16207',
};

const conditionLabels: Record<string, string> = {
  HEALTHY: 'Healthy',
  DECAYED: 'Decayed',
  FILLED: 'Filled',
  CROWN: 'Crown',
  MISSING: 'Missing',
  EXTRACTED: 'Extracted',
  ROOT_CANAL: 'Root Canal',
  IMPLANT: 'Implant',
  BRIDGE: 'Bridge',
  CRACKED: 'Cracked',
  ABSCESS: 'Abscess',
  WEAR: 'Wear',
};

export default function DentalChart({ entries, onToothClick, readOnly = false }: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);

  const getEntry = (tooth: number) => entries.find((e) => e.tooth === tooth);

  const renderTooth = (tooth: number, x: number, y: number) => {
    const entry = getEntry(tooth);
    const condition = entry?.condition || 'HEALTHY';
    const color = conditionColors[condition] || '#22c55e';
    const isHovered = hoveredTooth === tooth;

    const width = 42;
    const height = 52;
    const rx = 8;

    return (
      <g
        key={tooth}
        transform={`translate(${x}, ${y})`}
        onClick={() => !readOnly && onToothClick(tooth)}
        onMouseEnter={() => setHoveredTooth(tooth)}
        onMouseLeave={() => setHoveredTooth(null)}
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
      >
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={rx}
          fill={color}
          stroke={isHovered ? '#1f2937' : '#e5e7eb'}
          strokeWidth={isHovered ? 2.5 : 1.5}
          opacity={isHovered ? 0.9 : 1}
          style={{ transition: 'all 0.15s ease' }}
        />
        <text
          y={-2}
          textAnchor="middle"
          fill="white"
          fontSize="13"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {tooth}
        </text>
        <text
          y={14}
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontWeight="500"
          opacity={0.9}
          style={{ pointerEvents: 'none' }}
        >
          {condition === 'HEALTHY' ? '' : condition.slice(0, 3)}
        </text>
        {isHovered && (
          <g transform={`translate(0, ${-height / 2 - 35})`}>
            <rect x={-60} y={-20} width={120} height={28} rx={6} fill="#1f2937" />
            <text y={-2} textAnchor="middle" fill="white" fontSize="11" fontWeight="500">
              Tooth {tooth}: {conditionLabels[condition]}
            </text>
          </g>
        )}
      </g>
    );
  };

  const spacing = 50;
  const startX = 35;
  const topY = 70;
  const bottomY = 170;
  const midlineX = startX + spacing * 8;

  const topTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const bottomTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 840 280" className="w-full max-w-4xl mx-auto" style={{ minWidth: '700px' }}>
        <rect x="0" y="0" width="840" height="280" rx="12" fill="#f9fafb" />
        <text x="420" y="28" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="600">
          Universal Numbering System
        </text>
        <line x1={midlineX} y1={30} x2={midlineX} y2={250} stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="6,4" />
        <text x={midlineX + 5} y={245} fill="#9ca3af" fontSize="10">Midline</text>
        <text x="20" y={topY + 5} fill="#6b7280" fontSize="12" fontWeight="500">Upper</text>
        <text x="20" y={bottomY + 5} fill="#6b7280" fontSize="12" fontWeight="500">Lower</text>

        {topTeeth.map((tooth, i) => renderTooth(tooth, startX + i * spacing, topY))}
        {bottomTeeth.map((tooth, i) => renderTooth(tooth, startX + i * spacing, bottomY))}

        <g transform="translate(20, 245)">
          {Object.entries(conditionColors).slice(0, 6).map(([cond, color], i) => (
            <g key={cond} transform={`translate(${i * 110}, 0)`}>
              <rect width="12" height="12" rx="3" fill={color} />
              <text x="18" y="10" fill="#6b7280" fontSize="10">{conditionLabels[cond]}</text>
            </g>
          ))}
        </g>
        <g transform="translate(20, 262)">
          {Object.entries(conditionColors).slice(6).map(([cond, color], i) => (
            <g key={cond} transform={`translate(${i * 110}, 0)`}>
              <rect width="12" height="12" rx="3" fill={color} />
              <text x="18" y="10" fill="#6b7280" fontSize="10">{conditionLabels[cond]}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}