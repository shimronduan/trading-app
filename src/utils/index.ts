import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  minimumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits: Math.max(minimumFractionDigits, 8),
  }).format(amount);
}

/**
 * Formats a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

/**
 * Formats large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (Math.abs(num) < 1000) {
    return num.toFixed(2);
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(Math.abs(num)) / 3);
  const shortValue = num / Math.pow(1000, suffixNum);
  
  return shortValue.toFixed(1) + suffixes[suffixNum];
}

/**
 * Safely converts string to number, handling null/undefined values
 */
export function safeParseFloat(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates percentage change between two values
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Get color class based on PnL value
 */
export function getPnlColor(value: number): string {
  if (value > 0) return 'text-green-600 dark:text-green-400';
  if (value < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}

/**
 * Get background color class based on PnL value
 */
export function getPnlBgColor(value: number): string {
  if (value > 0) return 'bg-green-50 dark:bg-green-900/20';
  if (value < 0) return 'bg-red-50 dark:bg-red-900/20';
  return 'bg-gray-50 dark:bg-gray-900/20';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Validate if string is a valid number
 */
export function isValidNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}

/**
 * Format position size with appropriate decimal places
 */
export function formatPositionSize(size: number): string {
  if (size === 0) return '0';
  if (Math.abs(size) < 0.001) return size.toFixed(8);
  if (Math.abs(size) < 1) return size.toFixed(4);
  return size.toFixed(2);
}

/**
 * Calculate win rate from trading stats
 */
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return (wins / total) * 100;
}

/**
 * Generate random color for charts
 */
export function generateChartColor(index: number): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
  ];
  return colors[index % colors.length];
}

/**
 * Sort array by multiple criteria
 */
export function multiSort<T>(
  array: T[],
  ...sortFunctions: Array<(a: T, b: T) => number>
): T[] {
  return array.sort((a, b) => {
    for (const sortFn of sortFunctions) {
      const result = sortFn(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}
