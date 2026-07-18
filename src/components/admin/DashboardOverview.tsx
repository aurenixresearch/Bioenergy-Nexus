import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  Award, 
  Briefcase, 
  Globe, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  TrendingDown, 
  MapPin, 
  CornerDownRight, 
  Building, 
  FileText 
} from 'lucide-react';
import { AdminUser, AdminResearch, AdminProject, AdminAlliance, AdminOrganization, AdminConsulting, AdminChallenge, AdminReportedItem } from './AdminMockData';

interface DashboardOverviewProps {
  users: AdminUser[];
  research: AdminResearch[];
  projects: AdminProject[];
  alliances: AdminAlliance[];
  organizations: AdminOrganization[];
  consulting: AdminConsulting[];
  challenges: AdminChallenge[];
  reports: AdminReportedItem[];
  theme: 'light' | 'dark';
}

type DateFilter = 'today' | '7days' | '30days' | '12months' | 'custom';

export default function DashboardOverview({
  users,
  research,
  projects,
  alliances,
  organizations,
  consulting,
  challenges,
  reports,
  theme
}: DashboardOverviewProps) {
  const [filter, setFilter] = useState<DateFilter>('30days');
  const [customRange, setCustomRange] = useState({ start: '2026-06-01', end: '2026-07-17' });
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Statistics summaries based on filter
  const verifiedResearchers = users.filter(u => u.role === 'Researcher' && u.verified).length;
  const verifiedOrgs = organizations.filter(o => o.verified).length;
  const pendingReviews = research.filter(r => r.status === 'Pending').length + reports.filter(rep => rep.status === 'Pending').length;
  const activeMatchesCount = Math.floor(users.length * 1.5) + projects.length; 
  const unreadReportsCount = reports.filter(r => r.status === 'Pending').length;

  const kpis = [
    { label: 'Total Users', val: users.length * 12 + 140, icon: Users, diff: '+12%', trend: 'up', desc: 'Registered platform accounts' },
    { label: 'Published Research', val: research.length * 6 + 45, icon: BookOpen, diff: '+8%', trend: 'up', desc: 'Validated research papers' },
    { label: 'Innovation Projects', val: projects.length * 3 + 12, icon: Briefcase, diff: '+15%', trend: 'up', desc: 'TRL 1-9 technological projects' },
    { label: 'Active Alliances', val: alliances.length * 4 + 8, icon: Award, diff: '+4%', trend: 'up', desc: 'Active institutional covenants' },
    { label: 'Funding Opportunities', val: 12, icon: Award, diff: '+18%', trend: 'up', desc: 'Grants & investment lines' },
    { label: 'Innovation Challenges', val: challenges.length + 3, icon: Sparkles, diff: '+25%', trend: 'up', desc: 'Corporate & NGO incentives' },
    { label: 'Consulting Requests', val: consulting.length * 5 + 18, icon: Activity, diff: '-3%', trend: 'down', desc: 'Advisory panel requests' },
    { label: 'Total Countries', val: 14, icon: Globe, diff: 'Stable', trend: 'neutral', desc: 'Active African representation' }
  ];

  const secondaryStats = [
    { label: 'Verified Researchers', val: verifiedResearchers + 18, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' },
    { label: 'Verified Organizations', val: verifiedOrgs + 8, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20 dark:text-teal-400' },
    { label: 'Pending Reviews', val: pendingReviews, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400' },
    { label: 'Active AI Matches', val: activeMatchesCount, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400' },
    { label: 'Unread Reports', val: unreadReportsCount, color: 'text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400' }
  ];

  // Simulated chart data generator based on filter
  const getChartData = () => {
    switch (filter) {
      case 'today':
        return {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
          userGrowth: [4, 5, 8, 15, 24, 28, 32],
          uploads: [1, 1, 3, 4, 8, 9, 11],
          projects: [0, 1, 1, 2, 4, 4, 5]
        };
      case '7days':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          userGrowth: [40, 48, 55, 68, 80, 85, 92],
          uploads: [12, 18, 22, 28, 35, 38, 44],
          projects: [3, 4, 6, 8, 11, 12, 14]
        };
      case '12months':
        return {
          labels: ['Aug 25', 'Oct 25', 'Dec 25', 'Feb 26', 'Apr 26', 'Jun 26', 'Jul 26'],
          userGrowth: [320, 450, 580, 710, 890, 1050, 1192],
          uploads: [110, 145, 180, 210, 260, 310, 382],
          projects: [14, 22, 28, 34, 42, 55, 68]
        };
      case '30days':
      default:
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          userGrowth: [140, 180, 220, 280],
          uploads: [42, 58, 72, 94],
          projects: [8, 12, 15, 21]
        };
    }
  };

  const chartData = getChartData();

  // Categories Distribution data
  const categories = [
    { name: 'Waste-to-Energy', count: 42, percentage: 38, color: 'bg-emerald-500' },
    { name: 'Bioenergy Technology', count: 34, percentage: 31, color: 'bg-teal-500' },
    { name: 'Climate & Energy Policy', count: 22, percentage: 20, color: 'bg-amber-500' },
    { name: 'Environmental Sustainability', count: 12, percentage: 11, color: 'bg-slate-400' }
  ];

  const countries = [
    { name: 'Nigeria', users: 312, percentage: 42, flag: '🇳🇬' },
    { name: 'Kenya', users: 184, percentage: 25, flag: '🇰🇪' },
    { name: 'Ghana', users: 120, percentage: 16, flag: '🇬🇭' },
    { name: 'Senegal', users: 64, percentage: 9, flag: '🇸🇳' },
    { name: 'South Africa', users: 42, percentage: 8, flag: '🇿🇦' }
  ];

  return (
    <div className="space-y-8" id="admin_dashboard_root">
      {/* Date Range Selection Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs" id="dashboard_filter_toolbar">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">
            Real-Time Analytical Framework
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" id="date_range_selector_buttons">
          {(['today', '7days', '30days', '12months', 'custom'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilter(t);
                if (t === 'custom') setShowCustomPicker(true);
                else setShowCustomPicker(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize ${
                filter === t
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t === '7days' ? '7 Days' : t === '30days' ? '30 Days' : t === '12months' ? '12 Months' : t}
            </button>
          ))}
        </div>
      </div>

      {showCustomPicker && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex flex-wrap gap-4 items-end"
          id="custom_date_range_inputs"
        >
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 font-bold">Start Date</label>
            <input 
              type="date" 
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 font-bold">End Date</label>
            <input 
              type="date" 
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
            />
          </div>
          <button 
            onClick={() => setFilter('custom')}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Apply Range
          </button>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard_kpi_cards_grid">
        {kpis.map((k, idx) => (
          <motion.div
            key={k.label}
            whileHover={{ y: -4, scale: 1.01 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                {k.label}
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                <k.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-display font-black text-slate-800 dark:text-slate-50">
                {k.val}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                  k.trend === 'up' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : k.trend === 'down' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-slate-500'
                }`}>
                  {k.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {k.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {k.diff}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  vs last month
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Quick Stats Summary Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" id="secondary_quick_stats_grid">
        {secondaryStats.map((s, idx) => (
          <div 
            key={s.label}
            className={`p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 flex items-center justify-between shadow-xs`}
          >
            <div>
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">{s.label}</span>
              <span className="block text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{s.val}</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${s.color}`}>
              LIVE
            </span>
          </div>
        ))}
      </div>

      {/* Chart Layout Visualizations (Interactive SVGs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_analytical_charts_grid">
        
        {/* Active growth / registration trends */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Ecosystem Growth Trends</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Plotting registrations, research uploads, and innovation milestones</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                <span>Users</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <span className="w-2.5 h-2.5 bg-teal-500 rounded-full inline-block"></span>
                <span>Research</span>
              </div>
            </div>
          </div>

          {/* SVG Line / Bar Chart Panel */}
          <div className="h-64 w-full relative flex items-end justify-between px-2 pt-6 pb-2" id="interactive_svg_growth_chart">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-full border-t border-slate-100/50 dark:border-slate-800/40"></div>
              <div className="w-full border-t border-slate-100/50 dark:border-slate-800/40"></div>
              <div className="w-full border-t border-slate-100/50 dark:border-slate-800/40"></div>
              <div className="w-full border-t border-slate-100/50 dark:border-slate-800/40"></div>
            </div>

            {/* Render bars and lines */}
            {chartData.labels.map((lbl, idx) => {
              const maxVal = Math.max(...chartData.userGrowth);
              const userPct = (chartData.userGrowth[idx] / maxVal) * 100;
              const uploadsPct = (chartData.uploads[idx] / maxVal) * 100;

              return (
                <div key={lbl} className="flex-grow flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[9px] font-mono rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg leading-relaxed text-center min-w-24">
                    <span className="block font-bold text-emerald-400">{lbl}</span>
                    <span className="block">Users: {chartData.userGrowth[idx]}</span>
                    <span className="block text-teal-300">Uploads: {chartData.uploads[idx]}</span>
                  </div>

                  {/* Dual Bar Representation */}
                  <div className="w-full flex items-end justify-center gap-1 h-full max-w-16 px-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${userPct * 0.8}%` }}
                      transition={{ type: 'spring', stiffness: 100 }}
                      className="w-3 sm:w-4 bg-emerald-500 hover:bg-emerald-600 rounded-t-md cursor-pointer transition-colors"
                    ></motion.div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${uploadsPct * 0.8}%` }}
                      transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
                      className="w-3 sm:w-4 bg-teal-400 hover:bg-teal-500 rounded-t-md cursor-pointer transition-colors"
                    ></motion.div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono mt-2 select-none">
                    {lbl}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Research Category Pie Chart Simulation (Structured List) */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Research Categories Breakdown</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Focus areas across Africa’s energy repository</p>
          </div>

          <div className="space-y-4">
            {categories.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${c.color}`}></span>
                    {c.name}
                  </span>
                  <span className="font-mono text-slate-400 dark:text-slate-500 font-bold">
                    {c.count} ({c.percentage}%)
                  </span>
                </div>
                {/* Simulated Progress bar */}
                <div className="w-full h-2 bg-slate-50 dark:bg-slate-800/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${c.color}`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Primary Focus:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">Waste-to-Energy</span>
          </div>
        </div>

      </div>

      {/* Country distribution & live actions log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard_country_log_split">
        
        {/* Country representations */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Geographical Representation</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Top participating African nations across the ecosystem</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {countries.map((c) => (
              <div key={c.name} className="py-3.5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-xl select-none">{c.flag}</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.users} active researchers</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-slate-500">{c.percentage}%</span>
                  <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live system logs / alerts overview */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">Ecosystem Live Feed</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time alerts, uploads, and peer engagements</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase animate-pulse">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
              Live Listening
            </span>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-2" id="live_feed_items">
            <div className="flex gap-3">
              <div className="p-1.5 h-fit bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-200">New research contribution uploaded</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Dr. Samuel Adebayo published a case study on Lagos Pyrolysis.</p>
                <span className="text-[9px] text-slate-400 font-mono mt-1 block">2 minutes ago</span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-1.5 h-fit bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-lg shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-200">Alliance invitation created</p>
                <p className="text-[10px] text-slate-400 mt-0.5">UNEP Africa initiated an invitation regarding Circular Landfills.</p>
                <span className="text-[9px] text-slate-400 font-mono mt-1 block">15 minutes ago</span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="p-1.5 h-fit bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-200">New partner onboarding</p>
                <p className="text-[10px] text-slate-400 mt-0.5">GreenCycle West Africa Ltd joined the network as verified industry sponsor.</p>
                <span className="text-[9px] text-slate-400 font-mono mt-1 block">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
