import { useState, useEffect, useRef, useCallback } from 'react';

export const useChartZoom = (maxPoints) => {
    const ZOOM_MIN = 10;
    const [visibleCount, setVisibleCount] = useState(60);
    const [isPinching, setIsPinching] = useState(false);

    const pinchRef = useRef(null);
    const lastDist = useRef(null);

    const getPinchDist = (touches) => Math.sqrt(
        Math.pow(touches[0].clientX - touches[1].clientX, 2) +
        Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );

    const handleTouchStart = useCallback((e) => {
        if (e.touches.length >= 2) {
            setIsPinching(true);
            lastDist.current = getPinchDist(e.touches);
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (e.touches.length !== 2 || lastDist.current === null) return;
        e.preventDefault();
        const dist = getPinchDist(e.touches);
        const delta = dist - lastDist.current;
        lastDist.current = dist;

        if (Math.abs(delta) >= 15) {
            setVisibleCount(v => {
                const step = Math.max(5, Math.floor(v * 0.1));
                return delta > 0 ? Math.max(ZOOM_MIN, v - step) : Math.min(maxPoints, v + step);
            });
        }
    }, [maxPoints]);

    const handleTouchEnd = useCallback((e) => {
        if (e.touches.length < 2) {
            setIsPinching(false);
            lastDist.current = null;
        }
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        setVisibleCount(v => {
            const step = Math.max(5, Math.floor(v * 0.15));
            return e.deltaY < 0 ? Math.max(ZOOM_MIN, v - step) : Math.min(maxPoints, v + step);
        });
    }, [maxPoints]);

    useEffect(() => {
        const el = pinchRef.current;
        if (!el) return;
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove',  handleTouchMove,  { passive: false });
        el.addEventListener('touchend',   handleTouchEnd,   { passive: true });
        el.addEventListener('wheel',      handleWheel,      { passive: false });
        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove',  handleTouchMove);
            el.removeEventListener('touchend',   handleTouchEnd);
            el.removeEventListener('wheel',      handleWheel);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

    return { pinchRef, visibleCount, isPinching, setVisibleCount };
};