import { Sun, Moon, WifiOff } from "lucide-react";

export default function Header({
   isNight,
   fetchError,
   lastUpdate,
   isOffline
}) {
    return (
        <header className="mb-8 text-center relative">
            <div className="flex items-center justify-center gap-3">
                <h1
                    className={`text-3xl md:text-5xl font-black tracking-widest drop-shadow-lg transition-colors duration-1000 ${
                        isNight ? "text-white" : "text-slate-900"
                    }`}
                >
                    SOLAR COMMAND
                </h1>

                {isNight
                    ? (
                        <Moon
                            size={36}
                            className="text-sky-400 animate-pulse drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                        />)
                    : (
                        <Sun
                            size={36}
                            className="text-amber-500 animate-[spin_10s_linear_infinite] drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                        />)
                }
            </div>

            {fetchError
                ? (
                    <p className="text-red-500 mt-2 font-medium animate-pulse bg-red-100/80 inline-block px-4 py-1 rounded-full">
                        ⚠️ Không thể kết nối ThingSpeak — đang thử lại...
                    </p>)
                : (
                    <p
                        className={`mt-2 font-medium ${
                            isNight ? "text-slate-400" : "text-slate-700"
                        }`}
                    >
                        Cập nhật:
                        <span className="text-sky-500 font-bold">
                            {" "}
                            {lastUpdate || "Đang tải..."}
                        </span>
                    </p>)
            }

            {isOffline && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 flex items-center gap-2 bg-red-600 px-6 py-2
                                rounded-full text-white animate-pulse shadow-xl shadow-red-500/50 z-10">
                    <WifiOff size={20}/>
                    <span className="font-bold text-sm tracking-widest">
                        ESP32 MẤT KẾT NỐI! KÍCH HOẠT FAIL-SAFE
                    </span>
                </div>
            )}
        </header>
    );
}