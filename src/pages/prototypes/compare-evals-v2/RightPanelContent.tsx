import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Filter, Search, Download, ArrowUpDown, List, Grid3x3, Grid2x2, TableIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, RefreshCw, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadEvaluationByName, type EvaluationMetadata, type EvaluationData } from '@/utils/csvLoader';
import { GroupMetricsChart } from './GroupMetricsChart';
import { CustomMetricChart } from './CustomMetricChart';
import { MetricsChart } from './MetricsChart';
import { dummyTableData, isNumericalColumn } from './chartHelpers';

// Right Panel Content Component
interface RightPanelContentProps {
    evaluationName: string;
    evaluations: EvaluationMetadata[];
    evaluationMetadata?: EvaluationMetadata | null;
    isGroupsEmptyState?: boolean;
    isCreatingGroup?: boolean;
    selectedGroupEvaluations?: string[];
    groupName?: string;
}

const RightPanelContent: React.FC<RightPanelContentProps> = ({
    evaluationName,
    evaluations,
    evaluationMetadata = null,
    isGroupsEmptyState = false,
    isCreatingGroup = false,
    selectedGroupEvaluations = [],
    groupName = ''
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'data' | 'annotation'>('data');
    const [viewMode, setViewMode] = useState<'compact' | 'normal' | 'expanded'>('normal');
    const [currentPage, setCurrentPage] = useState(1);
    const [tableData, setTableData] = useState<EvaluationData[]>([]);
    const [comparisonData, setComparisonData] = useState<Map<string, EvaluationData[]>>(new Map());
    const [groupActiveTab, setGroupActiveTab] = useState<'metrics' | 'data'>('data');
    const [multiGroupActiveTab, setMultiGroupActiveTab] = useState<'metrics' | 'data'>('data');
    const [copiedId, setCopiedId] = useState(false);
    const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState(false);
    const [customMetrics, setCustomMetrics] = useState<Array<{
        id: string;
        name: string;
        columnMappings: Map<string, string>; // evalName -> columnName
    }>>(() => {
        // Initialize from localStorage
        try {
            const stored = localStorage.getItem('customMetrics');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.map((metric: any) => ({
                    ...metric,
                    columnMappings: new Map(Object.entries(metric.columnMappings))
                }));
            }
        } catch (error) {
            console.error('Error loading custom metrics from localStorage:', error);
        }
        return [];
    });
    const [newMetricName, setNewMetricName] = useState('Untitled Graph');
    const [newMetricColumns, setNewMetricColumns] = useState<Map<string, string>>(new Map());
    const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
    const [hiddenDefaultMetrics, setHiddenDefaultMetrics] = useState<Set<string>>(() => {
        // Initialize from localStorage
        try {
            const stored = localStorage.getItem('hiddenDefaultMetrics');
            if (stored) {
                return new Set(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading hidden metrics from localStorage:', error);
        }
        return new Set();
    });
    const itemsPerPage = 7;
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    const paginatedData = tableData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Get column names from the data
    const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    // Load CSV data when evaluation changes
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await loadEvaluationByName(evaluations, evaluationName);
                setTableData(data);
                setCurrentPage(1); // Reset to first page when evaluation changes
            } catch (error) {
                console.error('Error loading evaluation data:', error);
                // Fallback to dummy data if loading fails
                setTableData(dummyTableData);
            }
        };

        if (evaluations.length > 0 && !isCreatingGroup) {
            loadData();
        }
    }, [evaluationName, evaluations, isCreatingGroup]);

    // Load data for selected evaluations in comparison mode
    useEffect(() => {
        const loadComparisonData = async () => {
            if (selectedGroupEvaluations.length === 0) {
                setComparisonData(new Map());
                return;
            }

            const dataMap = new Map<string, EvaluationData[]>();

            for (const evalName of selectedGroupEvaluations) {
                try {
                    const data = await loadEvaluationByName(evaluations, evalName);
                    dataMap.set(evalName, data);
                } catch (error) {
                    console.error(`Error loading data for ${evalName}:`, error);
                }
            }

            setComparisonData(dataMap);
            setCurrentPage(1);
        };

        loadComparisonData();
    }, [selectedGroupEvaluations, evaluations]);

    // Auto-generate metric name when columns are selected
    useEffect(() => {
        if (isAddMetricModalOpen && !editingMetricId && newMetricColumns.size > 0 && !newMetricName) {
            // Use the first selected column as the base name
            const firstColumn = Array.from(newMetricColumns.values())[0];
            const displayName = firstColumn
                .replace(/^eval_/, '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            setNewMetricName(displayName);
        }
    }, [newMetricColumns, isAddMetricModalOpen, editingMetricId, newMetricName]);

    // Save customMetrics to localStorage whenever it changes
    useEffect(() => {
        try {
            const serialized = customMetrics.map(metric => ({
                ...metric,
                columnMappings: Object.fromEntries(metric.columnMappings)
            }));
            localStorage.setItem('customMetrics', JSON.stringify(serialized));
        } catch (error) {
            console.error('Error saving custom metrics to localStorage:', error);
        }
    }, [customMetrics]);

    // Save hiddenDefaultMetrics to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('hiddenDefaultMetrics', JSON.stringify(Array.from(hiddenDefaultMetrics)));
        } catch (error) {
            console.error('Error saving hidden metrics to localStorage:', error);
        }
    }, [hiddenDefaultMetrics]);

    // Render modal component (defined early so it's available in all return paths)
    const renderModal = () => {
        if (!isAddMetricModalOpen) {
            return null;
        }
        return createPortal(
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
                onClick={() => setIsAddMetricModalOpen(false)}
            >
                <div
                    className="bg-white rounded-xl w-[624px] flex flex-col gap-4 p-6"
                    style={{
                        boxShadow: '0px 12px 32px -16px rgba(0, 0, 0, 0.3), 0px 12px 60px 0px rgba(0, 0, 0, 0.15)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start gap-2 w-full">
                        <div className="flex-1 flex flex-col gap-1">
                            <h2 className="text-2xl font-medium leading-[30px] text-[#19202f] tracking-[-0.1px]">
                                {editingMetricId ? 'Edit Graph' : 'Add Graph'}
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                setIsAddMetricModalOpen(false);
                                setEditingMetricId(null);
                                setNewMetricName('Untitled Graph');
                                setNewMetricColumns(new Map());
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Graph Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-normal leading-5 text-[#19202f]">
                            Graph Title
                        </label>
                        <input
                            type="text"
                            value={newMetricName}
                            onChange={(e) => setNewMetricName(e.target.value)}
                            placeholder="Untitled Graph"
                            className="w-full h-8 px-2 text-sm leading-5 border border-[#c5cfe4] rounded bg-[rgba(255,255,255,0.9)] text-[#19202f] focus:outline-none focus:ring-2 focus:ring-[#714dff]/20 focus:border-[#714dff]"
                        />
                    </div>

                    {/* Column Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-normal leading-5 text-[#19202f]">
                            Select Columns
                        </label>

                        <div className="flex flex-col">
                            {selectedGroupEvaluations.map((evalName, index) => {
                                const data = comparisonData.get(evalName) || [];
                                const columns = data.length > 0 ? Object.keys(data[0]) : [];

                                // Define color palette matching Figma
                                const evaluationColors = [
                                    'linear-gradient(to right, #8b7fff, #6257ff)', // Purple
                                    'linear-gradient(to right, #63e6be, #20c997)', // Teal/cyan
                                    'linear-gradient(to right, #ffb347, #ff8c42)', // Orange
                                    'linear-gradient(to right, #ff7fcc, #c4348b)', // Pink
                                ];

                                return (
                                    <div key={evalName}>
                                        {index === 0 && (
                                            <div className="h-px w-full bg-[#e9ecef]" />
                                        )}
                                        {index > 0 && (
                                            <div className="h-px w-full bg-[#e9ecef]" />
                                        )}
                                        <div className="flex items-center gap-2 py-2 w-full">
                                            <div className="flex items-center gap-1 flex-1">
                                                <div
                                                    className="w-[18px] h-[18px] rounded-sm shrink-0"
                                                    style={{ background: evaluationColors[index % evaluationColors.length] }}
                                                />
                                                <span className="text-sm font-normal leading-5 text-[#19202f] pl-1">
                                                    {evalName}
                                                </span>
                                            </div>
                                            <select
                                                value={newMetricColumns.get(evalName) || ''}
                                                onChange={(e) => {
                                                    const newMap = new Map(newMetricColumns);
                                                    if (e.target.value) {
                                                        newMap.set(evalName, e.target.value);
                                                    } else {
                                                        newMap.delete(evalName);
                                                    }
                                                    setNewMetricColumns(newMap);
                                                }}
                                                className="flex-1 h-8 px-2 text-sm leading-5 border border-[#c5cfe4] rounded bg-white text-[#19202f] focus:outline-none focus:ring-2 focus:ring-[#714dff]/20 focus:border-[#714dff]"
                                            >
                                                <option value="">Select Column...</option>
                                                {columns.map((col) => (
                                                    <option key={col} value={col}>
                                                        {col}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                            {selectedGroupEvaluations.length > 0 && (
                                <div className="h-px w-full bg-[#e9ecef]" />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 pt-2 w-full">
                        <button
                            onClick={() => {
                                setIsAddMetricModalOpen(false);
                                setEditingMetricId(null);
                                setNewMetricName('Untitled Graph');
                                setNewMetricColumns(new Map());
                            }}
                            className="h-8 px-3 text-sm font-semibold text-[#5b6579] rounded hover:bg-gray-100 transition-colors leading-5 tracking-[-0.16px]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (newMetricName.trim() && newMetricColumns.size > 0) {
                                    if (editingMetricId) {
                                        // Check if editing a default metric (column name) or custom metric (numeric ID)
                                        const existingCustomMetric = customMetrics.find(m => m.id === editingMetricId);

                                        if (existingCustomMetric) {
                                            // Update existing custom metric
                                            setCustomMetrics(customMetrics.map(m =>
                                                m.id === editingMetricId
                                                    ? { ...m, name: newMetricName, columnMappings: new Map(newMetricColumns) }
                                                    : m
                                            ));
                                        } else {
                                            // Converting a default metric to custom - hide the default and create new custom
                                            setHiddenDefaultMetrics(new Set([...hiddenDefaultMetrics, editingMetricId]));
                                            setCustomMetrics([...customMetrics, {
                                                id: Date.now().toString(),
                                                name: newMetricName,
                                                columnMappings: new Map(newMetricColumns)
                                            }]);
                                        }
                                    } else {
                                        // Add new metric
                                        setCustomMetrics([...customMetrics, {
                                            id: Date.now().toString(),
                                            name: newMetricName,
                                            columnMappings: new Map(newMetricColumns)
                                        }]);
                                    }
                                    setIsAddMetricModalOpen(false);
                                    setEditingMetricId(null);
                                    setNewMetricName('Untitled Graph');
                                    setNewMetricColumns(new Map());
                                }
                            }}
                            disabled={!newMetricName.trim() || newMetricColumns.size === 0}
                            className={cn(
                                "h-8 px-3 text-sm font-semibold rounded transition-colors leading-5 tracking-[-0.16px]",
                                newMetricName.trim() && newMetricColumns.size > 0
                                    ? "bg-[#714dff] text-white hover:bg-[#5f3dd6]"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {editingMetricId ? 'Update' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    // Show empty state when in groups tab or when creating group with no selections
    if (isGroupsEmptyState || (isCreatingGroup && selectedGroupEvaluations.length === 0)) {
        return (
            <>
                <div className="flex items-center justify-center flex-1 h-full border-l border-border bg-white overflow-hidden">
                    <p className="text-sm text-muted-foreground">No dataset selected</p>
                </div>
                {renderModal()}
            </>
        );
    }

    // Show comparison view when evaluations are selected (either creating/editing or viewing a group)
    if (selectedGroupEvaluations.length > 0) {
        // Define color palette for evaluations (same for single and multi views)
        const evaluationColors = [
            'linear-gradient(to right, #8b7fff, #6257ff)', // Purple
            'linear-gradient(to right, #63e6be, #20c997)', // Teal/cyan
            'linear-gradient(to right, #ffb347, #ff8c42)', // Orange
            'linear-gradient(to right, #ff7fcc, #c4348b)', // Pink
            'linear-gradient(to right, #87ceeb, #4682b4)', // Sky blue
            'linear-gradient(to right, #98d8c8, #6bcf7f)', // Green
            'linear-gradient(to right, #f6ad55, #ed8936)', // Amber
            'linear-gradient(to right, #b794f6, #9f7aea)', // Lavender
        ];

        // Single evaluation view
        if (selectedGroupEvaluations.length === 1) {
            const singleEvalData = comparisonData.get(selectedGroupEvaluations[0]) || [];
            const singleColumns = singleEvalData.length > 0 ? Object.keys(singleEvalData[0]) : [];
            const singlePaginatedData = singleEvalData.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            );
            const singleTotalPages = Math.ceil(singleEvalData.length / itemsPerPage);

            return (
                <>
                <div className="flex flex-col flex-1 h-full border-l border-border bg-white overflow-hidden">
                    {/* Header */}
                    <div className="border-b border-border shrink-0 overflow-hidden">
                        <div className="flex items-center justify-between px-4 pt-[18px] pb-0 overflow-hidden gap-4">
                            <h2 className="text-[20px] font-medium leading-7 text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink-0">
                                {groupName || 'Evaluation Group'}
                            </h2>
                            {/* Color Legend */}
                            <div className="flex gap-4 items-center overflow-x-auto">
                                {selectedGroupEvaluations.map((evalName, index) => (
                                    <div key={evalName} className="flex items-center gap-1 shrink-0">
                                        <div
                                            className="w-4 h-4 rounded-sm shrink-0"
                                            style={{ background: evaluationColors[index % evaluationColors.length] }}
                                        />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {evalName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex h-10 items-start overflow-clip px-4 mt-2">
                            <button
                                onClick={() => setGroupActiveTab('metrics')}
                                className={cn(
                                    "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                    groupActiveTab === 'metrics'
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                Metrics
                                {groupActiveTab === 'metrics' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                                )}
                            </button>
                            <button
                                onClick={() => setGroupActiveTab('data')}
                                className={cn(
                                    "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                    groupActiveTab === 'data'
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                Data
                                {groupActiveTab === 'data' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Toolbar - Only show for Data tab */}
                    {groupActiveTab === 'data' && (
                    <div className="bg-white px-4 py-2 shrink-0 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-1 items-center">
                                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex gap-2 items-center">
                                <button className="flex items-center gap-1 h-6 px-2 text-xs font-semibold text-muted-foreground hover:bg-hover rounded">
                                    <List className="w-3 h-3" />
                                    Columns
                                </button>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Tab Content */}
                    {groupActiveTab === 'metrics' ? (
                        // Metrics View
                        <div className="flex-1 overflow-y-auto">
                            {(() => {
                                const evalColumns = singleColumns.filter(col => col.startsWith('eval_') && !hiddenDefaultMetrics.has(col));
                                const totalMetrics = evalColumns.length + customMetrics.length;

                                if (totalMetrics === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <p className="text-muted-foreground">No metrics to display</p>
                                        </div>
                                    );
                                }

                                let chartIndex = 0;

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        {evalColumns.map((column) => (
                                            <GroupMetricsChart
                                                key={column}
                                                columnName={column}
                                                evaluationsData={comparisonData}
                                                evaluationNames={selectedGroupEvaluations}
                                                evaluationColors={evaluationColors}
                                                index={chartIndex++}
                                                onEdit={() => {
                                                    // Convert default metric to custom metric
                                                    const displayName = column
                                                        .replace(/^eval_/, '')
                                                        .replace(/_/g, ' ')
                                                        .replace(/\b\w/g, l => l.toUpperCase());

                                                    // Create column mappings for all selected evaluations
                                                    const columnMappings = new Map<string, string>();
                                                    selectedGroupEvaluations.forEach(evalName => {
                                                        const data = comparisonData.get(evalName) || [];
                                                        if (data.length > 0 && data[0][column] !== undefined) {
                                                            columnMappings.set(evalName, column);
                                                        }
                                                    });

                                                    setNewMetricName(displayName);
                                                    setNewMetricColumns(columnMappings);
                                                    setEditingMetricId(column); // Use column name as temp ID
                                                    setIsAddMetricModalOpen(true);
                                                }}
                                                onDelete={() => {
                                                    setHiddenDefaultMetrics(new Set([...hiddenDefaultMetrics, column]));
                                                }}
                                            />
                                        ))}

                                        {/* Custom Metrics */}
                                        {customMetrics.map((metric) => (
                                            <CustomMetricChart
                                                key={metric.id}
                                                metric={metric}
                                                evaluationsData={comparisonData}
                                                evaluationNames={selectedGroupEvaluations}
                                                evaluationColors={evaluationColors}
                                                index={chartIndex++}
                                                onEdit={() => {
                                                    setEditingMetricId(metric.id);
                                                    setNewMetricName(metric.name);
                                                    setNewMetricColumns(new Map(metric.columnMappings));
                                                    setIsAddMetricModalOpen(true);
                                                }}
                                                onDelete={() => {
                                                    setCustomMetrics(customMetrics.filter(m => m.id !== metric.id));
                                                }}
                                            />
                                        ))}

                                        {/* Add Metric Button */}
                                        <button
                                            onClick={() => setIsAddMetricModalOpen(true)}
                                            type="button"
                                            className={cn(
                                                "bg-white border flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-[#fafbff]",
                                                chartIndex % 2 === 1 && "md:-ml-[1px]",
                                                chartIndex > 0 && "-mt-[1px] md:mt-0",
                                                chartIndex >= 2 && "md:-mt-[1px]"
                                            )}
                                            style={{ minHeight: '291px' }}
                                        >
                                            <Plus className="w-6 h-6 text-[#613ee0] mb-2" />
                                            <span className="text-sm font-medium text-[#613ee0]">Add Graph</span>
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                    // Data Table View
                    <div className="flex-1 flex flex-col pt-1 overflow-hidden">
                        <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden min-h-0">
                            <div className="border border-border rounded flex flex-col h-full min-h-0">
                                {singlePaginatedData.length > 0 ? (
                                    <>
                                        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                                            <div className="inline-block min-w-full">
                                                <table className="border-collapse">
                                                    <thead className="sticky top-0 z-10">
                                                        <tr className="bg-[#f7faff] border-b border-border">
                                                            {singleColumns.map((column, index) => (
                                                                <th
                                                                    key={column}
                                                                    className="text-left px-2 h-[36px] text-sm font-normal text-muted-foreground bg-[#f7faff] whitespace-nowrap"
                                                                    style={{
                                                                        width: index === 0 ? '120px' : '200px',
                                                                        minWidth: index === 0 ? '120px' : '200px',
                                                                        maxWidth: '320px'
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="overflow-hidden text-ellipsis">
                                                                            {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                        </span>
                                                                        <ArrowUpDown className="w-4 h-4 text-[#afbcd8] shrink-0" />
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {singlePaginatedData.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className="border-b border-border last:border-b-0">
                                                                {singleColumns.map((column, colIndex) => (
                                                                    <td
                                                                        key={column}
                                                                        className="px-2 py-2 text-sm align-top"
                                                                        style={{
                                                                            width: colIndex === 0 ? '120px' : '200px',
                                                                            minWidth: colIndex === 0 ? '120px' : '200px',
                                                                            maxWidth: '320px',
                                                                            maxHeight: '100px'
                                                                        }}
                                                                    >
                                                                        <div className="overflow-hidden" style={{
                                                                            maxHeight: '100px',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: 4,
                                                                            WebkitBoxOrient: 'vertical',
                                                                            wordBreak: 'break-word'
                                                                        }}>
                                                                            {row[column] || ''}
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-white shrink-0 overflow-hidden">
                                            <div className="flex items-center gap-0 min-w-0">
                                                <button
                                                    onClick={() => setCurrentPage(1)}
                                                    disabled={currentPage === 1}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsLeft className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-3 h-3" />
                                                </button>
                                                {Array.from({ length: Math.min(singleTotalPages, 6) }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={cn(
                                                            "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                                            currentPage === page
                                                                ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                                                : "hover:bg-hover"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(singleTotalPages, prev + 1))}
                                                    disabled={currentPage === singleTotalPages}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(singleTotalPages)}
                                                    disabled={currentPage === singleTotalPages}
                                                    className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, singleEvalData.length)} of {singleEvalData.length}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <p>No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    )}
                </div>
                {renderModal()}
                </>
            );
        }

        // Multi-evaluation comparison view
        // Get columns for each evaluation in order
        const evalColumns = new Map<string, string[]>();
        for (const evalName of selectedGroupEvaluations) {
            const data = comparisonData.get(evalName) || [];
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            evalColumns.set(evalName, columns);
        }

        // Find the maximum number of columns across all evaluations
        const maxColumnCount = Math.max(...Array.from(evalColumns.values()).map(cols => cols.length));

        // Create interleaved columns: position by position across evaluations
        const interleavedColumns: Array<{ evalName: string; columnName: string | null }> = [];

        for (let colIndex = 0; colIndex < maxColumnCount; colIndex++) {
            for (const evalName of selectedGroupEvaluations) {
                const columns = evalColumns.get(evalName) || [];
                // Add column if it exists at this position, otherwise null (will be handled later)
                if (colIndex < columns.length) {
                    interleavedColumns.push({
                        evalName,
                        columnName: columns[colIndex]
                    });
                }
            }
        }

        // Add remaining columns from evaluations that have more columns
        // These are already included in the loop above, so we don't need additional logic

        // Get max row count across all datasets
        const maxRows = Math.max(...Array.from(comparisonData.values()).map(data => data.length));
        const comparisonTotalPages = Math.ceil(maxRows / itemsPerPage);
        const startRow = (currentPage - 1) * itemsPerPage;
        const endRow = Math.min(currentPage * itemsPerPage, maxRows);

        // Get common eval_ columns across all evaluations
        const commonEvalColumns = (() => {
            const allEvalColumns = Array.from(comparisonData.values())
                .map(data => data.length > 0 ? Object.keys(data[0]).filter(col => col.startsWith('eval_')) : []);

            if (allEvalColumns.length === 0) return [];

            // Find columns that appear in at least one evaluation
            const columnSet = new Set<string>();
            allEvalColumns.forEach(cols => cols.forEach(col => columnSet.add(col)));

            return Array.from(columnSet).sort();
        })();

        return (
            <>
            <div className="flex flex-col flex-1 h-full border-l border-border bg-white overflow-hidden">
                {/* Header */}
                <div className="border-b border-border shrink-0 overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-[18px] pb-0 overflow-hidden gap-4">
                        <h2 className="text-[20px] font-medium leading-7 text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink-0">
                            {groupName || 'Evaluation Group'}
                        </h2>
                        {/* Color Legend */}
                        <div className="flex gap-4 items-center overflow-x-auto">
                            {selectedGroupEvaluations.map((evalName, index) => (
                                <div key={evalName} className="flex items-center gap-1 shrink-0">
                                    <div
                                        className="w-4 h-4 rounded-sm shrink-0"
                                        style={{ background: evaluationColors[index % evaluationColors.length] }}
                                    />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {evalName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex h-10 items-start overflow-clip px-4 mt-2">
                        <button
                            onClick={() => setMultiGroupActiveTab('metrics')}
                            className={cn(
                                "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                multiGroupActiveTab === 'metrics'
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                            )}
                        >
                            Metrics
                            {multiGroupActiveTab === 'metrics' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                            )}
                        </button>
                        <button
                            onClick={() => setMultiGroupActiveTab('data')}
                            className={cn(
                                "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                                multiGroupActiveTab === 'data'
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                            )}
                        >
                            Data
                            {multiGroupActiveTab === 'data' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Toolbar - Only show for Data tab */}
                {multiGroupActiveTab === 'data' && (
                <div className="bg-white px-4 py-2 shrink-0 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1 items-center">
                            <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button className="flex items-center gap-1 h-6 px-2 text-xs font-semibold text-muted-foreground hover:bg-hover rounded">
                                <List className="w-3 h-3" />
                                Columns
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {/* Tab Content */}
                {multiGroupActiveTab === 'metrics' ? (
                    // Metrics View
                    <div className="flex-1 overflow-y-auto">
                        {(() => {
                            const visibleCommonColumns = commonEvalColumns.filter(col => !hiddenDefaultMetrics.has(col));
                            const totalMetrics = visibleCommonColumns.length + customMetrics.length;

                            if (totalMetrics === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <p className="text-muted-foreground">No metrics to display</p>
                                    </div>
                                );
                            }

                            let chartIndex = 0;

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {visibleCommonColumns.map((column) => (
                                        <GroupMetricsChart
                                            key={column}
                                            columnName={column}
                                            evaluationsData={comparisonData}
                                            evaluationNames={selectedGroupEvaluations}
                                            evaluationColors={evaluationColors}
                                            index={chartIndex++}
                                            onEdit={() => {
                                                // Convert default metric to custom metric
                                                const displayName = column
                                                    .replace(/^eval_/, '')
                                                    .replace(/_/g, ' ')
                                                    .replace(/\b\w/g, l => l.toUpperCase());

                                                // Create column mappings for all selected evaluations
                                                const columnMappings = new Map<string, string>();
                                                selectedGroupEvaluations.forEach(evalName => {
                                                    const data = comparisonData.get(evalName) || [];
                                                    if (data.length > 0 && data[0][column] !== undefined) {
                                                        columnMappings.set(evalName, column);
                                                    }
                                                });

                                                setNewMetricName(displayName);
                                                setNewMetricColumns(columnMappings);
                                                setEditingMetricId(column); // Use column name as temp ID
                                                setIsAddMetricModalOpen(true);
                                            }}
                                            onDelete={() => {
                                                setHiddenDefaultMetrics(new Set([...hiddenDefaultMetrics, column]));
                                            }}
                                        />
                                    ))}

                                    {/* Custom Metrics */}
                                    {customMetrics.map((metric) => (
                                        <CustomMetricChart
                                            key={metric.id}
                                            metric={metric}
                                            evaluationsData={comparisonData}
                                            evaluationNames={selectedGroupEvaluations}
                                            evaluationColors={evaluationColors}
                                            index={chartIndex++}
                                            onEdit={() => {
                                                setEditingMetricId(metric.id);
                                                setNewMetricName(metric.name);
                                                setNewMetricColumns(new Map(metric.columnMappings));
                                                setIsAddMetricModalOpen(true);
                                            }}
                                            onDelete={() => {
                                                setCustomMetrics(customMetrics.filter(m => m.id !== metric.id));
                                            }}
                                        />
                                    ))}

                                    {/* Add Metric Button */}
                                    <button
                                        onClick={() => setIsAddMetricModalOpen(true)}
                                        type="button"
                                        className={cn(
                                            "bg-white border flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-[#fafbff]",
                                            chartIndex % 2 === 1 && "md:-ml-[1px]",
                                            chartIndex > 0 && "-mt-[1px] md:mt-0",
                                            chartIndex >= 2 && "md:-mt-[1px]"
                                        )}
                                        style={{ minHeight: '291px' }}
                                    >
                                        <Plus className="w-6 h-6 text-[#613ee0] mb-2" />
                                        <span className="text-sm font-medium text-[#613ee0]">Add Graph</span>
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                // Comparison Table
                <div className="flex-1 flex flex-col pt-1 overflow-hidden">
                    <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden min-h-0">
                        <div className="border border-border rounded flex flex-col h-full min-h-0">
                            {interleavedColumns.length > 0 ? (
                                <>
                                    <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                                        <div className="inline-block min-w-full">
                                            <table className="border-collapse">
                                                <thead className="sticky top-0 z-10">
                                                    <tr className="bg-[#f7faff] border-b border-border">
                                                        {interleavedColumns.map((col, index) => {
                                                            const evalIndex = selectedGroupEvaluations.indexOf(col.evalName);
                                                            const colorGradient = evaluationColors[evalIndex % evaluationColors.length];

                                                            return (
                                                                <th
                                                                    key={`${col.evalName}-${col.columnName}-${index}`}
                                                                    className="text-left px-2 h-[36px] text-sm font-normal text-muted-foreground bg-[#f7faff] whitespace-nowrap border-r border-border last:border-r-0"
                                                                    style={{
                                                                        width: '200px',
                                                                        minWidth: '200px',
                                                                        maxWidth: '320px'
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        {/* Colored chip */}
                                                                        <div
                                                                            className="w-4 h-4 rounded-sm shrink-0"
                                                                            style={{ background: colorGradient }}
                                                                        />
                                                                        {/* Column name */}
                                                                        <span className="flex-1 overflow-hidden text-ellipsis">
                                                                            {col.columnName ? col.columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                                                                        </span>
                                                                        {/* Sort icon */}
                                                                        <ArrowUpDown className="w-4 h-4 text-[#afbcd8] shrink-0" />
                                                                    </div>
                                                                </th>
                                                            );
                                                        })}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.from({ length: endRow - startRow }, (_, rowIndex) => {
                                                        const actualRowIndex = startRow + rowIndex;
                                                        return (
                                                            <tr key={actualRowIndex} className="border-b border-border last:border-b-0">
                                                                {interleavedColumns.map((col, colIndex) => {
                                                                    const evalData = comparisonData.get(col.evalName) || [];
                                                                    const row = evalData[actualRowIndex];
                                                                    const cellValue = (row && col.columnName) ? row[col.columnName] : '';

                                                                    return (
                                                                        <td
                                                                            key={`${col.evalName}-${col.columnName}-${colIndex}`}
                                                                            className="px-2 py-2 text-sm align-top border-r border-border last:border-r-0"
                                                                            style={{
                                                                                width: '200px',
                                                                                minWidth: '200px',
                                                                                maxWidth: '320px',
                                                                                maxHeight: '100px'
                                                                            }}
                                                                        >
                                                                            <div className="overflow-hidden" style={{
                                                                                maxHeight: '100px',
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 4,
                                                                                WebkitBoxOrient: 'vertical',
                                                                                wordBreak: 'break-word'
                                                                            }}>
                                                                                {cellValue || ''}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-white shrink-0 overflow-hidden">
                                        <div className="flex items-center gap-0 min-w-0">
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsLeft className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-3 h-3" />
                                            </button>
                                            {Array.from({ length: Math.min(comparisonTotalPages, 6) }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={cn(
                                                        "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                                        currentPage === page
                                                            ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                                            : "hover:bg-hover"
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(comparisonTotalPages, prev + 1))}
                                                disabled={currentPage === comparisonTotalPages}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(comparisonTotalPages)}
                                                disabled={currentPage === comparisonTotalPages}
                                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronsRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                Showing {startRow + 1}-{endRow} of {maxRows}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}
            </div>
            {renderModal()}
            </>
        );
    }

    return (
        <>
        <div className="flex flex-col flex-1 h-full border-l border-border bg-white overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-border shrink-0 overflow-hidden">
                {/* Title, ID, and Actions */}
                <div className="flex items-center justify-between px-4 pt-[18px] pb-0 overflow-hidden gap-1">
                    <h2 className="text-[20px] font-medium leading-7 text-foreground overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">
                        {evaluationName}
                    </h2>
                    <button className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-[#613ee0] hover:bg-hover rounded shrink-0 ml-auto">
                        <RefreshCw className="w-4 h-4" />
                        Rerun
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex h-10 items-start overflow-clip px-4 mt-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'overview'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Overview
                        {activeTab === 'overview' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('metrics')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'metrics'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Dashboard
                        {activeTab === 'metrics' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'data'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Data
                        {activeTab === 'data' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('annotation')}
                        className={cn(
                            "flex items-center justify-center h-full px-2 min-w-[64px] text-sm relative",
                            activeTab === 'annotation'
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                        )}
                    >
                        Annotation tasks
                        {activeTab === 'annotation' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2e1e71]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Toolbar Section - Only show for Data tab */}
            {activeTab === 'data' && (
            <div className="bg-white px-4 py-2 shrink-0 overflow-hidden">
                <div className="flex items-center justify-between">
                    {/* Left side - Filter, Search, Download */}
                    <div className="flex gap-1 items-center">
                        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                            <Filter className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                            <Search className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-hover text-muted-foreground hover:text-foreground">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right side - Columns and View Toggle */}
                    <div className="flex gap-2 items-center">
                        <button className="flex items-center gap-1 h-6 px-2 text-xs font-semibold text-muted-foreground hover:bg-hover rounded">
                            <List className="w-3 h-3" />
                            Columns
                        </button>
                        <div className="flex items-center h-6 bg-white border border-border rounded">
                            <button
                                onClick={() => setViewMode('compact')}
                                className={cn(
                                    "flex items-center justify-center w-12 h-full rounded-l px-4 text-sm",
                                    viewMode === 'compact'
                                        ? "bg-[rgba(0,0,255,0.03)] border border-[#b7b5ff] text-foreground font-medium opacity-88"
                                        : "text-muted-foreground hover:bg-hover"
                                )}
                            >
                                <Grid3x3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('normal')}
                                className={cn(
                                    "flex items-center justify-center w-12 h-full px-4 text-sm",
                                    viewMode === 'normal'
                                        ? "bg-[rgba(0,0,255,0.03)] border border-[#b7b5ff] text-foreground font-medium opacity-88"
                                        : "text-muted-foreground hover:bg-hover"
                                )}
                            >
                                <Grid2x2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('expanded')}
                                className={cn(
                                    "flex items-center justify-center w-12 h-full rounded-r px-4 text-sm",
                                    viewMode === 'expanded'
                                        ? "bg-[rgba(0,0,255,0.03)] border border-[#b7b5ff] text-foreground font-medium opacity-88"
                                        : "text-muted-foreground hover:bg-hover"
                                )}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' ? (
                // Overview Tab
                <div className="flex-1 overflow-y-auto p-6">
                    {evaluationMetadata ? (
                        <div className="flex flex-col gap-8">
                            {/* Evaluation Information */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm font-semibold text-foreground">Evaluation Information</h3>
                                <div className="grid grid-cols-[140px_1fr] gap-x-12 gap-y-3 items-baseline">
                                    <span className="text-sm text-[#818EA9]">Evaluation ID</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(evaluationMetadata.id);
                                            setCopiedId(true);
                                            setTimeout(() => setCopiedId(false), 2000);
                                        }}
                                        className="flex items-center gap-1.5 w-fit text-sm text-[#5b6579] leading-5 tracking-[0px] rounded-[4px] hover:bg-hover px-2 py-1 -ml-2 transition-colors"
                                        title="Copy evaluation ID"
                                    >
                                        {evaluationMetadata.id}
                                        {copiedId ? (
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                            <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 7.875C9.21094 7.875 9.375 7.71094 9.375 7.5V2.88281C9.375 2.76562 9.32812 2.67188 9.25781 2.60156L7.89844 1.24219C7.82812 1.17188 7.73438 1.125 7.64062 1.125H4.5C4.28906 1.125 4.125 1.28906 4.125 1.5V7.5C4.125 7.71094 4.28906 7.875 4.5 7.875H9ZM4.5 9C3.67969 9 3 8.32031 3 7.5V1.5C3 0.679688 3.67969 0 4.5 0H7.64062C8.03906 0 8.41406 0.164062 8.69531 0.445312L10.0547 1.80469C10.3359 2.08594 10.5 2.48438 10.5 2.88281V7.5C10.5 8.32031 9.82031 9 9 9H4.5ZM1.5 3H1.875V4.125H1.5C1.28906 4.125 1.125 4.28906 1.125 4.5V10.5C1.125 10.7109 1.28906 10.875 1.5 10.875H6C6.21094 10.875 6.375 10.7109 6.375 10.5V10.125H7.5V10.5C7.5 11.3203 6.82031 12 6 12H1.5C0.679688 12 0 11.3203 0 10.5V4.5C0 3.67969 0.679688 3 1.5 3Z" fill="currentColor"/>
                                            </svg>
                                        )}
                                    </button>

                                    <span className="text-sm text-[#818EA9]">Dataset</span>
                                    <a
                                        href="#"
                                        className="flex items-center gap-1.5 text-sm text-[#613ee0] hover:underline w-fit"
                                    >
                                        {evaluationMetadata.datasetName}
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>

                                    <span className="text-sm text-[#818EA9]">{evaluationMetadata.dateLabel}</span>
                                    <span className="text-sm text-[#19202F] overflow-hidden text-ellipsis">{evaluationMetadata.date}</span>

                                    <span className="text-sm text-[#818EA9]">Tags</span>
                                    <div className="flex flex-wrap gap-1">
                                        {evaluationMetadata.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(0,17,255,0.06)] text-[#613ee0]"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                </div>
                            </div>

                            {/* Additional Metadata */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                                <div className="grid grid-cols-[140px_1fr] gap-x-12 gap-y-3 items-baseline">
                                    <span className="text-sm text-[#818EA9]">Compass workflow ID</span>
                                    <span className="text-sm text-[#19202F] overflow-hidden text-ellipsis">cmp_452c00be03c63967f4ad30751e73f1fc</span>

                                    <span className="text-sm text-[#818EA9]">Model version</span>
                                    <span className="text-sm text-[#19202F] overflow-hidden text-ellipsis">gpt-4o-2025-08-06</span>

                                    <span className="text-sm text-[#818EA9]">Environment</span>
                                    <span className="text-sm text-[#19202F] overflow-hidden text-ellipsis">production</span>

                                    <span className="text-sm text-[#818EA9]">Pipeline run ID</span>
                                    <span className="text-sm text-[#19202F] overflow-hidden text-ellipsis">run_8f3a1b7e924d</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>No evaluation metadata available</p>
                        </div>
                    )}
                </div>
            ) : activeTab === 'metrics' ? (
                // Metrics View
                <div className="flex-1 overflow-y-auto">
                    {(() => {
                        // Get columns that start with "eval_"
                        const evalColumns = columns.filter(col => col.startsWith('eval_'));

                        if (evalColumns.length === 0) {
                            return (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No evaluation metrics found</p>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                {evalColumns.map((column, index) => (
                                    <MetricsChart
                                        key={column}
                                        columnName={column}
                                        data={tableData}
                                        isNumerical={isNumericalColumn(tableData, column)}
                                        index={index}
                                    />
                                ))}
                            </div>
                        );
                    })()}
                </div>
            ) : activeTab === 'data' ? (
                // Data Table View
            <div className="flex-1 flex flex-col pt-1 overflow-hidden">
                {/* Padded container */}
                <div className="flex-1 flex flex-col px-4 pb-4 overflow-hidden min-h-0">
                    <div className="border border-border rounded flex flex-col h-full min-h-0">
                        {paginatedData.length > 0 ? (
                            <>
                                {/* Scrollable table area - both horizontal and vertical */}
                                <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
                                    <div className="inline-block min-w-full">
                                        <table className="border-collapse">
                                            <thead className="sticky top-0 z-10">
                                                <tr className="bg-[#f7faff] border-b border-border">
                                                    {columns.map((column, index) => (
                                                        <th
                                                            key={column}
                                                            className="text-left px-2 h-[36px] text-sm font-normal text-muted-foreground bg-[#f7faff] whitespace-nowrap"
                                                            style={{
                                                                width: index === 0 ? '120px' : '200px',
                                                                minWidth: index === 0 ? '120px' : '200px',
                                                                maxWidth: '320px'
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <span className="overflow-hidden text-ellipsis">
                                                                    {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </span>
                                                                <ArrowUpDown className="w-4 h-4 text-[#afbcd8] shrink-0" />
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className="border-b border-border last:border-b-0" style={{ maxHeight: '100px' }}>
                                                        {columns.map((column, colIndex) => (
                                                            <td
                                                                key={column}
                                                                className="px-2 py-2 text-sm align-top"
                                                                style={{
                                                                    width: colIndex === 0 ? '120px' : '200px',
                                                                    minWidth: colIndex === 0 ? '120px' : '200px',
                                                                    maxWidth: '320px',
                                                                    maxHeight: '100px'
                                                                }}
                                                            >
                                                                <div className="overflow-hidden" style={{
                                                                    maxHeight: '100px',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 4,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    wordBreak: 'break-word'
                                                                }}>
                                                                    {row[column] || ''}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Fixed Pagination */}
                                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-white shrink-0 overflow-hidden">
                        <div className="flex items-center gap-0 min-w-0">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronsLeft className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                        currentPage === page
                                            ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                            : "hover:bg-hover"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                            {totalPages > 7 && (
                                <>
                                    <div className="flex items-center justify-center w-6 h-6 text-sm text-muted-foreground">
                                        ...
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className={cn(
                                            "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                                            currentPage === totalPages
                                                ? "bg-[rgba(0,17,255,0.06)] border border-[rgba(20,0,255,0.41)] opacity-92"
                                                : "hover:bg-hover"
                                        )}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                            <ChevronsRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            ) : (
                // Annotation tasks (placeholder)
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p>Annotation tasks coming soon</p>
                </div>
            )}
        </div>
        {renderModal()}
        </>
    );
};

export type { RightPanelContentProps };
export { RightPanelContent };
