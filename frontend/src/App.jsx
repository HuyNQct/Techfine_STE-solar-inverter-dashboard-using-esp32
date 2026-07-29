import React, { useState } from 'react';
import { useThingSpeak } from './hooks/useThingSpeak';
import { useOfflineWatchdog } from './hooks/useOfflineWatchdog';
import { getTheme } from './constants/theme';

// Import Components
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import GaugeCard from './components/cards/GaugeCard';
import MetricCard from './components/cards/MetricCard';
import BatteryCard from './components/cards/BatteryCard';
import ChartPanel from './components/ChartPanel';

// Icons
import { Sun, Zap, Activity, Thermometer } from 'lucide-react';

export default function App() {
  const channelId = import.meta.env.VITE_CHANNEL_ID;
  const MAX_LOAD_W = Number(import.meta.env.VITE_MAX_LOAD_W) || 5000;
  const hasATS = import.meta.env.VITE_HAS_ATS === 'true';

  if (!channelId || channelId === 'nhap_channel_id_cua_ban_vao_day') {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white font-mono">
          {}
        </div>
    );
  }

  // Khởi tạo các Hook
  const [timeRangeHours, setTimeRangeHours] = useState(1);
  const { data, chartData, fetchError, chartLoading, peakLoad, peakPv, feedTimeRef, maxPoints } = useThingSpeak(channelId, timeRangeHours);
  const { isOffline, lastUpdate } = useOfflineWatchdog(feedTimeRef);

  // Tính toán trạng thái UI chung
  const isGridLost = data.gridVolt < 50;
  const isNight = data.pvPower < 10;
  const theme = getTheme(isNight);

  return (
      <div className={`min-h-screen transition-all duration-1000 ${theme.bgOverlay}`}>
        <div className="p-4 md:p-8">

          <Header
              isNight={isNight}
              fetchError={fetchError}
              lastUpdate={lastUpdate}
              isOffline={isOffline}
          />

          <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 
               ${isOffline ? 'mt-12 opacity-80 grayscale' : 'mt-4'}`}
          >

            {hasATS && (
                <StatusCard
                    atsStatus={data.atsStatus}
                    isOffline={isOffline}
                    isGridLost={isGridLost}
                    isNight={isNight}
                    theme={theme}
                />
            )}

            <GaugeCard title="Công Suất Tải (AC)"
                       value={data.acLoad}
                       max={MAX_LOAD_W}
                       isNight={isNight} {...theme} />

            <MetricCard title="Điện Mặt Trời (PV)"
                        value={data.pvPower}
                        unit="W"
                        icon={<Sun size={32} className="text-amber-500" />}
                        isNight={isNight} {...theme} />

            <MetricCard title="Dòng Sạc"
                        value={data.chargeCur}
                        unit="A"
                        icon={<Zap size={32} className="text-emerald-500" />}
                        isNight={isNight} {...theme} />

            <MetricCard title="Điện Áp Lưới"
                        value={data.gridVolt}
                        unit="V"
                        icon={<Activity
                            size={32}
                            className={isGridLost ? 'text-red-500' : 'text-sky-500'} />}
                        alert={isGridLost && !isOffline}
                        isNight={isNight} {...theme} />

            <MetricCard title="Nhiệt Độ Inverter"
                        value={data.temp}
                        unit="°C"
                        icon={<Thermometer size={32} className={data.temp > 60 ? 'text-red-500' : 'text-orange-500'} />}
                        alert={data.temp > 60 && !isOffline}
                        isNight={isNight} {...theme} />

            <BatteryCard volt={data.batVolt} cap={data.batCap} isNight={isNight} {...theme} />

            <ChartPanel
                chartData={chartData}
                chartLoading={chartLoading}
                peakLoad={peakLoad}
                peakPv={peakPv}
                timeRangeHours={timeRangeHours}
                setTimeRangeHours={setTimeRangeHours}
                maxPoints={maxPoints}
                isNight={isNight}
                theme={theme}
            />

          </div>
        </div>
      </div>
  );
}