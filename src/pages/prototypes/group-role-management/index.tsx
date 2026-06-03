import React, { useState, useRef, useCallback } from 'react';
import {
  Users, Settings, LogOut, KeyRound, Plus, BookOpen, User,
  ArrowLeft, Search, MoreHorizontal, Pencil, Trash2,
  ShieldCheck, ChevronDown, LayoutGrid, X, Check, Building2, Layers, SlidersHorizontal,
} from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useTweakpane, useDebugMode } from '@/lib/tweakpane';
import { Copy, CopyCheck } from 'lucide-react';
import {
  NavShell, HubGroup, AccountPicker, BRAND, BRAND_LIGHT,
  useOutsideClick, ShowIconsContext, ShowDescriptionsContext,
} from '../sgp-nav/SgpNav';
import { GroupManagement, GroupFormDialog } from './GroupManagement';
import { GroupDetail } from './GroupDetail';
import { RoleReference } from './RoleReference';
import { UsersManagement } from './UsersManagement';
import { IdentitiesManagement } from './IdentitiesManagement';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Popover from '@radix-ui/react-popover';
import {
  INITIAL_GROUPS, type Group,
  INITIAL_TENANTS, INITIAL_ORGS,
  MOCK_ORG_MEMBERS, orgRoleLabel,
  type Tenant, type Org, type OrgMember, type OrgMemberStatus, type OrgRole,
} from './data';

// ─── User Avatar Dropdown ─────────────────────────────────────────────────────

interface UserAvatarDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onManageGroupsRoles: () => void;
}

const UserAvatarDropdown: React.FC<UserAvatarDropdownProps> = ({ isOpen, onToggle, onClose, onManageGroupsRoles }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-[16px] font-medium transition-all ring-2',
          isOpen
            ? 'ring-[#5B5CE6]'
            : 'ring-transparent hover:ring-gray-6',
        )}
        style={{ background: BRAND_LIGHT, color: BRAND }}
      >
        C
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-5 z-50 w-[240px] py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2.5">
            <p className="text-[13px] font-medium text-gray-12">Cesar Neri</p>
            <p className="text-[12px] text-gray-9">cesar.neri@acme.com</p>
          </div>
          <Separator.Root className="h-px bg-gray-4 mx-2" />
          <div className="py-1 px-1">
            <button
              onClick={() => { onManageGroupsRoles(); onClose(); }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-gray-2 transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-gray-3 flex items-center justify-center text-gray-10">
                <KeyRound size={14} />
              </div>
              <span className="text-[13px] text-gray-11">Access Management</span>
            </button>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-gray-2 transition-colors">
              <div className="w-7 h-7 rounded-md bg-gray-3 flex items-center justify-center text-gray-10">
                <BookOpen size={14} />
              </div>
              <span className="text-[13px] text-gray-11">Documentation</span>
            </button>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-gray-2 transition-colors">
              <div className="w-7 h-7 rounded-md bg-gray-3 flex items-center justify-center text-gray-10">
                <Settings size={14} />
              </div>
              <span className="text-[13px] text-gray-11">Account Settings</span>
            </button>
          </div>
          <Separator.Root className="h-px bg-gray-4 mx-2" />
          <div className="py-1 px-1">
            <button className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-gray-2 transition-colors">
              <div className="w-7 h-7 rounded-md bg-gray-3 flex items-center justify-center text-gray-10">
                <LogOut size={14} />
              </div>
              <span className="text-[13px] text-gray-11">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Full-Page Groups Table ──────────────────────────────────────────────────

interface GroupsTableViewProps {
  groups: Group[];
  onSelectGroup: (id: string) => void;
  onRenameGroup: (id: string, name: string, description: string) => void;
  onDeleteGroup: (id: string) => void;
  onCreateGroup?: () => void;
}

const GroupsTableView: React.FC<GroupsTableViewProps> = ({ groups, onSelectGroup, onRenameGroup, onDeleteGroup, onCreateGroup }) => {
  const [search, setSearch] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetGroup, setTargetGroup] = useState<Group | null>(null);

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-gray-4 shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-6 bg-white max-w-[320px] flex-1">
          <Search size={13} className="text-gray-8 shrink-0" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
          />
        </div>
        {onCreateGroup && (
          <button
            onClick={onCreateGroup}
            className="h-8 px-3 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} />
            New Group
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={28} className="text-gray-6 mx-auto mb-3" />
            <p className="text-[13px] text-gray-9">{search ? 'No groups match your search' : 'No groups yet'}</p>
          </div>
        ) : (
          <div className="px-6 py-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-4">
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3">Name</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3 w-[100px]">Members</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3 w-[100px]">Access</th>
                  <th className="w-[40px]" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(group => (
                  <tr
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className="border-b border-gray-3 last:border-b-0 hover:bg-gray-2 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pr-3">
                      <p className="text-[13px] font-medium text-gray-12">{group.name}</p>
                      {group.description && (
                        <p className="text-[12px] text-gray-9 mt-0.5 line-clamp-1">{group.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-[13px] text-gray-11">{group.members.length}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-[13px] text-gray-11">
                        {group.accessBindings.length} binding{group.accessBindings.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 opacity-0 group-hover:opacity-100 hover:bg-gray-3 hover:text-gray-11 transition-all"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            sideOffset={4}
                            className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                          >
                            <DropdownMenu.Item
                              onClick={(e) => { e.stopPropagation(); setTargetGroup(group); setRenameOpen(true); }}
                              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors"
                            >
                              <Pencil size={13} />
                              Rename
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-gray-4 my-1" />
                            <DropdownMenu.Item
                              onClick={(e) => { e.stopPropagation(); setTargetGroup(group); setDeleteOpen(true); }}
                              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors"
                            >
                              <Trash2 size={13} />
                              Delete
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
                {filtered.length} of {groups.length} group{groups.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      <GroupFormDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        mode="rename"
        initialName={targetGroup?.name}
        initialDescription={targetGroup?.description}
        onSubmit={(name, desc) => {
          if (targetGroup) onRenameGroup(targetGroup.id, name, desc);
        }}
      />
      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[440px] p-6 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
            <div className="w-10 h-10 rounded-full bg-red-2 flex items-center justify-center mb-3">
              <Trash2 size={18} className="text-red-9" />
            </div>
            <AlertDialog.Title className="text-[16px] font-semibold text-gray-12">
              Delete "{targetGroup?.name}"?
            </AlertDialog.Title>
            <AlertDialog.Description asChild>
              <div className="mt-2 space-y-2">
                <p className="text-[13px] text-gray-10 leading-relaxed">
                  This action is permanent and cannot be undone.
                </p>
                <div className="bg-red-2 border border-red-6 rounded-lg px-3 py-2.5">
                  <p className="text-[13px] text-red-11 font-medium leading-relaxed">
                    All {targetGroup?.accessBindings.length ?? 0} access binding{(targetGroup?.accessBindings.length ?? 0) !== 1 ? 's' : ''} associated with this group will be removed.
                  </p>
                </div>
              </div>
            </AlertDialog.Description>
            <div className="flex items-center justify-end gap-2 mt-5">
              <AlertDialog.Cancel asChild>
                <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={() => { if (targetGroup) onDeleteGroup(targetGroup.id); setDeleteOpen(false); }}
                  className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-red-9 hover:bg-red-10 transition-colors"
                >
                  Delete Group
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

// ─── Org / Tenant shared types & mock data ────────────────────────────────────

type ManagementView = 'groups' | 'roles' | 'users' | 'org-members' | 'identities';

// ─── Org Members View ─────────────────────────────────────────────────────────

const AVATAR_PALETTES_ORG = [
  { bg: 'bg-[#E8E8FD]', text: 'text-[#5B5CE6]' },
  { bg: 'bg-[#DDF3E4]', text: 'text-[#18794E]' },
  { bg: 'bg-[#FEF2D6]', text: 'text-[#AD5700]' },
  { bg: 'bg-[#FFE8D7]', text: 'text-[#BD4B00]' },
  { bg: 'bg-[#FFE5E5]', text: 'text-[#CD2B31]' },
] as const;

function hashStr(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h);
}

// ─── Shared types / helpers used by both dialogs ─────────────────────────────

type OrgTenantRole = 'admin' | 'developer' | 'user' | 'viewer';
const ORG_TENANT_ROLES: OrgTenantRole[] = ['admin', 'developer', 'user', 'viewer'];
const ORG_ROLES_ORDERED: OrgRole[] = ['platform-admin', 'admin', 'member'];

function orgTenantRoleLabel(r: OrgTenantRole) {
  return r.charAt(0).toUpperCase() + r.slice(1);
}

// ─── Tenant Access List (shared: search + select-all) ─────────────────────────

const TenantAccessList: React.FC<{
  tenants: Tenant[];
  tenantIds: string[];
  tenantRoles: Record<string, OrgTenantRole>;
  onToggleTenant: (tid: string) => void;
  onSetRole: (tid: string, role: OrgTenantRole) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}> = ({ tenants, tenantIds, tenantRoles, onToggleTenant, onSetRole, onSelectAll, onDeselectAll }) => {
  const [query, setQuery] = useState('');
  const filtered = tenants.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  const allSelected = tenants.length > 0 && tenants.every(t => tenantIds.includes(t.id));

  return (
    <div className="space-y-2">
      {/* Search + select-all row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-2.5 h-7 rounded-lg border border-gray-6 bg-white flex-1 focus-within:ring-2 focus-within:ring-[#5B5CE6] focus-within:border-transparent transition-shadow">
          <Search size={12} className="text-gray-8 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tenants…"
            className="flex-1 bg-transparent text-[12px] text-gray-12 placeholder:text-gray-8 outline-none"
          />
        </div>
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-[12px] font-medium text-[#5B5CE6] hover:text-[#4A4BD5] whitespace-nowrap shrink-0 transition-colors"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <p className="text-[12px] text-gray-8 py-1">No tenants match "{query}"</p>
        )}
        {filtered.map(t => {
          const inTenant = tenantIds.includes(t.id);
          return (
            <div key={t.id} className="flex items-center gap-3">
              <button onClick={() => onToggleTenant(t.id)} className="flex items-center gap-2.5 flex-1 min-w-0">
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
                    <button className="flex items-center gap-1 h-7 px-2.5 rounded-md border border-gray-6 text-[12px] font-medium text-gray-10 hover:bg-gray-2 transition-colors shrink-0">
                      {orgTenantRoleLabel(tenantRoles[t.id] ?? 'developer')} <ChevronDown size={11} className="text-gray-8" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[130px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                      {ORG_TENANT_ROLES.map(r => (
                        <DropdownMenu.Item key={r}
                          onClick={() => onSetRole(t.id, r)}
                          className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                            (tenantRoles[t.id] ?? 'developer') === r ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                          )}
                        >
                          {orgTenantRoleLabel(r)} {(tenantRoles[t.id] ?? 'developer') === r && <Check size={12} className="text-[#5B5CE6]" />}
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
  );
};

// ─── Invite Org Members Dialog ────────────────────────────────────────────────

const InviteOrgMembersDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (invites: { email: string; role: OrgRole }[], tenantIds: string[], tenantRoles: Record<string, OrgTenantRole>) => void;
  isAdmin?: boolean;
  tenants: Tenant[];
}> = ({ open, onOpenChange, onInvite, isAdmin, tenants }) => {
  const [emailInput, setEmailInput]     = useState('');
  const [role, setRole]                 = useState<OrgRole>('member');
  const [tenantIds, setTenantIds]       = useState<string[]>([]);
  const [tenantRoles, setTenantRoles]   = useState<Record<string, OrgTenantRole>>({});

  const parseEmails = (raw: string) =>
    raw.split(',').map(e => e.trim()).filter(e => e.includes('@') && e.includes('.'));

  const validEmails = parseEmails(emailInput);
  const canSubmit = validEmails.length > 0;

  const toggleTenant = (tid: string) => {
    if (tenantIds.includes(tid)) {
      setTenantIds(prev => prev.filter(t => t !== tid));
      setTenantRoles(prev => { const n = { ...prev }; delete n[tid]; return n; });
    } else {
      setTenantIds(prev => [...prev, tid]);
      setTenantRoles(prev => ({ ...prev, [tid]: 'developer' as OrgTenantRole }));
    }
  };

  const selectAllTenants = () => {
    setTenantIds(tenants.map(t => t.id));
    setTenantRoles(prev => {
      const n = { ...prev };
      tenants.forEach(t => { if (!n[t.id]) n[t.id] = 'developer'; });
      return n;
    });
  };

  const deselectAllTenants = () => {
    setTenantIds([]);
    setTenantRoles({});
  };

  const handleSubmit = () => {
    onInvite(validEmails.map(email => ({ email, role })), tenantIds, tenantRoles);
    reset();
    onOpenChange(false);
  };

  const reset = () => { setEmailInput(''); setRole('member'); setTenantIds([]); setTenantRoles({}); };

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[480px] animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-4">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-[16px] font-semibold text-gray-12">Invite to Org</Dialog.Title>
                <Dialog.Description className="text-[13px] text-gray-9 mt-0.5">
                  Enter one or more emails separated by commas.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Input + role */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-3 h-9 rounded-lg border border-gray-6 bg-white">
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
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors whitespace-nowrap shrink-0">
                    {orgRoleLabel(role)} <ChevronDown size={12} className="text-gray-8" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[150px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                    {(['member', 'admin', 'platform-admin'] as const).map(r => (
                      <DropdownMenu.Item
                        key={r}
                        onClick={() => setRole(r)}
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
            {validEmails.length > 1 && (
              <p className="text-[11px] text-gray-9">{validEmails.length} addresses detected</p>
            )}

            {isAdmin && tenants.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider pb-0.5">Tenant Access <span className="normal-case font-normal text-gray-7">(optional)</span></p>
                <TenantAccessList
                  tenants={tenants}
                  tenantIds={tenantIds}
                  tenantRoles={tenantRoles}
                  onToggleTenant={toggleTenant}
                  onSetRole={(tid, r) => setTenantRoles(prev => ({ ...prev, [tid]: r }))}
                  onSelectAll={selectAllTenants}
                  onDeselectAll={deselectAllTenants}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-4 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">Cancel</button>
            </Dialog.Close>
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send {canSubmit ? `${validEmails.length} ` : ''}Invite{validEmails.length !== 1 ? 's' : ''}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const OrgMemberStatusBadge: React.FC<{ status: OrgMemberStatus }> = ({ status }) => {
  const styles: Record<OrgMemberStatus, { pill: string; dot: string }> = {
    active:   { pill: 'bg-green-3 text-green-11', dot: 'bg-green-9' },
    pending:  { pill: 'bg-amber-3 text-amber-11', dot: 'bg-amber-9' },
    inactive: { pill: 'bg-gray-3 text-gray-10',   dot: 'bg-gray-8'  },
  };
  const s = styles[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium', s.pill)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Org Member Manage Access Dialog ─────────────────────────────────────────

interface OrgMemberManageAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrgMember;
  currentOrgId: string;
  tenants: Tenant[];
  onSave: (updated: OrgMember, newOrgId: string, tenantRoles: Record<string, OrgTenantRole>) => void;
  isAdmin?: boolean;
}

const OrgMemberManageAccessDialog: React.FC<OrgMemberManageAccessDialogProps> = ({
  open, onOpenChange, member, currentOrgId, tenants, onSave, isAdmin,
}) => {
  const [orgId, setOrgId]       = useState(currentOrgId);
  const [role, setRole]         = useState<OrgRole>(member.role);
  const [tenantIds, setTenantIds]     = useState<string[]>(member.tenantIds);
  const [tenantRoles, setTenantRoles] = useState<Record<string, OrgTenantRole>>(
    () => Object.fromEntries(member.tenantIds.map(tid => [tid, 'developer' as OrgTenantRole]))
  );

  React.useEffect(() => {
    if (open) {
      setOrgId(currentOrgId);
      setRole(member.role);
      setTenantIds([...member.tenantIds]);
      setTenantRoles(Object.fromEntries(member.tenantIds.map(tid => [tid, 'developer' as OrgTenantRole])));
    }
  }, [open, member, currentOrgId]);

  const palette = AVATAR_PALETTES_ORG[hashStr(member.name) % AVATAR_PALETTES_ORG.length];

  const toggleTenant = (tid: string) => {
    if (tenantIds.includes(tid)) {
      setTenantIds(p => p.filter(t => t !== tid));
      setTenantRoles(p => { const n = { ...p }; delete n[tid]; return n; });
    } else {
      setTenantIds(p => [...p, tid]);
      setTenantRoles(p => ({ ...p, [tid]: 'developer' }));
    }
  };

  const selectAllTenants = () => {
    setTenantIds(tenants.map(t => t.id));
    setTenantRoles(prev => {
      const n = { ...prev };
      tenants.forEach(t => { if (!n[t.id]) n[t.id] = 'developer'; });
      return n;
    });
  };

  const deselectAllTenants = () => {
    setTenantIds([]);
    setTenantRoles({});
  };

  const handleSave = () => {
    onSave({ ...member, role, tenantIds }, orgId, tenantRoles);
    onOpenChange(false);
  };

  const selectedOrg = INITIAL_ORGS.find(o => o.id === orgId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[480px] animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
          <div className="px-6 pt-5 pb-4 border-b border-gray-4">
            <div className="flex items-start justify-between">
              <Dialog.Title className="text-[16px] font-semibold text-gray-12">Manage Access</Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Manage access for {member.name}</Dialog.Description>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Identity */}
            <div>
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-2.5">Identity</p>
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 flex items-center justify-center text-[14px] font-medium shrink-0',
                  member.type === 'service-account' ? 'rounded-lg bg-gray-3 text-gray-10' : `rounded-full ${palette.bg} ${palette.text}`
                )}>
                  {member.initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-12 leading-tight">{member.name}</p>
                  <p className="text-[12px] text-gray-9 mt-0.5">{member.email}</p>
                </div>
              </div>
            </div>
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
                        {ORG_ROLES_ORDERED.map(r => (
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

            {isAdmin && <div>
              <p className="text-[11px] font-semibold text-gray-9 uppercase tracking-wider mb-3">Tenant Access</p>
              <TenantAccessList
                tenants={tenants}
                tenantIds={tenantIds}
                tenantRoles={tenantRoles}
                onToggleTenant={toggleTenant}
                onSetRole={(tid, r) => setTenantRoles(p => ({ ...p, [tid]: r }))}
                onSelectAll={selectAllTenants}
                onDeselectAll={deselectAllTenants}
              />
            </div>}
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

// ─── Org Members View helpers ─────────────────────────────────────────────────

interface OrgMembersFilters {
  statuses: OrgMemberStatus[];
  roles:    OrgRole[];
  tenants:  string[];
}
const DEFAULT_ORG_FILTERS: OrgMembersFilters = { statuses: [], roles: [], tenants: [] };

function toggleOrgFilter<K extends keyof OrgMembersFilters>(
  prev: OrgMembersFilters, key: K, value: OrgMembersFilters[K][number]
): OrgMembersFilters {
  const arr = prev[key] as unknown[];
  return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
}

function countOrgFilters(f: OrgMembersFilters) {
  return [f.statuses, f.roles, f.tenants].filter(a => a.length > 0).length;
}

// ─── Org Members View ─────────────────────────────────────────────────────────

interface OrgMembersViewProps {
  orgId: string;
  tenants: Tenant[];
  onNavigateToTenantUsers: (tenantId: string) => void;
  isAdmin?: boolean;
}

const OrgMembersView: React.FC<OrgMembersViewProps> = ({ orgId, tenants, onNavigateToTenantUsers, isAdmin }) => {
  const [members, setMembers]         = useState<OrgMember[]>(MOCK_ORG_MEMBERS[orgId] ?? []);
  const [search, setSearch]           = useState('');
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [filters, setFilters]         = useState<OrgMembersFilters>(DEFAULT_ORG_FILTERS);
  const [filterOpen, setFilterOpen]   = useState(false);
  const [manageEntry, setManageEntry] = useState<OrgMember | null>(null);
  const [manageOpen, setManageOpen]   = useState(false);

  const activeCount = countOrgFilters(filters);

  const filtered = members.filter(m => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(m.status))                    return false;
    if (filters.roles.length    > 0 && !filters.roles.includes(m.role))                         return false;
    if (filters.tenants.length  > 0 && !m.tenantIds.some(t => filters.tenants.includes(t)))     return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const handleRoleChange = (memberId: string, role: OrgRole) =>
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));

  const handleRemove = (memberId: string) =>
    setMembers(prev => prev.filter(m => m.id !== memberId));

  const handleInvite = (invites: { email: string; role: OrgRole }[], tenantIds: string[]) => {
    const newMembers: OrgMember[] = invites.map((inv, i) => {
      const parts = inv.email.split('@')[0].split('.');
      const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      const initials = parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
      return {
        id: `inv-${Date.now()}-${i}`, name, email: inv.email,
        initials, type: 'user' as const, role: inv.role, status: 'pending' as OrgMemberStatus, tenantIds,
      };
    });
    setMembers(prev => [...prev, ...newMembers]);
  };

  const tenantName = (id: string) => tenants.find(t => t.id === id)?.name ?? id;

  const OrgFilterCheckbox: React.FC<{ checked: boolean; label: string; onToggle: () => void }> = ({ checked, label, onToggle }) => (
    <button onClick={onToggle} className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-gray-2 transition-colors text-left">
      <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors', checked ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-6')}>
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className="text-[13px] text-gray-11">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-gray-4 shrink-0 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-6 bg-white max-w-[300px] flex-1">
          <Search size={13} className="text-gray-8 shrink-0" />
          <input
            type="text"
            placeholder="Search identities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
          />
        </div>

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
            <Popover.Content align="start" sideOffset={6} className="bg-white rounded-xl shadow-xl border border-gray-5 w-[210px] z-50 animate-in fade-in slide-in-from-top-1 duration-150 pb-2">
              <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-gray-4">
                <span className="text-[13px] font-semibold text-gray-12">Filters</span>
                <div className="flex items-center gap-1">
                  {activeCount > 0 && (
                    <button onClick={() => setFilters(DEFAULT_ORG_FILTERS)} className="text-[11px] text-[#5B5CE6] hover:underline">Clear all</button>
                  )}
                  <Popover.Close asChild>
                    <button className="w-6 h-6 rounded flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors ml-1">
                      <X size={13} />
                    </button>
                  </Popover.Close>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-9 uppercase tracking-wider px-3 pt-3 pb-1">Status</p>
                <div className="px-1.5 space-y-0.5">
                  <OrgFilterCheckbox checked={filters.statuses.includes('active')}   label="Active"   onToggle={() => setFilters(p => toggleOrgFilter(p, 'statuses', 'active'))} />
                  <OrgFilterCheckbox checked={filters.statuses.includes('inactive')} label="Inactive" onToggle={() => setFilters(p => toggleOrgFilter(p, 'statuses', 'inactive'))} />
                  <OrgFilterCheckbox checked={filters.statuses.includes('pending')}  label="Pending"  onToggle={() => setFilters(p => toggleOrgFilter(p, 'statuses', 'pending'))} />
                </div>
                <p className="text-[10px] font-semibold text-gray-9 uppercase tracking-wider px-3 pt-3 pb-1">Role</p>
                <div className="px-1.5 space-y-0.5">
                  <OrgFilterCheckbox checked={filters.roles.includes('platform-admin')} label="Platform Admin" onToggle={() => setFilters(p => toggleOrgFilter(p, 'roles', 'platform-admin'))} />
                  <OrgFilterCheckbox checked={filters.roles.includes('admin')}          label="Admin"          onToggle={() => setFilters(p => toggleOrgFilter(p, 'roles', 'admin'))} />
                  <OrgFilterCheckbox checked={filters.roles.includes('member')}         label="Member"         onToggle={() => setFilters(p => toggleOrgFilter(p, 'roles', 'member'))} />
                </div>
                <p className="text-[10px] font-semibold text-gray-9 uppercase tracking-wider px-3 pt-3 pb-1">Tenant</p>
                <div className="px-1.5 space-y-0.5 pb-1">
                  {tenants.map(t => (
                    <OrgFilterCheckbox key={t.id} checked={filters.tenants.includes(t.id)} label={t.name} onToggle={() => setFilters(p => toggleOrgFilter(p, 'tenants', t.id))} />
                  ))}
                </div>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {activeCount > 0 && (
          <button onClick={() => setFilters(DEFAULT_ORG_FILTERS)} className="text-[12px] text-gray-9 hover:text-gray-12 transition-colors underline shrink-0">Clear</button>
        )}

        <div className="ml-auto">
          <button
            onClick={() => setInviteOpen(true)}
            className="h-8 px-3 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} /> Add Identity
          </button>
        </div>
      </div>

      <InviteOrgMembersDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} isAdmin={isAdmin} tenants={tenants} />

      {manageEntry && (
        <OrgMemberManageAccessDialog
          open={manageOpen}
          onOpenChange={o => {
            setManageOpen(o);
            if (!o) {
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
          member={manageEntry}
          currentOrgId={orgId}
          tenants={tenants}
          isAdmin={isAdmin}
          onSave={(updated, _newOrgId, _tenantRoles) => {
            setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
            setManageOpen(false);
            setTimeout(() => setManageEntry(null), 300);
            setTimeout(() => {
              if (document.body.style.pointerEvents === 'none') {
                document.body.style.pointerEvents = '';
              }
            }, 400);
          }}
        />
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={28} className="text-gray-6 mx-auto mb-3" />
            <p className="text-[13px] text-gray-9">{search || activeCount > 0 ? 'No identities match your filters' : 'No members yet'}</p>
          </div>
        ) : (
          <div className="px-6 py-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-4">
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3">Identity</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3 w-[100px]">Status</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3 w-[150px]">Role</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5">Tenants</th>
                  <th className="w-[40px]" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => {
                  const palette = AVATAR_PALETTES_ORG[hashStr(member.name) % AVATAR_PALETTES_ORG.length];
                  return (
                    <tr key={member.id} className="border-b border-gray-3 last:border-b-0 hover:bg-gray-2 transition-colors group">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            'w-8 h-8 flex items-center justify-center text-[12px] font-medium shrink-0',
                            member.type === 'service-account'
                              ? 'rounded-lg bg-gray-3 text-gray-10'
                              : `rounded-full ${palette.bg} ${palette.text}`,
                          )}>
                            {member.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-medium text-gray-12">{member.name}</p>
                              {member.type === 'service-account' && (
                                <span className="text-[10px] font-medium text-gray-10 bg-gray-3 px-1.5 py-0.5 rounded shrink-0">Service</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-9">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <OrgMemberStatusBadge status={member.status} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-gray-10 hover:bg-gray-3 transition-colors">
                              {orgRoleLabel(member.role)} <ChevronDown size={11} className="text-gray-8" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[150px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                              {ORG_ROLES_ORDERED.map(r => (
                                <DropdownMenu.Item
                                  key={r}
                                  onClick={() => handleRoleChange(member.id, r)}
                                  className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                                    r === member.role ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                                  )}
                                >
                                  {orgRoleLabel(r)}
                                  {r === member.role && <Check size={12} className="text-[#5B5CE6]" />}
                                </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {member.tenantIds.length === 0 ? (
                            <span className="text-[12px] text-gray-8 italic">None</span>
                          ) : member.tenantIds.map(tid => (
                            <button
                              key={tid}
                              onClick={() => onNavigateToTenantUsers(tid)}
                              className="text-[11px] text-[#5B5CE6] hover:underline transition-colors cursor-pointer"
                            >
                              {tenantName(tid)}
                            </button>
                          ))}
                        </div>
                      </td>
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
                                  setManageEntry(member);
                                  setTimeout(() => setManageOpen(true), 0);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors"
                              >
                                Manage access
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => handleRemove(member.id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors"
                              >
                                Remove
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Copy ID Button ───────────────────────────────────────────────────────────

const CopyIdMenuItem: React.FC<{ id: string; entityType: 'org' | 'tenant' }> = ({ id, entityType }) => {
  const [copied, setCopied] = useState(false);
  const label = entityType === 'org' ? 'Copy Org ID' : 'Copy Tenant ID';
  return (
    <DropdownMenu.Item
      onSelect={e => {
        e.preventDefault();
        navigator.clipboard.writeText(id).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors"
    >
      {copied ? <CopyCheck size={13} className="text-green-10 shrink-0" /> : <Copy size={13} className="shrink-0" />}
      {label}
    </DropdownMenu.Item>
  );
};

// ─── Control Plane Left Sidebar ───────────────────────────────────────────────

interface ControlPlaneLeftSidebarProps {
  activeView: ManagementView;
  activeOrgId: string | null;
  activeTenantId: string;
  onSetActiveTenantId: (id: string) => void;
  onSetActiveView: (v: ManagementView) => void;
  onNavigateOrg: (orgId: string) => void;
  showUsers: boolean;
  tenants: Tenant[];
  onUpdateTenants: (tenants: Tenant[]) => void;
  isAdmin: boolean;
  headerStyle?: 'logo' | 'back-button';
}

const ControlPlaneLeftSidebar: React.FC<ControlPlaneLeftSidebarProps> = ({ activeView, activeOrgId, activeTenantId, onSetActiveTenantId: setActiveTenantId, onSetActiveView, onNavigateOrg, showUsers, tenants, onUpdateTenants, isAdmin, headerStyle = 'logo' }) => {
  const [orgs, setOrgs] = useState<Org[]>(INITIAL_ORGS);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(['t1', 'o1']));
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const toggleSection = (id: string) =>
    setCollapsedSections(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Dialog — shared for both orgs and tenants
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'rename'>('create');
  const [dialogEntityType, setDialogEntityType] = useState<'org' | 'tenant'>('tenant');
  const [dialogTargetId, setDialogTargetId] = useState<string | null>(null);
  const [dialogName, setDialogName] = useState('');

  // Archive confirm — shared
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveEntityType, setArchiveEntityType] = useState<'org' | 'tenant'>('tenant');
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);

  const tenantNavItems: { value: ManagementView; label: string; Icon: React.ElementType }[] = [
    ...(showUsers ? [{ value: 'users' as ManagementView, label: 'Members', Icon: Users }] : []),
    { value: 'groups', label: 'Groups', Icon: LayoutGrid },
    { value: 'roles', label: 'Roles', Icon: ShieldCheck },
  ];

  const toggleAccordion = (id: string) =>
    setOpenAccordions(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const openDialog = (entityType: 'org' | 'tenant', mode: 'create' | 'rename', targetId?: string) => {
    setDialogEntityType(entityType);
    setDialogMode(mode);
    setDialogTargetId(targetId ?? null);
    const list = entityType === 'tenant' ? tenants : orgs;
    setDialogName(mode === 'rename' ? (list.find(e => e.id === targetId)?.name ?? '') : '');
    setDialogOpen(true);
  };

  const handleDialogSubmit = () => {
    if (!dialogName.trim()) return;
    const name = dialogName.trim();
    if (dialogEntityType === 'tenant') {
      if (dialogMode === 'create') {
        const id = `t${Date.now()}`;
        onUpdateTenants([...tenants, { id, name }]);
        setActiveTenantId(id);
        setOpenAccordions(prev => new Set([...prev, id]));
      } else if (dialogTargetId) {
        onUpdateTenants(tenants.map(t => t.id === dialogTargetId ? { ...t, name } : t));
      }
    } else {
      if (dialogMode === 'create') {
        const id = `o${Date.now()}`;
        setOrgs(prev => [...prev, { id, name }]);
        setOpenAccordions(prev => new Set([...prev, id]));
      } else if (dialogTargetId) {
        setOrgs(prev => prev.map(o => o.id === dialogTargetId ? { ...o, name } : o));
      }
    }
    setDialogOpen(false);
  };

  const openArchiveConfirm = (entityType: 'org' | 'tenant', id: string) => {
    setArchiveEntityType(entityType); setArchiveTargetId(id); setArchiveOpen(true);
  };

  const handleArchive = () => {
    if (archiveEntityType === 'tenant') {
      const remaining = tenants.filter(t => t.id !== archiveTargetId);
      onUpdateTenants(remaining);
      if (activeTenantId === archiveTargetId) setActiveTenantId(remaining[0]?.id ?? '');
    } else {
      setOrgs(prev => prev.filter(o => o.id !== archiveTargetId));
    }
    setArchiveOpen(false);
  };

  const archiveTargetName = archiveEntityType === 'tenant'
    ? tenants.find(t => t.id === archiveTargetId)?.name
    : orgs.find(o => o.id === archiveTargetId)?.name;

  const renderTenantNavItems = (tenantId: string) => (
    <div className="pl-2 mt-0 border-l border-gray-5 ml-3">
      {tenantNavItems.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => { setActiveTenantId(tenantId); onSetActiveView(value); }}
          className={cn(
            'w-full flex items-center gap-2.5 px-2 py-1 rounded-md text-[13px] font-medium transition-colors text-left',
            activeTenantId === tenantId && activeView === value
              ? 'bg-[#EEEEFF] text-[#5B5CE6]'
              : 'text-gray-10 hover:bg-gray-2 hover:text-gray-12',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const renderOrgNavItems = (orgId: string) => (
    <div className="pl-2 mt-0 border-l border-gray-5 ml-3">
      <button
        onClick={() => onNavigateOrg(orgId)}
          className={cn(
          'w-full flex items-center gap-2.5 px-2 py-1 rounded-md text-[13px] font-medium transition-colors text-left',
          activeOrgId === orgId && activeView === 'org-members'
            ? 'bg-[#EEEEFF] text-[#5B5CE6]'
            : 'text-gray-10 hover:bg-gray-2 hover:text-gray-12',
        )}
      >
        Identities
      </button>
    </div>
  );

  const renderEntityRow = (entity: Tenant | Org, entityType: 'org' | 'tenant', readonly = false) => {
    const menuId = `${entityType}-${entity.id}`;
    return (
      <div key={entity.id}>
        <div className="group/entity flex items-center">
          <button
            onClick={() => {
              toggleAccordion(entity.id);
              if (entityType === 'tenant') setActiveTenantId(entity.id);
            }}
            className="flex-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-2 transition-colors min-w-0"
          >
            <ChevronDown size={13} className={cn('text-gray-7 shrink-0 transition-transform duration-150', !openAccordions.has(entity.id) && '-rotate-90')} />
            <span className="text-[13px] font-medium text-gray-11 truncate">{entity.name}</span>
          </button>
          <DropdownMenu.Root open={menuOpenId === menuId} onOpenChange={open => setMenuOpenId(open ? menuId : null)}>
            <DropdownMenu.Trigger asChild>
              <button className="w-6 h-6 rounded flex items-center justify-center text-gray-8 opacity-0 group-hover/entity:opacity-100 data-[state=open]:opacity-100 hover:bg-gray-3 transition-all mr-1 shrink-0">
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[150px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <CopyIdMenuItem id={entity.id} entityType={entityType} />
                {!readonly && (
                  <>
                    <DropdownMenu.Item onClick={() => openDialog(entityType, 'rename', entity.id)} className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors">
                      <Pencil size={13} className="shrink-0" /> Rename
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => openArchiveConfirm(entityType, entity.id)} className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors">
                      <Trash2 size={13} className="shrink-0" /> Archive
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        {openAccordions.has(entity.id) && (
          entityType === 'tenant' ? renderTenantNavItems(entity.id) : renderOrgNavItems(entity.id)
        )}
      </div>
    );
  };

  const SectionHeader: React.FC<{
    label: string;
    icon: React.ReactNode;
    onAdd?: () => void;
    collapsed?: boolean;
    onToggle?: () => void;
  }> = ({ label, icon, onAdd, collapsed, onToggle }) => (
    <div className="flex items-center justify-between pl-2 py-1">
      {onToggle ? (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 text-gray-12 group/hdr flex-1 min-w-0"
        >
          <span className="relative w-[13px] h-[13px] shrink-0 flex items-center justify-center">
            <span className="absolute transition-opacity duration-100 group-hover/hdr:opacity-0">{icon}</span>
            <ChevronDown
              size={13}
              className={cn(
                'absolute opacity-0 group-hover/hdr:opacity-100 transition-all duration-100',
                collapsed && '-rotate-90',
              )}
            />
          </span>
          <span className="text-[13px] font-medium text-gray-12">{label}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 text-gray-12">
          {icon}
          <span className="text-[13px] font-medium text-gray-12">{label}</span>
        </div>
      )}
      {onAdd && (
        <button onClick={e => { e.stopPropagation(); onAdd(); }} className="w-6 h-6 rounded flex items-center justify-center text-gray-10 hover:bg-gray-3 hover:text-gray-12 transition-colors mr-1 shrink-0">
          <Plus size={12} />
        </button>
      )}
    </div>
  );

  return (
    <div className="w-[240px] h-full flex flex-col border-r border-gray-4 shrink-0" style={{ backgroundColor: '#fafafa' }}>
      {/* Header */}
      {headerStyle === 'back-button' ? (
        <div className="px-4 py-4 flex items-center gap-2.5 shrink-0">
          <button className="w-6 h-6 rounded-md border border-gray-5 flex items-center justify-center text-gray-10 hover:bg-gray-3 hover:text-gray-12 transition-colors shrink-0">
            <ArrowLeft size={13} />
          </button>
          <span className="text-[14px] font-semibold text-gray-12">Identity & Access</span>
        </div>
      ) : (
        <div className="px-4 py-4 flex items-center gap-2.5 shrink-0">
          <img src="/images/logo-icon.png" alt="Logo" className="w-6 h-6 rounded-md shrink-0 object-cover" />
          <span className="text-[14px] font-semibold text-gray-12">Control Plane</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="flex flex-col">
          <button
            onClick={() => onSetActiveView('identities')}
            className={cn(
              'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors',
              activeView === 'identities'
                ? 'bg-[#EEEEFF] text-[#5B5CE6]'
                : 'text-gray-12 hover:bg-gray-2',
            )}
          >
            <Users size={14} className="shrink-0" />
            All Identities
          </button>

          {isAdmin && (
            <>
              <SectionHeader
                label="Orgs"
                icon={<Building2 size={13} />}
                onAdd={() => openDialog('org', 'create')}
                collapsed={collapsedSections.has('orgs')}
                onToggle={() => toggleSection('orgs')}
              />
              {!collapsedSections.has('orgs') && orgs.map(org => renderEntityRow(org, 'org'))}
            </>
          )}
          <SectionHeader
            label="Tenants"
            icon={<Layers size={13} />}
            onAdd={isAdmin ? () => openDialog('tenant', 'create') : undefined}
            collapsed={collapsedSections.has('tenants')}
            onToggle={() => toggleSection('tenants')}
          />
          {!collapsedSections.has('tenants') && tenants.map(tenant => renderEntityRow(tenant, 'tenant', !isAdmin))}
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-gray-4 shrink-0">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2 py-1 rounded-md hover:bg-gray-2 transition-colors text-left">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0" style={{ background: BRAND_LIGHT, color: BRAND }}>C</div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-gray-12 truncate">César Neri</p>
                <p className="text-[11px] text-gray-9 truncate">cesar.neri@scale.com</p>
              </div>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="top"
              align="start"
              sideOffset={6}
              className="bg-white rounded-xl shadow-xl border border-gray-5 py-1.5 w-[200px] z-50 animate-in fade-in slide-in-from-bottom-1 duration-150"
            >
              <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-11 hover:bg-gray-2 hover:text-gray-12 cursor-pointer outline-none transition-colors">
                <User size={14} className="shrink-0 text-gray-9" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-11 hover:bg-gray-2 hover:text-gray-12 cursor-pointer outline-none transition-colors">
                <KeyRound size={14} className="shrink-0 text-gray-9" />
                API Key
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-gray-4 my-1" />
              <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors">
                <LogOut size={14} className="shrink-0" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Create / Rename dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[360px] p-6 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Dialog.Title className="text-[16px] font-semibold text-gray-12">
                  {dialogMode === 'create' ? `New ${dialogEntityType === 'org' ? 'Org' : 'Tenant'}` : `Rename ${dialogEntityType === 'org' ? 'Org' : 'Tenant'}`}
                </Dialog.Title>
                <Dialog.Description className="text-[13px] text-gray-9 mt-0.5">
                  {dialogMode === 'create' ? `Enter a name for the new ${dialogEntityType}.` : `Enter a new name.`}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1"><X size={16} /></button>
              </Dialog.Close>
            </div>
            <input
              autoFocus
              value={dialogName}
              onChange={e => setDialogName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleDialogSubmit(); }}
              placeholder={`${dialogEntityType === 'org' ? 'Org' : 'Tenant'} name`}
              className="w-full h-9 px-3 rounded-lg border border-gray-6 text-[13px] text-gray-12 placeholder:text-gray-8 outline-none focus:border-[#5B5CE6] transition-colors"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <Dialog.Close asChild>
                <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">Cancel</button>
              </Dialog.Close>
              <button disabled={!dialogName.trim()} onClick={handleDialogSubmit} className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {dialogMode === 'create' ? 'Create' : 'Rename'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Archive confirmation */}
      <AlertDialog.Root open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[400px] p-6 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
            <AlertDialog.Title className="text-[16px] font-semibold text-gray-12">Archive "{archiveTargetName}"?</AlertDialog.Title>
            <AlertDialog.Description className="text-[13px] text-gray-10 mt-2 leading-relaxed">
              This {archiveEntityType} will be archived and removed from the sidebar.
            </AlertDialog.Description>
            <div className="flex items-center justify-end gap-2 mt-5">
              <AlertDialog.Cancel asChild>
                <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button onClick={handleArchive} className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-red-9 hover:bg-red-10 transition-colors">Archive</button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

// ─── Management Shell (Full-Page Panel) ───────────────────────────────────────

type GroupsLayout = 'sidebar' | 'full-page';

interface ManagementPanelProps {
  groups: Group[];
  onUpdateGroups: (groups: Group[]) => void;
  showUsers: boolean;
  groupsLayout: GroupsLayout;
  activeView: ManagementView;
  onSetActiveView: (v: ManagementView) => void;
  hideHeader?: boolean;
  activeOrgId: string | null;
  onSetActiveOrgId: (orgId: string | null) => void;
  activeTenantId?: string;
  tenants: Tenant[];
  onNavigateToTenantUsers: (tenantId: string) => void;
  isAdmin?: boolean;
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({ groups, onUpdateGroups, showUsers, groupsLayout, activeView, onSetActiveView, hideHeader, activeOrgId, onSetActiveOrgId, activeTenantId, tenants, onNavigateToTenantUsers, isAdmin }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    groupsLayout === 'sidebar' ? (groups[0]?.id ?? null) : null
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  React.useEffect(() => {
    if (!showUsers && activeView === 'users') onSetActiveView('groups');
  }, [showUsers, activeView, onSetActiveView]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;

  const handleCreateGroup = (name: string, description: string) => {
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name,
      description,
      members: [],
      accessBindings: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...groups, newGroup];
    onUpdateGroups(updated);
    setSelectedGroupId(newGroup.id);
  };

  const handleRenameGroup = (id: string, name: string, description: string) => {
    onUpdateGroups(groups.map(g => g.id === id ? { ...g, name, description } : g));
  };

  const handleDeleteGroup = (id: string) => {
    const updated = groups.filter(g => g.id !== id);
    onUpdateGroups(updated);
    if (selectedGroupId === id) {
      setSelectedGroupId(updated[0]?.id ?? null);
    }
  };

  const handleUpdateGroup = (updated: Group) => {
    onUpdateGroups(groups.map(g => g.id === updated.id ? updated : g));
  };

  const handleNavigateToGroup = (groupName: string) => {
    const target = groups.find(g => g.name === groupName);
    if (target) {
      onSetActiveView('groups');
      setSelectedGroupId(target.id);
    }
  };

  const handleNavigateToOrg = (orgName: string) => {
    const org = INITIAL_ORGS.find(o => o.name === orgName);
    if (org) {
      onSetActiveOrgId(org.id);
      onSetActiveView('org-members');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-1">
      {/* Page header */}
      {!hideHeader && (
        <div className="bg-white shrink-0">
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-semibold text-gray-12">Access Management</h1>
              <p className="text-[13px] text-gray-9 mt-0.5">Manage groups, roles, and user access for your tenant.</p>
            </div>
            <div className="flex items-center gap-2" />
          </div>
          <div className="px-6 border-b border-gray-4">
            <Tabs.Root value={activeView} onValueChange={(v) => onSetActiveView(v as ManagementView)}>
              <Tabs.List className="flex items-center gap-0">
                {showUsers && (
                  <Tabs.Trigger
                    value="users"
                    className={cn(
                      'px-3 py-2 text-[13px] font-medium transition-colors border-b-2 -mb-px',
                      'data-[state=active]:text-[#5B5CE6] data-[state=active]:border-[#5B5CE6]',
                      'data-[state=inactive]:text-gray-9 data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-gray-11',
                    )}
                  >
                    Members
                  </Tabs.Trigger>
                )}
                <Tabs.Trigger
                  value="groups"
                  className={cn(
                    'px-3 py-2 text-[13px] font-medium transition-colors border-b-2 -mb-px',
                    'data-[state=active]:text-[#5B5CE6] data-[state=active]:border-[#5B5CE6]',
                    'data-[state=inactive]:text-gray-9 data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-gray-11',
                  )}
                >
                  Groups
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="roles"
                  className={cn(
                    'px-3 py-2 text-[13px] font-medium transition-colors border-b-2 -mb-px',
                    'data-[state=active]:text-[#5B5CE6] data-[state=active]:border-[#5B5CE6]',
                    'data-[state=inactive]:text-gray-9 data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-gray-11',
                  )}
                >
                  Roles
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
          </div>
        </div>
      )}

      {/* Left-panel title header */}
      {hideHeader && (
        <div className="bg-white px-6 py-4 shrink-0">
          {activeView === 'org-members' && activeOrgId && (() => {
            const org = INITIAL_ORGS.find(o => o.id === activeOrgId);
            return org ? (
              <p className="text-[12px] font-medium text-gray-9 mb-1">{org.name}</p>
            ) : null;
          })()}
          {activeView !== 'org-members' && activeView !== 'identities' && activeTenantId && (() => {
            const tenant = tenants.find(t => t.id === activeTenantId);
            return tenant ? (
              <p className="text-[12px] font-medium text-gray-9 mb-1">{tenant.name}</p>
            ) : null;
          })()}
          <h1 className="text-[20px] font-semibold text-gray-12">
            {activeView === 'groups' ? 'Groups'
              : activeView === 'users' ? 'Members'
              : activeView === 'roles' ? 'Roles'
              : activeView === 'identities' ? 'All Identities'
              : activeView === 'org-members' ? 'Members'
              : 'All Identities'}
          </h1>
        </div>
      )}

      {/* Main Content */}
      {activeView === 'groups' && groupsLayout === 'sidebar' && (
        <div className="flex-1 flex min-h-0">
          <div className="w-[320px] border-r border-gray-4 bg-white shrink-0">
            <GroupManagement
              groups={groups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              onCreateGroup={handleCreateGroup}
              onRenameGroup={handleRenameGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          </div>
          <div className="flex-1 bg-white min-w-0">
            {selectedGroup ? (
              <GroupDetail group={selectedGroup} onUpdateGroup={handleUpdateGroup} onEditGroup={() => setEditOpen(true)} onDeleteGroup={() => handleDeleteGroup(selectedGroup.id)} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Users size={36} className="text-gray-5 mx-auto mb-3" />
                  <p className="text-[14px] text-gray-9 font-medium">Select a group</p>
                  <p className="text-[12px] text-gray-8 mt-1">Choose a group from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeView === 'groups' && groupsLayout === 'full-page' && (
        <div className="flex-1 bg-white min-h-0">
          {selectedGroup ? (
            <div className="flex flex-col h-full">
              <div className="px-6 py-3 border-b border-gray-4 shrink-0">
                <button
                  onClick={() => setSelectedGroupId(null)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-gray-9 hover:text-gray-12 transition-colors"
                >
                  <ArrowLeft size={14} />
                  All Groups
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <GroupDetail group={selectedGroup} onUpdateGroup={handleUpdateGroup} onEditGroup={() => setEditOpen(true)} onDeleteGroup={() => handleDeleteGroup(selectedGroup.id)} />
              </div>
            </div>
          ) : (
            <GroupsTableView
              groups={groups}
              onSelectGroup={setSelectedGroupId}
              onRenameGroup={handleRenameGroup}
              onDeleteGroup={handleDeleteGroup}
              onCreateGroup={() => setCreateOpen(true)}
            />
          )}
        </div>
      )}
      {activeView === 'roles' && (
        <div className="flex-1 bg-white min-h-0">
          <RoleReference />
        </div>
      )}
      {activeView === 'org-members' && activeOrgId && (
        <div className="flex-1 bg-white min-h-0">
          <OrgMembersView key={activeOrgId} orgId={activeOrgId} tenants={tenants} onNavigateToTenantUsers={onNavigateToTenantUsers} isAdmin={isAdmin} />
        </div>
      )}
      {activeView === 'users' && showUsers && (
        <div className="flex-1 bg-white min-h-0">
          <UsersManagement onNavigateToGroup={handleNavigateToGroup} onNavigateToOrg={handleNavigateToOrg} isAdmin={isAdmin} tenants={tenants} />
        </div>
      )}
      {activeView === 'identities' && (
        <div className="flex-1 bg-white min-h-0">
          <IdentitiesManagement
            onNavigateToOrg={handleNavigateToOrg}
            onNavigateToTenant={onNavigateToTenantUsers}
          />
        </div>
      )}

      {/* Create Group Dialog */}
      <GroupFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreateGroup}
      />
      {/* Edit Group Dialog */}
      {selectedGroup && (
        <GroupFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="rename"
          initialName={selectedGroup.name}
          initialDescription={selectedGroup.description}
          onSubmit={(name, desc) => handleRenameGroup(selectedGroup.id, name, desc)}
        />
      )}
    </div>
  );
};

// ─── Main Prototype ───────────────────────────────────────────────────────────

const GroupRoleManagement: React.FC = () => {
  const { debugMode } = useDebugMode();
  const { params } = useTweakpane(
    { App: 'IAM Dashboard', isAdmin: true },
    { App: { options: { 'IAM Dashboard': 'IAM Dashboard', 'Spark': 'Spark' } } },
    {
      alwaysVisible: true,
      debugParams: { showUsersTab: true, navLayout: 'left-panel' },
      debugBindingOptions: {
        navLayout: { options: { 'Top Nav': 'top-nav', 'Left Panel': 'left-panel' } },
      },
    },
  );
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeView, setActiveView] = useState<ManagementView>('identities');
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [activeTenantId, setActiveTenantId] = useState('t1');
  const navRef = useRef<HTMLDivElement>(null);

  const closeMenus = useCallback(() => setOpenMenu(null), []);
  useOutsideClick(navRef, closeMenus);

  const toggle = (id: string) => setOpenMenu(p => (p === id ? null : id));

  // In debug mode, use the individual tweakpane params directly.
  // In normal mode, derive everything from the App dropdown.
  const isLeftPanel = debugMode ? params.navLayout === 'left-panel' : true;
  const showUsers = debugMode ? (params.showUsersTab as boolean) : true;
  const isAdmin = params.isAdmin as boolean;
  const groupsLayout: GroupsLayout = isLeftPanel ? 'full-page' : 'sidebar';
  const headerStyle = params.App === 'IAM Dashboard' ? 'logo' : 'back-button';

  const handleNavigateToTenantUsers = (tenantId: string) => {
    // In the sidebar, switch the active tenant accordion and navigate to users view
    setActiveView('users');
    // Tenant selection is managed inside the sidebar, so just switch the view
    // The tenant name will be visible in the users page title eventually
    void tenantId;
  };

  return (
    <ShowIconsContext.Provider value={true}>
      <ShowDescriptionsContext.Provider value={true}>
        {isLeftPanel ? (
          <div className="h-screen flex overflow-hidden bg-gray-1">
            <ControlPlaneLeftSidebar
              activeView={activeView}
              activeOrgId={activeOrgId}
              activeTenantId={activeTenantId}
              onSetActiveTenantId={setActiveTenantId}
              onSetActiveView={setActiveView}
              onNavigateOrg={(orgId) => { setActiveOrgId(orgId); setActiveView('org-members'); }}
              showUsers={showUsers}
              tenants={tenants}
              onUpdateTenants={setTenants}
              isAdmin={isAdmin}
              headerStyle={headerStyle}
            />
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              <ManagementPanel
                groups={groups}
                onUpdateGroups={setGroups}
                showUsers={showUsers}
                groupsLayout={groupsLayout}
                activeView={activeView}
                onSetActiveView={setActiveView}
                hideHeader
                activeOrgId={activeOrgId}
                onSetActiveOrgId={setActiveOrgId}
                activeTenantId={activeTenantId}
                tenants={tenants}
                onNavigateToTenantUsers={handleNavigateToTenantUsers}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-2 flex flex-col">
            {/* Navigation */}
            <div ref={navRef} className="relative z-40 shrink-0">
              <NavShell
                rightSlot={
                  <>
                    <AccountPicker
                      isOpen={openMenu === 'account'}
                      onToggle={() => toggle('account')}
                      onClose={closeMenus}
                    />
                    <UserAvatarDropdown
                      isOpen={openMenu === 'avatar'}
                      onToggle={() => toggle('avatar')}
                      onClose={closeMenus}
                      onManageGroupsRoles={() => {}}
                    />
                  </>
                }
              >
                <HubGroup openMenu={openMenu} toggle={toggle} close={closeMenus} />
              </NavShell>
            </div>

            {/* Content */}
            <ManagementPanel
              groups={groups}
              onUpdateGroups={setGroups}
              showUsers={showUsers}
              groupsLayout={groupsLayout}
              activeView={activeView}
              onSetActiveView={setActiveView}
              activeOrgId={activeOrgId}
              onSetActiveOrgId={setActiveOrgId}
              tenants={tenants}
              onNavigateToTenantUsers={handleNavigateToTenantUsers}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </ShowDescriptionsContext.Provider>
    </ShowIconsContext.Provider>
  );
};

export const title = 'Group & Role Management';
export const route = '/group-role-management';

export default GroupRoleManagement;
