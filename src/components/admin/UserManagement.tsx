import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserCheck, 
  UserX, 
  Key, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  ChevronRight, 
  X, 
  Edit3, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Users
} from 'lucide-react';
import { AdminUser, AdminRoleConfig, MOCK_ADMIN_ROLES } from './AdminMockData';

interface UserManagementProps {
  users: AdminUser[];
  onUpdateUsers: (updated: AdminUser[]) => void;
  adminRoles?: AdminRoleConfig[];
  defaultFilterRole?: string;
  theme: 'light' | 'dark';
}

export default function UserManagement({
  users,
  onUpdateUsers,
  adminRoles = MOCK_ADMIN_ROLES,
  defaultFilterRole = '',
  theme
}: UserManagementProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState(defaultFilterRole || '');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  // Promote to specific admin role state
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState('Super Admin');

  // Synchronize with external sidebar "Admins Only" filters dynamically
  React.useEffect(() => {
    if (defaultFilterRole !== undefined) {
      setFilterRole(defaultFilterRole);
    }
  }, [defaultFilterRole]);

  // Bulk actions selection
  const [selectedUids, setSelectedUids] = useState<string[]>([]);

  // Detailed Modal states
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<keyof AdminUser>('joinedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Multi-select helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredUids = filteredUsers.map(u => u.uid);
      setSelectedUids(allFilteredUids);
    } else {
      setSelectedUids([]);
    }
  };

  const handleToggleSelectUser = (uid: string) => {
    if (selectedUids.includes(uid)) {
      setSelectedUids(selectedUids.filter(id => id !== uid));
    } else {
      setSelectedUids([...selectedUids, uid]);
    }
  };

  // Sort and filter logic
  const handleSort = (field: keyof AdminUser) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter(u => {
    const query = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !query || 
      (u.fullName || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.institution || '').toLowerCase().includes(query) ||
      (u.uid || '').toLowerCase().includes(query);

    const matchesRole = !filterRole || 
      (filterRole === 'admin' ? (u.role === 'admin' || u.role === 'super_admin') : u.role === filterRole);
    const matchesCountry = !filterCountry || u.country === filterCountry;
    const matchesInstitution = !filterInstitution || u.institution === filterInstitution;
    const matchesStatus = !filterStatus || u.status === filterStatus;
    const matchesVerified = !filterVerified || 
      (filterVerified === 'verified' && u.verified) || 
      (filterVerified === 'unverified' && !u.verified);

    return matchesSearch && matchesRole && matchesCountry && matchesInstitution && matchesStatus && matchesVerified;
  }).sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    } else if (typeof aVal === 'number') {
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    }
    return 0;
  });

  // Action Triggers with secure logs
  const handleToggleVerification = (uid: string) => {
    const updated = users.map(u => {
      if (u.uid === uid) {
        const nextVerified = !u.verified;
        return { ...u, verified: nextVerified };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleUpdateStatus = (uid: string, status: AdminUser['status']) => {
    if (window.confirm(`Are you sure you want to change this user's account status to ${status}?`)) {
      const updated = users.map(u => u.uid === uid ? { ...u, status } : u);
      onUpdateUsers(updated);
    }
  };

  const handleDeleteUser = (uid: string) => {
    if (window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete this user profile? This operation is irreversible and will delete associated database files.')) {
      const updated = users.filter(u => u.uid !== uid);
      onUpdateUsers(updated);
      setSelectedUids(selectedUids.filter(id => id !== uid));
    }
  };

  const handlePromoteDemote = (uid: string, newRole: AdminUser['role']) => {
    const updated = users.map(u => u.uid === uid ? { ...u, role: newRole } : u);
    onUpdateUsers(updated);
  };

  const handlePromoteToAdminRole = (uid: string, roleName: string) => {
    const updated = users.map(u => {
      if (u.uid === uid) {
        return {
          ...u,
          role: (roleName === 'Super Admin' ? 'super_admin' : 'admin') as any,
          adminRoleName: roleName
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    setPromotingUserId(null);
  };

  const handleResetPassword = (email: string) => {
    alert(`Success: Admin system issued a secure password reset link to ${email}. The user will receive authentication recovery coordinates shortly.`);
  };

  const handleExportCSV = () => {
    const headers = ['UID', 'Name', 'Email', 'Role', 'Country', 'Institution', 'Research Count', 'Projects', 'Followers', 'Status', 'Verified'];
    const rows = filteredUsers.map(u => [
      u.uid, u.fullName, u.email, u.role, u.country, u.institution, u.researchCount, u.projects, u.followers, u.status, u.verified ? 'YES' : 'NO'
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => {
        const stringVal = String(val ?? '');
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Aurenix_Users_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Bulk executions
  const handleBulkSuspend = () => {
    if (selectedUids.length === 0) return;
    if (window.confirm(`Are you sure you want to suspend all ${selectedUids.length} selected users?`)) {
      const updated = users.map(u => selectedUids.includes(u.uid) ? { ...u, status: 'suspended' as const } : u);
      onUpdateUsers(updated);
      setSelectedUids([]);
    }
  };

  const handleBulkVerify = () => {
    if (selectedUids.length === 0) return;
    if (window.confirm(`Approve verification for all ${selectedUids.length} selected researchers?`)) {
      const updated = users.map(u => selectedUids.includes(u.uid) ? { ...u, verified: true } : u);
      onUpdateUsers(updated);
      setSelectedUids([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedUids.length === 0) return;
    if (window.confirm(`CRITICAL WARNING: You are about to permanently delete ${selectedUids.length} user accounts. Confirm?`)) {
      const updated = users.filter(u => !selectedUids.includes(u.uid));
      onUpdateUsers(updated);
      setSelectedUids([]);
    }
  };

  // Unique lists for filtering dropdowns
  const countries = Array.from(new Set(users.map(u => u.country))).filter(Boolean);
  const institutions = Array.from(new Set(users.map(u => u.institution))).filter(Boolean);

  if (viewingUser) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-left" id="user_blueprint_details_view">
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden shrink-0 select-none">
              {viewingUser.avatar ? (
                <img src={viewingUser.avatar} alt={viewingUser.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{viewingUser.fullName.charAt(0)}</span>
              )}
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                {viewingUser.fullName}
                {viewingUser.verified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50 dark:text-emerald-400 dark:fill-emerald-950/10" />
                )}
              </span>
              <span className="block text-xs text-slate-400 font-mono mt-0.5">{viewingUser.email}</span>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold rounded-full font-mono uppercase">
                {viewingUser.role}
              </span>
            </div>
          </div>
          <button onClick={() => setViewingUser(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition border-0">
            &larr; Back to list
          </button>
        </div>

        <div className="pt-4 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs" id="user_blueprint_details">
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">UID</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{viewingUser.uid}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">Country Location</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">{viewingUser.country}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">Affiliation</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">{viewingUser.institution || 'Individual Stakeholder'}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">Research Publications</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{viewingUser.researchCount} uploaded</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">Collaborative Projects</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{viewingUser.projects} active</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">Ecosystem Followers</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{viewingUser.followers} users</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">Covenant Registration</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(viewingUser.joinedDate).toLocaleDateString()}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-slate-400 font-mono">Account Integrity</span>
            <span className={`font-mono font-bold uppercase ${viewingUser.status === 'active' ? 'text-emerald-600' : 'text-red-500'}`}>{viewingUser.status}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setViewingUser(null)}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer border-0"
          >
            Close Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="user_management_section">
      {/* Filters and search headers */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, institution, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setFilterRole('admin');
                const tbl = document.getElementById('user_directory_table_wrapper');
                if (tbl) tbl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-2 border border-purple-100/30 shadow-xs"
              id="admins_scroll_directory_btn"
            >
              <Users className="w-4 h-4" />
              Admins ↓
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-100 transition flex items-center gap-2"
              id="export_users_csv"
            >
              <Download className="w-4 h-4" />
              Export Directory
            </button>
          </div>
        </div>

        {/* Dropdown Filters row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Roles</option>
              <option value="Researcher">Researcher</option>
              <option value="Student">Student</option>
              <option value="Lecturer">Lecturer / Professor</option>
              <option value="Institution">Institution</option>
              <option value="Industry">Industry Professional</option>
              <option value="Government">Government Agency</option>
              <option value="NGO">NGO / Development</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Country</label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Institution</label>
            <select
              value={filterInstitution}
              onChange={(e) => setFilterInstitution(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => <option key={inst} value={inst}>{inst}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Verification</label>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Verification</option>
              <option value="verified">Verified Profile</option>
              <option value="unverified">Unverified Profile</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions Floating panel when rows selected */}
      <AnimatePresence>
        {selectedUids.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="flex flex-wrap items-center justify-between p-4 bg-slate-800 dark:bg-slate-950 text-white rounded-2xl shadow-xl gap-4"
            id="bulk_action_floating_panel"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold font-mono">
                {selectedUids.length} accounts selected for batch operations
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkVerify}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase font-mono rounded-lg cursor-pointer"
              >
                Verify Accounts
              </button>
              <button
                onClick={handleBulkSuspend}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase font-mono rounded-lg cursor-pointer"
              >
                Suspend
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase font-mono rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={() => setSelectedUids([])}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main User Grid/Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden" id="user_directory_table_wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase select-none">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedUids.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                </th>
                <th className="p-4 cursor-pointer hover:text-emerald-600" onClick={() => handleSort('fullName')}>Name</th>
                <th className="p-4 cursor-pointer hover:text-emerald-600" onClick={() => handleSort('role')}>Role</th>
                <th className="p-4 cursor-pointer hover:text-emerald-600" onClick={() => handleSort('country')}>Country</th>
                <th className="p-4 cursor-pointer hover:text-emerald-600" onClick={() => handleSort('institution')}>Institution</th>
                <th className="p-4 text-center cursor-pointer hover:text-emerald-600" onClick={() => handleSort('researchCount')}>Research</th>
                <th className="p-4 text-center cursor-pointer hover:text-emerald-600" onClick={() => handleSort('followers')}>Followers</th>
                <th className="p-4 cursor-pointer hover:text-emerald-600" onClick={() => handleSort('joinedDate')}>Joined Date</th>
                <th className="p-4 cursor-pointer hover:text-emerald-600 text-center" onClick={() => handleSort('status')}>Status</th>
                <th className="p-4 text-right pr-6">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No researcher profiles matching the specific filter arrays were identified.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr 
                    key={u.uid} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-xs transition-colors"
                  >
                    {/* Multi selection checkbox */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUids.includes(u.uid)}
                        onChange={() => handleToggleSelectUser(u.uid)}
                        className="w-3.5 h-3.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>

                    {/* Name block with profile circle */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-display font-bold text-emerald-700 dark:text-emerald-400 text-xs shrink-0 select-none overflow-hidden">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            u.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            {u.fullName}
                            {u.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50 dark:text-emerald-400 dark:fill-emerald-950/20" title="Verified Institutional Researcher" />
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' || u.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                          : u.role === 'Researcher'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Country */}
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                      {u.country}
                    </td>

                    {/* Institution */}
                    <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={u.institution}>
                      {u.institution || 'Individual Sponsor'}
                    </td>

                    {/* Research count */}
                    <td className="p-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {u.researchCount}
                    </td>

                    {/* Followers count */}
                    <td className="p-4 text-center font-mono text-slate-400 dark:text-slate-500">
                      {u.followers}
                    </td>

                    {/* Joined Date */}
                    <td className="p-4 font-mono text-slate-400 dark:text-slate-500">
                      {new Date(u.joinedDate).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : u.status === 'suspended'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingUser(u)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-md transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <select
                          onChange={(e) => {
                            const action = e.target.value;
                            if (action === 'verify') handleToggleVerification(u.uid);
                            else if (action === 'suspend') handleUpdateStatus(u.uid, 'suspended');
                            else if (action === 'activate') handleUpdateStatus(u.uid, 'active');
                            else if (action === 'reset_pwd') handleResetPassword(u.email);
                            else if (action === 'promote_admin') setPromotingUserId(u.uid);
                            else if (action === 'demote_user') handlePromoteDemote(u.uid, 'Researcher');
                            else if (action === 'delete') handleDeleteUser(u.uid);
                            e.target.value = ''; // Reset select
                          }}
                          className="p-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
                        >
                          <option value="">Manage</option>
                          <option value="verify">{u.verified ? 'Unverify Profile' : 'Verify Profile'}</option>
                          <option value="activate">Activate Account</option>
                          <option value="suspend">Suspend Account</option>
                          <option value="reset_pwd">Reset Password</option>
                          <option value="promote_admin">Promote to Admin</option>
                          <option value="demote_user">Demote to Expert</option>
                          <option value="delete">Delete Account</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Editing Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:divide-slate-800/80">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                Edit Profile: {editingUser.fullName}
              </h3>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const updated = users.map(u => u.uid === editingUser.uid ? editingUser : u);
              onUpdateUsers(updated);
              setEditingUser(null);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Email Coordinate</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Role Hierarchy</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Institution">Institution</option>
                    <option value="Industry">Industry</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Institution / Lab</label>
                  <input
                    type="text"
                    value={editingUser.institution}
                    onChange={(e) => setEditingUser({ ...editingUser, institution: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Country</label>
                  <input
                    type="text"
                    value={editingUser.country}
                    onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">Account Security State</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 rounded-lg focus:outline-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <input
                  type="checkbox"
                  id="user_verified_edit_check"
                  checked={editingUser.verified}
                  onChange={(e) => setEditingUser({ ...editingUser, verified: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="user_verified_edit_check" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                  Approve Verification Credentials (Verified Academic ORCID)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}      {/* 4. CHOOSE ADMIN ROLE MODAL FOR COMPREHENSIVE COMPLIANCE & VERIFICATION */}
      {promotingUserId && (() => {
        const userToPromote = users.find(u => u.uid === promotingUserId);
        if (!userToPromote) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">
                      Elevate to Platform Admin
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Role Matrix Delegation</p>
                  </div>
                </div>
                <button onClick={() => setPromotingUserId(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Candidate Details:</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">{userToPromote.fullName}</span>
                  <span className="block text-[10px] text-slate-500 font-mono">{userToPromote.email} • {userToPromote.institution || 'Individual Affiliation'}</span>
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-mono text-slate-400 uppercase font-bold">Select Delegated Role:</span>
                  <div className="space-y-3">
                    {adminRoles.map((role) => {
                      const isSelected = selectedRoleName === role.roleName;
                      return (
                        <div
                          key={role.id}
                          onClick={() => setSelectedRoleName(role.roleName)}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all text-left ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                              : 'border-slate-100 dark:border-slate-850 hover:border-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/45'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-display">{role.roleName}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{role.description}</p>
                          
                          {/* Permissions matrix indicator */}
                          <div className="mt-3 pt-2.5 border-t border-slate-105 dark:border-slate-800/80 grid grid-cols-3 gap-1.5">
                            {Object.entries(role.permissions).slice(0, 6).map(([perm, val]) => (
                              <div key={perm} className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                                <span className="text-[8px] font-mono text-slate-400 uppercase truncate">{perm}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  onClick={() => setPromotingUserId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePromoteToAdminRole(userToPromote.uid, selectedRoleName)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-md shadow-emerald-600/10"
                >
                  Confirm Delegation
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </div>
  );
}
