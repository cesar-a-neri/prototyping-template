import React, { useState, useRef, useCallback } from 'react';
import {
  Users, Settings, LogOut, KeyRound, Plus, BookOpen,
  ArrowLeft, Search, MoreHorizontal, Pencil, Trash2,
  ShieldCheck, ChevronDown, LayoutGrid, X, Check, Building2, Layers,
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
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { INITIAL_GROUPS, type Group } from './data';

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

type ManagementView = 'groups' | 'roles' | 'users' | 'org-members';

interface Tenant { id: string; name: string; }
interface Org    { id: string; name: string; }

type OrgMemberStatus = 'active' | 'pending' | 'inactive';

interface OrgMember {
  id: string; name: string; email: string; initials: string;
  type: 'user' | 'service-account';
  role: 'member' | 'admin';
  status: OrgMemberStatus;
  tenantIds: string[];
}

const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', name: 'tenant name' },
  { id: 't2', name: 'Second Tenant' },
];

const INITIAL_ORGS: Org[] = [
  { id: 'o1', name: 'Acme Org' },
  { id: 'o2', name: 'Beta Org' },
];

const MOCK_ORG_MEMBERS: Record<string, OrgMember[]> = {
  o1: [
    { id: 'u1',  name: 'Alice Chen',      email: 'alice.chen@acme.com',      initials: 'AC', type: 'user',            role: 'admin',  status: 'active',   tenantIds: ['t1', 't2'] },
    { id: 'u2',  name: 'Bob Martinez',    email: 'bob.martinez@acme.com',    initials: 'BM', type: 'user',            role: 'member', status: 'active',   tenantIds: ['t1', 't2'] },
    { id: 'u3',  name: 'Carol Singh',     email: 'carol.singh@acme.com',     initials: 'CS', type: 'user',            role: 'member', status: 'active',   tenantIds: ['t1'] },
    { id: 'u6',  name: 'Frank Liu',       email: 'frank.liu@acme.com',       initials: 'FL', type: 'user',            role: 'member', status: 'active',   tenantIds: ['t1'] },
    { id: 'u8',  name: 'Henry Patel',     email: 'henry.patel@acme.com',     initials: 'HP', type: 'user',            role: 'member', status: 'inactive', tenantIds: ['t2'] },
    { id: 'u11', name: 'Karen Lee',       email: 'karen.lee@acme.com',       initials: 'KL', type: 'user',            role: 'member', status: 'active',   tenantIds: [] },
    { id: 'sa1', name: 'ci-pipeline-bot', email: 'ci-pipeline@svc.acme.com', initials: 'CI', type: 'service-account', role: 'member', status: 'active',   tenantIds: ['t1', 't2'] },
    { id: 'sa3', name: 'monitoring-svc',  email: 'monitoring@svc.acme.com',  initials: 'MS', type: 'service-account', role: 'member', status: 'active',   tenantIds: ['t1'] },
  ],
  o2: [
    { id: 'u4',  name: 'David Kim',      email: 'david.kim@acme.com',       initials: 'DK', type: 'user',            role: 'admin',  status: 'active', tenantIds: ['t1', 't2'] },
    { id: 'u5',  name: 'Eve Thompson',   email: 'eve.thompson@acme.com',    initials: 'ET', type: 'user',            role: 'member', status: 'active', tenantIds: ['t1'] },
    { id: 'u7',  name: 'Grace Okafor',   email: 'grace.okafor@acme.com',    initials: 'GO', type: 'user',            role: 'member', status: 'active', tenantIds: ['t1', 't2'] },
    { id: 'u9',  name: 'Irene Nakamura', email: 'irene.nakamura@acme.com',  initials: 'IN', type: 'user',            role: 'member', status: 'active', tenantIds: ['t2'] },
    { id: 'sa2', name: 'deploy-agent',   email: 'deploy-agent@svc.acme.com',initials: 'DA', type: 'service-account', role: 'member', status: 'active', tenantIds: ['t1', 't2'] },
  ],
};

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

// ─── Invite Org Members Dialog ────────────────────────────────────────────────

const InviteOrgMembersDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (invites: { email: string; role: 'member' | 'admin' }[]) => void;
}> = ({ open, onOpenChange, onInvite }) => {
  const [emailInput, setEmailInput] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');

  const parseEmails = (raw: string) =>
    raw.split(',').map(e => e.trim()).filter(e => e.includes('@') && e.includes('.'));

  const validEmails = parseEmails(emailInput);
  const canSubmit = validEmails.length > 0;

  const handleSubmit = () => {
    onInvite(validEmails.map(email => ({ email, role })));
    setEmailInput('');
    setRole('member');
    onOpenChange(false);
  };

  const reset = () => { setEmailInput(''); setRole('member'); };

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
          <div className="px-6 py-5">
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
                  <button className="flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors capitalize whitespace-nowrap shrink-0">
                    {role} <ChevronDown size={12} className="text-gray-8" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[120px] z-[60] animate-in fade-in slide-in-from-top-1 duration-150">
                    {(['member', 'admin'] as const).map(r => (
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
            </div>
            {validEmails.length > 1 && (
              <p className="mt-2 text-[11px] text-gray-9">{validEmails.length} addresses detected</p>
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

interface OrgMembersViewProps {
  orgId: string;
  tenants: Tenant[];
  onNavigateToTenantUsers: (tenantId: string) => void;
}

const OrgMembersView: React.FC<OrgMembersViewProps> = ({ orgId, tenants, onNavigateToTenantUsers }) => {
  const [members, setMembers] = useState<OrgMember[]>(MOCK_ORG_MEMBERS[orgId] ?? []);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (memberId: string, role: 'member' | 'admin') =>
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));

  const handleRemove = (memberId: string) =>
    setMembers(prev => prev.filter(m => m.id !== memberId));

  const handleInvite = (invites: { email: string; role: 'member' | 'admin' }[]) => {
    const newMembers: OrgMember[] = invites.map((inv, i) => {
      const parts = inv.email.split('@')[0].split('.');
      const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      const initials = parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
      return {
        id: `inv-${Date.now()}-${i}`, name, email: inv.email,
        initials, type: 'user' as const, role: inv.role, status: 'pending' as OrgMemberStatus, tenantIds: [],
      };
    });
    setMembers(prev => [...prev, ...newMembers]);
  };

  const tenantName = (id: string) => tenants.find(t => t.id === id)?.name ?? id;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-gray-4 shrink-0 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-6 bg-white max-w-[320px] flex-1">
          <Search size={13} className="text-gray-8 shrink-0" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
          />
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="h-8 px-3 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      <InviteOrgMembersDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={28} className="text-gray-6 mx-auto mb-3" />
            <p className="text-[13px] text-gray-9">{search ? 'No members match your search' : 'No members yet'}</p>
          </div>
        ) : (
          <div className="px-6 py-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-4">
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3">Identity</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3 w-[100px]">Status</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 pr-3 w-[110px]">Role</th>
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5">Tenants</th>
                  <th className="w-[40px]" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => {
                  const palette = AVATAR_PALETTES_ORG[hashStr(member.name) % AVATAR_PALETTES_ORG.length];
                  return (
                    <tr key={member.id} className="border-b border-gray-3 last:border-b-0 group">
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
                            <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-gray-10 hover:bg-gray-3 transition-colors capitalize">
                              {member.role} <ChevronDown size={11} className="text-gray-8" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="start" sideOffset={4} className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[120px] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                              {(['member', 'admin'] as const).map(r => (
                                <DropdownMenu.Item
                                  key={r}
                                  onClick={() => handleRoleChange(member.id, r)}
                                  className={cn('flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors capitalize',
                                    r === member.role ? 'text-[#5B5CE6] bg-[#0011FF08]' : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]'
                                  )}
                                >
                                  {r}
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
                            <span className="text-[12px] text-gray-8 italic">No tenants</span>
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
                                onClick={() => handleRemove(member.id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-11 hover:bg-gray-2 cursor-pointer outline-none transition-colors"
                              >
                                Deactivate User
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onClick={() => handleRemove(member.id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors"
                              >
                                Remove User
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
  onSetActiveView: (v: ManagementView) => void;
  onNavigateOrg: (orgId: string) => void;
  showUsers: boolean;
  tenants: Tenant[];
  onUpdateTenants: (tenants: Tenant[]) => void;
  isAdmin: boolean;
  headerStyle?: 'logo' | 'back-button';
  tenantCrudOnly?: boolean;
}

const ControlPlaneLeftSidebar: React.FC<ControlPlaneLeftSidebarProps> = ({ activeView, activeOrgId, onSetActiveView, onNavigateOrg, showUsers, tenants, onUpdateTenants, isAdmin, headerStyle = 'logo', tenantCrudOnly = false }) => {
  const [orgs, setOrgs] = useState<Org[]>(INITIAL_ORGS);
  const [activeTenantId, setActiveTenantId] = useState('t1');
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(['t1', 'o1']));
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
    <div className="pl-2 mt-0.5 space-y-0.5 border-l border-gray-5 ml-3">
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
    <div className="pl-2 mt-0.5 border-l border-gray-5 ml-3">
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
    const hideSubs = tenantCrudOnly && entityType === 'tenant';
    return (
      <div key={entity.id} className="mb-0.5">
        <div className="group/entity flex items-center">
          <button
            onClick={() => {
              if (!hideSubs) toggleAccordion(entity.id);
              if (entityType === 'tenant') setActiveTenantId(entity.id);
            }}
            className="flex-1 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-2 transition-colors min-w-0"
          >
            {!hideSubs && (
              <ChevronDown size={13} className={cn('text-gray-7 shrink-0 transition-transform duration-150', !openAccordions.has(entity.id) && '-rotate-90')} />
            )}
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
        {!hideSubs && openAccordions.has(entity.id) && (
          entityType === 'tenant' ? renderTenantNavItems(entity.id) : renderOrgNavItems(entity.id)
        )}
      </div>
    );
  };

  const SectionHeader: React.FC<{ label: string; icon: React.ReactNode; onAdd?: () => void; mt?: boolean }> = ({ label, icon, onAdd, mt }) => (
    <div className={cn('flex items-center justify-between pl-2 py-1 mb-0.5', mt && 'mt-3')}>
      <div className="flex items-center gap-1.5 text-gray-12">
        {icon}
        <span className="text-[13px] font-medium text-gray-12">{label}</span>
      </div>
      {onAdd && (
        <button onClick={onAdd} className="w-6 h-6 rounded flex items-center justify-center text-gray-10 hover:bg-gray-3 hover:text-gray-12 transition-colors mr-1 shrink-0">
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
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        {isAdmin && (
          <>
            <SectionHeader label="Orgs" icon={<Building2 size={13} />} onAdd={() => openDialog('org', 'create')} />
            {orgs.map(org => renderEntityRow(org, 'org'))}
          </>
        )}
        <SectionHeader label="Tenants" icon={<Layers size={13} />} onAdd={isAdmin ? () => openDialog('tenant', 'create') : undefined} mt={isAdmin} />
        {tenants.map(tenant => renderEntityRow(tenant, 'tenant', !isAdmin))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-gray-4 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0" style={{ background: BRAND_LIGHT, color: BRAND }}>C</div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-gray-12 truncate">César Neri</p>
            <p className="text-[11px] text-gray-9 truncate">cesar.neri@scale.com</p>
          </div>
        </div>
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
  tenants: Tenant[];
  onNavigateToTenantUsers: (tenantId: string) => void;
  isAdmin?: boolean;
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({ groups, onUpdateGroups, showUsers, groupsLayout, activeView, onSetActiveView, hideHeader, activeOrgId, onSetActiveOrgId, tenants, onNavigateToTenantUsers, isAdmin }) => {
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
          <h1 className="text-[20px] font-semibold text-gray-12">
            {activeView === 'groups' ? 'Groups'
              : activeView === 'users' ? 'Members'
              : activeView === 'roles' ? 'Roles'
              : 'Identities'}
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
          <OrgMembersView key={activeOrgId} orgId={activeOrgId} tenants={tenants} onNavigateToTenantUsers={onNavigateToTenantUsers} />
        </div>
      )}
      {activeView === 'users' && showUsers && (
        <div className="flex-1 bg-white min-h-0">
          <UsersManagement onNavigateToGroup={handleNavigateToGroup} onNavigateToOrg={handleNavigateToOrg} isAdmin={isAdmin} />
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
    { App: 'IAM Dashboard', isAdmin: true, tenantCrudOnly: false },
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
  const [activeView, setActiveView] = useState<ManagementView>('groups');
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
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
              onSetActiveView={setActiveView}
              onNavigateOrg={(orgId) => { setActiveOrgId(orgId); setActiveView('org-members'); }}
              showUsers={showUsers}
              tenants={tenants}
              onUpdateTenants={setTenants}
              isAdmin={isAdmin}
              headerStyle={headerStyle}
              tenantCrudOnly={params.tenantCrudOnly as boolean}
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
