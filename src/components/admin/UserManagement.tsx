import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Filter, UserPlus, CheckCircle2, XCircle, Trash2, UserCheck,
  UserX, Key, ArrowUp, ArrowDown, Download, ChevronRight, X, Edit3,
  ShieldAlert, Loader2, Users, Mail, MapPin, Building, Calendar,
  BookOpen, Briefcase, Heart, Shield, MoreHorizontal, Eye, Ban,
  RefreshCw, Star, CheckSquare, Square, Minus
} from 'lucide-react';
import type { AdminThemeVars } from './AdminPortal';
import { AdminUser, AdminRoleConfig, MOCK_ADMIN_ROLES } from './AdminMockData';

interface UserManagementProps {
  users: AdminUser[];
  onUpdateUsers: (updated: AdminUser[]) => void;
  adminRoles?: AdminRoleConfig[];
  defaultFilterRole?: string;
  theme: 'light' | 'dark';
  tv: AdminThemeVars;
}

// ─── Status badge helper ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    active:      { bg:'rgba(16,185,129,0.1)',  color:'#10b981', dot:'#10b981' },
    suspended:   { bg:'rgba(245,158,11,0.1)',  color:'#f59e0b', dot:'#f59e0b' },
    deactivated: { bg:'rgba(239,68,68,0.1)',   color:'#ef4444', dot:'#ef4444' },
  };
  const s = map[status] || map.active;
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background:s.bg, color:s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Role badge helper ───────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Researcher':  { bg:'rgba(59,130,246,0.1)',  color:'#3b82f6' },
    'Student':     { bg:'rgba(16,185,129,0.1)',  color:'#10b981' },
    'Lecturer':    { bg:'rgba(139,92,246,0.1)',  color:'#8b5cf6' },
    'Institution': { bg:'rgba(245,158,11,0.1)',  color:'#f59e0b' },
    'Industry':    { bg:'rgba(236,72,153,0.1)',  color:'#ec4899' },
    'Government':  { bg:'rgba(20,184,166,0.1)',  color:'#14b8a6' },
    'NGO':         { bg:'rgba(249,115,22,0.1)',  color:'#f97316' },
    'admin':       { bg:'rgba(239,68,68,0.1)',   color:'#ef4444' },
    'super_admin': { bg:'rgba(239,68,68,0.15)',  color:'#dc2626' },
    'Other':       { bg:'rgba(148,163,184,0.1)', color:'#94a3b8' },
  };
  const s = map[role] || map['Other'];
  return (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background:s.bg, color:s.color }}>{role}</span>
  );
}

export default function UserManagement({ users, onUpdateUsers, adminRoles = MOCK_ADMIN_ROLES, defaultFilterRole = '', theme, tv }: UserManagementProps) {

  // ── Filter & search state ───────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState(defaultFilterRole || '');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  useEffect(() => { if (defaultFilterRole !== undefined) setFilterRole(defaultFilterRole); }, [defaultFilterRole]);

  // ── Sorting ─────────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<keyof AdminUser>('joinedDate');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  // ── Selection ───────────────────────────────────────────────────────────────
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // ── Detail drawer ───────────────────────────────────────────────────────────
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [savingId, setSavingId] = useState<string|null>(null);

  // ── Promote modal ───────────────────────────────────────────────────────────
  const [promotingUserId, setPromotingUserId] = useState<string|null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState('Super Admin');

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // ── Derived: filtered + sorted users ───────────────────────────────────────
  const filteredUsers = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${u.fullName} ${u.email} ${u.institution} ${u.country}`.toLowerCase().includes(q);
      const matchRole = !filterRole || u.role?.toLowerCase().includes(filterRole.toLowerCase());
      const matchCountry = !filterCountry || u.country === filterCountry;
      const matchStatus = !filterStatus || u.status === filterStatus;
      const matchVerified = filterVerified === '' ? true : filterVerified === 'true' ? u.verified : !u.verified;
      return matchSearch && matchRole && matchCountry && matchStatus && matchVerified;
    })
    .sort((a, b) => {
      const aVal = String(a[sortField] ?? '');
      const bVal = String(b[sortField] ?? '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pageUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Unique filter options ───────────────────────────────────────────────────
  const uniqueCountries = [...new Set(users.map(u => u.country).filter(Boolean))].sort();
  const uniqueRoles = [...new Set(users.map(u => u.role).filter(Boolean))].sort();

  // ── Sort helper ─────────────────────────────────────────────────────────────
  const handleSort = (field: keyof AdminUser) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  // ── Selection helpers ───────────────────────────────────────────────────────
  const allPageSelected = pageUsers.length > 0 && pageUsers.every(u => selectedUids.includes(u.uid));
  const somePageSelected = pageUsers.some(u => selectedUids.includes(u.uid)) && !allPageSelected;

  const toggleAll = () => {
    if (allPageSelected) setSelectedUids(ids => ids.filter(id => !pageUsers.some(u => u.uid === id)));
    else setSelectedUids(ids => [...new Set([...ids, ...pageUsers.map(u => u.uid)])]);
  };

  const toggleUser = (uid: string) => {
    setSelectedUids(ids => ids.includes(uid) ? ids.filter(id => id !== uid) : [...ids, uid]);
  };

  // ── User actions ────────────────────────────────────────────────────────────
  const updateUser = (uid: string, changes: Partial<AdminUser>) => {
    const updated = users.map(u => u.uid === uid ? { ...u, ...changes } : u);
    onUpdateUsers(updated);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUids.length === 0) return;
    let updated = [...users];
    if (bulkAction === 'activate')   updated = users.map(u => selectedUids.includes(u.uid) ? { ...u, status:'active' as const } : u);
    if (bulkAction === 'suspend')    updated = users.map(u => selectedUids.includes(u.uid) ? { ...u, status:'suspended' as const } : u);
    if (bulkAction === 'deactivate') updated = users.map(u => selectedUids.includes(u.uid) ? { ...u, status:'deactivated' as const } : u);
    if (bulkAction === 'verify')     updated = users.map(u => selectedUids.includes(u.uid) ? { ...u, verified:true } : u);
    if (bulkAction === 'delete') {
      if (!window.confirm(`Delete ${selectedUids.length} user(s)? This cannot be undone.`)) return;
      updated = users.filter(u => !selectedUids.includes(u.uid));
    }
    onUpdateUsers(updated);
    setSelectedUids([]);
    setBulkAction('');
  };

  const handlePromote = () => {
    if (!promotingUserId || !selectedRoleName) return;
    updateUser(promotingUserId, { role:'admin', adminRoleName:selectedRoleName });
    setPromotingUserId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingId(editingUser.uid);
    await new Promise(r => setTimeout(r, 600));
    updateUser(editingUser.uid, editingUser);
    setSavingId(null);
    setEditingUser(null);
    setViewingUser(null);
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Name','Email','Role','Country','Institution','Status','Verified','Joined','Research','Projects'];
    const rows = filteredUsers.map(u => [u.fullName,u.email,u.role,u.country,u.institution,u.status,String(u.verified),u.joinedDate,String(u.researchCount),String(u.projects)]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
    a.download = `aurenix_users_${new Date().toISOString().substring(0,10)}.csv`;
    a.click();
  };

  // ── Active filter count ─────────────────────────────────────────────────────
  const activeFilters = [filterRole, filterCountry, filterStatus, filterVerified !== '' ? 'verified' : ''].filter(Boolean).length;

  // ── Styles helpers ──────────────────────────────────────────────────────────
  const card: React.CSSProperties = { background:tv.surface, border:`1px solid ${tv.border}`, borderRadius:16, boxShadow:tv.cardShadow };
  const thCell = (field: keyof AdminUser) => ({
    padding:'10px 12px', fontSize:10, fontWeight:700, fontFamily:'monospace',
    textTransform:'uppercase' as const, letterSpacing:'0.12em',
    color: sortField === field ? tv.accent : tv.textMuted,
    cursor:'pointer', userSelect:'none' as const, whiteSpace:'nowrap' as const,
    background:'transparent', border:'none',
  });
  const SortIcon = ({ field }: { field: keyof AdminUser }) => sortField === field
    ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />)
    : null;

  return (
    <div className="space-y-5" id="user_management_root">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black" style={{ color:tv.textPrimary }}>User Directory</h2>
          <p className="text-sm mt-0.5" style={{ color:tv.textSecondary }}>
            {filteredUsers.length.toLocaleString()} of {users.length.toLocaleString()} members · {users.filter(u=>u.verified).length} verified
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}`, color:tv.textSecondary }}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => { setEditingUser({ uid:`new_${Date.now()}`, fullName:'', email:'', role:'Researcher', country:'', institution:'', researchCount:0, projects:0, followers:0, joinedDate:new Date().toISOString().substring(0,10), status:'active', verified:false }); setViewingUser(null); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
            style={{ background:tv.accent, color:'#fff', boxShadow:`0 4px 14px ${tv.accent}35` }}>
            <UserPlus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div style={card} className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:tv.textMuted }} />
            <input type="text" placeholder="Search by name, email, institution…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
              style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}`, color:tv.textPrimary }} />
          </div>
          {/* Quick filter dropdowns */}
          {[
            { label:'Role', value:filterRole, set:setFilterRole, opts:[{v:'',l:'All Roles'},...uniqueRoles.map(r=>({v:r,l:r}))] },
            { label:'Country', value:filterCountry, set:setFilterCountry, opts:[{v:'',l:'All Countries'},...uniqueCountries.map(c=>({v:c,l:c}))] },
            { label:'Status', value:filterStatus, set:setFilterStatus, opts:[{v:'',l:'All Statuses'},{v:'active',l:'Active'},{v:'suspended',l:'Suspended'},{v:'deactivated',l:'Deactivated'}] },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => { f.set(e.target.value); setPage(1); }}
              className="px-3 py-2.5 text-xs font-medium rounded-xl outline-none cursor-pointer"
              style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}`, color:tv.textPrimary, minWidth:120 }}>
              {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ))}
          {activeFilters > 0 && (
            <button onClick={() => { setFilterRole(''); setFilterCountry(''); setFilterStatus(''); setFilterVerified(''); setSearch(''); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
              style={{ background:'rgba(239,68,68,0.08)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)' }}>
              <X className="w-3 h-3" /> Clear ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk action bar (floats when selection active) ── */}
      <AnimatePresence>
        {selectedUids.length > 0 && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl"
            style={{ background: tv.isDark ? 'rgba(16,185,129,0.08)' : 'rgba(5,150,105,0.06)', border:`1px solid ${tv.accentBorder}` }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color:tv.accent }}>{selectedUids.length} user{selectedUids.length !== 1 ? 's' : ''} selected</span>
              <button onClick={() => setSelectedUids([])} className="text-xs cursor-pointer" style={{ color:tv.textSecondary }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl outline-none cursor-pointer"
                style={{ background:tv.surface, border:`1px solid ${tv.border}`, color:tv.textPrimary }}>
                <option value="">Choose bulk action…</option>
                <option value="activate">✅ Activate selected</option>
                <option value="suspend">⚠️ Suspend selected</option>
                <option value="deactivate">🚫 Deactivate selected</option>
                <option value="verify">✔️ Mark verified</option>
                <option value="delete">🗑️ Delete selected</option>
              </select>
              <button onClick={handleBulkAction} disabled={!bulkAction}
                className="px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all disabled:opacity-40"
                style={{ background:tv.accent, color:'#fff' }}>
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div style={card} className="overflow-hidden" id="user_directory_table">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${tv.border}`, background:tv.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                {/* Checkbox header */}
                <th style={{ padding:'10px 12px', width:40 }}>
                  <button onClick={toggleAll} className="w-4 h-4 rounded cursor-pointer flex items-center justify-center" style={{ border:`1.5px solid ${tv.border}`, background: allPageSelected ? tv.accent : 'transparent' }}>
                    {allPageSelected ? <CheckSquare className="w-3 h-3 text-white" style={{ color:'#fff' }} />
                      : somePageSelected ? <Minus className="w-3 h-3" style={{ color:tv.textMuted }} />
                      : null}
                  </button>
                </th>
                <th style={thCell('fullName')} onClick={() => handleSort('fullName')}>Member <SortIcon field="fullName" /></th>
                <th style={thCell('role')} onClick={() => handleSort('role')}>Role <SortIcon field="role" /></th>
                <th style={thCell('country')} onClick={() => handleSort('country')} className="hidden md:table-cell">Country <SortIcon field="country" /></th>
                <th style={thCell('status')} onClick={() => handleSort('status')}>Status <SortIcon field="status" /></th>
                <th style={thCell('researchCount')} onClick={() => handleSort('researchCount')} className="hidden lg:table-cell">Research <SortIcon field="researchCount" /></th>
                <th style={thCell('joinedDate')} onClick={() => handleSort('joinedDate')} className="hidden lg:table-cell">Joined <SortIcon field="joinedDate" /></th>
                <th style={{ ...thCell('uid'), cursor:'default' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Users className="w-10 h-10 mx-auto mb-3" style={{ color:tv.textMuted }} />
                    <p className="text-sm font-medium" style={{ color:tv.textSecondary }}>No users match your filters.</p>
                  </td>
                </tr>
              ) : pageUsers.map((u, i) => {
                const isSelected = selectedUids.includes(u.uid);
                return (
                  <motion.tr key={u.uid}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.02 }}
                    style={{
                      borderBottom:`1px solid ${tv.border}`,
                      background: isSelected ? tv.accentDim : 'transparent',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = tv.surfaceRaised; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSelected ? tv.accentDim : 'transparent'; }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding:'12px 12px' }}>
                      <button onClick={() => toggleUser(u.uid)} className="w-4 h-4 rounded cursor-pointer flex items-center justify-center" style={{ border:`1.5px solid ${isSelected ? tv.accent : tv.border}`, background: isSelected ? tv.accent : 'transparent' }}>
                        {isSelected && <CheckSquare className="w-3 h-3" style={{ color:'#fff' }} />}
                      </button>
                    </td>

                    {/* Member cell */}
                    <td style={{ padding:'12px 12px' }}>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName||'U')}`}
                            alt={u.fullName} className="w-8 h-8 rounded-xl object-cover"
                            style={{ border:`1.5px solid ${tv.border}` }} />
                          {u.verified && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background:'#10b981', border:`1.5px solid ${tv.surface}` }}>
                              <CheckCircle2 className="w-2 h-2 text-white" style={{ color:'#fff' }} />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color:tv.textPrimary, maxWidth:160 }}>{u.fullName || '—'}</p>
                          <p className="text-[10px] font-mono truncate" style={{ color:tv.textSecondary, maxWidth:160 }}>{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding:'12px 12px' }}><RoleBadge role={u.role} /></td>

                    {/* Country */}
                    <td style={{ padding:'12px 12px' }} className="hidden md:table-cell">
                      <span className="text-xs" style={{ color:tv.textSecondary }}>{u.country || '—'}</span>
                    </td>

                    {/* Status */}
                    <td style={{ padding:'12px 12px' }}><StatusBadge status={u.status || 'active'} /></td>

                    {/* Research count */}
                    <td style={{ padding:'12px 12px' }} className="hidden lg:table-cell">
                      <span className="text-xs font-mono font-bold" style={{ color:tv.textPrimary }}>{u.researchCount}</span>
                    </td>

                    {/* Joined date */}
                    <td style={{ padding:'12px 12px' }} className="hidden lg:table-cell">
                      <span className="text-[10px] font-mono" style={{ color:tv.textSecondary }}>{u.joinedDate?.substring(0,10) || '—'}</span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding:'12px 12px' }}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setViewingUser(u); setEditingUser(null); }}
                          title="View Details" className="p-1.5 rounded-lg cursor-pointer transition-all"
                          style={{ color:tv.textMuted }}
                          onMouseEnter={e => { e.currentTarget.style.background=tv.surfaceRaised; e.currentTarget.style.color=tv.textPrimary; }}
                          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=tv.textMuted; }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setEditingUser({...u}); setViewingUser(null); }}
                          title="Edit" className="p-1.5 rounded-lg cursor-pointer transition-all"
                          style={{ color:tv.textMuted }}
                          onMouseEnter={e => { e.currentTarget.style.background=tv.surfaceRaised; e.currentTarget.style.color=tv.accent; }}
                          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=tv.textMuted; }}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateUser(u.uid, { status: u.status === 'active' ? 'suspended' : 'active' })}
                          title={u.status === 'active' ? 'Suspend' : 'Activate'}
                          className="p-1.5 rounded-lg cursor-pointer transition-all"
                          style={{ color:tv.textMuted }}
                          onMouseEnter={e => { e.currentTarget.style.background = u.status === 'active' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'; e.currentTarget.style.color = u.status === 'active' ? '#f59e0b' : '#10b981'; }}
                          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=tv.textMuted; }}>
                          {u.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:`1px solid ${tv.border}` }}>
            <span className="text-xs" style={{ color:tv.textSecondary }}>
              Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length:totalPages }, (_,i) => i+1).filter(p => p === 1 || p === totalPages || Math.abs(p-page) <= 1).map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i-1] !== p - 1 && <span className="px-1 text-xs" style={{ color:tv.textMuted }}>…</span>}
                  <button onClick={() => setPage(p)}
                    className="w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all"
                    style={{ background: page===p ? tv.accent : tv.surfaceRaised, color: page===p ? '#fff' : tv.textSecondary, border:`1px solid ${page===p ? tv.accent : tv.border}` }}>
                    {p}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {(viewingUser || editingUser) && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40" style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
              onClick={() => { setViewingUser(null); setEditingUser(null); }} />
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', damping:28, stiffness:220 }}
              className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-y-auto"
              style={{ width:420, background:tv.surface, borderLeft:`1px solid ${tv.border}`, boxShadow:'-20px 0 60px rgba(0,0,0,0.3)', scrollbarWidth:'thin', scrollbarColor:`${tv.border} transparent` }}
              id="user_detail_drawer">
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 shrink-0" style={{ borderBottom:`1px solid ${tv.border}` }}>
                <div>
                  <h3 className="text-sm font-bold" style={{ color:tv.textPrimary }}>{editingUser ? (editingUser.uid.startsWith('new_') ? 'Add New User' : 'Edit User') : 'User Details'}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color:tv.textSecondary }}>{editingUser ? 'Make changes below and save.' : 'Full profile information'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {viewingUser && !editingUser && (
                    <button onClick={() => { setEditingUser({...viewingUser}); setViewingUser(null); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      style={{ background:tv.accentDim, color:tv.accent, border:`1px solid ${tv.accentBorder}` }}>
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                  <button onClick={() => { setViewingUser(null); setEditingUser(null); }}
                    className="p-2 rounded-xl cursor-pointer" style={{ background:tv.surfaceRaised, color:tv.textSecondary }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View mode */}
              {viewingUser && !editingUser && (() => {
                const u = viewingUser;
                return (
                  <div className="flex-1 p-5 space-y-5">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4">
                      <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.fullName||'U')}`}
                        alt={u.fullName} className="w-16 h-16 rounded-2xl object-cover"
                        style={{ border:`2px solid ${tv.border}` }} />
                      <div>
                        <p className="text-base font-black" style={{ color:tv.textPrimary }}>{u.fullName || 'Unknown User'}</p>
                        <p className="text-xs font-mono" style={{ color:tv.textSecondary }}>{u.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <RoleBadge role={u.role} />
                          <StatusBadge status={u.status || 'active'} />
                          {u.verified && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'rgba(16,185,129,0.1)', color:'#10b981' }}><CheckCircle2 className="w-3 h-3" />Verified</span>}
                        </div>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon:MapPin,    label:'Country',     val:u.country || '—' },
                        { icon:Building, label:'Institution', val:u.institution || '—' },
                        { icon:Calendar, label:'Joined',      val:u.joinedDate?.substring(0,10) || '—' },
                        { icon:Shield,   label:'Admin Role',  val:u.adminRoleName || 'None' },
                      ].map(f => (
                        <div key={f.label} className="p-3 rounded-xl" style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}` }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <f.icon className="w-3 h-3" style={{ color:tv.textMuted }} />
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color:tv.textMuted }}>{f.label}</span>
                          </div>
                          <p className="text-xs font-bold truncate" style={{ color:tv.textPrimary }}>{f.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon:BookOpen,  label:'Research', val:u.researchCount, color:'#3b82f6' },
                        { icon:Briefcase,label:'Projects',  val:u.projects,      color:'#f59e0b' },
                        { icon:Heart,    label:'Followers', val:u.followers,     color:'#ec4899' },
                      ].map(s => (
                        <div key={s.label} className="p-3 rounded-xl text-center" style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}` }}>
                          <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color:s.color }} />
                          <p className="text-lg font-black" style={{ color:tv.textPrimary }}>{s.val}</p>
                          <p className="text-[9px] font-mono" style={{ color:tv.textMuted }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Promote to admin */}
                    {u.role !== 'admin' && u.role !== 'super_admin' && (
                      <div className="p-4 rounded-xl space-y-3" style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.15)' }}>
                        <p className="text-xs font-bold flex items-center gap-2" style={{ color:'#8b5cf6' }}><Shield className="w-3.5 h-3.5" /> Promote to Admin Role</p>
                        <select value={selectedRoleName} onChange={e => setSelectedRoleName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl outline-none cursor-pointer"
                          style={{ background:tv.surface, border:`1px solid ${tv.border}`, color:tv.textPrimary }}>
                          <option value="Super Admin">Super Admin</option>
                          {adminRoles.map(r => <option key={r.id} value={r.roleName}>{r.roleName}</option>)}
                        </select>
                        <button onClick={() => { setPromotingUserId(u.uid); }}
                          className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                          style={{ background:'rgba(139,92,246,0.15)', color:'#8b5cf6', border:'1px solid rgba(139,92,246,0.25)' }}>
                          Promote {u.fullName?.split(' ')[0] || 'User'}
                        </button>
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: u.verified ? 'Revoke Verification' : 'Verify User', icon:CheckCircle2, color:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.2)', action:() => { updateUser(u.uid, { verified:!u.verified }); setViewingUser({...u,verified:!u.verified}); } },
                        { label: u.status==='active' ? 'Suspend User' : 'Reactivate', icon:u.status==='active' ? Ban : RefreshCw, color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)', action:() => { const ns = u.status==='active' ? 'suspended' : 'active'; updateUser(u.uid, { status:ns }); setViewingUser({...u,status:ns as any}); } },
                      ].map(a => (
                        <button key={a.label} onClick={a.action}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                          style={{ background:a.bg, color:a.color, border:`1px solid ${a.border}` }}>
                          <a.icon className="w-3.5 h-3.5" /> {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Edit mode */}
              {editingUser && (
                <div className="flex-1 p-5 space-y-4">
                  {[
                    { label:'Full Name', field:'fullName' as const, type:'text' },
                    { label:'Email',     field:'email' as const,    type:'email' },
                    { label:'Country',   field:'country' as const,  type:'text' },
                    { label:'Institution', field:'institution' as const, type:'text' },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color:tv.textMuted }}>{f.label}</label>
                      <input type={f.type} value={String(editingUser[f.field] || '')}
                        onChange={e => setEditingUser(u => u ? { ...u, [f.field]:e.target.value } : u)}
                        className="w-full px-3 py-2.5 text-sm rounded-xl outline-none transition-all"
                        style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}`, color:tv.textPrimary }} />
                    </div>
                  ))}
                  {/* Role selector */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color:tv.textMuted }}>Role</label>
                    <select value={editingUser.role} onChange={e => setEditingUser(u => u ? { ...u, role:e.target.value as any } : u)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none cursor-pointer"
                      style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}`, color:tv.textPrimary }}>
                      {['Student','Researcher','Lecturer','Institution','Industry','Government','NGO','Other','admin','super_admin'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color:tv.textMuted }}>Status</label>
                    <select value={editingUser.status} onChange={e => setEditingUser(u => u ? { ...u, status:e.target.value as any } : u)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none cursor-pointer"
                      style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}`, color:tv.textPrimary }}>
                      {['active','suspended','deactivated'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* Verified toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background:tv.surfaceRaised, border:`1px solid ${tv.border}` }}>
                    <span className="text-xs font-bold" style={{ color:tv.textPrimary }}>Verified Researcher</span>
                    <button onClick={() => setEditingUser(u => u ? { ...u, verified:!u.verified } : u)}
                      className="relative w-10 h-5 rounded-full transition-all cursor-pointer"
                      style={{ background: editingUser.verified ? tv.accent : tv.border }}>
                      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: editingUser.verified ? '22px' : '2px' }} />
                    </button>
                  </div>
                </div>
              )}

              {/* Drawer footer */}
              {editingUser && (
                <div className="p-5 shrink-0 flex gap-3" style={{ borderTop:`1px solid ${tv.border}` }}>
                  <button onClick={() => { setEditingUser(null); setViewingUser(null); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                    style={{ background:tv.surfaceRaised, color:tv.textSecondary, border:`1px solid ${tv.border}` }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} disabled={!!savingId}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
                    style={{ background:tv.accent, color:'#fff', opacity:savingId ? 0.7 : 1 }}>
                    {savingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {savingId ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Promote confirmation modal ── */}
      <AnimatePresence>
        {promotingUserId && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50" style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} onClick={() => setPromotingUserId(null)} />
            <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95, y:20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-2xl space-y-4 w-80"
              style={{ background:tv.surface, border:`1px solid ${tv.border}`, boxShadow:tv.cardHoverShadow }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)' }}>
                <Shield className="w-6 h-6" style={{ color:'#8b5cf6' }} />
              </div>
              <div className="text-center">
                <p className="font-bold" style={{ color:tv.textPrimary }}>Promote to {selectedRoleName}?</p>
                <p className="text-xs mt-1" style={{ color:tv.textSecondary }}>This will grant elevated admin permissions to this account.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPromotingUserId(null)} className="py-2.5 rounded-xl text-xs font-bold cursor-pointer" style={{ background:tv.surfaceRaised, color:tv.textSecondary, border:`1px solid ${tv.border}` }}>Cancel</button>
                <button onClick={handlePromote} className="py-2.5 rounded-xl text-xs font-bold cursor-pointer" style={{ background:'#8b5cf6', color:'#fff' }}>Promote</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
