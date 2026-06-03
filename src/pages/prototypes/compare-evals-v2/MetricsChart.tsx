import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { type EvaluationData } from '@/utils/csvLoader';
import { prepareHistogramData, prepareCategoricalData } from './chartHelpers';

// Metrics Chart Component
interface MetricsChartProps {
    columnName: string;
    data: EvaluationData[];
    isNumerical: boolean;
    index: number;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ columnName, data, isNumerical, index }) => {
    const chartData = isNumerical
        ? prepareHistogramData(data, columnName)
        : prepareCategoricalData(data, columnName);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No data available
            </div>
        );
    }

    const displayName = columnName
        .replace(/^eval_/, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const isRightColumn = index % 2 === 1;
    const isFirstRow = index < 2;

    return (
        <div className={cn(
            "bg-white border flex flex-col",
            // Collapse borders horizontally on desktop for adjacent cards
            isRightColumn && "md:-ml-[1px]",
            // Collapse borders vertically
            // On desktop: collapse after first row
            !isFirstRow && "md:-mt-[1px]",
            // On mobile: collapse after first item
            index > 0 && "-mt-[1px] md:mt-0",
            !isFirstRow && "md:-mt-[1px]"
        )}>
            <h3 className="text-sm font-semibold text-foreground px-4 py-3">{displayName}</h3>
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
                            <Bar dataKey="count" fill="#8b7fff" radius={[0, 4, 4, 0]} maxBarSize={40} />
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
                            <Bar dataKey="count" fill="#8b7fff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export type { MetricsChartProps };
export { MetricsChart };
