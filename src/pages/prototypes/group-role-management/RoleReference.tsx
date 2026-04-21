import React, { useState } from 'react';
import {
  Check, X, Minus, Info, ShieldCheck,
  Brain, Cpu, Plug, LayoutDashboard, Wrench,
} from 'lucide-react';
import { HexagonNodes, WorkflowIcon, EvaluationsIcon } from '../sgp-nav/SgpNav';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { ROLE_DEFINITIONS, RESOURCE_TYPES, ALL_PERMISSIONS, type ResourceType, type RoleName } from './data';

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

// ─── Permission Matrix ────────────────────────────────────────────────────────

const PermissionMatrix: React.FC<{ selectedResource: ResourceType }> = ({ selectedResource }) => {
  const relevantPermissions = ALL_PERMISSIONS.filter(p =>
    ROLE_DEFINITIONS.some(r =>
      r.resourcePermissions
        .find(rp => rp.resourceType === selectedResource)
        ?.permissions.includes(p.id)
    )
  );

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-4">
              <th className="text-left text-[11px] font-medium text-gray-9 tracking-wider pb-2.5 pr-4 w-[160px]">
                Permission
              </th>
              {ROLE_DEFINITIONS.map(role => (
                <th key={role.name} className="text-center text-[11px] font-medium text-gray-11 tracking-wider pb-2.5 px-2 w-[90px]">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relevantPermissions.map(perm => (
              <tr key={perm.id} className="border-b border-gray-3 last:border-b-0">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] text-gray-12">{perm.label}</span>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button className="text-gray-7 hover:text-gray-9 transition-colors">
                          <Info size={12} />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          sideOffset={4}
                          className="bg-gray-12 text-white text-[11px] px-2.5 py-1.5 rounded-md shadow-lg z-50 max-w-[200px]"
                        >
                          {perm.description}
                          <Tooltip.Arrow className="fill-gray-12" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </div>
                </td>
                {ROLE_DEFINITIONS.map(role => {
                  const rp = role.resourcePermissions.find(rp => rp.resourceType === selectedResource);
                  const has = rp?.permissions.includes(perm.id) ?? false;
                  return (
                    <td key={role.name} className="py-2.5 px-2 text-center">
                      {has ? (
                        <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center bg-[#0011FF0F]">
                          <Check size={12} className="text-[#5B5CE6]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center bg-gray-3">
                          <X size={12} className="text-gray-9" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Tooltip.Provider>
  );
};

// ─── "By Resource" Tab Content ────────────────────────────────────────────────

const ByResourceView: React.FC = () => {
  const [selectedResource, setSelectedResource] = useState<ResourceType>('Agent');

  return (
    <div className="p-6">
      <Tabs.Root value={selectedResource} onValueChange={(v) => setSelectedResource(v as ResourceType)}>
        <Tabs.List className="flex flex-wrap gap-1 mb-4">
          {RESOURCE_TYPES.map(rt => {
            const Icon = RESOURCE_ICONS[rt] ?? ShieldCheck;
            return (
              <Tabs.Trigger
                key={rt}
                value={rt}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                  'data-[state=active]:bg-[#0011FF0F] data-[state=active]:text-[#2E1E71]',
                  'data-[state=inactive]:text-gray-9 data-[state=inactive]:hover:bg-gray-3 data-[state=inactive]:hover:text-gray-11',
                )}
              >
                <Icon size={13} />
                {rt}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {RESOURCE_TYPES.map(rt => (
          <Tabs.Content key={rt} value={rt} className="outline-none">
            <div className="bg-white rounded-xl border border-gray-4 p-4">
              <div className="flex items-center gap-2 mb-4">
                {React.createElement(RESOURCE_ICONS[rt] ?? ShieldCheck, { size: 16, className: 'text-gray-10' })}
                <span className="text-[14px] font-semibold text-gray-12">{rt}</span>
                <span className="text-[12px] text-gray-8 ml-1">— all roles compared</span>
              </div>
              <PermissionMatrix selectedResource={rt} />
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
};

// ─── Role Permission Matrix (permissions × resource types for a single role) ─

const RolePermissionMatrix: React.FC<{ selectedRole: RoleName }> = ({ selectedRole }) => {
  const role = ROLE_DEFINITIONS.find(r => r.name === selectedRole)!;

  const allPermissionsUsed = ALL_PERMISSIONS.filter(p =>
    RESOURCE_TYPES.some(rt =>
      ROLE_DEFINITIONS.some(r =>
        r.resourcePermissions.find(rp => rp.resourceType === rt)?.permissions.includes(p.id)
      )
    )
  );

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-4">
              <th className="text-left text-[11px] font-medium text-gray-9 tracking-wider pb-2.5 pr-4 w-[140px]">
                Permission
              </th>
              {RESOURCE_TYPES.map(rt => {
                const Icon = RESOURCE_ICONS[rt] ?? ShieldCheck;
                return (
                  <th key={rt} className="text-center text-[11px] font-medium text-gray-11 tracking-wider pb-2.5 px-1.5">
                    <div className="flex flex-col items-center gap-1">
                      <Icon size={13} className="text-gray-9" />
                      <span className="leading-tight">{rt}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allPermissionsUsed.map(perm => {
              const isRelevant = RESOURCE_TYPES.some(rt =>
                ROLE_DEFINITIONS.some(r =>
                  r.resourcePermissions.find(rp => rp.resourceType === rt)?.permissions.includes(perm.id)
                )
              );
              if (!isRelevant) return null;

              return (
                <tr key={perm.id} className="border-b border-gray-3 last:border-b-0">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] text-gray-12">{perm.label}</span>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button className="text-gray-7 hover:text-gray-9 transition-colors">
                            <Info size={12} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            sideOffset={4}
                            className="bg-gray-12 text-white text-[11px] px-2.5 py-1.5 rounded-md shadow-lg z-50 max-w-[200px]"
                          >
                            {perm.description}
                            <Tooltip.Arrow className="fill-gray-12" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                  </td>
                  {RESOURCE_TYPES.map(rt => {
                    const anyRoleHas = ROLE_DEFINITIONS.some(r =>
                      r.resourcePermissions.find(rp => rp.resourceType === rt)?.permissions.includes(perm.id)
                    );
                    if (!anyRoleHas) {
                      return <td key={rt} className="py-2.5 px-1.5 text-center"><Minus size={14} className="text-gray-5 mx-auto" /></td>;
                    }
                    const rp = role.resourcePermissions.find(rp => rp.resourceType === rt);
                    const has = rp?.permissions.includes(perm.id) ?? false;
                    return (
                      <td key={rt} className="py-2.5 px-1.5 text-center">
                        {has ? (
                          <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center bg-[#0011FF0F]">
                            <Check size={12} className="text-[#5B5CE6]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center bg-gray-3">
                            <X size={12} className="text-gray-9" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Tooltip.Provider>
  );
};

// ─── "By Role" Tab Content ────────────────────────────────────────────────────

const ByRoleView: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleName>('Owner');

  return (
    <div className="p-6">
      <Tabs.Root value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleName)}>
        <Tabs.List className="flex flex-wrap gap-1 mb-4">
          {ROLE_DEFINITIONS.map(r => (
            <Tabs.Trigger
              key={r.name}
              value={r.name}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all',
                'data-[state=active]:bg-[#0011FF0F] data-[state=active]:text-[#2E1E71]',
                'data-[state=inactive]:text-gray-9 data-[state=inactive]:hover:bg-gray-3 data-[state=inactive]:hover:text-gray-11',
              )}
            >
              {r.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {ROLE_DEFINITIONS.map(r => (
          <Tabs.Content key={r.name} value={r.name} className="outline-none">
            <div className="bg-white rounded-xl border border-gray-4 p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[14px] font-semibold text-gray-12">{r.name}</span>
                <span className="text-[12px] text-gray-8 ml-1">— {r.summary.toLowerCase()}</span>
              </div>
              <RolePermissionMatrix selectedRole={r.name} />
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
};

// ─── Main Role Reference Panel ────────────────────────────────────────────────

export const RoleReference: React.FC = () => {
  const [viewMode, setViewMode] = useState<'by-resource' | 'by-role'>('by-role');

  return (
    <div className="flex flex-col h-full">
      {/* View mode toggle */}
      <div className="px-6 py-3 border-b border-gray-4 shrink-0 flex items-center">
        <Tabs.Root value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <Tabs.List className="flex items-center gap-1 bg-gray-3 p-0.5 rounded-lg">
            <Tabs.Trigger
              value="by-role"
              className={cn(
                'px-2.5 py-1 rounded-md text-[12px] font-medium transition-all',
                'data-[state=active]:bg-white data-[state=active]:text-gray-12 data-[state=active]:shadow-sm',
                'data-[state=inactive]:text-gray-9 data-[state=inactive]:hover:text-gray-11',
              )}
            >
              By Role
            </Tabs.Trigger>
            <Tabs.Trigger
              value="by-resource"
              className={cn(
                'px-2.5 py-1 rounded-md text-[12px] font-medium transition-all',
                'data-[state=active]:bg-white data-[state=active]:text-gray-12 data-[state=active]:shadow-sm',
                'data-[state=inactive]:text-gray-9 data-[state=inactive]:hover:text-gray-11',
              )}
            >
              By Resource
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {viewMode === 'by-resource' ? <ByResourceView /> : <ByRoleView />}
      </div>
    </div>
  );
};
