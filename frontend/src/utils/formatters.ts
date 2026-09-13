/**
 * Formatting helpers for mining metrics, percentages, and currencies.
 */

export const formatTonnes = (tonnes: number): string => {
  return new Intl.NumberFormat('en-IN').format(Math.round(tonnes)) + ' t';
};

export const formatPercentage = (val: number): string => {
  return `${val.toFixed(1)}%`;
};

export const formatGrade = (mnPct: number): string => {
  return `${mnPct.toFixed(1)}% Mn`;
};

export const getRiskColor = (tier: string): string => {
  switch (tier) {
    case 'CRITICAL':
      return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
    case 'HIGH':
      return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'MEDIUM':
      return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    default:
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
  }
};
