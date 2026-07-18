import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  Award, 
  Briefcase, 
  Building, 
  Sparkles, 
  Activity, 
  Sliders, 
  ShieldAlert, 
  Bell, 
  Settings, 
  Terminal, 
  TrendingUp, 
  CheckCircle2, 
  ArrowLeft, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Menu, 
  X, 
  HelpCircle,
  FolderLock,
  Compass,
  Inbox,
  UserCheck,
  HeartHandshake,
  BarChart3,
  Edit3,
  Download
} from 'lucide-react';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  MOCK_RESEARCH, 
  MOCK_PROJECTS, 
  MOCK_ALLIANCES, 
  MOCK_ORGANIZATIONS, 
  MOCK_CONSULTING, 
  MOCK_FUNDING, 
  MOCK_CHALLENGES, 
  MOCK_REPORTS, 
  MOCK_AUDIT_LOGS, 
  MOCK_ADMIN_ROLES,
  AdminUser,
  AdminResearch,
  AdminProject,
  AdminAlliance,
  AdminOrganization,
  AdminConsulting,
  AdminFunding,
  AdminChallenge,
  AdminReportedItem,
  AdminAuditLog,
  AdminRoleConfig
} from './AdminMockData';

import DashboardOverview from './DashboardOverview';
import UserManagement from './UserManagement';
import PortfolioManagement from './PortfolioManagement';
import ConsultingFunding from './ConsultingFunding';
import SystemOperations from './SystemOperations';
import { getAllUsers, saveUserProfileByAdmin } from '../../services/db';

interface AdminPortalProps {
  user: FirebaseUser | null;
  userProfile: any | null;
  setView: (view: any) => void;
  theme?: 'light' | 'dark';
}

type AdminTab = 
  | 'dashboard' | 'users' | 'research' | 'projects' | 'alliances' 
  | 'organizations' | 'consulting' | 'funding' | 'challenges' 
  | 'matchmaking' | 'moderation' | 'analytics' | 'notifications' 
  | 'cms' | 'reports' | 'settings' | 'logs' | 'accounts' | 'admins_scroll';

export default function AdminPortal({
  user,
  userProfile,
  setView,
  theme = 'light'
}: AdminPortalProps) {
  // Collapsible sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [userDirectoryFilter, setUserDirectoryFilter] = useState('');
  const [simulatedAdminRole, setSimulatedAdminRole] = useState('');

  // Global search across everything
  const [globalQuery, setGlobalQuery] = useState('');
  const [showGlobalResults, setShowGlobalResults] = useState(false);

  // Initialize user management state purely with empty array, to be populated in real-time by Firestore
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Listen to real-time users collection in Firestore
  useEffect(() => {
    const colRef = collection(db, 'users');
    const unsubscribe = onSnapshot(colRef, (querySnapshot) => {
      const dbUsers: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        dbUsers.push({
          uid: docSnap.id,
          id: docSnap.id,
          ...d,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt,
        });
      });

      // Map Firestore fields directly to the existing table structure expected by the UI
      const mappedDbUsers: AdminUser[] = dbUsers.map(u => ({
        uid: u.uid || u.id,
        fullName: u.fullName || 'Anonymous User',
        email: u.email || '',
        role: u.role || 'Researcher',
        adminRoleName: u.adminRoleName || '',
        country: u.country || 'Unknown',
        institution: u.institution || 'Individual',
        researchCount: u.uploadedResearchCount || u.researchCount || 0,
        projects: u.projects || 0,
        followers: u.followers || 0,
        joinedDate: u.joinedDate || (u.createdAt ? u.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10)),
        status: u.status || 'active',
        verified: u.verified !== undefined ? !!u.verified : (u.verificationStatus === 'verified'),
        avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName || 'User')}`
      }));

      setAdminUsers(mappedDbUsers);
    }, (error) => {
      console.warn('Real-time users snapshot listener encountered permissions check or failure:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateAdminUsers = (updatedUsers: AdminUser[]) => {
    setAdminUsers(updatedUsers);
    
    // Find what changed and save to Firestore
    updatedUsers.forEach(async (u) => {
      const prevU = adminUsers.find(p => p.uid === u.uid);
      if (!prevU || JSON.stringify(prevU) !== JSON.stringify(u)) {
        try {
          await saveUserProfileByAdmin(u.uid, {
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            adminRoleName: u.adminRoleName || '',
            country: u.country,
            institution: u.institution || '',
            termsAccepted: true,
            verified: !!u.verified,
            status: u.status || 'active',
            projects: u.projects || 0,
            followers: u.followers || 0,
            uploadedResearchCount: u.researchCount || 0,
            joinedDate: u.joinedDate || new Date().toISOString()
          });
        } catch (err) {
          console.error('Error writing user update to Firestore:', err);
        }
      }
    });

    // Handle deletions if any
    adminUsers.forEach(async (p) => {
      const isStillPresent = updatedUsers.some(u => u.uid === p.uid);
      if (!isStillPresent) {
        try {
          await deleteDoc(doc(db, 'users', p.uid));
          console.log(`Deleted user ${p.uid} from Firestore`);
        } catch (err) {
          console.error(`Error deleting user ${p.uid} from Firestore:`, err);
        }
      }
    });
  };

  const [adminResearch, setAdminResearch] = useState<AdminResearch[]>(() => {
    const data = localStorage.getItem('aurenix_admin_research');
    return data ? JSON.parse(data) : MOCK_RESEARCH;
  });

  const [adminProjects, setAdminProjects] = useState<AdminProject[]>(() => {
    const data = localStorage.getItem('aurenix_admin_projects');
    return data ? JSON.parse(data) : MOCK_PROJECTS;
  });

  const [adminAlliances, setAdminAlliances] = useState<AdminAlliance[]>(() => {
    const data = localStorage.getItem('aurenix_admin_alliances');
    return data ? JSON.parse(data) : MOCK_ALLIANCES;
  });

  const [adminOrgs, setAdminOrgs] = useState<AdminOrganization[]>(() => {
    const data = localStorage.getItem('aurenix_admin_orgs');
    return data ? JSON.parse(data) : MOCK_ORGANIZATIONS;
  });

  const [adminConsulting, setAdminConsulting] = useState<AdminConsulting[]>(() => {
    const data = localStorage.getItem('aurenix_admin_consulting');
    return data ? JSON.parse(data) : MOCK_CONSULTING;
  });

  const [adminFunding, setAdminFunding] = useState<AdminFunding[]>(() => {
    const data = localStorage.getItem('aurenix_admin_funding');
    return data ? JSON.parse(data) : MOCK_FUNDING;
  });

  const [adminChallenges, setAdminChallenges] = useState<AdminChallenge[]>(() => {
    const data = localStorage.getItem('aurenix_admin_challenges');
    return data ? JSON.parse(data) : MOCK_CHALLENGES;
  });

  const [adminReports, setAdminReports] = useState<AdminReportedItem[]>(() => {
    const data = localStorage.getItem('aurenix_admin_reports');
    return data ? JSON.parse(data) : MOCK_REPORTS;
  });

  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLog[]>(() => {
    const data = localStorage.getItem('aurenix_admin_audit_logs');
    return data ? JSON.parse(data) : MOCK_AUDIT_LOGS;
  });

  const [adminRoles, setAdminRoles] = useState<AdminRoleConfig[]>(() => {
    const data = localStorage.getItem('aurenix_admin_roles');
    return data ? JSON.parse(data) : MOCK_ADMIN_ROLES;
  });

  // Keep LocalStorage synchronized
  useEffect(() => {
    localStorage.setItem('aurenix_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_research', JSON.stringify(adminResearch));
  }, [adminResearch]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_projects', JSON.stringify(adminProjects));
  }, [adminProjects]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_alliances', JSON.stringify(adminAlliances));
  }, [adminAlliances]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_orgs', JSON.stringify(adminOrgs));
  }, [adminOrgs]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_consulting', JSON.stringify(adminConsulting));
  }, [adminConsulting]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_funding', JSON.stringify(adminFunding));
  }, [adminFunding]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_challenges', JSON.stringify(adminChallenges));
  }, [adminChallenges]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_reports', JSON.stringify(adminReports));
  }, [adminReports]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_audit_logs', JSON.stringify(adminAuditLogs));
  }, [adminAuditLogs]);

  useEffect(() => {
    localStorage.setItem('aurenix_admin_roles', JSON.stringify(adminRoles));
  }, [adminRoles]);

  // Synchronize URL pathname on view mount
  useEffect(() => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
  }, []);

  // Access check: User must be signed in AND have 'admin' or 'super_admin' role
  const isUserPlatformAdmin = 
    userProfile?.role?.toLowerCase() === 'admin' || 
    userProfile?.role?.toLowerCase() === 'super_admin' ||
    user?.uid === 'sandbox-admin-bola' ||
    user?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' ||
    user?.email?.toLowerCase() === 'adeyemibola2569@gmail.com' ||
    userProfile?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' ||
    userProfile?.email?.toLowerCase() === 'adeyemibola2569@gmail.com'; // Allow immediately for admin emails

  // Role permissions checker based on the dynamic Admin Role Matrix
  const hasPermission = (tabId: AdminTab): boolean => {
    // If we're on the simulated role choice, choose that, otherwise actual role profile adminRoleName
    const activeRoleName = simulatedAdminRole || userProfile?.adminRoleName || (userProfile?.role?.toLowerCase() === 'super_admin' ? 'Super Admin' : '');

    // Check if user is Super Admin or the platform owner - they get unrestricted master control
    if (
      activeRoleName === 'Super Admin' ||
      user?.uid === 'sandbox-admin-bola' ||
      user?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' ||
      user?.email?.toLowerCase() === 'adeyemibola2569@gmail.com' ||
      userProfile?.email?.toLowerCase() === 'bola.adeyemi@aurenix-research.org' ||
      userProfile?.email?.toLowerCase() === 'adeyemibola2569@gmail.com'
    ) {
      return true;
    }

    const roleConfig = adminRoles.find(r => r.roleName.toLowerCase() === activeRoleName.toLowerCase());
    if (!roleConfig) {
      return true; // Default fallback for dev/testing robustness
    }

    const perms = roleConfig.permissions;

    // Map each viewport tab directly to permissions listed in the Admin Role Matrix
    switch (tabId) {
      case 'dashboard': return !!perms.dashboard;
      case 'users': return !!perms.users;
      case 'research': return !!perms.research;
      case 'projects': return !!perms.projects;
      case 'alliances': return !!perms.alliances;
      case 'organizations': return !!perms.organizations;
      case 'consulting': return !!perms.consulting;
      case 'funding': return !!perms.funding;
      case 'challenges': return !!perms.challenges;
      case 'matchmaking': return !!perms.dashboard || !!perms.consulting;
      case 'moderation': return !!perms.moderation;
      case 'analytics': return !!perms.dashboard;
      case 'notifications': return !!perms.moderation || !!perms.settings;
      case 'cms': return !!perms.settings;
      case 'reports': return !!perms.users || !!perms.funding;
      case 'settings': return !!perms.settings;
      case 'logs': return !!perms.auditLogs;
      case 'accounts': return !!perms.settings;
      default: return true;
    }
  };

  // Dynamic tab safety router: locks out and redirects if user role permissions don't allow current tab
  useEffect(() => {
    if (!hasPermission(activeTab)) {
      const availableTabs: AdminTab[] = [
        'dashboard', 'users', 'research', 'projects', 'alliances', 
        'organizations', 'consulting', 'funding', 'challenges', 
        'matchmaking', 'moderation', 'analytics', 'notifications', 
        'cms', 'reports', 'settings', 'logs', 'accounts'
      ];
      const fallback = availableTabs.find(t => hasPermission(t));
      if (fallback) {
        setActiveTab(fallback);
      }
    }
  }, [activeTab, simulatedAdminRole, userProfile, adminRoles]);

  // Global search engine across categories
  const handleGlobalSearch = () => {
    const q = globalQuery.toLowerCase().trim();
    if (!q) return [];

    const matches: { title: string; category: string; tab: AdminTab }[] = [];

    adminUsers.forEach(u => {
      if (u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
        matches.push({ title: `User: ${u.fullName} (${u.email})`, category: 'User Management', tab: 'users' });
      }
    });

    adminResearch.forEach(r => {
      if (r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q)) {
        matches.push({ title: `Research: ${r.title}`, category: 'Research Repository', tab: 'research' });
      }
    });

    adminProjects.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.researcher.toLowerCase().includes(q)) {
        matches.push({ title: `Project: ${p.title}`, category: 'Innovation Projects', tab: 'projects' });
      }
    });

    adminOrgs.forEach(o => {
      if (o.name.toLowerCase().includes(q)) {
        matches.push({ title: `Organization: ${o.name}`, category: 'Organizations', tab: 'organizations' });
      }
    });

    adminFunding.forEach(f => {
      if (f.sponsor.toLowerCase().includes(q)) {
        matches.push({ title: `Funding: ${f.sponsor} (${f.amount})`, category: 'Funding & Grants', tab: 'funding' });
      }
    });

    return matches.slice(0, 8); // Return max 8 results
  };

  const globalResults = handleGlobalSearch();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setView('home');
      window.history.pushState(null, '', '/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnHome = () => {
    setView('home');
    window.history.pushState(null, '', '/');
  };

  // Structured Categories list for nesting collapsible side-items
  const sideCategories = [
    {
      name: 'Core Operations',
      items: [
        { label: 'Overview Dashboard', id: 'dashboard' as const, icon: Activity },
        { label: 'User Directory', id: 'users' as const, icon: Users },
        { label: 'Admins', id: 'admins_scroll' as const, icon: UserCheck }
      ]
    },
    {
      name: 'Ecosystem Portfolio',
      items: [
        { label: 'Research Repository', id: 'research' as const, icon: BookOpen },
        { label: 'Innovation Projects', id: 'projects' as const, icon: Briefcase },
        { label: 'Alliance Covenants', id: 'alliances' as const, icon: Award },
        { label: 'Organizations Directory', id: 'organizations' as const, icon: Building }
      ]
    },
    {
      name: 'Engagement Core',
      items: [
        { label: 'Expert Consulting', id: 'consulting' as const, icon: HeartHandshake },
        { label: 'Grants & Funding', id: 'funding' as const, icon: Award },
        { label: 'Innovation Challenges', id: 'challenges' as const, icon: Sparkles },
        { label: 'AI Matchmaking Suite', id: 'matchmaking' as const, icon: Compass }
      ]
    },
    {
      name: 'System Administration',
      items: [
        { label: 'Moderation Cases', id: 'moderation' as const, icon: Sliders },
        { label: 'Ecosystem Analytics', id: 'analytics' as const, icon: BarChart3 },
        { label: 'Broadcast System', id: 'notifications' as const, icon: Bell },
        { label: 'CMS Layout Editor', id: 'cms' as const, icon: Edit3 },
        { label: 'Downloadable Reports', id: 'reports' as const, icon: Download }
      ]
    },
    {
      name: 'Preferences & Safety',
      items: [
        { label: 'Platform Settings', id: 'settings' as const, icon: Settings },
        { label: 'Audit Trail Logs', id: 'logs' as const, icon: Terminal },
        { label: 'Admin Role Matrix', id: 'accounts' as const, icon: UserCheck }
      ]
    }
  ];

  // Render Access Denied View if RBAC checks fail
  if (!isUserPlatformAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative select-none" id="admin_unauthorized_wrapper">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-[0.06] pointer-events-none z-0"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-xl relative z-10"
        >
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <FolderLock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">
              403: Access Restricted
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Security clearance authorized strictly for registered platform administrators. Your credentials are index locked.
            </p>
          </div>

          {user ? (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-left space-y-1">
              <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Identified Account:</span>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">{userProfile?.fullName || user.displayName}</span>
              <span className="block text-[10px] text-slate-400 font-mono">{user.email} • Role: {userProfile?.role || 'User'}</span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl text-xs font-bold text-center">
              Please sign in with authorized admin coordinates.
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={handleReturnHome}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Research Hub
            </button>
            
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out / Switch Account
              </button>
            ) : (
              <button
                onClick={() => setView('home')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Go to Log In Screen
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans" id="admin_portal_layout">
      
      {/* 1. COLLAPSIBLE SIDERAIL Grouped by Nested categories */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? '78px' : '260px' }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="hidden md:flex fixed left-4 top-4 bottom-4 z-40 bg-white dark:bg-slate-900 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-800 rounded-3xl flex-col justify-between overflow-hidden"
      >
        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-4">
          
          {/* Header Title branding */}
          <div className={`flex items-center justify-between mb-8 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2 select-none">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                    alt="Aurenix Research Logo" 
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 object-contain animate-pulse"
                  />
                </div>
                <div>
                  <span className="block text-sm font-display font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                    Admin <span className="text-emerald-600">Portal</span>
                  </span>
                  <span className="block text-[8px] font-mono tracking-widest text-slate-400 uppercase mt-1">
                    Aurenix ecosystem
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-emerald-50 rounded-xl shrink-0">
                <img 
                  src="https://lh3.googleusercontent.com/d/1POL5B_50Y1qxV72fFk68hXfMSZe52IDF" 
                  alt="Aurenix Logo" 
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 object-contain"
                />
              </div>
            )}
          </div>

          {/* Siderail items list grouped by category */}
          <div className="space-y-6 flex-grow">
            {sideCategories
              .map((cat) => {
                const permittedItems = cat.items.filter(item => hasPermission(item.id));
                return { ...cat, items: permittedItems };
              })
              .filter(cat => cat.items.length > 0)
              .map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  {!isSidebarCollapsed && (
                    <span className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest px-3">
                      {cat.name}
                    </span>
                  )}
                  <div className="space-y-1">
                    {cat.items.map((item) => {
                      // Custom rendering for the special collapsible Admins button
                      if (item.id === 'admins_scroll') {
                        const isAdminsTabActive = activeTab === 'users' && (userDirectoryFilter === 'admin' || userDirectoryFilter === 'admin_only');
                        const isMatrixTabActive = activeTab === 'accounts';
                        const isActive = isAdminsTabActive || isMatrixTabActive || isAdminDropdownOpen;

                        return (
                          <div key={item.id} className="space-y-1">
                            <button
                              onClick={() => {
                                setIsAdminDropdownOpen(!isAdminDropdownOpen);
                                setActiveTab('users');
                                setUserDirectoryFilter('admin_only');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive 
                                  ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900'
                              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                              title="Administrators"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                              </div>
                              {!isSidebarCollapsed && (
                                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-90 text-emerald-600' : 'text-slate-400'}`} />
                              )}
                            </button>

                            {/* Submenu that scrolls/slides down when clicked */}
                            <AnimatePresence initial={false}>
                              {isAdminDropdownOpen && !isSidebarCollapsed && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="pl-5 space-y-1 overflow-hidden"
                                >
                                  <button
                                    onClick={() => {
                                      setActiveTab('users');
                                      setUserDirectoryFilter('admin_only');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold tracking-tight transition-colors flex items-center gap-1.5 cursor-pointer ${
                                      activeTab === 'users' && userDirectoryFilter === 'admin_only'
                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Admin Directory
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveTab('accounts');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold tracking-tight transition-colors flex items-center gap-1.5 cursor-pointer ${
                                      activeTab === 'accounts'
                                        ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    Admin Role Matrix
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            if (item.id === 'users') {
                              setUserDirectoryFilter(''); // Reset admins-only filter when General User Directory clicked
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900'
                          } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                          title={item.label}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

        </div>

        {/* Bottom actions list */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800/80 space-y-1">
          <button
            onClick={handleReturnHome}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            {!isSidebarCollapsed && <span>Main Hub</span>}
          </button>
          
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 cursor-pointer ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </motion.aside>

      {/* 2. MAIN BODY WRAPPER */}
      <div 
        className="flex-grow flex flex-col min-h-screen transition-all"
        style={{ paddingLeft: isSidebarCollapsed ? '98px' : '280px' }}
      >
        {/* Top bar with Search & Identity */}
        <header className="sticky top-0 z-30 bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur-md py-4 px-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4">
          
          {/* Top Search bar */}
          <div className="relative flex-grow max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search users, papers, organizations instantly..."
              value={globalQuery}
              onChange={(e) => {
                setGlobalQuery(e.target.value);
                setShowGlobalResults(true);
              }}
              onFocus={() => setShowGlobalResults(true)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none"
            />

            {/* Instant search dropdown dropdown */}
            <AnimatePresence>
              {showGlobalResults && globalQuery.trim() && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowGlobalResults(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800"
                    id="global_search_results_dropdown"
                  >
                    <div className="p-3 text-[10px] font-mono text-slate-400 font-bold uppercase select-none">
                      Global Search results
                    </div>
                    {globalResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-mono">
                        No cross-sector alignments identified.
                      </div>
                    ) : (
                      globalResults.map((match, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveTab(match.tab);
                            setGlobalQuery('');
                            setShowGlobalResults(false);
                          }}
                          className="w-full p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition text-xs block"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">{match.title}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{match.category}</span>
                        </button>
                      ))
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Identity badge */}
          <div className="flex items-center gap-3">
            {/* Dynamic Role Simulator for Testing Admin Restrictions */}
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/60 p-1.5 px-2.5 rounded-xl">
              <span className="text-[9px] font-mono font-bold text-purple-700 dark:text-purple-400 uppercase whitespace-nowrap">Testing Role:</span>
              <select
                value={simulatedAdminRole}
                onChange={(e) => setSimulatedAdminRole(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-purple-800 dark:text-purple-300 focus:outline-none cursor-pointer p-0"
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Super Admin (Default)</option>
                {adminRoles.map(r => (
                  <option key={r.id} value={r.roleName} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{r.roleName}</option>
                ))}
              </select>
            </div>

            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 font-display">
                {userProfile?.fullName || 'Bola Adeyemi'}
              </span>
              <span className="block text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                {simulatedAdminRole ? `Simulating: ${simulatedAdminRole}` : (userProfile?.adminRoleName || 'Platform Super Admin')}
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 bg-white dark:bg-slate-900 cursor-pointer transition-colors"
              title="Terminate Admin Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </header>

        {/* Content canvas container */}
        <main className="flex-grow p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15 }}
            >
              {/* Mount designated administrative viewport */}
              {activeTab === 'dashboard' && (
                <DashboardOverview
                  users={adminUsers}
                  research={adminResearch}
                  projects={adminProjects}
                  alliances={adminAlliances}
                  organizations={adminOrgs}
                  consulting={adminConsulting}
                  challenges={adminChallenges}
                  reports={adminReports}
                  theme={theme}
                />
              )}

              {activeTab === 'users' && (
                <UserManagement
                  users={adminUsers}
                  onUpdateUsers={handleUpdateAdminUsers}
                  adminRoles={adminRoles}
                  defaultFilterRole={userDirectoryFilter === 'admin_only' ? 'admin' : ''}
                  theme={theme}
                />
              )}

              {(activeTab === 'research' || activeTab === 'projects' || activeTab === 'alliances' || activeTab === 'organizations' || activeTab === 'challenges') && (
                <PortfolioManagement
                  currentTab={activeTab}
                  research={adminResearch}
                  projects={adminProjects}
                  alliances={adminAlliances}
                  organizations={adminOrgs}
                  challenges={adminChallenges}
                  onUpdateResearch={setAdminResearch}
                  onUpdateProjects={setAdminProjects}
                  onUpdateAlliances={setAdminAlliances}
                  onUpdateOrganizations={setAdminOrgs}
                  onUpdateChallenges={setAdminChallenges}
                  theme={theme}
                />
              )}

              {(activeTab === 'consulting' || activeTab === 'funding' || activeTab === 'matchmaking') && (
                <ConsultingFunding
                  currentTab={activeTab}
                  consulting={adminConsulting}
                  funding={adminFunding}
                  users={adminUsers}
                  projects={adminProjects}
                  onUpdateConsulting={setAdminConsulting}
                  onUpdateFunding={setAdminFunding}
                  theme={theme}
                />
              )}

              {(activeTab === 'moderation' || activeTab === 'analytics' || activeTab === 'notifications' || activeTab === 'cms' || activeTab === 'reports' || activeTab === 'settings' || activeTab === 'logs' || activeTab === 'accounts') && (
                <SystemOperations
                  currentTab={activeTab}
                  reports={adminReports}
                  auditLogs={adminAuditLogs}
                  adminRoles={adminRoles}
                  onUpdateReports={setAdminReports}
                  onUpdateAuditLogs={setAdminAuditLogs}
                  onUpdateAdminRoles={setAdminRoles}
                  theme={theme}
                  users={adminUsers}
                  funding={adminFunding}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
