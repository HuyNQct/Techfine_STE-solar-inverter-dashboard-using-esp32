export const safeNum = (val, decimals = 0) => {
    if (val === null || val === undefined || val === '') return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : Number(parsed.toFixed(decimals));
};