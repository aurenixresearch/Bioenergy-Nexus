import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Download, 
  Award, 
  Users, 
  BookOpen, 
  HeartHandshake, 
  DollarSign, 
  Gauge,
  Calendar
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
  progress = '0%'
}: ResearchAnalyticsProps) {
  const [filter, setFilter] = useState<TimeFilter>('Month');
  const [metric, setMetric] = useState<MetricType>('Views');

  const metrics = [
    { type: 'Views' as const, label: 'Profile Views', icon: Eye, color: 'text-white', bgColor: '#1d0d0d', count: views.toLocaleString() },
    { type: 'Downloads' as const, label: 'Downloads', icon: Download, color: 'text-white', bgColor: '#000000', count: downloads.toLocaleString() },
    { type: 'Citations' as const, label: 'Citations', icon: Award, color: 'text-white', bgColor: '#000000', count: citations.toLocaleString() },
    { type: 'Followers' as const, label: 'Followers', icon: Users, color: 'text-white', bgColor: '#000000', count: followers.toLocaleString() },
    { type: 'Reads' as const, label: 'Research Reads', icon: BookOpen, color: 'text-white', bgColor: '#1d0d0d', count: reads.toLocaleString() },
    { type: 'Requests' as const, label: 'Collaboration Requests', icon: HeartHandshake, color: 'text-white', bgColor: '#000000', count: requests.toLocaleString() },
    { type: 'Funding' as const, label: 'Funding', icon: DollarSign, color: 'text-white', bgColor: '#000000', count: funding },
    { type: 'Progress' as const, label: 'Project Progress', icon: Gauge, color: 'text-white', bgColor: '#000000', count: progress }
  ];

  // Realistic data depending on metric & time filter
  const getChartData = (): ChartPoint[] => {
    let currentVal = 0;
    if (metric === 'Views') currentVal = views;
    else if (metric === 'Downloads') currentVal = downloads;
    else if (metric === 'Citations') currentVal = citations;
    else if (metric === 'Followers') currentVal = followers;
    else if (metric === 'Reads') currentVal = reads;
    else if (metric === 'Requests') currentVal = requests;
    else if (metric === 'Funding') currentVal = parseInt(funding.replace(/[^0-9]/g, '')) || 0;
    else if (metric === 'Progress') currentVal = parseInt(progress.replace(/[^0-9]/g, '')) || 0;

    const baseRatios = {
      Week: [0.08, 0.15, 0.07, 0.22, 0.25, 0.10, 0.13],
      Month: [0.18, 0.23, 0.31, 0.28],
      Year: [0.05, 0.10, 0.18, 0.26, 0.22, 0.19],
      'All Time': [0.10, 0.22, 0.33, 0.35]
    };

    const labels = {
      Week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      Month: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      Year: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      'All Time': ['2023', '2024', '2025', '2026']
    };

    const ratios = baseRatios[filter] || baseRatios.Month;
    const lbls = labels[filter] || labels.Month;

    return ratios.map((ratio, index) => {
      const calculatedVal = Math.round((currentVal || 10) * ratio);
      return {
        label: lbls[index],
        value: calculatedVal
      };
    });
  };

  const data = getChartData();
  const maxValue = Math.max(...data.map(d => d.value), 10);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm hover:shadow-md transition-shadow text-left space-y-5 sm:space-y-6" id="research_analytics_section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Research & Platform Analytics
          </h3>
          <p className="text-xs text-slate-500 font-sans font-medium mt-0.5">
            Evaluate citation impacts, document queries, downloads, and workspace growth metrics.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex bg-white p-1 rounded-xl self-start sm:self-auto w-full sm:w-[320px] max-w-full border border-slate-200">
          {(['Week', 'Month', 'Year', 'All Time'] as TimeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 text-center py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer border ${
                filter === t 
                  ? 'bg-[#00bc7d] hover:bg-[#00a36c] text-white border-[#00bc7d] shadow-xs' 
                  : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border-transparent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Selectable Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {metrics.map((m) => {
          const isSelected = metric === m.type;
          return (
            <button
              key={m.label}
              onClick={() => setMetric(m.type)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer text-left ${
                isSelected 
                  ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/20' 
                  : 'bg-white border-slate-200/80 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`p-1.5 sm:p-2 rounded-xl ${m.color}`} style={{ backgroundColor: m.bgColor }}>
                  <m.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs font-mono font-black text-slate-900">{m.count}</span>
              </div>
              <span className="block text-[10px] sm:text-[11px] font-bold text-slate-600 mt-2 font-sans line-clamp-1">
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Responsive SVG Line & Area Chart */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="flex justify-between items-center text-xs font-sans text-slate-500 mb-4 px-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Trend Analysis - {metric}</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            +14.2% from previous interval
          </span>
        </div>

        {/* SVG Wrapper */}
        <div className="relative w-full h-48 sm:h-64 mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" className="dark:stroke-slate-800" />
            <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" className="dark:stroke-slate-800" />
            <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" className="dark:stroke-slate-800" />

            {/* Area under curve */}
            <path
              d={`
                M 0 180
                ${data.map((d, index) => {
                  const x = (index / (data.length - 1)) * 500;
                  const y = 180 - (d.value / maxValue) * 140;
                  return `L ${x} ${y}`;
                }).join(' ')}
                L 500 180
                Z
              `}
              fill="url(#chart_grad)"
              opacity="0.15"
            />

            {/* Main line */}
            <path
              d={data.map((d, index) => {
                const x = (index / (data.length - 1)) * 500;
                const y = 180 - (d.value / maxValue) * 140;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="chart_grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Interactive Points */}
            {data.map((d, index) => {
              const x = (index / (data.length - 1)) * 500;
              const y = 180 - (d.value / maxValue) * 140;
              return (
                <g key={d.label}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-white dark:fill-slate-900 stroke-emerald-600 stroke-[2.5]"
                  />
                  {/* Tooltip or Label text */}
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="text-[8px] font-mono font-black fill-slate-700 dark:fill-slate-300 font-sans"
                  >
                    {d.value}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* X Axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-150 dark:border-slate-800">
            {data.map(d => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
