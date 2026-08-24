import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, BookOpen, Award, Briefcase, Building, Sparkles, Activity, Sliders,
  Bell, Settings, Terminal, ArrowLeft, LogOut, ChevronLeft, ChevronRight,
  Search, Menu, X, FolderLock, Compass, UserCheck, HeartHandshake,
  BarChart3, Edit3, Download, ShieldCheck, Sun, Moon, Star, Command,
  LayoutDashboard, Shield, ChevronDown, CheckCheck, Trash2, BellOff, AlertTriangle
} from 'lucide-react';
import PolicyAdminView from '../legal/PolicyAdminView';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  MOCK_RESEARCH, MOCK_PROJECTS, MOCK_ALLIANCES, MOCK_ORGANIZATIONS,
  MOCK_CONSULTING, MOCK_FUNDING, MOCK_CHALLENGES, MOCK_REPORTS,
  MOCK_AUDIT_LOGS, MOCK_ADMIN_ROLES,
  AdminUser, AdminResearch, AdminProject, AdminAlliance, AdminOrganization,
  AdminConsulting, AdminFunding, AdminChallenge, AdminReportedItem,
  AdminAuditLog, AdminRoleConfig
} from './AdminMockData';
import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import PortfolioManagement from './PortfolioManagement';
import ConsultingFunding from './ConsultingFunding';
import SystemOperations from './SystemOperations';
import TestimonialsManagement from './TestimonialsManagement';
import { saveUserProfileByAdmin } from '../../services/db';

// ─── Shared theme variable type ──────────────────────────────────────────────
export interface AdminThemeVars {
  bg: string; surface: string; surfaceRaised: string;
  border: string; accent: string; accentDim: string; accentBorder: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  topbarBg: string; cardShadow: string; cardHoverShadow: string;
  isDark: boolean;
}

export function buildThemeVars(theme: 'light' | 'dark'): AdminThemeVars {
  const d = theme === 'dark';
  return {
    isDark: d,
    bg:             d ? '#07090f' : '#f0f2f8',
    surface:        d ? '#0e1117' : '#ffffff',
    surfaceRaised:  d ? '#141820' : '#f8fafc',
    border:         d ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    accent:         d ? '#10b981' : '#059669',
    accentDim:      d ? 'rgba(16,185,129,0.12)' : 'rgba(5,150,105,0.10)',
    accentBorder:   d ? 'rgba(16,185,129,0.3)'  : 'rgba(5,150,105,0.25)',
    textPrimary:    d ? '#f1f5f9' : '#0f172a',
    textSecondary:  d ? '#64748b' : '#475569',
    textMuted:      d ? '#3f4d5e' : '#94a3b8',
    topbarBg:       d ? 'rgba(7,9,15,0.90)' : 'rgba(240,242,248,0.94)',
    cardShadow:     d ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.06)',
    cardHoverShadow:d ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.10)',
  };
}

// ─── Component interfaces ────────────────────────────────────────────────────
interface AdminPortalProps {
  user: FirebaseUser | null;
  userProfile: any | null;
  setView: (view: any) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

type AdminTab =
  | 'dashboard' | 'users' | 'research' | 'projects' | 'alliances'
  | 'organizations' | 'consulting' | 'funding' | 'challenges'
  | 'matchmaking' | 'moderation' | 'analytics' | 'notifications'
  | 'cms' | 'reports' | 'settings' | 'logs' | 'accounts'
  | 'admins_scroll' | 'legal' | 'testimonials';

interface CmdItem {
  label: string; description: string;
  tab: AdminTab; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  keywords?: string;
}

const AUTHORIZED_EMAILS = [
  'bola.adeyemi@aurenix-research.org',
  'adeyemibola2569@gmail.com',
  'egburedipraise@gmail.com',
];

const DISPLAY_NAME_MAP: Record<string, string> = {
  'egburedipraise@gmail.com': 'Aurenix',
  'adeyemibola2569@gmail.com': 'Bola Adeyemi',
  'bola.adeyemi@aurenix-research.org': 'Bola Adeyemi',
};

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Overview Dashboard', users: 'User Directory', research: 'Research Repository',
  projects: 'Innovation Projects', alliances: 'Alliance Covenants', organizations: 'Organizations',
  consulting: 'Expert Consulting', funding: 'Grants & Funding', challenges: 'Innovation Challenges',
  matchmaking: 'AI Matchmaking', moderation: 'Moderation Cases', analytics: 'Ecosystem Analytics',
  notifications: 'Broadcast System', cms: 'CMS Editor', reports: 'Downloadable Reports',
  settings: 'Platform Settings', logs: 'Audit Trail', accounts: 'Role Matrix',
  legal: 'Legal Management', testimonials: 'Public Testimonials',
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminPortal({ user, userProfile, setView, theme = 'dark', onToggleTheme }: AdminPortalProps) {

  // ── Layout state ────────────────────────────────────────────────────────────
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    fn(); window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // ── Navigation state ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [userDirectoryFilter, setUserDirectoryFilter] = useState('');
  const [simulatedAdminRole, setSimulatedAdminRole] = useState('');

  // ── Global search ───────────────────────────────────────────────────────────
  const [globalQuery, setGlobalQuery] = useState('');
  const [showGlobalResults, setShowGlobalResults] = useState(false);

  // ── Command palette ─────────────────────────────────────────────────────────
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const cmdInputRef = useRef<HTMLInputElement>(null);

  // ── Notification Center ─────────────────────────────────────────────────────
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(p => !p); setCommandQuery(''); }
      if (e.key === 'Escape') { setShowCommandPalette(false); setShowNotificationsDropdown(false); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => {
    if (showCommandPalette) setTimeout(() => cmdInputRef.current?.focus(), 50);
  }, [showCommandPalette]);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [adminUsers,     setAdminUsers]     = useState<AdminUser[]>([]);
  const [adminResearch,  setAdminResearch]  = useState<AdminResearch[]>([]);
  const [adminProjects,  setAdminProjects]  = useState<AdminProject[]>([]);
  const [adminAlliances, setAdminAlliances] = useState<AdminAlliance[]>([]);
  const [adminOrgs,      setAdminOrgs]      = useState<AdminOrganization[]>([]);
  const [adminConsulting,setAdminConsulting]= useState<AdminConsulting[]>([]);
  const [adminFunding,   setAdminFunding]   = useState<AdminFunding[]>([]);
  const [adminChallenges,setAdminChallenges]= useState<AdminChallenge[]>([]);
  const [adminReports,   setAdminReports]   = useState<AdminReportedItem[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>([]);
  const [adminRoles,     setAdminRoles]     = useState<AdminRoleConfig[]>([]);

  // ── Firestore: Users ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setAdminUsers(snap.docs.map(d => {
        const v = d.data();
        return {
          uid: d.id, fullName: v.fullName || 'Anonymous User', email: v.email || '',
          role: v.role || 'Researcher', adminRoleName: v.adminRoleName || '',
          country: v.country || 'Unknown', institution: v.institution || 'Individual',
          researchCount: v.uploadedResearchCount || v.researchCount || 0,
          projects: v.projects || 0, followers: v.followers || 0,
          joinedDate: v.joinedDate || (v.createdAt?.toDate ? v.createdAt.toDate().toISOString().substring(0,10) : new Date().toISOString().substring(0,10)),
          status: v.status || 'active',
          verified: v.verified !== undefined ? !!v.verified : v.verificationStatus === 'verified',
          avatar: v.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(v.fullName || 'User')}`,
        };
      }));
    }, err => console.warn('Users snapshot error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Publications ─────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'publications'), snap => {
      if (snap.empty) { setAdminResearch([]); return; }
      setAdminResearch(snap.docs.map(d => { const v=d.data(); return { id:d.id, title:v.title||'', author:v.author||v.authorName||'Anonymous', institution:v.institution||'Individual', category:v.category||'Bioenergy Technology', views:Number(v.views||0), downloads:Number(v.downloads||0), citations:Number(v.citations||0), status:v.status||'Approved', date:v.date||new Date().toISOString().substring(0,10), coverImage:v.coverImage, abstract:v.abstract||'', feedback:v.feedback||'', featured:!!v.featured }; }));
    }, err => console.warn('Publications error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Projects ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), snap => {
      if (snap.empty) { setAdminProjects([]); return; }
      setAdminProjects(snap.docs.map(d => { const v=d.data(); return { id:d.id, title:v.title||'', researcher:v.researcher||v.createdBy||'Unknown', trl:Number(v.trl||1), fundingStatus:v.fundingStatus||'Pending', progress:Number(v.progress||0), industryPartner:v.industryPartner||'None', laboratory:v.laboratory||'General Labs', country:v.country||'Unknown', status:v.status||'Active', description:v.description||'', featured:!!v.featured }; }));
    }, err => console.warn('Projects error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Alliances ────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'alliance_opportunities'), snap => {
      if (snap.empty) { setAdminAlliances([]); return; }
      setAdminAlliances(snap.docs.map(d => { const v=d.data(); return { id:d.id, organization:v.organization||v.sponsor||'Unknown', opportunity:v.opportunity||v.title||'', funding:v.funding||v.budget||'$0', deadline:v.deadline||'', applicationsCount:Number(v.applicationsCount||0), views:Number(v.views||0), status:v.status||'Active', applications:v.applications||[] }; }));
    }, err => console.warn('Alliances error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Organizations ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'organizations'), snap => {
      if (snap.empty) { setAdminOrgs([]); return; }
      setAdminOrgs(snap.docs.map(d => { const v=d.data(); return { id:d.id, name:v.name||'', category:v.category||'Universities', logo:v.logo||'', country:v.country||'Unknown', website:v.website||'', verified:!!v.verified, allianceCount:Number(v.allianceCount||0), projectsSupported:Number(v.projectsSupported||0), followers:Number(v.followers||0), status:v.status||'active' }; }));
    }, err => console.warn('Organizations error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Consulting ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'consultation_inquiries'), snap => {
      if (snap.empty) { setAdminConsulting([]); return; }
      setAdminConsulting(snap.docs.map(d => { const v=d.data(); return { id:d.id, researcher:v.researcher||v.userName||'Anonymous', consultant:v.consultant||'', subject:v.subject||v.serviceType||'', status:v.status||'Pending', priority:v.priority||'Medium', date:v.date||new Date().toISOString().substring(0,10), message:v.message||'', files:v.files||[], chat:v.chat||[] }; }));
    }, err => console.warn('Consulting error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Funding ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'funding_opportunities'), snap => {
      if (snap.empty) { setAdminFunding([]); return; }
      setAdminFunding(snap.docs.map(d => { const v=d.data(); return { id:d.id, sponsor:v.sponsor||v.organization||'', amount:v.amount||v.budget||'$0', deadline:v.deadline||'', applicantsCount:Number(v.applicantsCount||0), status:v.status||'Open', type:v.type||'Grant', description:v.description||'', applications:v.applications||[] }; }));
    }, err => console.warn('Funding error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Challenges ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'innovation_challenges'), snap => {
      if (snap.empty) { setAdminChallenges([]); return; }
      setAdminChallenges(snap.docs.map(d => { const v=d.data(); return { id:d.id, title:v.title||'', description:v.description||'', funding:v.funding||'$0', timeline:v.timeline||'', expectedDeliverables:v.expectedDeliverables||'', deadline:v.deadline||'', supportingOrganization:v.supportingOrganization||'', researchArea:v.researchArea||'', status:v.status||'Active', featured:!!v.featured }; }));
    }, err => console.warn('Challenges error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Reports ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reports'), snap => {
      if (snap.empty) { setAdminReports([]); return; }
      setAdminReports(snap.docs.map(d => { const v=d.data(); return { id:d.id, type:v.type||'Research', reporter:v.reporter||'', reportedEntityName:v.reportedEntityName||'', entityId:v.entityId||'', reason:v.reason||'', severity:v.severity||'Minor', date:v.date||new Date().toISOString().substring(0,10), status:v.status||'Pending', aiFlagged:!!v.aiFlagged, contentSnippet:v.contentSnippet||'' }; }));
    }, err => console.warn('Reports error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Audit Logs ───────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'audit_logs'), snap => {
      if (snap.empty) { setAdminAuditLogs([]); return; }
      setAdminAuditLogs(snap.docs.map(d => { const v=d.data(); return { id:d.id, administrator:v.administrator||'', action:v.action||'', affectedResource:v.affectedResource||'', oldValue:v.oldValue||'', newValue:v.newValue||'', timestamp:v.timestamp||new Date().toISOString(), ipAddress:v.ipAddress||'127.0.0.1', browser:v.browser||'Chrome', device:v.device||'Desktop' }; }));
    }, err => console.warn('Audit logs error:', err));
    return () => unsub();
  }, []);

  // ── Firestore: Admin Roles ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'admin_roles'), snap => {
      if (snap.empty) { setAdminRoles(MOCK_ADMIN_ROLES); return; }
      setAdminRoles(snap.docs.map(d => { const v=d.data(); return { id:d.id, roleName:v.roleName||'', description:v.description||'', permissions:v.permissions||{dashboard:true,users:true,research:true,projects:true,alliances:true,organizations:true,consulting:true,funding:true,challenges:true,moderation:true,settings:true,auditLogs:true} }; }));
    }, err => console.warn('Admin roles error:', err));
    return () => unsub();
  }, []);

  // ── Access check ────────────────────────────────────────────────────────────
  const isUserPlatformAdmin =
    userProfile?.role?.toLowerCase() === 'admin' ||
    userProfile?.role?.toLowerCase() === 'super_admin' ||
    user?.uid === 'sandbox-admin-bola' ||
    AUTHORIZED_EMAILS.includes((user?.email || '').toLowerCase()) ||
    AUTHORIZED_EMAILS.includes((userProfile?.email || '').toLowerCase());

  useEffect(() => {
    if (userProfile && !isUserPlatformAdmin) { setView('dashboard'); window.history.pushState(null,'','/dashboard'); }
  }, [userProfile, isUserPlatformAdmin, setView]);

  useEffect(() => {
    if (window.location.pathname !== '/admin') window.history.pushState(null,'','/admin');
  }, []);

  // ── Handlers: User updates ──────────────────────────────────────────────────
  const handleUpdateAdminUsers = (updated: AdminUser[]) => {
    setAdminUsers(updated);
    updated.forEach(async u => {
      const prev = adminUsers.find(p => p.uid === u.uid);
      if (!prev || JSON.stringify(prev) !== JSON.stringify(u)) {
        try { await saveUserProfileByAdmin(u.uid, { fullName:u.fullName, email:u.email, role:u.role, adminRoleName:u.adminRoleName||'', country:u.country, institution:u.institution||'', termsAccepted:true, verified:!!u.verified, status:u.status||'active', projects:u.projects||0, followers:u.followers||0, uploadedResearchCount:u.researchCount||0, joinedDate:u.joinedDate||new Date().toISOString() }); }
        catch(err) { console.error('Error writing user:', err); }
      }
    });
    adminUsers.forEach(async p => {
      if (!updated.some(u => u.uid === p.uid)) { try { await deleteDoc(doc(db,'users',p.uid)); } catch(e) { console.error(e); } }
    });
  };

  // ── Firestore collection updater factory ────────────────────────────────────
  function fsUpdater<T extends { id: string }>(current: T[], setState: (v: T[]) => void, col: string) {
    return (updated: T[]) => {
      setState(updated);
      updated.forEach(async item => {
        const prev = current.find(p => p.id === item.id);
        if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
          try { await setDoc(doc(db, col, item.id), item, { merge: true }); }
          catch(e) { console.error(`Error writing ${col}:`, e); }
        }
      });
      current.forEach(async old => {
        if (!updated.some(n => n.id === old.id)) { try { await deleteDoc(doc(db, col, old.id)); } catch(e) { console.error(e); } }
      });
    };
  }

  const handleUpdateResearch     = fsUpdater(adminResearch,   setAdminResearch,   'publications');
  const handleUpdateProjects     = fsUpdater(adminProjects,   setAdminProjects,   'projects');
  const handleUpdateAlliances    = fsUpdater(adminAlliances,  setAdminAlliances,  'alliance_opportunities');
  const handleUpdateOrganizations= fsUpdater(adminOrgs,       setAdminOrgs,       'organizations');
  const handleUpdateConsulting   = fsUpdater(adminConsulting, setAdminConsulting, 'consultation_inquiries');
  const handleUpdateFunding      = fsUpdater(adminFunding,    setAdminFunding,    'funding_opportunities');
  const handleUpdateChallenges   = fsUpdater(adminChallenges, setAdminChallenges, 'innovation_challenges');
  const handleUpdateReports      = fsUpdater(adminReports,    setAdminReports,    'reports');
  const handleUpdateAuditLogs    = fsUpdater(adminAuditLogs,  setAdminAuditLogs,  'audit_logs');
  const handleUpdateAdminRoles   = fsUpdater(adminRoles,      setAdminRoles,      'admin_roles');

  // ── Permission checker ──────────────────────────────────────────────────────
  const hasPermission = (tabId: AdminTab): boolean => {
    const roleName = simulatedAdminRole || userProfile?.adminRoleName ||
      (userProfile?.role?.toLowerCase() === 'super_admin' ? 'Super Admin' : '');
    if (roleName === 'Super Admin' || user?.uid === 'sandbox-admin-bola' ||
        AUTHORIZED_EMAILS.includes((user?.email||'').toLowerCase()) ||
        AUTHORIZED_EMAILS.includes((userProfile?.email||'').toLowerCase())) return true;
    const cfg = adminRoles.find(r => r.roleName?.toLowerCase() === roleName?.toLowerCase());
    if (!cfg) return true;
    const p = cfg.permissions;
    switch(tabId) {
      case 'dashboard': return !!p.dashboard; case 'users': return !!p.users;
      case 'research': return !!p.research; case 'projects': return !!p.projects;
      case 'alliances': return !!p.alliances; case 'organizations': return !!p.organizations;
      case 'consulting': return !!p.consulting; case 'funding': return !!p.funding;
      case 'challenges': return !!p.challenges; case 'matchmaking': return !!(p.dashboard||p.consulting);
      case 'moderation': return !!p.moderation; case 'analytics': return !!p.dashboard;
      case 'notifications': return !!(p.moderation||p.settings); case 'cms': return !!p.settings;
      case 'reports': return !!(p.users||p.funding); case 'settings': return !!p.settings;
      case 'logs': return !!p.auditLogs; case 'accounts': return !!p.settings;
      default: return true;
    }
  };

  useEffect(() => {
    if (!hasPermission(activeTab)) {
      const tabs: AdminTab[] = ['dashboard','users','research','projects','alliances','organizations','consulting','funding','challenges','matchmaking','moderation','analytics','notifications','cms','reports','settings','logs','accounts'];
      const fb = tabs.find(t => hasPermission(t));
      if (fb) setActiveTab(fb);
    }
  }, [activeTab, simulatedAdminRole, userProfile, adminRoles]);

  // ── Global search ───────────────────────────────────────────────────────────
  const globalResults = (() => {
    const q = globalQuery.toLowerCase().trim();
    if (!q) return [];
    const m: { title: string; category: string; tab: AdminTab }[] = [];
    adminUsers.forEach(u => { if (`${u.fullName} ${u.email}`.toLowerCase().includes(q)) m.push({ title:`${u.fullName} (${u.email})`, category:'User Directory', tab:'users' }); });
    adminResearch.forEach(r => { if (r.title?.toLowerCase().includes(q)) m.push({ title:r.title, category:'Research Repository', tab:'research' }); });
    adminProjects.forEach(p => { if (p.title?.toLowerCase().includes(q)) m.push({ title:p.title, category:'Innovation Projects', tab:'projects' }); });
    adminOrgs.forEach(o => { if (o.name?.toLowerCase().includes(q)) m.push({ title:o.name, category:'Organizations', tab:'organizations' }); });
    adminFunding.forEach(f => { if (f.sponsor?.toLowerCase().includes(q)) m.push({ title:`${f.sponsor} — ${f.amount}`, category:'Funding', tab:'funding' }); });
    return m.slice(0, 8);
  })();

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const handleSignOut = async () => { try { await signOut(auth); setView('home'); window.history.pushState(null,'','/'); } catch(e){ console.error(e); } };
  const handleReturnHome = () => { setView('dashboard'); window.history.pushState(null,'','/dashboard'); };

  // ── Command palette commands ────────────────────────────────────────────────
  const CMD_ITEMS: CmdItem[] = [
    { label:'Overview Dashboard',   description:'Live analytics & ecosystem metrics',    tab:'dashboard',     icon:LayoutDashboard, keywords:'home kpi stats' },
    { label:'User Directory',       description:'Manage researchers and members',         tab:'users',         icon:Users,           keywords:'accounts researchers members' },
    { label:'Research Repository',  description:'Review and moderate publications',       tab:'research',      icon:BookOpen,        keywords:'papers submissions publications' },
    { label:'Innovation Projects',  description:'TRL 1–9 project pipeline',              tab:'projects',      icon:Briefcase,       keywords:'trl technology pipeline' },
    { label:'Alliance Covenants',   description:'Partnership opportunities',              tab:'alliances',     icon:Award,           keywords:'partnerships collaborations' },
    { label:'Organizations',        description:'Universities, industries & NGOs',        tab:'organizations', icon:Building,        keywords:'institutions companies' },
    { label:'Expert Consulting',    description:'Advisory request queue',                 tab:'consulting',    icon:HeartHandshake,  keywords:'advisory consulting requests' },
    { label:'Grants & Funding',     description:'Funding opportunities management',       tab:'funding',       icon:Award,           keywords:'grants money financial' },
    { label:'Innovation Challenges',description:'Competition and challenge management',   tab:'challenges',    icon:Sparkles,        keywords:'competition prizes events' },
    { label:'AI Matchmaking',       description:'Researcher–industry connections',        tab:'matchmaking',   icon:Compass,         keywords:'ai matching suggestions' },
    { label:'Moderation Cases',     description:'Content review and dispute triage',      tab:'moderation',    icon:Sliders,         keywords:'flags reports review' },
    { label:'Ecosystem Analytics',  description:'Detailed platform performance metrics',  tab:'analytics',     icon:BarChart3,       keywords:'charts data trends growth' },
    { label:'Broadcast System',     description:'Send announcements and alerts',          tab:'notifications', icon:Bell,            keywords:'email push alerts announcements' },
    { label:'Platform Settings',    description:'Configuration and preferences',          tab:'settings',      icon:Settings,        keywords:'config preferences system' },
    { label:'Audit Trail',          description:'Complete system action history',         tab:'logs',          icon:Terminal,        keywords:'history activity logs' },
    { label:'Admin Role Matrix',    description:'Permissions and access control',         tab:'accounts',      icon:Shield,          keywords:'roles permissions access' },
    { label:'Legal Management',     description:'Policies, terms and compliance',         tab:'legal',         icon:ShieldCheck,     keywords:'privacy terms policies gdpr' },
    { label:'Public Testimonials',  description:'Manage website testimonials',            tab:'testimonials',  icon:Star,            keywords:'reviews feedback quotes' },
    { label:'Downloadable Reports', description:'Export platform data and reports',       tab:'reports',       icon:Download,        keywords:'export csv pdf download' },
  ];

  const filteredCmds = commandQuery.trim()
    ? CMD_ITEMS.filter(c => `${c.label} ${c.description} ${c.keywords}`.toLowerCase().includes(commandQuery.toLowerCase()))
    : CMD_ITEMS;

  // ── Nav structure ───────────────────────────────────────────────────────────
  const NAV_GROUPS = [
    { name:'Core Operations', items:[
      { label:'Overview', id:'dashboard' as const, icon:LayoutDashboard },
      { label:'User Directory', id:'users' as const, icon:Users },
      { label:'Admins', id:'admins_scroll' as const, icon:UserCheck },
    ]},
    { name:'Ecosystem Portfolio', items:[
      { label:'Research', id:'research' as const, icon:BookOpen },
      { label:'Projects', id:'projects' as const, icon:Briefcase },
      { label:'Alliances', id:'alliances' as const, icon:Award },
      { label:'Organizations', id:'organizations' as const, icon:Building },
    ]},
    { name:'Engagement Core', items:[
      { label:'Consulting', id:'consulting' as const, icon:HeartHandshake },
      { label:'Funding', id:'funding' as const, icon:Award },
      { label:'Challenges', id:'challenges' as const, icon:Sparkles },
      { label:'AI Matchmaking', id:'matchmaking' as const, icon:Compass },
    ]},
    { name:'Administration', items:[
      { label:'Testimonials', id:'testimonials' as const, icon:Star },
      { label:'Moderation', id:'moderation' as const, icon:Sliders },
      { label:'Analytics', id:'analytics' as const, icon:BarChart3 },
      { label:'Broadcasts', id:'notifications' as const, icon:Bell },
      { label:'Reports', id:'reports' as const, icon:Download },
    ]},
    { name:'Safety & Preferences', items:[
      { label:'Legal', id:'legal' as const, icon:ShieldCheck },
      { label:'Settings', id:'settings' as const, icon:Settings },
      { label:'Audit Logs', id:'logs' as const, icon:Terminal },
      { label:'Role Matrix', id:'accounts' as const, icon:Shield },
    ]},
  ];

  // ── Derived Notifications Stream ───────────────────────────────────────────
  const allNotifications = (() => {
    type NotifItem = {
      id: string;
      title: string;
      body: string;
      time: string;
      tab: AdminTab;
      icon: React.ComponentType<any>;
      color: string;
      category: string;
      isUnread: boolean;
      _ts: number;
    };
    const list: NotifItem[] = [];

    // 1. Pending moderation reports
    adminReports
      .filter(r => r.status === 'Pending')
      .forEach(r => {
        const id = `rep_${r.id}`;
        if (!dismissedNotifIds.includes(id)) {
          list.push({
            id,
            title: `${r.severity || 'Minor'} Moderation Flag`,
            body: `"${r.reportedEntityName}" reported by ${r.reporter || 'User'}: ${r.reason}`,
            time: r.date || 'Today',
            tab: 'moderation',
            icon: AlertTriangle,
            color: '#ef4444',
            category: 'Moderation Case',
            isUnread: !readNotifIds.includes(id),
            _ts: new Date(r.date || 0).getTime(),
          });
        }
      });

    // 2. Pending research publications
    adminResearch
      .filter(r => r.status === 'Pending')
      .forEach(r => {
        const id = `res_${r.id}`;
        if (!dismissedNotifIds.includes(id)) {
          list.push({
            id,
            title: 'Research Pending Approval',
            body: `"${r.title}" submitted by ${r.author || 'Author'}`,
            time: r.date || 'Today',
            tab: 'research',
            icon: BookOpen,
            color: '#10b981',
            category: 'Publication Review',
            isUnread: !readNotifIds.includes(id),
            _ts: new Date(r.date || 0).getTime(),
          });
        }
      });

    // 3. Pending consulting requests
    adminConsulting
      .filter(c => c.status === 'Pending')
      .forEach(c => {
        const id = `con_${c.id}`;
        if (!dismissedNotifIds.includes(id)) {
          list.push({
            id,
            title: 'Advisory Request Raised',
            body: `${c.researcher || 'Researcher'} requested consulting on "${c.subject}"`,
            time: c.date || 'Today',
            tab: 'consulting',
            icon: HeartHandshake,
            color: '#3b82f6',
            category: 'Expert Advisory',
            isUnread: !readNotifIds.includes(id),
            _ts: new Date(c.date || 0).getTime(),
          });
        }
      });

    return list.sort((a, b) => b._ts - a._ts);
  })();

  const unreadNotifCount = allNotifications.filter(n => n.isUnread).length;
  const filteredNotifications = notifFilter === 'unread' ? allNotifications.filter(n => n.isUnread) : allNotifications;

  const handleMarkAllNotificationsRead = () => {
    setReadNotifIds(prev => [...new Set([...prev, ...allNotifications.map(n => n.id)])]);
  };

  const handleClearAllNotifications = () => {
    setDismissedNotifIds(prev => [...new Set([...prev, ...allNotifications.map(n => n.id)])]);
  };

  const handleSelectNotification = (n: typeof allNotifications[0]) => {
    setReadNotifIds(prev => [...new Set([...prev, n.id])]);
    setShowNotificationsDropdown(false);
    setActiveTab(n.tab);
  };

  const tv = buildThemeVars(theme);

  const adminDisplayName = DISPLAY_NAME_MAP[(user?.email || '').toLowerCase()]
    || userProfile?.fullName
    || user?.displayName
    || 'Admin';

  // ── Sidebar nav item ────────────────────────────────────────────────────────
  const renderSideNavItem = (item: { label: string; id: AdminTab; icon: React.ComponentType<any> }, onClick: () => void) => {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={onClick}
        title={isSidebarCollapsed ? item.label : undefined}
        className="w-full flex items-center text-xs font-medium transition-all duration-150 cursor-pointer rounded-lg group"
        style={{
          gap: isSidebarCollapsed ? 0 : 10,
          padding: isSidebarCollapsed ? '9px 0' : '9px 11px',
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          color: isActive ? tv.accent : (tv.isDark ? 'rgba(148,163,184,0.65)' : '#475569'),
          background: isActive ? tv.accentDim : 'transparent',
          borderRadius: 10,
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = tv.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
            e.currentTarget.style.color = tv.textPrimary;
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = isActive ? tv.accentDim : 'transparent';
          e.currentTarget.style.color = isActive ? tv.accent : (tv.isDark ? 'rgba(148,163,184,0.65)' : '#475569');
        }}
      >
        <item.icon className="w-[15px] h-[15px] shrink-0" style={{ color: isActive ? tv.accent : (tv.isDark ? 'rgba(100,116,139,0.8)' : '#64748b') }} />
        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
        {isActive && !isSidebarCollapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tv.accent, boxShadow: `0 0 6px ${tv.accent}` }} />}
      </button>
    );
  };

  // ── ACCESS DENIED VIEW ───────────────────────────────────────────────────────
  if (!isUserPlatformAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 select-none" style={{ background: tv.bg }}>
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="fixed pointer-events-none" style={{ top:'-80px', left:'50%', transform:'translateX(-50%)', width:'480px', height:'480px', background:'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 65%)', borderRadius:'50%' }} />
        <motion.div initial={{ opacity:0, scale:0.9, y:24 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
          className="relative z-10 w-full max-w-md rounded-3xl p-8 text-center space-y-6"
          style={{ background: tv.surface, border: `1px solid ${tv.border}`, boxShadow: tv.cardHoverShadow }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)' }}>
            <FolderLock className="w-8 h-8" style={{ color:'#f87171' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: tv.textPrimary }}>403 — Access Restricted</h2>
            <p className="text-xs leading-relaxed" style={{ color: tv.textSecondary }}>Security clearance is authorized strictly for registered platform administrators.</p>
          </div>
          {user && (
            <div className="p-3.5 rounded-xl text-left space-y-1" style={{ background: tv.surfaceRaised, border: `1px solid ${tv.border}` }}>
              <span className="block text-[9px] font-mono uppercase font-bold" style={{ color: tv.textMuted }}>Identified Account:</span>
              <span className="block text-xs font-bold" style={{ color: tv.textPrimary }}>{userProfile?.fullName || user.displayName}</span>
              <span className="block text-[10px] font-mono" style={{ color: tv.textSecondary }}>{user.email} · Role: {userProfile?.role || 'User'}</span>
            </div>
          )}
          <div className="grid gap-2">
            <button onClick={handleReturnHome} className="w-full py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer" style={{ background: tv.accent, color:'#fff', boxShadow:`0 4px 20px ${tv.accent}35` }}>
              <ArrowLeft className="w-4 h-4" /> Return to Research Hub
            </button>
            {user && (
              <button onClick={handleSignOut} className="w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all" style={{ background: tv.surfaceRaised, border: `1px solid ${tv.border}`, color: tv.textSecondary }}>
                <LogOut className="w-4 h-4" /> Sign Out / Switch Account
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN SHELL ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex font-sans" style={{ background: tv.bg }} id="admin_portal_layout">
      {/* Subtle texture for dark mode */}
      {tv.isDark && <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.022) 1px, transparent 0)', backgroundSize:'30px 30px' }} />}

      {/* ─── SIDEBAR (light/dark responsive) ─────────────────────────────────── */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 72 : 256 }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col"
        style={{
          background: tv.isDark ? 'linear-gradient(180deg, #0c1018 0%, #080b13 100%)' : '#ffffff',
          borderRight: `1px solid ${tv.border}`,
          overflow: 'hidden',
          boxShadow: tv.isDark ? 'none' : '2px 0 12px rgba(0,0,0,0.03)'
        }}
        id="admin_sidebar"
      >
        {/* Top glow */}
        {tv.isDark && <div className="absolute pointer-events-none" style={{ top:-50, left:-50, width:200, height:200, background:'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', borderRadius:'50%' }} />}

        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden py-4" style={{ scrollbarWidth:'none' }}>

          {/* ── Brand ── */}
          <div className={`flex items-center mb-5 px-3.5 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: tv.accentDim, border: `1px solid ${tv.accentBorder}`, boxShadow: `0 0 18px ${tv.accent}20` }}>
              <img src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" alt="Aurenix" referrerPolicy="no-referrer" className="w-4.5 h-4.5 object-contain w-[18px] h-[18px]" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-black tracking-tight leading-none" style={{ color: tv.textPrimary }}>Admin <span style={{ color: tv.accent }}>Console</span></p>
                <p className="text-[8px] font-mono tracking-[0.16em] uppercase mt-0.5" style={{ color: tv.textMuted }}>Aurenix Research</p>
              </div>
            )}
          </div>

          {/* ── Admin identity chip ── */}
          {!isSidebarCollapsed && (
            <div className="mx-3 mb-4 px-3 py-2.5 rounded-xl" style={{ background: tv.isDark ? 'rgba(255,255,255,0.028)' : 'rgba(0,0,0,0.025)', border: `1px solid ${tv.border}` }}>
              <div className="flex items-center gap-2.5">
                <img
                  src={userProfile?.profilePicture || userProfile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(adminDisplayName)}`}
                  alt={adminDisplayName}
                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                  style={{ border: `1px solid ${tv.accentBorder}` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold truncate" style={{ color: tv.textPrimary }}>{adminDisplayName}</p>
                  <p className="text-[9px] font-mono truncate font-bold" style={{ color: tv.accent }}>{simulatedAdminRole || userProfile?.adminRoleName || 'Super Admin'}</p>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tv.accent, boxShadow: `0 0 6px ${tv.accent}` }} />
              </div>
            </div>
          )}

          {/* ── Nav groups ── */}
          <div className="flex-grow px-2 space-y-0.5">
            {NAV_GROUPS
              .map(g => ({ ...g, items: g.items.filter(i => hasPermission(i.id)) }))
              .filter(g => g.items.length > 0)
              .map(group => (
                <div key={group.name} className="mb-1">
                  {!isSidebarCollapsed ? (
                    <p className="px-2.5 pt-3.5 pb-1 text-[9px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: tv.isDark ? 'rgba(71,85,105,0.65)' : '#64748b' }}>{group.name}</p>
                  ) : (
                    <div className="h-px mx-2 my-3" style={{ background: tv.border }} />
                  )}

                  {group.items.map(item => {
                    // Admins dropdown
                    if (item.id === 'admins_scroll') {
                      const isAdmActive = activeTab === 'users' && (userDirectoryFilter === 'admin_only' || userDirectoryFilter === 'admin');
                      const isMatrixActive = activeTab === 'accounts';
                      const isGroupActive = isAdmActive || isMatrixActive || isAdminDropdownOpen;
                      return (
                        <div key={item.id}>
                          <button
                            onClick={() => { setIsAdminDropdownOpen(!isAdminDropdownOpen); setActiveTab('users'); setUserDirectoryFilter('admin_only'); }}
                            className="w-full flex items-center justify-between text-xs font-medium rounded-lg transition-all cursor-pointer"
                            style={{
                              gap: isSidebarCollapsed ? 0 : 10,
                              padding: isSidebarCollapsed ? '9px 0' : '9px 11px',
                              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                              color: isGroupActive ? tv.accent : (tv.isDark ? 'rgba(148,163,184,0.55)' : '#475569'),
                              background: isGroupActive ? tv.accentDim : 'transparent',
                              borderRadius: 10
                            }}
                            onMouseEnter={e => { if (!isGroupActive) e.currentTarget.style.background = tv.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = isGroupActive ? tv.accentDim : 'transparent'; }}
                            title="Administrators"
                          >
                            <div className="flex items-center" style={{ gap: isSidebarCollapsed ? 0 : 10 }}>
                              <item.icon className="w-[15px] h-[15px] shrink-0" style={{ color: isGroupActive ? tv.accent : (tv.isDark ? 'rgba(100,116,139,0.8)' : '#64748b') }} />
                              {!isSidebarCollapsed && <span>{item.label}</span>}
                            </div>
                            {!isSidebarCollapsed && (
                              <ChevronDown className="w-3 h-3 transition-transform duration-200 shrink-0" style={{ transform: isAdminDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: isGroupActive ? tv.accent : tv.textMuted }} />
                            )}
                          </button>
                          <AnimatePresence initial={false}>
                            {isAdminDropdownOpen && !isSidebarCollapsed && (
                              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.15 }} className="pl-5 mt-0.5 space-y-0.5 overflow-hidden">
                                {([
                                  { label:'Admin Directory', isActive: isAdmActive, color: tv.accent, bg: tv.accentDim, onClick:() => { setActiveTab('users'); setUserDirectoryFilter('admin_only'); } },
                                  { label:'Role Matrix',     isActive: isMatrixActive, color:'#8b5cf6', bg:'rgba(139,92,246,0.08)', onClick:() => setActiveTab('accounts') },
                                ]).map(sub => (
                                  <button key={sub.label} onClick={sub.onClick} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all" style={{ color: sub.isActive ? sub.color : (tv.isDark ? 'rgba(100,116,139,0.65)' : '#64748b'), background: sub.isActive ? sub.bg : 'transparent' }}>
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sub.color }} />{sub.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }
                    return <React.Fragment key={item.id}>{renderSideNavItem(item, () => { setActiveTab(item.id); if (item.id === 'users') setUserDirectoryFilter(''); })}</React.Fragment>;
                  })}
                </div>
              ))}
          </div>
        </div>

        {/* ── Sidebar footer ── */}
        <div className="px-2 py-3 space-y-0.5" style={{ borderTop: `1px solid ${tv.border}` }}>
          {[
            { icon:ArrowLeft, label:'Main Hub', onClick:handleReturnHome, color: tv.textSecondary },
            { icon: isSidebarCollapsed ? ChevronRight : ChevronLeft, label: isSidebarCollapsed ? 'Expand' : 'Collapse', onClick:() => setIsSidebarCollapsed(!isSidebarCollapsed), color: tv.textMuted },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick} className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}
              style={{ color: btn.color }}
              onMouseEnter={e => e.currentTarget.style.background = tv.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <btn.icon className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>{btn.label}</span>}
            </button>
          ))}
        </div>
      </motion.aside>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────────── */}
      <motion.div
        animate={{ paddingLeft: isMobile ? 0 : (isSidebarCollapsed ? 72 : 256) }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
        className="flex-grow flex flex-col min-h-screen relative z-10"
      >
        {/* ── TOPBAR ── */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-5 py-3"
          style={{ background: tv.topbarBg, backdropFilter:'blur(20px)', borderBottom:`1px solid ${tv.border}` }}
          id="admin_topbar">

          {/* Mobile menu button */}
          {isMobile && (
            <button onClick={() => setIsMobileDrawerOpen(true)} className="p-2 rounded-xl cursor-pointer shrink-0 transition-all"
              style={{ background:tv.surface, border:`1px solid ${tv.border}`, color:tv.textSecondary }}>
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:block text-xs font-medium" style={{ color:tv.textMuted }}>Admin</span>
            <ChevronRight className="hidden sm:block w-3 h-3" style={{ color:tv.textMuted }} />
            <span className="text-xs font-bold" style={{ color:tv.textPrimary }}>{TAB_LABELS[activeTab] || activeTab}</span>
          </div>

          {/* Global search */}
          <div className="relative flex-grow max-w-xs ml-auto sm:ml-4" id="admin_global_search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color:tv.textMuted }} />
            <input
              type="text" placeholder="Search everything…"
              value={globalQuery}
              onChange={e => { setGlobalQuery(e.target.value); setShowGlobalResults(true); }}
              onFocus={() => setShowGlobalResults(true)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none transition-all"
              style={{ background:tv.surface, border:`1px solid ${tv.border}`, color:tv.textPrimary }}
            />
            <AnimatePresence>
              {showGlobalResults && globalQuery.trim() && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowGlobalResults(false)} />
                  <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl z-20 overflow-hidden"
                    style={{ background: tv.isDark ? '#0e1117' : '#ffffff', border:`1px solid ${tv.border}`, boxShadow:tv.cardHoverShadow }}
                    id="global_search_results_dropdown">
                    <div className="px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color:tv.textMuted, borderBottom:`1px solid ${tv.border}` }}>Results</div>
                    {globalResults.length === 0
                      ? <div className="p-4 text-center text-xs" style={{ color:tv.textMuted }}>No results found.</div>
                      : globalResults.map((r, i) => (
                        <button key={i} onClick={() => { setActiveTab(r.tab); setGlobalQuery(''); setShowGlobalResults(false); }}
                          className="w-full p-3 text-left text-xs block transition-all"
                          style={{ borderBottom:`1px solid ${tv.border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = tv.surfaceRaised}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span className="font-bold block" style={{ color:tv.textPrimary }}>{r.title}</span>
                          <span className="text-[10px] block mt-0.5" style={{ color:tv.accent }}>{r.category}</span>
                        </button>
                      ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* ⌘K hint */}
            <button onClick={() => setShowCommandPalette(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-[10px] font-mono font-semibold transition-all"
              style={{ background:tv.surface, border:`1px solid ${tv.border}`, color:tv.textMuted }}>
              <Command className="w-3 h-3" /> K
            </button>

            {/* Interactive Notifications Center */}
            <div className="relative" id="admin_notification_center_trigger">
              <button
                onClick={() => setShowNotificationsDropdown(prev => !prev)}
                title="Notifications"
                className="relative p-2 rounded-xl cursor-pointer transition-all"
                style={{
                  background: showNotificationsDropdown ? tv.accentDim : tv.surface,
                  border: `1px solid ${showNotificationsDropdown ? tv.accentBorder : tv.border}`,
                  color: showNotificationsDropdown ? tv.accent : tv.textSecondary
                }}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ background: '#ef4444', color: '#fff', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}>
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {showNotificationsDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                      style={{
                        width: 360,
                        background: tv.surface,
                        border: `1px solid ${tv.border}`,
                        boxShadow: tv.cardHoverShadow
                      }}
                      id="admin_notification_popover_dropdown"
                    >
                      {/* Header */}
                      <div className="p-3.5 flex items-center justify-between border-b" style={{ borderColor: tv.border }}>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold" style={{ color: tv.textPrimary }}>Notifications</h4>
                          {unreadNotifCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold"
                              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                              {unreadNotifCount} unread
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={handleMarkAllNotificationsRead}
                            disabled={unreadNotifCount === 0}
                            title="Mark all as read"
                            className="p-1.5 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all disabled:opacity-40"
                            style={{ color: tv.accent, background: tv.accentDim }}
                          >
                            <CheckCheck className="w-3 h-3" /> Read all
                          </button>
                          <button
                            onClick={handleClearAllNotifications}
                            disabled={allNotifications.length === 0}
                            title="Clear all notifications"
                            className="p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all disabled:opacity-40"
                            style={{ color: tv.textMuted }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = tv.textMuted; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex items-center px-3 py-1.5 border-b gap-1" style={{ borderColor: tv.border, background: tv.surfaceRaised }}>
                        {(['all', 'unread'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setNotifFilter(f)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize cursor-pointer transition-all"
                            style={{
                              background: notifFilter === f ? tv.surface : 'transparent',
                              color: notifFilter === f ? tv.textPrimary : tv.textMuted,
                              border: `1px solid ${notifFilter === f ? tv.border : 'transparent'}`
                            }}
                          >
                            {f === 'all' ? `All (${allNotifications.length})` : `Unread (${unreadNotifCount})`}
                          </button>
                        ))}
                      </div>

                      {/* Notification list */}
                      <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${tv.border} transparent` }}>
                        {filteredNotifications.length === 0 ? (
                          <div className="py-10 text-center px-4 space-y-2">
                            <BellOff className="w-8 h-8 mx-auto" style={{ color: tv.textMuted }} />
                            <p className="text-xs font-bold" style={{ color: tv.textPrimary }}>All caught up!</p>
                            <p className="text-[10px]" style={{ color: tv.textSecondary }}>No {notifFilter === 'unread' ? 'unread' : ''} notifications to display.</p>
                          </div>
                        ) : (
                          filteredNotifications.map(n => (
                            <button
                              key={n.id}
                              onClick={() => handleSelectNotification(n)}
                              className="w-full p-3 text-left flex items-start gap-3 border-b transition-all cursor-pointer group"
                              style={{
                                borderColor: tv.border,
                                background: n.isUnread ? (tv.isDark ? 'rgba(16,185,129,0.04)' : 'rgba(5,150,105,0.03)') : 'transparent'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = tv.surfaceRaised}
                              onMouseLeave={e => e.currentTarget.style.background = n.isUnread ? (tv.isDark ? 'rgba(16,185,129,0.04)' : 'rgba(5,150,105,0.03)') : 'transparent'}
                            >
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: `${n.color}15`, border: `1px solid ${n.color}30` }}>
                                <n.icon className="w-3.5 h-3.5" style={{ color: n.color }} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-[9px] font-mono font-bold uppercase" style={{ color: n.color }}>{n.category}</span>
                                  <span className="text-[9px] font-mono shrink-0" style={{ color: tv.textMuted }}>{n.time}</span>
                                </div>
                                <p className="text-xs font-bold truncate" style={{ color: tv.textPrimary }}>{n.title}</p>
                                <p className="text-[11px] leading-snug line-clamp-2 mt-0.5" style={{ color: tv.textSecondary }}>{n.body}</p>
                              </div>
                              {n.isUnread && (
                                <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: tv.accent, boxShadow: `0 0 6px ${tv.accent}` }} />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>



            {/* Theme toggle */}
            {onToggleTheme && (
              <button onClick={onToggleTheme} title={`Switch to ${tv.isDark ? 'light' : 'dark'} mode`}
                className="p-2 rounded-xl cursor-pointer transition-all"
                style={{ background:tv.surface, border:`1px solid ${tv.border}`, color:tv.textSecondary }}>
                {tv.isDark
                  ? <Sun className="w-4 h-4" style={{ color:'#fbbf24' }} />
                  : <Moon className="w-4 h-4" style={{ color:'#6366f1' }} />}
              </button>
            )}

            {/* Sign out */}
            <button onClick={handleSignOut} title="Sign Out"
              className="p-2 rounded-xl cursor-pointer transition-all"
              style={{ background:tv.surface, border:`1px solid ${tv.border}`, color:tv.textSecondary }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; (e.currentTarget.querySelector('svg') as SVGElement)?.setAttribute('style','color:#f87171'); }}
              onMouseLeave={e => { e.currentTarget.style.background = tv.surface; e.currentTarget.style.borderColor = tv.border; (e.currentTarget.querySelector('svg') as SVGElement)?.setAttribute('style', `color:${tv.textSecondary}`); }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── CONTENT CANVAS ── */}
        <main className="flex-grow p-4 md:p-6" id="admin_content_canvas">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.15, ease:[0.16,1,0.3,1] }}>

              {activeTab === 'dashboard' && (
                <DashboardOverview users={adminUsers} research={adminResearch} projects={adminProjects} alliances={adminAlliances} organizations={adminOrgs} consulting={adminConsulting} challenges={adminChallenges} reports={adminReports} funding={adminFunding} onNavigateTab={(tab) => setActiveTab(tab)} theme={theme} tv={tv} />
              )}
              {activeTab === 'users' && (
                <UserManagement users={adminUsers} onUpdateUsers={handleUpdateAdminUsers} adminRoles={adminRoles} defaultFilterRole={userDirectoryFilter === 'admin_only' ? 'admin' : ''} theme={theme} tv={tv} />
              )}
              {(['research','projects','alliances','organizations','challenges'] as const).some(t => t === activeTab) && (
                <PortfolioManagement currentTab={activeTab as any} research={adminResearch} projects={adminProjects} alliances={adminAlliances} organizations={adminOrgs} challenges={adminChallenges} onUpdateResearch={setAdminResearch} onUpdateProjects={setAdminProjects} onUpdateAlliances={setAdminAlliances} onUpdateOrganizations={setAdminOrgs} onUpdateChallenges={setAdminChallenges} theme={theme} tv={tv} />
              )}
              {(['consulting','funding','matchmaking'] as const).some(t => t === activeTab) && (
                <ConsultingFunding currentTab={activeTab as any} consulting={adminConsulting} funding={adminFunding} users={adminUsers} projects={adminProjects} onUpdateConsulting={setAdminConsulting} onUpdateFunding={setAdminFunding} theme={theme} tv={tv} />
              )}
              {(['moderation','analytics','notifications','cms','reports','settings','logs','accounts'] as const).some(t => t === activeTab) && (
                <SystemOperations currentTab={activeTab as any} reports={adminReports} auditLogs={adminAuditLogs} adminRoles={adminRoles} onUpdateReports={setAdminReports} onUpdateAuditLogs={setAdminAuditLogs} onUpdateAdminRoles={setAdminRoles} theme={theme} tv={tv} users={adminUsers} funding={adminFunding} />
              )}
              {activeTab === 'legal' && <PolicyAdminView onClose={() => setActiveTab('dashboard')} />}
              {activeTab === 'testimonials' && <TestimonialsManagement theme={theme} tv={tv} />}

            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* ─── COMMAND PALETTE ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCommandPalette && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50 backdrop-blur-sm" style={{ background:'rgba(0,0,0,0.72)' }}
              onClick={() => setShowCommandPalette(false)} />
            <motion.div
              initial={{ opacity:0, scale:0.96, y:-16 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96, y:-16 }}
              transition={{ duration:0.14, ease:[0.16,1,0.3,1] }}
              className="fixed top-[12%] left-1/2 -translate-x-1/2 z-50 w-full max-w-[560px] rounded-2xl overflow-hidden"
              style={{ background: tv.isDark ? '#0e1117' : '#ffffff', border:`1px solid ${tv.border}`, boxShadow:'0 40px 100px rgba(0,0,0,0.7)' }}
              id="command_palette_modal">
              {/* Search row */}
              <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom:`1px solid ${tv.border}` }}>
                <Search className="w-4 h-4 shrink-0" style={{ color:tv.textMuted }} />
                <input ref={cmdInputRef} type="text" placeholder="Search commands, pages, users…"
                  value={commandQuery} onChange={e => setCommandQuery(e.target.value)}
                  className="flex-grow text-sm font-medium outline-none bg-transparent" style={{ color:tv.textPrimary }} />
                <kbd className="px-1.5 py-0.5 text-[9px] rounded font-mono shrink-0" style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}`, color:tv.textMuted }}>ESC</kbd>
              </div>
              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto py-1.5" style={{ scrollbarWidth:'none' }}>
                {!commandQuery.trim() && (
                  <div className="px-4 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color:tv.textMuted }}>All Commands</div>
                )}
                {filteredCmds.length === 0
                  ? <p className="py-10 text-center text-sm" style={{ color:tv.textMuted }}>No commands found.</p>
                  : filteredCmds.map((item, i) => (
                    <button key={i}
                      onClick={() => { setActiveTab(item.tab); setShowCommandPalette(false); setCommandQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all cursor-pointer"
                      onMouseEnter={e => e.currentTarget.style.background = tv.surfaceRaised}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:tv.accentDim, border:`1px solid ${tv.accentBorder}` }}>
                        <item.icon className="w-4 h-4" style={{ color:tv.accent }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold" style={{ color:tv.textPrimary }}>{item.label}</p>
                        <p className="text-[11px] truncate" style={{ color:tv.textSecondary }}>{item.description}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color:tv.textMuted }} />
                    </button>
                  ))}
              </div>
              {/* Footer hints */}
              <div className="flex items-center gap-4 px-4 py-2 text-[10px] font-mono" style={{ color:tv.textMuted, borderTop:`1px solid ${tv.border}` }}>
                <span>↵ select</span><span>ESC close</span>
                <span className="ml-auto">⌘K toggle</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MOBILE DRAWER (light/dark responsive) ───────────────────────────── */}
      <AnimatePresence>
        {isMobile && isMobileDrawerOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-50" style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }} id="mobile_admin_backdrop" />
            <motion.div
              initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'spring', damping:28, stiffness:240 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col overflow-y-auto"
              style={{
                background: tv.isDark ? 'linear-gradient(180deg, #0c1018 0%, #080b13 100%)' : '#ffffff',
                borderRight: `1px solid ${tv.border}`,
                scrollbarWidth: 'none'
              }}
              id="mobile_admin_drawer">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-3.5" style={{ borderBottom: `1px solid ${tv.border}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: tv.accentDim, border: `1px solid ${tv.accentBorder}` }}>
                    <img src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" alt="Aurenix" referrerPolicy="no-referrer" className="w-[14px] h-[14px] object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-black" style={{ color: tv.textPrimary }}>Admin <span style={{ color: tv.accent }}>Console</span></p>
                    <p className="text-[8px] font-mono uppercase tracking-wider" style={{ color: tv.textMuted }}>Mobile</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1.5 rounded-lg cursor-pointer" style={{ color: tv.textSecondary }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Mobile nav */}
              <div className="flex-grow py-3 px-2 space-y-0.5">
                {NAV_GROUPS.map((g, i) => (
                  <div key={i} className="mb-1">
                    <p className="px-2.5 pt-3 pb-1 text-[9px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: tv.isDark ? 'rgba(71,85,105,0.65)' : '#64748b' }}>{g.name}</p>
                    {g.items.map(item => {
                      const isActive = activeTab === item.id || (item.id === 'admins_scroll' && (activeTab === 'users' || activeTab === 'accounts'));
                      return (
                        <button key={item.id}
                          onClick={() => { if (item.id === 'admins_scroll') { setActiveTab('users'); setUserDirectoryFilter('admin_only'); } else setActiveTab(item.id); setIsMobileDrawerOpen(false); }}
                          className="w-full flex items-center gap-2.5 text-xs font-medium px-2.5 py-2.5 rounded-lg transition-all cursor-pointer"
                          style={{
                            color: isActive ? tv.accent : (tv.isDark ? 'rgba(148,163,184,0.55)' : '#475569'),
                            background: isActive ? tv.accentDim : 'transparent'
                          }}>
                          <item.icon className="w-[15px] h-[15px] shrink-0" style={{ color: isActive ? tv.accent : (tv.isDark ? 'rgba(100,116,139,0.8)' : '#64748b') }} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Drawer footer */}
              <div className="p-3 space-y-0.5" style={{ borderTop: `1px solid ${tv.border}` }}>
                <button onClick={() => { setIsMobileDrawerOpen(false); handleReturnHome(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer" style={{ color: tv.textSecondary }}>
                  <ArrowLeft className="w-4 h-4" /> Main Hub
                </button>
                <button onClick={() => { setIsMobileDrawerOpen(false); handleSignOut(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer" style={{ color:'#f87171' }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
