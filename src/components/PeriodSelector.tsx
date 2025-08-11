'use client';

import React from 'react';
import { cn } from '@/utils';

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

const periods: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export function PeriodSelector({ selectedPeriod, onPeriodChange, className }: PeriodSelectorProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            selectedPeriod === period.value
              ? "bg-blue-600 text-white"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

export function filterDataByPeriod<T extends { date: string }>(data: T[], period: TimePeriod): T[] {
  if (period === 'all') {
    return data;
  }

  const now = new Date();
  const cutoffDate = new Date();

  switch (period) {
    case '7d':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return data;
  }

  return data.filter(item => new Date(item.date) >= cutoffDate);
}
