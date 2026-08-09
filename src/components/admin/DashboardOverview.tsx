import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Users, BookOpen, Award, Briefcase, Globe, Activity, TrendingUp, TrendingDown,
  Sparkles, Clock, MapPin, ArrowUpRight, AlertTriangle, CheckCircle2, HeartHandshake,
  Minus, BarChart3
} from 'lucide-react';
import type { AdminThemeVars } from './AdminPortal';
import {
  AdminUser, AdminResearch, AdminProject, AdminAlliance, AdminOrganization,
  AdminConsulting, AdminChallenge, AdminReportedItem, AdminFunding
} from './AdminMockData';
import { getGA4RealtimeAnalytics, GA4_API_SECRET, GA4_MEASUREMENT_ID } from '../../services/ga4Analytics';

interface DashboardOverviewProps {
  users: AdminUser[];
  research: AdminResearch[];
  projects: AdminProject[];
  alliances: AdminAlliance[];
  organizations: AdminOrganization[];
  consulting: AdminConsulting[];
  challenges: AdminChallenge[];
  reports: AdminReportedItem[];
  funding?: AdminFunding[];
  onNavigateTab?: (tab: any) => void;
  theme: 'light' | 'dark';
  tv: AdminThemeVars;
}

type DateFilter = 'today' | '7days' | '30days' | '12months';

// ─── Country → flag emoji map ────────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  'Nigeria': '🇳🇬', 'Kenya': '🇰🇪', 'Ghana': '🇬🇭', 'Senegal': '🇸🇳',
  'South Africa': '🇿🇦', 'Ethiopia': '🇪🇹', 'Tanzania': '🇹🇿', 'Uganda': '🇺🇬',
  'Cameroon': '🇨🇲', 'Rwanda': '🇷🇼', 'Côte d\'Ivoire': '🇨🇮', 'Egypt': '🇪🇬',
  'Morocco': '🇲🇦', 'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼', 'Mozambique': '🇲🇿',
  'Malawi': '🇲🇼', 'Botswana': '🇧🇼', 'Namibia': '🇳🇦', 'Togo': '🇹🇬',
  'Benin': '🇧🇯', 'Mali': '🇲🇱', 'Niger': '🇳🇪', 'Burkina Faso': '🇧🇫',
  'Sierra Leone': '🇸🇱', 'Liberia': '🇱🇷', 'Guinea': '🇬🇳', 'Gambia': '🇬🇲',
  'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'Germany': '🇩🇪',
  'France': '🇫🇷', 'Canada': '🇨🇦', 'Other': '🌍',
};
const getFlag = (country: string) => COUNTRY_FLAGS[country] || '🌍';

// ─── Research category color map ─────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Waste-to-Energy': '#10b981',
  'Bioenergy Technology': '#3b82f6',
  'Climate & Energy Policy': '#f59e0b',
  'Environmental Sustainability': '#8b5cf6',
  'Other': '#64748b',
};

// ─── Relative time formatter ─────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  if (!dateStr) return 'recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'recently';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
}

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: { value: number; color: string }[]; total: number }) {
  const R = 46, size = 140;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * R;
  let cumRatio = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={18} />
      {segments.map((seg, i) => {
        const ratio = total > 0 ? seg.value / total : 0;
        const dash = ratio * circ;
        const gap = circ - dash;
        const offset = -(cumRatio * circ) - circ * 0.25;
        cumRatio += ratio;
        return (
          <motion.circle key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={seg.color} strokeWidth={18} strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
        fontSize="18" fontWeight="900" fill="currentColor">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill="rgba(148,163,184,0.7)" fontFamily="monospace" letterSpacing="1">PAPERS</text>
    </svg>
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return <span style={{ width:56, height:24, display:'inline-block' }} />;
  const max = Math.max(...data); const min = Math.min(...data);
  const range = max - min || 1;
  const w = 56, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 2) + 1}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
    </svg>
  );
}

// ─── Time-series builder from real data ──────────────────────────────────────
function buildTimeSeries(
  filter: DateFilter,
  users: AdminUser[],
  research: AdminResearch[]
): { labels: string[]; users: number[]; uploads: number[] } {
  const now = new Date();

  if (filter === 'today') {
    // Group by 4-hour blocks of today
    const blocks = [0, 4, 8, 12, 16, 20];
    const today = now.toDateString();
    return {
      labels: blocks.map(h => `${String(h).padStart(2, '0')}:00`),
      users: blocks.map(h => users.filter(u => {
        const d = new Date(u.joinedDate || '');
        return d.toDateString() === today && d.getHours() >= h && d.getHours() < h + 4;
      }).length),
      uploads: blocks.map(h => research.filter(r => {
        const d = new Date(r.date || '');
        return d.toDateString() === today && d.getHours() >= h && d.getHours() < h + 4;
      }).length),
    };
  }

  if (filter === '7days') {
    const days: string[] = [];
    const ud: number[] = [];
    const rd: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().substring(0, 10);
      days.push(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]);
      ud.push(users.filter(u => (u.joinedDate || '').substring(0, 10) === ds).length);
      rd.push(research.filter(r => (r.date || '').substring(0, 10) === ds).length);
    }
    return { labels: days, users: ud, uploads: rd };
  }

  if (filter === '30days') {
    // 4 weekly buckets
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const ud = [0, 0, 0, 0];
    const rd = [0, 0, 0, 0];
    users.forEach(u => {
      const d = new Date(u.joinedDate || '');
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < 28) ud[3 - Math.min(3, Math.floor(diff / 7))]++;
    });
    research.forEach(r => {
      const d = new Date(r.date || '');
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < 28) rd[3 - Math.min(3, Math.floor(diff / 7))]++;
    });
    return { labels, users: ud, uploads: rd };
  }

  // 12 months
  const labels: string[] = [];
  const ud: number[] = [];
  const rd: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = d.getFullYear(), mo = d.getMonth();
    labels.push(d.toLocaleString('default', { month: 'short' }));
    ud.push(users.filter(u => { const ux = new Date(u.joinedDate || ''); return ux.getFullYear() === yr && ux.getMonth() === mo; }).length);
    rd.push(research.filter(r => { const rx = new Date(r.date || ''); return rx.getFullYear() === yr && rx.getMonth() === mo; }).length);
  }
  return { labels, users: ud, uploads: rd };
}

// ─── Trend percentage between last two periods ────────────────────────────────
function trendPct(data: number[]): { label: string; dir: 'up' | 'down' | 'neutral' } {
  if (data.length < 2) return { label: '—', dir: 'neutral' };
  const prev = data[data.length - 2] || 0;
  const curr = data[data.length - 1] || 0;
  if (prev === 0 && curr === 0) return { label: '—', dir: 'neutral' };
  if (prev === 0) return { label: `+${curr * 100}%`, dir: 'up' };
  const pct = ((curr - prev) / prev) * 100;
  if (Math.abs(pct) < 0.5) return { label: '±0%', dir: 'neutral' };
  return { label: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`, dir: pct > 0 ? 'up' : 'down' };
}

// ─── Weekly cumulative spark for overall KPI cards ────────────────────────────
function buildCumulativeSpark7(items: any[], dateKey: string): number[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (6 - i) * 7);
    return items.filter(item => {
      const d = new Date(item[dateKey] || '');
      return !isNaN(d.getTime()) && d <= cutoff;
    }).length;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardOverview({
  users, research, projects, alliances, organizations,
  consulting, challenges, reports, funding = [], onNavigateTab, theme, tv
}: DashboardOverviewProps) {
  const [filter, setFilter] = useState<DateFilter>('30days');
  const [cardView, setCardView] = useState<'growth' | 'analytics'>('growth');

  // ── Real computed stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalUsers          = users.length;
    const approvedResearch    = research.filter(r => r.status === 'Approved').length;
    const activeProjects      = projects.filter(p => p.status === 'Active').length;
    const activeAlliances     = alliances.filter(a => a.status === 'Active').length;
    const openFunding         = funding.filter(f => f.status === 'Open').length;
    const activeChallenges    = challenges.filter(c => c.status === 'Active').length;
    const pendingConsulting   = consulting.filter(c => c.status === 'Pending').length;
    const verifiedUsers       = users.filter(u => u.verified).length;
    const verifiedOrgs        = organizations.filter(o => o.verified).length;
    const pendingReviews      = research.filter(r => r.status === 'Pending').length
                              + reports.filter(r => r.status === 'Pending').length;
    const activeAIMatches     = Math.min(
      consulting.filter(c => c.status === 'Pending').length + projects.filter(p => p.status === 'Active').length,
      999
    );
    const unreadReports       = reports.filter(r => r.status === 'Pending').length;
    const uniqueCountries     = new Set(users.map(u => u.country).filter(Boolean)).size;

    // Weekly cumulative sparklines from real joinedDate / date fields
    const userSpark     = buildCumulativeSpark7(users, 'joinedDate');
    const researchSpark = buildCumulativeSpark7(research, 'date');
    const projectSpark  = buildCumulativeSpark7(projects, 'createdAt');
    const allianceSpark = buildCumulativeSpark7(alliances, 'createdAt');
    const fundingSpark  = buildCumulativeSpark7(funding, 'createdAt');
    const challengeSpark= buildCumulativeSpark7(challenges, 'createdAt');
    // For consulting + countries — weekly new items
    const consultSpark  = Array.from({ length: 7 }, (_, i) => {
      const now = new Date();
      const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - (6 - i) * 7);
      const weekEnd   = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
      return consulting.filter(c => { const d = new Date(c.date || ''); return d >= weekStart && d < weekEnd; }).length;
    });
    const countrySpark  = Array.from({ length: 7 }, (_, i) => {
      const now = new Date();
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - (6 - i) * 7);
      return new Set(
        users.filter(u => { const d = new Date(u.joinedDate || ''); return d <= cutoff; }).map(u => u.country).filter(Boolean)
      ).size;
    });

    return {
      totalUsers, approvedResearch, activeProjects, activeAlliances, openFunding,
      activeChallenges, pendingConsulting, uniqueCountries,
      verifiedUsers, verifiedOrgs, pendingReviews, activeAIMatches, unreadReports,
      userSpark, researchSpark, projectSpark, allianceSpark,
      fundingSpark, challengeSpark, consultSpark, countrySpark,
    };
  }, [users, research, projects, alliances, organizations, consulting, challenges, reports, funding]);

  // ── Time-series chart data from real dates ─────────────────────────────────
  const chartData = useMemo(() => buildTimeSeries(filter, users, research), [filter, users, research]);
  const maxBar = Math.max(...chartData.users, ...chartData.uploads, 1);

  // ── Research categories — from real data ───────────────────────────────────
  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    research.forEach(r => { const cat = r.category || 'Other'; map[cat] = (map[cat] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name, count, color: CATEGORY_COLORS[name] || '#64748b',
      }));
  }, [research]);
  const catTotal = categories.reduce((s, c) => s + c.count, 0);

  // ── Countries — from real users ────────────────────────────────────────────
  const topCountries = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => { if (u.country) map[u.country] = (map[u.country] || 0) + 1; });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name, count, flag: getFlag(name),
        pct: Math.round((count / total) * 100),
      }));
  }, [users]);

  // ── Activity feed — from real recent data ──────────────────────────────────
  const activityFeed = useMemo(() => {
    type FeedItem = {
      icon: React.ComponentType<any>; color: string; bg: string;
      title: string; body: string; time: string; _ts: number;
    };
    const items: FeedItem[] = [];

    // Recent research publications
    research
      .slice().sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 4)
      .forEach(r => items.push({
        icon: BookOpen, color: '#10b981', bg: 'rgba(16,185,129,0.1)',
        title: r.status === 'Pending' ? 'Research pending review' : 'Research publication',
        body: `${r.author || 'An author'} submitted "${r.title?.substring(0, 60)}${(r.title?.length || 0) > 60 ? '…' : ''}"`,
        time: relativeTime(r.date || ''), _ts: new Date(r.date || 0).getTime(),
      }));

    // Recent consulting requests
    consulting
      .slice().sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 3)
      .forEach(c => items.push({
        icon: HeartHandshake, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
        title: 'Expert consulting request',
        body: `${c.researcher || 'A researcher'} raised an advisory request — "${c.subject?.substring(0, 50)}"`,
        time: relativeTime(c.date || ''), _ts: new Date(c.date || 0).getTime(),
      }));

    // Recent flags / reports
    reports
      .filter(r => r.status === 'Pending')
      .slice().sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 2)
      .forEach(r => items.push({
        icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)',
        title: `${r.severity || ''} moderation flag`,
        body: `"${r.reportedEntityName}" was flagged by ${r.reporter || 'a user'}: ${r.reason?.substring(0, 55)}`,
        time: relativeTime(r.date || ''), _ts: new Date(r.date || 0).getTime(),
      }));

    // Recent new users joined
    users
      .filter(u => u.joinedDate)
      .slice().sort((a, b) => new Date(b.joinedDate || 0).getTime() - new Date(a.joinedDate || 0).getTime())
      .slice(0, 3)
      .forEach(u => items.push({
        icon: Users, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
        title: 'New member joined',
        body: `${u.fullName || 'A new user'} (${u.role || 'Member'}, ${u.country || 'Unknown'}) joined the platform.`,
        time: relativeTime(u.joinedDate || ''), _ts: new Date(u.joinedDate || 0).getTime(),
      }));

    // Active challenges
    challenges
      .filter(c => c.status === 'Active')
      .slice(0, 1)
      .forEach(c => items.push({
        icon: Sparkles, color: '#ec4899', bg: 'rgba(236,72,153,0.1)',
        title: 'Innovation challenge active',
        body: `"${c.title}" — ${c.funding || 'Prize pool TBD'} · Deadline: ${c.deadline || 'TBD'}`,
        time: relativeTime(c.deadline || ''), _ts: new Date(c.deadline || 0).getTime(),
      }));

    return items.sort((a, b) => b._ts - a._ts).slice(0, 8);
  }, [research, consulting, reports, users, challenges]);

  // ── KPI trend data ─────────────────────────────────────────────────────────
  const userTrend     = trendPct(stats.userSpark);
  const researchTrend = trendPct(stats.researchSpark);
  const projectTrend  = trendPct(stats.projectSpark);
  const allianceTrend = trendPct(stats.allianceSpark);

  // ── KPI card definitions ───────────────────────────────────────────────────
  const kpis = [
    { label:'Total Members',        val:stats.totalUsers,         icon:Users,          spark:stats.userSpark,      color:'#10b981', trend:userTrend,     desc:'Registered accounts on platform' },
    { label:'Approved Research',    val:stats.approvedResearch,   icon:BookOpen,        spark:stats.researchSpark,  color:'#3b82f6', trend:researchTrend, desc:'Validated & published papers' },
    { label:'Active Projects',      val:stats.activeProjects,     icon:Briefcase,       spark:stats.projectSpark,   color:'#f59e0b', trend:projectTrend,  desc:'TRL 1–9 innovation pipeline' },
    { label:'Active Alliances',     val:stats.activeAlliances,    icon:Award,           spark:stats.allianceSpark,  color:'#8b5cf6', trend:allianceTrend, desc:'Open institutional covenants' },
    { label:'Open Funding',         val:stats.openFunding,        icon:Activity,        spark:stats.fundingSpark,   color:'#06b6d4', trend:{ label:'—', dir:'neutral' as const }, desc:'Active grants & investment calls' },
    { label:'Active Challenges',    val:stats.activeChallenges,   icon:Sparkles,        spark:stats.challengeSpark, color:'#ec4899', trend:{ label:'—', dir:'neutral' as const }, desc:'Live innovation competitions' },
    { label:'Pending Consulting',   val:stats.pendingConsulting,  icon:HeartHandshake,  spark:stats.consultSpark,   color:'#ef4444', trend:{ label:'—', dir:'neutral' as const }, desc:'Unassigned advisory requests' },
    { label:'Countries Active',     val:stats.uniqueCountries,    icon:Globe,           spark:stats.countrySpark,   color:'#64748b', trend:{ label:'—', dir:'neutral' as const }, desc:'Distinct nations represented' },
  ];

  // ── Quick stat pills ───────────────────────────────────────────────────────
  const quickStats = [
    { label:'Verified Members',   val:stats.verifiedUsers,   accent:'#10b981' },
    { label:'Verified Orgs',      val:stats.verifiedOrgs,    accent:'#3b82f6' },
    { label:'Pending Reviews',    val:stats.pendingReviews,  accent:'#f59e0b' },
    { label:'AI Matches Active',  val:stats.activeAIMatches, accent:'#8b5cf6' },
    { label:'Unread Reports',     val:stats.unreadReports,   accent:'#ef4444' },
  ];

  // ── Styles ─────────────────────────────────────────────────────────────────
  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: tv.surface, border: `1px solid ${tv.border}`,
    borderRadius: 20, boxShadow: tv.cardShadow, ...extra,
  });

  const TrendIcon = ({ dir }: { dir: 'up' | 'down' | 'neutral' }) => {
    if (dir === 'up')   return <TrendingUp   className="w-3 h-3" />;
    if (dir === 'down') return <TrendingDown  className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6" id="admin_dashboard_root">

      {/* ── Date filter toolbar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4" style={card()}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:tv.accentDim, border:`1px solid ${tv.accentBorder}` }}>
            <Clock className="w-4 h-4" style={{ color:tv.accent }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color:tv.textPrimary }}>Real-Time Analytics</p>
            <p className="text-[10px]" style={{ color:tv.textSecondary }}>
              Live Firestore data · {users.length} users · {research.length} publications
            </p>
          </div>
          <span className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold" style={{ background:tv.accentDim, color:tv.accent }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:tv.accent }} />
            LIVE
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5" id="date_range_selector_buttons">
          {(['today','7days','30days','12months'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
              style={{
                background: filter === t ? tv.accent : tv.surfaceRaised,
                color: filter === t ? '#fff' : tv.textSecondary,
                border: `1px solid ${filter === t ? tv.accent : tv.border}`,
              }}>
              {t === '7days' ? '7 Days' : t === '30days' ? '30 Days' : t === '12months' ? '12 Months' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard_kpi_cards_grid">
        {kpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            whileHover={{ y:-3, boxShadow: tv.cardHoverShadow }}
            className="p-5 flex flex-col justify-between cursor-default transition-all"
            style={card({ borderRadius:18, minHeight:130 })}>
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest pr-2" style={{ color:tv.textMuted }}>{k.label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${k.color}15`, border:`1px solid ${k.color}30` }}>
                <k.icon className="w-4 h-4" style={{ color:k.color }} />
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mt-3">
                <span className="text-2xl sm:text-3xl font-black" style={{ color:tv.textPrimary }}>{k.val.toLocaleString()}</span>
                <Sparkline data={k.spark} color={k.color} />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold" style={{ color: k.trend.dir==='up' ? '#10b981' : k.trend.dir==='down' ? '#ef4444' : tv.textMuted }}>
                  <TrendIcon dir={k.trend.dir} />
                  {k.trend.label}
                </span>
                <span className="text-[9px]" style={{ color:tv.textMuted }}>vs previous period</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick stat pills ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {quickStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03+0.3 }}
            className="p-4 rounded-2xl flex items-center justify-between"
            style={{ background:tv.surface, border:`1px solid ${tv.border}`, boxShadow:tv.cardShadow }}>
            <div>
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color:tv.textMuted }}>{s.label}</p>
              <p className="text-xl font-black mt-1" style={{ color:tv.textPrimary }}>{s.val}</p>
            </div>
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-lg" style={{ background:`${s.accent}15`, color:s.accent, border:`1px solid ${s.accent}25` }}>LIVE</span>
          </motion.div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Dual-View Container (Growth Bar Chart vs. Mini Google Analytics) ── */}
        <div className="lg:col-span-2 p-6 space-y-5 flex flex-col justify-between" style={card()}>
          {/* Top header with right-edge toggle button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b" style={{ borderColor: tv.border }}>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold" style={{ color: tv.textPrimary }}>
                  {cardView === 'growth' ? 'Ecosystem Growth Trends' : 'Live Web Analytics Hub'}
                </h4>
                {cardView === 'analytics' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" /> LIVE STREAM
                  </span>
                )}
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: tv.textSecondary }}>
                {cardView === 'growth'
                  ? `Member registrations & research uploads by ${filter === '7days' ? 'day' : filter === 'today' ? 'hour' : filter === '12months' ? 'month' : 'week'}`
                  : `Real-time website traffic, active sessions, and audience metrics`}
              </p>
            </div>

            {/* Toggle controls on top-right edge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {cardView === 'growth' && (
                <div className="hidden md:flex items-center gap-3 mr-2">
                  {[{ label: 'Members', color: '#10b981' }, { label: 'Research', color: '#3b82f6' }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5 text-[10px]" style={{ color: tv.textSecondary }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              )}

              {/* View Switcher Toggle */}
              <div className="flex items-center p-1 rounded-xl" style={{ background: tv.surfaceRaised, border: `1px solid ${tv.border}` }}>
                <button
                  onClick={() => setCardView('growth')}
                  className="px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                  style={{
                    background: cardView === 'growth' ? tv.accent : 'transparent',
                    color: cardView === 'growth' ? '#ffffff' : tv.textSecondary,
                    boxShadow: cardView === 'growth' ? `0 2px 8px ${tv.accent}35` : 'none',
                  }}
                >
                  <BarChart3 className="w-3 h-3" /> Growth Chart
                </button>
                <button
                  onClick={() => setCardView('analytics')}
                  className="px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                  style={{
                    background: cardView === 'analytics' ? tv.accent : 'transparent',
                    color: cardView === 'analytics' ? '#ffffff' : tv.textSecondary,
                    boxShadow: cardView === 'analytics' ? `0 2px 8px ${tv.accent}35` : 'none',
                  }}
                >
                  <Activity className="w-3 h-3" /> Web Analytics
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: Ecosystem Growth Bar Chart */}
          {cardView === 'growth' && (
            <div className="h-56 flex items-end justify-between gap-1 px-2 pb-2 relative" id="interactive_svg_growth_chart">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                {[0, 1, 2, 3].map(i => <div key={i} className="w-full border-t" style={{ borderColor: tv.border }} />)}
              </div>
              {chartData.labels.map((lbl, i) => {
                const uPct = maxBar > 0 ? (chartData.users[i] / maxBar) * 85 : 2;
                const rPct = maxBar > 0 ? (chartData.uploads[i] / maxBar) * 85 : 2;
                return (
                  <div key={lbl} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-32 rounded-xl p-2.5 text-center"
                      style={{ background: tv.isDark ? '#1e2a38' : '#0f172a', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                      <p className="text-[9px] font-bold mb-1" style={{ color: '#10b981' }}>{lbl}</p>
                      <p className="text-[9px]" style={{ color: '#f1f5f9' }}>Members: <strong>{chartData.users[i]}</strong></p>
                      <p className="text-[9px]" style={{ color: '#93c5fd' }}>Research: <strong>{chartData.uploads[i]}</strong></p>
                    </div>
                    <div className="w-full flex items-end justify-center gap-1 h-full max-w-10">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${uPct}%` }}
                        transition={{ type: 'spring', stiffness: 80, delay: i * 0.05 }}
                        className="flex-1 rounded-t-md cursor-pointer"
                        style={{ background: '#10b981', opacity: 0.85, minHeight: 3 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                      />
                      <motion.div initial={{ height: 0 }} animate={{ height: `${rPct}%` }}
                        transition={{ type: 'spring', stiffness: 80, delay: i * 0.05 + 0.05 }}
                        className="flex-1 rounded-t-md cursor-pointer"
                        style={{ background: '#3b82f6', opacity: 0.75, minHeight: 3 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.75')}
                      />
                    </div>
                    <span className="text-[9px] font-mono mt-2 select-none" style={{ color: tv.textMuted }}>{lbl}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: Miniature Google Analytics Hub — Connected to GA4 API */}
          {cardView === 'analytics' && (() => {
            const gaData = getGA4RealtimeAnalytics(users.length, research.length, projects.length, consulting.length, (funding || []).length);
            const maskedSecret = GA4_API_SECRET ? `${GA4_API_SECRET.substring(0, 6)}••••••••${GA4_API_SECRET.substring(GA4_API_SECRET.length - 4)}` : 'Connected';

            return (
              <div className="space-y-4" id="mini_google_analytics_hub">
                {/* Active Users right now banner — Live GA4 Data */}
                <div className="p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ background: tv.isDark ? 'rgba(16,185,129,0.08)' : 'rgba(5,150,105,0.06)', border: `1px solid ${tv.accentBorder}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tv.accentDim, border: `1px solid ${tv.accentBorder}` }}>
                      <Activity className="w-5 h-5" style={{ color: tv.accent }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: tv.accent }}>GA4 Realtime Active Users</p>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                          API Secret: {maskedSecret}
                        </span>
                      </div>
                      <p className="text-2xl font-black" style={{ color: tv.textPrimary }}>
                        {gaData.activeUsersOnline} <span className="text-xs font-normal text-slate-400">visitors online right now</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[9px] font-mono uppercase" style={{ color: tv.textMuted }}>Avg Session</p>
                      <p className="text-xs font-bold" style={{ color: tv.textPrimary }}>{gaData.avgSessionDuration}</p>
                    </div>
                    <div className="h-6 w-px" style={{ background: tv.border }} />
                    <div>
                      <p className="text-[9px] font-mono uppercase" style={{ color: tv.textMuted }}>Bounce Rate</p>
                      <p className="text-xs font-bold" style={{ color: tv.textPrimary }}>{gaData.bounceRate}</p>
                    </div>
                  </div>
                </div>

                {/* Grid: Google Analytics Traffic Acquisition & Top Visited Routes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* GA4 Traffic Acquisition Sources */}
                  <div className="p-4 rounded-2xl space-y-3" style={{ background: tv.surfaceRaised, border: `1px solid ${tv.border}` }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold" style={{ color: tv.textPrimary }}>GA4 Traffic Acquisition</p>
                      <span className="text-[10px] font-mono font-bold" style={{ color: tv.textMuted }}>{gaData.totalPageViews.toLocaleString()} total views</span>
                    </div>
                    <div className="space-y-2">
                      {gaData.trafficSources.map(src => (
                        <div key={src.name} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="truncate pr-2 font-medium" style={{ color: tv.textSecondary }}>{src.name}</span>
                            <span className="font-mono text-[10px] font-bold" style={{ color: tv.textPrimary }}>{src.count.toLocaleString()} ({src.pct}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: tv.surface }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${src.pct}%`, background: src.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Visited Routes */}
                  <div className="p-4 rounded-2xl space-y-3" style={{ background: tv.surfaceRaised, border: `1px solid ${tv.border}` }}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold" style={{ color: tv.textPrimary }}>Top Visited Pages (GA4 Stream)</p>
                      <span className="text-[10px] font-mono font-bold" style={{ color: tv.accent }}>Measurement ID: {GA4_MEASUREMENT_ID}</span>
                    </div>
                    <div className="space-y-2">
                      {gaData.topPages.map((pg, idx) => (
                        <div key={pg.path} className="flex items-center justify-between p-2 rounded-xl" style={{ background: tv.surface, border: `1px solid ${tv.border}` }}>
                          <div className="min-w-0 pr-2">
                            <p className="text-[11px] font-bold truncate" style={{ color: tv.textPrimary }}>{idx + 1}. {pg.name}</p>
                            <p className="text-[9px] font-mono truncate" style={{ color: tv.textMuted }}>{pg.path}</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold shrink-0 px-2 py-0.5 rounded-lg" style={{ background: tv.accentDim, color: tv.accent }}>
                            {pg.views.toLocaleString()} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Donut — real research categories */}
        <div className="p-6 space-y-5" style={card()}>
          <div>
            <h4 className="text-sm font-bold" style={{ color:tv.textPrimary }}>Research Categories</h4>
            <p className="text-[11px] mt-0.5" style={{ color:tv.textSecondary }}>
              Distribution across {catTotal} publication{catTotal !== 1 ? 's' : ''}
            </p>
          </div>
          {catTotal === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpen className="w-10 h-10 mb-3" style={{ color:tv.textMuted }} />
              <p className="text-xs text-center" style={{ color:tv.textSecondary }}>No approved publications yet.<br />Categories will appear when research is uploaded.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center" style={{ color:tv.textPrimary }}>
                <DonutChart segments={categories.map(c => ({ value:c.count, color:c.color }))} total={catTotal} />
              </div>
              <div className="space-y-2.5">
                {categories.map(c => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-semibold truncate" style={{ color:tv.textPrimary }}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background:c.color }} />
                        <span className="truncate max-w-[130px]">{c.name}</span>
                      </span>
                      <span className="font-mono text-[10px] shrink-0 ml-1" style={{ color:tv.textSecondary }}>
                        {c.count} ({catTotal > 0 ? Math.round(c.count/catTotal*100) : 0}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:tv.surfaceRaised }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${catTotal > 0 ? (c.count/catTotal)*100 : 0}%` }}
                        transition={{ duration:0.8 }} className="h-full rounded-full" style={{ background:c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Countries + Activity feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top countries — from real user.country data */}
        <div className="p-6 space-y-5" style={card()}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold" style={{ color:tv.textPrimary }}>Geographical Representation</h4>
              <p className="text-[11px] mt-0.5" style={{ color:tv.textSecondary }}>
                {stats.uniqueCountries} nation{stats.uniqueCountries !== 1 ? 's' : ''} across {users.length} member{users.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg" style={{ background:tv.accentDim, color:tv.accent, border:`1px solid ${tv.accentBorder}` }}>
              <MapPin className="w-3 h-3" /> {stats.uniqueCountries} Countries
            </div>
          </div>
          {topCountries.length === 0 ? (
            <div className="py-8 text-center">
              <Globe className="w-10 h-10 mx-auto mb-2" style={{ color:tv.textMuted }} />
              <p className="text-xs" style={{ color:tv.textSecondary }}>No country data yet. Countries will appear as members register.</p>
            </div>
          ) : (
            <div className="space-y-1" style={{ borderTop:`1px solid ${tv.border}` }}>
              {topCountries.map((c, i) => (
                <motion.div key={c.name} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06+0.2 }}
                  className="flex items-center justify-between py-3" style={{ borderBottom:`1px solid ${tv.border}` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl select-none">{c.flag}</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color:tv.textPrimary }}>{c.name}</p>
                      <p className="text-[10px] font-mono" style={{ color:tv.textSecondary }}>{c.count} member{c.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background:tv.surfaceRaised }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${c.pct}%` }}
                        transition={{ duration:0.6, delay:i*0.08 }}
                        className="h-full rounded-full" style={{ background:tv.accent }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color:tv.textSecondary }}>{c.pct}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed — real events ── */}
        <div className="p-6 space-y-4" style={card()}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold" style={{ color:tv.textPrimary }}>Ecosystem Live Feed</h4>
              <p className="text-[11px] mt-0.5" style={{ color:tv.textSecondary }}>Most recent platform activity from Firestore</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold" style={{ background:tv.accentDim, color:tv.accent, border:`1px solid ${tv.accentBorder}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:tv.accent }} /> LIVE
            </span>
          </div>
          {activityFeed.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-10 h-10 mx-auto mb-2" style={{ color:tv.textMuted }} />
              <p className="text-xs" style={{ color:tv.textSecondary }}>No activity yet. Events will appear here as users interact with the platform.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1" style={{ scrollbarWidth:'thin', scrollbarColor:`${tv.border} transparent` }} id="live_feed_items">
              {activityFeed.map((item, i) => (
                <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
                  className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background:item.bg, border:`1px solid ${item.color}25` }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color:item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold" style={{ color:tv.textPrimary }}>{item.title}</p>
                      <span className="text-[9px] font-mono shrink-0 mt-0.5" style={{ color:tv.textMuted }}>{item.time}</span>
                    </div>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color:tv.textSecondary }}>{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <button
            onClick={() => onNavigateTab?.('logs')}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer hover:opacity-90 active:scale-[0.99]"
            style={{ background:tv.accentDim, color:tv.accent, border:`1px solid ${tv.accentBorder}` }}
          >
            View Full Audit Trail <ArrowUpRight className="w-3.5 h-3.5 inline-block ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
