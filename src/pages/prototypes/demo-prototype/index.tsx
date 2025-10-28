import React, { useState } from 'react';
import { usePrototypeConfig, PrototypeConfig } from '@/lib/config';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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

const mockData: TraceData[] = [
    { spanName: 'workflow', avgDuration: '35.2 s', executionTimePercent: 16.0, p50: '24.7 s', p95: '89.2 s', p99: '267.8 s', avgFrequency: 0.4 },
    { spanName: 'response', avgDuration: '24.5 s', executionTimePercent: 9.4, p50: '14.0 s', p95: '76.3 s', p99: '133.4 s', avgFrequency: 0.4 },
    { spanName: 'summary agent', avgDuration: '37.2 s', executionTimePercent: 7.8, p50: '28.7 s', p95: '75.1 s', p99: '300.2 s', avgFrequency: 0.2 },
    { spanName: 'start', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'sample span name', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'sample span name', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'sample span name', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'sample span name', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'sample span name', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'sample span name', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'sample span name', avgDuration: '21.6 s', executionTimePercent: 6.0, p50: '14.3 s', p95: '59.5 s', p99: '135.1 s', avgFrequency: 0.3 },
    { spanName: 'data processor', avgDuration: '18.3 s', executionTimePercent: 5.5, p50: '12.1 s', p95: '45.2 s', p99: '98.7 s', avgFrequency: 0.5 },
    { spanName: 'cache handler', avgDuration: '15.7 s', executionTimePercent: 4.8, p50: '10.2 s', p95: '38.9 s', p99: '85.3 s', avgFrequency: 0.6 },
    { spanName: 'validation', avgDuration: '13.2 s', executionTimePercent: 4.2, p50: '8.7 s', p95: '32.1 s', p99: '72.4 s', avgFrequency: 0.4 },
    { spanName: 'transform', avgDuration: '11.8 s', executionTimePercent: 3.9, p50: '7.5 s', p95: '28.6 s', p99: '65.2 s', avgFrequency: 0.7 },
    { spanName: 'enrichment', avgDuration: '10.5 s', executionTimePercent: 3.5, p50: '6.8 s', p95: '25.3 s', p99: '58.1 s', avgFrequency: 0.5 },
    { spanName: 'cleanup', avgDuration: '9.2 s', executionTimePercent: 3.1, p50: '5.9 s', p95: '22.7 s', p99: '51.8 s', avgFrequency: 0.3 },
    { spanName: 'finalize', avgDuration: '8.1 s', executionTimePercent: 2.8, p50: '5.2 s', p95: '19.8 s', p99: '45.6 s', avgFrequency: 0.4 },
    { spanName: 'checkpoint', avgDuration: '7.3 s', executionTimePercent: 2.5, p50: '4.7 s', p95: '17.4 s', p99: '40.2 s', avgFrequency: 0.6 },
    { spanName: 'logger', avgDuration: '6.5 s', executionTimePercent: 2.2, p50: '4.1 s', p95: '15.8 s', p99: '36.7 s', avgFrequency: 0.8 },
    { spanName: 'metrics collector', avgDuration: '5.8 s', executionTimePercent: 2.0, p50: '3.7 s', p95: '14.1 s', p99: '32.9 s', avgFrequency: 0.9 },
    { spanName: 'event emitter', avgDuration: '5.2 s', executionTimePercent: 1.8, p50: '3.3 s', p95: '12.6 s', p99: '29.5 s', avgFrequency: 0.7 },
    { spanName: 'state manager', avgDuration: '4.7 s', executionTimePercent: 1.6, p50: '3.0 s', p95: '11.3 s', p99: '26.4 s', avgFrequency: 0.5 },
    { spanName: 'queue handler', avgDuration: '4.2 s', executionTimePercent: 1.4, p50: '2.7 s', p95: '10.1 s', p99: '23.8 s', avgFrequency: 0.6 },
    { spanName: 'router', avgDuration: '3.8 s', executionTimePercent: 1.3, p50: '2.4 s', p95: '9.2 s', p99: '21.5 s', avgFrequency: 0.8 },
    { spanName: 'middleware', avgDuration: '3.4 s', executionTimePercent: 1.2, p50: '2.2 s', p95: '8.4 s', p99: '19.7 s', avgFrequency: 0.9 },
    { spanName: 'interceptor', avgDuration: '3.1 s', executionTimePercent: 1.1, p50: '2.0 s', p95: '7.7 s', p99: '18.1 s', avgFrequency: 0.7 },
    { spanName: 'filter', avgDuration: '2.8 s', executionTimePercent: 1.0, p50: '1.8 s', p95: '7.0 s', p99: '16.5 s', avgFrequency: 0.6 },
    { spanName: 'parser', avgDuration: '2.5 s', executionTimePercent: 0.9, p50: '1.6 s', p95: '6.4 s', p99: '15.1 s', avgFrequency: 0.8 },
    { spanName: 'serializer', avgDuration: '2.3 s', executionTimePercent: 0.8, p50: '1.5 s', p95: '5.9 s', p99: '13.9 s', avgFrequency: 0.7 },
    { spanName: 'deserializer', avgDuration: '2.1 s', executionTimePercent: 0.7, p50: '1.4 s', p95: '5.4 s', p99: '12.8 s', avgFrequency: 0.6 },
    { spanName: 'encoder', avgDuration: '1.9 s', executionTimePercent: 0.7, p50: '1.2 s', p95: '5.0 s', p99: '11.8 s', avgFrequency: 0.5 },
    { spanName: 'decoder', avgDuration: '1.7 s', executionTimePercent: 0.6, p50: '1.1 s', p95: '4.6 s', p99: '10.9 s', avgFrequency: 0.5 },
    { spanName: 'compressor', avgDuration: '1.6 s', executionTimePercent: 0.5, p50: '1.0 s', p95: '4.2 s', p99: '10.0 s', avgFrequency: 0.4 },
    { spanName: 'decompressor', avgDuration: '1.4 s', executionTimePercent: 0.5, p50: '0.9 s', p95: '3.9 s', p99: '9.3 s', avgFrequency: 0.4 },
    { spanName: 'hasher', avgDuration: '1.3 s', executionTimePercent: 0.4, p50: '0.8 s', p95: '3.6 s', p99: '8.6 s', avgFrequency: 0.3 },
    { spanName: 'authenticator', avgDuration: '1.2 s', executionTimePercent: 0.4, p50: '0.8 s', p95: '3.3 s', p99: '7.9 s', avgFrequency: 0.6 },
    { spanName: 'authorizer', avgDuration: '1.1 s', executionTimePercent: 0.4, p50: '0.7 s', p95: '3.1 s', p99: '7.4 s', avgFrequency: 0.6 },
    { spanName: 'rate limiter', avgDuration: '1.0 s', executionTimePercent: 0.3, p50: '0.6 s', p95: '2.8 s', p99: '6.8 s', avgFrequency: 0.9 },
    { spanName: 'throttler', avgDuration: '0.9 s', executionTimePercent: 0.3, p50: '0.6 s', p95: '2.6 s', p99: '6.3 s', avgFrequency: 0.8 },
    { spanName: 'circuit breaker', avgDuration: '0.8 s', executionTimePercent: 0.3, p50: '0.5 s', p95: '2.4 s', p99: '5.8 s', avgFrequency: 0.2 },
    { spanName: 'retry handler', avgDuration: '0.7 s', executionTimePercent: 0.2, p50: '0.5 s', p95: '2.2 s', p99: '5.4 s', avgFrequency: 0.3 },
    { spanName: 'timeout handler', avgDuration: '0.7 s', executionTimePercent: 0.2, p50: '0.4 s', p95: '2.0 s', p99: '5.0 s', avgFrequency: 0.4 },
    { spanName: 'error handler', avgDuration: '0.6 s', executionTimePercent: 0.2, p50: '0.4 s', p95: '1.9 s', p99: '4.6 s', avgFrequency: 0.5 },
    { spanName: 'fallback', avgDuration: '0.5 s', executionTimePercent: 0.2, p50: '0.3 s', p95: '1.7 s', p99: '4.2 s', avgFrequency: 0.2 },
    { spanName: 'health check', avgDuration: '0.5 s', executionTimePercent: 0.2, p50: '0.3 s', p95: '1.6 s', p99: '3.9 s', avgFrequency: 1.0 },
    { spanName: 'ping', avgDuration: '0.4 s', executionTimePercent: 0.1, p50: '0.3 s', p95: '1.5 s', p99: '3.6 s', avgFrequency: 1.2 },
    { spanName: 'heartbeat', avgDuration: '0.4 s', executionTimePercent: 0.1, p50: '0.2 s', p95: '1.4 s', p99: '3.4 s', avgFrequency: 1.5 },
    { spanName: 'status check', avgDuration: '0.3 s', executionTimePercent: 0.1, p50: '0.2 s', p95: '1.3 s', p99: '3.2 s', avgFrequency: 1.3 },
    { spanName: 'trace collector', avgDuration: '0.3 s', executionTimePercent: 0.1, p50: '0.2 s', p95: '1.2 s', p99: '3.0 s', avgFrequency: 1.1 },
];

const DemoPrototype: React.FC = () => {
    const { getValue } = usePrototypeConfig(demoPrototypeConfig);
    const rowCount = getValue<number>('rowCount', 11);
    const enableRowHover = getValue<boolean>('enableRowHover', true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

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
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-[1200px] mx-auto">
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Table */}
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
                                {mockData.slice(0, rowCount).map((row, index) => (
                                    <tr 
                                        key={index} 
                                        className={cn(
                                            "border-t border-border",
                                            enableRowHover && "hover:bg-[#F8F8FF]"
                                        )}
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
                                ))}
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
    );
};

export const title = 'Trace View';
export const route = '/demo-prototype';

export default DemoPrototype;

