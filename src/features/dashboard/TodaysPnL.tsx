'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatCurrency, formatPercentage, cn, safeParseFloat } from '@/utils';
import { BinanceAccountInfo, DailyPnlData } from '@/types';

interface TodaysPnLProps {
  accountInfo: BinanceAccountInfo;
  dailyPnl: DailyPnlData[];
}

export function TodaysPnL({ accountInfo, dailyPnl }: TodaysPnLProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Find today's P&L from the daily data
  const todaysPnlData = dailyPnl.find(day => day.date === today);
  const todaysPnlAmount = todaysPnlData?.pnl || 0;
  
  // Calculate portfolio values for display
  const totalBalance = safeParseFloat(accountInfo.totalWalletBalance);
  const portfolioValueStartOfDay = totalBalance - todaysPnlAmount;
  
  // Use percentage P&L if available, otherwise fallback to calculation
  const todaysPercentagePnl = (todaysPnlData as any)?.percentagePnl !== undefined 
    ? (todaysPnlData as any).percentagePnl 
    : (() => {
        // Fallback calculation for backward compatibility
        return portfolioValueStartOfDay > 0 ? (todaysPnlAmount / portfolioValueStartOfDay) * 100 : 0;
      })();

  const isPositive = todaysPnlAmount >= 0;
  const isPercentagePositive = todaysPercentagePnl >= 0;

  return (
    <Card>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Today's Performance
          </h3>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Today's P&L Amount */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={cn(
              "p-2 sm:p-3 rounded-lg flex-shrink-0",
              isPositive 
                ? "bg-green-100 dark:bg-green-900/20" 
                : "bg-red-100 dark:bg-red-900/20"
            )}>
              {isPositive ? (
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Today's P&L
              </p>
              <p className={cn(
                "text-lg sm:text-2xl font-bold truncate",
                isPositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {isPositive ? '+' : ''}{formatCurrency(todaysPnlAmount)}
              </p>
            </div>
          </div>

          {/* Today's P&L Percentage */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={cn(
              "p-2 sm:p-3 rounded-lg flex-shrink-0",
              isPercentagePositive 
                ? "bg-green-100 dark:bg-green-900/20" 
                : "bg-red-100 dark:bg-red-900/20"
            )}>
              <Percent className={cn(
                "h-5 w-5 sm:h-6 sm:w-6",
                isPercentagePositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Today's Return (Sum of Trade %s)
              </p>
              <p className={cn(
                "text-lg sm:text-2xl font-bold truncate",
                isPercentagePositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {isPercentagePositive ? '+' : ''}{todaysPercentagePnl.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Additional Context */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 sm:space-y-1">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">
                Portfolio Value Start of Day
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(portfolioValueStartOfDay)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">
                Current Portfolio Value
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(totalBalance)}
              </span>
            </div>
            {(todaysPnlData as any)?.tradeCount && (
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-0">
                  Trades Today
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {(todaysPnlData as any).tradeCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
