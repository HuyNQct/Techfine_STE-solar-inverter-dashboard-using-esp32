import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Sun, TrendingUp, Clock } from 'lucide-react';
import { useChartZoom } from '../hooks/useChartZoom';
import {
    formatXAxis,
    formatTooltip,
    calculateLineWidth,
    shouldShowDash,
    getTooltipStyle,
    getGridColor,
    getAxisColor,
} from "../utils/chartUtils";

export default function ChartPanel({
   chartData,
   chartLoading,
   timeRangeHours,
   setTimeRangeHours,
   peakLoad,
   peakPv,
   isNight,
   theme,
   maxPoints
}) {
    const { pinchRef, visibleCount, isPinching } = useChartZoom(maxPoints);
    const lineWidth = calculateLineWidth(visibleCount);
    const showDash = shouldShowDash(visibleCount);
    const { cardBg, textTitle, textValue } = theme;

    return (
        <div className={`col-span-1 md:col-span-2 xl:col-span-3 p-4 md:p-6 rounded-3xl 
                        border transition-colors duration-1000 ${cardBg}`} ref={pinchRef}>
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">

                <div>
                    <h3 className={`font-bold text-base md:text-lg tracking-wider mb-2 ${textValue}`}>
                        LỊCH SỬ PV & TẢI
                    </h3>

                    <div className={`flex items-center gap-4 text-xs font-semibold ${textTitle}`}>
                        <span className="flex items-center gap-1 bg-sky-500/10 px-2 py-1 rounded-lg">
                          <TrendingUp size={14} className="text-sky-500" />
                          Đỉnh tải:
                            <span className={`font-black text-sm ${textValue}`}>
                                {peakLoad}W
                            </span>
                        </span>

                        <span className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                          <TrendingUp size={14} className="text-amber-500" />
                          Đỉnh PV:
                            <span className={`font-black text-sm ${textValue}`}>
                                {peakPv}W
                            </span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Clock size={16} className={textTitle} />

                    <div className={`flex items-center p-1 rounded-xl border ${
                        isNight ? 'bg-slate-950/50 border-slate-700' : 'bg-white/50 border-white'}`}
                    >
                        {[1, 3, 6, 12].map(h => (
                            <button
                                key={h}
                                onClick={() => setTimeRangeHours(h)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                                    timeRangeHours === h
                                        ? 'bg-sky-500 text-white shadow-md'
                                        : `${textTitle} hover:bg-slate-200/50 dark:hover:bg-slate-800/50`
                                }`}
                            >
                                {h}H
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-72 md:h-96 w-full cursor-ew-resize relative">
                {chartLoading && chartData.length > 0 && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center
                                    bg-white/30 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl">
                        <Sun size={32} className="text-amber-500 animate-spin" />
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData.slice(-visibleCount)}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={getGridColor(isNight)}
                            vertical={false}
                        />

                        <XAxis
                            dataKey="time"
                            stroke={getAxisColor(isNight)}
                            tick={{ fontSize: 11 }}
                            dy={10}
                            minTickGap={40}
                            tickFormatter={(t)=>formatXAxis(t,visibleCount)}
                        />

                        <YAxis
                            width={50}
                            stroke={getAxisColor(isNight)}
                            tick={{ fontSize: 11 }}
                            dx={-5}
                            tickFormatter={v => `${v}W`}
                            domain={[0, 'dataMax + 500']}
                        />

                        {!isPinching && (
                            <Tooltip
                                labelFormatter={formatTooltip}
                                contentStyle={getTooltipStyle(isNight)}
                                itemStyle={{fontWeight:"bold"}}
                                wrapperStyle={{
                                    pointerEvents:"none"
                                }}
                            />
                        )}

                        <Legend verticalAlign="top" height={28} />

                        <Line
                            isAnimationActive={false}
                            type="monotone"
                            name="Tải tiêu thụ (W)"
                            dataKey="load"
                            stroke="#0ea5e9"
                            strokeWidth={lineWidth}
                            dot={visibleCount <= 30 ? { r: 3 } : false}
                            activeDot={
                                !isPinching
                                    ? { r: 6,
                                        fill: '#0ea5e9',
                                        stroke: isNight ? '#0f172a' : '#fff',
                                        strokeWidth: 2 }
                                    : false}
                        />

                        <Line
                            isAnimationActive={false}
                            type="monotone"
                            name="Điện mặt trời (W)"
                            dataKey="pv"
                            stroke="#f59e0b"
                            strokeWidth={lineWidth}
                            dot={visibleCount <= 30 ? { r: 3 } : false}
                            strokeDasharray={showDash ? "5 5" : ""}
                            activeDot={
                                !isPinching
                                    ? { r: 6,
                                        fill: '#f59e0b',
                                        stroke: isNight ? '#0f172a' : '#fff',
                                        strokeWidth: 2 }
                                    : false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}