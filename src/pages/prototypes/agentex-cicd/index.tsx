import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpCircle,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  X,
  File,
  FileArchive,
  Folder,
  FolderOpen,
  GitBranch,
  GitCommit,
  History,
  Loader2,
  LayoutGrid,
  List,
  MoreHorizontal,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { NavV3, ShowIconsContext, ShowDescriptionsContext } from '../sgp-nav/SgpNav';
import { cn } from '@/lib/utils';
import { useTweakpane } from '@/lib/tweakpane';

const GithubIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M5.4375 12.4062C5.4375 12.3438 5.34375 12.3125 5.25 12.3125C5.15625 12.3125 5.09375 12.3438 5.09375 12.4062C5.09375 12.5 5.15625 12.5312 5.28125 12.5312C5.375 12.5312 5.4375 12.4688 5.4375 12.4062ZM4.46875 12.2812C4.5 12.2188 4.5625 12.1875 4.65625 12.2188C4.75 12.25 4.8125 12.3125 4.78125 12.375C4.78125 12.4375 4.6875 12.4688 4.59375 12.4375C4.5 12.4062 4.4375 12.3438 4.46875 12.2812ZM5.84375 12.2188C5.9375 12.2188 6.03125 12.25 6.03125 12.3125C6.03125 12.375 5.96875 12.4375 5.875 12.4688C5.78125 12.4688 5.71875 12.4375 5.6875 12.375C5.6875 12.3125 5.75 12.25 5.84375 12.2188ZM7.90625 0.25C12.25 0.25 15.75 3.53125 15.75 7.875C15.75 11.3438 13.625 14.3125 10.5 15.3438C10.125 15.4062 9.96875 15.1562 9.96875 14.9688C9.96875 14.7188 9.96875 13.4062 9.96875 12.3438C9.96875 11.625 9.71875 11.1562 9.4375 10.9062C11.1875 10.7188 13.0312 10.4688 13.0312 7.4375C13.0312 6.59375 12.7188 6.15625 12.2188 5.625C12.3125 5.40625 12.5625 4.5625 12.1562 3.5C11.5 3.28125 10 4.34375 10 4.34375C9.375 4.15625 8.6875 4.0625 8.03125 4.0625C7.375 4.0625 6.6875 4.15625 6.0625 4.34375C6.0625 4.34375 4.5625 3.28125 3.90625 3.5C3.46875 4.5625 3.75 5.40625 3.8125 5.625C3.3125 6.15625 3.09375 6.59375 3.09375 7.4375C3.09375 10.4688 4.84375 10.7188 6.59375 10.9062C6.375 11.125 6.15625 11.4688 6.09375 11.9688C5.65625 12.1562 4.5 12.5 3.8125 11.3125C3.40625 10.5625 2.625 10.5 2.625 10.5C1.84375 10.5 2.5625 10.9688 2.5625 10.9688C3.0625 11.2188 3.4375 12.125 3.4375 12.125C3.90625 13.5312 6.09375 13.0625 6.09375 13.0625C6.09375 13.7188 6.09375 14.7812 6.09375 14.9688C6.09375 15.1875 5.9375 15.4375 5.5625 15.3438C2.4375 14.3125 0.25 11.3438 0.25 7.875C0.25 3.53125 3.5625 0.25 7.90625 0.25ZM3.28125 11.0312C3.34375 11 3.40625 11 3.4375 11.0625C3.5 11.125 3.5 11.1875 3.46875 11.2188C3.4375 11.25 3.375 11.25 3.3125 11.1875C3.25 11.125 3.25 11.0625 3.28125 11.0312ZM2.9375 10.7812C2.96875 10.75 3.03125 10.75 3.09375 10.75C3.15625 10.7812 3.1875 10.8438 3.15625 10.875C3.125 10.9062 3.0625 10.9375 3.03125 10.9062C2.96875 10.875 2.9375 10.8125 2.9375 10.7812ZM3.96875 11.875C4 11.8438 4.09375 11.8438 4.15625 11.9062C4.21875 11.9688 4.25 12.0625 4.21875 12.125C4.15625 12.1562 4.0625 12.1562 4 12.0938C3.9375 12.0312 3.90625 11.9375 3.96875 11.875ZM3.59375 11.4375C3.65625 11.375 3.75 11.4062 3.78125 11.5C3.84375 11.5625 3.84375 11.6562 3.78125 11.6875C3.75 11.7188 3.65625 11.6875 3.59375 11.625C3.5625 11.5312 3.5625 11.4688 3.59375 11.4375Z" fill="currentColor"/>
  </svg>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

type StatusType = 'draft' | 'published' | 'ready' | 'error' | 'building' | 'pending' | 'unknown';

const STATUS_CONFIG: Record<StatusType, { label: string; bg: string; text: string; dot: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-[#F3F4F6]',    text: 'text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
  published: { label: 'Published', bg: 'bg-[#EEF2FF]',    text: 'text-[#4338CA]', dot: 'bg-[#6366F1]' },
  ready:     { label: 'Ready',     bg: 'bg-[#00970016]',        text: 'text-[#2A7E3B]', dot: 'bg-[#46A758]' },
  error:     { label: 'Error',     bg: 'bg-[#FEE2E2]',    text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  building:  { label: 'Building',  bg: 'bg-[#DBEAFE]',    text: 'text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
  pending:   { label: 'Pending',   bg: 'bg-[#FEF3C7]',    text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  unknown:   { label: 'Unknown',   bg: 'bg-[#F3F4F6]',    text: 'text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
};

const StatusBadge = ({ status }: { status: StatusType }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium', cfg.bg, cfg.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

const ACCENT = '#714DFF';

const BrainIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 0C5.01562 0 5.48438 0.210938 5.8125 0.539062C6.14062 0.210938 6.60938 0 7.125 0C7.99219 0 8.71875 0.585938 8.92969 1.35938C10.0312 1.59375 10.875 2.57812 10.875 3.75C10.875 4.00781 10.8281 4.26562 10.7578 4.5C11.2969 4.94531 11.625 5.625 11.625 6.375C11.625 6.9375 11.4375 7.45312 11.1328 7.85156C11.2031 8.10938 11.25 8.36719 11.25 8.625C11.25 9.89062 10.2891 10.9219 9.04688 11.0625C8.67188 11.625 8.03906 12 7.3125 12C6.72656 12 6.1875 11.7422 5.8125 11.3438C5.4375 11.7422 4.89844 12 4.3125 12C3.58594 12 2.95312 11.625 2.57812 11.0625C1.33594 10.9453 0.375 9.89062 0.375 8.625C0.375 8.36719 0.421875 8.10938 0.492188 7.85156C0.1875 7.45312 0 6.9375 0 6.375C0 5.625 0.328125 4.94531 0.867188 4.5C0.796875 4.26562 0.75 4.00781 0.75 3.75C0.75 2.57812 1.59375 1.59375 2.69531 1.35938C2.92969 0.585938 3.63281 0 4.5 0ZM5.25 1.875C5.25 1.45312 4.92188 1.125 4.5 1.125C4.07812 1.125 3.75 1.45312 3.75 1.875C3.75 2.17969 3.49219 2.4375 3.1875 2.4375C2.46094 2.4375 1.875 3.02344 1.875 3.75C1.875 4.00781 1.94531 4.21875 2.0625 4.42969C2.13281 4.54688 2.15625 4.71094 2.10938 4.875C2.08594 5.01562 1.96875 5.13281 1.82812 5.20312C1.40625 5.4375 1.125 5.85938 1.125 6.375C1.125 6.75 1.28906 7.10156 1.54688 7.33594C1.73438 7.5 1.78125 7.78125 1.66406 8.01562C1.57031 8.20312 1.5 8.41406 1.5 8.625C1.5 9.35156 2.08594 9.9375 2.8125 9.9375C2.83594 9.9375 2.85938 9.9375 2.88281 9.9375C3.14062 9.91406 3.35156 10.0547 3.44531 10.2891C3.58594 10.6406 3.91406 10.875 4.3125 10.875C4.78125 10.875 5.17969 10.5234 5.25 10.0547C5.25 10.0312 5.25 10.0312 5.25 10.0078V1.875ZM6.375 10.0078C6.375 10.0312 6.375 10.0312 6.375 10.0547C6.44531 10.5234 6.84375 10.875 7.3125 10.875C7.71094 10.875 8.03906 10.6406 8.17969 10.2891C8.27344 10.0547 8.48438 9.91406 8.74219 9.9375C8.76562 9.9375 8.78906 9.9375 8.8125 9.9375C9.53906 9.9375 10.125 9.35156 10.125 8.625C10.125 8.39062 10.0781 8.20312 9.96094 8.01562C9.84375 7.78125 9.89062 7.5 10.0781 7.33594C10.3359 7.10156 10.5 6.75 10.5 6.375C10.5 5.85938 10.2188 5.4375 9.79688 5.20312C9.65625 5.13281 9.53906 5.01562 9.51562 4.875C9.46875 4.71094 9.49219 4.54688 9.5625 4.42969C9.67969 4.21875 9.75 4.00781 9.75 3.75C9.75 3.02344 9.16406 2.4375 8.4375 2.4375C8.13281 2.4375 7.875 2.17969 7.875 1.875C7.875 1.45312 7.54688 1.125 7.125 1.125C6.70312 1.125 6.375 1.45312 6.375 1.875V10.0078Z" fill="currentColor"/>
  </svg>
);

const AgenticTag = ({ label = 'Agentic' }: { icon?: React.ElementType; label?: string }) => {
  const isSync = label.toLowerCase() === 'sync';
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white border border-[#D1D5DB] text-[#6B7280]">
      {isSync
        ? <FontAwesomeIcon icon={faRotate} style={{ width: '10px', height: '10px' }} />
        : <BrainIcon />}
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

type HistoryRowStatus = 'ready' | 'inactive' | 'error' | 'building';

const HISTORY_STATUS: Record<HistoryRowStatus, { label: string; bg: string; text: string; dot: string }> = {
  ready:    { label: 'Ready',    bg: 'bg-[#00970016]', text: 'text-[#2A7E3B]', dot: 'bg-[#46A758]' },
  inactive: { label: 'Inactive', bg: 'bg-[#F3F4F6]',   text: 'text-[#6B7280]', dot: 'bg-[#9CA3AF]' },
  error:    { label: 'Error',    bg: 'bg-[#FEE2E2]',   text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  building: { label: 'Building', bg: 'bg-[#DBEAFE]',   text: 'text-[#1D4ED8]', dot: 'bg-[#3B82F6]' },
};

const HistoryStatusBadge = ({ status }: { status: HistoryRowStatus }) => {
  const cfg = HISTORY_STATUS[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium', cfg.bg, cfg.text)}>
      {status === 'building'
        ? <Loader2 size={10} className="animate-spin shrink-0" />
        : <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      }
      {cfg.label}
    </span>
  );
};

// ─── Agent Card Data ──────────────────────────────────────────────────────────

interface Agent {
  id: string;
  source: string;
  name: string;
  status: StatusType;
  hosting?: 'github' | 'scale';
  initialVersion?: string;
  tags?: { icon?: React.ElementType; label: string }[];
  description: string;
  lastModified: string;
}

const AGENTS: Agent[] = [
  {
    id: '1',
    source: 'Agentex',
    name: 'Document Extraction Agent',
    status: 'draft',
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jan 1, 2025',
  },
  {
    id: '2',
    source: 'Agentex',
    name: 'at000-hello-acp',
    status: 'published',
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jan 1, 2025',
  },
  {
    id: '3',
    source: 'Agentex',
    name: 's020-streaming',
    status: 'ready',
    tags: [{ label: 'agentic' }],
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jan 1, 2025',
  },
  {
    id: '4',
    source: 'Agentex',
    name: 'ab000-hello-acp',
    status: 'ready',
    tags: [{ label: 'agentic' }],
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jan 1, 2025',
  },
  {
    id: '5',
    source: 'Agentex',
    name: 's030-hello-oldowan',
    status: 'error',
    tags: [{ icon: RefreshCw, label: 'sync' }],
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jan 1, 2025',
  },
  {
    id: '6',
    source: 'Agentex',
    name: 'ab050-helloo-oldowan',
    status: 'building',
    tags: [{ label: 'agentic' }],
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jan 1, 2025',
  },
  {
    id: '7',
    source: 'Agentex',
    name: 'ab000-streaming',
    status: 'pending',
    tags: [{ label: 'agentic' }],
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jan 1, 2025',
  },
  {
    id: '8',
    source: 'Agentex',
    name: 'ab000-hello-acp',
    status: 'unknown',
    tags: [{ label: 'agentic' }],
    description: 'An agentex agent that is designed to do something special with your data.',
    lastModified: 'Jun 1, 2025',
  },
];

// ─── Agent detail (Figma-aligned fields) ─────────────────────────────────────

interface AgentDetailExtras {
  shortId: string;
  deploymentId: string;
  domains: string;
  actType: string;
  created: string;
  branch: string;
  commitMessage: string;
  repository: string;
}

type AgentDetail = Agent & AgentDetailExtras;

const SHORT_ID_BY_AGENT: Record<string, string> = {
  '1': '16d96d73',
  '2': '8f4a2c91',
  '3': 'b3e89142',
  '4': 'c7d22e18',
  '5': 'd91f5baa',
  '6': 'e62a8c33',
  '7': 'f0349d27',
  '8': '1a9b4e60',
};

function getAgentDetail(agent: Agent): AgentDetail {
  const lm = agent.lastModified;
  const created =
    lm.startsWith('Jun') ? 'June 1, 2025' : lm.startsWith('Jan') ? 'January 1, 2025' : lm;

  return {
    ...agent,
    shortId: SHORT_ID_BY_AGENT[agent.id] ?? `id${agent.id}ab12`,
    deploymentId: 'A4s3WNgPq',
    domains: 'sample-domain.app',
    actType: agent.tags?.[0]?.label ?? 'agentic',
    created,
    branch: 'main',
    commitMessage: 'ccaf6f3 force deploy',
    repository: 'sample/repository-url',
  };
}

function detailDescription(agent: Agent) {
  return agent.description.includes('your data')
    ? agent.description.replace('your data', 'your inputs')
    : agent.description;
}

type DeployHistoryRow = {
  id: string;
  current?: boolean;
  status: HistoryRowStatus;
  relativeTime: string;
  sourceBranch?: string;
  commitLine?: string;
  redeployLabel?: string;
  authorLine: string;
};

const DEPLOYMENT_HISTORY: DeployHistoryRow[] = [
  { id: 'A4s3WNgPq', current: true, status: 'ready', relativeTime: '3 days ago', sourceBranch: 'main', commitLine: 'ccaf6f3 force deploy', authorLine: 'June 1 by Felix Su' },
  { id: 'G8h2ZyRxT', status: 'inactive', relativeTime: '7 days ago', redeployLabel: 'Redeploy of D7q4NfBrJ ', authorLine: 'June 3 by github-user' },
  { id: 'D7q4NfBrJ', status: 'ready', relativeTime: '1 week ago', sourceBranch: 'main', commitLine: 'e4f5b6a ', authorLine: 'May 25 by Sarah Lee' },
  { id: 'R5t6OpMqY', status: 'error', relativeTime: '5 weeks ago', sourceBranch: 'main', commitLine: 'b2c3d4e', authorLine: 'June 2 by John Doe' },
  { id: 'S9u8YlHgF', status: 'inactive', relativeTime: '2 months ago', sourceBranch: 'main', commitLine: 'f6g7h8i', authorLine: 'May 28 by Maria Chen' },
  { id: 'Q2w3XyCvZ', status: 'inactive', relativeTime: '2 months ago', sourceBranch: 'main', commitLine: 'j9k0l1m', authorLine: 'June 4 by Liam Smith' },
  { id: 'T4u5VwRnS', status: 'inactive', relativeTime: '2 months ago', sourceBranch: 'main', commitLine: 'n2o3p4q', authorLine: 'June 1 by Emma Brown' },
];

const SCALE_BUILD_HISTORY: DeployHistoryRow[] = [
  { id: 'V 1.0', current: true, status: 'ready',    relativeTime: '3 days ago',   commitLine: 'ccaf6f3 force deploy', authorLine: 'June 1 by Felix Su'      },
  { id: 'V 0.9', status: 'inactive',                relativeTime: '7 days ago',   commitLine: '8f4a2c9 update config', authorLine: 'June 3 by github-user'   },
  { id: 'V 0.8', status: 'ready',                   relativeTime: '1 week ago',   commitLine: 'e4f5b6a refactor agent', authorLine: 'May 25 by Sarah Lee'     },
  { id: 'V 0.7', status: 'error',                   relativeTime: '5 weeks ago',  commitLine: 'b2c3d4e fix timeout',   authorLine: 'June 2 by John Doe'      },
  { id: 'V 0.6', status: 'inactive',                relativeTime: '2 months ago', commitLine: 'f6g7h8i add retries',   authorLine: 'May 28 by Maria Chen'    },
  { id: 'V 0.5', status: 'inactive',                relativeTime: '2 months ago', commitLine: 'j9k0l1m init build',    authorLine: 'June 4 by Liam Smith'    },
  { id: 'V 0.4', status: 'inactive',                relativeTime: '2 months ago', commitLine: 'n2o3p4q initial setup', authorLine: 'June 1 by Emma Brown'    },
];

// ─── Agent Card ───────────────────────────────────────────────────────────────

const AgentCard = ({ agent, onSelect }: { agent: Agent; onSelect: (a: Agent) => void }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => onSelect(agent)}
    onKeyDown={e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(agent);
      }
    }}
    className="bg-white border border-[#E5E7EB] rounded-lg p-6 flex flex-col gap-2 hover:border-[#C5CFE4] hover:shadow-sm transition-all cursor-pointer group h-fit self-start w-full text-left"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[15px] font-medium text-[#111827] leading-snug block truncate min-w-0" title={agent.name}>
          {agent.name}
        </span>
      </div>
      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#6B7280] shrink-0 -mt-0.5 -mr-1"
        onClick={e => e.stopPropagation()}
        aria-label="More actions"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>

    <div className="flex items-center gap-1.5 flex-wrap">
      <StatusBadge status={agent.status} />
      {agent.tags?.map((tag, i) => (
        <AgenticTag key={i} icon={tag.icon} label={tag.label} />
      ))}
    </div>

    <p className="text-[13px] text-[#19202F] leading-relaxed line-clamp-2 h-fit">
      {agent.description}
    </p>

    <div className="pt-1 h-fit">
      <span className="text-[11px] text-[#5B6579]">Last modified {agent.lastModified}</span>
    </div>
  </div>
);

const DetailLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[14px] font-medium text-[#818EA9]">{children}</span>
);

// ─── Shared dialog primitives ─────────────────────────────────────────────────

const ModalOverlay = () => (
  <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
);

const ModalContent = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-[0px_12px_32px_-16px_rgba(0,0,0,0.3),0px_12px_60px_0px_rgba(0,0,0,0.15)] flex flex-col gap-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
    {children}
  </DialogPrimitive.Content>
);

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex items-start justify-between gap-2">
    <h2 className="text-[24px] font-medium text-[#19202F] leading-[30px] tracking-[-0.1px]">{title}</h2>
    <button
      type="button"
      onClick={onClose}
      className="p-1 rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280] shrink-0 mt-0.5"
      aria-label="Close"
    >
      <X size={16} />
    </button>
  </div>
);

const ModalFooter = ({ onCancel, onConfirm, confirmLabel }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string }) => (
  <div className="flex items-center justify-end gap-2 pt-2">
    <button
      type="button"
      onClick={onCancel}
      className="inline-flex items-center h-8 px-3 rounded text-[14px] font-medium border border-[#D1D5DB] text-[#19202F] bg-white hover:bg-[#F3F4F6] transition-colors"
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onConfirm}
      className="inline-flex items-center h-8 px-3 rounded text-[14px] font-medium text-white transition-opacity hover:opacity-90"
      style={{ background: ACCENT }}
    >
      {confirmLabel}
    </button>
  </div>
);

// ─── Promote dialog ───────────────────────────────────────────────────────────

const PromoteDialog = ({ open, onClose, domain }: { open: boolean; onClose: () => void; domain: string }) => (
  <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
    <DialogPrimitive.Portal>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader title="Promote" onClose={onClose} />
        <div className="flex flex-col gap-4 text-[14px] text-[#19202F] leading-5">
          <p>
            You're about to promote this deployment to <strong>production</strong>. This will make it the active version in that environment.
          </p>
          <div className="flex flex-col gap-1">
            <p>It will be available in the following domain:</p>
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-1 text-[#714DFF] hover:underline underline-offset-2 w-fit"
            >
              {domain}
              <ExternalLink size={12} className="shrink-0" />
            </a>
          </div>
          <p>Previous versions will remain available for rollback.</p>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Promote" />
      </ModalContent>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

// ─── Instant Rollback dialog ──────────────────────────────────────────────────

const RollbackDialog = ({ open, onClose, deploymentId }: { open: boolean; onClose: () => void; deploymentId: string }) => (
  <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
    <DialogPrimitive.Portal>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader title="Instant Rollback" onClose={onClose} />
        <div className="flex flex-col gap-4 text-[14px] text-[#19202F] leading-5">
          <p>
            You're about to roll back <strong>production</strong> to deployment <strong>{deploymentId}</strong>. This will replace the current version with the selected one.
          </p>
          <p>Any changes made after this deployment will be reverted.</p>
        </div>
        <ModalFooter onCancel={onClose} onConfirm={onClose} confirmLabel="Confirm Rollback" />
      </ModalContent>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

// ─── Build Uploader ───────────────────────────────────────────────────────────

interface MockFile { name: string; content: string }

const BuildUploaderBody: React.FC = () => {
  const [files, setFiles] = useState<MockFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [addingFile, setAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const confirmAddFile = () => {
    const name = newFileName.trim();
    if (name && !files.find(f => f.name === name)) {
      setFiles(prev => [...prev, { name, content: '' }]);
      setSelectedFile(name);
    }
    setAddingFile(false);
    setNewFileName('');
  };

  const selectedContent = files.find(f => f.name === selectedFile)?.content ?? '';
  const updateContent = (content: string) =>
    setFiles(prev => prev.map(f => f.name === selectedFile ? { ...f, content } : f));

  return (
    <div className="flex flex-col border border-[#D1DAEB] rounded-lg overflow-hidden" style={{ height: 320 }}>
      {/* Toolbar */}
      <div className="flex items-center border-b border-[#D1DAEB] bg-[#F8FAFC] shrink-0 overflow-x-auto">
        {([
          { icon: FolderOpen, label: 'Upload Folder', onClick: () => folderInputRef.current?.click(), disabled: false },
          { icon: FileArchive, label: 'Upload Zip', onClick: () => zipInputRef.current?.click(), disabled: false },
          { icon: Wand2, label: 'Cleanup & Validate', onClick: undefined, disabled: true },
          { icon: History, label: 'Import from Version', onClick: undefined, disabled: false },
          { icon: RefreshCw, label: 'Load Template', onClick: undefined, disabled: false },
        ] as { icon: React.ElementType; label: string; onClick: (() => void) | undefined; disabled: boolean }[]).map(({ icon: Icon, label, disabled, onClick }) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
              'flex items-center gap-1.5 px-3 h-9 text-[13px] whitespace-nowrap border-r border-[#D1DAEB] shrink-0 transition-colors',
              disabled
                ? 'text-[#B0BCCE] cursor-default'
                : 'text-[#5B6579] hover:bg-[#EEF2F7] hover:text-[#19202F]',
            )}
          >
            <Icon size={14} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 min-h-0">
        {/* FILES panel */}
        <div className="w-[200px] shrink-0 border-r border-[#D1DAEB] flex flex-col bg-[#F8FAFC]">
          <div className="flex items-center justify-between px-3 h-8 border-b border-[#D1DAEB] shrink-0">
            <span className="text-[11px] font-semibold text-[#818EA9] uppercase tracking-wider">Files</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => { setAddingFile(true); setNewFileName(''); }}
                className="flex items-center justify-center w-5 h-5 rounded text-[#818EA9] hover:bg-[#E5EAF2] hover:text-[#5B6579] transition-colors"
                aria-label="New file"
              >
                <Plus size={12} />
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-5 h-5 rounded text-[#818EA9] hover:bg-[#E5EAF2] hover:text-[#5B6579] transition-colors"
                aria-label="New folder"
              >
                <Folder size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {files.length === 0 && !addingFile ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 px-3 text-center">
                <File size={24} className="text-[#C5CFE4]" />
                <p className="text-[12px] text-[#818EA9] font-medium">No files yet</p>
                <p className="text-[11px] text-[#9CA3AF]">Click + to add a file</p>
              </div>
            ) : (
              <>
                {files.map(f => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setSelectedFile(f.name)}
                    className={cn(
                      'w-full flex items-center gap-1.5 px-3 py-1 text-[13px] text-left transition-colors',
                      selectedFile === f.name
                        ? 'bg-[#EEF2FF] text-[#3730A3]'
                        : 'text-[#5B6579] hover:bg-[#EEF2F7] hover:text-[#19202F]',
                    )}
                  >
                    <File size={12} className="shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </>
            )}
            {addingFile && (
              <div className="px-2 py-1">
                <input
                  autoFocus
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') confirmAddFile();
                    if (e.key === 'Escape') { setAddingFile(false); setNewFileName(''); }
                  }}
                  onBlur={confirmAddFile}
                  placeholder="filename.py"
                  className="w-full px-2 py-0.5 text-[13px] border border-[#714DFF] rounded outline-none bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Code editor */}
        <div className="flex-1 min-w-0 bg-white">
          {selectedFile ? (
            <textarea
              value={selectedContent}
              onChange={e => updateContent(e.target.value)}
              className="w-full h-full resize-none outline-none p-4 text-[13px] font-mono text-[#19202F] leading-6"
              placeholder="// Write your code here..."
              spellCheck={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-[14px] text-[#9CA3AF]">
              Open a file from the sidebar to start editing
            </div>
          )}
        </div>
      </div>

      <input ref={folderInputRef} type="file" className="hidden" multiple />
      <input ref={zipInputRef} type="file" className="hidden" accept=".zip" />
    </div>
  );
};

const WideModalContent = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[840px] max-w-[calc(100vw-48px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-[0px_12px_32px_-16px_rgba(0,0,0,0.3),0px_12px_60px_0px_rgba(0,0,0,0.15)] flex flex-col gap-5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-none">
    {children}
  </DialogPrimitive.Content>
);

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-[#5B6579]">{label}</label>
    {children}
  </div>
);

const textInputCls = "h-9 px-3 rounded-md border border-[#D1DAEB] text-[14px] text-[#19202F] bg-white outline-none focus:border-[#714DFF] focus:ring-2 focus:ring-[#714DFF] focus:ring-opacity-20 transition-colors placeholder:text-[#9CA3AF]";

// ─── Create Agent dialog ──────────────────────────────────────────────────────

const CreateAgentDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, version: string) => void;
}) => {
  const [agentName, setAgentName] = useState('');
  const [buildVersion, setBuildVersion] = useState('V 1.0');

  const handleConfirm = () => {
    if (!agentName.trim()) return;
    onConfirm(agentName.trim(), buildVersion.trim() || 'V 1.0');
    setAgentName('');
    setBuildVersion('V 1.0');
    onClose();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
      <DialogPrimitive.Portal>
        <ModalOverlay />
        <WideModalContent>
          <ModalHeader title="Create Agent" onClose={onClose} />
          <div className="flex gap-4 items-end">
            <FormField label="Agent Name">
              <input
                className={cn(textInputCls, 'w-[400px]')}
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="my-agent-name"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              />
            </FormField>
            <FormField label="Build Version">
              <input
                className={cn(textInputCls, 'w-[160px]')}
                value={buildVersion}
                onChange={e => setBuildVersion(e.target.value)}
                placeholder="V 1.0"
              />
            </FormField>
          </div>
          <BuildUploaderBody />
          <ModalFooter onCancel={onClose} onConfirm={handleConfirm} confirmLabel="Create & Deploy" />
        </WideModalContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

// ─── Add Build dialog ─────────────────────────────────────────────────────────

const AddBuildDialog = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (version: string) => void;
}) => {
  const [buildVersion, setBuildVersion] = useState('');

  const handleConfirm = () => {
    onConfirm(buildVersion.trim() || 'V 1.x');
    setBuildVersion('');
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={v => !v && onClose()}>
      <DialogPrimitive.Portal>
        <ModalOverlay />
        <WideModalContent>
          <ModalHeader title="Add Build" onClose={onClose} />
          <FormField label="Build Version">
            <input
              className={cn(textInputCls, 'w-[200px]')}
              value={buildVersion}
              onChange={e => setBuildVersion(e.target.value)}
              placeholder="V 1.1"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            />
          </FormField>
          <BuildUploaderBody />
          <ModalFooter onCancel={onClose} onConfirm={handleConfirm} confirmLabel="Add Build" />
        </WideModalContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────

const RowActionsMenu = ({ row, domain }: { row: DeployHistoryRow; domain: string }) => {
  const [dialog, setDialog] = useState<'promote' | 'rollback' | null>(null);

  return (
    <>
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            type="button"
            className="p-2 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280] shrink-0 data-[state=open]:bg-[#F3F4F6] data-[state=open]:text-[#6B7280]"
            aria-label="Row actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={4}
            className="z-50 w-[211px] rounded-lg border border-[rgba(0,54,175,0.07)] bg-white p-2 shadow-[0px_0px_4px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(0,54,175,0.07)] animate-in fade-in-0 zoom-in-95"
          >
            {/* Group 1: Open / Promote / Instant Rollback */}
            <DropdownMenuPrimitive.Group>
              {[
                { label: 'Open',             rightIcon: ExternalLink,  action: undefined          },
                { label: 'Promote',          rightIcon: ArrowUpCircle, action: () => setDialog('promote')  },
                { label: 'Instant Rollback', rightIcon: RotateCcw,     action: () => setDialog('rollback') },
              ].map(({ label, rightIcon: RightIcon, action }) => (
                <DropdownMenuPrimitive.Item
                  key={label}
                  onSelect={action}
                  className="flex items-center gap-1 px-1 py-1.5 rounded text-[14px] text-[#19202F] cursor-default select-none outline-none hover:bg-[#F3F4F6] focus:bg-[#F3F4F6]"
                >
                  <span className="flex-1">{label}</span>
                  <RightIcon size={14} className="shrink-0 text-[#818EA9]" />
                </DropdownMenuPrimitive.Item>
              ))}
            </DropdownMenuPrimitive.Group>

            {/* Group 2: Deploy / Copy URL / View Source */}
            <DropdownMenuPrimitive.Separator className="my-1 h-px bg-[rgba(0,54,175,0.07)]" />
            <DropdownMenuPrimitive.Group>
              {([...(!row.current ? ['Deploy'] : []), 'Copy URL', 'View Source'] as string[]).map(label => (
                <DropdownMenuPrimitive.Item
                  key={label}
                  className="flex items-center gap-1 px-1 py-1.5 rounded text-[14px] text-[#19202F] cursor-default select-none outline-none hover:bg-[#F3F4F6] focus:bg-[#F3F4F6]"
                >
                  <span className="flex-1">{label}</span>
                </DropdownMenuPrimitive.Item>
              ))}
            </DropdownMenuPrimitive.Group>

            {/* Group 3: View Evaluations / View Traces */}
            <DropdownMenuPrimitive.Separator className="my-1 h-px bg-[rgba(0,54,175,0.07)]" />
            <DropdownMenuPrimitive.Group>
              {['View Evaluations', 'View Traces'].map(label => (
                <DropdownMenuPrimitive.Item
                  key={label}
                  className="flex items-center gap-1 px-1 py-1.5 rounded text-[14px] text-[#19202F] cursor-default select-none outline-none hover:bg-[#F3F4F6] focus:bg-[#F3F4F6]"
                >
                  <span className="flex-1">{label}</span>
                </DropdownMenuPrimitive.Item>
              ))}
            </DropdownMenuPrimitive.Group>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>

      <PromoteDialog
        open={dialog === 'promote'}
        onClose={() => setDialog(null)}
        domain={domain}
      />
      <RollbackDialog
        open={dialog === 'rollback'}
        onClose={() => setDialog(null)}
        deploymentId={row.id}
      />
    </>
  );
};

const DetailValue = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn('text-[14px] text-[#19202F] leading-5', className)}>{children}</p>
);

const AgentActionsMenu = () => (
  <DropdownMenuPrimitive.Root>
    <DropdownMenuPrimitive.Trigger asChild>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 h-8 px-2 rounded text-[14px] font-medium text-[#5B6579] bg-transparent hover:bg-[#F3F4F6] hover:text-[#19202F] transition-colors data-[state=open]:bg-[#F3F4F6] data-[state=open]:text-[#19202F]"
        aria-label="Agent actions"
      >
        <MoreHorizontal size={16} />
      </button>
    </DropdownMenuPrimitive.Trigger>
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align="end"
        sideOffset={4}
        className="z-50 w-[188px] rounded-lg border border-[rgba(0,54,175,0.07)] bg-white p-2 shadow-[0px_0px_4px_rgba(0,0,0,0.2),0px_0px_0px_1px_rgba(0,54,175,0.07)] animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuPrimitive.Item className="flex items-center gap-1 px-1 py-1.5 rounded text-[14px] text-[#19202F] cursor-default select-none outline-none hover:bg-[#F3F4F6] focus:bg-[#F3F4F6]">
          <span className="flex-1">Duplicate Agent</span>
        </DropdownMenuPrimitive.Item>
        <DropdownMenuPrimitive.Item className="flex items-center gap-1 px-1 py-1.5 rounded text-[14px] text-[#DC2626] cursor-default select-none outline-none hover:bg-[#FEF2F2] focus:bg-[#FEF2F2]">
          <span className="flex-1">Delete Agent</span>
        </DropdownMenuPrimitive.Item>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  </DropdownMenuPrimitive.Root>
);

// ─── Build Detail View ────────────────────────────────────────────────────────

type LogVariant = 'plain' | 'muted' | 'success' | 'warning' | 'error' | 'file-css' | 'file-js';
type LogEntry = { ts: string; text: string; variant?: LogVariant; highlight?: boolean };

const MOCK_BUILD_LOGS: LogEntry[] = [
  { ts: '14:47:03.001', text: 'Cloning repository (Branch: "main", Commit: ccaf6f3)' },
  { ts: '14:47:03.812', text: 'Cloning completed: 1.234s', variant: 'muted' },
  { ts: '14:47:03.812', text: '' },
  { ts: '14:47:04.100', text: 'Running build in Washington D.C., USA (East) – iad1', variant: 'muted' },
  { ts: '14:47:04.100', text: '' },
  { ts: '14:47:04.201', text: 'Installing dependencies...' },
  { ts: '14:47:04.202', text: 'npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory.' },
  { ts: '14:47:04.203', text: 'npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported.' },
  { ts: '14:47:06.554', text: 'added 248 packages in 12.3s', variant: 'muted' },
  { ts: '14:47:06.554', text: '' },
  { ts: '14:47:06.600', text: 'Running "npm run build"' },
  { ts: '14:47:06.901', text: 'vite v5.2.11 building for production...' },
  { ts: '14:47:06.902', text: 'transforming...' },
  { ts: '14:47:12.124', text: '✓  2847 modules transformed.', variant: 'success' },
  { ts: '14:47:14.254', text: '' },
  { ts: '14:47:14.254', text: 'dist/assets/index-C40rNR-R.css     35.06 kB  │  gzip:   7.20 kB', variant: 'file-css' },
  { ts: '14:47:14.255', text: 'dist/assets/index-m7QKTTJs.js  1,400.87 kB  │  gzip: 370.19 kB', variant: 'file-js' },
  { ts: '14:47:14.255', text: '' },
  { ts: '14:47:14.255', text: '(!) Some chunks are larger than 500 kB after minification. Consider:', variant: 'warning' },
  { ts: '14:47:14.255', text: '- Using dynamic import() to code-split the application', variant: 'warning' },
  { ts: '14:47:14.255', text: '- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks', variant: 'warning' },
  { ts: '14:47:14.256', text: '- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.', variant: 'warning', highlight: true },
  { ts: '14:47:14.256', text: '' },
  { ts: '14:47:14.256', text: '✓ built in 8.48s', variant: 'success' },
  { ts: '14:47:14.256', text: '' },
  { ts: '14:47:14.396', text: 'Build Completed in /vercel/output [18s]' },
  { ts: '14:47:14.397', text: '' },
  { ts: '14:47:16.743', text: 'Deploying outputs...' },
  { ts: '14:47:16.427', text: 'Deployment completed', variant: 'success' },
  { ts: '14:47:17.465', text: 'Creating build cache...' },
  { ts: '14:47:28.724', text: 'Created build cache: 11s', variant: 'muted' },
  { ts: '14:47:28.724', text: 'Uploading build cache [39.48 MB]' },
  { ts: '14:47:29.353', text: 'Build cache uploaded: 629.391ms', variant: 'muted' },
];

const BUILDING_LOGS: LogEntry[] = MOCK_BUILD_LOGS.slice(0, 13);

const LOG_COLORS: Record<LogVariant, string> = {
  plain:    'text-[#19202F]',
  muted:    'text-[#818EA9]',
  success:  'text-[#16a34a]',
  warning:  'text-[#92400e]',
  error:    'text-[#b91c1c]',
  'file-css': 'text-[#e11d48]',
  'file-js':  'text-[#b45309]',
};

const BuildLogsPanel = ({ status }: { status: HistoryRowStatus }) => {
  const isBuilding = status === 'building';
  const logs = isBuilding ? BUILDING_LOGS : MOCK_BUILD_LOGS;
  const warningCount = logs.filter(l => l.variant === 'warning').length;
  const duration = isBuilding ? null : '22s';

  return (
    <div className="rounded-lg border border-[#D1DAEB] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 bg-[#F8FAFC] border-b border-[#D1DAEB]">
        <div className="flex items-center gap-2">
          <ChevronDown size={14} className="text-[#818EA9]" />
          <span className="text-[14px] font-medium text-[#19202F]">Build Logs</span>
        </div>
        <div className="flex items-center gap-2">
          {duration && <span className="text-[13px] text-[#818EA9]">{duration}</span>}
          {isBuilding
            ? <Loader2 size={16} className="animate-spin text-[#714DFF]" />
            : status === 'error'
              ? <div className="w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center"><X size={11} className="text-white" /></div>
              : <CheckCircle2 size={18} className="text-[#2563EB]" style={{ fill: '#2563EB', color: 'white' }} />
          }
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 h-9 bg-white border-b border-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[12px] text-[#5B6579]">
            <Copy size={12} className="shrink-0" />
            {logs.length} lines
          </span>
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-[12px] text-[#B45309]">
              <AlertTriangle size={12} className="shrink-0" />
              {warningCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-[#9CA3AF] border border-[#E5E7EB] rounded px-2 h-6">
          <Search size={11} className="shrink-0" />
          <span>Find in logs</span>
          <span className="ml-1 font-mono text-[11px]">⌘ F</span>
        </div>
      </div>

      {/* Log lines */}
      <div className="overflow-y-auto bg-white" style={{ maxHeight: 360 }}>
        {logs.map((entry, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-4 px-4 py-px font-mono text-[12px] leading-[1.7]',
              entry.highlight && 'bg-[#FFFBEB]',
            )}
          >
            <span className="shrink-0 text-[#B0BCCE] select-none w-[100px]">{entry.ts}</span>
            <span className={cn(LOG_COLORS[entry.variant ?? 'plain'], 'whitespace-pre-wrap break-all')}>
              {entry.text}
            </span>
          </div>
        ))}
        {isBuilding && (
          <div className="flex items-center gap-2 px-4 py-2 font-mono text-[12px] text-[#714DFF]">
            <Loader2 size={11} className="animate-spin shrink-0" />
            <span>Streaming logs…</span>
          </div>
        )}
      </div>
    </div>
  );
};

const BuildDetailView = ({
  row,
  agentName,
  domain,
  onBack,
}: {
  row: DeployHistoryRow;
  agentName: string;
  domain: string;
  onBack: () => void;
}) => (
  <div className="flex flex-col w-full pb-10 gap-6">
    {/* Header row */}
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 h-8 px-2 rounded text-[14px] font-medium text-[#5B6579] bg-transparent hover:bg-[#F3F4F6] hover:text-[#19202F] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        Back to {agentName}
      </button>
      <RowActionsMenu row={row} domain={domain} />
    </div>

    {/* Build header */}
    <div className="bg-white border border-[#D1DAEB] rounded-lg px-8 py-6 flex items-center gap-10">
      <div className="flex flex-col gap-1">
        <DetailLabel>Build</DetailLabel>
        <p className="text-[14px] font-semibold text-[#19202F]">{row.id}</p>
      </div>
      <div className="flex flex-col gap-1">
        <DetailLabel>Status</DetailLabel>
        <div className="pt-0.5"><HistoryStatusBadge status={row.status} /></div>
      </div>
      <div className="flex flex-col gap-1">
        <DetailLabel>Created</DetailLabel>
        <p className="text-[14px] text-[#19202F]">{row.relativeTime}</p>
      </div>
      <div className="flex flex-col gap-1">
        <DetailLabel>Author</DetailLabel>
        <p className="text-[14px] text-[#19202F]">{row.authorLine}</p>
      </div>
      {row.commitLine && (
        <div className="flex flex-col gap-1">
          <DetailLabel>Commit</DetailLabel>
          <div className="flex items-center gap-1.5 text-[14px] text-[#19202F]">
            <GitCommit size={13} className="text-[#818EA9] shrink-0" />
            <span className="font-mono">{row.commitLine}</span>
          </div>
        </div>
      )}
    </div>

    {/* Build logs */}
    <BuildLogsPanel status={row.status} />
  </div>
);

const AgentDetailView = ({ agent, onBack, hosting }: { agent: Agent; onBack: () => void; hosting: string }) => {
  const d = getAgentDetail(agent);
  const desc = detailDescription(agent);
  const isScale = hosting === 'scale';
  const isNewDeploy = !!agent.initialVersion;
  const baseBuildHistory = isNewDeploy ? [] : (isScale ? SCALE_BUILD_HISTORY : DEPLOYMENT_HISTORY);

  const [extraBuilds, setExtraBuilds] = useState<DeployHistoryRow[]>(() =>
    isNewDeploy
      ? [{ id: agent.initialVersion!, status: 'building', relativeTime: 'Just now', authorLine: 'Just now by you' }]
      : [],
  );
  const [addBuildOpen, setAddBuildOpen] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<DeployHistoryRow | null>(null);
  const allBuilds = [...extraBuilds, ...baseBuildHistory];

  useEffect(() => {
    if (!isNewDeploy) return;
    const timer = setTimeout(() => {
      setExtraBuilds(prev =>
        prev.map(b =>
          b.id === agent.initialVersion
            ? { ...b, status: 'ready', current: true, commitLine: `${Math.random().toString(16).slice(2, 9)} deploy ${agent.initialVersion}` }
            : b,
        ),
      );
    }, 10000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddBuild = (version: string) => {
    setExtraBuilds(prev => [{
      id: version,
      status: 'ready',
      relativeTime: 'Just now',
      authorLine: 'Just now by you',
    }, ...prev]);
  };

  if (selectedBuild) {
    return (
      <BuildDetailView
        row={selectedBuild}
        agentName={agent.name}
        domain={d.domains}
        onBack={() => setSelectedBuild(null)}
      />
    );
  }

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="flex items-center justify-between w-full mb-[18px]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 h-8 px-2 rounded text-[14px] font-medium text-[#5B6579] bg-transparent hover:bg-[#F3F4F6] hover:text-[#19202F] transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to Agents
        </button>
        <AgentActionsMenu />
      </div>

      <div className="flex flex-col gap-8 w-full">
        <div className="bg-white border border-[#D1DAEB] rounded-lg p-10 w-full flex items-center justify-between">
        <div className="flex flex-col gap-8 w-[408px] shrink-0">
          <div className="flex flex-col gap-2">
            <span className="text-[14px] text-[#5B6579]">{d.source}</span>
            <h1 className="text-[28px] font-semibold text-[#111827] tracking-[-0.4px] leading-9">{d.name}</h1>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[14px] text-[#5B6579] truncate font-mono tabular-nums">{d.shortId}</span>
              <button
                type="button"
                className="p-1.5 rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280] shrink-0"
                aria-label="Copy agent ID"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: ACCENT }}
            >
              <ExternalLink size={14} />
              Open Agent
            </button>
            <button
              type="button"
              className="inline-flex items-center h-8 px-3 rounded text-[14px] font-medium border border-[#714DFF] text-[#714DFF] bg-white hover:bg-[#F8F6FF] transition-colors"
            >
              View Traces
            </button>
            <button
              type="button"
              className="inline-flex items-center h-8 px-3 rounded text-[14px] font-medium border border-[#714DFF] text-[#714DFF] bg-white hover:bg-[#F8F6FF] transition-colors"
            >
              View Evaluations
            </button>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <DetailLabel>Description</DetailLabel>
            <p className="text-[14px] text-[#19202F] leading-5">{desc}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-[622px] shrink-0">
          <div className="flex flex-col gap-2">
            <DetailLabel>Deployment</DetailLabel>
            <DetailValue>{d.deploymentId}</DetailValue>
          </div>

          <div className="flex flex-col gap-2">
            <DetailLabel>Domains</DetailLabel>
            <a
              href="#"
              className="text-[14px] text-[#19202F] leading-5 underline-offset-2 hover:underline"
              onClick={e => e.preventDefault()}
            >
              {d.domains}
            </a>
          </div>

          <div className="flex items-start gap-10">
            <div className="flex flex-col gap-2 w-[132px]">
              <DetailLabel>Status</DetailLabel>
              <div className="pt-0.5"><StatusBadge status={d.status} /></div>
            </div>
            <div className="flex flex-col gap-2 w-[132px]">
              <DetailLabel>ACT Type</DetailLabel>
              <div className="pt-0.5"><AgenticTag label={d.actType} /></div>
            </div>
            <div className="flex flex-col gap-2 w-[132px]">
              <DetailLabel>Created</DetailLabel>
              <DetailValue>{d.created}</DetailValue>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <DetailLabel>Source</DetailLabel>
            <div className="flex flex-col gap-2">
              {!isScale && (
                <div className="flex items-center gap-2 text-[14px] text-[#19202F]">
                  <GitBranch size={14} className="shrink-0 text-[#5B6579]" />
                  <span>{d.branch}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[14px] text-[#19202F] min-w-0">
                <GitCommit size={14} className="shrink-0 text-[#5B6579]" />
                <span className="truncate">{d.commitMessage}</span>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#111827]">Build History</h2>
              {isScale && (
                <button
                  type="button"
                  onClick={() => setAddBuildOpen(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-[14px] font-medium border border-[#714DFF] text-[#714DFF] bg-white hover:bg-[#F8F6FF] transition-colors"
                >
                  <Plus size={14} />
                  Add Build
                </button>
              )}
            </div>
            {!isScale && (
              <div className="flex items-center gap-2 text-[14px] text-[#5B6579]">
                <RefreshCw size={12} className="shrink-0" />
                <span>
                  Automatically created for pushes to{' '}
                  <span className="inline-flex items-center gap-1 text-[#19202F]">
                    <GithubIcon size={14} className="shrink-0" />
                    {d.repository}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="rounded border border-[#D1DAEB] overflow-hidden">
            {allBuilds.map((row, i) => (
              <div
                key={row.id}
                onClick={() => setSelectedBuild(row)}
                className={cn(
                  'flex items-center justify-between h-[89px] px-6 overflow-hidden cursor-pointer hover:bg-[#FAFBFF] transition-colors',
                  i > 0 && 'border-t border-[rgba(0,50,145,0.18)]',
                )}
              >
                <div className="w-[170px] shrink-0 flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#19202F]">{row.id}</span>
                  {row.current && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EDE9FE] text-[#5B21B6]">
                      Current
                    </span>
                  )}
                </div>

                <div className="w-[116px] shrink-0 flex flex-col gap-2 justify-center items-start">
                  <HistoryStatusBadge status={row.status} />
                  <span className="text-[12px] text-[#5B6579] leading-4 tracking-[0.04px]">{row.relativeTime}</span>
                </div>

                <div className="w-[165px] shrink-0 flex flex-col gap-1">
                  {row.redeployLabel ? (
                    <div className="flex items-center gap-2">
                      <RotateCcw size={14} className="shrink-0 text-[#818EA9]" />
                      <span className="text-[14px] text-[#19202F] leading-5 whitespace-nowrap">{row.redeployLabel}</span>
                    </div>
                  ) : (
                    <>
                      {!isScale && (
                        <div className="flex items-center gap-2 text-[14px] text-[#19202F]">
                          <GitBranch size={14} className="shrink-0 text-[#818EA9]" />
                          <span className="whitespace-nowrap">{row.sourceBranch}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[14px] text-[#19202F]">
                        <GitCommit size={14} className="shrink-0 text-[#818EA9]" />
                        <span className="whitespace-nowrap">{row.commitLine}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="w-[165px] shrink-0 text-[14px] text-[#5B6579] whitespace-nowrap">
                  {row.authorLine}
                </div>

                <div onClick={e => e.stopPropagation()}>
                  <RowActionsMenu row={row} domain={d.domains} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AddBuildDialog
        open={addBuildOpen}
        onClose={() => setAddBuildOpen(false)}
        onConfirm={handleAddBuild}
      />
    </div>
  );
};

// ─── View Toggle ──────────────────────────────────────────────────────────────

const ViewToggle = ({ view, setView }: { view: 'grid' | 'list'; setView: (v: 'grid' | 'list') => void }) => (
  <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden">
    <button
      onClick={() => setView('grid')}
      className={cn(
        'flex items-center justify-center w-8 h-7 transition-colors',
        view === 'grid' ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-white text-[#9CA3AF] hover:text-[#6B7280]',
      )}
    >
      <LayoutGrid size={14} />
    </button>
    <button
      onClick={() => setView('list')}
      className={cn(
        'flex items-center justify-center w-8 h-7 border-l border-[#E5E7EB] transition-colors',
        view === 'list' ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-white text-[#9CA3AF] hover:text-[#6B7280]',
      )}
    >
      <List size={14} />
    </button>
  </div>
);

// ─── Prototype ────────────────────────────────────────────────────────────────

const AgentexCICD: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const { params } = useTweakpane(
    { hosting: 'github' },
    { hosting: { options: { 'Github Hosted': 'github', 'Scale Hosted': 'scale' } } },
  );

  const handleCreateAgent = (name: string, version: string) => {
    const now = new Date();
    const newAgent: Agent = {
      id: `scale-${Date.now()}`,
      source: 'Agentex',
      hosting: 'scale',
      initialVersion: version,
      name,
      status: 'draft',
      description: 'An agentex agent that is designed to do something special with your inputs.',
      lastModified: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setAgents(prev => [newAgent, ...prev]);
    setSelectedAgent(newAgent);
  };

  return (
    <ShowIconsContext.Provider value={true}>
      <ShowDescriptionsContext.Provider value={true}>
        <div className="min-h-screen bg-white flex flex-col">
          <div className="shadow-sm">
            <NavV3 appPickerInBranding={false} />
          </div>

          <main className="flex-1 w-full px-6 pb-6 pt-[18px] flex flex-col gap-4">
            {selectedAgent ? (
              <AgentDetailView agent={selectedAgent} onBack={() => setSelectedAgent(null)} hosting={selectedAgent.hosting ?? params.hosting} />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-[20px] font-semibold text-[#111827]">Agents</h1>
                  <button
                    onClick={() => setCreateAgentOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium text-white transition-colors hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    <Plus size={14} />
                    Create Agent
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <ViewToggle view={view} setView={setView} />
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280] transition-colors">
                      <Search size={15} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280] transition-colors">
                      <SlidersHorizontal size={15} />
                    </button>
                  </div>
                </div>

                <div
                  className={cn(
                    'grid gap-4 items-start',
                    view === 'grid' ? 'grid-cols-4' : 'grid-cols-1',
                  )}
                >
                  {agents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
        <CreateAgentDialog
          open={createAgentOpen}
          onClose={() => setCreateAgentOpen(false)}
          onConfirm={handleCreateAgent}
        />
      </ShowDescriptionsContext.Provider>
    </ShowIconsContext.Provider>
  );
};

export const title = 'Agentex CI/CD';
export const route = '/agentex-cicd';

export default AgentexCICD;
