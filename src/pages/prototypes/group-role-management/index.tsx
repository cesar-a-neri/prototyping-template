import React, { useState, useRef, useCallback } from 'react';
import {
  Users, Settings, LogOut, KeyRound, Plus, BookOpen,
  ArrowLeft, Search, MoreHorizontal, Pencil, Trash2,
} from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { useTweakpane } from '@/lib/tweakpane';
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
}

const GroupsTableView: React.FC<GroupsTableViewProps> = ({ groups, onSelectGroup, onRenameGroup, onDeleteGroup }) => {
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
      <div className="px-6 py-3 border-b border-gray-4 shrink-0">
        <div className="flex items-center gap-2 px-3 h-8 rounded-lg border border-gray-6 bg-white max-w-[320px]">
          <Search size={13} className="text-gray-8 shrink-0" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
          />
        </div>
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
                  <th className="text-left text-[11px] font-medium text-gray-9 uppercase tracking-wider pb-2.5 w-[120px]">Created</th>
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
                      <span className="text-[12px] text-gray-9">{group.createdAt}</span>
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

// ─── Management Shell (Full-Page Panel) ───────────────────────────────────────

type ManagementView = 'groups' | 'roles' | 'users';

type GroupsLayout = 'sidebar' | 'full-page';

interface ManagementPanelProps {
  groups: Group[];
  onUpdateGroups: (groups: Group[]) => void;
  showUsers: boolean;
  groupsLayout: GroupsLayout;
}

const ManagementPanel: React.FC<ManagementPanelProps> = ({ groups, onUpdateGroups, showUsers, groupsLayout }) => {
  const [activeView, setActiveView] = useState<ManagementView>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    groupsLayout === 'sidebar' ? (groups[0]?.id ?? null) : null
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  React.useEffect(() => {
    if (!showUsers && activeView === 'users') setActiveView('groups');
  }, [showUsers, activeView]);

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
      setActiveView('groups');
      setSelectedGroupId(target.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-1">
      {/* Page header */}
      <div className="bg-white shrink-0">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-gray-12">Access Management</h1>
            <p className="text-[13px] text-gray-9 mt-0.5">Manage groups, roles, and user access for your tenant.</p>
          </div>
          <div className="flex items-center gap-2">
            {activeView === 'groups' && groupsLayout === 'full-page' && !selectedGroupId && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-8 px-3 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} />
                New Group
              </button>
            )}
          </div>
        </div>
        <div className="px-6 border-b border-gray-4">
          <Tabs.Root value={activeView} onValueChange={(v) => setActiveView(v as ManagementView)}>
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
                  Users
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
            />
          )}
        </div>
      )}
      {activeView === 'roles' && (
        <div className="flex-1 bg-white min-h-0">
          <RoleReference />
        </div>
      )}
      {activeView === 'users' && showUsers && (
        <div className="flex-1 bg-white min-h-0">
          <UsersManagement onNavigateToGroup={handleNavigateToGroup} />
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
  const { params } = useTweakpane(
    { showUsersTab: true, groupsLayout: 'sidebar' },
    { groupsLayout: { options: { 'Sidebar': 'sidebar', 'Full Page': 'full-page' } } },
  );
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const navRef = useRef<HTMLDivElement>(null);

  const closeMenus = useCallback(() => setOpenMenu(null), []);
  useOutsideClick(navRef, closeMenus);

  const toggle = (id: string) => setOpenMenu(p => (p === id ? null : id));

  return (
    <ShowIconsContext.Provider value={true}>
      <ShowDescriptionsContext.Provider value={true}>
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
            showUsers={params.showUsersTab as boolean}
            groupsLayout={params.groupsLayout as GroupsLayout}
          />
        </div>
      </ShowDescriptionsContext.Provider>
    </ShowIconsContext.Provider>
  );
};

export const title = 'Group & Role Management';
export const route = '/group-role-management';

export default GroupRoleManagement;
