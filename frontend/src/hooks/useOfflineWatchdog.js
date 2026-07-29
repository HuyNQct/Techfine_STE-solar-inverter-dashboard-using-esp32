import { useState, useEffect } from 'react';

export const useOfflineWatchdog = (feedTimeRef) => {
    const [isOffline, setIsOffline] = useState(false);
    const [lastUpdate, setLastUpdate] = useState('');

    useEffect(() => {
        const ticker = setInterval(() => {
            const ageInSeconds = (new Date().getTime() - feedTimeRef.current.getTime()) / 1000;
            setIsOffline(ageInSeconds > 60);
            setLastUpdate(ageInSeconds < 60 ? `${Math.floor(ageInSeconds)}s trước` : `${Math.floor(ageInSeconds / 60)}m trước`);
        }, 1000);
        return () => clearInterval(ticker);
    }, [feedTimeRef]);

    return { isOffline, lastUpdate };
};