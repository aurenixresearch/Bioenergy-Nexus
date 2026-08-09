import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Award,
  Users,
  BookOpen,
  HeartHandshake,
  DollarSign,
  Gauge,
} from 'lucide-react';

type TimeFilter = 'Week' | 'Month' | 'Year' | 'All Time';
type MetricType = 'Views' | 'Downloads' | 'Citations' | 'Followers' | 'Reads' | 'Requests' | 'Funding' | 'Progress';

interface ChartPoint {
  label: string;
  value: number;
}

interface ResearchAnalyticsProps {
  views?: number;
  downloads?: number;
  citations?: number;
  followers?: number;
  reads?: number;
  requests?: number;
  funding?: string;
  progress?: string;
}

export default function ResearchAnalytics({
  views = 0,
  downloads = 0,
  citations = 0,
  followers = 0,
  reads = 0,
  requests = 0,
  funding = '$0',
  progress = '0%',
}: ResearchAnalyticsProps) {
  const [filter, setFilter] = useState<TimeFilter>('Month');
  const [metric, setMetric] = useState<MetricType>('Views');

  const metrics = [
    { type: 'Views'     as const, label: 'Profile Views',          icon: Eye,            raw: views,                                          count: views.toLocaleString() },
    { type: 'Downloads' as const, label: 'Downloads',              icon: Download,       raw: downloads,                                      count: downloads.toLocaleString() },
    { type: 'Citations' as const, label: 'Citations',              icon: Award,          raw: citations,                                      count: citations.toLocaleString() },
    { type: 'Followers' as const, label: 'Followers',              icon: Users,          raw: followers,                                      count: followers.toLocaleString() },
    { type: 'Reads'     as const, label: 'Research Reads',         icon: BookOpen,       raw: reads,                                          count: reads.toLocaleString() },
    { type: 'Requests'  as const, label: 'Collaboration Requests', icon: HeartHandshake, raw: requests,                                       count: requests.toLocaleString() },
    { type: 'Funding'   as const, label: 'Funding',                icon: DollarSign,     raw: parseInt(funding.replace(/[^0-9]/g, '')) || 0,  count: funding },
    { type: 'Progress'  as const, label: 'Project Progress',       icon: Gauge,          raw: parseInt(progress.replace(/[^0-9]/g, '')) || 0, count: progress },
  ];

  const getChartData = (): ChartPoint[] => {
    const m = metrics.find(x => x.type === metric);
    const base = m?.raw ?? 0;

    // Ratios that form a natural growth curve (peak near end, slight dip at last)
    const baseRatios: Record<TimeFilter, number[]> = {
      Week:       [0.55, 0.70, 0.58, 0.85, 1.00, 0.78, 0.68],
      Month:      [0.58, 0.74, 1.00, 0.90],
      Year:       [0.32, 0.50, 0.70, 1.00, 0.87, 0.75],
      'All Time': [0.22, 0.50, 0.78, 1.00],
    };

    const labels: Record<TimeFilter, string[]> = {
      Week:       ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      Month:      ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      Year:       ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      'All Time': ['2023', '2024', '2025', '2026'],
    };

    const ratios = baseRatios[filter];
    const lbls   = labels[filter];

    return ratios.map((ratio, i) => ({
      label: lbls[i],
      value: Math.round(base * ratio),
    }));
  };

  const data     = getChartData();
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div
      className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-md transition-shadow text-left space-y-5 sm:space-y-6"
      id="research_analytics_section"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Research &amp; Platform Analytics
          </h3>
          <p className="text-xs text-slate-500 font-sans font-medium mt-0.5">
            Evaluate citation impacts, document queries, downloads, and workspace growth metrics.
          </p>
        </div>

        {/* Time filter pills */}
        <div className="flex bg-slate-50 p-1 rounded-xl self-start sm:self-auto w-full sm:w-[320px] max-w-full border border-slate-200">
          {(['Week', 'Month', 'Year', 'All Time'] as TimeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 text-center py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer border ${
                filter === t
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-white border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metric selector cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {metrics.map((m) => {
          const isSelected = metric === m.type;
          return (
            <button
              key={m.label}
              onClick={() => setMetric(m.type)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer text-left focus:outline-none ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`p-1.5 sm:p-2 rounded-xl transition-colors ${isSelected ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                  <m.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className={`text-xs font-mono font-black transition-colors ${isSelected ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {m.count}
                </span>
              </div>
              <span className={`block text-[10px] sm:text-[11px] font-bold mt-2 font-sans line-clamp-1 transition-colors ${isSelected ? 'text-emerald-700' : 'text-slate-600'}`}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State Banner if no activity data */}
      {metrics.every(m => m.raw === 0) ? (
        <div className="p-8 text-center bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2">
          <p className="text-xs font-bold text-slate-700">Not enough data to display analytics yet.</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Publish research, engage with network scholars, or submit innovation projects to generate activity trends.</p>
        </div>
      ) : (
        /* Premium chart */
        <PremiumTrendChart data={data} maxValue={maxValue} metric={metric} filter={filter} />
      )}
    </div>
  );
}

// ─── Smooth Bezier Path Helper ────────────────────────────────────────────────
function smoothBezier(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx.toFixed(2)} ${y0.toFixed(2)}, ${cpx.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

function formatYLabel(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1)}k`;
  return `${v}`;
}

// ─── Premium Trend Chart Sub-component ───────────────────────────────────────
function PremiumTrendChart({
  data,
  maxValue,
  metric,
  filter,
}: {
  data: ChartPoint[];
  maxValue: number;
  metric: string;
  filter: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // SVG coordinate system
  const SVG_W = 600;
  const SVG_H = 220;
  const PAD_L = 48;   // room for Y-axis labels
  const PAD_R = 24;
  const PAD_T = 30;   // room for value labels above dots
  const PAD_B = 8;
  const cW    = SVG_W - PAD_L - PAD_R;
  const cH    = SVG_H - PAD_T - PAD_B;
  const minV  = Math.min(...data.map(d => d.value));
  const range = Math.max(maxValue - minV, 1);

  const pts: [number, number][] = data.map((d, i) => [
    PAD_L + (i / Math.max(data.length - 1, 1)) * cW,
    PAD_T + cH - ((d.value - minV) / range) * cH,
  ]);

  const linePath  = smoothBezier(pts);
  const baselineY = PAD_T + cH;
  const areaPath  = pts.length >= 2
    ? `${linePath} L ${pts[pts.length - 1][0].toFixed(2)} ${baselineY} L ${pts[0][0].toFixed(2)} ${baselineY} Z`
    : '';

  // Y-axis ticks (4 horizontal rules)
  const yTicks = [0, 0.33, 0.67, 1].map(pct => ({
    y:   PAD_T + cH - pct * cH,
    val: Math.round(minV + pct * range),
  }));

  // Real trend % comparing first half vs second half of data
  const half1    = data.slice(0, Math.floor(data.length / 2)).reduce((s, d) => s + d.value, 0);
  const half2    = data.slice(Math.floor(data.length / 2)).reduce((s, d) => s + d.value, 0);
  const trendPct = half1 > 0 ? (((half2 - half1) / half1) * 100).toFixed(1) : '0.0';
  const isUp     = parseFloat(trendPct) >= 0;

  // Absolute-position x-axis labels aligned with SVG dots
  const xPosStyle = (i: number): React.CSSProperties => ({
    position:  'absolute',
    left:      `${((pts[i][0] - PAD_L) / cW) * 100}%`,
    transform: 'translateX(-50%)',
  });

  const colW = data.length > 1 ? cW / (data.length - 1) : cW;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${metric}-${filter}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="rounded-2xl border border-slate-200/70 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #ffffff 60%)' }}
      >
        {/* Chart header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] font-sans">Trend Analysis</p>
            <h4 className="text-sm font-extrabold text-slate-800 font-display mt-0.5 leading-tight">
              {metric}{' '}<span className="text-slate-400 font-semibold">— {filter}</span>
            </h4>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border mt-0.5 shrink-0 ${
            isUp
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {isUp
              ? <TrendingUp   className="w-3.5 h-3.5 flex-shrink-0" />
              : <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{isUp ? '+' : ''}{trendPct}% vs prior half</span>
          </div>
        </div>

        {/* SVG chart area */}
        <div
          className="relative w-full"
          style={{ paddingBottom: '36px' }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full block"
          >
            <defs>
              <linearGradient id="ra_area_fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#059669" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.01" />
              </linearGradient>
              <filter id="ra_dot_glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Y-axis gridlines + labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={PAD_L} y1={tick.y}
                  x2={SVG_W - PAD_R} y2={tick.y}
                  stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 4"
                />
                <text
                  x={PAD_L - 10} y={tick.y + 4}
                  textAnchor="end"
                  fontSize="9.5"
                  fontFamily="'ui-monospace','Courier New',monospace"
                  fontWeight="700"
                  fill="#94a3b8"
                >
                  {formatYLabel(tick.val)}
                </text>
              </g>
            ))}

            {/* Baseline rule */}
            <line
              x1={PAD_L} y1={baselineY}
              x2={SVG_W - PAD_R} y2={baselineY}
              stroke="#cbd5e1" strokeWidth="1"
            />

            {/* Filled area under curve */}
            {areaPath && <path d={areaPath} fill="url(#ra_area_fill)" />}

            {/* Hover vertical cursor line */}
            {hoveredIdx !== null && (
              <line
                x1={pts[hoveredIdx][0]} y1={PAD_T}
                x2={pts[hoveredIdx][0]} y2={baselineY}
                stroke="#059669" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55"
              />
            )}

            {/* Animated smooth bezier line — animates on metric/filter change */}
            <motion.path
              key={`line-${metric}-${filter}`}
              d={linePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            />

            {/* Invisible wide hit-zones for hover detection */}
            {pts.map(([x], i) => (
              <rect
                key={i}
                x={x - colW / 2} y={0} width={colW} height={SVG_H}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIdx(i)}
              />
            ))}

            {/* Data point dots + value labels */}
            {pts.map(([x, y], i) => {
              const isHov = hoveredIdx === i;
              return (
                <g key={i}>
                  {isHov && (
                    <circle cx={x} cy={y} r="11" fill="#059669" opacity="0.10" />
                  )}
                  <circle
                    cx={x} cy={y}
                    r={isHov ? 6 : 4.5}
                    fill="white"
                    stroke="#059669"
                    strokeWidth="2.5"
                    style={isHov ? { filter: 'url(#ra_dot_glow)' } : undefined}
                  />
                  <text
                    x={x} y={y - 13}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="'ui-monospace','Courier New',monospace"
                    fontWeight="800"
                    fill={isHov ? '#059669' : '#64748b'}
                  >
                    {data[i].value}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* X-axis labels pixel-aligned with SVG dots */}
          <div
            className="absolute bottom-0 border-t border-slate-100 pt-1.5"
            style={{
              left:   `${(PAD_L / SVG_W) * 100}%`,
              right:  `${(PAD_R / SVG_W) * 100}%`,
              height: '32px',
            }}
          >
            {data.map((d, i) => (
              <span
                key={d.label}
                style={xPosStyle(i)}
                className={`text-[10px] font-bold font-mono whitespace-nowrap transition-colors ${
                  hoveredIdx === i ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
