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

export default function ResearchAnalytics() {
  const [filter, setFilter] = useState<TimeFilter>('Month');
  const [metric, setMetric] = useState<MetricType>('Views');

  const metrics = [
    { type: 'Views' as const, label: 'Profile Views', icon: Eye, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20', count: '1,429' },
    { type: 'Downloads' as const, label: 'Downloads', icon: Download, color: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/20', count: '382' },
    { type: 'Citations' as const, label: 'Citations', icon: Award, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20', count: '19' },
    { type: 'Followers' as const, label: 'Followers', icon: Users, color: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/20', count: '142' },
    { type: 'Reads' as const, label: 'Research Reads', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20', count: '891' },
    { type: 'Requests' as const, label: 'Collaboration Requests', icon: HeartHandshake, color: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/20', count: '34' },
    { type: 'Funding' as const, label: 'Funding', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20', count: '$120K' },
    { type: 'Progress' as const, label: 'Project Progress', icon: Gauge, color: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/20', count: '78%' }
  ];

  // Realistic data depending on metric & time filter
  const getChartData = (): ChartPoint[] => {
    switch (filter) {
      case 'Week':
        return [
          { label: 'Mon', value: metric === 'Views' ? 24 : metric === 'Downloads' ? 8 : 12 },
          { label: 'Tue', value: metric === 'Views' ? 42 : metric === 'Downloads' ? 14 : 18 },
          { label: 'Wed', value: metric === 'Views' ? 18 : metric === 'Downloads' ? 6 : 9 },
          { label: 'Thu', value: metric === 'Views' ? 55 : metric === 'Downloads' ? 22 : 28 },
          { label: 'Fri', value: metric === 'Views' ? 68 : metric === 'Downloads' ? 30 : 34 },
          { label: 'Sat', value: metric === 'Views' ? 30 : metric === 'Downloads' ? 12 : 15 },
          { label: 'Sun', value: metric === 'Views' ? 38 : metric === 'Downloads' ? 16 : 20 }
        ];
      case 'Month':
        return [
          { label: 'Week 1', value: metric === 'Views' ? 240 : metric === 'Downloads' ? 60 : 120 },
          { label: 'Week 2', value: metric === 'Views' ? 310 : metric === 'Downloads' ? 95 : 150 },
          { label: 'Week 3', value: metric === 'Views' ? 420 : metric === 'Downloads' ? 130 : 210 },
          { label: 'Week 4', value: metric === 'Views' ? 459 : metric === 'Downloads' ? 97 : 190 }
        ];
      case 'Year':
        return [
          { label: 'Jan', value: metric === 'Views' ? 80 : metric === 'Downloads' ? 20 : 40 },
          { label: 'Mar', value: metric === 'Views' ? 150 : metric === 'Downloads' ? 45 : 75 },
          { label: 'May', value: metric === 'Views' ? 290 : metric === 'Downloads' ? 80 : 130 },
          { label: 'Jul', value: metric === 'Views' ? 420 : metric === 'Downloads' ? 110 : 190 },
          { label: 'Sep', value: metric === 'Views' ? 380 : metric === 'Downloads' ? 95 : 170 },
          { label: 'Nov', value: metric === 'Views' ? 510 : metric === 'Downloads' ? 160 : 260 }
        ];
      case 'All Time':
        return [
          { label: '2023', value: metric === 'Views' ? 1200 : metric === 'Downloads' ? 300 : 500 },
          { label: '2024', value: metric === 'Views' ? 2800 : metric === 'Downloads' ? 850 : 1300 },
          { label: '2025', value: metric === 'Views' ? 4500 : metric === 'Downloads' ? 1200 : 2400 },
          { label: '2026', value: metric === 'Views' ? 6100 : metric === 'Downloads' ? 1900 : 3800 }
        ];
    }
  };

  const data = getChartData();
  const maxValue = Math.max(...data.map(d => d.value), 10);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md text-left space-y-6" id="research_analytics_section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Research & Platform Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium mt-0.5">
            Evaluate citation impacts, document queries, downloads, and workspace growth metrics.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {(['Week', 'Month', 'Year', 'All Time'] as TimeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${
                filter === t 
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Selectable Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const isSelected = metric === m.type;
          return (
            <button
              key={m.label}
              onClick={() => setMetric(m.type)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                isSelected 
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/50 shadow-xs' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`p-2 rounded-xl ${m.color}`}>
                  <m.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white">{m.count}</span>
              </div>
              <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-2 font-sans line-clamp-1">
                {m.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Responsive SVG Line & Area Chart */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-50 dark:border-slate-800 rounded-2xl">
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
