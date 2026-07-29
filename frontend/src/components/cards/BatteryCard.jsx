import React from 'react';

export default function BatteryCard({ volt, cap, isNight, cardBg, textTitle }) {
    let colorClass = 'from-red-600 to-red-500';
    let textColor = 'text-red-500';
    if (cap >= 20) { colorClass = 'from-amber-500 to-yellow-400'; textColor = 'text-amber-500'; }
    if (cap >= 60) { colorClass = 'from-emerald-500 to-green-400'; textColor = 'text-emerald-500'; }

    return (
        <div className={`col-span-1 p-6 rounded-3xl transition-all duration-500 ${cardBg}`}>
            <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${textTitle}`}>
                Dung Lượng Pin
            </p>

            <div className="flex flex-col justify-between flex-1 gap-4">
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className={`text-4xl font-black ${
                        isNight 
                            ? 'text-white' 
                            : 'text-slate-900'}`}
                    >
                        {volt}
                    </h3>

                    <span className={`font-bold text-lg ${textTitle}`}>
                        V
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`text-2xl font-black ${textColor}`}>
                        {cap}%
                    </span>

                    <div className="flex items-center">
                        <div className={`w-16 h-8 border-[3px] rounded-md p-[2px] relative shadow-inner ${
                            isNight 
                                ? 'border-slate-600 bg-slate-800' 
                                : 'border-slate-300 bg-slate-100'}`}
                        >
                            <div className={`h-full rounded-sm bg-gradient-to-r ${colorClass}`}
                                 style={{ width: `${cap}%`,
                                     transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                        </div>

                        <div className={`w-1.5 h-3 rounded-r-sm ${
                            isNight 
                                ? 'bg-slate-600' 
                                : 'bg-slate-300'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}