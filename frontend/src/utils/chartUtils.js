export function formatXAxis(unixTime, visibleCount) {
    const d = new Date(unixTime);

    if (visibleCount > 120) {
        return d.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function formatTooltip(unixTime) {
    return new Date(unixTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function calculateLineWidth(visibleCount) {
    if (visibleCount > 600)
        return 1;

    if (visibleCount > 150)
        return 2;

    return 3;
}

export function shouldShowDash(visibleCount) {
    return visibleCount <= 150;
}

export function getTooltipStyle(isNight) {
    return {
        backgroundColor: isNight
            ? "rgba(15,23,42,0.85)"
            : "rgba(255,255,255,0.85)",

        backdropFilter: "blur(8px)",

        border: `1px solid ${
            isNight
                ? "#334155"
                : "#e2e8f0"
        }`,

        borderRadius: "12px",

        color: isNight
            ? "#f8fafc"
            : "#0f172a",
    };
}

export function getGridColor(isNight) {
    return isNight
        ? "rgba(148,163,184,0.2)"
        : "rgba(148,163,184,0.4)";
}

export function getAxisColor(isNight) {
    return isNight
        ? "#cbd5e1"
        : "#475569";
}