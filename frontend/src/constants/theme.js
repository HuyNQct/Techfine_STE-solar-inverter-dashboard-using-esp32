export const getTheme = (isNight) => ({
    bgOverlay: isNight ? 'bg-slate-950/85 backdrop-blur-md text-slate-100' : 'bg-white/30 backdrop-blur-sm text-slate-800',
    cardBg: isNight ? 'bg-slate-900/60 border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-xl' : 'bg-white/60 border-white shadow-[0_8px_30px_rgb(255,255,255,0.3)] backdrop-blur-xl',
    textTitle: isNight ? 'text-slate-300' : 'text-slate-600',
    textValue: isNight ? 'text-white' : 'text-slate-900'
});