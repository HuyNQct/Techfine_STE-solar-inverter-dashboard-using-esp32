import React from 'react';

export default function GaugeCard({ title, value, max, isNight, cardBg, textTitle, textValue }) {
    const safeValue = isNaN(value) ? 0 : value;
    const percent = Math.max(0, Math.min(safeValue / max, 1));

    const r = 80;
    const circum = Math.PI * r;
    const dashoffset = circum - percent * circum;

    let color = '#0ea5e9';
    let glowColor = 'rgba(14, 165, 233, 0.5)';
    if (safeValue >= 2500) { color = '#f59e0b'; glowColor = 'rgba(245, 158, 11, 0.6)'; }
    if (safeValue >= 2900) { color = '#ef4444'; glowColor = 'rgba(239, 68, 68, 0.8)'; }

    return (
        <div className={`col-span-1 p-6 rounded-3xl transition-all duration-500 
            ${cardBg} flex flex-col justify-between 
            ${safeValue >= 2900 ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`}
        >
            <p className={`text-sm font-semibold uppercase tracking-wider mb-2 
                ${textTitle}`}
            >
                {title}
            </p>

            <div className="relative flex justify-center items-end h-32 mt-2">
                <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-md">
                    <path d="M 20 100 A 80 80 0 0 1 180 100"
                          fill="none"
                          stroke={isNight ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.4)'}
                          strokeWidth="16"
                          strokeLinecap="round"
                    />

                    <path d="M 20 100 A 80 80 0 0 1 180 100"
                          fill="none"
                          stroke={color}
                          strokeWidth="16"
                          strokeLinecap="round"
                          strokeDasharray={circum} strokeDashoffset={dashoffset}
                          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s", filter: `drop-shadow(0 0 8px ${glowColor})` }}
                    />
                </svg>
                <div className="absolute bottom-2 flex items-baseline gap-1">
                    <h3 className={`text-4xl font-black transition-colors ${
                        safeValue >= 2900 ? 'text-red-500' : textValue}`}
                    >
                        {safeValue}
                    </h3>

                    <span className={`font-bold ${textTitle}`}>
                        W
                    </span>
                </div>
            </div>

            <div className={`mt-4 text-center text-xs font-bold ${textTitle}`}>
                Max: {max}W
            </div>
        </div>
    );
}