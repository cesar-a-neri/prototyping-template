import React, { useState } from 'react';
import {
  Search, ArrowUpDown, Users, Mail, MoreHorizontal,
  Check, ChevronDown, SlidersHorizontal, X, Plus,
} from 'lucide-react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import {
  MOCK_ORG_MEMBERS, INITIAL_ORGS, INITIAL_TENANTS,
  orgRoleLabel,
  type OrgMember, type OrgRole,
} from './data';

// ─── Types ────────────────────────────────────────────────────────────────────

type TenantRole = 'admin' | 'developer' | 'user' | 'viewer';

// per-identity tenant role map: tenantId → role (only set when in that tenant)
type TenantRoles = Record<string, TenantRole>;

type IdentityEntry = OrgMember & {
  orgId: string;
  orgName: string;
  tenantRoles: TenantRoles;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ORG_ROLES: OrgRole[] = ['platform-admin', 'admin', 'member'];
const TENANT_ROLES: TenantRole[] = ['admin', 'developer', 'user', 'viewer'];

function tenantRoleLabel(r: TenantRole) {
  return r.charAt(0).toUpperCase() + r.slice(1);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

function buildIdentities(): IdentityEntry[] {
  return Object.entries(MOCK_ORG_MEMBERS).flatMap(([orgId, members]) => {
    const org = INITIAL_ORGS.find(o => o.id === orgId);
    return members.map(m => ({
      ...m,
      orgId,
      orgName: org?.name ?? orgId,
      tenantRoles: Object.fromEntries(m.tenantIds.map(tid => [tid, 'developer' as TenantRole])),
    }));
  });
}

const INITIAL_IDENTITIES = buildIdentities();

function tenantName(id: string) {
  return INITIAL_TENANTS.find(t => t.id === id)?.name ?? id;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const IdentityAvatar: React.FC<{ name: string; initials: string; type: 'user' | 'service-account'; size?: 'sm' | 'md' }> = ({ name, initials, type, size = 'sm' }) => {
  const isService = type === 'service-account';
  const palette = AVATAR_PALETTES[hashName(name) % AVATAR_PALETTES.length];
  const dim = size === 'md' ? 'w-10 h-10 text-[14px]' : 'w-8 h-8 text-[12px]';
  return (
    <div className={cn(
      dim, 'flex items-center justify-center font-medium shrink-0',
      isService ? 'rounded-lg bg-gray-3 text-gray-10' : `rounded-full ${palette.bg} ${palette.text}`,
    )}>
      {initials}
    </div>
  );
};

const StatusBadge: React.FC<{ status: OrgMember['status'] }> = ({ status }) => {
  const styles = {
    active:  { pill: 'bg-green-3 text-green-11', dot: 'bg-green-9' },
    pending: { pill: 'bg-amber-3 text-amber-11', dot: 'bg-amber-9' },
    inactive:{ pill: 'bg-gray-3 text-gray-10',   dot: 'bg-gray-8'  },
  };
  const s = styles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', s.pill)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Shared inline dropdown ───────────────────────────────────────────────────

function InlineDropdown<T extends string>({
  value, options, getLabel, onChange, width = 'w-[150px]',
}: {
  value: T;
  options: T[];
  getLabel: (v: T) => string;
  onChange: (v: T) => void;
  width?: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-gray-10 hover:bg-gray-3 transition-colors">
          {getLabel(value)} <ChevronDown size={11} className="text-gray-8" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={4} className={cn('bg-white rounded-lg shadow-xl border border-gray-5 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150', width)}>
          {options.map(opt => (
            <DropdownMenu.Item
              key={opt}
              onClick={() => onChange(opt)}
              className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                opt === value ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
              )}
            >
              {getLabel(opt)}
              {opt === value && <Check size={12} className="text-[#5B5CE6]" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ─── Checkbox filter helpers ───────────────────────────────────────────────────

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

const FilterCheckbox: React.FC<{ checked: boolean; label: string; onToggle: () => void }> = ({ checked, label, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-gray-2 transition-colors text-left"
  >
    <div className={cn(
      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
      checked ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-6',
    )}>
      {checked && <Check size={10} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-[13px] text-gray-11">{label}</span>
  </button>
);

const FilterGroupLabel: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-[10px] font-semibold text-gray-9 uppercase tracking-wider px-3 pt-3 pb-1">{label}</p>
);

// ─── Filter state ─────────────────────────────────────────────────────────────

interface Filters {
  types:    ('user' | 'service-account')[];
  statuses: OrgMember['status'][];
  orgs:     string[];
  roles:    OrgRole[];
  tenants:  string[];
}

const DEFAULT_FILTERS: Filters = { types: [], statuses: [], orgs: [], roles: [], tenants: [] };

function countActiveFilters(f: Filters) {
  return [f.types, f.statuses, f.orgs, f.roles, f.tenants].filter(a => a.length > 0).length;
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortField = 'name' | 'status' | 'orgName' | 'role' | 'tenants';
type SortDir   = 'asc' | 'desc';

// ─── Add Identity Dialog ───────────────────────────────────────────────────────

interface AddIdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (emails: string[], orgId: string, role: OrgRole, tenantIds: string[], tenantRoles: TenantRoles) => void;
}

const AddIdentityDialog: React.FC<AddIdentityDialogProps> = ({ open, onOpenChange, onAdd }) => {
  const [emailInput, setEmailInput]     = useState('');
  const [orgId, setOrgId]               = useState<string>(INITIAL_ORGS[0].id);
  const [role, setRole]                 = useState<OrgRole>('member');
  const [tenantIds, setTenantIds]       = useState<string[]>([]);
  const [tenantRoles, setTenantRoles]   = useState<TenantRoles>({});

  const parseEmails = (raw: string) =>
    raw.split(',').map(e => e.trim()).filter(e => e.includes('@') && e.includes('.'));

  const validEmails = parseEmails(emailInput);
  const canSubmit   = validEmails.length > 0;
  const selectedOrg = INITIAL_ORGS.find(o => o.id === orgId);

  const toggleTenant = (tid: string) => {
    if (tenantIds.includes(tid)) {
      setTenantIds(prev => prev.filter(t => t !== tid));
      setTenantRoles(prev => { const n = { ...prev }; delete n[tid]; return n; });
    } else {
      setTenantIds(prev => [...prev, tid]);
      setTenantRoles(prev => ({ ...prev, [tid]: 'developer' as TenantRole }));
    }
  };

  const handleSubmit = () => { onAdd(validEmails, orgId, role, tenantIds, tenantRoles); reset(); onOpenChange(false); };
  const reset = () => { setEmailInput(''); setOrgId(INITIAL_ORGS[0].id); setRole('member'); setTenantIds([]); setTenantRoles({}); };

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[480px] animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
          <div className="px-6 pt-6 pb-5 border-b border-gray-4">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-[16px] font-semibold text-gray-12">Add Identity</Dialog.Title>
                <Dialog.Description className="text-[13px] text-gray-9 mt-0.5">
                  Enter one or more emails. Each identity can only belong to one org.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center px-3 h-9 rounded-lg border border-gray-6 bg-white">
              <input
                autoFocus
                type="text"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
                placeholder="alice@co.com, bob@co.com..."
                className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none min-w-0"
              />
            </div>
            {validEmails.length > 1 && (
              <p className="text-[11px] text-gray-9">{validEmails.length} addresses detected</p>
            )}

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[12px] text-gray-9 shrink-0">Add to</span>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors whitespace-nowrap">
                    {selectedOrg?.name ?? 'Select org'} <ChevronDown size={12} className="text-gray-8" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                    {INITIAL_ORGS.map(o => (
                      <DropdownMenu.Item key={o.id} onClick={() => setOrgId(o.id)}
                        className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                          o.id === orgId ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                        )}
                      >
                        {o.name} {o.id === orgId && <Check size={12} className="text-[#5B5CE6]" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <span className="text-[12px] text-gray-9 shrink-0">as</span>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors whitespace-nowrap">
                    {orgRoleLabel(role)} <ChevronDown size={12} className="text-gray-8" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                    {ORG_ROLES.map(r => (
                      <DropdownMenu.Item key={r} onClick={() => setRole(r)}
                        className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                          r === role ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                        )}
                      >
                        {orgRoleLabel(r)} {r === role && <Check size={12} className="text-[#5B5CE6]" />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>

            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider pb-1">Tenant Access <span className="normal-case font-normal text-gray-7">(optional)</span></p>
              {INITIAL_TENANTS.map(t => {
                const inTenant = tenantIds.includes(t.id);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <button onClick={() => toggleTenant(t.id)} className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors', inTenant ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-6')}>
                        {inTenant && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={cn('text-[13px]', inTenant ? 'text-gray-12 font-medium' : 'text-gray-9')}>{t.name}</span>
                    </button>
                    {inTenant && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-gray-6 text-[12px] font-medium text-gray-10 hover:bg-gray-2 transition-colors shrink-0">
                            {tenantRoleLabel(tenantRoles[t.id] ?? 'developer')} <ChevronDown size={11} className="text-gray-8" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[130px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                            {TENANT_ROLES.map(r => (
                              <DropdownMenu.Item key={r} onClick={() => setTenantRoles(prev => ({ ...prev, [t.id]: r }))}
                                className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                                  (tenantRoles[t.id] ?? 'developer') === r ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                                )}
                              >
                                {tenantRoleLabel(r)} {(tenantRoles[t.id] ?? 'developer') === r && <Check size={12} className="text-[#5B5CE6]" />}
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

          <div className="px-6 py-4 border-t border-gray-4 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">Cancel</button>
            </Dialog.Close>
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add {canSubmit ? `${validEmails.length} ` : ''}Identit{validEmails.length === 1 ? 'y' : 'ies'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Manage Access Dialog ─────────────────────────────────────────────────────

interface ManageAccessDialogProps {
  entry: IdentityEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: IdentityEntry) => void;
}

const ManageAccessDialog: React.FC<ManageAccessDialogProps> = ({ entry, open, onOpenChange, onSave }) => {
  const [orgId, setOrgId]           = useState(entry.orgId);
  const [role, setRole]             = useState<OrgRole>(entry.role);
  const [tenantIds, setTenantIds]   = useState<string[]>(entry.tenantIds);
  const [tenantRoles, setTenantRoles] = useState<TenantRoles>({ ...entry.tenantRoles });

  // Reset local state when dialog opens for a (possibly different) entry
  React.useEffect(() => {
    if (open) {
      setOrgId(entry.orgId);
      setRole(entry.role);
      setTenantIds([...entry.tenantIds]);
      setTenantRoles({ ...entry.tenantRoles });
    }
  }, [open, entry]);

  const selectedOrg = INITIAL_ORGS.find(o => o.id === orgId);

  const toggleTenant = (tid: string) => {
    if (tenantIds.includes(tid)) {
      setTenantIds(prev => prev.filter(t => t !== tid));
      setTenantRoles(prev => { const next = { ...prev }; delete next[tid]; return next; });
    } else {
      setTenantIds(prev => [...prev, tid]);
      setTenantRoles(prev => ({ ...prev, [tid]: 'developer' }));
    }
  };

  const setTenantRole = (tid: string, r: TenantRole) =>
    setTenantRoles(prev => ({ ...prev, [tid]: r }));

  const handleSave = () => {
    const org = INITIAL_ORGS.find(o => o.id === orgId);
    onSave({ ...entry, orgId, orgName: org?.name ?? orgId, role, tenantIds, tenantRoles });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[480px] animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-4">
            <div className="flex items-start justify-between">
              <Dialog.Title className="text-[16px] font-semibold text-gray-12">Manage Access</Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Manage access for {entry.name}</Dialog.Description>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* Identity */}
            <div>
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-2.5">Identity</p>
              <div className="flex items-center gap-3">
                <IdentityAvatar name={entry.name} initials={entry.initials} type={entry.type} size="md" />
                <div>
                  <p className="text-[14px] font-semibold text-gray-12 leading-tight">{entry.name}</p>
                  <p className="text-[12px] text-gray-9 mt-0.5">{entry.email}</p>
                </div>
              </div>
            </div>

            {/* Org & Platform Role */}
            <div>
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-3">Org & Platform Role</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-gray-9 mb-1.5">Organization</p>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors">
                        {selectedOrg?.name ?? '—'} <ChevronDown size={12} className="text-gray-8 shrink-0" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[180px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                        {INITIAL_ORGS.map(o => (
                          <DropdownMenu.Item key={o.id} onClick={() => setOrgId(o.id)}
                            className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                              o.id === orgId ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                            )}
                          >
                            {o.name} {o.id === orgId && <Check size={12} className="text-[#5B5CE6]" />}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
                <div>
                  <p className="text-[11px] text-gray-9 mb-1.5">Platform Role</p>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="w-full flex items-center justify-between h-8 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors">
                        {orgRoleLabel(role)} <ChevronDown size={12} className="text-gray-8 shrink-0" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                        {ORG_ROLES.map(r => (
                          <DropdownMenu.Item key={r} onClick={() => setRole(r)}
                            className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                              r === role ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                            )}
                          >
                            {orgRoleLabel(r)} {r === role && <Check size={12} className="text-[#5B5CE6]" />}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            </div>

            {/* Tenant Access */}
            <div>
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-3">Tenant Access</p>
              <div className="space-y-2">
                {INITIAL_TENANTS.map(t => {
                  const inTenant = tenantIds.includes(t.id);
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTenant(t.id)}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                          inTenant ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-6',
                        )}>
                          {inTenant && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={cn('text-[13px]', inTenant ? 'text-gray-12 font-medium' : 'text-gray-9')}>
                          {t.name}
                        </span>
                      </button>

                      {inTenant && (
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-gray-6 text-[12px] font-medium text-gray-10 hover:bg-gray-2 transition-colors shrink-0">
                              {tenantRoleLabel(tenantRoles[t.id] ?? 'developer')}
                              <ChevronDown size={11} className="text-gray-8" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[130px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                              {TENANT_ROLES.map(r => (
                                <DropdownMenu.Item key={r} onClick={() => setTenantRole(t.id, r)}
                                  className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                                    (tenantRoles[t.id] ?? 'developer') === r ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                                  )}
                                >
                                  {tenantRoleLabel(r)}
                                  {(tenantRoles[t.id] ?? 'developer') === r && <Check size={12} className="text-[#5B5CE6]" />}
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
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-4 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">Cancel</button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Identities Management ────────────────────────────────────────────────────

interface IdentitiesManagementProps {
  onNavigateToOrg?:    (orgName: string) => void;
  onNavigateToTenant?: (tenantId: string) => void;
}

export const IdentitiesManagement: React.FC<IdentitiesManagementProps> = ({
  onNavigateToOrg,
  onNavigateToTenant,
}) => {
  const [identities, setIdentities]   = useState<IdentityEntry[]>(INITIAL_IDENTITIES);
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState<Filters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen]   = useState(false);
  const [addOpen, setAddOpen]         = useState(false);
  const [manageEntry, setManageEntry] = useState<IdentityEntry | null>(null);
  const [manageOpen, setManageOpen]   = useState(false);
  const [sortField, setSortField]     = useState<SortField>('name');
  const [sortDir, setSortDir]         = useState<SortDir>('asc');

  const toggleFilterValue = <K extends keyof Filters>(key: K, value: Filters[K][number]) =>
    setFilters(prev => ({ ...prev, [key]: toggle(prev[key] as unknown[], value as unknown) as Filters[K] }));

  const clearFilters = () => setFilters(DEFAULT_FILTERS);
  const activeCount  = countActiveFilters(filters);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleRoleChange = (id: string, orgId: string, role: OrgRole) =>
    setIdentities(prev => prev.map(e => e.id === id && e.orgId === orgId ? { ...e, role } : e));

  const handleManageSave = (updated: IdentityEntry) =>
    setIdentities(prev => prev.map(e => e.id === updated.id && e.orgId === updated.orgId ? updated : e));

  const handleAdd = (emails: string[], orgId: string, role: OrgRole, tenantIds: string[], tenantRoles: TenantRoles) => {
    const org = INITIAL_ORGS.find(o => o.id === orgId);
    const newEntries: IdentityEntry[] = emails.map((email, i) => {
      const parts    = email.split('@')[0].split(/[._-]/);
      const name     = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      const initials = parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
      return {
        id: `new-${Date.now()}-${i}`, name, email, initials,
        type: 'user' as const, role, status: 'active' as const,
        tenantIds, tenantRoles,
        orgId, orgName: org?.name ?? orgId,
      };
    });
    setIdentities(prev => [...prev, ...newEntries]);
  };

  const filtered = identities
    .filter(e => {
      const f = filters;
      if (f.types.length    > 0 && !f.types.includes(e.type as 'user' | 'service-account'))  return false;
      if (f.statuses.length > 0 && !f.statuses.includes(e.status))                           return false;
      if (f.orgs.length     > 0 && !f.orgs.includes(e.orgName))                              return false;
      if (f.roles.length    > 0 && !f.roles.includes(e.role))                                return false;
      if (f.tenants.length  > 0 && !e.tenantIds.some(t => f.tenants.includes(t)))            return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.orgName.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'name':    return dir * a.name.localeCompare(b.name);
        case 'status':  return dir * a.status.localeCompare(b.status);
        case 'orgName': return dir * a.orgName.localeCompare(b.orgName);
        case 'role':    return dir * a.role.localeCompare(b.role);
        case 'tenants': return dir * (a.tenantIds.length - b.tenantIds.length);
        default:        return 0;
      }
    });

  const SortHeader: React.FC<{ field: SortField; label: string; className?: string }> = ({ field, label, className }) => (
    <th className={cn('text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3', className)}>
      <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-gray-11 transition-colors">
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
          <div className="flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-6 bg-white flex-1 max-w-[300px]">
            <Search size={13} className="text-gray-8 shrink-0" />
            <input
              type="text"
              placeholder="Search identities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
            />
          </div>

          {/* Unified filter popover */}
          <Popover.Root open={filterOpen} onOpenChange={setFilterOpen}>
            <Popover.Trigger asChild>
              <button className={cn(
                'h-8 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors shrink-0',
                activeCount > 0 ? 'text-[#5B5CE6] hover:bg-[#EEEEFF]' : 'text-gray-10 hover:bg-gray-3',
              )}>
                <SlidersHorizontal size={13} />
                Filters
                {activeCount > 0 && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-[#5B5CE6] text-white text-[10px] font-semibold flex items-center justify-center px-1">
                    {activeCount}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content align="start" sideOffset={6} className="bg-white rounded-xl shadow-xl border border-gray-5 w-[220px] z-50 animate-in fade-in slide-in-from-top-1 duration-150 pb-2">
                <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-4">
                  <span className="text-[13px] font-semibold text-gray-12">Filters</span>
                  <div className="flex items-center gap-1">
                    {activeCount > 0 && (
                      <button onClick={clearFilters} className="text-[11px] text-[#5B5CE6] hover:underline transition-colors">Clear all</button>
                    )}
                    <Popover.Close asChild>
                      <button className="w-6 h-6 rounded flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors ml-1">
                        <X size={13} />
                      </button>
                    </Popover.Close>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[70vh]">
                  <FilterGroupLabel label="Identity Type" />
                  <div className="px-1.5 space-y-0.5">
                    <FilterCheckbox checked={filters.types.includes('user')}            label="Users"            onToggle={() => toggleFilterValue('types', 'user')} />
                    <FilterCheckbox checked={filters.types.includes('service-account')} label="Service Accounts" onToggle={() => toggleFilterValue('types', 'service-account')} />
                  </div>

                  <FilterGroupLabel label="Status" />
                  <div className="px-1.5 space-y-0.5">
                    <FilterCheckbox checked={filters.statuses.includes('active')}   label="Active"   onToggle={() => toggleFilterValue('statuses', 'active')} />
                    <FilterCheckbox checked={filters.statuses.includes('inactive')} label="Inactive" onToggle={() => toggleFilterValue('statuses', 'inactive')} />
                    <FilterCheckbox checked={filters.statuses.includes('pending')}  label="Pending"  onToggle={() => toggleFilterValue('statuses', 'pending')} />
                  </div>

                  <FilterGroupLabel label="Org" />
                  <div className="px-1.5 space-y-0.5">
                    {INITIAL_ORGS.map(o => (
                      <FilterCheckbox key={o.id} checked={filters.orgs.includes(o.name)} label={o.name} onToggle={() => toggleFilterValue('orgs', o.name)} />
                    ))}
                  </div>

                  <FilterGroupLabel label="Role" />
                  <div className="px-1.5 space-y-0.5">
                    <FilterCheckbox checked={filters.roles.includes('platform-admin')} label="Platform Admin" onToggle={() => toggleFilterValue('roles', 'platform-admin')} />
                    <FilterCheckbox checked={filters.roles.includes('admin')}          label="Admin"          onToggle={() => toggleFilterValue('roles', 'admin')} />
                    <FilterCheckbox checked={filters.roles.includes('member')}         label="Member"         onToggle={() => toggleFilterValue('roles', 'member')} />
                  </div>

                  <FilterGroupLabel label="Tenant" />
                  <div className="px-1.5 space-y-0.5 pb-1">
                    {INITIAL_TENANTS.map(t => (
                      <FilterCheckbox key={t.id} checked={filters.tenants.includes(t.id)} label={t.name} onToggle={() => toggleFilterValue('tenants', t.id)} />
                    ))}
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-[12px] text-gray-9 hover:text-gray-12 transition-colors underline shrink-0">Clear</button>
          )}

          <div className="ml-auto">
            <button
              onClick={() => setAddOpen(true)}
              className="h-8 px-3 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} /> Add Identity
            </button>
          </div>
        </div>

        {/* Table */}
        <ScrollArea.Root className="flex-1">
          <ScrollArea.Viewport className="h-full w-full">
            {filtered.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Users size={28} className="text-gray-6 mx-auto mb-3" />
                <p className="text-[13px] font-medium text-gray-10">No identities found</p>
                <p className="text-[12px] text-gray-8 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="px-6 py-3">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-4">
                      <SortHeader field="name"    label="Identity" className="min-w-[220px]" />
                      <SortHeader field="status"  label="Status"   className="w-[110px]" />
                      <SortHeader field="orgName" label="Org"      className="w-[130px]" />
                      <SortHeader field="role"    label="Role"     className="w-[150px]" />
                      <SortHeader field="tenants" label="Tenants"  />
                      <th className="w-[40px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(entry => (
                      <tr key={`${entry.orgId}-${entry.id}`} className="border-b border-gray-3 last:border-b-0 hover:bg-gray-2 transition-colors group">

                        {/* Identity */}
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-3">
                            {entry.status === 'pending' ? (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-6 text-gray-8 shrink-0">
                                <Mail size={14} />
                              </div>
                            ) : (
                              <IdentityAvatar name={entry.name} initials={entry.initials} type={entry.type} />
                            )}
                            <div className="min-w-0">
                              {entry.status === 'pending' ? (
                                <p className="text-[13px] text-gray-12 truncate">{entry.email}</p>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[13px] font-medium text-gray-12 truncate">{entry.name}</p>
                                    {entry.type === 'service-account' && (
                                      <span className="text-[10px] font-medium text-gray-10 bg-gray-3 px-1.5 py-0.5 rounded shrink-0">Service</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-9 truncate">{entry.email}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 pr-3"><StatusBadge status={entry.status} /></td>

                        {/* Org */}
                        <td className="py-2.5 pr-3">
                          {onNavigateToOrg
                            ? <button onClick={() => onNavigateToOrg(entry.orgName)} className="text-[12px] text-[#5B5CE6] hover:underline transition-colors text-left">{entry.orgName}</button>
                            : <span className="text-[12px] text-gray-11">{entry.orgName}</span>
                          }
                        </td>

                        {/* Role — editable inline */}
                        <td className="py-2.5 pr-3">
                          <InlineDropdown
                            value={entry.role}
                            options={ORG_ROLES}
                            getLabel={orgRoleLabel}
                            onChange={r => handleRoleChange(entry.id, entry.orgId, r)}
                          />
                        </td>

                        {/* Tenants */}
                        <td className="py-2.5 pr-3">
                          {entry.tenantIds.length === 0
                            ? <span className="text-[12px] text-gray-8 italic">None</span>
                            : (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                {entry.tenantIds.map(tid => (
                                  onNavigateToTenant
                                    ? <button key={tid} onClick={() => onNavigateToTenant(tid)} className="text-[12px] text-[#5B5CE6] hover:underline transition-colors">{tenantName(tid)}</button>
                                    : <span key={tid} className="text-[12px] text-gray-11">{tenantName(tid)}</span>
                                ))}
                              </div>
                            )
                          }
                        </td>

                        {/* Actions */}
                        <td className="py-2.5">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 opacity-0 group-hover:opacity-100 hover:bg-gray-3 hover:text-gray-11 transition-all">
                                <MoreHorizontal size={14} />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                <DropdownMenu.Item
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setManageEntry(entry);
                                    setTimeout(() => setManageOpen(true), 0);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors"
                                >
                                  Manage access
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors">
                                  Deactivate
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-3 pt-3 border-t border-gray-3">
                  <p className="text-[12px] text-gray-8">
                    Showing {filtered.length} of {identities.length} identities
                    {filtered.length < identities.length && (
                      <> · <span className="text-gray-9">{identities.length - filtered.length} filtered out</span></>
                    )}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" className="w-2 p-0.5">
            <ScrollArea.Thumb className="bg-gray-6 rounded-full" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>

        <AddIdentityDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />

        {manageEntry && (
          <ManageAccessDialog
            entry={manageEntry}
            open={manageOpen}
            onOpenChange={open => {
              setManageOpen(open);
              if (!open) {
                setTimeout(() => setManageEntry(null), 300);
                // Workaround: Radix Dialog + nested DropdownMenu can leave
                // body.style.pointerEvents stuck at 'none' after close.
                setTimeout(() => {
                  if (document.body.style.pointerEvents === 'none') {
                    document.body.style.pointerEvents = '';
                  }
                }, 400);
              }
            }}
            onSave={handleManageSave}
          />
        )}
      </div>
    </Tooltip.Provider>
  );
};
