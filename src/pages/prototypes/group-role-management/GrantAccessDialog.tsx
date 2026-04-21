import React, { useState } from 'react';
import { Search, ChevronDown, Info, Check, ShieldCheck, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { ROLE_DEFINITIONS, RESOURCE_TYPES, ALL_PERMISSIONS, type RoleName, type ResourceType } from './data';

// ─── Role Selector with In-Flow Descriptions ─────────────────────────────────

interface RoleSelectorProps {
  value: RoleName | '';
  onChange: (role: RoleName) => void;
  resourceType: ResourceType;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, resourceType }) => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip.Provider delayDuration={200}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              'flex items-center justify-between w-full h-9 px-3 rounded-lg border text-[13px] transition-colors',
              value
                ? 'border-gray-6 text-gray-12'
                : 'border-gray-6 text-gray-8',
              'hover:border-gray-8 focus:ring-2 focus:ring-[#5B5CE6] focus:border-transparent outline-none',
            )}
          >
            {value ? (
              <span className="font-medium">{value}</span>
            ) : (
              <span>Select a role...</span>
            )}
            <ChevronDown size={14} className={cn('text-gray-8 transition-transform', open && 'rotate-180')} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            align="start"
            className="bg-white rounded-xl shadow-xl border border-gray-5 z-50 w-[360px] py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {ROLE_DEFINITIONS.map(role => {
              const isSelected = value === role.name;
              const rp = role.resourcePermissions.find(rp => rp.resourceType === resourceType);
              const perms = rp?.permissions ?? [];
              const permLabels = perms.map(pid => ALL_PERMISSIONS.find(p => p.id === pid)?.label ?? pid);

              return (
                <button
                  key={role.name}
                  onClick={() => { onChange(role.name); setOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 transition-colors',
                    isSelected ? 'bg-[#0011FF08]' : 'hover:bg-gray-2',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                          isSelected ? 'border-[#5B5CE6] bg-[#5B5CE6]' : 'border-gray-7',
                        )}
                      >
                        {isSelected && <Check size={11} className="text-white" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-gray-12">{role.name}</span>
                      <p className="text-[12px] text-gray-9 mt-0.5 leading-relaxed">{role.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {permLabels.map(label => (
                          <span
                            key={label}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-3 text-gray-10"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="px-3 py-2 border-t border-gray-4 mt-1">
              <p className="text-[11px] text-gray-8 flex items-center gap-1">
                <Info size={11} />
                Permissions shown are specific to <strong className="text-gray-10">{resourceType}</strong> resources
              </p>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Tooltip.Provider>
  );
};

// ─── Grant Access Dialog ──────────────────────────────────────────────────────

interface GrantAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrant: (data: { principal: string; resourceType: ResourceType; resourceName: string; role: RoleName }) => void;
}

export const GrantAccessDialog: React.FC<GrantAccessDialogProps> = ({ open, onOpenChange, onGrant }) => {
  const [principal, setPrincipal] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('Agent');
  const [resourceName, setResourceName] = useState('');
  const [role, setRole] = useState<RoleName | ''>('');

  React.useEffect(() => {
    if (open) {
      setPrincipal('');
      setResourceType('Agent');
      setResourceName('');
      setRole('');
    }
  }, [open]);

  const canSubmit = principal.trim() && resourceName.trim() && role;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-[500px] p-0 animate-in fade-in slide-in-from-bottom-2 duration-200 focus:outline-none">
          <div className="px-6 pt-6 pb-3">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-[16px] font-semibold text-gray-12">Grant Access</Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-7 h-7 rounded-md flex items-center justify-center text-gray-8 hover:bg-gray-3 hover:text-gray-11 transition-colors">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-[13px] text-gray-9 mt-1">
              Grant a group or user access to a specific resource.
            </Dialog.Description>
          </div>

          <ScrollArea.Root>
            <ScrollArea.Viewport className="max-h-[60vh]">
              <div className="px-6 pb-4 space-y-4">
                {/* Principal */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-11">Principal</label>
                  <div className="flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-6 bg-white focus-within:ring-2 focus-within:ring-[#5B5CE6] focus-within:border-transparent transition-shadow">
                    <Search size={14} className="text-gray-8 shrink-0" />
                    <input
                      autoFocus
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      placeholder="Search for a group or user..."
                      className="flex-1 bg-transparent text-[13px] text-gray-12 placeholder:text-gray-8 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-8">Enter a group name, user email, or service account</p>
                </div>

                {/* Resource Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-11">Resource Type</label>
                  <Select.Root value={resourceType} onValueChange={(v) => { setResourceType(v as ResourceType); setRole(''); }}>
                    <Select.Trigger className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-gray-6 text-[13px] text-gray-12 hover:border-gray-8 focus:ring-2 focus:ring-[#5B5CE6] focus:border-transparent outline-none transition-all">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown size={14} className="text-gray-8" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content
                        position="popper"
                        sideOffset={4}
                        className="bg-white rounded-lg shadow-xl border border-gray-5 py-1 z-50 w-[var(--radix-select-trigger-width)] animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        <Select.Viewport>
                          {RESOURCE_TYPES.map(rt => (
                            <Select.Item
                              key={rt}
                              value={rt}
                              className="flex items-center px-3 py-1.5 text-[13px] text-gray-11 hover:bg-[#0011FF0F] hover:text-[#2E1E71] cursor-pointer outline-none transition-colors"
                            >
                              <Select.ItemText>{rt}</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <Check size={13} className="text-[#5B5CE6]" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* Resource Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-11">Resource Name</label>
                  <input
                    value={resourceName}
                    onChange={(e) => setResourceName(e.target.value)}
                    placeholder={`e.g. My ${resourceType}`}
                    className="h-9 px-3 rounded-lg border border-gray-6 text-[13px] text-gray-12 placeholder:text-gray-8 outline-none focus:ring-2 focus:ring-[#5B5CE6] focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Role Selector with In-Flow Descriptions */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-11">Role</label>
                  <RoleSelector
                    value={role}
                    onChange={setRole}
                    resourceType={resourceType}
                  />
                </div>

                {/* Selected Role Preview */}
                {role && (
                  <div className="bg-gray-2 rounded-lg border border-gray-4 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={14} className="text-[#5B5CE6]" />
                      <span className="text-[12px] font-medium text-gray-11">Access summary</span>
                    </div>
                    <p className="text-[12px] text-gray-10 leading-relaxed">
                      <strong className="text-gray-12">{principal || 'Principal'}</strong> will receive{' '}
                      <strong className="text-gray-12">{role}</strong>{' '}
                      access on the <strong className="text-gray-12">{resourceType}</strong>{' '}
                      "{resourceName || '...'}", granting them{' '}
                      {(() => {
                        const rp = ROLE_DEFINITIONS.find(r => r.name === role)?.resourcePermissions.find(rp => rp.resourceType === resourceType);
                        const perms = rp?.permissions ?? [];
                        const labels = perms.map(pid => ALL_PERMISSIONS.find(p => p.id === pid)?.label?.toLowerCase() ?? pid);
                        if (labels.length === 0) return 'no';
                        if (labels.length === 1) return labels[0];
                        return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
                      })()}{' '}
                      permissions.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea.Viewport>
          </ScrollArea.Root>

          <div className="px-6 py-4 border-t border-gray-4 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <button className="h-8 px-3 rounded-lg text-[13px] font-medium text-gray-11 hover:bg-gray-3 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              disabled={!canSubmit}
              onClick={() => {
                if (canSubmit) {
                  onGrant({ principal: principal.trim(), resourceType, resourceName: resourceName.trim(), role: role as RoleName });
                  onOpenChange(false);
                }
              }}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-white bg-[#5B5CE6] hover:bg-[#4A4BD5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Grant Access
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
