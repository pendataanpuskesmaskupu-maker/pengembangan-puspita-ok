import React from 'react';

type Point = { x: number; y: number };
type StandardLine = {
    label: string;
    color: string;
    data: Point[];
};
type StandardsData = StandardLine[];
type ChartType = 'wfa' | 'hfa' | 'wfh';

interface ChartProps {
    title: string;
    participantData: Point[];
    standardsData: StandardsData;
    yAxisLabel: string;
    xAxisLabel: string;
    maxX: number;
    maxY: number;
    chartType: ChartType; // New prop to determine legend type
}

const getDescriptiveLegend = (chartType: ChartType) => {
    const wfaLegend = [
        { label: 'Berat Badan Lebih (>+1SD)', color: '#fb923c' }, // Orange for risk
        { label: 'Normal (-2SD s/d +1SD)', color: '#16a34a' }, // Green
        { label: 'Berat Badan Kurang (<-2SD)', color: '#f87171' }, // Red
        { label: 'Berat Badan Sangat Kurang (<-3SD)', color: '#dc2626' }, // Darker Red
    ];
    const hfaLegend = [
        { label: 'Tinggi (>+3SD)', color: '#22c55e' },
        { label: 'Normal (-2SD s/d +3SD)', color: '#16a34a' },
        { label: 'Pendek (stunted) (<-2SD)', color: '#fb923c' },
        { label: 'Sangat Pendek (severely stunted) (<-3SD)', color: '#f87171' },
    ];
    const wfhLegend = [
        { label: 'Obesitas (>+3SD)', color: '#dc2626' },
        { label: 'Gizi Lebih (overweight) (>+2SD)', color: '#f87171' },
        { label: 'Berisiko Gizi Lebih (>+1SD)', color: '#fb923c' },
        { label: 'Gizi Baik (normal) (-2SD s/d +1SD)', color: '#16a34a' },
        { label: 'Gizi Kurang (wasted) (<-2SD)', color: '#fb923c' },
        { label: 'Gizi Buruk (severely wasted) (<-3SD)', color: '#f87171' },
    ];

    switch(chartType) {
        case 'wfa': return wfaLegend;
        case 'hfa': return hfaLegend;
        case 'wfh': return wfhLegend;
        default: return [];
    }
};


export const Chart: React.FC<ChartProps> = ({ title, participantData, standardsData, yAxisLabel, xAxisLabel, maxX, maxY, chartType }) => {
    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = (x: number) => (x / maxX) * innerWidth;
    const yScale = (y: number) => innerHeight - (y / maxY) * innerHeight;

    const createPath = (data: Point[]) => {
        if (data.length === 0) return '';
        const line = data
            .map((p, i) => {
                const command = i === 0 ? 'M' : 'L';
                return `${command} ${xScale(p.x)} ${yScale(p.y)}`;
            })
            .join(' ');
        return line;
    };
    
    // Y-axis ticks
    const yTicks = Array.from({ length: 11 }, (_, i) => Math.round((maxY / 10) * i));
    
    // X-axis ticks
    const xTickInterval = maxX > 60 ? 10 : 6;
    const xTicks = Array.from({ length: Math.floor(maxX / xTickInterval) + 1 }, (_, i) => i * xTickInterval);
    
    const legendItems = getDescriptiveLegend(chartType);

    // Create area paths between standard deviation lines
    const createAreaPath = (line1: StandardLine, line2: StandardLine) => {
        const path1 = line1.data.map(p => ({ x: xScale(p.x), y: yScale(p.y) }));
        const path2 = [...line2.data].reverse().map(p => ({ x: xScale(p.x), y: yScale(p.y) }));
        const combined = [...path1, ...path2];
        if (combined.length === 0) return '';
        return `M ${combined[0].x} ${combined[0].y} ` + combined.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
    };

    const areaFills = [
        { color: '#fee2e2', path: createAreaPath(standardsData[0], standardsData[1]) }, // +3 to +2
        { color: '#fef3c7', path: createAreaPath(standardsData[1], standardsData[2]) }, // +2 to 0
        { color: '#dcfce7', path: createAreaPath(standardsData[2], standardsData[3]) }, // 0 to -2
        { color: '#fef3c7', path: createAreaPath(standardsData[3], standardsData[4]) }, // -2 to -3
        { color: '#fee2e2', path: createAreaPath(standardsData[4], { data: standardsData[4].data.map(p => ({x: p.x, y: 0})) } as StandardLine) }, // below -3
    ];


    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 text-center mb-4">{title}</h4>
            <div className="flex flex-col md:flex-row gap-4">
                <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        {/* Background Color Zones */}
                        {areaFills.map((area, i) => (
                           <path key={i} d={area.path} fill={area.color} />
                        ))}

                        {/* Axes and Grid Lines */}
                        <g className="text-gray-400">
                            {/* Y-axis */}
                            <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="currentColor" />
                            {yTicks.map(tick => (
                                <g key={`y-tick-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
                                    <line x1={-5} y1={0} x2={innerWidth} y2={0} stroke="currentColor" strokeDasharray="2,2" strokeOpacity={0.5} />
                                    <text x={-10} dy=".32em" textAnchor="end" className="text-xs fill-current">{tick}</text>
                                </g>
                            ))}
                             <text
                                transform={`translate(-40, ${innerHeight / 2}) rotate(-90)`}
                                textAnchor="middle"
                                className="text-sm fill-current font-medium"
                            >
                                {yAxisLabel}
                            </text>
                        </g>
                        <g className="text-gray-400">
                            {/* X-axis */}
                            <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="currentColor" />
                             {xTicks.map(tick => (
                                <g key={`x-tick-${tick}`} transform={`translate(${xScale(tick)}, ${innerHeight})`}>
                                    <line y1={5} y2={-innerHeight} stroke="currentColor" strokeDasharray="2,2" strokeOpacity={0.5}/>
                                    <text y={20} textAnchor="middle" className="text-xs fill-current">{tick}</text>
                                </g>
                            ))}
                             <text
                                x={innerWidth / 2}
                                y={innerHeight + 40}
                                textAnchor="middle"
                                className="text-sm fill-current font-medium"
                            >
                                {xAxisLabel}
                            </text>
                        </g>
                        
                        {/* Participant data */}
                        <path d={createPath(participantData)} fill="none" stroke="#1d4ed8" strokeWidth={3} />
                        {participantData.map((p, i) => (
                            <circle key={i} cx={xScale(p.x)} cy={yScale(p.y)} r="4" fill="#1d4ed8" className="cursor-pointer">
                                <title>{`${xAxisLabel}: ${p.x.toFixed(1)}, ${yAxisLabel}: ${p.y}`}</title>
                            </circle>
                        ))}
                    </g>
                </svg>
                 <div className="flex-shrink-0 w-full md:w-56 bg-gray-50 p-3 rounded-lg border">
                    <h5 className="font-semibold text-gray-700 mb-2">Legenda Status Gizi</h5>
                    <div className="space-y-2">
                        <div key="anak" className="flex items-center">
                            <div className="w-4 h-1 rounded-full mr-2" style={{ backgroundColor: '#1d4ed8' }}></div>
                            <span className="text-xs text-gray-600 font-bold">Data Anak</span>
                        </div>
                        <hr className="my-2"/>
                        {legendItems.map(item => (
                            <div key={item.label} className="flex items-center">
                                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-gray-600">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};