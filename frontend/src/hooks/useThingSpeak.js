import { useState, useEffect, useRef, useMemo } from 'react';
import { safeNum } from '../utils/safeNum';

export const useThingSpeak = (channelId, timeRangeHours) => {
    const [data, setData] = useState({ batVolt: 0, chargeCur: 0, pvPower: 0, acLoad: 0, temp: 0, gridVolt: 0, atsStatus: 0, batCap: 0 });
    const [chartData, setChartData] = useState([]);
    const [fetchError, setFetchError] = useState(false);
    const [chartLoading, setChartLoading] = useState(true);

    const feedTimeRef = useRef(new Date());
    const maxPoints = timeRangeHours * 60 * 3;

    // Luồng dữ liệu realtime
    // Lấy data mới nhất mỗi 20s để giảm tải băng thông
    useEffect(() => {
        const fetchLive = async () => {
            try
            {
                const res = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?results=1`);
                const json = await res.json();
                if (!json.feeds || json.feeds.length === 0) return;

                const latest = json.feeds[0];
                feedTimeRef.current = new Date(latest.created_at || new Date());
                setFetchError(false);

                setData({
                    batVolt:   safeNum(latest.field1, 1),
                    chargeCur: safeNum(latest.field2, 1),
                    pvPower:   safeNum(latest.field3, 0),
                    acLoad:    safeNum(latest.field4, 0),
                    temp:      safeNum(latest.field5, 1),
                    gridVolt:  safeNum(latest.field6, 1),
                    batCap:    safeNum(latest.field7, 0),
                    atsStatus: safeNum(latest.field8, 0),
                });

                // Chỉ đẩy thêm data vào biểu đồ nếu Timestamp thực sự mới
                setChartData(prev => {
                    if (prev.length === 0) return prev;

                    const newTime = feedTimeRef.current.getTime();

                    if (prev[prev.length - 1].time === newTime) return prev;

                    const newPoint = {
                        time: newTime,
                        load: safeNum(latest.field4, 0),
                        pv: safeNum(latest.field3, 0) };

                    return [...prev, newPoint].slice(-maxPoints); // trượt cửa sổ
                });
            }
            catch (err)
            {
                setFetchError(true);
            }
        };

        fetchLive();
        const interval = setInterval(fetchLive, 20000);
        return () => clearInterval(interval);
    }, [maxPoints, channelId]);

    // Luồng nạp lịch sử khi thay đổi khung giờ (1H, 3H, 6H)
    useEffect(() => {
        let isMounted = true; // Chống lỗi Memory Leak khi Component Unmount giữa chừng lúc đang fetch API
        const fetchHistory = async () => {
            setChartLoading(true);
            try
            {
                const res = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?results=${maxPoints}`);
                const json = await res.json();
                if (!isMounted) return;
                if (json.feeds)
                {
                    const points = json.feeds.map(f => ({
                        time: new Date(f.created_at || new Date()).getTime(),
                        load: safeNum(f.field4, 0),
                        pv:   safeNum(f.field3, 0),
                    }));

                    setChartData(points);
                    setVisibleCount(points.length);
                }
            }
            catch (err)
            {
                console.error("Lỗi tải lịch sử");
            }
            finally
            {
                if (isMounted) setChartLoading(false);
            }
        };

        fetchHistory();
        return () => { isMounted = false; };
    }, [timeRangeHours, maxPoints, channelId]);

    const peakLoad = useMemo(() => chartData.reduce((max, d) => Math.max(max, d.load), 0), [chartData]);
    const peakPv = useMemo(() => chartData.reduce((max, d) => Math.max(max, d.pv), 0), [chartData]);

    return { data, chartData, fetchError, chartLoading, peakLoad, peakPv, feedTimeRef, maxPoints };
};