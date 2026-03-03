import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowUp,
    Plus,
    ChevronsLeft,
    ChevronsRight,
    SquarePen,
    Database,
    ChevronDown,
    ChevronUp,
    Network,
    Square,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    executionSteps?: number;
    timestamp?: Date;
}

interface Thread {
    id: string;
    title: string;
    messages: Message[];
}

const MOCK_THREADS: Thread[] = [
    {
        id: '1',
        title: 'Qatar Regulatory Quality Increase',
        messages: [
            {
                id: 'm1', role: 'user',
                content: 'Show me the Qatar regulatory quality increase trend over the last decade.',
                timestamp: new Date('2024-12-16T16:00:00'),
            },
            {
                id: 'm2', role: 'assistant',
                executionSteps: 5,
                content: "After scanning across all connected databases and schemas, I've identified the key trends in Qatar's regulatory quality:\n\n**1. Overall Improvement Trend**\nThe Regulatory Quality score has risen consistently, sourced from `world_bank.governance_indicators`.\n- Score in 2013: 0.62 points\n- Score in 2022: 0.81 points\n\n**2. Key Reform Drivers**\nThe most significant acceleration was observed in `qatar.national_vision_reforms`.\n- Average annual growth: +0.02 points per year",
            },
        ],
    },
    { id: '2', title: 'Yearly GDP Trend', messages: [] },
    { id: '3', title: 'Top 5 Countries by Latest LPI', messages: [] },
    { id: '4', title: 'Latest Qatar Gender Obesity Statistics', messages: [] },
    { id: '5', title: 'LPI Score vs. Logistics Timeline', messages: [] },
    { id: '6', title: 'STEM Graduates Proportion', messages: [] },
];

const ASSISTANT_RESPONSES = [
    "After querying the available data sources, here's what I found:\n\n**1. Primary Finding**\nThe trend shows a steady increase over the last 5 years, sourced from `analytics.time_series_metrics`.\n- Notable acceleration starting in Q3 2021\n- Year-over-year growth: +12.4%\n\n**2. Supporting Data**\nCross-referencing with `ontology.domain_classifications` confirms this aligns with the expected trajectory.\n- Confidence score: 94.2%",
    "I've analyzed the relevant datasets across your connected sources:\n\n**1. Correlation Analysis**\nThe data indicates a significant correlation between the variables you've queried, found in `warehouse.analytical_models`.\n- Pearson coefficient: 0.87\n\n**2. Recent Trajectory**\nThe most recent figures from `reporting.kpi_dashboard` suggest continued growth.\n- Baseline period delta: +18%",
    "Based on the knowledge base scan, here's the current picture:\n\n**1. Latest Data Point**\nA clear pattern is emerging in this metric, indexed in `kb.domain_knowledge`.\n- Year-over-year improvement: 18%\n\n**2. Historical Context**\nLong-term trend data from `archive.historical_records` shows consistent improvement since the baseline period.",
    "The data query returned matching records across your sources:\n\n**1. Primary Match**\nCross-referencing with `ontology.entity_map` confirms this classification, found in `db.primary_records`.\n- Record count: 3 matching entries\n\n**2. Recommendation**\nBased on `analytics.recommendation_engine`, you may want to drill deeper into the subcategories.",
];



// ─── Input Box ────────────────────────────────────────────────────────────────

const DATA_SOURCES = [
    { id: 'wb',  label: 'World Bank DB' },
    { id: 'qns', label: 'Qatar National Stats' },
    { id: 'imf', label: 'IMF Economic Data' },
];

type DataSource = typeof DATA_SOURCES[number];

interface InputBoxProps {
    input: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    onStop: () => void;
    isTyping: boolean;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    selectedSource: DataSource | null;
    onSourceChange: (source: DataSource) => void;
    sourceLocked?: boolean;
    requiredBump?: number;
    placeholder?: string;
    compact?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({
    input,
    onChange,
    onKeyDown,
    onSend,
    onStop,
    isTyping,
    textareaRef,
    selectedSource,
    onSourceChange,
    sourceLocked = false,
    requiredBump = 0,
    placeholder = '',
    compact = false,
}) => {
    const canSend = input.trim().length > 0 && !isTyping && selectedSource !== null;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [requiredVisible, setRequiredVisible] = useState(false);
    const requiredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!requiredBump) return;
        if (requiredTimerRef.current) clearTimeout(requiredTimerRef.current);
        setRequiredVisible(true);
        requiredTimerRef.current = setTimeout(() => setRequiredVisible(false), 3000);
        return () => { if (requiredTimerRef.current) clearTimeout(requiredTimerRef.current); };
    }, [requiredBump]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!dropdownOpen) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [dropdownOpen]);

    return (
        <div
            className="relative bg-white rounded-lg"
            style={{
                border: '1px solid #e9e9eb',
                boxShadow: '0px 3px 15px 0px rgba(0,0,0,0.15)',
            }}
        >
            {/* Text area */}
            <div className={cn(compact ? 'min-h-[28px] pt-3 pb-2' : 'min-h-[74px] pt-4', 'pl-4 pr-3')}>
                <textarea
                    ref={textareaRef}
                    rows={compact ? 1 : 3}
                    value={input}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className="w-full resize-none bg-transparent text-[14px] font-normal leading-5 outline-none placeholder:font-normal"
                    style={{
                        color: '#19202f',
                        caretColor: '#19202f',
                        maxHeight: '160px',
                    }}
                />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between h-12 pl-4 pr-3">
                {/* Left: + and data source selector */}
                <div className="flex items-center gap-1">
                    <button
                        className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-2 transition-colors flex-shrink-0"
                        style={{ border: '1px solid #e9e9eb', color: '#818ea9' }}
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                    {!compact && (
                        <div className="relative" ref={dropdownRef}>
                            {/* Required tooltip */}
                            {requiredVisible && (
                                <div
                                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md text-white text-[12px] font-medium whitespace-nowrap pointer-events-none z-50"
                                    style={{ backgroundColor: '#19202f' }}
                                >
                                    Required
                                    {/* Arrow */}
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2"
                                        style={{
                                            width: 0, height: 0,
                                            borderLeft: '5px solid transparent',
                                            borderRight: '5px solid transparent',
                                            borderTop: '5px solid #19202f',
                                        }}
                                    />
                                </div>
                            )}
                            <button
                                onClick={() => !sourceLocked && setDropdownOpen(v => !v)}
                                className={cn(
                                    'flex items-center gap-1.5 h-6 px-2 rounded transition-colors',
                                    !sourceLocked && 'hover:bg-gray-2',
                                    sourceLocked && 'cursor-default',
                                )}
                                style={{ border: '1px solid #e9e9eb', minWidth: '180px' }}
                            >
                                <Database className="w-3 h-3 flex-shrink-0" style={{ color: '#5b6579' }} />
                                <span
                                    className="text-[13px] flex-1 text-left truncate"
                                    style={{ color: selectedSource ? '#19202f' : '#818ea9' }}
                                >
                                    {selectedSource ? selectedSource.label : 'Select Data Source...'}
                                </span>
                                {!sourceLocked && (
                                    <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: '#818ea9' }} />
                                )}
                            </button>
                            {dropdownOpen && (
                                <div
                                    className="absolute left-0 top-full mt-1 z-50 py-1 rounded-lg overflow-hidden"
                                    style={{
                                        minWidth: '180px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e9e9eb',
                                        boxShadow: '0px 4px 16px rgba(0,0,0,0.12)',
                                    }}
                                >
                                    {DATA_SOURCES.map(source => (
                                        <button
                                            key={source.id}
                                            onClick={() => { onSourceChange(source); setDropdownOpen(false); setRequiredVisible(false); }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-2 transition-colors"
                                        >
                                            <span
                                                className="text-[13px] font-normal flex-1"
                                                style={{ color: source.id === selectedSource?.id ? '#19202f' : '#45464f' }}
                                            >
                                                {source.label}
                                            </span>
                                            {source.id === selectedSource?.id && (
                                                <span className="text-[11px]" style={{ color: '#818ea9' }}>✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Send / Stop */}
                {isTyping ? (
                    <button
                        onClick={onStop}
                        className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: '#19202f' }}
                    >
                        <Square className="w-2.5 h-2.5 fill-white text-white" />
                    </button>
                ) : (
                    <button
                        onClick={onSend}
                        disabled={!canSend}
                        className={cn(
                            'flex items-center justify-center w-6 h-6 rounded-full transition-all flex-shrink-0',
                            canSend
                                ? 'bg-violet-9 text-white hover:bg-violet-10'
                                : 'bg-gray-3 cursor-not-allowed'
                        )}
                        style={!canSend ? { color: '#818ea9' } : undefined}
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Inset shadow overlay */}
            <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{ boxShadow: 'inset 0px 0px 2px 0px rgba(0,0,0,0.1), inset 0px 0px 2px 0px rgba(0,96,255,0.03)' }}
            />
        </div>
    );
};

// ─── Thinking Indicator ───────────────────────────────────────────────────────

const ThinkingIndicator: React.FC<{ steps: ExecutionStep[] }> = ({ steps }) => {
    const [idx, setIdx] = useState(0);
    const labels = steps.map(s => s.label);

    useEffect(() => {
        setIdx(0);
        const id = setInterval(() => setIdx(i => (i + 1) % labels.length), 2000);
        return () => clearInterval(id);
    }, [labels.length]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes dua-shimmer {
                    0%   { background-position: 200% center; }
                    100% { background-position: -200% center; }
                }
            `}} />
            <p
                className="text-[14px] font-normal leading-5 inline-block"
                key={idx}
                style={{
                    background: 'linear-gradient(90deg, #78839c 30%, #c2cedf 50%, #78839c 70%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'dua-shimmer 2s linear infinite',
                }}
            >
                {labels[idx]}...
            </p>
        </>
    );
};

// ─── Message Helpers ──────────────────────────────────────────────────────────

const MessageTimestamp: React.FC<{ date: Date }> = ({ date }) => {
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return (
        <div className="flex items-center justify-center py-2">
            <span className="text-[13px]" style={{ color: '#818ea9' }}>
                <span className="font-semibold">{datePart}</span>{' '}
                <span className="font-normal">{timePart}</span>
            </span>
        </div>
    );
};

interface ExecutionStep {
    label: string;
    status?: 'success' | 'failure';
}

const ALL_EXECUTION_STEPS: ExecutionStep[] = [
    { label: 'Analyzing Natural Language Request' },
    { label: 'Mapping Request to Database Schema' },
    { label: 'Translating to SQL Query' },
    { label: 'Executing SQL Query', status: 'failure' },
    { label: 'Executing SQL Query', status: 'success' },
    { label: 'Fetching Data from Warehouses' },
    { label: 'Analyzing Data for Turning Points' },
    { label: 'Synthesizing Final Natural Language Answer' },
    { label: 'Generating Visualization' },
];

const NeutralBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span
        className="inline-flex items-center justify-center flex-shrink-0 leading-none"
        style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#e9ecf5',
            color: '#5b6579',
            fontSize: '12px',
            fontWeight: 500,
        }}
    >
        {children}
    </span>
);

// Small accent badge used on the notification-style icon buttons
const AccentBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span
        className="absolute -top-1 -right-1 flex items-center justify-center leading-none"
        style={{
            minWidth: '14px', height: '14px', borderRadius: '9999px',
            backgroundColor: '#ede9fe', color: '#6d28d9',
            fontSize: '9px', fontWeight: 600, padding: '0 3px',
        }}
    >
        {children}
    </span>
);

const ExecutionStepsButton: React.FC<{ count: number }> = ({ count }) => {
    const [open, setOpen] = useState(false);
    const steps = ALL_EXECUTION_STEPS.slice(0, Math.min(count, ALL_EXECUTION_STEPS.length));
    const queryCount = steps.filter(s => s.label === 'Executing SQL Query').length || 1;

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Full-width trigger row */}
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full h-8 px-2 rounded hover:bg-gray-3 transition-colors"
            >
                {/* Left: icon badges + summary text */}
                <div className="flex items-center gap-2 min-w-0">
                    {/* Overlapping icon+badge pair */}
                    <div className="flex items-center flex-shrink-0" style={{ gap: '-4px' }}>
                        <div className="relative flex items-center justify-center w-6 h-6 mr-1">
                            <Network className="w-[14px] h-[14px]" style={{ color: '#5b6579' }} />
                            <AccentBadge>{count}</AccentBadge>
                        </div>
                        <div className="relative flex items-center justify-center w-6 h-6">
                            <Database className="w-[14px] h-[14px]" style={{ color: '#5b6579' }} />
                            <AccentBadge>{queryCount}</AccentBadge>
                        </div>
                    </div>
                    <span className="text-[14px] font-medium truncate" style={{ color: '#19202f' }}>
                        {count} Execution Steps • {queryCount} {queryCount === 1 ? 'Query' : 'Queries'} • 1 Response
                    </span>
                </div>

                {/* Right: label + chevron */}
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                    <span className="text-[14px] font-semibold whitespace-nowrap" style={{ color: '#5b6579', letterSpacing: '-0.16px' }}>
                        {open ? 'Hide Steps' : 'Show Steps'}
                    </span>
                    {open
                        ? <ChevronUp className="w-4 h-4" style={{ color: '#5b6579' }} />
                        : <ChevronDown className="w-4 h-4" style={{ color: '#5b6579' }} />
                    }
                </div>
            </button>

            {/* Expanded panel */}
            {open && (
                <div className="w-full rounded-lg overflow-hidden" style={{ border: '1px solid #d1daeb' }}>
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-[11px] px-4 py-2"
                            style={{ borderBottom: i < steps.length - 1 ? '1px solid #d1daeb' : 'none', minHeight: '42px' }}
                        >
                            <NeutralBadge>{i + 1}</NeutralBadge>
                            <span className="flex-1 text-[14px] font-normal leading-5 min-w-0 flex items-center gap-2" style={{ color: '#19202f' }}>
                                {step.label}
                                {step.status === 'failure' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                                        <circle cx="6" cy="6" r="3" fill="#F24C00"/>
                                        <circle cx="6" cy="6" r="4.5" stroke="#F24C00" strokeOpacity="0.2" strokeWidth="3"/>
                                    </svg>
                                )}
                                {step.status === 'success' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                                        <circle cx="6" cy="6" r="3" fill="#3E9B4F"/>
                                        <circle cx="6" cy="6" r="4.5" stroke="#3E9B4F" strokeOpacity="0.2" strokeWidth="3"/>
                                    </svg>
                                )}
                            </span>
                            <div className="flex items-center justify-center w-[18px] h-[18px] flex-shrink-0">
                                <ChevronUp className="w-3.5 h-3.5" style={{ color: '#818ea9' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Renders assistant message text with **bold**, `code badges`, and - bullet points.
// When animate=true it types out content character-by-character with natural speed variance.
const TW_BASE = 2;
const RichText: React.FC<{ content: string; animate?: boolean; onUpdate?: () => void }> = ({ content, animate = false, onUpdate }) => {
    const [displayed, setDisplayed] = useState(animate ? '' : content);
    const indexRef = useRef(0);

    useEffect(() => {
        if (!animate) { setDisplayed(content); return; }
        indexRef.current = 0;
        setDisplayed('');

        const tick = () => {
            if (indexRef.current >= content.length) return;
            setDisplayed(content.slice(0, indexRef.current + 1));
            indexRef.current += 1;
            onUpdate?.();
            const ch = content[indexRef.current - 1];
            const delay = /[.,!?:;\n]/.test(ch)
                ? TW_BASE * 5 + Math.random() * TW_BASE * 3
                : TW_BASE + Math.random() * TW_BASE - TW_BASE * 0.4;
            setTimeout(tick, Math.max(1, delay));
        };

        const id = setTimeout(tick, TW_BASE);
        return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, animate]);

    const renderInline = (text: string) => {
        const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[12px] font-mono mx-0.5"
                        style={{ backgroundColor: '#f0f0f3', color: '#5b6579' }}>
                        {part.slice(1, -1)}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    const lines = displayed.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line === '') {
            elements.push(<div key={`sp-${i}`} className="h-3" />);
        } else if (line.startsWith('- ')) {
            const bullets: string[] = [];
            while (i < lines.length && lines[i].startsWith('- ')) {
                bullets.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <ul key={`ul-${i}`} className="list-disc ml-5 space-y-0.5">
                    {bullets.map((b, bi) => (
                        <li key={bi} className="text-[14px] leading-[1.8]" style={{ color: '#19202f' }}>
                            {renderInline(b)}
                        </li>
                    ))}
                </ul>
            );
            continue;
        } else {
            elements.push(
                <p key={`p-${i}`} className="text-[14px] leading-[1.8]" style={{ color: '#19202f' }}>
                    {renderInline(line)}
                </p>
            );
        }
        i++;
    }

    return <div className="space-y-0.5">{elements}</div>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MIN_SIDEBAR_WIDTH = 140;
const MAX_SIDEBAR_WIDTH = 400;
const COLLAPSED_WIDTH = 52;
const DEFAULT_WIDTH = 260;

const DuaChat: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragStartWidth = useRef(DEFAULT_WIDTH);
    const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [latestAssistantId, setLatestAssistantId] = useState<string | null>(null);
    const [pendingExecutionSteps, setPendingExecutionSteps] = useState(ALL_EXECUTION_STEPS.length);
    const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
    const [requiredBump, setRequiredBump] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const stopRequestedRef = useRef(false);

    const activeThread = threads.find(t => t.id === activeThreadId) ?? null;
    const hasMessages = (activeThread?.messages.length ?? 0) > 0;

    // Scroll to bottom — instant during typewriter so it tracks character-by-character,
    // smooth only when a new message is first added.
    const scrollToBottom = (behavior: ScrollBehavior = 'instant') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        // Don't hijack if the user has scrolled up more than 120px from bottom
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (behavior === 'instant' && distanceFromBottom > 120) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    useEffect(() => {
        scrollToBottom('smooth');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeThread?.messages, isTyping]);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        autoResize();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!selectedSource) {
                setRequiredBump(n => n + 1);
                return;
            }
            sendMessage();
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        if (sidebarCollapsed) return;
        e.preventDefault();
        isDragging.current = true;
        dragStartX.current = e.clientX;
        dragStartWidth.current = sidebarWidth;

        const onMouseMove = (ev: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = ev.clientX - dragStartX.current;
            const next = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, dragStartWidth.current + delta));
            setSidebarWidth(next);
        };

        const onMouseUp = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const createNewThread = () => {
        const newThread: Thread = { id: Date.now().toString(), title: 'New Thread', messages: [] };
        setThreads(prev => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
        setInput('');
        setRequiredBump(0);
    };

    const stopGeneration = () => {
        stopRequestedRef.current = true;
        setIsTyping(false);
    };

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isTyping) return;

        let threadId = activeThreadId;

        if (!threadId) {
            const newThread: Thread = {
                id: Date.now().toString(),
                title: trimmed.slice(0, 45),
                messages: [],
            };
            setThreads(prev => [newThread, ...prev]);
            threadId = newThread.id;
            setActiveThreadId(newThread.id);
        }

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed, timestamp: new Date() };

        setThreads(prev =>
            prev.map(t =>
                t.id === threadId
                    ? {
                          ...t,
                          title: t.messages.length === 0 ? trimmed.slice(0, 45) : t.title,
                          messages: [...t.messages, userMsg],
                      }
                    : t
            )
        );
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        stopRequestedRef.current = false;
        setRequiredBump(0);
        // Always at least 5 to ensure both SQL steps (indices 3 & 4) are included
        const stepCount = Math.min(Math.floor(Math.random() * 5) + 5, ALL_EXECUTION_STEPS.length);
        setPendingExecutionSteps(stepCount);
        setIsTyping(true);

        // Poll every 100ms so stop is responsive during the thinking delay
        await new Promise<void>(resolve => {
            const id = setInterval(() => {
                if (stopRequestedRef.current) { clearInterval(id); resolve(); }
            }, 100);
            setTimeout(() => { clearInterval(id); resolve(); }, 10000);
        });
        if (stopRequestedRef.current) return;

        const reply = ASSISTANT_RESPONSES[Math.floor(Math.random() * ASSISTANT_RESPONSES.length)];
        const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: reply,
            executionSteps: stepCount,
        };

        setThreads(prev =>
            prev.map(t => (t.id === threadId ? { ...t, messages: [...t.messages, assistantMsg] } : t))
        );
        setLatestAssistantId(assistantMsg.id);
        setIsTyping(false);
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden">

            {/* ── Sidebar ── */}
            <div
                className={cn(
                    'relative flex flex-col flex-shrink-0 overflow-hidden',
                    !isDragging.current && 'transition-[width] duration-200'
                )}
                style={{ width: sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth, backgroundColor: '#FAFAFA' }}
            >
                {/* Resize handle */}
                {!sidebarCollapsed && (
                    <div
                        onMouseDown={handleResizeMouseDown}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group z-10"
                    >
                        <div className="w-px h-full bg-gray-6 group-hover:bg-violet-8 transition-colors" />
                    </div>
                )}
                {sidebarCollapsed && <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-6" />}

                {/* Content wrapper — 8px padding on all sides */}
                <div className="flex flex-col flex-1 overflow-hidden p-2">

                    {/* Top: Logo + collapse — 40px tall, 16px horizontal padding */}
                    <div className={cn('flex items-center h-10 px-2 flex-shrink-0', sidebarCollapsed ? 'justify-center' : 'justify-between')}>
                        {!sidebarCollapsed && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                <path d="M0 8C0 3.59375 3.59375 0 8 0C12.4062 0 16 3.59375 16 8C16 12.4062 12.4062 16 8 16C3.59375 16 0 12.4062 0 8Z" fill="url(#paint0_linear_992_14675)"/>
                                <defs>
                                    <linearGradient id="paint0_linear_992_14675" x1="8" y1="0" x2="8" y2="16" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#714DFF"/>
                                        <stop offset="1" stopColor="#84BED6"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(v => !v)}
                            className={cn(
                                'flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-3 text-gray-9 transition-colors flex-shrink-0'
                            )}
                        >
                            {sidebarCollapsed
                                ? <ChevronsRight className="w-4 h-4" />
                                : <ChevronsLeft className="w-4 h-4" />
                            }
                        </button>
                    </div>

                    {/* Nav section */}
                    <div className="flex-1 overflow-y-auto pt-4 flex flex-col gap-1">

                        {/* New Thread */}
                        <button
                            onClick={createNewThread}
                            className={cn(
                                'flex items-center h-10 px-2 rounded-md hover:bg-gray-3 text-gray-12 transition-colors text-sm flex-shrink-0',
                                sidebarCollapsed ? 'justify-center' : 'gap-2'
                            )}
                        >
                            <SquarePen className="w-4 h-4 flex-shrink-0" />
                            {!sidebarCollapsed && <span>New Thread</span>}
                        </button>

                        {/* Threads label */}
                        {!sidebarCollapsed && (
                            <div className="flex items-center h-10 px-2 flex-shrink-0 select-none overflow-hidden">
                                <span className="truncate font-medium leading-6 text-[14px]" style={{ color: '#818EA9' }}>Threads</span>
                            </div>
                        )}

                        {/* Thread items */}
                        {!sidebarCollapsed && threads.map(thread => (
                            <button
                                key={thread.id}
                                onClick={() => setActiveThreadId(thread.id)}
                                className={cn(
                                    'flex items-center h-10 px-2 rounded-md text-left text-sm hover:bg-gray-3 transition-colors flex-shrink-0',
                                    activeThreadId === thread.id && 'bg-gray-3'
                                )}
                            >
                                <span className="truncate font-medium text-[14px] leading-6" style={{ color: '#45464F' }}>{thread.title}</span>
                            </button>
                        ))}
                    </div>

                    {/* Bottom links */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                            className={cn(
                                'flex items-center h-10 w-full rounded-md hover:bg-gray-3 transition-colors',
                                sidebarCollapsed ? 'justify-center px-2' : 'pl-2 pr-1'
                            )}
                        >
                            <div className={cn('flex items-center gap-2 flex-1 min-w-0', sidebarCollapsed && 'flex-none')}>
                                <Network className="w-4 h-4 flex-shrink-0" style={{ color: '#5b6579' }} />
                                {!sidebarCollapsed && (
                                    <span className="font-medium text-[14px] leading-6 truncate" style={{ color: '#5b6579' }}>Ontologies</span>
                                )}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0">
                                    <FontAwesomeIcon icon={faUpRightFromSquare} style={{ width: '12px', height: '12px', color: '#6b7280' }} />
                                </div>
                            )}
                        </button>
                        <button
                            className={cn(
                                'flex items-center h-10 w-full rounded-md hover:bg-gray-3 transition-colors',
                                sidebarCollapsed ? 'justify-center px-2' : 'pl-2 pr-1'
                            )}
                        >
                            <div className={cn('flex items-center gap-2 flex-1 min-w-0', sidebarCollapsed && 'flex-none')}>
                                <Database className="w-4 h-4 flex-shrink-0" style={{ color: '#5b6579' }} />
                                {!sidebarCollapsed && (
                                    <span className="font-medium text-[14px] leading-6 truncate" style={{ color: '#5b6579' }}>Data Sources</span>
                                )}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0">
                                    <FontAwesomeIcon icon={faUpRightFromSquare} style={{ width: '12px', height: '12px', color: '#6b7280' }} />
                                </div>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Main area ── */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {hasMessages ? (
                    <>
                        {/* Messages */}
                        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                            <div className="max-w-[640px] mx-auto px-8 py-6 flex flex-col gap-6">
                                {activeThread!.messages.map((msg, idx) => {
                                    const prevMsg = idx > 0 ? activeThread!.messages[idx - 1] : null;
                                    const showTimestamp = msg.timestamp && (!prevMsg || !prevMsg.timestamp);
                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showTimestamp && msg.timestamp && (
                                                <MessageTimestamp date={msg.timestamp} />
                                            )}
                                            {msg.role === 'user' ? (
                                                /* User message — right-aligned */
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-[13px] font-normal" style={{ color: '#818ea9' }}>You</span>
                                                    <div
                                                        className="px-3 py-2.5 text-[14px] font-normal leading-[1.8] text-right"
                                                        style={{
                                                            backgroundColor: '#fcfcfc',
                                                            border: '1px solid #e9e9eb',
                                                            borderRadius: '24px 24px 2px 24px',
                                                            color: '#19202f',
                                                            maxWidth: '75%',
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Assistant message — left-aligned, no bubble */
                                                <div className="flex flex-col items-start gap-6">
                                                    {msg.executionSteps !== undefined && (
                                                        <ExecutionStepsButton count={msg.executionSteps} />
                                                    )}
                                                    <RichText
                                                        content={msg.content}
                                                        animate={msg.id === latestAssistantId}
                                                        onUpdate={msg.id === latestAssistantId ? () => scrollToBottom() : undefined}
                                                    />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {isTyping && (
                                    <div className="flex flex-col items-start gap-2 py-1">
                                        <ThinkingIndicator steps={ALL_EXECUTION_STEPS.slice(0, pendingExecutionSteps)} />
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input at bottom */}
                        <div className="py-5 max-w-[640px] mx-auto w-full">
                            <InputBox
                                input={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onSend={sendMessage}
                                onStop={stopGeneration}
                                isTyping={isTyping}
                                textareaRef={textareaRef}
                                selectedSource={selectedSource}
                                onSourceChange={setSelectedSource}
                                sourceLocked={hasMessages}
                                requiredBump={requiredBump}
                            />
                        </div>
                    </>
                ) : (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <h2 className="font-semibold mb-5" style={{ fontSize: '20px', lineHeight: '30px', color: '#1b2865' }}>
                            Start Querying Your Data
                        </h2>
                        <div className="w-full max-w-[640px]">
                            <InputBox
                                input={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onSend={sendMessage}
                                onStop={stopGeneration}
                                isTyping={isTyping}
                                textareaRef={textareaRef}
                                selectedSource={selectedSource}
                                onSourceChange={setSelectedSource}
                                requiredBump={requiredBump}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const title = 'Dua Chat';
export const route = '/dua-chat';

export default DuaChat;
