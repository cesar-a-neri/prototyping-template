import React, { useState } from 'react';
import {
  Users, Search, MoreHorizontal, Pencil, Trash2, X, Plus,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import type { Group } from './data';

// ─── Create / Rename Dialog ───────────────────────────────────────────────────

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'rename';
  initialName?: string;
  initialDescription?: string;
  onSubmit: (name: string, description: string) => void;
}

export const GroupFormDialog: React.FC<GroupFormDialogProps> = ({
  open, onOpenChange, mode, initialName = '', initialDescription = '', onSubmit,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  React.useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
    }
  }, [open, initialName, initialDescription]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[440px] p-0 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-[16px] font-semibold text-gray-12">
                  {mode === 'create' ? 'Create Group' : 'Rename Group'}
                </Dialog.Title>
                <Dialog.Description className="text-[13px] text-gray-9 mt-1">
                  {mode === 'create'
                    ? 'Create a new group to organize users and manage access collectively.'
                    : 'Change the name or description of this group.'}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors -mr-1 -mt-1">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <div className="px-6 pb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-11">Group name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Platform Engineering"
                className="h-9 px-3 rounded-lg border border-gray-6 text-[13px] text-gray-12 placeholder:text-gray-8 outline-none focus:ring-2 focus:ring-[#5B5CE6] focus:border-transparent transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-11">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe this group's purpose..."
                rows={2}
                className="px-3 py-2 rounded-lg border border-gray-6 text-[13px] text-gray-12 placeholder:text-gray-8 outline-none focus:ring-2 focus:ring-[#5B5CE6] focus:border-transparent transition-shadow resize-none"
              />
            </div>
          </div>
          <div className="px-6 pb-6 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              disabled={!name.trim()}
              onClick={() => { onSubmit(name.trim(), description.trim()); onOpenChange(false); }}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'create' ? 'Create Group' : 'Save Changes'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Delete Confirmation ──────────────────────────────────────────────────────

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
  onConfirm: () => void;
}

const DeleteGroupDialog: React.FC<DeleteGroupDialogProps> = ({ open, onOpenChange, group, onConfirm }) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
      <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[440px] p-0 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-start justify-between">
            <AlertDialog.Title className="text-[16px] font-semibold text-gray-12">
              Delete "{group?.name}"?
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
                All <span className="font-semibold">{group?.accessBindings.length ?? 0} access binding{(group?.accessBindings.length ?? 0) !== 1 ? 's' : ''}</span> associated
                with this group will be removed and members will lose any access granted through this group.
              </p>
              {group && group.members.length > 0 && (
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
              onClick={onConfirm}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-red-9 hover:bg-red-10 transition-colors"
            >
              Delete Group
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

// ─── Group List ───────────────────────────────────────────────────────────────

interface GroupManagementProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onCreateGroup: (name: string, description: string) => void;
  onRenameGroup: (id: string, name: string, description: string) => void;
  onDeleteGroup: (id: string) => void;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
  groups, selectedGroupId, onSelectGroup, onCreateGroup, onRenameGroup, onDeleteGroup,
}) => {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetGroup, setTargetGroup] = useState<Group | null>(null);

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-4">
        <div className="mb-3">
          <h2 className="text-[14px] font-semibold text-gray-12">Groups</h2>
        </div>
        <div className="flex items-center gap-2 px-2.5 h-8 rounded-lg border border-gray-6 bg-white">
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

      {/* Group List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Users size={24} className="text-gray-7 mx-auto mb-2" />
            <p className="text-[13px] text-gray-9">
              {search ? 'No groups match your search' : 'No groups yet'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((group, idx) => (
                <div key={group.id}>
                  {idx > 0 && <div className="h-px bg-gray-4 mx-5" />}
                  <div
                    onClick={() => onSelectGroup(group.id)}
                    className={cn(
                      'group flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors',
                      selectedGroupId === group.id
                        ? 'bg-[#0011FF08]'
                        : 'hover:bg-gray-2',
                    )}
                  >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-[13px] font-medium truncate',
                        selectedGroupId === group.id ? 'text-[#2E1E71]' : 'text-gray-12',
                      )}>
                        {group.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-9 mt-0.5 block">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
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
                  </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="px-4 py-3 border-t border-gray-4 shrink-0">
        <button
          onClick={() => setCreateOpen(true)}
          className="w-full h-9 rounded-lg text-[13px] font-medium text-[#5B5CE6] border border-[#5B5CE6] bg-white hover:bg-[#0011FF08] transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          Create Group
        </button>
      </div>

      {/* Create Dialog */}
      <GroupFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={onCreateGroup}
      />

      {/* Rename Dialog */}
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

      {/* Delete Confirmation */}
      <DeleteGroupDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        group={targetGroup}
        onConfirm={() => {
          if (targetGroup) onDeleteGroup(targetGroup.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
};
