import React, { useState } from 'react';
import { Search, Globe, ArrowUpDown, Users, Plus, Mail, MoreHorizontal, Check, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { TENANT_USERS, INITIAL_ORGS, INITIAL_TENANTS, type TenantUser, type Tenant } from './data';

const MAX_VISIBLE_GROUPS = 2;

// ─── Org member candidates for tenant invitations ─────────────────────────────

const ORG_CANDIDATES = [
  { id: 'oc1', name: 'Alice Smith',  email: 'alice@acme.com',  initials: 'AS', org: 'Acme Org' },
  { id: 'oc2', name: 'Bob Jones',    email: 'bob@acme.com',    initials: 'BJ', org: 'Acme Org' },
  { id: 'oc3', name: 'Carol White',  email: 'carol@acme.com',  initials: 'CW', org: 'Acme Org' },
  { id: 'oc4', name: 'David Lee',    email: 'david@acme.com',  initials: 'DL', org: 'Acme Org' },
  { id: 'oc5', name: 'Eve Wilson',   email: 'eve@beta.com',    initials: 'EW', org: 'Beta Org'  },
  { id: 'oc6', name: 'Frank Brown',  email: 'frank@beta.com',  initials: 'FB', org: 'Beta Org'  },
];

// ─── Add Tenant Members Dialog ────────────────────────────────────────────────

const AVATAR_PALETTES_ADD = [
  { bg: 'bg-[#E8E8FD]', text: 'text-[#5B5CE6]' },
  { bg: 'bg-[#DDF3E4]', text: 'text-[#18794E]' },
  { bg: 'bg-[#FEF2D6]', text: 'text-[#AD5700]' },
  { bg: 'bg-[#FFE8D7]', text: 'text-[#BD4B00]' },
  { bg: 'bg-[#FFE5E5]', text: 'text-[#CD2B31]' },
] as const;

function hashNameAdd(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0; return Math.abs(h);
}

interface AddTenantMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingIds: string[];
  onAdd: (members: { id: string; name: string; email: string; initials: string; role: 'admin' | 'developer' | 'user' | 'viewer'; orgName?: string }[]) => void;
}

const AddTenantMembersDialog: React.FC<AddTenantMembersDialogProps> = ({ open, onOpenChange, existingIds, onAdd }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [role, setRole] = useState<'admin' | 'developer' | 'user' | 'viewer'>('user');

  const available = ORG_CANDIDATES.filter(c => !existingIds.includes(c.id));
  const filtered = available.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.org.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = () => {
    const toAdd = selected.map(id => {
      const c = ORG_CANDIDATES.find(x => x.id === id)!;
      return { id: c.id, name: c.name, email: c.email, initials: c.initials, role, orgName: c.org };
    });
    onAdd(toAdd);
    setSelected([]);
    setSearch('');
    onOpenChange(false);
  };

  const reset = () => { setSelected([]); setSearch(''); setRole('user'); };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[520px] animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-[16px] font-semibold text-gray-12">Add Members</Dialog.Title>
                <Dialog.Description className="text-[13px] text-gray-9 mt-0.5">
                  Select org members to add to this tenant.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            {/* Search + role picker */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-6 bg-white">
                <Search size={13} className="text-gray-8 shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, or org..."
                  className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
                />
              </div>
              {selected.length > 0 && (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors whitespace-nowrap shrink-0 capitalize">
                      {role} <ChevronDown size={13} className="text-gray-8" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[130px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                      {(['admin', 'developer', 'user', 'viewer'] as const).map(r => (
                        <DropdownMenu.Item
                          key={r}
                          onClick={() => setRole(r)}
                          className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors capitalize',
                            r === role ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                          )}
                        >
                          {r} {r === role && <Check size={12} className="text-[#5B5CE6]" />}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 pb-2">
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-gray-9">{available.length === 0 ? 'All org members are already in this tenant' : 'No results found'}</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filtered.map(candidate => {
                  const isSelected = selected.includes(candidate.id);
                  const palette = AVATAR_PALETTES_ADD[hashNameAdd(candidate.name) % AVATAR_PALETTES_ADD.length];
                  return (
                    <button
                      key={candidate.id}
                      onClick={() => toggle(candidate.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                        isSelected ? 'bg-[#0011FF08]' : 'hover:bg-gray-2',
                      )}
                    >
                      <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                        isSelected ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-7'
                      )}>
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0', palette.bg, palette.text)}>
                        {candidate.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-12 truncate">{candidate.name}</p>
                        <p className="text-[11px] text-gray-9 truncate">{candidate.email}</p>
                      </div>
                      <span className="text-[12px] text-gray-9 shrink-0">{candidate.org}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-4 flex items-center justify-between shrink-0">
            <span className="text-[12px] text-gray-9">
              {selected.length > 0 ? `${selected.length} selected as ${role}` : 'No members selected'}
            </span>
            <div className="flex items-center gap-2">
              <Dialog.Close asChild>
                <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">Cancel</button>
              </Dialog.Close>
              <button
                disabled={selected.length === 0}
                onClick={handleSubmit}
                className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add {selected.length > 0 ? `${selected.length} ` : ''}Member{selected.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: TenantUser['status'] }> = ({ status }) => {
  const styles = {
    active: { pill: 'bg-green-3 text-green-11', dot: 'bg-green-9' },
    pending: { pill: 'bg-amber-3 text-amber-11', dot: 'bg-amber-9' },
    inactive: { pill: 'bg-gray-3 text-gray-10', dot: 'bg-gray-8' },
  };
  const s = styles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', s.pill)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── User Avatar ──────────────────────────────────────────────────────────────

const AVATAR_PALETTES = [
  { bg: 'bg-[#E8E8FD]', text: 'text-[#5B5CE6]' },
  { bg: 'bg-[#DDF3E4]', text: 'text-[#18794E]' },
  { bg: 'bg-[#FEF2D6]', text: 'text-[#AD5700]' },
  { bg: 'bg-[#FFE8D7]', text: 'text-[#BD4B00]' },
  { bg: 'bg-[#FFE5E5]', text: 'text-[#CD2B31]' },
] as const;

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const UserAvatar: React.FC<{ user: TenantUser }> = ({ user }) => {
  const isService = user.type === 'service-account';
  const palette = AVATAR_PALETTES[hashName(user.name) % AVATAR_PALETTES.length];
  return (
    <div className={cn(
      'w-8 h-8 flex items-center justify-center text-[12px] font-medium shrink-0',
      isService ? 'rounded-lg bg-gray-3 text-gray-10' : `rounded-full ${palette.bg} ${palette.text}`,
    )}>
      {user.initials}
    </div>
  );
};

// ─── Clickable Group Chip ─────────────────────────────────────────────────────

const GroupChip: React.FC<{ name: string; onNavigate?: (name: string) => void }> = ({ name, onNavigate }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onNavigate?.(name); }}
    className="text-[11px] text-left text-[#5B5CE6] hover:underline transition-colors cursor-pointer"
  >
    {name}
  </button>
);

// ─── Groups Cell with Overflow ────────────────────────────────────────────────

const GroupsCell: React.FC<{ groups: string[]; onNavigateToGroup?: (name: string) => void }> = ({ groups, onNavigateToGroup }) => {
  if (groups.length === 0) {
    return <span className="text-[12px] text-gray-8 italic">No groups</span>;
  }

  const visible = groups.slice(0, MAX_VISIBLE_GROUPS);
  const overflow = groups.slice(MAX_VISIBLE_GROUPS);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map(g => (
        <GroupChip key={g} name={g} onNavigate={onNavigateToGroup} />
      ))}
      {overflow.length > 0 && (
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="text-[11px] font-medium text-gray-9 bg-gray-3 hover:bg-gray-4 px-1.5 py-0.5 rounded transition-colors">
              +{overflow.length} more
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={4}
              align="start"
              className="bg-white rounded-lg shadow-xl border border-gray-5 py-1.5 px-1.5 z-50 w-[200px] animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <p className="text-[11px] font-medium text-gray-9 uppercase tracking-wider px-1.5 pb-1.5">
                All groups ({groups.length})
              </p>
              <div className="flex flex-col gap-0.5">
                {groups.map(g => (
                  <button
                    key={g}
                    onClick={() => onNavigateToGroup?.(g)}
                    className="text-[12px] text-left text-[#5B5CE6] hover:underline px-1.5 py-1 rounded transition-colors"
                  >
                    {g}
                  </button>
                ))}
              </div>
              <Popover.Arrow className="fill-white" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
};

// ─── Sort Types ───────────────────────────────────────────────────────────────

type SortField = 'name' | 'email' | 'status' | 'createdAt' | 'groups' | 'role' | 'orgName';
type SortDir = 'asc' | 'desc';

// ─── Tenant User Manage Access Dialog ─────────────────────────────────────────

type TenantUserRole = 'admin' | 'developer' | 'user' | 'viewer';
const TENANT_USER_ROLES: TenantUserRole[] = ['admin', 'developer', 'user', 'viewer'];

interface TenantUserManageAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: TenantUser;
  onSave: (updated: TenantUser) => void;
  isAdmin?: boolean;
  tenants?: Tenant[];
}

const TenantUserManageAccessDialog: React.FC<TenantUserManageAccessDialogProps> = ({
  open, onOpenChange, user, onSave, isAdmin, tenants = INITIAL_TENANTS,
}) => {
  const [orgName, setOrgName]         = useState(user.orgName ?? '');
  const [role, setRole]               = useState<TenantUserRole>(user.role);
  const [tenantIds, setTenantIds]     = useState<string[]>(user.tenantIds ?? []);
  const [tenantRoles, setTenantRoles] = useState<Record<string, TenantUserRole>>(
    () => Object.fromEntries((user.tenantIds ?? []).map(tid => [tid, 'developer' as TenantUserRole]))
  );

  React.useEffect(() => {
    if (open) {
      setOrgName(user.orgName ?? '');
      setRole(user.role);
      setTenantIds(user.tenantIds ?? []);
      setTenantRoles(Object.fromEntries((user.tenantIds ?? []).map(tid => [tid, 'developer' as TenantUserRole])));
    }
  }, [open, user]);

  const toggleTenant = (tid: string) => {
    if (tenantIds.includes(tid)) {
      setTenantIds(prev => prev.filter(t => t !== tid));
      setTenantRoles(prev => { const n = { ...prev }; delete n[tid]; return n; });
    } else {
      setTenantIds(prev => [...prev, tid]);
      setTenantRoles(prev => ({ ...prev, [tid]: 'developer' as TenantUserRole }));
    }
  };

  const handleSave = () => {
    onSave({ ...user, orgName: orgName || undefined, role, tenantIds });
    onOpenChange(false);
  };

  const avatarColors = [
    { bg: 'bg-[#E8E8FD]', text: 'text-[#5B5CE6]' },
    { bg: 'bg-[#DDF3E4]', text: 'text-[#18794E]' },
    { bg: 'bg-[#FEF2D6]', text: 'text-[#AD5700]' },
    { bg: 'bg-[#FFE8D7]', text: 'text-[#BD4B00]' },
    { bg: 'bg-[#FFE5E5]', text: 'text-[#CD2B31]' },
  ];
  function hn(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
  const palette = avatarColors[hn(user.name) % avatarColors.length];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[440px] animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
          <div className="px-6 pt-5 pb-4 border-b border-gray-4">
            <div className="flex items-start justify-between">
              <Dialog.Title className="text-[16px] font-semibold text-gray-12">Manage Access</Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Manage access for {user.name}</Dialog.Description>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div>
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-2.5">Identity</p>
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 flex items-center justify-center text-[14px] font-medium shrink-0',
                  user.type === 'service-account' ? 'rounded-lg bg-gray-3 text-gray-10' : `rounded-full ${palette.bg} ${palette.text}`
                )}>
                  {user.initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-12 leading-tight">{user.name}</p>
                  <p className="text-[12px] text-gray-9 mt-0.5">{user.email}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-3">Org & Tenant Role</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-gray-9 mb-1.5">Organization</p>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors">
                        {orgName || '—'} <ChevronDown size={12} className="text-gray-8 shrink-0" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                        {INITIAL_ORGS.map(o => (
                          <DropdownMenu.Item key={o.id} onClick={() => setOrgName(o.name)}
                            className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                              o.name === orgName ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                            )}
                          >
                            {o.name} {o.name === orgName && <Check size={12} className="text-[#5B5CE6]" />}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
                <div>
                  <p className="text-[11px] text-gray-9 mb-1.5">Tenant Role</p>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors capitalize">
                        {role} <ChevronDown size={12} className="text-gray-8 shrink-0" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[130px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                        {TENANT_USER_ROLES.map(r => (
                          <DropdownMenu.Item key={r} onClick={() => setRole(r)}
                            className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors capitalize',
                              r === role ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                            )}
                          >
                            {r} {r === role && <Check size={12} className="text-[#5B5CE6]" />}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div>
                <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-3">Tenant Access</p>
                <div className="space-y-2">
                  {tenants.map(t => {
                    const inTenant = tenantIds.includes(t.id);
                    return (
                      <div key={t.id} className="flex items-center gap-3">
                        <button onClick={() => toggleTenant(t.id)} className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                            inTenant ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-6'
                          )}>
                            {inTenant && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className={cn('text-[13px]', inTenant ? 'text-gray-12 font-medium' : 'text-gray-9')}>{t.name}</span>
                        </button>
                        {inTenant && (
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-gray-6 text-[12px] font-medium text-gray-10 hover:bg-gray-2 transition-colors shrink-0 capitalize">
                                {tenantRoles[t.id] ?? 'developer'} <ChevronDown size={11} className="text-gray-8" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[130px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                                {TENANT_USER_ROLES.map(r => (
                                  <DropdownMenu.Item key={r} onClick={() => setTenantRoles(prev => ({ ...prev, [t.id]: r }))}
                                    className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors capitalize',
                                      (tenantRoles[t.id] ?? 'developer') === r ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                                    )}
                                  >
                                    {r} {(tenantRoles[t.id] ?? 'developer') === r && <Check size={12} className="text-[#5B5CE6]" />}
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-4 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">Cancel</button>
            </Dialog.Close>
            <button onClick={handleSave} className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors">
              Save Changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Filter types ─────────────────────────────────────────────────────────────

interface TenantFilters {
  types:    ('user' | 'service-account')[];
  statuses: TenantUser['status'][];
  roles:    TenantUserRole[];
}
const DEFAULT_TENANT_FILTERS: TenantFilters = { types: [], statuses: [], roles: [] };

function toggleTenantFilter<K extends keyof TenantFilters>(
  prev: TenantFilters, key: K, value: TenantFilters[K][number]
): TenantFilters {
  const arr = prev[key] as unknown[];
  return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
}

// ─── Users Management ─────────────────────────────────────────────────────────

interface UsersManagementProps {
  onNavigateToGroup?: (groupName: string) => void;
  onNavigateToOrg?: (orgName: string) => void;
  isAdmin?: boolean;
  tenants?: Tenant[];
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ onNavigateToGroup, onNavigateToOrg, isAdmin, tenants }) => {
  const [users, setUsers]             = useState<TenantUser[]>(TENANT_USERS);
  const [search, setSearch]           = useState('');
  const [sortField, setSortField]     = useState<SortField>('name');
  const [sortDir, setSortDir]         = useState<SortDir>('asc');
  const [filters, setFilters]         = useState<TenantFilters>(DEFAULT_TENANT_FILTERS);
  const [filterOpen, setFilterOpen]   = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [manageUser, setManageUser]   = useState<TenantUser | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  const activeFilterCount = [filters.types, filters.statuses, filters.roles].filter(a => a.length > 0).length;

  const handleRemoveUser = (userId: string) =>
    setUsers(prev => prev.filter(u => u.id !== userId));

  const handleAddMembers = (members: { id: string; name: string; email: string; initials: string; role: 'admin' | 'developer' | 'user' | 'viewer'; orgName?: string }[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newUsers: TenantUser[] = members.map(m => ({
      id: m.id, name: m.name, email: m.email, initials: m.initials,
      type: 'user' as const, status: 'active' as const, role: m.role,
      lastActive: 'Never', groups: [], createdAt: today, orgName: m.orgName,
    }));
    setUsers(prev => [...prev, ...newUsers]);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = users
    .filter(u => {
      if (filters.types.length    > 0 && !filters.types.includes(u.type as 'user' | 'service-account'))  return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(u.status))                           return false;
      if (filters.roles.length    > 0 && !filters.roles.includes(u.role as TenantUserRole))              return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || u.groups.some(g => g.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name': return dir * a.name.localeCompare(b.name);
        case 'email': return dir * a.email.localeCompare(b.email);
        case 'status': return dir * a.status.localeCompare(b.status);
        case 'createdAt': return dir * a.createdAt.localeCompare(b.createdAt);
        case 'groups': return dir * (a.groups.length - b.groups.length);
        case 'role': return dir * a.role.localeCompare(b.role);
        case 'orgName': return dir * (a.orgName ?? '').localeCompare(b.orgName ?? '');
        default: return 0;
      }
    });

  const TenantFilterCheckbox: React.FC<{ checked: boolean; label: string; onToggle: () => void }> = ({ checked, label, onToggle }) => (
    <button onClick={onToggle} className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-gray-2 transition-colors text-left">
      <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors', checked ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-6')}>
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-[13px] text-gray-11">{label}</span>
    </button>
  );

  const SortHeader: React.FC<{ field: SortField; label: string; className?: string }> = ({ field, label, className }) => (
    <th className={cn('text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3', className)}>
      <button
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 hover:text-gray-11 transition-colors"
      >
        {label}
        <ArrowUpDown size={10} className={cn(sortField === field ? 'text-[#5B5CE6]' : 'text-gray-7')} />
      </button>
    </th>
  );

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-4 shrink-0 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-6 bg-white flex-1 max-w-[320px]">
            <Search size={13} className="text-gray-8 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, or group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
            />
          </div>

          <Popover.Root open={filterOpen} onOpenChange={setFilterOpen}>
            <Popover.Trigger asChild>
              <button className={cn(
                'h-8 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors shrink-0',
                activeFilterCount > 0 ? 'text-[#5B5CE6] hover:bg-[#EEEEFF]' : 'text-gray-10 hover:bg-gray-3',
              )}>
                <SlidersHorizontal size={13} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-[#5B5CE6] text-white text-[10px] font-semibold flex items-center justify-center px-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content align="start" sideOffset={6} className="bg-white rounded-xl shadow-xl border border-gray-5 w-[210px] z-50 animate-in fade-in slide-in-from-top-1 duration-150 pb-2">
                <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-4">
                  <span className="text-[13px] font-semibold text-gray-12">Filters</span>
                  <div className="flex items-center gap-1">
                    {activeFilterCount > 0 && (
                      <button onClick={() => setFilters(DEFAULT_TENANT_FILTERS)} className="text-[11px] text-[#5B5CE6] hover:underline">Clear all</button>
                    )}
                    <Popover.Close asChild>
                      <button className="w-6 h-6 rounded flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors ml-1">
                        <X size={13} />
                      </button>
                    </Popover.Close>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-9 uppercase tracking-wider px-3 pt-3 pb-1">Identity Type</p>
                  <div className="px-1.5 space-y-0.5">
                    <TenantFilterCheckbox checked={filters.types.includes('user')}            label="Users"            onToggle={() => setFilters(p => toggleTenantFilter(p, 'types', 'user'))} />
                    <TenantFilterCheckbox checked={filters.types.includes('service-account')} label="Service Accounts" onToggle={() => setFilters(p => toggleTenantFilter(p, 'types', 'service-account'))} />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-9 uppercase tracking-wider px-3 pt-3 pb-1">Status</p>
                  <div className="px-1.5 space-y-0.5">
                    <TenantFilterCheckbox checked={filters.statuses.includes('active')}   label="Active"   onToggle={() => setFilters(p => toggleTenantFilter(p, 'statuses', 'active'))} />
                    <TenantFilterCheckbox checked={filters.statuses.includes('inactive')} label="Inactive" onToggle={() => setFilters(p => toggleTenantFilter(p, 'statuses', 'inactive'))} />
                    <TenantFilterCheckbox checked={filters.statuses.includes('pending')}  label="Pending"  onToggle={() => setFilters(p => toggleTenantFilter(p, 'statuses', 'pending'))} />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-9 uppercase tracking-wider px-3 pt-3 pb-1">Role</p>
                  <div className="px-1.5 space-y-0.5 pb-1">
                    <TenantFilterCheckbox checked={filters.roles.includes('admin')}     label="Admin"     onToggle={() => setFilters(p => toggleTenantFilter(p, 'roles', 'admin'))} />
                    <TenantFilterCheckbox checked={filters.roles.includes('developer')} label="Developer" onToggle={() => setFilters(p => toggleTenantFilter(p, 'roles', 'developer'))} />
                    <TenantFilterCheckbox checked={filters.roles.includes('user')}      label="User"      onToggle={() => setFilters(p => toggleTenantFilter(p, 'roles', 'user'))} />
                    <TenantFilterCheckbox checked={filters.roles.includes('viewer')}    label="Viewer"    onToggle={() => setFilters(p => toggleTenantFilter(p, 'roles', 'viewer'))} />
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {activeFilterCount > 0 && (
            <button onClick={() => setFilters(DEFAULT_TENANT_FILTERS)} className="text-[12px] text-gray-9 hover:text-gray-12 transition-colors underline shrink-0">Clear</button>
          )}

          <div className="ml-auto">
            <button
              onClick={() => setAddUserOpen(true)}
              className="h-8 px-3 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add User
            </button>
          </div>
        </div>

        {manageUser && (
          <TenantUserManageAccessDialog
            isAdmin={isAdmin}
            tenants={tenants}
            open={manageDialogOpen}
            onOpenChange={o => {
              setManageDialogOpen(o);
              if (!o) {
                setTimeout(() => setManageUser(null), 300);
                // Workaround: Radix Dialog + nested DropdownMenu can leave
                // body.style.pointerEvents stuck at 'none' after close.
                setTimeout(() => {
                  if (document.body.style.pointerEvents === 'none') {
                    document.body.style.pointerEvents = '';
                  }
                }, 400);
              }
            }}
            user={manageUser}
            onSave={updated => {
              setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
              setManageDialogOpen(false);
              setTimeout(() => setManageUser(null), 300);
              setTimeout(() => {
                if (document.body.style.pointerEvents === 'none') {
                  document.body.style.pointerEvents = '';
                }
              }, 400);
            }}
          />
        )}

        {/* Table */}
        <ScrollArea.Root className="flex-1">
          <ScrollArea.Viewport className="h-full w-full">
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users size={28} className="text-gray-6 mx-auto mb-3" />
                <p className="text-[13px] text-gray-9">No users match your search</p>
              </div>
            ) : (
              <div className="px-6 py-3">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-4">
                      <SortHeader field="name" label="Member" className="w-[220px]" />
                      <SortHeader field="status" label="Status" className="w-[110px]" />
                      {isAdmin && <SortHeader field="orgName" label="Org" className="w-[110px]" />}
                      <SortHeader field="role" label="Role" className="w-[120px]" />
                      <SortHeader field="groups" label="Groups" />
                      <SortHeader field="createdAt" label="Date Added" className="w-[120px]" />
                      <th className="w-[40px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(user => (
                      <tr key={user.id} className="border-b border-gray-3 last:border-b-0 hover:bg-gray-2 transition-colors group">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-3">
                            {user.status === 'pending' ? (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 bg-white border border-gray-6 text-gray-8">
                                <Mail size={14} />
                              </div>
                            ) : (
                              <UserAvatar user={user} />
                            )}
                            <div className="min-w-0">
                              {user.status === 'pending' ? (
                                <p className="text-[13px] text-gray-12 truncate">{user.email}</p>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[13px] font-medium text-gray-12 truncate">{user.name}</p>
                                    {user.type === 'service-account' && (
                                      <span className="text-[10px] font-medium text-gray-10 bg-gray-3 px-1.5 py-0.5 rounded shrink-0">
                                        Service
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-9 truncate">{user.email}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3">
                          <StatusBadge status={user.status} />
                        </td>
                        {isAdmin && (
                          <td className="py-2.5 pr-3">
                            {user.orgName
                              ? onNavigateToOrg
                                ? <button onClick={() => onNavigateToOrg(user.orgName!)} className="text-[12px] text-[#5B5CE6] hover:underline transition-colors text-left">{user.orgName}</button>
                                : <span className="text-[12px] text-gray-11">{user.orgName}</span>
                              : <span className="text-[12px] text-gray-7 italic">—</span>
                            }
                          </td>
                        )}
                        <td className="py-2.5 pr-3">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-gray-10 hover:bg-gray-3 transition-colors capitalize">
                                {user.role} <ChevronDown size={11} className="text-gray-8" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[130px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                {(['admin', 'developer', 'user', 'viewer'] as const).map(r => (
                                  <DropdownMenu.Item
                                    key={r}
                                    onClick={() => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: r } : u))}
                                    className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors capitalize',
                                      r === user.role ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                                    )}
                                  >
                                    {r}
                                    {r === user.role && <Check size={13} className="text-[#5B5CE6]" />}
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                        <td className="py-2.5 pr-3">
                          <GroupsCell groups={user.groups} onNavigateToGroup={onNavigateToGroup} />
                        </td>
                        <td className="py-2.5 text-left">
                          <span className="text-[12px] text-gray-9">{user.createdAt}</span>
                        </td>
                        <td className="py-2.5">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 opacity-0 group-hover:opacity-100 hover:bg-gray-3 hover:text-gray-11 transition-all">
                                <MoreHorizontal size={14} />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[180px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                <DropdownMenu.Item
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setManageUser(user);
                                    setTimeout(() => setManageDialogOpen(true), 0);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors"
                                >
                                  Manage access
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors"
                                >
                                  Remove from tenant
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-3 pt-3 border-t border-gray-3 flex items-center justify-between">
                  <p className="text-[12px] text-gray-8">
                    Showing {filtered.length} of {users.length} total
                  </p>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-8">
                        <Globe size={11} />
                        Public resource
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content sideOffset={4} className="bg-gray-12 text-white text-[11px] px-2.5 py-1.5 rounded-md shadow-lg z-50 max-w-[220px]">
                        Users are a default public resource. All tenant members can view this directory.
                        <Tooltip.Arrow className="fill-gray-12" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              </div>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="w-2 p-0.5">
            <ScrollArea.Thumb className="bg-gray-6 rounded-full" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <AddTenantMembersDialog
          open={addUserOpen}
          onOpenChange={setAddUserOpen}
          existingIds={users.map(u => u.id)}
          onAdd={handleAddMembers}
        />
      </div>
    </Tooltip.Provider>
  );
};
