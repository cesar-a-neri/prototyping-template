import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { type EvaluationData } from '@/utils/csvLoader';
import { isNumericalColumn, prepareHistogramData, prepareCategoricalData } from './chartHelpers';

// Group Metrics Chart Component - for visualizing multiple evaluations together
interface GroupMetricsChartProps {
    columnName: string;
    evaluationsData: Map<string, EvaluationData[]>;
    evaluationNames: string[];
    evaluationColors: string[];
    index: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

const GroupMetricsChart: React.FC<GroupMetricsChartProps> = ({
    columnName,
    evaluationsData,
    evaluationNames,
    evaluationColors,
    index,
    onEdit,
    onDelete
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const displayName = columnName
        .replace(/^eval_/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const isRightColumn = index % 2 === 1;
    const isFirstRow = index < 2;

    // Filter to only evaluations that have this column
    const evaluationsWithColumn = evaluationNames.filter(evalName => {
        const data = evaluationsData.get(evalName) || [];
        return data.length > 0 && data[0][columnName] !== undefined;
    });

    // If no evaluations have this column, show empty state
    if (evaluationsWithColumn.length === 0) {
        return (
            <div
                className={cn(
                    "bg-white border flex flex-col",
                    isRightColumn && "md:-ml-[1px]",
                    index > 0 && "-mt-[1px] md:mt-0",
                    !isFirstRow && "md:-mt-[1px]"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
                    {(onEdit || onDelete) && (
                        <div className={cn(
                            "flex items-center gap-1 transition-opacity",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}>
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Edit graph"
                                >
                                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Delete graph"
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="border-t border-border" />
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                </div>
            </div>
        );
    }

    // Get corresponding colors for evaluations that have this column
    const filteredColors = evaluationsWithColumn.map(evalName => {
        const idx = evaluationNames.indexOf(evalName);
        return evaluationColors[idx];
    });

    // Check if the column is numerical by checking the first evaluation's data that has this column
    const firstEvalData = evaluationsData.get(evaluationsWithColumn[0]) || [];
    const isNumerical = firstEvalData.length > 0 && isNumericalColumn(firstEvalData, columnName);

    // Prepare combined data
    let chartData: any[] = [];

    if (isNumerical) {
        // For numerical data, create histogram data for each evaluation that has this column
        const allHistograms = new Map<string, any[]>();
        evaluationsWithColumn.forEach(evalName => {
            const data = evaluationsData.get(evalName) || [];
            allHistograms.set(evalName, prepareHistogramData(data, columnName));
        });

        // Combine all histogram ranges
        const allRanges = new Set<string>();
        allHistograms.forEach(histogram => {
            histogram.forEach(bin => allRanges.add(bin.range));
        });

        // Create combined data structure
        const sortedRanges = Array.from(allRanges).sort((a, b) => {
            const aNum = parseFloat(a.split('-')[0]);
            const bNum = parseFloat(b.split('-')[0]);
            return aNum - bNum;
        });

        chartData = sortedRanges.map(range => {
            const dataPoint: any = { range };
            evaluationsWithColumn.forEach(evalName => {
                const histogram = allHistograms.get(evalName) || [];
                const bin = histogram.find(b => b.range === range);
                dataPoint[evalName] = bin ? bin.count : 0;
            });
            return dataPoint;
        });
    } else {
        // For categorical data, aggregate counts across evaluations that have this column
        const allCategories = new Set<string>();
        const categoryCounts = new Map<string, Map<string, number>>();

        evaluationsWithColumn.forEach(evalName => {
            const data = evaluationsData.get(evalName) || [];
            const catData = prepareCategoricalData(data, columnName);
            catData.forEach(({ category, count }) => {
                allCategories.add(category);
                if (!categoryCounts.has(category)) {
                    categoryCounts.set(category, new Map());
                }
                categoryCounts.get(category)!.set(evalName, count);
            });
        });

        // Create combined data structure
        chartData = Array.from(allCategories).map(category => {
            const dataPoint: any = { category };
            evaluationsWithColumn.forEach(evalName => {
                const counts = categoryCounts.get(category);
                dataPoint[evalName] = counts?.get(evalName) || 0;
            });
            return dataPoint;
        }).sort((a, b) => {
            // Sort by total count
            const aTotal = evaluationsWithColumn.reduce((sum, name) => sum + (a[name] || 0), 0);
            const bTotal = evaluationsWithColumn.reduce((sum, name) => sum + (b[name] || 0), 0);
            return bTotal - aTotal;
        });
    }

    if (chartData.length === 0) {
        return (
            <div
                className={cn(
                    "bg-white border flex flex-col",
                    isRightColumn && "md:-ml-[1px]",
                    index > 0 && "-mt-[1px] md:mt-0",
                    !isFirstRow && "md:-mt-[1px]"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
                    {(onEdit || onDelete) && (
                        <div className={cn(
                            "flex items-center gap-1 transition-opacity",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}>
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Edit graph"
                                >
                                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                    title="Delete graph"
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="border-t border-border" />
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                </div>
            </div>
        );
    }

    // Extract solid colors from gradients for evaluations that have this column
    const solidColors = filteredColors.map(gradient => {
        // Extract the first color from the gradient
        const match = gradient.match(/#[0-9a-f]{6}/i);
        return match ? match[0] : '#8b7fff';
    });

    return (
        <div
            className={cn(
                "bg-white border flex flex-col",
                isRightColumn && "md:-ml-[1px]",
                index > 0 && "-mt-[1px] md:mt-0",
                !isFirstRow && "md:-mt-[1px]"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">{displayName}</h3>
                {(onEdit || onDelete) && (
                    <div className={cn(
                        "flex items-center gap-1 transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}>
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="p-1 hover:bg-hover rounded transition-colors"
                                title="Edit graph"
                            >
                                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-1 hover:bg-hover rounded transition-colors"
                                title="Delete graph"
                            >
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="border-t border-border" />

            <div className="h-[240px] px-4 py-4">
                <ResponsiveContainer width="100%" height="100%">
                    {isNumerical ? (
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis
                                type="category"
                                dataKey="range"
                                tick={{ fontSize: 10 }}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            {evaluationsWithColumn.map((evalName, idx) => (
                                <Bar
                                    key={evalName}
                                    dataKey={evalName}
                                    fill={solidColors[idx]}
                                    radius={[0, 4, 4, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    ) : (
                        <BarChart data={chartData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                type="category"
                                dataKey="category"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis type="number" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            {evaluationsWithColumn.map((evalName, idx) => (
                                <Bar
                                    key={evalName}
                                    dataKey={evalName}
                                    fill={solidColors[idx]}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export type { GroupMetricsChartProps };
export { GroupMetricsChart };
