import React, { useState, useEffect, useCallback } from 'react';
import { useTweakpane } from '@/lib/tweakpane';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {
  Check, ChevronDown, ExternalLink, Loader2, CalendarDays,
  MessageSquare, Search, Sparkles,
  X, ArrowRight, CheckCircle2, Clock, FlaskConical,
  ChevronRight, AlertTriangle, BookOpen,
  Copy, Download,
} from 'lucide-react';
import { NavV3 } from '../sgp-nav/SgpNav';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = '#714DFF';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TRACES = [
  { id: 'tr_a1b2c3d4', spanId: 'sp_v1_001', userId: 'Version 1', traceName: 'Prompt Engineer', timestamp: 'Aug 26, 14:30:24', duration: '5.3s', status: 'success', input: 'What are the biggest risks when investing?', output: 'Here are the main categories to be aware of: market risk, liquidity risk...' },
  { id: 'tr_e5f6g7h8', spanId: 'sp_v1_002', userId: 'Version 1', traceName: 'Prompt Engineer', timestamp: 'Aug 26, 14:31:10', duration: '4.1s', status: 'error',   input: 'Explain compound interest simply', output: 'ERROR: Tool call timeout after 4000ms' },
  { id: 'tr_i9j0k1l2', spanId: 'sp_v2_001', userId: 'Version 2', traceName: 'Prompt Engineer', timestamp: 'Aug 26, 14:31:44', duration: '6.7s', status: 'success', input: 'What is dollar-cost averaging?', output: 'Dollar-cost averaging (DCA) is an investment strategy...' },
  { id: 'tr_m3n4o5p6', spanId: 'sp_v2_002', userId: 'Version 2', traceName: 'Prompt Engineer', timestamp: 'Aug 26, 14:32:03', duration: '3.2s', status: 'error',   input: 'How do index funds work?', output: 'ERROR: Context window exceeded — response truncated' },
  { id: 'tr_q7r8s9t0', spanId: 'sp_v1_003', userId: 'Version 1', traceName: 'Doc Extraction', timestamp: 'Aug 26, 14:32:30', duration: '8.9s', status: 'success', input: 'Summarise the Q3 earnings report', output: 'Q3 2024 earnings highlights: Revenue $4.2B (+12% YoY)...' },
  { id: 'tr_u1v2w3x4', spanId: 'sp_v1_004', userId: 'Version 1', traceName: 'Doc Extraction', timestamp: 'Aug 26, 14:33:01', duration: '2.1s', status: 'error',   input: 'Extract key metrics from this PDF', output: 'ERROR: PDF parser failed — unsupported encoding' },
  { id: 'tr_y5z6a7b8', spanId: 'sp_v2_003', userId: 'Version 2', traceName: 'Doc Extraction', timestamp: 'Aug 26, 14:33:15', duration: '9.4s', status: 'success', input: 'What were the main takeaways from last quarter?', output: 'Based on the documents provided, the key takeaways are...' },
  { id: 'tr_c9d0e1f2', spanId: 'sp_v2_004', userId: 'Version 2', traceName: 'Prompt Engineer', timestamp: 'Aug 26, 14:33:44', duration: '1.8s', status: 'error',   input: 'Describe the risks of crypto investing', output: 'ERROR: Rate limit exceeded — retry after 30s' },
  { id: 'tr_g3h4i5j6', spanId: 'sp_v1_005', userId: 'Version 1', traceName: 'Prompt Engineer', timestamp: 'Aug 26, 14:34:00', duration: '5.5s', status: 'success', input: 'What is a bond ladder strategy?', output: 'A bond ladder is a portfolio of bonds with staggered maturity dates...' },
  { id: 'tr_k7l8m9n0', spanId: 'sp_v2_005', userId: 'Version 2', traceName: 'Doc Extraction', timestamp: 'Aug 26, 14:34:22', duration: '4.8s', status: 'success', input: 'Analyse sector allocation in this portfolio', output: 'Sector allocation analysis: Technology 32%, Healthcare 18%...' },
];

// ─── Subagent progress steps ──────────────────────────────────────────────────

const PROGRESS_STEPS = [
  { id: 'extract',     label: 'Extraction Agent',   description: 'Loading and parsing selected traces…',         duration: 1800 },
  { id: 'segment',     label: 'Segmentation Agent', description: 'Grouping traces by behaviour patterns…',       duration: 2200 },
  { id: 'investigate', label: 'Investigator Agent', description: 'Comparing error vs success segments…',         duration: 2600 },
  { id: 'reason',      label: 'Reasoning Agent',    description: 'Synthesising root causes and hypotheses…',     duration: 2000 },
  { id: 'report',      label: 'Report Agent',        description: 'Generating structured Insights Report…',      duration: 1400 },
];

// ─── Mock report ──────────────────────────────────────────────────────────────

// ─── Shared primitives ────────────────────────────────────────────────────────

const Badge = ({ children, variant = 'neutral', className }: {
  children: React.ReactNode; variant?: 'success' | 'error' | 'neutral' | 'accent'; className?: string
}) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium',
    variant === 'success' && 'bg-green-3 text-green-11',
    variant === 'error'   && 'bg-red-3 text-red-11',
    variant === 'neutral' && 'bg-gray-3 text-gray-11',
    variant === 'accent'  && 'text-white',
    className,
  )} style={variant === 'accent' ? { background: ACCENT } : undefined}>
    {children}
  </span>
);

// Clickable Trace ID chip with tooltip + deep-link
const TraceLink = ({ id }: { id: string }) => (
  <Tooltip.Provider delayDuration={200}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-medium border transition-colors"
          style={{ color: ACCENT, borderColor: `${ACCENT}40`, background: `${ACCENT}0d` }}
        >
          {id}
          <ExternalLink size={9} />
        </a>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          className="z-50 px-2.5 py-1.5 rounded-md bg-gray-12 text-gray-1 text-[12px] shadow-lg flex items-center gap-1.5"
        >
          <ExternalLink size={10} /> Open in Trace Viewer
          <Tooltip.Arrow className="fill-gray-12" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

// ─── Promote to Eval Dialog ───────────────────────────────────────────────────

const PromoteToEvalDialog = ({ traceIds, trigger }: { traceIds: string[]; trigger: React.ReactNode }) => {
  const [done, setDone] = useState(false);
  return (
    <Dialog.Root onOpenChange={() => setDone(false)}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-4 p-6 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-[15px] font-semibold text-gray-12 flex items-center gap-2">
                <FlaskConical size={16} style={{ color: ACCENT }} />
                Promote to Eval
              </Dialog.Title>
              <Dialog.Description className="text-[13px] text-gray-10">
                Turn this failure mode into a regression test in the Evaluations tab.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-1 rounded hover:bg-gray-3 text-gray-9"><X size={14} /></button>
            </Dialog.Close>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 size={32} className="text-green-9" />
              <p className="text-[14px] font-medium text-gray-12">Eval case created!</p>
              <p className="text-[12px] text-gray-10 text-center">
                {traceIds.length} trace{traceIds.length > 1 ? 's' : ''} added as LLM-as-a-Judge regression tests.
              </p>
              <Dialog.Close asChild>
                <button className="mt-1 text-[13px] font-medium px-4 py-1.5 rounded-md border border-gray-5 hover:bg-gray-2 text-gray-11">Close</button>
              </Dialog.Close>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-gray-10">Eval name</label>
                  <input
                    className="h-8 px-2.5 rounded-md border border-gray-6 text-[13px] text-gray-12 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
                    defaultValue="Tool call timeout regression — Aug 26"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-gray-10">Grader type</label>
                  <select className="h-8 px-2.5 rounded-md border border-gray-6 text-[13px] text-gray-12 bg-white focus:outline-none">
                    <option>LLM-as-a-Judge (GPT-4o)</option>
                    <option>Rule-based exact match</option>
                    <option>Semantic similarity</option>
                  </select>
                </div>
                <div className="rounded-lg bg-gray-2 border border-gray-4 p-3 flex flex-col gap-1.5">
                  <p className="text-[12px] font-medium text-gray-10">Traces included ({traceIds.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {traceIds.map(id => <TraceLink key={id} id={id} />)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Dialog.Close asChild>
                  <button className="h-8 px-3.5 rounded-md border border-gray-5 text-[13px] text-gray-11 hover:bg-gray-2">Cancel</button>
                </Dialog.Close>
                <button
                  onClick={() => setDone(true)}
                  className="h-8 px-4 rounded-md text-[13px] font-medium text-white flex items-center gap-1.5"
                  style={{ background: ACCENT }}
                >
                  <FlaskConical size={13} /> Create eval case
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ─── Insights Report ──────────────────────────────────────────────────────────

type FindingImpact = 'High' | 'Medium' | 'Low';
type FindingType = 'Failure' | 'Silent Failure' | 'Success Pattern' | 'Efficiency Issue';

interface Finding {
  id: string;
  title: string;
  impact: FindingImpact;
  prevalence: string;
  type: FindingType;
  description: string;
  evidence: { traceIds: string[]; note: string };
  rootCause: string;
  suggestedAction: string;
}

const IMPACT_DOT: Record<FindingImpact, string> = {
  High:   'bg-red-9',
  Medium: 'bg-amber-9',
  Low:    'bg-gray-7',
};

const MdH2 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[13px] font-semibold text-gray-12 tracking-tight">{children}</h3>
);

const MdField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <p className="text-[13px] text-gray-11 leading-relaxed">
    <strong className="font-semibold text-gray-12">{label}:</strong>{' '}{children}
  </p>
);

const MdDivider = () => <div className="border-t border-gray-3" />;

const FindingBlock = ({ finding, index }: { finding: Finding; index: number }) => (
  <div className="flex flex-col gap-2.5 py-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <div className={cn('mt-[5px] w-1.5 h-1.5 rounded-full shrink-0', IMPACT_DOT[finding.impact])} />
        <h4 className="text-[13px] font-semibold text-gray-12 leading-snug">
          Finding {index + 1}: {finding.title}
        </h4>
      </div>
      <PromoteToEvalDialog
        traceIds={finding.evidence.traceIds}
        trigger={
          <button className="h-5 px-2 rounded text-[10px] font-medium text-white flex items-center gap-1 shrink-0" style={{ background: ACCENT }}>
            <FlaskConical size={9} /> Eval
          </button>
        }
      />
    </div>

    <p className="text-[12px] text-gray-9 pl-3.5">
      <strong className="text-gray-11">Impact:</strong> {finding.impact}
      <span className="mx-1.5 text-gray-5">·</span>
      <strong className="text-gray-11">Type:</strong> {finding.type}
      <span className="mx-1.5 text-gray-5">·</span>
      <strong className="text-gray-11">Prevalence:</strong> {finding.prevalence}
    </p>

    <div className="pl-3.5 flex flex-col gap-2">
      <MdField label="Description">{finding.description}</MdField>
      <MdField label="Evidence">
        {finding.evidence.note}{' '}
        <span className="inline-flex flex-wrap gap-1 ml-0.5">
          {finding.evidence.traceIds.map(id => <TraceLink key={id} id={id} />)}
        </span>
      </MdField>
      <MdField label="Root Cause">{finding.rootCause}</MdField>
      <MdField label="Suggested Action">
        <strong className="font-medium text-gray-12">{finding.suggestedAction}</strong>
      </MdField>
    </div>
  </div>
);

const InsightsReport = ({ selectedIds }: { selectedIds: string[] }) => {
  const errorIds = MOCK_TRACES.filter(t => selectedIds.includes(t.id) && t.status === 'error').map(t => t.id);

  const findings: Finding[] = [
    {
      id: 'f1',
      title: 'Tool call timeout hard-kills downstream pipeline',
      impact: 'High',
      prevalence: `${Math.round((2 / selectedIds.length) * 100)}% of traces (2 of ${selectedIds.length})`,
      type: 'Failure',
      description: 'When the retrieval step exceeds the 4 000 ms budget, all downstream tool calls are cancelled without retry logic, producing hard errors instead of graceful degradations.',
      evidence: {
        traceIds: [errorIds[0]].filter(Boolean),
        note: 'Observed in Prompt Engineer v1 (sp_v1_001) and Doc Extraction v1 (sp_v1_004). Both failed with "Tool call timeout after 4000ms".',
      },
      rootCause: 'The Extraction and Prompt-Engineer agents share a single timeout budget with no per-tool override and no retry handler, so a single slow retrieval kills the entire trace.',
      suggestedAction: 'Increase per-tool timeout to 12 000 ms and add exponential back-off retry (max 3 attempts) for retrieval tool calls.',
    },
    {
      id: 'f2',
      title: 'Context window overflow in Version 2 system prompt',
      impact: 'High',
      prevalence: `${Math.round((1 / selectedIds.length) * 100)}% of traces (1 of ${selectedIds.length})`,
      type: 'Failure',
      description: 'Version 2 of the Prompt Engineer agent uses a larger system prompt (+1 800 tokens). Combined with multi-turn history, total token count exceeds the 16 384 limit before the final user turn is appended.',
      evidence: {
        traceIds: [errorIds[1]].filter(Boolean),
        note: '"Context window exceeded — response truncated" error on Prompt Engineer v2 (sp_v2_002) when processing a multi-turn financial Q&A session.',
      },
      rootCause: 'No sliding-window or history summarisation mechanism exists; the full conversation history is concatenated verbatim into the context.',
      suggestedAction: 'Implement sliding-window history compression: summarise turns beyond the last 4 into a rolling summary, keeping total prompt under 12 000 tokens.',
    },
    {
      id: 'f3',
      title: 'Rate-limit burst on external financial-data API',
      impact: 'Medium',
      prevalence: `${Math.round((1 / selectedIds.length) * 100)}% of traces (1 of ${selectedIds.length})`,
      type: 'Failure',
      description: 'Three traces within a 90-second window hit the same third-party financial-data API endpoint. The provider enforces a 2 rpm burst limit; the third request receives a 429 that is not treated as retryable.',
      evidence: {
        traceIds: [errorIds[2]].filter(Boolean),
        note: '"Rate limit exceeded — retry after 30s" on Prompt Engineer v2 (sp_v2_004). Timestamps confirm all three calls within a 90 s window.',
      },
      rootCause: 'The agent does not track request cadence per external endpoint; 429 responses are classified as non-retryable errors rather than triggering backoff.',
      suggestedAction: 'Add rate-limit-aware queuing with jitter for external API calls. Cache identical queries for up to 5 minutes to reduce duplicate calls.',
    },
  ];

  return (
    <div className="flex flex-col gap-0 max-w-2xl">
      {/* Report header */}
      <div className="flex items-start justify-between gap-4 pb-5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: ACCENT }} />
            <h2 className="text-[15px] font-semibold text-gray-12">Insights Report</h2>
          </div>
          <p className="text-[12px] text-gray-9 pl-6 italic">Why are some traces failing?</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="neutral">{selectedIds.length} traces</Badge>
          <button className="h-7 px-2.5 rounded-md border border-gray-5 text-[12px] text-gray-10 hover:bg-gray-2 flex items-center gap-1.5">
            <Copy size={11} /> Copy
          </button>
          <button className="h-7 px-2.5 rounded-md border border-gray-5 text-[12px] text-gray-10 hover:bg-gray-2 flex items-center gap-1.5">
            <Download size={11} /> Export
          </button>
        </div>
      </div>

      <MdDivider />

      {/* Executive Summary */}
      <div className="flex flex-col gap-3 py-5">
        <MdH2>Executive Summary</MdH2>
        <p className="text-[13px] text-gray-11 leading-relaxed">
          Analysis of <strong>{selectedIds.length} traces</strong> from <em>Aug 26 14:30–14:35</em> reveals a{' '}
          <strong className="text-red-11">40% hard-error rate</strong> ({errorIds.length} failures across {selectedIds.length} sampled traces).
          All failures are attributable to infrastructure-level constraints — timeout budgets, token limits, and rate-limit handling —
          rather than prompt quality or model behaviour. Success-path traces (Version 2 Doc Extraction) consistently outperform
          Version 1 on latency when these constraints are not triggered.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total traces',  value: selectedIds.length,                                              icon: BookOpen,     color: 'text-blue-10',  bg: 'bg-blue-2' },
            { label: 'Error rate',    value: `${Math.round((errorIds.length / selectedIds.length) * 100)}%`, icon: AlertTriangle, color: 'text-red-10',   bg: 'bg-red-2'  },
            { label: 'Avg latency',   value: '4.8s',                                                         icon: Clock,        color: 'text-amber-10', bg: 'bg-amber-2'},
          ].map(s => (
            <div key={s.label} className={cn('rounded-lg p-3 flex flex-col gap-1', s.bg)}>
              <s.icon size={13} className={s.color} />
              <p className="text-[18px] font-bold text-gray-12">{s.value}</p>
              <p className="text-[11px] text-gray-10">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <MdDivider />

      {/* Key Findings */}
      <div className="flex flex-col py-5 gap-1">
        <MdH2>Key Findings</MdH2>
        <div className="divide-y divide-gray-3">
          {findings.map((f, i) => <FindingBlock key={f.id} finding={f} index={i} />)}
        </div>
      </div>

      <MdDivider />

      {/* Additional Observations */}
      <div className="flex flex-col gap-3 py-5">
        <MdH2>Additional Observations</MdH2>
        <p className="text-[13px] text-gray-11 leading-relaxed">
          <strong className="text-gray-12">Version 2 outperforms Version 1 on successful traces.</strong>{' '}
          When no infrastructure constraints are triggered, Version 2 Doc Extraction traces average 7.05 s vs 5.3 s for Version 1 —
          likely due to the larger prompt retrieving richer context. This warrants further benchmarking before concluding Version 1 is faster.
        </p>
        <p className="text-[13px] text-gray-11 leading-relaxed">
          <strong className="text-gray-12">No evidence of prompt-quality regression.</strong>{' '}
          Output quality in success-path traces appears comparable across versions; error messages are exclusively infrastructure-originated.
          The hypothesis that Version 2 prompt changes caused output degradation was not confirmed.
        </p>
        <p className="text-[13px] text-gray-11 leading-relaxed">
          <strong className="text-gray-12">PDF parser failure (sp_v1_004) may share a cause with the timeout pattern</strong> but could not be confirmed
          with the current sample size — only one Doc Extraction failure was observed.
        </p>
      </div>

      <MdDivider />

      {/* Methodology */}
      <div className="flex flex-col gap-3 py-5">
        <MdH2>Methodology</MdH2>
        {[
          { label: 'Sample',      value: `${selectedIds.length} traces from Aug 26 14:30–14:35; ${errorIds.length} error, ${selectedIds.length - errorIds.length} success` },
          { label: 'Hypotheses',  value: '(1) Timeout budget too low; (2) V2 system prompt causes token overflow; (3) External API rate limit not handled; (4) Prompt quality regression in V2' },
          { label: 'Extractions', value: 'Error message text, span duration, user ID (version tag), trace name, tool call sequence per trace' },
          { label: 'Comparisons', value: 'Error vs success segments; Version 1 vs Version 2 within same trace name; latency distribution across both groups' },
        ].map(row => (
          <MdField key={row.label} label={row.label}>{row.value}</MdField>
        ))}
      </div>
    </div>
  );
};

// ─── Total Requests Chart ─────────────────────────────────────────────────────

// 120 data points — 30 per hour, 10am–2pm (one bar ≈ every 2 minutes)
const CHART_DATA = [
  // 10:00–10:59
   4,  6,  5,  8,  7, 10, 12, 11,  9, 13, 15, 14, 12, 16, 18,
  17, 15, 19, 22, 21, 19, 23, 26, 24, 22, 25, 27, 24, 21, 18,
  // 11:00–11:59
  16, 19, 22, 25, 23, 21, 24, 27, 25, 22, 20, 18, 15, 13, 11,
   9,  7,  5,  4,  2,  1,  1,  0,  0,  0,  0,  1,  0,  0,  0,
  // 12:00–12:59
   0,  0,  1,  0,  2,  1,  0,  3,  2,  1,  0,  0,  2,  3,  1,
   0,  0,  1,  2,  0,  3,  2,  0,  1,  0,  0,  2,  1,  0,  0,
  // 13:00–13:59
   2,  4,  7, 10, 13, 16, 18, 15, 19, 22, 20, 23, 25, 22, 20,
  23, 26, 24, 21, 24, 27, 25, 22, 20, 23, 21, 19, 16, 13, 10,
];

const TotalRequestsChart: React.FC = () => {
  const BAR_W   = 10;
  const BAR_GAP = 4;
  const CHART_H = 64;
  const LABEL_H = 18;

  const rawMax = Math.max(...CHART_DATA);
  const yMax   = Math.ceil(rawMax / 5) * 5; // round up to nearest 5

  const total = CHART_DATA.length;
  const svgW  = total * (BAR_W + BAR_GAP) - BAR_GAP;
  const svgH  = CHART_H + LABEL_H;

  // Each hour = 30 bars; labels at fixed indices
  const timeLabels: { label: string; barIdx: number }[] = [
    { label: '10am', barIdx: 0 },
    { label: '11am', barIdx: 30 },
    { label: '12pm', barIdx: 60 },
    { label: '1pm',  barIdx: 90 },
    { label: '2pm',  barIdx: total - 1 },
  ];

  return (
    <div className="bg-white shrink-0">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 pt-3 pb-4">
        <button className="flex items-center gap-1 text-[13px] font-medium text-gray-12 hover:text-gray-10 transition-colors">
          Total Requests
          <ChevronDown size={12} className="text-gray-8 mt-px" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 border border-gray-5 rounded px-2 h-8">
            <CalendarDays size={13} className="text-gray-8 shrink-0" />
            <span className="text-[13px] text-gray-12">07/31/2025</span>
          </div>
          <span className="text-[12px] text-gray-8">—</span>
          <div className="flex items-center gap-1.5 border border-gray-5 rounded px-2 h-8">
            <CalendarDays size={13} className="text-gray-8 shrink-0" />
            <span className="text-[13px] text-gray-12">07/31/2025</span>
          </div>
        </div>
      </div>

      {/* Chart — SVG stretches to full container width via width="100%" + preserveAspectRatio="none" */}
      <div className="px-6">
        <svg
          width="100%"
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {/* 4 horizontal grid lines — topmost at frac=1.0 is the y-axis ceiling; bars scale to yMax so they never cross it */}
          {[0.25, 0.5, 0.75, 1.0].map((frac, i) => {
            const y = CHART_H - frac * CHART_H;
            return (
              <line key={i} x1={0} y1={y} x2={svgW} y2={y} stroke="#E2E8F0" strokeWidth="1" />
            );
          })}

          {/* Bars */}
          {CHART_DATA.map((v, i) => {
            const barH = yMax > 0 ? (v / yMax) * CHART_H : 0;
            const x    = i * (BAR_W + BAR_GAP);
            return (
              <rect
                key={i}
                x={x}
                y={CHART_H - barH}
                width={BAR_W}
                height={barH}
                rx={1.5}
                fill="#78CFFF"
              />
            );
          })}

          {/* X-axis time labels — first/last use start/end anchor so they never clip outside the SVG */}
          {timeLabels.map(({ label, barIdx }, idx) => {
            const isFirst = idx === 0;
            const isLast  = idx === timeLabels.length - 1;
            const x = isFirst
              ? 0
              : isLast
              ? svgW
              : barIdx * (BAR_W + BAR_GAP) + BAR_W / 2;
            const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
            return (
              <text
                key={label}
                x={x}
                y={CHART_H + LABEL_H - 2}
              fontSize={10}
              fill="#94A3B8"
              textAnchor={anchor}
              fontFamily="Inter, sans-serif"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend — dot matches bar color, label uses high-contrast text */}
      <div className="px-6 pb-2.5 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#78CFFF' }} />
        <span className="text-[11px]" style={{ color: '#19202F' }}>Latency</span>
      </div>
    </div>
  );
};

// ─── Filters Panel ────────────────────────────────────────────────────────────

const FilterGroup = ({
  label, expanded, onToggle, hasClear = false, children,
}: {
  label: string; expanded: boolean; onToggle: () => void; hasClear?: boolean; children?: React.ReactNode;
}) => (
  <div className="py-3" style={{ borderBottom: '1px solid rgba(0,50,145,0.18)' }}>
    <div className="flex items-center justify-between">
      <button
        className="flex items-center gap-2.5 text-[12px] font-medium text-gray-12 flex-1 min-w-0 text-left"
        onClick={onToggle}
      >
        {expanded
          ? <ChevronDown size={11} className="shrink-0 text-gray-9" />
          : <ChevronRight size={11} className="shrink-0 text-gray-9" />
        }
        <span className="truncate">{label}</span>
      </button>
      {hasClear && expanded && (
        <button className="text-[11px] text-gray-9 underline decoration-gray-5 shrink-0 ml-2">clear</button>
      )}
    </div>
    {expanded && children && (
      <div className="mt-2 flex flex-col gap-2 pl-0.5">
        {children}
      </div>
    )}
  </div>
);

const CheckItem = ({ label, checked = true, sub = false, hash = '' }: {
  label: string; checked?: boolean; sub?: boolean; hash?: string;
}) => (
  <div className={cn('flex items-center gap-2 rounded px-1 py-0.5 -mx-1 cursor-pointer hover:bg-gray-2 transition-colors', sub ? 'pl-5' : '')}>
    <div
      className="w-3.5 h-3.5 rounded-[3px] shrink-0 flex items-center justify-center border"
      style={checked
        ? { background: ACCENT, borderColor: ACCENT }
        : { background: 'white', borderColor: '#c5cfe4' }
      }
    >
      {checked && <Check size={8} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-[12px] text-gray-12 truncate leading-tight">
      {label}
      {hash && <span className="text-gray-8 font-mono text-[10px] ml-1">{hash}</span>}
    </span>
  </div>
);

const FiltersPanel: React.FC<{ visible: boolean }> = ({ visible }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Application', 'Span Status']));

  const toggle = (g: string) => setExpanded(prev => {
    const s = new Set(prev);
    s.has(g) ? s.delete(g) : s.add(g);
    return s;
  });

  if (!visible) return null;

  return (
    <div className="w-[250px] shrink-0 bg-white border-r border-gray-4 hidden lg:flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 shrink-0">
        <span className="text-[13px] font-medium text-gray-12">Filters</span>
        <Search size={13} className="text-gray-9" />
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Application group — expanded */}
        <FilterGroup
          label="Application"
          expanded={expanded.has('Application')}
          onToggle={() => toggle('Application')}
          hasClear
        >
          <CheckItem label="Prompt Engineer" />
          <CheckItem label="Version 1" sub hash="cd42525-925b…" />
          <CheckItem label="Version 2" sub hash="cd42525-925s…" />
          <CheckItem label="Sample Doc Extraction Agent" />
          <CheckItem label="Version 1" sub hash="dbv42525-925…" />
          <CheckItem label="Version 9" sub hash="dbv42525-925…" />
          <button className="text-[11px] text-gray-9 underline decoration-gray-5 mt-0.5 ml-0 self-start">
            show more
          </button>
        </FilterGroup>

        {/* Span Status group — expanded */}
        <FilterGroup
          label="Span Status"
          expanded={expanded.has('Span Status')}
          onToggle={() => toggle('Span Status')}
          hasClear
        >
          {/* Success with highlight + "only" */}
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-[3px] shrink-0 flex items-center justify-center border"
              style={{ background: ACCENT, borderColor: ACCENT }}
            >
              <Check size={8} className="text-white" strokeWidth={3} />
            </div>
            <div className="group/success flex-1 flex items-center justify-between rounded hover:bg-gray-2 px-1.5 py-0.5 min-w-0 cursor-pointer transition-colors">
              <span className="text-[12px] text-gray-12">Success</span>
              <button
                className="text-[11px] underline shrink-0 ml-1 invisible group-hover/success:visible"
                style={{ color: ACCENT }}
              >
                only
              </button>
            </div>
          </div>
          <CheckItem label="Error" />
          <CheckItem label="Canceled" />
        </FilterGroup>

        {/* Collapsed filter groups */}
        {['Span Name', 'Span Type', 'Agent Name', 'ACP Type', 'Duration', 'Assessment'].map(label => (
          <FilterGroup
            key={label}
            label={label}
            expanded={expanded.has(label)}
            onToggle={() => toggle(label)}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────

type PanelState = 'input' | 'analyzing' | 'done';

interface ChatPanelProps {
  selectedIds: string[];
  onClose: () => void;
  onReportReady: () => void;
  layoutMode: 'overlay' | 'split';
  initialPanelState?: PanelState;
}

const ChatPanel = ({ selectedIds, onClose, onReportReady, layoutMode, initialPanelState = 'input' }: ChatPanelProps) => {
  const [panelState, setPanelState] = useState<PanelState>(initialPanelState);
  const [questions, setQuestions] = useState('Why are some traces failing?\nAre errors correlated with a specific agent version?');
  const [context, setContext] = useState('This agent handles financial Q&A for retail investors. Version 2 was deployed 2 days ago.');
  const [stepIdx, setStepIdx] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const runAnalysis = useCallback(() => {
    setPanelState('analyzing');
    setCompletedSteps([]);
    setStepIdx(0);
  }, []);

  // Drive the progress simulation
  useEffect(() => {
    if (panelState !== 'analyzing') return;
    if (stepIdx >= PROGRESS_STEPS.length) { setPanelState('done'); onReportReady(); return; }

    const step = PROGRESS_STEPS[stepIdx];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, step.id]);
      setStepIdx(i => i + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [panelState, stepIdx, onReportReady]);

  const isSplit = layoutMode === 'split';
  const panelWidth = 520;

  // ── Shared inner content ──────────────────────────────────────────────────
  const innerContent = (
    <div className="p-5 flex flex-col gap-4">

            {/* Selected traces chip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-2 border border-gray-4">
              <MessageSquare size={13} className="text-gray-9 shrink-0" />
              <span className="text-[12px] text-gray-11">
                <strong className="text-gray-12">{selectedIds.length} traces</strong> selected for analysis
              </span>
            </div>

            {panelState === 'input' && (
              <>
                {/* Questions */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-gray-10">Questions to investigate</label>
                  <textarea
                    value={questions}
                    onChange={e => setQuestions(e.target.value)}
                    rows={4}
                    placeholder="e.g. Why are some traces failing?"
                    className="w-full px-3 py-2 rounded-lg border border-gray-6 text-[13px] text-gray-12 resize-none focus:outline-none focus:ring-2 focus:border-transparent leading-relaxed"
                    style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
                  />
                  <p className="text-[11px] text-gray-9">One question per line.</p>
                </div>

                {/* Context */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-gray-10">System context</label>
                  <textarea
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    rows={3}
                    placeholder="Describe the agent, deployment, or expected behaviour…"
                    className="w-full px-3 py-2 rounded-lg border border-gray-6 text-[13px] text-gray-12 resize-none focus:outline-none focus:ring-2 focus:border-transparent leading-relaxed"
                    style={{ '--tw-ring-color': ACCENT } as React.CSSProperties}
                  />
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={!questions.trim()}
                  className="h-9 rounded-lg text-[13px] font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ background: ACCENT }}
                >
                  <Sparkles size={13} /> Run Analysis
                </button>
              </>
            )}

            {panelState === 'analyzing' && stepIdx < PROGRESS_STEPS.length && (
              <>
                <style dangerouslySetInnerHTML={{ __html: `
                  @keyframes insights-shimmer {
                    0%   { background-position: 200% center; }
                    100% { background-position: -200% center; }
                  }
                `}} />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <Loader2 size={13} className="animate-spin shrink-0" style={{ color: ACCENT }} />
                    <p
                      key={stepIdx}
                      className="text-[13px] font-normal leading-5"
                      style={{
                        background: 'linear-gradient(90deg, #78839c 30%, #c2cedf 50%, #78839c 70%)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'insights-shimmer 2s linear infinite',
                      }}
                    >
                      {PROGRESS_STEPS[stepIdx]?.label}…
                    </p>
                  </div>
                  {completedSteps.length > 0 && (
                    <div className="flex flex-col gap-1 pl-6">
                      {PROGRESS_STEPS.filter(s => completedSteps.includes(s.id)).map(s => (
                        <div key={s.id} className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} className="text-green-9 shrink-0" />
                          <span className="text-[11px] text-gray-9">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {panelState === 'done' && (
              <>
                {/* Compact analysis-complete bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-green-5 bg-green-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-green-9" />
                    <span className="text-[12px] font-semibold text-green-11">Analysis complete</span>
                  </div>
                  <button
                    onClick={() => setPanelState('input')}
                    className="text-[11px] font-medium flex items-center gap-1"
                    style={{ color: ACCENT }}
                  >
                    <ArrowRight size={11} /> Re-run
                  </button>
                </div>

                {/* In split mode, render the report inline inside the panel */}
                {isSplit && (
                  <div className="border-t border-gray-3 -mx-5 px-5 pt-5">
                    <InsightsReport selectedIds={selectedIds} />
                  </div>
                )}
              </>
            )}

          </div>
  );
  // ── END shared inner content ─────────────────────────────────────────────

  // ── Shared header ────────────────────────────────────────────────────────
  const header = (isDialog = false) => (
    <div className={cn('flex items-center justify-between shrink-0 border-b border-gray-4', isDialog ? 'px-5 py-4' : 'px-4 py-3')}>
      <div className="flex items-center gap-2">
        <Sparkles size={14} style={{ color: ACCENT }} />
        <span className="text-[13px] font-semibold text-gray-12">Insights Generator</span>
        {panelState === 'done' && (
          <span className="flex items-center gap-1 text-[11px] text-green-10 ml-1">
            <CheckCircle2 size={11} className="text-green-9" /> Complete
          </span>
        )}
      </div>
      <button onClick={onClose} className="p-1 rounded hover:bg-gray-3 text-gray-9"><X size={14} /></button>
    </div>
  );

  // ── Overlay mode: Dialog ─────────────────────────────────────────────────
  if (!isSplit) {
    return (
      <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40" />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'bg-white rounded-xl shadow-2xl border border-gray-4',
              'flex flex-col overflow-hidden',
              'w-[min(92vw,760px)] h-[min(88vh,720px)]',
            )}
          >
            {header(true)}
            {/* min-h-0 lets the flex child shrink below content height so overflow-y-auto works */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {innerContent}
              {panelState === 'done' && (
                <div className="border-t border-gray-3 mx-5 mb-5 pt-5">
                  <InsightsReport selectedIds={selectedIds} />
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // ── Split mode: Side panel ───────────────────────────────────────────────
  return (
    <div className="flex flex-col shrink-0 h-full border-l border-gray-4 bg-white overflow-hidden" style={{ width: panelWidth }}>
      {header()}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full">
          {innerContent}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="flex w-1.5 p-px">
          <ScrollArea.Thumb className="flex-1 rounded-full bg-gray-5" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
};

// ─── Traces Table ─────────────────────────────────────────────────────────────

const TraceRow = ({ trace, checked, onCheck }: {
  trace: typeof MOCK_TRACES[0]; checked: boolean; onCheck: (id: string, v: boolean) => void
}) => (
  <div
    className={cn('flex items-start group transition-colors', checked ? 'bg-[#714DFF08]' : 'hover:bg-gray-1')}
    style={{ borderBottom: '1px solid rgba(0,50,145,0.18)' }}
  >
    {/* Checkbox */}
    <div className="w-10 flex items-center justify-center pt-[14px] pb-2 shrink-0">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={v => onCheck(trace.id, Boolean(v))}
        className="w-[14px] h-[14px] rounded-[3px] border border-gray-6 bg-white flex items-center justify-center data-[state=checked]:border-0"
        style={checked ? { background: ACCENT } : {}}
      >
        <Checkbox.Indicator><Check size={9} className="text-white" strokeWidth={3} /></Checkbox.Indicator>
      </Checkbox.Root>
    </div>

    {/* Input + Output content */}
    <div className="flex-1 min-w-0 py-2 pr-4 flex flex-col gap-1.5">
      {/* Input line — invisible dot keeps label aligned with Output */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full shrink-0 ml-[1px] -mr-0.5 invisible" />
        <span className="text-[13px] text-gray-9 shrink-0 w-[47px]">Input</span>
        <p className="text-[13px] text-gray-12 truncate min-w-0">{trace.input}</p>
      </div>
      {/* Divider */}
      <div className="h-px w-full" style={{ background: 'rgba(0,50,145,0.18)' }} />
      {/* Output line */}
      <div className="flex items-center gap-2">
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 ml-[1px] -mr-0.5', trace.status !== 'error' && 'invisible')}
          style={trace.status === 'error' ? {
            backgroundColor: '#EF4444',
            boxShadow: '0 0 0 2px #D1020226',
          } : undefined}
        />
        <span className="text-[13px] text-gray-9 shrink-0 w-[47px]">Output</span>
        <p className="text-[13px] text-gray-12 truncate min-w-0">{trace.output}</p>
      </div>
    </div>

    {/* Version */}
    <div className="w-[130px] shrink-0 pt-[14px] px-2 text-[13px] text-gray-12 truncate">{trace.userId}</div>

    {/* Timestamp */}
    <div className="w-[164px] shrink-0 pt-[14px] px-2 text-[13px] text-gray-12 truncate">{trace.timestamp}</div>

    {/* Duration */}
    <div className="w-[72px] shrink-0 pt-[14px] px-2 text-[13px] text-gray-12">{trace.duration}</div>

    {/* Trace badge */}
    <div className="w-[76px] shrink-0 pt-[12px] px-2">
      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full bg-gray-3 text-[12px] font-medium text-gray-10">
        Trace
      </span>
    </div>
  </div>
);

// ─── Main Prototype ───────────────────────────────────────────────────────────

const InsightsGenerator: React.FC = () => {
  const { params } = useTweakpane(
    { layout: 'overlay' },
    { layout: { options: { 'Overlay (modal)': 'overlay', 'Split (alongside traces)': 'split' } } },
  );
  const layoutMode = params.layout as 'overlay' | 'split';

  // URL ?demo= param for screen capture seeding
  const demoParam = new URLSearchParams(window.location.search).get('demo') ?? '';
  const demoIds = demoParam ? new Set(MOCK_TRACES.slice(0, 6).map(t => t.id)) : new Set<string>();
  const demoPanelOpen = ['panel', 'analyzing', 'report'].includes(demoParam);
  const demoPanelState: PanelState = demoParam === 'analyzing' ? 'analyzing' : demoParam === 'report' ? 'done' : 'input';

  const [selected, setSelected] = useState<Set<string>>(demoIds);
  const [panelOpen, setPanelOpen] = useState(demoPanelOpen);
  const allChecked = selected.size === MOCK_TRACES.length;

  const toggleRow = (id: string, v: boolean) =>
    setSelected(prev => { const s = new Set(prev); v ? s.add(id) : s.delete(id); return s; });

  const toggleAll = () =>
    setSelected(prev => prev.size === MOCK_TRACES.length ? new Set() : new Set(MOCK_TRACES.map(t => t.id)));

  const openPanel = () => setPanelOpen(true);
  const closePanel = () => setPanelOpen(false);
  const onReportReady = () => { /* report now lives inside the panel/modal */ };

  const selectedIds = [...selected];

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="h-screen flex flex-col text-[14px] overflow-hidden" style={{ background: '#FBFCFF' }}>
        {/* Nav */}
        <div className="bg-white shadow-sm shrink-0">
          <NavV3 appPickerInBranding={false} />
        </div>

        {/* Body row — fills remaining height below nav */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left column: everything except the chat side-panel */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* Page header — no bottom border so "Traces" and the chart flow as one unit */}
            <div className="bg-white px-6 py-4 shrink-0">
              <h1 className="text-[20px] font-semibold text-gray-12">Traces</h1>
            </div>

            {/* Total Requests chart — below page title, above search bar */}
            <TotalRequestsChart />

            {/* Card — wraps search + filters + table with matching 24px page inset */}
            <div
              className="mx-6 mb-6 mt-3 flex-1 flex flex-col overflow-hidden min-h-0 bg-white rounded-lg"
              style={{ border: '1px solid rgba(0,50,145,0.18)' }}
            >

              {/* Search bar */}
              <div
                className="shrink-0 flex items-center gap-2"
                style={{ padding: '8px 24px', borderBottom: '1px solid rgba(0,49,152,0.15)' }}
              >
                <Search size={16} className="shrink-0" style={{ color: 'rgba(0,44,137,0.23)' }} />
                <input
                  className="flex-1 bg-transparent outline-none text-gray-12"
                  style={{ fontSize: 16, lineHeight: '24px', height: 40 }}
                  placeholder="Search by facets or metadata query"
                />
              </div>

              {/* Filters sidebar + main content */}
              <div className="flex flex-1 overflow-hidden min-h-0">

                {/* Filters sidebar */}
                <FiltersPanel visible={!panelOpen} />

                {/* Main content: traces table */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Scroll area — traces table */}
                <ScrollArea.Root className="flex-1 overflow-hidden">
                  <ScrollArea.Viewport className="h-full">
                    <div className="bg-white">
                        {/* Table header */}
                        <div className="flex items-center bg-gray-1" style={{ borderBottom: '1px solid rgba(0,50,145,0.18)' }}>
                          <div className="w-10 flex items-center justify-center py-2.5 shrink-0">
                            <Checkbox.Root
                              checked={allChecked}
                              onCheckedChange={toggleAll}
                              className="w-[14px] h-[14px] rounded-[3px] border border-gray-6 bg-white flex items-center justify-center data-[state=checked]:border-0"
                              style={allChecked ? { background: ACCENT } : {}}
                            >
                              <Checkbox.Indicator><Check size={9} className="text-white" strokeWidth={3} /></Checkbox.Indicator>
                            </Checkbox.Root>
                          </div>
                          {[
                            { label: 'Content',   flex: true },
                            { label: 'Version',   w: 'w-[130px]' },
                            { label: 'Timestamp', w: 'w-[164px]' },
                            { label: 'Duration',  w: 'w-[72px]' },
                            { label: '',          w: 'w-[76px]' },
                          ].map(col => (
                            <div
                              key={col.label}
                              className={cn(
                                'py-2.5 px-2 text-[11px] font-semibold text-gray-9 uppercase tracking-wide',
                                col.flex ? 'flex-1 min-w-0 pr-4' : col.w,
                              )}
                            >
                              {col.label}
                            </div>
                          ))}
                        </div>
                        {/* Rows */}
                        {MOCK_TRACES.map(trace => (
                          <TraceRow key={trace.id} trace={trace} checked={selected.has(trace.id)} onCheck={toggleRow} />
                        ))}
                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-1" style={{ borderTop: '1px solid rgba(0,50,145,0.18)' }}>
                          <span className="text-[12px] text-gray-9">Showing 1–10 of 36</span>
                          <div className="flex items-center gap-1">
                            {['«','‹','1','2','3','4','›','»'].map((p, i) => (
                              <button
                                key={i}
                                className={cn('w-7 h-7 text-[12px] rounded flex items-center justify-center', p === '1' ? 'font-semibold text-white' : 'text-gray-10 hover:bg-gray-3')}
                                style={p === '1' ? { background: ACCENT } : {}}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation="vertical" className="flex w-1.5 p-px">
                    <ScrollArea.Thumb className="flex-1 rounded-full bg-gray-5" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
                </div>
              </div>
            </div>
          </div>

          {/* Chat panel — sits right alongside the left column, from below nav to bottom */}
          {panelOpen && (
            <ChatPanel
              selectedIds={selectedIds}
              onClose={closePanel}
              onReportReady={onReportReady}
              layoutMode={layoutMode}
              initialPanelState={demoPanelState}
            />
          )}
        </div>

        {/* Floating selection bar */}
        {selected.size > 0 && !panelOpen && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 px-3 bg-white border border-gray-6 rounded-lg shadow-lg h-[48px]">
              <span className="text-[12px] italic text-gray-10 pr-1 whitespace-nowrap">
                {selected.size} trace{selected.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={toggleAll}
                className="h-8 px-3 rounded text-[14px] font-medium whitespace-nowrap transition-colors hover:bg-gray-2"
                style={{ color: ACCENT }}
              >
                Select All
              </button>
              <button className="h-8 px-3 rounded text-[14px] font-medium text-gray-12 border border-gray-6 whitespace-nowrap hover:bg-gray-2 transition-colors">
                Add to dataset
              </button>
              <button className="h-8 px-3 rounded text-[14px] font-medium text-gray-12 border border-gray-6 whitespace-nowrap hover:bg-gray-2 transition-colors">
                Download .json
              </button>
              <button
                onClick={openPanel}
                className="h-8 px-3 rounded text-[14px] font-medium text-white flex items-center gap-1.5 whitespace-nowrap"
                style={{ background: ACCENT }}
              >
                <Sparkles size={13} /> Generate Insights
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="p-1 rounded hover:bg-gray-3 text-gray-9 ml-1"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
};

export const title = 'Insights Generator';
export const route = '/insights-generator';

export default InsightsGenerator;
