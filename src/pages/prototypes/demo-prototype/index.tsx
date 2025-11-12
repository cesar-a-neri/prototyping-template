import React, { useState } from 'react';
import { usePrototypeConfig, PrototypeConfig } from '@/lib/config';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configuration for this prototype
const demoPrototypeConfig: PrototypeConfig = {
    prototypeId: 'demo-prototype',
    title: 'Trace View Table Configuration',
    controls: [
        {
            id: 'rowCount',
            type: 'number',
            label: 'Number of Rows',
            description: 'Control how many rows are displayed in the table',
            defaultValue: 11,
            min: 1,
            max: 50
        },
        {
            id: 'enableRowHover',
            type: 'boolean',
            label: 'Enable Row Hover',
            description: 'Show background color when hovering over table rows',
            defaultValue: true
        }
    ]
};

interface TraceData {
    spanName: string;
    avgDuration: string;
    executionTimePercent: number;
    p50: string;
    p95: string;
    p99: string;
    avgFrequency: number;
}

interface FlameGraphNode {
    name: string;
    value: number;
    children?: FlameGraphNode[];
}

// Flame graph hierarchical data representing agent call stack
const flameGraphData: FlameGraphNode = {
    name: 'agent.run',
    value: 100,
    children: [
        {
            name: 'llm.generate_response',
            value: 45,
            children: [
                {
                    name: 'prompt.build_context',
                    value: 18,
                    children: [
                        { name: 'memory.retrieve_conversation_history', value: 8 },
                        { name: 'context.compress', value: 6 },
                        { name: 'prompt.template_render', value: 4 }
                    ]
                },
                {
                    name: 'tokenizer.encode',
                    value: 15,
                    children: [
                        { name: 'llm.count_tokens', value: 7 },
                        { name: 'validation.schema_check', value: 5 },
                        { name: 'context.window_manager', value: 3 }
                    ]
                },
                {
                    name: 'llm.stream_tokens',
                    value: 12,
                    children: [
                        { name: 'response.stream_chunk', value: 6 },
                        { name: 'telemetry.record_span', value: 4 },
                        { name: 'metrics.track_latency', value: 2 }
                    ]
                }
            ]
        },
        {
            name: 'retrieval.search_vector_db',
            value: 32,
            children: [
                {
                    name: 'embeddings.encode',
                    value: 14,
                    children: [
                        { name: 'llm.batch_embed', value: 8 },
                        { name: 'cache.check_semantic_cache', value: 6 }
                    ]
                },
                {
                    name: 'retrieval.rerank_results',
                    value: 10,
                    children: [
                        { name: 'parser.extract_json', value: 5 },
                        { name: 'validation.schema_check', value: 3 },
                        { name: 'cache.set', value: 2 }
                    ]
                },
                { name: 'retrieval.chunk_documents', value: 8 }
            ]
        },
        {
            name: 'tools.execute_function_call',
            value: 23,
            children: [
                {
                    name: 'parser.extract_tool_calls',
                    value: 10,
                    children: [
                        { name: 'parser.extract_json', value: 6 },
                        { name: 'validation.check_input', value: 4 }
                    ]
                },
                {
                    name: 'agent.select_tool',
                    value: 8,
                    children: [
                        { name: 'reasoning.plan_steps', value: 5 },
                        { name: 'memory.update_state', value: 3 }
                    ]
                },
                { name: 'tools.api_request', value: 5 }
            ]
        }
    ]
};

const mockData: TraceData[] = [
    { spanName: 'agent.run', avgDuration: '35.2 s', executionTimePercent: 16.0, p50: '24.7 s', p95: '89.2 s', p99: '267.8 s', avgFrequency: 0.4 },
    { spanName: 'llm.generate_response', avgDuration: '24.5 s', executionTimePercent: 9.4, p50: '14.0 s', p95: '76.3 s', p99: '133.4 s', avgFrequency: 0.4 },
    { spanName: 'retrieval.search_vector_db', avgDuration: '37.2 s', executionTimePercent: 7.8, p50: '28.7 s', p95: '75.1 s', p99: '300.2 s', avgFrequency: 0.2 },
    { spanName: 'tools.execute_function_call', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'prompt.build_context', avgDuration: '18.9 s', executionTimePercent: 5.8, p50: '12.8 s', p95: '54.2 s', p99: '128.7 s', avgFrequency: 0.5 },
    { spanName: 'memory.retrieve_conversation_history', avgDuration: '16.3 s', executionTimePercent: 5.2, p50: '11.4 s', p95: '48.7 s', p99: '115.3 s', avgFrequency: 0.4 },
    { spanName: 'embeddings.encode', avgDuration: '14.7 s', executionTimePercent: 4.9, p50: '10.1 s', p95: '43.8 s', p99: '103.6 s', avgFrequency: 0.6 },
    { spanName: 'reasoning.plan_steps', avgDuration: '13.2 s', executionTimePercent: 4.5, p50: '9.2 s', p95: '39.5 s', p99: '93.4 s', avgFrequency: 0.3 },
    { spanName: 'tools.web_search', avgDuration: '11.8 s', executionTimePercent: 4.1, p50: '8.3 s', p95: '35.6 s', p99: '84.2 s', avgFrequency: 0.2 },
    { spanName: 'parser.extract_tool_calls', avgDuration: '10.5 s', executionTimePercent: 3.8, p50: '7.5 s', p95: '31.9 s', p99: '75.5 s', avgFrequency: 0.5 },
    { spanName: 'validation.check_input', avgDuration: '9.4 s', executionTimePercent: 3.5, p50: '6.8 s', p95: '28.7 s', p99: '67.8 s', avgFrequency: 0.7 },
    { spanName: 'memory.update_state', avgDuration: '8.3 s', executionTimePercent: 3.2, p50: '6.1 s', p95: '25.8 s', p99: '61.2 s', avgFrequency: 0.4 },
    { spanName: 'tokenizer.encode', avgDuration: '7.5 s', executionTimePercent: 2.9, p50: '5.5 s', p95: '23.4 s', p99: '55.3 s', avgFrequency: 0.8 },
    { spanName: 'cache.check_semantic_cache', avgDuration: '6.8 s', executionTimePercent: 2.7, p50: '5.0 s', p95: '21.2 s', p99: '50.1 s', avgFrequency: 0.6 },
    { spanName: 'llm.stream_tokens', avgDuration: '6.2 s', executionTimePercent: 2.5, p50: '4.6 s', p95: '19.5 s', p99: '46.1 s', avgFrequency: 0.3 },
    { spanName: 'reasoning.reflect', avgDuration: '5.6 s', executionTimePercent: 2.3, p50: '4.2 s', p95: '17.9 s', p99: '42.4 s', avgFrequency: 0.2 },
    { spanName: 'tools.code_execution', avgDuration: '5.1 s', executionTimePercent: 2.1, p50: '3.8 s', p95: '16.4 s', p99: '38.9 s', avgFrequency: 0.1 },
    { spanName: 'guardrails.safety_check', avgDuration: '4.7 s', executionTimePercent: 1.9, p50: '3.5 s', p95: '15.1 s', p99: '35.7 s', avgFrequency: 0.9 },
    { spanName: 'retrieval.rerank_results', avgDuration: '4.3 s', executionTimePercent: 1.8, p50: '3.2 s', p95: '13.9 s', p99: '32.9 s', avgFrequency: 0.3 },
    { spanName: 'prompt.template_render', avgDuration: '3.9 s', executionTimePercent: 1.6, p50: '2.9 s', p95: '12.8 s', p99: '30.3 s', avgFrequency: 0.7 },
    { spanName: 'response.format_output', avgDuration: '3.6 s', executionTimePercent: 1.5, p50: '2.7 s', p95: '11.8 s', p99: '27.9 s', avgFrequency: 0.6 },
    { spanName: 'telemetry.record_span', avgDuration: '3.3 s', executionTimePercent: 1.4, p50: '2.5 s', p95: '10.9 s', p99: '25.8 s', avgFrequency: 1.0 },
    { spanName: 'tools.database_query', avgDuration: '3.0 s', executionTimePercent: 1.3, p50: '2.3 s', p95: '10.0 s', p99: '23.7 s', avgFrequency: 0.4 },
    { spanName: 'agent.select_tool', avgDuration: '2.8 s', executionTimePercent: 1.2, p50: '2.1 s', p95: '9.2 s', p99: '21.8 s', avgFrequency: 0.5 },
    { spanName: 'context.compress', avgDuration: '2.5 s', executionTimePercent: 1.1, p50: '1.9 s', p95: '8.5 s', p99: '20.1 s', avgFrequency: 0.3 },
    { spanName: 'llm.count_tokens', avgDuration: '2.3 s', executionTimePercent: 1.0, p50: '1.7 s', p95: '7.8 s', p99: '18.5 s', avgFrequency: 0.9 },
    { spanName: 'memory.summarize', avgDuration: '2.1 s', executionTimePercent: 0.9, p50: '1.6 s', p95: '7.2 s', p99: '17.0 s', avgFrequency: 0.2 },
    { spanName: 'parser.extract_json', avgDuration: '1.9 s', executionTimePercent: 0.8, p50: '1.4 s', p95: '6.6 s', p99: '15.6 s', avgFrequency: 0.6 },
    { spanName: 'tools.api_request', avgDuration: '1.7 s', executionTimePercent: 0.7, p50: '1.3 s', p95: '6.1 s', p99: '14.4 s', avgFrequency: 0.5 },
    { spanName: 'retrieval.chunk_documents', avgDuration: '1.6 s', executionTimePercent: 0.7, p50: '1.2 s', p95: '5.6 s', p99: '13.3 s', avgFrequency: 0.3 },
    { spanName: 'validation.schema_check', avgDuration: '1.4 s', executionTimePercent: 0.6, p50: '1.1 s', p95: '5.2 s', p99: '12.3 s', avgFrequency: 0.7 },
    { spanName: 'llm.batch_embed', avgDuration: '1.3 s', executionTimePercent: 0.6, p50: '1.0 s', p95: '4.8 s', p99: '11.4 s', avgFrequency: 0.4 },
    { spanName: 'context.window_manager', avgDuration: '1.2 s', executionTimePercent: 0.5, p50: '0.9 s', p95: '4.4 s', p99: '10.5 s', avgFrequency: 0.8 },
    { spanName: 'cache.set', avgDuration: '1.1 s', executionTimePercent: 0.5, p50: '0.8 s', p95: '4.1 s', p99: '9.7 s', avgFrequency: 0.6 },
    { spanName: 'metrics.track_latency', avgDuration: '1.0 s', executionTimePercent: 0.4, p50: '0.7 s', p95: '3.8 s', p99: '9.0 s', avgFrequency: 1.2 },
    { spanName: 'response.stream_chunk', avgDuration: '0.9 s', executionTimePercent: 0.4, p50: '0.7 s', p95: '3.5 s', p99: '8.3 s', avgFrequency: 0.9 },
    { spanName: 'parser.markdown_to_text', avgDuration: '0.8 s', executionTimePercent: 0.4, p50: '0.6 s', p95: '3.2 s', p99: '7.6 s', avgFrequency: 0.5 },
    { spanName: 'auth.verify_token', avgDuration: '0.7 s', executionTimePercent: 0.3, p50: '0.5 s', p95: '3.0 s', p99: '7.1 s', avgFrequency: 0.8 },
    { spanName: 'rate_limit.check', avgDuration: '0.7 s', executionTimePercent: 0.3, p50: '0.5 s', p95: '2.8 s', p99: '6.6 s', avgFrequency: 1.0 },
    { spanName: 'logging.write_span', avgDuration: '0.6 s', executionTimePercent: 0.3, p50: '0.4 s', p95: '2.6 s', p99: '6.1 s', avgFrequency: 1.1 },
    { spanName: 'queue.enqueue_task', avgDuration: '0.5 s', executionTimePercent: 0.2, p50: '0.4 s', p95: '2.4 s', p99: '5.7 s', avgFrequency: 0.4 },
    { spanName: 'error.capture_exception', avgDuration: '0.5 s', executionTimePercent: 0.2, p50: '0.3 s', p95: '2.2 s', p99: '5.2 s', avgFrequency: 0.1 },
    { spanName: 'retry.exponential_backoff', avgDuration: '0.4 s', executionTimePercent: 0.2, p50: '0.3 s', p95: '2.0 s', p99: '4.7 s', avgFrequency: 0.2 },
    { spanName: 'session.persist_state', avgDuration: '0.4 s', executionTimePercent: 0.2, p50: '0.3 s', p95: '1.8 s', p99: '4.3 s', avgFrequency: 0.5 },
    { spanName: 'timeout.wait_with_deadline', avgDuration: '0.3 s', executionTimePercent: 0.1, p50: '0.2 s', p95: '1.7 s', p99: '4.0 s', avgFrequency: 0.3 },
    { spanName: 'middleware.cors_handler', avgDuration: '0.3 s', executionTimePercent: 0.1, p50: '0.2 s', p95: '1.5 s', p99: '3.6 s', avgFrequency: 0.9 },
    { spanName: 'circuit_breaker.check_state', avgDuration: '0.3 s', executionTimePercent: 0.1, p50: '0.2 s', p95: '1.4 s', p99: '3.3 s', avgFrequency: 0.6 },
    { spanName: 'healthcheck.ping', avgDuration: '0.2 s', executionTimePercent: 0.1, p50: '0.2 s', p95: '1.3 s', p99: '3.1 s', avgFrequency: 1.5 },
    { spanName: 'metrics.increment_counter', avgDuration: '0.2 s', executionTimePercent: 0.1, p50: '0.1 s', p95: '1.2 s', p99: '2.8 s', avgFrequency: 1.3 },
    { spanName: 'trace.sample_decision', avgDuration: '0.2 s', executionTimePercent: 0.1, p50: '0.1 s', p95: '1.1 s', p99: '2.6 s', avgFrequency: 1.0 },
];

// Flame Graph Component
interface FlameGraphBlockProps {
    node: FlameGraphNode;
    depth: number;
    parentWidth: number;
    offset: number;
    hoveredSpan: string | null;
    setHoveredSpan: (span: string | null) => void;
    onSpanClick: (spanName: string) => void;
    selectedSpanName: string | null;
}

const FlameGraphBlock: React.FC<FlameGraphBlockProps> = ({ 
    node, 
    depth, 
    parentWidth, 
    offset, 
    hoveredSpan, 
    setHoveredSpan,
    onSpanClick,
    selectedSpanName
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const width = (node.value / 100) * parentWidth;
    const showText = width > 60; // Only show text if block is wide enough
    const isHighlighted = hoveredSpan === node.name || selectedSpanName === node.name;

    return (
        <>
            <div
                className={cn(
                    "absolute border border-white cursor-pointer transition-all",
                    isHighlighted && "ring-2 ring-purple-600 brightness-90"
                )}
                style={{
                    backgroundColor: '#d9daff',
                    height: '25px',
                    top: `${depth * 27}px`,
                    left: `${offset}px`,
                    width: `${width}px`,
                }}
                onMouseEnter={() => {
                    setHoveredSpan(node.name);
                    setShowTooltip(true);
                }}
                onMouseLeave={() => {
                    setHoveredSpan(null);
                    setShowTooltip(false);
                }}
                onClick={() => onSpanClick(node.name)}
            >
                {showText && (
                    <div className="px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-[14px] text-[#19202f]">
                        {node.name}
                    </div>
                )}
                {showTooltip && !showText && (
                    <div className="absolute left-0 top-full mt-1 bg-popover border border-border rounded px-2 py-1 text-xs shadow-md z-50 whitespace-nowrap">
                        {node.name}
                    </div>
                )}
            </div>
            {node.children && node.children.map((child, index) => {
                const childrenBeforeOffset = node.children!.slice(0, index).reduce((sum, c) => sum + c.value, 0);
                const childOffset = offset + (childrenBeforeOffset / 100) * parentWidth;
                return (
                    <FlameGraphBlock
                        key={`${child.name}-${index}`}
                        node={child}
                        depth={depth + 1}
                        parentWidth={parentWidth}
                        offset={childOffset}
                        hoveredSpan={hoveredSpan}
                        setHoveredSpan={setHoveredSpan}
                        onSpanClick={onSpanClick}
                        selectedSpanName={selectedSpanName}
                    />
                );
            })}
        </>
    );
};

const DemoPrototype: React.FC = () => {
    const { getValue } = usePrototypeConfig(demoPrototypeConfig);
    const rowCount = getValue<number>('rowCount', 11);
    const enableRowHover = getValue<boolean>('enableRowHover', true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;
    const [hoveredSpan, setHoveredSpan] = useState<string | null>(null);
    const [selectedSpan, setSelectedSpan] = useState<TraceData | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const flameGraphContainerRef = React.useRef<HTMLDivElement>(null);
    const [flameGraphWidth, setFlameGraphWidth] = useState(1200);

    const handleSpanClick = (spanName: string) => {
        const spanData = mockData.find(data => data.spanName === spanName);
        if (spanData) {
            setSelectedSpan(spanData);
            setIsPanelOpen(true);
        }
    };

    const closeSidePanel = () => {
        setIsPanelOpen(false);
        setSelectedSpan(null);
    };

    // Update flame graph width when container size changes
    React.useEffect(() => {
        const updateWidth = () => {
            if (flameGraphContainerRef.current) {
                const width = flameGraphContainerRef.current.offsetWidth;
                setFlameGraphWidth(width);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        
        // Update width after panel animation completes
        const timeoutId = setTimeout(updateWidth, 600);

        return () => {
            window.removeEventListener('resize', updateWidth);
            clearTimeout(timeoutId);
        };
    }, [isPanelOpen]);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 7; // Number of page buttons to show
        
        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    return (
        <div className="min-h-screen bg-background flex">
            <div className={cn(
                "transition-all duration-500 ease-in-out p-8",
                isPanelOpen ? "flex-1 pr-4" : "w-full"
            )}>
                <div className={cn(
                    "mx-auto space-y-6 transition-all duration-500 ease-in-out",
                    isPanelOpen ? "max-w-[900px]" : "max-w-[1200px]"
                )}>
                {/* Metric Cards */}
                <div className="flex gap-4">
                    <div className="flex-1 bg-card border border-border rounded px-4 py-3 min-h-[82px] flex items-center">
                        <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">
                                Average Duration
                            </div>
                            <div className="text-2xl font-medium leading-[30px] tracking-tight text-foreground">
                                93.5 s
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-card border border-border rounded px-4 py-3 min-h-[82px] flex items-center">
                        <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">
                                Total Traces
                            </div>
                            <div className="text-2xl font-medium leading-[30px] tracking-tight text-foreground">
                                1,247
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-card border border-border rounded px-4 py-3 min-h-[82px] flex items-center">
                        <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">
                                P95 Latency
                            </div>
                            <div className="text-2xl font-medium leading-[30px] tracking-tight text-foreground">
                                76.3 s
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-card border border-border rounded px-4 py-3 min-h-[82px] flex items-center">
                        <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">
                                Unique Spans
                            </div>
                            <div className="text-2xl font-medium leading-[30px] tracking-tight text-foreground">
                                23
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flame Graph */}
                <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Flame Graph</h3>
                    <div 
                        ref={flameGraphContainerRef}
                        className="relative w-full" 
                        style={{ height: '167px' }}
                    >
                        <FlameGraphBlock
                            node={flameGraphData}
                            depth={0}
                            parentWidth={flameGraphWidth}
                            offset={0}
                            hoveredSpan={hoveredSpan}
                            setHoveredSpan={setHoveredSpan}
                            onSpanClick={handleSpanClick}
                            selectedSpanName={selectedSpan?.spanName || null}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">
                                        Span Name
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">
                                        Avg. Duration
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">
                                        % Execution Time ↑↓
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">
                                        p50
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">
                                        p95
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">
                                        p99
                                    </th>
                                    <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">
                                        Avg. Frequency
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockData.slice(0, rowCount).map((row, index) => {
                                    const isHighlighted = hoveredSpan === row.spanName || selectedSpan?.spanName === row.spanName;
                                    return (
                                        <tr 
                                            key={index} 
                                            className={cn(
                                                "border-t border-border transition-colors cursor-pointer",
                                                enableRowHover && "hover:bg-[#F8F8FF]",
                                                isHighlighted && "bg-purple-100 ring-2 ring-inset ring-purple-600"
                                            )}
                                            onMouseEnter={() => setHoveredSpan(row.spanName)}
                                            onMouseLeave={() => setHoveredSpan(null)}
                                            onClick={() => handleSpanClick(row.spanName)}
                                        >
                                        <td className="px-3 py-2.5 text-sm text-foreground">
                                            {row.spanName}
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-foreground">
                                            {row.avgDuration}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-foreground min-w-[45px]">
                                                    {row.executionTimePercent.toFixed(1)}%
                                                </span>
                                                <div className="w-[125px] h-4 bg-muted rounded-sm overflow-hidden">
                                                    <div 
                                                        className="h-full bg-purple-600 dark:bg-purple-500"
                                                        style={{ width: `${Math.min(row.executionTimePercent, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-foreground">
                                            {row.p50}
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-foreground">
                                            {row.p95}
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-foreground">
                                            {row.p99}
                                        </td>
                                        <td className="px-3 py-2.5 text-sm text-foreground">
                                            {row.avgFrequency}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-1 p-4 border-t border-border">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={cn(
                                "p-2 rounded hover:bg-muted",
                                currentPage === 1 && "opacity-50 cursor-not-allowed"
                            )}
                            aria-label="First page"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={cn(
                                "p-2 rounded hover:bg-muted",
                                currentPage === 1 && "opacity-50 cursor-not-allowed"
                            )}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        
                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page as number)}
                                    className={cn(
                                        "min-w-[32px] h-8 px-3 rounded text-sm",
                                        currentPage === page
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                        
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={cn(
                                "p-2 rounded hover:bg-muted",
                                currentPage === totalPages && "opacity-50 cursor-not-allowed"
                            )}
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={cn(
                                "p-2 rounded hover:bg-muted",
                                currentPage === totalPages && "opacity-50 cursor-not-allowed"
                            )}
                            aria-label="Last page"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Panel */}
            <div 
                className={cn(
                    "h-screen bg-card border-l border-border shadow-xl overflow-y-auto transition-all duration-500 ease-in-out relative z-50",
                    isPanelOpen ? "w-[400px]" : "w-0"
                )}
                style={{
                    minWidth: isPanelOpen ? '400px' : '0px',
                }}
            >
                <div className={cn(
                    "flex flex-col gap-4 p-4 transition-opacity duration-300 min-w-[400px]",
                    isPanelOpen ? "opacity-100 delay-200" : "opacity-0"
                )}>
                    {selectedSpan && (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Span Inspector</h3>
                                <button
                                    onClick={closeSidePanel}
                                    className="p-1.5 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                        {/* Span Name */}
                        <div className="flex flex-col gap-1">
                            <div className="text-sm text-muted-foreground">Span Name</div>
                            <div className="text-sm font-medium">{selectedSpan.spanName}</div>
                        </div>

                        {/* Key Metrics */}
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium">Key Metrics</div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-background border border-border rounded px-4 py-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm text-muted-foreground">% Exec. Time</div>
                                        <div className="text-2xl font-medium leading-[30px] tracking-tight">
                                            {selectedSpan.executionTimePercent.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-background border border-border rounded px-4 py-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm text-muted-foreground">Avg Duration</div>
                                        <div className="text-2xl font-medium leading-[30px] tracking-tight">
                                            {selectedSpan.avgDuration}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Latency Distribution */}
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium">Latency Distribution</div>
                            <div className="flex flex-col gap-3">
                                {[
                                    { label: 'min', value: '20.5 s', percent: 5 },
                                    { label: 'p50', value: selectedSpan.p50, percent: 10 },
                                    { label: 'p95', value: selectedSpan.p95, percent: 29 },
                                    { label: 'p99', value: selectedSpan.p99, percent: 75 },
                                    { label: 'max', value: '514.05 s', percent: 100 },
                                ].map((item) => (
                                    <div key={item.label} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground w-[100px]">{item.label}</span>
                                            <span className="text-foreground">{item.value}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                                            <div
                                                className="h-full bg-purple-600"
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                <div className="text-sm font-medium">Actions</div>
                                <div className="flex flex-col gap-2">
                                    <button className="w-full px-4 py-2 text-sm border border-border rounded hover:bg-muted transition-colors text-purple-600 font-medium">
                                        View Slowest Traces
                                    </button>
                                    <button className="w-full px-4 py-2 text-sm border border-border rounded hover:bg-muted transition-colors text-purple-600 font-medium">
                                        View Recent Traces
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const title = 'Trace View';
export const route = '/demo-prototype';

export default DemoPrototype;

