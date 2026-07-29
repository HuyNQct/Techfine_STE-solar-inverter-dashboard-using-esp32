import React from 'react';
import { AlertTriangle, Power, Zap } from "lucide-react";

export default function StatusCard({ atsStatus, isOffline, isGridLost, theme }) {
    const { cardBg, textTitle } = theme;

    return (
        <div
            className={`col-span-1 md:col-span-2 xl:col-span-4
            p-6 md:p-8 rounded-3xl border transition-all duration-700
            flex flex-col md:flex-row items-center justify-between
            ${
                atsStatus === 1
                    ? "bg-red-950/70 border-red-500/50"
                    : cardBg
            }`}
        >
            <div className="flex items-center gap-6">
                <div
                    className={`p-5 rounded-full ${
                        atsStatus
                            ? "bg-red-500/20 text-red-500"
                            : "bg-emerald-500/20 text-emerald-500"
                    }`}
                >
                    {atsStatus ? <Power size={40}/> : <Zap size={40}/>}
                </div>

                <div>

                    <p className={textTitle}>
                        Hệ thống đang chạy nguồn
                    </p>

                    <h2
                        className={`text-4xl font-black ${
                            atsStatus
                                ? "text-red-500"
                                : "text-emerald-500"
                        }`}
                    >
                        {isOffline
                            ? atsStatus
                                ? "LƯỚI (FAIL-SAFE)"
                                : "SOLAR (FAIL-SAFE)"
                            : atsStatus
                                ? "ĐIỆN LƯỚI (GRID)"
                                : "NĂNG LƯỢNG MẶT TRỜI"}
                    </h2>
                </div>
            </div>

            {isGridLost && !isOffline && (
                <div className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full text-white">
                    <AlertTriangle size={20}/>
                    <span>MẤT ĐIỆN LƯỚI</span>
                </div>

            )}
        </div>
    );

}