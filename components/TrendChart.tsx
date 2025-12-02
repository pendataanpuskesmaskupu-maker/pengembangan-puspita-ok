import React from 'react';

type TrendDataPoint = { month: string; count: number };

interface TrendChartProps {
    title: string;
    data: TrendDataPoint[];
    lineColor: string;
    labelY: string;
    yMaxOverride?: number;
    yAxisLabelSuffix?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ title, data, lineColor, labelY, yMaxOverride, yAxisLabelSuffix }) => {
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 40, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (data.length === 0) {
        return (
            <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-lg font-bold text-gray-800 text-center mb-2">{title}</h4>
                <div className="flex items-center justify-center h-48 text-gray-500">
                    <p>Data tidak cukup untuk menampilkan grafik.</p>
                </div>
            </div>
        )
    }

    const maxCount = Math.max(...data.map(d => d.count), 0);
    const yMax = yMaxOverride ?? (maxCount > 0 ? Math.max(5, Math.ceil((maxCount * 1.2) / 5) * 5) : 5);

    const xScale = (index: number) => (index / (data.length - 1)) * innerWidth;
    const yScale = (y: number) => innerHeight - (y / yMax) * innerHeight;

    const createPath = (points: TrendDataPoint[]) => {
        if (points.length < 2) return '';
        return points
            .map((p, i) => {
                const command = i === 0 ? 'M' : 'L';
                return `${command} ${xScale(i)} ${yScale(p.count)}`;
            })
            .join(' ');
    };

    const yTicks = Array.from({ length: 6 }, (_, i) => Math.round((yMax / 5) * i));
    
    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'short' });
    };

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-lg font-bold text-gray-800 text-center mb-4">{title}</h4>
            <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Axes and Grid Lines */}
                    <g className="text-gray-400">
                        {/* Y-axis */}
                        <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="currentColor" />
                        {yTicks.map(tick => (
                            <g key={`y-tick-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
                                <line x1={-5} y1={0} x2={innerWidth} y2={0} stroke="currentColor" strokeDasharray="2,2" strokeOpacity={0.5} />
                                <text x={-10} dy=".32em" textAnchor="end" className="text-xs fill-current">{tick}{yAxisLabelSuffix || ''}</text>
                            </g>
                        ))}
                         <text transform={`translate(-35, ${innerHeight / 2}) rotate(-90)`} textAnchor="middle" className="text-sm fill-current font-medium">
                            {labelY}
                        </text>
                    </g>
                    <g className="text-gray-500">
                        {/* X-axis */}
                        <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="currentColor" />
                         {data.map((d, i) => (
                            <g key={`x-tick-${i}`} transform={`translate(${xScale(i)}, ${innerHeight})`}>
                                <text y={20} textAnchor="middle" className="text-xs fill-current">{formatMonth(d.month)}</text>
                            </g>
                        ))}
                    </g>
                    
                    {/* Line Path */}
                    <path d={createPath(data)} fill="none" stroke={lineColor} strokeWidth={3} strokeLinecap="round" />

                    {/* Data Points */}
                    {data.map((p, i) => (
                        <circle key={i} cx={xScale(i)} cy={yScale(p.count)} r="5" fill={lineColor} className="cursor-pointer">
                            <title>{`Bulan: ${formatMonth(p.month)}\nJumlah: ${p.count.toFixed(1)}${yAxisLabelSuffix || ''}`}</title>
                        </circle>
                    ))}
                </g>
            </svg>
        </div>
    );
};