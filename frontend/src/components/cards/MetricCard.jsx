import React from 'react';

export default function MetricCard({ title, value, unit, icon, alert, isNight, cardBg, textTitle, textValue }) {
    const dynamicCardClass = alert ? (isNight ? 'bg-red-950/70 border-red-500/50' : 'bg-red-100/70 border-red-400') : cardBg;
    return (
        <div className={`p-6 rounded-3xl transition-all duration-500 
            ${dynamicCardClass} ${alert ? 'animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className={`text-sm font-semibold uppercase tracking-wider ${textTitle}`}>
                        {title}
                    </p>

                    <div className="mt-2 flex items-baseline gap-1">
                        <h3 className={`text-3xl md:text-4xl font-black ${alert ? 'text-red-500' : textValue}`}>
                            {value}
                        </h3>

                        <span className={`font-bold ${textTitle}`}>{unit}</span>
                    </div>
                </div>

                <div className={`p-3 rounded-2xl border shadow-sm 
                    ${isNight ? 'bg-slate-800/80 border-slate-600' : 'bg-white/80 border-white'}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}