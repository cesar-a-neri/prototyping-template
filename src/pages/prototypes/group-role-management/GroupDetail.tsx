import React, { useState } from 'react';
import {
  UserPlus, UserMinus, ShieldCheck, Pencil, MoreHorizontal, Trash2,
  Search, Brain, Cpu, Plug, LayoutDashboard, Wrench,
  ChevronDown, X, Check, Upload, FileText, Mail, ArrowLeft, Filter,
} from 'lucide-react';
import { HexagonNodes, WorkflowIcon, EvaluationsIcon } from '../sgp-nav/SgpNav';
import * as Tabs from '@radix-ui/react-tabs';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import type { Group, GroupMember, User, RoleName } from './data';
import { MOCK_USERS, ROLE_DEFINITIONS } from './data';

// ─── Resource Type Icons ──────────────────────────────────────────────────────

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  'Agent': HexagonNodes,
  'Knowledge Base': Brain as React.ElementType,
  'Model': Cpu,
  'Connector': Plug,
  'Evaluation': EvaluationsIcon,
  'Dashboard': LayoutDashboard,
  'Workflow': WorkflowIcon,
  'Tool': Wrench,
};

// ─── Role Selector (inline dropdown for access bindings) ─────────────────────

const RoleSelector: React.FC<{ role: RoleName; onChange: (role: RoleName) => void }> = ({ role, onChange }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-gray-10 hover:bg-gray-3 transition-colors">
        {role}
        <ChevronDown size={12} className="text-gray-8" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="start"
        sideOffset={4}
        className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[140px] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
      >
        {ROLE_DEFINITIONS.map(r => (
          <DropdownMenu.Item
            key={r.name}
            onClick={() => onChange(r.name)}
            className={cn(
              'flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
              r.name === role
                ? 'text-[#5B5CE6] bg-[#0011FF08]'
                : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]',
            )}
          >
            {r.name}
            {r.name === role && <Check size={13} className="text-[#5B5CE6]" />}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);

// ─── Member Avatar ────────────────────────────────────────────────────────────

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

const MemberAvatar: React.FC<{ member: User | GroupMember; size?: 'sm' | 'md' }> = ({ member, size = 'md' }) => {
  const isService = member.type === 'service-account';
  const dim = size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-8 h-8 text-[12px]';
  const palette = AVATAR_PALETTES[hashName(member.name) % AVATAR_PALETTES.length];
  return (
    <div className={cn(
      dim, 'rounded-full flex items-center justify-center font-medium shrink-0',
      isService ? 'bg-gray-3 text-gray-10' : `${palette.bg} ${palette.text}`,
    )}>
      {member.initials}
    </div>
  );
};

// ─── Add Members Dialog ───────────────────────────────────────────────────────

type AddMode = null | 'existing' | 'new';
type AddMethod = null | 'select' | 'csv';

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMemberIds: string[];
  onAdd: (userIds: string[], role: 'owner' | 'member') => void;
  initialMode?: AddMode;
}

const CSV_EXISTING_INSTRUCTIONS = 'Include these headers in the first row:\nemail (or user_id), account_role (optional)';
const CSV_NEW_INSTRUCTIONS = 'Include these headers in the first row:\nemail, first_name (optional), last_name (optional), phone_number (optional), secondary_email (optional), account_role (optional)';

export const AddMembersDialog: React.FC<AddMembersDialogProps> = ({ open, onOpenChange, existingMemberIds, onAdd, initialMode }) => {
  const [mode, setMode] = useState<AddMode>(initialMode ?? null);
  const [method, setMethod] = useState<AddMethod>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'member'>('member');
  const [csvContent, setCsvContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) { setMode(initialMode ?? null); setMethod(null); setSearch(''); setSelected([]); setSelectedRole('member'); setCsvContent(''); }
  }, [open, initialMode]);

  const available = MOCK_USERS.filter(u => !existingMemberIds.includes(u.id));
  const filtered = available.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const goBack = () => {
    if (method) { setMethod(null); setCsvContent(''); }
    else if (!initialMode) { setMode(null); }
  };

  const canGoBack = method !== null || (!initialMode && mode !== null);

  const canSubmit = () => {
    if (method === 'select') return selected.length > 0;
    if (method === 'csv') return csvContent.trim().length > 0;
    return false;
  };

  const handleSubmit = () => {
    if (method === 'select') {
      onAdd(selected, selectedRole);
    }
    onOpenChange(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === 'text/csv' || file?.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (ev) => setCsvContent(ev.target?.result as string ?? '');
      reader.readAsText(file);
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setCsvContent(ev.target?.result as string ?? '');
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const renderModeSelection = () => (
    <div className="px-6 pb-6 space-y-2">
      <button
        onClick={() => setMode('existing')}
        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border border-gray-5 hover:border-[#5B5CE6] hover:bg-[#0011FF04] transition-all text-left group"
      >
        <div className="w-10 h-10 rounded-lg bg-[#EEEEFF] flex items-center justify-center shrink-0">
          <UserPlus size={18} className="text-[#5B5CE6]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-12 group-hover:text-[#5B5CE6] transition-colors">Add existing users</p>
          <p className="text-[12px] text-gray-9 mt-0.5">Search and select users already in this tenant</p>
        </div>
      </button>
      <button
        onClick={() => setMode('new')}
        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border border-gray-5 hover:border-[#5B5CE6] hover:bg-[#0011FF04] transition-all text-left group"
      >
        <div className="w-10 h-10 rounded-lg bg-[#EEEEFF] flex items-center justify-center shrink-0">
          <Mail size={18} className="text-[#5B5CE6]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-12 group-hover:text-[#5B5CE6] transition-colors">Invite new users</p>
          <p className="text-[12px] text-gray-9 mt-0.5">Add users who don't have an account yet</p>
        </div>
      </button>
    </div>
  );

  const renderMethodSelection = () => (
    <div className="px-6 pb-6 space-y-2">
      {mode === 'existing' && (
        <button
          onClick={() => setMethod('select')}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border border-gray-5 hover:border-[#5B5CE6] hover:bg-[#0011FF04] transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-gray-3 flex items-center justify-center shrink-0">
            <Search size={16} className="text-gray-10" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-12 group-hover:text-[#5B5CE6] transition-colors">Search & select</p>
            <p className="text-[12px] text-gray-9 mt-0.5">Browse and pick from existing users</p>
          </div>
        </button>
      )}
      <button
        onClick={() => setMethod('csv')}
        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border border-gray-5 hover:border-[#5B5CE6] hover:bg-[#0011FF04] transition-all text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-gray-3 flex items-center justify-center shrink-0">
          <FileText size={16} className="text-gray-10" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-12 group-hover:text-[#5B5CE6] transition-colors">Upload CSV</p>
          <p className="text-[12px] text-gray-9 mt-0.5">Bulk add via CSV file</p>
        </div>
      </button>
    </div>
  );

  const renderSelectView = () => (
    <>
      <div className="px-6 pb-3">
        <div className="flex items-center gap-2">
          <div
            onClick={() => searchInputRef.current?.focus()}
            className={cn(
              'flex-1 flex flex-wrap items-center gap-1.5 px-3 min-h-[36px] py-1.5 rounded-lg border bg-white cursor-text transition-colors',
              selected.length > 0 ? 'border-[#5B5CE6]' : 'border-gray-6',
            )}
          >
            <Search size={14} className="text-gray-8 shrink-0" />
            {selected.map(id => {
              const u = MOCK_USERS.find(u => u.id === id)!;
              return (
                <span key={id} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-[#EEEEFF] text-[#5B5CE6] text-[12px] font-medium whitespace-nowrap">
                  {u.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(id); }}
                    className="w-4 h-4 rounded flex items-center justify-center hover:bg-[#5B5CE6]/10 hover:text-[#2E1E71] transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
            <input
              ref={searchInputRef}
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !search && selected.length > 0) {
                  setSelected(prev => prev.slice(0, -1));
                }
              }}
              placeholder={selected.length === 0 ? 'Search by name or email...' : ''}
              className="flex-1 min-w-[80px] bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none py-0.5"
            />
          </div>
          {selected.length > 0 && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-6 bg-white text-[13px] font-medium text-gray-11 hover:bg-gray-2 transition-colors whitespace-nowrap shrink-0">
                  {selectedRole === 'owner' ? 'Owner' : 'Member'}
                  <ChevronDown size={13} className="text-gray-8" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={4}
                  className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[140px] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {(['member', 'owner'] as const).map(r => (
                    <DropdownMenu.Item
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={cn(
                        'flex items-center justify-between px-3 py-1.5 text-[13px] cursor-pointer outline-none transition-colors',
                        r === selectedRole
                          ? 'text-[#5B5CE6] bg-[#0011FF08]'
                          : 'text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71]',
                      )}
                    >
                      {r === 'owner' ? 'Owner' : 'Member'}
                      {r === selectedRole && <Check size={13} className="text-[#5B5CE6]" />}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>
      <ScrollArea.Root className="h-[240px]">
        <ScrollArea.Viewport className="h-full w-full px-6">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-gray-9">
              {available.length === 0 ? 'All users are already members' : 'No results found'}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map(user => (
                <button
                  key={user.id}
                  onClick={() => toggle(user.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                    selected.includes(user.id) ? 'bg-[#0011FF08]' : 'hover:bg-gray-2',
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    selected.includes(user.id)
                      ? 'bg-[#5B5CE6] border-[#5B5CE6]'
                      : 'border-gray-7',
                  )}>
                    {selected.includes(user.id) && <Check size={12} className="text-white" />}
                  </div>
                  <MemberAvatar member={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-12 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-9 truncate">{user.email}</p>
                  </div>
                  {user.type === 'service-account' && (
                    <span className="text-[10px] font-medium text-gray-10 bg-gray-3 px-1.5 py-0.5 rounded">
                      Service Account
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="w-2 p-0.5">
          <ScrollArea.Thumb className="bg-gray-6 rounded-full" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </>
  );

  const renderCsvView = () => {
    const instructions = mode === 'existing' ? CSV_EXISTING_INSTRUCTIONS : CSV_NEW_INSTRUCTIONS;
    return (
      <div className="px-6 pb-4">
        <div className="bg-gray-2 rounded-lg px-3 py-2.5 mb-3 border border-gray-4">
          <p className="text-[11px] font-medium text-gray-10 mb-1">CSV format</p>
          <pre className="text-[11px] text-gray-11 font-mono whitespace-pre-wrap leading-relaxed">{instructions}</pre>
        </div>
        {csvContent ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-6 bg-green-2">
              <FileText size={14} className="text-green-10 shrink-0" />
              <span className="text-[12px] text-green-11 font-medium flex-1">CSV loaded ({csvContent.split('\n').filter(Boolean).length} rows)</span>
              <button onClick={() => setCsvContent('')} className="text-gray-9 hover:text-gray-12 transition-colors">
                <X size={14} />
              </button>
            </div>
            <ScrollArea.Root className="h-[120px]">
              <ScrollArea.Viewport className="h-full w-full">
                <pre className="text-[11px] text-gray-10 font-mono whitespace-pre px-1">{csvContent}</pre>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" className="w-2 p-0.5">
                <ScrollArea.Thumb className="bg-gray-6 rounded-full" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={handleFileSelect}
            className={cn(
              'border-2 border-dashed rounded-lg px-6 py-8 text-center cursor-pointer transition-colors',
              dragOver ? 'border-[#5B5CE6] bg-[#0011FF08]' : 'border-gray-5 hover:border-gray-7',
            )}
          >
            <Upload size={24} className="text-gray-7 mx-auto mb-2" />
            <p className="text-[13px] font-medium text-gray-11">
              Drop a CSV file here or <span className="text-[#5B5CE6]">browse</span>
            </p>
            <p className="text-[11px] text-gray-8 mt-1">Accepts .csv files</p>
          </div>
        )}
      </div>
    );
  };

  const title = !mode
    ? 'Add Members'
    : !method
      ? mode === 'existing' ? 'Add Existing Users' : 'Invite New Users'
      : method === 'select' ? 'Search & Select'
        : 'Upload CSV';

  const subtitle = !mode
    ? 'Choose how you want to add members to this group.'
    : !method
      ? mode === 'existing'
        ? 'Choose a method to add existing users.'
        : 'Choose a method to invite new users.'
      : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[520px] p-0 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
          <div className="px-6 pt-6 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {canGoBack && (
                  <button onClick={goBack} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -ml-1">
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <Dialog.Title className="text-[16px] font-semibold text-gray-12">{title}</Dialog.Title>
                  {subtitle && (
                    <Dialog.Description className="text-[13px] text-gray-9 mt-0.5">{subtitle}</Dialog.Description>
                  )}
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {!mode && renderModeSelection()}
          {mode && !method && renderMethodSelection()}
          {method === 'select' && renderSelectView()}
          {method === 'csv' && renderCsvView()}

          {method && (
            <div className="px-6 py-4 border-t border-gray-4 flex items-center justify-between">
              <span className="text-[12px] text-gray-9">
                {method === 'select' && `${selected.length} selected as ${selectedRole}`}
                {method === 'csv' && (csvContent ? `${csvContent.split('\n').filter(Boolean).length} rows` : 'No file')}
              </span>
              <div className="flex items-center gap-2">
                <Dialog.Close asChild>
                  <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  disabled={!canSubmit()}
                  onClick={handleSubmit}
                  className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {mode === 'existing' ? 'Add Members' : 'Send Invites'}
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Remove Member Confirmation ───────────────────────────────────────────────

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: GroupMember | null;
  onConfirm: () => void;
}

const RemoveMemberDialog: React.FC<RemoveMemberDialogProps> = ({ open, onOpenChange, member, onConfirm }) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
      <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[400px] p-6 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
        <div className="flex items-start justify-between pb-4">
          <AlertDialog.Title className="text-[16px] font-semibold text-gray-12">
            Remove member?
          </AlertDialog.Title>
          <AlertDialog.Cancel asChild>
            <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
              <X size={16} />
            </button>
          </AlertDialog.Cancel>
        </div>
        <AlertDialog.Description className="text-[13px] text-gray-12 mt-2 leading-relaxed">
          <span className="font-semibold">{member?.name}</span> will be removed from this group
          and will lose any access granted through group membership.
        </AlertDialog.Description>
        <div className="flex items-center justify-end gap-2 mt-5">
          <AlertDialog.Cancel asChild>
            <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">
              Cancel
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button onClick={onConfirm} className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-red-9 hover:bg-red-10 transition-colors">
              Remove
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

// ─── Group Detail Panel ───────────────────────────────────────────────────────

interface GroupDetailProps {
  group: Group;
  onUpdateGroup: (updated: Group) => void;
  onEditGroup?: () => void;
  onDeleteGroup?: () => void;
}

export const GroupDetail: React.FC<GroupDetailProps> = ({ group, onUpdateGroup, onEditGroup, onDeleteGroup }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeMember, setRemoveMember] = useState<GroupMember | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [accessSearch, setAccessSearch] = useState('');
  const [accessResourceFilters, setAccessResourceFilters] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);

  const owners = group.members.filter(m => m.role === 'owner');

  const filteredMembers = group.members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const accessResourceTypes = [...new Set(group.accessBindings.map(b => b.resourceType))];

  const toggleResourceFilter = (rt: string) => {
    setAccessResourceFilters(prev => {
      const next = new Set(prev);
      if (next.has(rt)) next.delete(rt);
      else next.add(rt);
      return next;
    });
  };

  const filteredBindings = group.accessBindings.filter(b => {
    if (accessResourceFilters.size > 0 && !accessResourceFilters.has(b.resourceType)) return false;
    if (!accessSearch) return true;
    const q = accessSearch.toLowerCase();
    return b.resourceName.toLowerCase().includes(q) || b.resourceType.toLowerCase().includes(q);
  });

  const handleAddMembers = (userIds: string[], role: 'owner' | 'member') => {
    const newMembers: GroupMember[] = userIds.map(id => {
      const u = MOCK_USERS.find(u => u.id === id)!;
      return { ...u, role, addedAt: new Date().toISOString().split('T')[0] };
    });
    onUpdateGroup({ ...group, members: [...group.members, ...newMembers] });
  };

  const handleRemoveMember = () => {
    if (!removeMember) return;
    onUpdateGroup({ ...group, members: group.members.filter(m => m.id !== removeMember.id) });
    setRemoveOpen(false);
  };

  const handleChangeRole = (memberId: string, role: 'owner' | 'member') => {
    onUpdateGroup({
      ...group,
      members: group.members.map(m =>
        m.id === memberId ? { ...m, role } : m
      ),
    });
  };

  const handleChangeBindingRole = (bindingId: string, newRole: RoleName) => {
    onUpdateGroup({
      ...group,
      accessBindings: group.accessBindings.map(b =>
        b.id === bindingId ? { ...b, role: newRole } : b
      ),
    });
  };

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-gray-12">{group.name}</h2>
            <div className="flex items-center gap-1.5">
              {onEditGroup && (
                <button
                  onClick={onEditGroup}
                  className="h-7 px-2.5 rounded-md text-[12px] font-medium text-[#5B5CE6] border border-[#5B5CE6] bg-white hover:bg-[#0011FF08] transition-colors flex items-center gap-1.5"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              )}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 border border-gray-6 hover:bg-gray-2 hover:text-gray-11 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={4}
                    className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <DropdownMenu.Item
                      onClick={() => setDeleteOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors"
                    >
                      <Trash2 size={13} />
                      Delete Group
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
          {group.description && (
            <p className="text-[13px] text-gray-9 mt-1">{group.description}</p>
          )}
        </div>

        {/* Tabs */}
        <Tabs.Root defaultValue="members" className="flex-1 flex flex-col min-h-0">
          <Tabs.List className="flex items-center gap-0 px-6 border-b border-gray-4 shrink-0">
            {[
              { value: 'members', label: 'Members', count: group.members.length },
              { value: 'access', label: 'Access', count: group.accessBindings.length },
            ].map(tab => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'px-3 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px',
                  'data-[state=active]:text-[#5B5CE6] data-[state=active]:border-[#5B5CE6]',
                  'data-[state=inactive]:text-gray-9 data-[state=inactive]:border-transparent data-[state=inactive]:hover:text-gray-11',
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-[11px] bg-gray-3 px-1.5 py-0.5 rounded font-medium">
                  {tab.count}
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Members Tab */}
          <Tabs.Content value="members" forceMount className="flex-1 flex flex-col min-h-0 outline-none data-[state=inactive]:hidden">
            <div className="px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 px-2.5 h-8 rounded-lg border border-gray-6 bg-white w-[240px]">
                <Search size={13} className="text-gray-8 shrink-0" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
                />
              </div>
              <button
                onClick={() => setAddOpen(true)}
                className="h-8 px-3 rounded-lg text-[13px] font-medium text-[#5B5CE6] border border-[#5B5CE6] bg-white hover:bg-[#0011FF08] transition-colors flex items-center gap-1.5"
              >
                <UserPlus size={14} />
                Add Members
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {group.members.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <UserPlus size={28} className="text-gray-6 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-9 font-medium">No members yet</p>
                  <p className="text-[12px] text-gray-8 mt-1">Add users or service accounts to this group to get started.</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Search size={28} className="text-gray-6 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-9">No members match your search</p>
                </div>
              ) : (
                <div className="px-6">
                  {filteredMembers.map(member => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      isOnlyOwner={owners.length === 1 && member.role === 'owner'}
                      onChangeRole={(role) => handleChangeRole(member.id, role)}
                      onRemove={() => { setRemoveMember(member); setRemoveOpen(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          </Tabs.Content>

          {/* Access Tab */}
          <Tabs.Content value="access" forceMount className="flex-1 flex flex-col min-h-0 outline-none data-[state=inactive]:hidden">
            {group.accessBindings.length > 0 && (
              <div className="px-6 py-3 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 px-2.5 h-8 rounded-lg border border-gray-6 bg-white w-[240px]">
                  <Search size={13} className="text-gray-8 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={accessSearch}
                    onChange={(e) => setAccessSearch(e.target.value)}
                    className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
                  />
                </div>
                {accessResourceTypes.length > 1 && (
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button className={cn(
                        'flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[12px] font-medium transition-colors',
                        accessResourceFilters.size > 0
                          ? 'border-[#5B5CE6] bg-[#0011FF08] text-[#5B5CE6]'
                          : 'border-gray-6 text-gray-9 hover:text-gray-11 hover:border-gray-7',
                      )}>
                        <Filter size={13} />
                        Resource Type
                        {accessResourceFilters.size > 0 && (
                          <span className="bg-[#5B5CE6] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                            {accessResourceFilters.size}
                          </span>
                        )}
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        align="start"
                        sideOffset={4}
                        className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[200px] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        {accessResourceTypes.map(rt => {
                          const Icon = RESOURCE_ICONS[rt] ?? ShieldCheck;
                          const isSelected = accessResourceFilters.has(rt);
                          return (
                            <button
                              key={rt}
                              onClick={() => toggleResourceFilter(rt)}
                              className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors text-left',
                                isSelected ? 'bg-[#0011FF08] text-[#2E1E71]' : 'text-gray-11 hover:bg-gray-2',
                              )}
                            >
                              <div className={cn(
                                'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0',
                                isSelected ? 'bg-[#5B5CE6] border-[#5B5CE6]' : 'border-gray-7',
                              )}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>
                              <Icon size={13} className={isSelected ? 'text-[#5B5CE6]' : 'text-gray-9'} />
                              {rt}
                            </button>
                          );
                        })}
                        {accessResourceFilters.size > 0 && (
                          <>
                            <div className="h-px bg-gray-4 my-1" />
                            <button
                              onClick={() => setAccessResourceFilters(new Set())}
                              className="w-full px-3 py-1.5 text-[12px] text-gray-9 hover:text-gray-11 transition-colors text-left"
                            >
                              Clear filters
                            </button>
                          </>
                        )}
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                )}
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {group.accessBindings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <ShieldCheck size={28} className="text-gray-6 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-9">No access bindings for this group</p>
                  <p className="text-[12px] text-gray-8 mt-1">Grant access to resources to see them listed here.</p>
                </div>
              ) : filteredBindings.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Search size={28} className="text-gray-6 mx-auto mb-3" />
                  <p className="text-[13px] text-gray-9">No access bindings match your search</p>
                </div>
              ) : (
                <div className="px-6 py-3">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-4">
                        <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2 pr-3">Resource</th>
                        <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2 pr-3">Role</th>
                        <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2">Granted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBindings.map(binding => {
                        const Icon = RESOURCE_ICONS[binding.resourceType] ?? ShieldCheck;
                        return (
                          <tr key={binding.id} className="border-b border-gray-3 last:border-b-0">
                            <td className="py-2.5 pr-3">
                              <button
                                className="flex items-center gap-2 group/resource"
                                onClick={() => window.alert(`Navigate to ${binding.resourceType}: ${binding.resourceName}`)}
                              >
                                <div className="w-7 h-7 rounded-md bg-gray-3 flex items-center justify-center text-gray-10">
                                  <Icon size={14} />
                                </div>
                                <div className="text-left">
                                  <p className="text-[13px] font-medium text-gray-12 group-hover/resource:text-[#5B5CE6] transition-colors">{binding.resourceName}</p>
                                  <p className="text-[11px] text-gray-9">{binding.resourceType}</p>
                                </div>
                              </button>
                            </td>
                            <td className="py-2.5 pr-3">
                              <RoleSelector role={binding.role} onChange={(r) => handleChangeBindingRole(binding.id, r)} />
                            </td>
                            <td className="py-2.5">
                              <span className="text-[12px] text-gray-9">{binding.grantedAt}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>

        {/* Dialogs */}
        <AddMembersDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          existingMemberIds={group.members.map(m => m.id)}
          onAdd={handleAddMembers}
        />
        <RemoveMemberDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          member={removeMember}
          onConfirm={handleRemoveMember}
        />

        {/* Delete Group Confirmation */}
        <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[440px] p-0 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-start justify-between">
                  <AlertDialog.Title className="text-[16px] font-semibold text-gray-12">
                    Delete "{group.name}"?
                  </AlertDialog.Title>
                  <AlertDialog.Cancel asChild>
                    <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                      <X size={16} />
                    </button>
                  </AlertDialog.Cancel>
                </div>
                <AlertDialog.Description asChild>
                  <div className="mt-2 space-y-2">
                    <p className="text-[13px] text-gray-12 leading-relaxed">
                      This action is <span className="font-semibold">permanent</span> and cannot be undone.
                      All <span className="font-semibold">{group.accessBindings.length} access binding{group.accessBindings.length !== 1 ? 's' : ''}</span> associated
                      with this group will be removed and members will lose any access granted through this group.
                    </p>
                    {group.members.length > 0 && (
                      <p className="text-[13px] text-gray-12 leading-relaxed">
                        This group currently has <span className="font-semibold">{group.members.length}</span> member{group.members.length !== 1 ? 's' : ''} and
                        grants access to <span className="font-semibold">{group.accessBindings.length}</span> resource{group.accessBindings.length !== 1 ? 's' : ''}.
                      </p>
                    )}
                  </div>
                </AlertDialog.Description>
              </div>
              <div className="px-6 pb-6 pt-3 flex items-center justify-end gap-2">
                <AlertDialog.Cancel asChild>
                  <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={() => { onDeleteGroup?.(); setDeleteOpen(false); }}
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
    </Tooltip.Provider>
  );
};

// ─── Member Row ───────────────────────────────────────────────────────────────

interface MemberRowProps {
  member: GroupMember;
  isOnlyOwner: boolean;
  onChangeRole: (role: 'owner' | 'member') => void;
  onRemove: () => void;
}

const MemberRow: React.FC<MemberRowProps> = ({ member, isOnlyOwner, onChangeRole, onRemove }) => (
  <div className="group flex items-center gap-3 px-1 py-2 rounded-lg hover:bg-gray-2 transition-colors">
    <MemberAvatar member={member} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium text-gray-12 truncate">{member.name}</span>
        {member.type === 'service-account' && (
          <span className="text-[10px] font-medium text-gray-10 bg-gray-3 px-1.5 py-0.5 rounded shrink-0">
            Service
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-9 truncate">{member.email}</p>
    </div>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-gray-10 hover:bg-gray-4 group-hover:bg-gray-3 transition-colors">
          {member.role === 'owner' ? 'Owner' : 'Member'}
          <ChevronDown size={12} className="text-gray-8" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <DropdownMenu.Item
            onClick={() => onChangeRole('owner')}
            disabled={member.role === 'owner'}
            className="flex items-center justify-between px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors data-[disabled]:opacity-60 data-[disabled]:cursor-default"
          >
            Owner
            {member.role === 'owner' && <Check size={13} className="text-[#5B5CE6]" />}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => onChangeRole('member')}
            disabled={isOnlyOwner || member.role === 'member'}
            className="flex items-center justify-between px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors data-[disabled]:opacity-60 data-[disabled]:cursor-default"
          >
            Member
            {member.role === 'member' && <Check size={13} className="text-[#5B5CE6]" />}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-4 my-1" />
          <DropdownMenu.Item
            disabled={isOnlyOwner}
            onClick={onRemove}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-10 hover:bg-red-2 cursor-pointer outline-none transition-colors data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
          >
            <UserMinus size={13} />
            Remove
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
);
