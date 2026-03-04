import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { type EvaluationData } from '@/utils/csvLoader';
import { isNumericalColumn, prepareHistogramData, prepareCategoricalData } from './chartHelpers';

// Custom Metric Chart Component
interface CustomMetricChartProps {
    metric: {
        id: string;
        name: string;
        columnMappings: Map<string, string>;
    };
    evaluationsData: Map<string, EvaluationData[]>;
    evaluationNames: string[];
    evaluationColors: string[];
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}

const CustomMetricChart: React.FC<CustomMetricChartProps> = ({
    metric,
    evaluationsData,
    evaluationNames,
    evaluationColors,
    index,
    onEdit,
    onDelete
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const isRightColumn = index % 2 === 1;
    const isFirstRow = index < 2;

    // Get evaluations that have data for their mapped columns
    const evaluationsWithData = Array.from(metric.columnMappings.entries())
        .filter(([evalName, columnName]) => {
            const data = evaluationsData.get(evalName) || [];
            return data.length > 0 && data[0][columnName] !== undefined;
        });

    if (evaluationsWithData.length === 0) {
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
                    <h3 className="text-sm font-semibold text-foreground">{metric.name}</h3>
                    <div className={cn(
                        "flex items-center gap-1 transition-opacity",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}>
                        <button
                            onClick={onEdit}
                            className="p-1 hover:bg-hover rounded transition-colors"
                            title="Edit metric"
                        >
                            <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1 hover:bg-hover rounded transition-colors"
                            title="Delete metric"
                        >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                        </button>
                    </div>
                </div>
                <div className="border-t border-border" />
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                </div>
            </div>
        );
    }

    // Determine if data is numerical based on first evaluation's data
    const [firstEvalName, firstColumnName] = evaluationsWithData[0];
    const firstData = evaluationsData.get(firstEvalName) || [];
    const isNumerical = isNumericalColumn(firstData, firstColumnName);

    // Extract solid colors from gradients
    const solidColors = evaluationsWithData.map(([evalName]) => {
        const idx = evaluationNames.indexOf(evalName);
        const gradient = evaluationColors[idx % evaluationColors.length];
        const match = gradient.match(/#[0-9a-f]{6}/i);
        return match ? match[0] : '#8b7fff';
    });

    // Prepare combined data
    let chartData: any[] = [];

    if (isNumerical) {
        // Histogram data
        const allHistograms = new Map<string, any[]>();
        evaluationsWithData.forEach(([evalName, columnName]) => {
            const data = evaluationsData.get(evalName) || [];
            allHistograms.set(evalName, prepareHistogramData(data, columnName));
        });

        // Get all unique ranges
        const allRanges = new Set<string>();
        allHistograms.forEach(histogram => {
            histogram.forEach(bin => allRanges.add(bin.range));
        });

        const sortedRanges = Array.from(allRanges).sort((a, b) => {
            const aNum = parseFloat(a.split('-')[0]);
            const bNum = parseFloat(b.split('-')[0]);
            return aNum - bNum;
        });

        chartData = sortedRanges.map(range => {
            const dataPoint: any = { range };
            evaluationsWithData.forEach(([evalName]) => {
                const histogram = allHistograms.get(evalName) || [];
                const bin = histogram.find(b => b.range === range);
                dataPoint[evalName] = bin ? bin.count : 0;
            });
            return dataPoint;
        });
    } else {
        // Categorical data
        const allCategories = new Set<string>();
        const categoryCounts = new Map<string, Map<string, number>>();

        evaluationsWithData.forEach(([evalName, columnName]) => {
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

        chartData = Array.from(allCategories).map(category => {
            const dataPoint: any = { category };
            evaluationsWithData.forEach(([evalName]) => {
                const counts = categoryCounts.get(category);
                dataPoint[evalName] = counts?.get(evalName) || 0;
            });
            return dataPoint;
        }).sort((a, b) => {
            const aTotal = evaluationsWithData.reduce((sum, [evalName]) => sum + (a[evalName] || 0), 0);
            const bTotal = evaluationsWithData.reduce((sum, [evalName]) => sum + (b[evalName] || 0), 0);
            return bTotal - aTotal;
        });
    }

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
                <h3 className="text-sm font-semibold text-foreground">{metric.name}</h3>
                <div className={cn(
                    "flex items-center gap-1 transition-opacity",
                    isHovered ? "opacity-100" : "opacity-0"
                )}>
                    <button
                        onClick={onEdit}
                        className="p-1 hover:bg-hover rounded transition-colors"
                        title="Edit metric"
                    >
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1 hover:bg-hover rounded transition-colors"
                        title="Delete metric"
                    >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                    </button>
                </div>
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
                            {evaluationsWithData.map(([evalName], idx) => (
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
                            {evaluationsWithData.map(([evalName], idx) => (
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

export type { CustomMetricChartProps };
export { CustomMetricChart };
